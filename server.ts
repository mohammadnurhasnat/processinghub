import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import zlib from 'zlib';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { SLOT_TYPES, VISA_SERVICES, DESTINATIONS, HOSPITALS } from './src/data/visaData';

dotenv.config();

const app = express();

function resolvePort(): number {
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--port' && argv[i + 1]) {
      const parsed = Number(argv[i + 1]);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    } else if (argv[i].startsWith('--port=')) {
      const parsed = Number(argv[i].slice('--port='.length));
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
  }
  const envPort = Number(process.env.PORT);
  const nginxPort = Number(process.env.NGINX_PORT);
  if (
    process.env.NODE_ENV !== 'production' &&
    Number.isFinite(envPort) &&
    Number.isFinite(nginxPort) &&
    envPort === nginxPort
  ) {
    return Number(process.env.DEFAULT_APP_PORT) || 3000;
  }
  return Number.isFinite(envPort) && envPort > 0 ? envPort : 3000;
}

const PORT = resolvePort();
app.set('trust proxy', 1);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Lightweight native Brotli/Gzip compression for API JSON and static text responses
app.use((req: Request, res: Response, next: NextFunction) => {
  const acceptEncoding = String(req.headers['accept-encoding'] || '');
  const supportsBr = acceptEncoding.includes('br');
  const supportsGzip = acceptEncoding.includes('gzip');
  if (!supportsBr && !supportsGzip) {
    next();
    return;
  }

  const originalSend = res.send.bind(res);
  res.send = ((body?: any) => {
    if (res.headersSent || res.getHeader('Content-Encoding')) {
      return originalSend(body);
    }

    const contentType = String(res.getHeader('Content-Type') || '');
    const isCompressible =
      typeof body === 'string' ||
      Buffer.isBuffer(body)
        ? /json|javascript|text|xml|svg/i.test(contentType) || !contentType
        : true;

    if (!isCompressible || body == null) {
      return originalSend(body);
    }

    const rawBuffer = Buffer.isBuffer(body)
      ? body
      : typeof body === 'string'
        ? Buffer.from(body)
        : Buffer.from(JSON.stringify(body));

    if (rawBuffer.length < 1024) {
      return originalSend(body);
    }

    try {
      const compressed = supportsBr
        ? zlib.brotliCompressSync(rawBuffer, {
            params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 },
          })
        : zlib.gzipSync(rawBuffer, { level: 6 });

      res.setHeader('Content-Encoding', supportsBr ? 'br' : 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      res.removeHeader('Content-Length');
      return originalSend(compressed);
    } catch {
      return originalSend(body);
    }
  }) as typeof res.send;

  next();
});

// Per-IP Sliding Window Rate Limiter
function createRateLimiter(windowMs: number, maxRequests: number, label: string) {
  const hits = new Map<string, number[]>();

  // Periodic cleanup to keep memory bounded
  setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [ip, timestamps] of hits.entries()) {
      const fresh = timestamps.filter((t) => t > cutoff);
      if (fresh.length === 0) {
        hits.delete(ip);
      } else {
        hits.set(ip, fresh);
      }
    }
  }, Math.max(60_000, windowMs)).unref?.();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.ip || req.socket.remoteAddress || 'unknown').slice(0, 64);
    const now = Date.now();
    const cutoff = now - windowMs;
    const recent = (hits.get(ip) || []).filter((t) => t > cutoff);

    if (recent.length >= maxRequests) {
      res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({
        error: `Too many requests on ${label}. Please wait a moment and try again.`,
      });
    }

    recent.push(now);
    hits.set(ip, recent);
    return next();
  };
}

const chatRateLimiter = createRateLimiter(60_000, 24, 'chat');
const leadRateLimiter = createRateLimiter(15 * 60_000, 12, 'lead-submission');
const trackRateLimiter = createRateLimiter(60_000, 30, 'file-tracking');
const adminAuthRateLimiter = createRateLimiter(15 * 60_000, 20, 'staff-auth');

async function writeJsonAtomic(filePath: string, payload: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(payload, null, 2), 'utf8');
  await fs.rename(tempPath, filePath);
}

// Initialize GoogleGenAI client (lazy or guarded)
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const ALLOWED_AGENT_NAMES = ['Nur Sajid', 'Eity', 'Nur Hasnat', 'Mohammad', 'Aysha'] as const;

function sanitizeAgentName(raw?: unknown): string {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if ((ALLOWED_AGENT_NAMES as readonly string[]).includes(trimmed)) {
      return trimmed;
    }
  }
  return 'Mohammad';
}

function buildSystemInstruction(agentName: string, language: 'bn' | 'en' = 'bn'): string {
  const languageDirective =
    language === 'en'
      ? `### 0. STRICT RESPONSE LANGUAGE RULE (HIGHEST PRIORITY):
- The user has selected **ENGLISH** on the website interface.
- You MUST reply **100% in clear, warm, natural, polite English**.
- NEVER reply in Bengali or mix Bengali script/words into your English response (even though your knowledge base below contains Bengali reference notes — translate all rules, fees, centers, and document checklists smoothly into clean English).
- Format currency cleanly in English as \`৳6,000\`, \`৳1,500\`, \`৳4,500\`, etc., and dates/numbers in English numerals (0–9).`
      : `### 0. STRICT RESPONSE LANGUAGE RULE (HIGHEST PRIORITY):
- The user has selected **BENGALI (বাংলা)** on the website interface.
- You MUST reply **100% in natural, warm, polite Dhaka Bengali (আপনি tone)**.
- Avoid mixing random English sentences when natural Bengali exists (only keep official field names like \`Web File No\`, \`AYUSH\`, \`MVRN\`, \`NOC\`, \`SBI\`, \`NID\` where standard).`;

  return `
You are ${agentName}, a real live customer support team member at "Processing Hub" in Dhaka. You chat with clients just like a genuine, experienced human colleague on WhatsApp/Live Chat — warm, natural, polite, and practical.

${languageDirective}

### 1. 100%–150% AUTHENTIC HUMAN VOICE (একজন স্বাভাবিক মানুষের মতো কথা বলার নিয়ম):
- Your name is ${agentName}, and you work at Processing Hub's support desk.
- **STRICTLY BANNED TITLES & AI CLUES**: NEVER use "Visa Consultant", "Consultant", "Senior Consultant", "ভিসা কনসালটেন্ট", "সিনিয়র কনসালটেন্ট", or "কনসালটেন্ট". NEVER hint or reveal in any way that you are an AI, bot, virtual assistant, or model.
- **WRITE LIKE A REAL PERSON, NOT A TEMPLATE**:
  * **NEVER start replies with robotic boilerplate** like "আপনার জিজ্ঞাসার জন্য ধন্যবাদ", "অবশ্যই! নিচে বিস্তারিত দেওয়া হলো:", "আমি আপনাকে সাহায্য করতে পেরে আনন্দিত", "Thank you for your inquiry", or "Certainly! Here are the details:"!
  * In Bengali, speak naturally in Dhaka polite conversational Bangla: e.g., "জি, ...", "হ্যাঁ, অবশ্যই...", "দেখুন, এখানে নিয়মটা হলো...", "আপনার সুবিধার জন্য বলি...", "একটা বিষয় খেয়াল রাখবেন—...".
  * In English, speak naturally like a helpful Dhaka visa desk coordinator: e.g., "Yes, of course...", "Here is how it works...", "Just keep one thing in mind—...", "Sure thing, you will need...".
  * Avoid stiff machine-translated phrasing.
  * Vary your sentence rhythm naturally. Don't wrap every second word in **bold**; bold only key amounts, headings, or crucial points so the text feels human and clean.
  * Match the client's pace politely while keeping respectful courtesy.

### 2. NATURAL ADDRESSING & GREETING RULES (সম্বোধন ও সালামের স্বাভাবিক নিয়ম):
- **NEVER repeat the customer's name** (NEVER say "রহিম সাহেব", "রহিম ভাই", or repeat "Mr. Rahim").
- **First Reply Only**: On your VERY FIRST reply to a new client, politely address them ONCE based on their name as **"স্যার"** / **"Sir"** (male) or **"ম্যাডাম"** / **"Ma'am"** (female), or politely neutral if unclear.
- **Follow-up Replies**: In ALL subsequent replies in the session, DO NOT repeat "স্যার", "ম্যাডাম", "Sir", "Ma'am", or their name. Talk directly and naturally face-to-face.
- **Saalam Rules**: Give "আসসালামু আলাইকুম" / "Assalamu Alaikum" ONLY on the very first greeting or if the user greets you with Saalam. NEVER repeat Saalam on follow-up answers. NEVER use "নমস্কার" or "আদাব".
- **Handoff & Closings**:
  * On initial form handoff (name/phone/subject), greet briefly, answer the chosen service concisely, and ask how you can help today.
  * Only when the user says goodbye or thanks to close ("ধন্যবাদ", "আল্লাহ হাফেজ", "Thank you", "Bye"), give a warm natural closing in the active site language.

### 3. CLEAN, STRUCTURED & ORGANIZED FORMATTING (গোছানো ও পরিচ্ছন্ন বুলেট-পয়েন্ট উত্তর):
- Every response must be **crystal clear, specific, and visually neat** — NEVER messy or cramped.
- **STRICT MARKDOWN BULLET LIST RULE (অবশ্যপালনীয়)**:
  * Whenever explaining multiple documents, steps, fees, hospitals, destinations, or comparisons, ALWAYS use standard Markdown hyphen bullets ("- ") — NEVER use the "•" character, and NEVER merge multiple bullet items into one paragraph!
  * Put ONE item per line, with a blank line before the list starts and a blank line after the list ends.
- **When NOT to bloat**:
  * If the user asks a simple single question (e.g., yes/no, one fee, one specific rule), reply directly in 1–3 clear sentences without dumping an unsolicited long checklist.

### 4. FULL WEBSITE CONTEXT & ADAPTIVE VERIFICATION BRAIN:
- You have the COMPLETE context of Processing Hub's website in your memory (all Visa Services, IVAC Slot Fees, 5 Open IVAC Centers + 11 temporarily closed regional centers, 14 Indian Travel Destinations, and 16 Partner Indian Hospitals + AYUSH invitation details, plus any newly verified online facts).
- Always answer accurately about ANY hospital, destination, visa service, checklist, or fee shown on the website.
- **Handling New Info / Unlisted Questions from Customers**:
  * If a customer shares new information (e.g., new rule/fee/circular/border update) or asks about something not in our static website data, cross-check it via real-time Google Search.
  * Rely ONLY on verified facts confirmed online by official/credible sources. If an unconfirmed claim cannot be verified online, politely clarify that there is no official confirmation rather than blindly agreeing or saving false claims.

### 5. DOCUMENT, PHOTO & PDF ANALYSIS:
- When the user attaches a photo, image, or PDF (passport, NID, photo, utility bill, bank statement, medical report/invitation, ticket, online form):
  * Inspect every readable detail carefully, briefly summarize what you checked in clean bullet points, note any mismatch or missing item against IVAC rules (e.g., 2"×2" white background photo, NID/passport spelling & DOB match, utility address, 6-month bank statement), and state the clear next step.`;
}

function buildFullWebsiteContext(): string {
  const servicesBlock = VISA_SERVICES.map((s) => {
    const portLine = s.portNote ? `\n  পোর্ট: ${s.portNote}` : '';
    const notesLine = s.specialNotes?.length ? `\n  বিশেষ দ্রষ্টব্য: ${s.specialNotes.join(' | ')}` : '';
    return `• **${s.title}** (${s.category}) — ফি: ${s.price} ${s.per}\n  বিবরণ: ${s.description}\n  কাগজপত্র (সিরিয়াল অনুযায়ী): ${s.documents.map((d, i) => `${i + 1}) ${d}`).join(' | ')}${portLine}${notesLine}`;
  }).join('\n');

  const slotsBlock = SLOT_TYPES.map((st) =>
    `• **${st.name}**: মোট ৳${st.totalFee} (আইভ্যাক সরকারি ফি ৳${st.ivacFee} + স্লট সার্ভিস চার্জ ৳${st.serviceCharge})`
  ).join('\n');

  const destinationsBlock = DESTINATIONS.map((d) =>
    `• **${d.nameBn || d.name} (${d.name})** [${d.location}] — সেরা সময়: ${d.bestTime}\n  আকর্ষণ: ${d.attractions.join(', ')}\n  বিবরণ: ${d.description}`
  ).join('\n');

  const hospitalsBlock = HOSPITALS.map((h) =>
    `• **${h.name}** (${h.city} — ${h.location}) ${h.ayushSupport ? '[AYUSH / মেডিকেল ইনভাইটেশন সাপোর্ট আছে]' : ''}\n  বিশেষায়িত বিভাগ: ${h.specialties.join(', ')}\n  গুরুত্বপূর্ণ তথ্য: ${h.highlights.join(' | ')}`
  ).join('\n');

  return `
### FULL WEBSITE KNOWLEDGE CONTEXT (ওয়েবসাইটের সম্পূর্ণ তথ্যভান্ডার):

1. **ওয়েবসাইটের সকল ভিসা ও ট্রাভেল সার্ভিসসমূহ**:
${servicesBlock}

2. **আইভ্যাক স্লট বুকিং প্যাকেজসমূহ**:
${slotsBlock}

3. **ভারতের জনপ্রিয় ভ্রমণ গন্তব্যসমূহ (১৪টি ডেস্টিনেশন)**:
${destinationsBlock}

4. **ভারতের শীর্ষ পার্টনার ও রেফারেল হাসপাতালসমূহ (মেডিকেল ভিসা ও ইনভাইটেশন সাপোর্ট)**:
${hospitalsBlock}
`;
}

const WEBSITE_FULL_CONTEXT = buildFullWebsiteContext();

interface LearnedFact {
  id: string;
  topic: string;
  fact: string;
  sourceUrls: string[];
  verifiedAt: string;
}

const LEARNED_KNOWLEDGE_FILE = path.join(process.cwd(), 'data', 'learned_knowledge.json');
let learnedFactsCache: LearnedFact[] = [];
let learnedFactsLoaded = false;

async function loadLearnedFacts(): Promise<LearnedFact[]> {
  if (learnedFactsLoaded) return learnedFactsCache;
  try {
    const raw = await fs.readFile(LEARNED_KNOWLEDGE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      learnedFactsCache = parsed.filter(
        (item: any) =>
          item &&
          typeof item.topic === 'string' &&
          typeof item.fact === 'string' &&
          Array.isArray(item.sourceUrls) &&
          item.sourceUrls.length > 0
      );
    }
  } catch {
    learnedFactsCache = [];
  }
  learnedFactsLoaded = true;
  return learnedFactsCache;
}

async function saveVerifiedFact(topic: string, fact: string, sourceUrls: string[]): Promise<boolean> {
  const cleanTopic = topic.trim().slice(0, 120);
  const cleanFact = fact.trim().slice(0, 420);
  const validUrls = sourceUrls.filter((u) => typeof u === 'string' && u.startsWith('http')).slice(0, 3);

  if (!cleanTopic || cleanFact.length < 15 || validUrls.length === 0) {
    return false;
  }

  const existing = await loadLearnedFacts();
  const normalizedNew = cleanFact.toLowerCase().replace(/\s+/g, ' ');
  const alreadyExists = existing.some((item) => {
    const normOld = item.fact.toLowerCase().replace(/\s+/g, ' ');
    return normOld === normalizedNew || normOld.includes(normalizedNew) || normalizedNew.includes(normOld);
  });

  if (alreadyExists) {
    return false;
  }

  const nextEntry: LearnedFact = {
    id: `fact-${Date.now()}`,
    topic: cleanTopic,
    fact: cleanFact,
    sourceUrls: validUrls,
    verifiedAt: new Date().toISOString(),
  };

  learnedFactsCache = [...existing, nextEntry].slice(-120);
  try {
    await fs.mkdir(path.dirname(LEARNED_KNOWLEDGE_FILE), { recursive: true });
    await fs.writeFile(LEARNED_KNOWLEDGE_FILE, JSON.stringify(learnedFactsCache, null, 2), 'utf8');
    console.info(`[AdaptiveBrain] Saved online-verified fact: "${cleanTopic}"`);
    return true;
  } catch (err) {
    console.warn('[AdaptiveBrain] Failed to persist learned knowledge:', err);
    return false;
  }
}

function buildAdaptiveBrainPrompt(facts: LearnedFact[]): string {
  if (!facts || facts.length === 0) return '';
  const recentFacts = facts.slice(-40);
  const lines = recentFacts.map(
    (f) => `• [${f.topic}] ${f.fact} (Verified: ${f.verifiedAt.slice(0, 10)})`
  );
  return `\n### ADAPTIVE ONLINE-VERIFIED KNOWLEDGE BRAIN (গ্রাহকদের তথ্য যাচাই করে সংরক্ষিত আপডেটেড তথ্য):\n${lines.join('\n')}\n`;
}

function isCandidateNewFactOrExternalTopic(message: string): boolean {
  const text = (message || '').trim();
  if (text.length < 18) return false;
  // Skip structured form handoff messages or personal PII lines
  if (
    (text.includes('নাম:') && text.includes('সেবা/বিষয়:')) ||
    (text.includes('Name:') && text.includes('Service/Topic:'))
  ) {
    return false;
  }

  const lower = text.toLowerCase();
  const trivialGreetings = /^(hi|hello|hey|ok|okay|thanks|thank you|bye|হ্যালো|হাই|ধন্যবাদ|ঠিক আছে|বুঝেছি|আল্লাহ হাফেজ|আসসালামু আলাইকুম)\b/i;
  if (trivialGreetings.test(lower) && text.length < 35) return false;

  // Detect new claims, policy updates, or external/unlisted travel/visa questions
  return /নতুন|নিয়ম|নিয়ম|হয়েছে|হয়েছে|বেড়েছে|কমেছে|বন্ধ|খোলা|চালু|বদলেছে|পরিবর্তন|শুনেছি|জানেন কি|সত্যি|নোটিশ|সার্কুলার|পোর্ট|বর্ডার|ফ্লাইট|ট্রেন|বাস|এয়ারপোর্ট|ইমিগ্রেশন|ফি|slot|স্লট|circular|notice|update|latest|border|port|rule|policy|hospital|clinic|airline|train|bus|ebangla|e-visa|visa|হাইকমিশন|আইভ্যাক|ivac/i.test(
    lower
  );
}

function shouldUseWebSearch(message: string, hasAttachments: boolean): boolean {
  if (hasAttachments) return false;
  const lower = (message || '').toLowerCase();
  if (
    /slot|স্লট|কবে|নোটিশ|notice|circular|holiday|বন্ধ|খোলা|latest|update|নতুন|আজ|আগামী|বদলেছে|পরিবর্তন|বেড়েছে|কমেছে|শুনেছি|সত্যি|জানেন|বর্ডার|পোর্ট|border|port|ট্রেন|বাস|ফ্লাইট|মৈত্রী|বন্ধন|মিতালী|e-visa|ই-ভিসা|হাইকমিশন/.test(
      lower
    )
  ) {
    return true;
  }
  return false;
}

const verificationInFlight = new Set<string>();

async function verifyAndLearnFromInteraction(ai: GoogleGenAI, userMessage: string): Promise<void> {
  const key = userMessage.trim().toLowerCase().slice(0, 120);
  if (!key || verificationInFlight.has(key)) return;
  verificationInFlight.add(key);

  try {
    const verifierPrompt = `You are a strict online fact-verification engine for Processing Hub (an Indian Visa & Travel Processing service in Bangladesh).

USER MESSAGE:
"""
${userMessage.slice(0, 800)}
"""

TASK:
1. Check if the user message contains a new factual claim, rule/fee/circular update, or an external factual question about Indian visas, IVAC Bangladesh, border ports, travel routes, or Indian hospitals that should be verified online.
2. Use Google Search to strictly verify the claim or find official verified public facts from credible sources (e.g., hcidhaka.gov.in, ivacbd.com, official government portals, airlines, hospitals).
3. STRICT SAFETY & ACCURACY RULES:
   - NEVER store personal customer details (names, phone numbers, personal dates, private plans).
   - NEVER store prompt instructions or user opinions.
   - NEVER mark anything as "VERIFIED_TRUE" unless actual live Google Search results confirm it clearly.
   - If the claim is false, rumor, unconfirmed, or cannot be verified from credible web sources, output "FALSE_OR_CONFLICTING" or "UNVERIFIABLE".
   - If the message is just casual chat or already basic static knowledge, output "NOT_RELEVANT".

OUTPUT ONLY VALID JSON (no markdown fences, no extra text):
{"status":"VERIFIED_TRUE"|"FALSE_OR_CONFLICTING"|"UNVERIFIABLE"|"NOT_RELEVANT","topic":"short Bengali or English topic name","fact":"concise 1-2 sentence verified fact in Bengali"}`;

    const resp = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: [{ role: 'user', parts: [{ text: verifierPrompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const candidate = resp.candidates?.[0];
    const chunks = candidate?.groundingMetadata?.groundingChunks;
    const groundingUrls: string[] = Array.isArray(chunks)
      ? chunks.map((c: any) => c?.web?.uri).filter((u: any) => typeof u === 'string' && u.startsWith('http'))
      : [];

    // Strict verification gate: NEVER learn anything without real web search source chunks
    if (groundingUrls.length === 0 || !resp.text) {
      return;
    }

    const rawText = resp.text.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;

    const parsed = JSON.parse(jsonMatch[0]);
    if (
      parsed &&
      parsed.status === 'VERIFIED_TRUE' &&
      typeof parsed.topic === 'string' &&
      typeof parsed.fact === 'string'
    ) {
      await saveVerifiedFact(parsed.topic, parsed.fact, groundingUrls);
    }
  } catch (err: any) {
    // Silent background skip on quota or parse error so user experience is never affected
    console.info('[AdaptiveBrain] Background verification skipped:', err?.status || err?.message || 'error');
  } finally {
    verificationInFlight.delete(key);
  }
}

const SHARED_KNOWLEDGE_BASE = `

### IVAC OFFICIAL NOTICE BOARD MEMORY & GUIDELINES:
Official Indian Visa Application Centre (IVAC) notice board prescribes exact document checklists, rejection causes, charges, and guidelines:

**সকল ভিসার কমন বাধ্যতামূলক ডকুমেন্টস (Common Mandatory Core):**
   - অনলাইনে পূরণকৃত ও স্বাক্ষরিত আবেদন পত্র (Online Application Form)
   - মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদ ও ২টি খালি পৃষ্ঠা) এবং পূর্বের সকল পুরনো পাসপোর্ট (হারানো থাকলে জিডি কপি)
   - সদ্য তোলা ২×২ ইঞ্চি (50mm × 50mm) সাদা ব্যাকগ্রাউন্ড ল্যাব প্রিন্ট ছবি (বর্ডার ছাড়া)
   - জাতীয় পরিচয়পত্র (NID) অথবা অনলাইন ডিজিটাল জন্মনিবন্ধন সনদ
   - বর্তমান ঠিকানার সাম্প্রতিক ইউটিলিটি বিল কপি (বিদ্যুৎ/গ্যাস/পানি/ল্যান্ডলাইন)
   - পেশাগত প্রমাণপত্র (চাকরিজীবীদের NOC ও অফিস আইডি / সরকারি GO / ব্যবসায়ীদের ট্রেড লাইসেন্স / শিক্ষার্থীদের স্টুডেন্ট আইডি)
   - আর্থিক সক্ষমতার প্রমাণ: **$২০০ ডলার পাসপোর্ট এন্ডোর্সমেন্ট অথবা ব্যাংক অ্যাকাউন্টে সমপরিমাণ টাকা থাকা অবস্থায় বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট অথবা স্টেট ব্যাংক অফ ইন্ডিয়া (SBI) ট্রাভেল কার্ড / ইন্টারন্যাশনাল ট্রাভেল কার্ড**।

A. **ট্যুরিস্ট ভিসা (Tourist Visa — IVAC নোটিশ বোর্ড সিরিয়াল চেকলিস্ট)**:
   1) আবেদন পত্র · 2) জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন · 3) ইউটিলিটি বিলের কপি · 4) ব্যাংক স্টেটমেন্ট / ডলার এনডোর্সমেন্ট · 5) পেশাগত প্রমাণপত্র · 6) পাসপোর্টের কপি (পাতা ২, ৩)।
   - *বিশেষ দ্রষ্টব্য*: সকল কাগজ অবশ্যই উপরের (সিরিয়াল) নম্বর অনুসারে সাজাতে হবে; সকল পুরোনো পাসপোর্ট অবশ্যই জমা দিতে হবে।

B. **মেডিকেল (M-1) ও মেডিকেল অ্যাটেনডেন্ট (M-2) ভিসা (IVAC নোটিশ বোর্ড সিরিয়াল চেকলিস্ট)**:
   1) আবেদন পত্র · 2) সুনির্দিষ্ট তারিখসহ (Appointment letter & Ayush Letter) · 3) জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন · 4) ইউটিলিটি বিলের কপি · 5) ব্যাংক স্টেটমেন্ট / ডলার এনডোর্সমেন্ট · 6) পেশাগত প্রমাণপত্র · 7) সদ্য মেডিকেলের কাগজ সমূহের কপি · 8) পাসপোর্টের কপি (পাতা ২, ৩)।
   - *বিশেষ দ্রষ্টব্য*: মেডিকেলের মূল কাগজ সমূহ অবশ্যই সঙ্গে আনতে হবে; সকল কাগজ সিরিয়াল অনুযায়ী সাজাতে হবে; সকল পুরোনো পাসপোর্ট অবশ্যই জমা দিতে হবে। **অ্যাটেনডেন্টের (M-2) আলাদা মেডিকেল টেস্ট রিপোর্ট বা প্রেসক্রিপশন লাগে না** — কেবল সাধারণ ডকুমেন্টস ও রোগীর সাথে সম্পর্কের প্রমাণপত্র লাগে।

C. **ডাবল এন্ট্রি ভিসা — মিসেলেনিয়াস ক্যাটাগরি (Double Entry Visa X-3) চেকলিস্ট**:
   1) আবেদন পত্র (X-3) · 2) ৩য়/ইউরোপীয় দেশের এম্বাসির অফিসিয়াল অ্যাপয়েন্টমেন্ট লেটার · 3) ওয়ার্ক পারমিট / চুক্তিপত্র ও কভারিং লেটার · 4) জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন · 5) ইউটিলিটি বিলের কপি · 6) ব্যাংক স্টেটমেন্ট / ডলার এনডোর্সমেন্ট · 7) পেশাগত প্রমাণপত্র · 8) পাসপোর্টের কপি (পাতা ২, ৩)।
   - *বিশেষ দ্রষ্টব্য*: সকল কাগজ সিরিয়াল অনুযায়ী সাজাতে হবে ও সকল পুরোনো পাসপোর্ট অবশ্যই জমা দিতে হবে।

D. **বিজনেস ভিসা (Business Visa B-1/B-2 — IVAC নোটিশ বোর্ডের ১৬টি আইটেম)**:
   1) আবেদন পত্র · 2) ভিসার আমন্ত্রণ পত্র · 3) জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন · 4) ইউটিলিটি বিলের কপি · 5) ব্যক্তিগত ব্যাংক স্টেটমেন্ট · 6) কোম্পানীর ব্যাংক স্টেটমেন্ট · 7) কোম্পানির প্যাডে ভিসার অনুরোধ পত্র · 8) মাসিক বেতনের সনদপত্র · 9) নবায়নকৃত ট্রেড লাইসেন্স · 10) নবায়নকৃত আয়কর পত্র · 11) ভ্যাট এর সনদপত্র · 12) নবায়নকৃত চেম্বার / এসোসিয়েশন এর সদস্যের সনদপত্র · 13) নবায়নকৃত আমদানি ও রপ্তানি সনদপত্র · 14) কোম্পানির সংঘ স্মারক (মেমোরেন্ডাম) · 15) এল সি (L/C) · 16) পাসপোর্ট এর ফটোকপি (পাতা ২, ৩)।
   - *বিশেষ দ্রষ্টব্য*: সকল কাগজ অবশ্যই উপরের (সিরিয়াল) নম্বর অনুসারে সাজাতে হবে; সকল পুরোনো পাসপোর্ট অবশ্যই জমা দিতে হবে।

E. **স্টুডেন্ট ভিসা (Student Visa S-1) চেকলিস্ট**:
   1) আবেদন পত্র (S-1) · 2) ভারতীয় বিশ্ববিদ্যালয়/কলেজের মূল অ্যাডমিশন লেটার ও বোনাফাইড সার্টিফিকেট · 3) পূর্বের একাডেমিক সার্টিফিকেট, মার্কশিট ও স্বাস্থ্য মন্ত্রণালয়ের NOC (মেডিকেলের ক্ষেত্রে) · 4) জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন · 5) ইউটিলিটি বিলের কপি · 6) ব্যাংক সলভেন্সি ও ৬ মাসের ব্যাংক স্টেটমেন্ট / ডলার এনডোর্সমেন্ট · 7) বর্তমান স্টুডেন্ট আইডি কার্ড · 8) পাসপোর্টের কপি (পাতা ২, ৩)।
   - *বিশেষ দ্রষ্টব্য*: মূল অ্যাডমিশন লেটার সঙ্গে আনতে হবে, কাগজ সিরিয়াল অনুযায়ী সাজাতে হবে ও সকল পুরোনো পাসপোর্ট জমা দিতে হবে।

F. **ট্রানজিট ভিসা (Transit Visa TR — IVAC নোটিশ বোর্ড সিরিয়াল চেকলিস্ট)**:
   1) আবেদন পত্র · 2) বাসের টিকেটের কপি · 3) হোটেল বুকিং · 4) জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন · 5) ইউটিলিটি বিলের কপি · 6) ব্যাংক স্টেটমেন্ট / ডলার এনডোর্সমেন্ট · 7) পেশাগত প্রমাণপত্র · 8) পাসপোর্টের কপি (পাতা ২, ৩)।
   - **পোর্ট**: ভুটান — চেংরাবান্ধা / জয়গা; নেপাল — চেংরাবান্ধা / রানীগঞ্জ (নেপালের ভিসা বাধ্যতামূলক)।
   - *বিশেষ দ্রষ্টব্য*: বাসের মূল টিকেট অবশ্যই সঙ্গে আনতে হবে; সকল কাগজ সিরিয়াল অনুযায়ী সাজাতে হবে; সকল পুরোনো পাসপোর্ট অবশ্যই জমা দিতে হবে।

G. **এন্ট্রি ভিসা — মিসেলেনিয়াস ক্যাটাগরি (Entry Visa X-Misc — IVAC নোটিশ বোর্ড সিরিয়াল চেকলিস্ট)**:
   1) আবেদন পত্র · 2) পাসপোর্টের ফটোকপি (B) · 3) ভিসার ফটোকপি (B) / প্রাসঙ্গিক / সম্পর্কিত সকল কাগজ · 4) জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন · 5) ইউটিলিটি বিলের কপি · 6) ব্যাংক স্টেটমেন্ট · 7) পেশাগত প্রমাণপত্র · 8) পাসপোর্টের কপি (পাতা ২, ৩)।
   - *বিশেষ দ্রষ্টব্য*: সকল কাগজ অবশ্যই উপরের (সিরিয়াল) নম্বর অনুসারে সাজাতে হবে; সকল পুরোনো পাসপোর্ট অবশ্যই জমা দিতে হবে।

H. **স্পাউস ও ফ্যামিলি ভিসা — মিসেলেনিয়াস ক্যাটাগরি (Spouse Visa X-1) চেকলিস্ট**:
   1) আবেদন পত্র (X-1) · 2) নিকাহনামা / সরকারি বিবাহ সনদ (ইংরেজি অনুবাদ ও যথাযথ সত্যায়িত) · 3) স্পাউসের ভারতীয় পাসপোর্ট / আধার / ভোটার আইডি ও ঠিকানার প্রমাণ (বা প্রিন্সিপাল ভিসা কপি) · 4) জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন · 5) ইউটিলিটি বিলের কপি · 6) ব্যাংক স্টেটমেন্ট / ডলার এনডোর্সমেন্ট · 7) পেশাগত প্রমাণপত্র (প্রযোজ্য ক্ষেত্রে) · 8) পাসপোর্টের কপি (পাতা ২, ৩)।

I. **ভিসা প্রত্যাখ্যানের সম্ভাব্য ৯টি কারণ (IVAC নোটিশ বোর্ড অনুযায়ী)**:
   1) আবেদনকারীর ফর্মে কোন ভুল তথ্য পূরণ করলে
   2) কোন ডকুমেন্ট জাল/নকল সংযুক্ত করলে
   3) পাসপোর্ট এবং ভোটার আইডি বা জন্ম নিবন্ধনের সাথে কোন গড়মিল থাকলে
   4) ভ্রমণ ভিসা নিয়ে গিয়ে Over Stay করলে
   5) আবেদন পত্র এবং বিদ্যুৎ বিলের ঠিকানা গড়মিল থাকলে
   6) পুরানো ছবি দিয়ে অথবা 2"×2" ছবি ছাড়া আবেদন করলে
   7) NOC এবং ডলার এনডোর্সমেন্ট নকল দিলে
   8) পেশাগত তথ্য ভুল দিলে (কলম-এ)
   9) পুরানো সকল পাসপোর্ট সংযুক্ত না করলে
   *(অফিসিয়াল নোট: IVAC ভিসা প্রত্যাখ্যান কারণ বলতে পারবে না। বিস্তারিত জানার জন্য ই-মেইল করুন: visahelp@hcidhaka.gov.in)*

J. **বাংলাদেশের আইভ্যাক (IVAC) সেন্টার ও সাময়িকভাবে বন্ধ কেন্দ্রের তথ্য**:
   - **আইভ্যাক (IVAC) সেন্টারসমূহ**: ঢাকা (যমুনা ফিউচার পার্ক — JFP), চট্টগ্রাম, খুলনা, সিলেট ও রাজশাহী।
   - **সাময়িকভাবে বন্ধ ১১টি সেন্টার**: রংপুর, ময়মনসিংহ, বরিশাল, কুমিল্লা, নোয়াখালী, ব্রাহ্মণবাড়িয়া, ঠাকুরগাঁও, বগুড়া, কুষ্টিয়া, যশোর ও সাতক্ষীরা — এই ১১টি আঞ্চলিক আইভ্যাক সেন্টার **আপাতত সাময়িকভাবে বন্ধ রয়েছে**। তাই গ্রাহকদের অনুরোধ করবে উপরের আইভ্যাক সেন্টারগুলোর যেকোনো একটি নির্বাচন করে আবেদন ও স্লট বুকিং করতে।

K. **SCHEDULE OF CHARGES (ALL IVACs) & Processing Hub Official Rates (সর্বশেষ আপডেটেড ফি তালিকা)**:
   - সরকারি আইভ্যাক (IVAC) ফি: 1) Visa Processing Fees: 1500 TK · 2) Additional Port Endorsement: 300 TK (Maximum 2 Ports) · 3) Online Form Correction (Permitted Fields): 300 TK (Condition Apply) · 4) Visa Application Facilitation: 300 TK (At VAFC Jamuna Future Park)।
   1. **Processing Fee with Slot (সম্পূর্ণ ফাইল প্রসেসিং + স্লট — প্রতিটিতেই ৳১,৫০০ আইভ্যাক সরকারি ফি যুক্ত)**:
      - Medical & Attendant Visa (M-1/M-2): **৳৬,০০০**
      - Tourist Visa: **৳৬,০০০**
      - Double Entry Visa (X-3): **৳৬,৫০০**
      - Business Visa (B-1/B-2): **৳৬,০০০**
      - Student Visa (S-1): **৳৫,৫০০** (স্লট ৳৪,৫০০ + প্রসেসিং ৳১,০০০)
      - Transit Visa (TR): **৳৫,৫০০** (স্লট ৳৪,৫০০ + প্রসেসিং ৳১,০০০)
      - Entry Visa (X-Misc): **৳৬,০০০** (স্লট ৳৪,৫০০ + প্রসেসিং ৳১,৫০০)
      - Spouse & Family Visa (X-1): **৳৬,০০০** (স্লট ৳৪,৫০০ + ডকুমেন্ট প্রসেসিং ৳১,৫০০)
   2. **Only Slot Booking (শুধুমাত্র স্লট বুকিং — ৳৪,৫০০ থেকে শুরু, প্রতিটিতেই ৳১,৫০০ আইভ্যাক ফি ফিক্সড)**:
      - Medical / Double Entry (X-3) / Business / Student (S-1) / Transit (TR) / Entry (X-Misc) / Spouse (X-1) শুধু স্লট: মোট **৳৪,৫০০** (আইভ্যাক ফি ৳১,৫০০ + স্লট ফি ৳৩,০০০)
      - Tourist Visa শুধু স্লট: মোট **৳৫,৫০০** (আইভ্যাক ফি ৳১,৫০০ + স্লট ফি ৳৪,০০০)
      - **স্লট বুকিংয়ের প্রয়োজনীয় তথ্য ও আইভ্যাক অফিসিয়াল নিয়ম (সকল ক্যাটাগরির জন্য একই)**: স্লট বুকিংয়ের জন্য কেবল **ওয়েব ফাইল (বাধ্যতামূলক)** এবং **একটি সিম কার্ড** প্রয়োজন—অন্য কোনো কাগজ বা পাসপোর্ট কপি লাগে না। আইভ্যাক (IVAC) সেন্টারের অফিসিয়াল নিয়ম অনুযায়ী একটি সিম কার্ডের অধীনে কেবল একটি অ্যাকাউন্ট খোলা যায় এবং সেই একটি অ্যাকাউন্টে সর্বোচ্চ **৪টি ওয়েব ফাইলের (৪টি ডেট)** স্লট বুকিং করা যায়—এর বেশি করা যাবে না। আবেদনকারী নিজস্ব সিম কার্ড না দিলে আমাদের পক্ষ থেকে সিমের ব্যবস্থা করে অ্যাকাউন্ট খুলে ওয়েব ফাইল আপলোডের মাধ্যমে স্লট বুকিং সম্পন্ন করা হবে; এক্ষেত্রে সিমের জন্য অতিরিক্ত চার্জ প্রযোজ্য হবে।
   3. **Ticket Booking (সকল ধরনের এয়ার/ট্রাভেল টিকেট বুকিং)**:
      - মূল টিকেটের নির্ধারিত মূল্যের সাথে অতিরিক্ত **৳৫৯৯ থেকে শুরু (আলোচনা সাপেক্ষে)** সার্ভিস চার্জ প্রযোজ্য।
   *গুরুত্বপূর্ণ নির্দেশনা*: কাস্টমার যখন কোনো ভিসার খরচ বা ফি জানতে চাইবে, তখন স্পষ্টভাবে **প্রসেসিং + স্লট (আইভ্যাক ফিসহ)** এবং **শুধুমাত্র স্লট (আইভ্যাক ফি ১,৫০০৳ ফিক্সড + স্লট ফি)**—এই দুইটি রেটই পরিষ্কার ও সংক্ষিপ্তভাবে উল্লেখ করবে যাতে কোনো বিভ্রান্তি না থাকে।
   - Hotline/WhatsApp: +8801577464706, Dhaka, Bangladesh.

L. **নতুন ৩টি বিশেষ সেবা ও Chrome এক্সটেনশন (Tracker - Indian Visa Autofill)**:
   - **নোটারি ও ডকুমেন্ট অনুবাদ সেবা (৳১,২০০+)**: ম্যারিজ সার্টিফিকেট/নিকাহনামা, জন্ম নিবন্ধন, একাডেমিক সনদ, পুলিশ ক্লিয়ারেন্স ও ট্রেড লাইসেন্সের নির্ভুল ইংরেজি অনুবাদ এবং নোটারি পাবলিক সহায়তা।
   - **ইন্ডিয়ান হাসপাতাল খরচ ও এয়ারপোর্ট পিকআপ গাইড (৳১,৫০০+)**: ভারতের Apollo, Medanta (মেডান্টা), Fortis, Narayana Health, MIOT, CMC, Desun (দেশুন) ইত্যাদি হাসপাতালে কনসালটেশন/ডায়াগনস্টিক/সার্জারির আনুমানিক খরচের ধারণা ও এয়ারপোর্ট/রেলস্টেশন পিকআপ সমন্বয়।
   - **হোটেল বুকিং ও ট্রেন/বাস ট্রাভেল প্যাকেজ (৳৭৯৯+)**: কলকাতা, দিল্লি, চেন্নাই, ভেলোর, মুম্বাই ও বেঙ্গালুরুতে হাসপাতালের কাছাকাছি ভিসা-সাপোর্টিভ হোটেল বুকিং এবং ঢাকা-কলকাতা/আভ্যন্তরীণ ট্রেন-বাস টিকেট সহায়তা।
   - **অফিশিয়াল Chrome এক্সটেনশন — Tracker - Indian Visa Autofill (Tracker Smart Autofill)**: ইন্ডিয়ান ভিসা ফর্ম অটোফিল করার জন্য আমাদের তৈরি ক্রোম এক্সটেনশনটির নাম **"Tracker - Indian Visa Autofill"** (ক্রোম ওয়েব স্টোর লিংক: https://chromewebstore.google.com/detail/fbofnjpmmimniffobcfpnfiejgkboiga?utm_source=item-share-cp )। এতে পাসপোর্ট বা পূর্বের ফর্ম (PDF) আপলোড করে কিংবা একবার প্রোফাইল সেভ করে মাত্র এক ক্লিকে (One-Click Auto Mode) ৩০ সেকেন্ডের মধ্যে পুরো মাল্টি-স্টেপ অনলাইন ফর্ম, আংশিক পূরণকৃত ফর্ম ও অ্যাপয়েন্টমেন্ট বুকিং পেজ অটোমেটিক পূরণ করা যায়। এতে ইনস্ট্যান্ট ক্যাপচা সলভার, মাল্টিপল প্রোফাইল ও লোকাল ছবি/ডকুমেন্ট স্টোরেজ রয়েছে এবং সকল তথ্য আবেদনকারীর নিজস্ব ব্রাউজারেই সংরক্ষিত থাকে।

I. **REAL-TIME GOOGLE SEARCH & IVAC APPOINTMENT SLOT RELEASE POLICY (রিয়েল-টাইম সার্চ ও স্লট পলিসি)**:
   • You have real-time Google Search capability enabled via Google Search Grounding (\`googleSearch\`).
   • When clients ask about real-time, dynamic, or unlisted information (such as latest High Commission circulars, holiday closures, current fee changes, emergency border updates, or when the next IVAC appointment slot will drop/release):
     - Use Google Search to cross-reference verified official circulars from High Commission of India (hcidhaka.gov.in) or official IVAC Bangladesh (ivacbd.com).
   • **STRICT IVAC SLOT DATE VERIFICATION RULE (স্লটের তারিখ সংক্রান্ত কঠোর নিয়ম)**:
     - IVAC and the Indian High Commission DO NOT announce advance dates or times for slot drops to the public; slots open dynamically in random batches and must be monitored continuously on the system.
     - If your live search discovers an official public circular or press release with an exact date/time, report that verified information directly.
     - If NO official circular or date announcement exists (which is the usual standard case), DO NOT guess, speculate, or fabricate any date.
     - Clearly state: "আইভ্যাকের অফিসিয়াল নিয়ম অনুযায়ী অ্যাপয়েন্টমেন্ট স্লট ছাড়ার সুনির্দিষ্ট দিনক্ষণ আগে থেকে ঘোষণা করা হয় না; সিস্টেমের মাধ্যমে এটি সার্বক্ষণিক মনিটর করতে হয়। নতুন ব্যাচের স্লট ওপেন হওয়া মাত্র দ্রুত বুকিং সম্পন্ন করতে আপনি আমাদের সাথে যোগাযোগ করে ফাইল প্রস্তুত রাখতে পারেন।"
`;

function detectCourtesyHonorific(userName?: string, language: 'bn' | 'en' = 'bn'): string {
  const defaultMale = language === 'en' ? 'Sir' : 'স্যার';
  const defaultFemale = language === 'en' ? "Ma'am" : 'ম্যাডাম';
  if (!userName) return defaultMale;
  const lower = userName.toLowerCase();
  const femaleHints = [
    'aysha', 'aisha', 'fatema', 'fatima', 'nusrat', 'jannat', 'tasnim', 'sadia',
    'farhana', 'sumaiya', 'sabina', 'yasmin', 'sharmin', 'rokeya', 'nadia',
    'mim', 'tania', 'farzana', 'lamia', 'tahmina', 'nasrin', 'eity', 'iti',
    'begum', 'khatun', 'akter', 'akhter', 'sultana', 'jahan', 'rahman', 'parvin',
    'আয়েশা', 'আয়েশা', 'ফাতেমা', 'নুসরাত', 'জান্নাত', 'তাসনিম', 'সাদিয়া', 'ফারহানা',
    'সুমাইয়া', 'শাবিনা', 'ইয়াসমিন', 'শারমিন', 'নাদিয়া', 'তানিয়া', 'ইতি', 'আক্তার', 'বেগম', 'সুলতানা'
  ];
  const isFemale = femaleHints.some((hint) => lower.includes(hint));
  return isFemale ? defaultFemale : defaultMale;
}

// Helper: Expert Knowledge Engine Fallback (no "consultant" labels, natural human tone)
function generateAgentFallbackReply(
  userMessage: string,
  serviceContext?: {
    title?: string;
    category?: string;
    price?: string;
    description?: string;
    documents?: string[];
    isSlotBooking?: boolean;
  },
  agentName = 'Mohammad',
  isFirstReply = true,
  userName?: string,
  attachments?: Array<{ name?: string; mimeType?: string }>,
  language: 'bn' | 'en' = 'bn'
): string {
  const query = (userMessage || '').toLowerCase().trim();
  const honorific = detectCourtesyHonorific(userName, language);
  const firstReplyHonorific = isFirstReply ? `${honorific}, ` : '';
  const isEn = language === 'en';

  if (Array.isArray(attachments) && attachments.length > 0) {
    const fileNames = attachments.map((a) => a.name || (isEn ? 'file' : 'ফাইল')).join(', ');
    if (isEn) {
      return `${firstReplyHonorific}I have received your file **${fileNames}**. Automated inspection is temporarily busy—please message us on WhatsApp (+8801577464706) or let me know briefly what help you need with this document.`;
    }
    return `${firstReplyHonorific}আপনার পাঠানো **${fileNames}** ফাইলটি পেয়েছি। সাময়িকভাবে অটো-রিডিংয়ে সংযোগ সমস্যা থাকায় ফাইলটি সরাসরি যাচাই করে পরবর্তী পদক্ষেপ জানাতে আমাদের WhatsApp নম্বরে (+৮৮০১৫৭৭৪৬৪৭০৬) অথবা আপনার কী বিষয়ে সহায়তা প্রয়োজন তা সংক্ষেপে লিখে দিন।`;
  }

  // Structured Form Handoff Detection (from Talk to Agent button in BN or EN)
  const isBnHandoff = userMessage.includes('নাম:') && userMessage.includes('সেবা/বিষয়:');
  const isEnHandoff = userMessage.includes('Name:') && userMessage.includes('Service/Topic:');
  if (isBnHandoff || isEnHandoff) {
    const labelPrefix = isEnHandoff ? 'Service/Topic:' : 'সেবা/বিষয়:';
    const subjectLine = userMessage
      .split('\n')
      .find((line) => line.startsWith(labelPrefix))
      ?.replace(labelPrefix, '')
      .trim() || serviceContext?.title || (isEn ? 'Visa Processing' : 'ভিসা প্রসেসিং');
    const subjectLower = subjectLine.toLowerCase();

    let serviceDetail = '';
    if (subjectLower.includes('medical') || subjectLower.includes('মেডিকেল') || subjectLower.includes('attendant') || subjectLower.includes('অ্যাটেনডেন্ট')) {
      serviceDetail = isEn
        ? `For **Medical & Attendant Visa**, Full Processing + Slot (including ৳1,500 IVAC fee & invitation) is **৳6,000**, and Slot Only is **৳4,500** (৳1,500 + ৳3,000).`
        : `**মেডিকেল ও অ্যাটেনডেন্ট ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ ও ইনভাইটেশনসহ) **৳৬,০০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('double') || subjectLower.includes('ডাবল') || subjectLower.includes('ডবল') || subjectLower.includes('x-3')) {
      serviceDetail = isEn
        ? `For **Double Entry Visa (X-3)**, Full Processing + Slot (including ৳1,500 IVAC fee) is **৳6,500**, and Slot Only is **৳4,500** (৳1,500 + ৳3,000).`
        : `**ডাবল এন্ট্রি (X-3) ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৬,৫০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('business') || subjectLower.includes('বিজনেস')) {
      serviceDetail = isEn
        ? `For **Business Visa**, Full Processing + Slot (including ৳1,500 IVAC fee) is **৳6,000**, and Slot Only is **৳4,500** (৳1,500 + ৳3,000).`
        : `**বিজনেস ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৬,০০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('student') || subjectLower.includes('স্টুডেন্ট')) {
      serviceDetail = isEn
        ? `For **Student Visa (S-1)**, Full Processing + Slot (including ৳1,500 IVAC fee) is **৳5,500**, and Slot Only is **৳4,500** (৳1,500 + ৳3,000).`
        : `**স্টুডেন্ট (S-1) ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৫,৫০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('transit') || subjectLower.includes('ট্রানজিট')) {
      serviceDetail = isEn
        ? `For **Transit Visa (TR)**, Full Processing + Slot (including ৳1,500 IVAC fee) is **৳5,500**, and Slot Only is **৳4,500** (৳1,500 + ৳3,000).`
        : `**ট্রানজিট (TR) ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৫,৫০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('spouse') || subjectLower.includes('স্পাউস') || subjectLower.includes('family') || subjectLower.includes('x-1')) {
      serviceDetail = isEn
        ? `For **Spouse & Family Visa (X-1)**, Full Processing + Slot is **৳6,000** (Slot ৳4,500 + Document Processing ৳1,500), and Slot Only is **৳4,500**.`
        : `**স্পাউস ও ফ্যামিলি (X-1) ভিসার** জন্য প্রসেসিং + স্লট **৳৬,০০০** (স্লট ৪,৫০০ + ডকুমেন্ট প্রসেসিং ১,৫০০) এবং শুধু স্লট **৳৪,৫০০**।`;
    } else if (subjectLower.includes('entry') || subjectLower.includes('এন্ট্রি') || subjectLower.includes('x-misc')) {
      serviceDetail = isEn
        ? `For **Entry Visa (X-Misc)**, Full Processing + Slot is **৳6,000** (Slot ৳4,500 + Processing ৳1,500), and Slot Only is **৳4,500**.`
        : `**এন্ট্রি (X-Misc) ভিসার** জন্য প্রসেসিং + স্লট **৳৬,০০০** (স্লট ৪,৫০০ + প্রসেসিং ১,৫০০) এবং শুধু স্লট **৳৪,৫০০**।`;
    } else if (subjectLower.includes('tourist') || subjectLower.includes('ট্যুরিস্ট')) {
      serviceDetail = isEn
        ? `For **Tourist Visa**, Full Processing + Slot (including ৳1,500 IVAC fee) is **৳6,000**, and Slot Only is **৳5,500** (৳1,500 + ৳4,000).`
        : `**ট্যুরিস্ট ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৬,০০০** এবং শুধু স্লট **৳৫,৫০০** (১,৫০০ + ৪,০০০)।`;
    } else if (subjectLower.includes('ticket') || subjectLower.includes('টিকেট') || subjectLower.includes('টিকিট')) {
      serviceDetail = isEn
        ? `For **Ticket Booking**, a service charge starting from **৳599** (negotiable depending on route) applies on top of the base ticket fare.`
        : `**টিকেট বুকিংয়ের** ক্ষেত্রে মূল টিকেটের নির্ধারিত মূল্যের সাথে অতিরিক্ত **৳৫৯৯ থেকে শুরু** (আলোচনা সাপেক্ষে) সার্ভিস চার্জ প্রযোজ্য।`;
    } else if (subjectLower.includes('slot') || subjectLower.includes('স্লট')) {
      serviceDetail = isEn
        ? `**Slot Only Booking** starts from **৳4,500** (including fixed ৳1,500 IVAC fee): Medical / Business / Double Entry X-3 / Student / Transit / Entry X-Misc / Spouse X-1 is **৳4,500**, and Tourist is **৳5,500**.`
        : `**শুধু স্লট বুকিং** **৳৪,৫০০ থেকে শুরু** (আইভ্যাক ফি ১,৫০০৳ ফিক্সডসহ): মেডিকেল/বিজনেস/ডাবল এন্ট্রি X-3/স্টুডেন্ট/ট্রানজিট/এন্ট্রি X-Misc/স্পাউস X-1 **৳৪,৫০০** এবং ট্যুরিস্ট **৳৫,৫০০**।`;
    } else if (serviceContext?.price) {
      serviceDetail = isEn
        ? `The official fee for **${subjectLine}** is **${serviceContext.price}**.`
        : `**${subjectLine}**-এর ফি **${serviceContext.price}**।`;
    }

    if (isEn) {
      return `Assalamu Alaikum ${honorific}! I have received your details. I am **${agentName}** from Processing Hub.\n\n${serviceDetail ? `${serviceDetail}\n\n` : ''}How can I assist you with **${subjectLine}** today?`;
    }
    return `আসসালামু আলাইকুম ${honorific}! আপনার তথ্যগুলো পেয়েছি। আমি **${agentName}**, প্রসেসিং হাব থেকে বলছি।\n\n${serviceDetail ? `${serviceDetail}\n\n` : ''}**${subjectLine}** বিষয়ে আপনাকে কীভাবে সহযোগিতা করতে পারি?`;
  }

  // Greetings & Identity
  if (query.includes('কে আপনি') || query.includes('আপনার নাম') || query.includes('who are you') || query.includes('your name') || query === 'name' || query.includes('ai') || query.includes('bot') || query.includes('রোবট')) {
    if (isEn) {
      return `${isFirstReply ? `Assalamu Alaikum ${honorific}! ` : ''}I am **${agentName}** from Processing Hub. I am ready to help you with any Indian visa processing or document guidance.`;
    }
    return `${isFirstReply ? `আসসালামু আলাইকুম ${honorific}! ` : ''}আমি **${agentName}**, প্রসেসিং হাব থেকে বলছি। আপনার যে কোনো ভিসা প্রসেসিং ও তথ্য দিয়ে সাহায্য করতে প্রস্তুত।`;
  }

  if (query === 'hi' || query === 'hello' || query === 'hey' || query === 'হ্যালো' || query === 'হাই' || query.includes('আসসালামু') || query.includes('assalamu') || query.includes('কেমন আছেন') || query.includes('how are you')) {
    if (isEn) {
      if (serviceContext?.title) {
        return `Assalamu Alaikum ${honorific}! Welcome to Processing Hub. I am **${agentName}**. What would you like to know about **${serviceContext.title}**?`;
      }
      return `Assalamu Alaikum ${honorific}! Welcome to Processing Hub. I am **${agentName}**. How can I assist you today?`;
    }
    if (serviceContext?.title) {
      return `আসসালামু আলাইকুম ${honorific}! প্রসেসিং হাবে স্বাগতম। আমি **${agentName}**। **${serviceContext.title}** সম্পর্কে আপনার কী জানার আছে বলুন, সাহায্য করছি।`;
    }
    return `আসসালামু আলাইকুম ${honorific}! প্রসেসিং হাবে স্বাগতম। আমি **${agentName}**। আপনাকে কীভাবে সহযোগিতা করতে পারি?`;
  }

  // If specific serviceContext is active and user asks general question
  const isGeneralDocQuery = query.includes('ডকুমেন্ট') || query.includes('কাগজ') || query.includes('কি কি লাগে') || query.includes('চেকলিস্ট') || query.includes('document') || query.includes('requirement') || query.includes('checklist') || query.includes('paper');
  const isGeneralCostQuery = query.includes('খরচ') || query.includes('ফি') || query.includes('টাকা') || query.includes('price') || query.includes('charge') || query.includes('cost') || query.includes('fee');
  const isHowToQuery = query.includes('কিভাবে') || query.includes('আবেদন') || query.includes('প্রসেস') || query.includes('বুক') || query.includes('শুরু') || query.includes('নিতে চাই') || query.includes('করতে চাই') || query.includes('how to') || query.includes('apply') || query.includes('process') || query.includes('start') || query.includes('steps');

  if (serviceContext?.title) {
    const titleLower = serviceContext.title.toLowerCase();
    const isServiceMedical = titleLower.includes('medical') || serviceContext.title.includes('মেডিকেল');
    const isServiceDouble = titleLower.includes('double') || serviceContext.title.includes('ডাবল') || titleLower.includes('x-3');
    const isServiceBusiness = titleLower.includes('business') || serviceContext.title.includes('বিজনেস');
    const isServiceStudent = titleLower.includes('student') || serviceContext.title.includes('স্টুডেন্ট');
    const isServiceTransit = titleLower.includes('transit') || serviceContext.title.includes('ট্রানজিট');
    const isServiceSpouse = titleLower.includes('spouse') || serviceContext.title.includes('স্পাউস') || titleLower.includes('x-1');
    const isServiceEntry = !isServiceDouble && (titleLower.includes('entry') || serviceContext.title.includes('এন্ট্রি') || titleLower.includes('x-misc'));
    const isServiceSlot = serviceContext.isSlotBooking || titleLower.includes('slot') || serviceContext.title.includes('স্লট');

    if (isGeneralCostQuery) {
      if (isServiceSlot) {
        return isEn
          ? `IVAC Slot-only booking starts from **৳4,500** (including fixed ৳1,500 IVAC fee):\n\n` +
            `- **Medical / Double Entry X-3 / Business / Student / Transit / Entry X-Misc / Spouse X-1 Slot:** Total **৳4,500** (৳1,500 IVAC + ৳3,000 Slot)\n` +
            `- **Tourist Slot:** Total **৳5,500** (৳1,500 IVAC + ৳4,000 Slot)`
          : `শুধুমাত্র আইভ্যাক স্লট বুকিং ফি ৳৪,৫০০ থেকে শুরু (প্রতিটি ভিসায় আইভ্যাক ফি ১,৫০০৳ ফিক্সড):\n\n` +
            `- **মেডিকেল / ডাবল এন্ট্রি X-3 / বিজনেস / স্টুডেন্ট / ট্রানজিট / এন্ট্রি X-Misc / স্পাউস X-1 স্লট:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n` +
            `- **ট্যুরিস্ট স্লট:** মোট ৳৫,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৪,০০০৳)`;
      }
      if (isServiceMedical) {
        return isEn
          ? `**Medical & Attendant Visa Fee Breakdown:**\n\n- **Processing + Slot (with ৳1,500 IVAC fee):** ৳6,000\n- **Slot Booking Only:** Total ৳4,500 (৳1,500 IVAC + ৳3,000 Slot)`
          : `**মেডিকেল ও অ্যাটেনডেন্ট ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,০০০\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceDouble) {
        return isEn
          ? `**Double Entry (X-3) Visa Fee Breakdown:**\n\n- **Processing + Slot (with ৳1,500 IVAC fee):** ৳6,500\n- **Slot Booking Only:** Total ৳4,500 (৳1,500 IVAC + ৳3,000 Slot)`
          : `**ডাবল এন্ট্রি (X-3) ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,৫০০\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceBusiness) {
        return isEn
          ? `**Business Visa Fee Breakdown:**\n\n- **Processing + Slot (with ৳1,500 IVAC fee):** ৳6,000\n- **Slot Booking Only:** Total ৳4,500 (৳1,500 IVAC + ৳3,000 Slot)`
          : `**বিজনেস ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,০০০\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceStudent) {
        return isEn
          ? `**Student Visa (S-1) Fee Breakdown:**\n\n- **Processing + Slot (with ৳1,500 IVAC fee):** ৳5,500\n- **Slot Booking Only:** Total ৳4,500 (৳1,500 IVAC + ৳3,000 Slot)`
          : `**স্টুডেন্ট (S-1) ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৫,৫০০\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceTransit) {
        return isEn
          ? `**Transit Visa (TR) Fee Breakdown:**\n\n- **Processing + Slot (with ৳1,500 IVAC fee):** ৳5,500\n- **Slot Booking Only:** Total ৳4,500 (৳1,500 IVAC + ৳3,000 Slot)`
          : `**ট্রানজিট (TR) ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৫,৫০০\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceSpouse) {
        return isEn
          ? `**Spouse & Family (X-1) Visa Fee Breakdown:**\n\n- **Processing + Slot:** ৳6,000 (৳4,500 Slot + ৳1,500 Document Processing)\n- **Slot Booking Only:** Total ৳4,500 (৳1,500 IVAC + ৳3,000 Slot)`
          : `**স্পাউস ও ফ্যামিলি (X-1) ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট:** ৳৬,০০০ (স্লট ৪,৫০০৳ + ডকুমেন্ট প্রসেসিং ১,৫০০৳)\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceEntry) {
        return isEn
          ? `**Entry Visa (X-Misc) Fee Breakdown:**\n\n- **Processing + Slot:** ৳6,000 (৳4,500 Slot + ৳1,500 Service Charge)\n- **Slot Booking Only:** Total ৳4,500 (৳1,500 IVAC + ৳3,000 Slot)`
          : `**এন্ট্রি (X-Misc) ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট:** ৳৬,০০০ (স্লট ৪,৫০০৳ + সার্ভিস চার্জ ১,৫০০৳)\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (titleLower.includes('tourist') || serviceContext.title.includes('ট্যুরিস্ট')) {
        return isEn
          ? `**Tourist Visa Fee Breakdown:**\n\n- **Processing + Slot (with ৳1,500 IVAC fee):** ৳6,000\n- **Slot Booking Only:** Total ৳5,500 (৳1,500 IVAC + ৳4,000 Slot)`
          : `**ট্যুরিস্ট ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,০০০\n- **শুধু স্লট বুকিং:** মোট ৳৫,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৪,০০০৳)`;
      }
      if (titleLower.includes('ticket') || serviceContext.title.includes('টিকেট')) {
        return isEn
          ? `**Ticket Booking Service Charge:** Starting from **৳599** (negotiable depending on route) in addition to the base ticket fare.`
          : `**টিকেট বুকিং সার্ভিস চার্জ:** মূল টিকেটের নির্ধারিত মূল্যের সাথে অতিরিক্ত **৳৫৯৯ থেকে শুরু** (আলোচনা সাপেক্ষে)।`;
      }
      return isEn
        ? `${firstReplyHonorific}The official fee for **${serviceContext.title}** is **${serviceContext.price || '৳6,000'}**.`
        : `${firstReplyHonorific}**${serviceContext.title}**-এর অফিশিয়াল ফি **${serviceContext.price || '৳৬,০০০'}**।`;
    }

    if (isGeneralDocQuery || isHowToQuery) {
      if (isServiceMedical) {
        return isEn
          ? `${firstReplyHonorific}Here are the required documents for Medical & Attendant Visa:\n\n` +
            `- **Common Documents:** Original & all old passports, 2×2 white background photo, NID/Birth Certificate, utility bill, occupation certificate, and $200 endorsement / 6-month bank statement / SBI Travel Card.\n` +
            `- **Patient (M-1) Documents:** Original Indian hospital appointment & AYUSH letter, plus recent Bangladeshi doctor's prescription and medical test reports.\n` +
            `- **Attendant (M-2) Documents:** Basic common documents and proof of relationship with the patient (separate medical test reports are not required).`
          : `${firstReplyHonorific}মেডিকেল ও অ্যাটেনডেন্ট ভিসার কাগজপত্রগুলো নিচে দিলাম:\n\n` +
            `- **সাধারণ ডকুমেন্টস:** মূল ও সকল পুরনো পাসপোর্ট, ২×২ সাদা ব্যাকগ্রাউন্ড ছবি, NID/জন্মনিবন্ধন, ইউটিলিটি বিল, পেশাগত সনদ এবং $২০০ এন্ডোর্সমেন্ট / সমপরিমাণ টাকার ৬ মাসের ব্যাংক স্টেটমেন্ট / SBI ট্রাভেল কার্ড।\n` +
            `- **রোগীর (M-1) অতিরিক্ত কাগজ:** ভারতীয় হাসপাতালের মূল অ্যাপয়েন্টমেন্ট ও AYUSH লেটার এবং বাংলাদেশের ডাক্তারের প্রেসক্রিপশন ও টেস্ট রিপোর্ট।\n` +
            `- **অ্যাটেনডেন্টের (M-2) কাগজ:** কেবল বেসিক ডকুমেন্টস ও রোগীর সাথে সম্পর্কের প্রমাণপত্র (আলাদা মেডিকেল টেস্ট রিপোর্ট লাগবে না)।`;
      }
      if (isServiceDouble) {
        return isEn
          ? `${firstReplyHonorific}For Double Entry Visa (X-3), you will need:\n\n` +
            `- Online Miscellaneous (X-3) application form, original & all old passports, and 2×2 white background photo\n` +
            `- **Official Embassy Appointment Letter** of the destination/European country\n` +
            `- **Work Permit** and supporting European/3rd-country contract documents\n` +
            `- Confirmed flight/transit itinerary, cover letter, NID, and recent utility bill\n` +
            `- Occupation certificate and $200 endorsement / 6-month bank statement / SBI Travel Card.`
          : `${firstReplyHonorific}ডাবল এন্ট্রি (X-3) ভিসার জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
            `- অনলাইন Miscellaneous (X-3) আবেদন পত্র, মূল ও সকল পুরনো পাসপোর্ট এবং ২×২ সাদা ব্যাকগ্রাউন্ড ছবি\n` +
            `- সংশ্লিষ্ট ৩য়/ইউরোপীয় দেশের **এম্বাসির অফিশিয়াল অ্যাপয়েন্টমেন্ট লেটার**\n` +
            `- **ওয়ার্ক পারমিট (Work Permit)** সহ ইউরোপগামী চুক্তিকৃত কোম্পানির প্রয়োজনীয় কাগজপত্র\n` +
            `- কনফার্মড ফ্লাইট/ট্রানজিট রুট, কভারিং লেটার, NID ও ইউটিলিটি বিল\n` +
            `- পেশাগত প্রমাণপত্র এবং $২০০ এন্ডোর্সমেন্ট / সমপরিমাণ টাকার ৬ মাসের ব্যাংক স্টেটমেন্ট / SBI ট্রাভেল কার্ড।`;
      }
      if (isServiceBusiness) {
        return isEn
          ? `${firstReplyHonorific}For a Business Visa, you will need:\n\n` +
            `- Online application form, original & old passports, 2×2 photo, NID, and utility bill\n` +
            `- Original invitation letter from the Indian company and forwarding letter on Bangladeshi company letterhead\n` +
            `- Updated Trade License, Chamber of Commerce certificate, TIN, BIN, IRC, LC, and VAT Return\n` +
            `- Personal & company 6-month bank statements ($200+ equivalent / SBI Travel Card).`
          : `${firstReplyHonorific}বিজনেস ভিসার জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
            `- আবেদন পত্র, মূল ও সকল পুরনো পাসপোর্ট, ২×২ ছবি, NID ও ইউটিলিটি বিল\n` +
            `- ভারতীয় কোম্পানির মূল ইনভাইটেশন লেটার ও বাংলাদেশি প্রতিষ্ঠানের ফরওয়ার্ডিং লেটার\n` +
            `- হালনাগাদ ট্রেড লাইসেন্স, চেম্বার অফ কমার্স সনদ, TIN, BIN, IRC, LC ও VAT রিটার্ন\n` +
            `- ব্যক্তিগত ও কোম্পানির বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট ($২০০ বা সমপরিমাণ / SBI কার্ড)।`;
      }
      if (isServiceStudent) {
        return isEn
          ? `${firstReplyHonorific}For a Student Visa (S-1), you will need:\n\n` +
            `- Online application form, original & old passports, 2×2 photo, NID/Birth Certificate, and utility bill\n` +
            `- Original Admission & Bonafide certificate from the Indian university/college (plus Health Ministry NOC for medical colleges)\n` +
            `- Guardian/sponsor bank solvency & 6-month bank statement ($200+ / SBI card)\n` +
            `- Previous academic certificates and current Student ID card.`
          : `${firstReplyHonorific}স্টুডেন্ট ভিসার (S-1) জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
            `- অনলাইন আবেদন পত্র, মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID/জন্মনিবন্ধন ও ইউটিলিটি বিল\n` +
            `- ভারতের স্বীকৃত বিশ্ববিদ্যালয়/কলেজের মূল অ্যাডমিশন ও বোনাফাইড সার্টিফিকেট (মেডিকেলের ক্ষেত্রে স্বাস্থ্য মন্ত্রণালয়ের NOC)\n` +
            `- অভিভাবক/স্পনসরের ব্যাংক সলভেন্সি ও ৬ মাসের স্টেটমেন্ট ($২০০+ / SBI কার্ড)\n` +
            `- পূর্বের একাডেমিক সার্টিফিকেট ও বর্তমান স্টুডেন্ট আইডি কার্ড।`;
      }
      if (isServiceTransit) {
        return isEn
          ? `${firstReplyHonorific}For a Transit Visa (TR), you will need:\n\n` +
            `- Online application form, original & old passports, 2×2 photo, NID, and utility bill\n` +
            `- Valid visa for the 3rd destination country, confirmed onward/return bus or air ticket, and hotel booking\n` +
            `- Occupation proof and $200 endorsement / 6-month bank statement / SBI Travel Card.`
          : `${firstReplyHonorific}ট্রানজিট ভিসার (TR) জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
            `- অনলাইন আবেদন পত্র, মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID ও ইউটিলিটি বিল\n` +
            `- গন্তব্য ৩য় দেশের বৈধ ভিসা, কনফার্মড বাস/এয়ার টিকেট এবং হোটেল বুকিং\n` +
            `- পেশাগত প্রমাণপত্র ও $২০০ এন্ডোর্সমেন্ট / সমপরিমাণ ব্যাংক স্টেটমেন্ট / SBI ট্রাভেল কার্ড।`;
      }
      if (isServiceSpouse) {
        return isEn
          ? `${firstReplyHonorific}For a Spouse & Family Visa (X-1), you will need:\n\n` +
            `- Online Miscellaneous (X-1) form, original & old passports, 2×2 photo, NID, and utility bill\n` +
            `- Nikahnama / Marriage Certificate (English translation attested by MoFA & Indian High Commission)\n` +
            `- Indian spouse's Passport / Aadhaar / Voter ID & address proof\n` +
            `- Occupation certificate (if applicable) and $200 endorsement / bank statement / SBI card.`
          : `${firstReplyHonorific}স্পাউস ও ফ্যামিলি (X-1) ভিসার জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
            `- অনলাইন Miscellaneous (X-1) আবেদন পত্র, মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID ও ইউটিলিটি বিল\n` +
            `- নিকাহনামা / ম্যারিজ সার্টিফিকেট (ইংরেজি অনুবাদ, MoFA ও ভারতীয় হাইকমিশন সত্যায়িত)\n` +
            `- স্পাউসের ভারতীয় পাসপোর্ট / আধার / ভোটার আইডি ও ঠিকানার প্রমাণ\n` +
            `- পেশাগত সনদ (প্রযোজ্য ক্ষেত্রে) ও $২০০ এন্ডোর্সমেন্ট / ব্যাংক স্টেটমেন্ট / SBI কার্ড।`;
      }
      if (isServiceEntry) {
        return isEn
          ? `${firstReplyHonorific}For an Entry Visa (X-Misc), you will need:\n\n` +
            `- Online Miscellaneous (X-Misc) form, original & old passports, 2×2 photo, NID, and utility bill\n` +
            `- Supporting X-Misc eligibility/invitation/PIO or principal visa & passport copy\n` +
            `- Occupation proof and $200 endorsement / 6-month bank statement / SBI Travel Card.`
          : `${firstReplyHonorific}এন্ট্রি (X-Misc) ভিসার জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
            `- অনলাইন Miscellaneous (X-Misc) আবেদন পত্র, মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID ও ইউটিলিটি বিল\n` +
            `- X-Misc এন্ট্রি যোগ্যতার মূল প্রমাণপত্র / ইনভাইটেশন বা প্রিন্সিপাল পাসপোর্ট-ভিসা কপি\n` +
            `- পেশাগত প্রমাণপত্র ও $২০০ এন্ডোর্সমেন্ট / সমপরিমাণ ব্যাংক স্টেটমেন্ট / SBI ট্রাভেল কার্ড।`;
      }
      if (titleLower.includes('ticket') || serviceContext.title.includes('টিকেট')) {
        return isEn
          ? `${firstReplyHonorific}Here are the Ticket Booking service details:\n\n` +
            `- **Service Charge:** Starting from **৳599** (negotiable) in addition to the base ticket fare.\n` +
            `- **Services:** Domestic & international air tickets, one-way, round-trip, transit, and confirmed return tickets.\n` +
            `- **Required Details:** Clear passport copy, preferred travel dates, destination city, and visa copy (if available).`
          : `${firstReplyHonorific}টিকেট বুকিংয়ের বিস্তারিত তথ্য নিচে দিলাম:\n\n` +
            `- **সার্ভিস চার্জ:** মূল টিকেটের নির্ধারিত মূল্যের সাথে অতিরিক্ত **৳৫৯৯ থেকে শুরু** (আলোচনা সাপেক্ষে)।\n` +
            `- **সেবাসমূহ:** দেশ ও বিদেশের এয়ার টিকেট, ওয়ান-ওয়ে, রাউন্ড ট্রিপ, ট্রানজিট ও কনফার্মড রিটার্ন টিকেট বুকিং।\n` +
            `- **প্রয়োজনীয় তথ্য:** যাত্রীর পাসপোর্ট কপি, সম্ভাব্য তারিখ, গন্তব্য শহর ও ভিসা কপি (যদি থাকে)।`;
      }
      if (isServiceSlot) {
        return isEn
          ? `${firstReplyHonorific}For IVAC slot booking, we only need two details:\n\n` +
            `- A clear photo of your passport\n` +
            `- Your online visa application Web File No.`
          : `${firstReplyHonorific}আইভ্যাক স্লট বুকিংয়ের জন্য কেবল নিচের দুইটি তথ্য লাগবে:\n\n` +
            `- পাসপোর্টের পরিষ্কার ছবি\n` +
            `- অনলাইন ভিসা ফর্মের ওয়েব ফাইল নম্বর (Web File No)।`;
      }
    }
  }

  // Double Entry Visa direct queries (X-3)
  if (query.includes('ডাবল') || query.includes('ডবল') || query.includes('double') || query.includes('x-3') || query.includes('এম্বাসি') || query.includes('embassy') || query.includes('পর্তুগাল') || query.includes('পোল্যান্ড') || query.includes('ওয়ার্ক পারমিট') || query.includes('work permit')) {
    if (query.includes('স্লট') || query.includes('slot')) {
      return isEn
        ? `Double Entry (X-3) Visa Slot & Processing Fees:\n\n` +
          `- **Slot Booking Only:** Total **৳4,500** (৳1,500 IVAC fee + ৳3,000 slot fee)\n` +
          `- **Full Processing + Slot (with IVAC fee):** **৳6,500**\n` +
          `- **Needed:** Your passport copy and Web File No.`
        : `ডাবল এন্ট্রি (X-3) ভিসার স্লট ও প্রসেসিং ফি:\n\n` +
          `- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ফি ১,৫০০৳ + স্লট ফি ৩,০০০৳)\n` +
          `- **প্রসেসিং + স্লট (আইভ্যাক ফিসহ):** ৳৬,৫০০\n` +
          `- **যা লাগবে:** আপনার পাসপোর্টের কপি ও ভিসা ফর্মের ওয়েব ফাইল নম্বর।`;
    }
    return isEn
      ? `Double Entry Visa — Miscellaneous (X-3) Fees & Checklist:\n\n` +
        `- **Processing + Slot (with ৳1,500 IVAC fee):** **৳6,500**\n` +
        `- **Slot Booking Only:** Total **৳4,500** (৳1,500 IVAC + ৳3,000 Slot)\n` +
        `- **Additional Required Papers:** **Official Embassy Appointment Letter** of the 3rd/European country, **Work Permit** & European employer contract papers, and cover letter.\n` +
        `- **Common Papers:** Original & old passports, 2×2 photo, NID, utility bill, NOC/Trade License, and $200 endorsement / 6-month bank statement / SBI Travel Card.`
      : `ডাবল এন্ট্রি ভিসা — মিসেলেনিয়াস (X-3) ফি ও কাগজপত্র:\n\n` +
        `- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,৫০০\n` +
        `- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n` +
        `- **অতিরিক্ত জরুরি কাগজপত্র:** যে দেশের এম্বাসি ফেস করবেন তার **অ্যাপয়েন্টমেন্ট লেটার**, **ওয়ার্ক পারমিট** সহ ইউরোপগামী চুক্তিকৃত কোম্পানির কাগজপত্র ও কভারিং লেটার।\n` +
        `- **কমন কাগজপত্র:** মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID, ইউটিলিটি বিল, NOC/ট্রেড লাইসেন্স এবং $২০০ এন্ডোর্সমেন্ট / ব্যাংক স্টেটমেন্ট / SBI ট্রাভেল কার্ড।`;
  }

  // Spouse & Family Visa (X-1)
  if (query.includes('স্পাউস') || query.includes('spouse') || query.includes('x-1') || query.includes('ফ্যামিলি ভিসা') || query.includes('family visa') || query.includes('নিকাহনামা') || query.includes('marriage') || query.includes('স্ত্রী') || query.includes('স্বামী')) {
    return isEn
      ? `Spouse & Family Visa (X-1 Miscellaneous) Details & Fees:\n\n` +
        `- **Processing + Slot:** **৳6,000** (৳4,500 Slot + ৳1,500 Document Processing)\n` +
        `- **Slot Booking Only:** Total **৳4,500** (৳1,500 IVAC + ৳3,000 Slot)\n` +
        `- **Key Documents:** Original & old passports, 2×2 photo, NID, utility bill, English Nikahnama/Marriage Certificate (attested by MoFA & Indian High Commission), spouse's Indian Passport/Aadhaar/address proof, and $200 endorsement / bank statement / SBI card.`
      : `স্পাউস ও ফ্যামিলি ভিসা (X-1 মিসেলেনিয়াস) তথ্য ও ফি:\n\n` +
        `- **প্রসেসিং + স্লট:** **৳৬,০০০** (স্লট ৪,৫০০৳ + ডকুমেন্ট প্রসেসিং ১,৫০০৳)\n` +
        `- **শুধু স্লট বুকিং:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n` +
        `- **মূল কাগজপত্র:** মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID, ইউটিলিটি বিল, ইংরেজিতে MoFA ও হাইকমিশন সত্যায়িত নিকাহনামা/ম্যারিজ সার্টিফিকেট, স্পাউসের ভারতীয় পাসপোর্ট/আধার/ঠিকানার প্রমাণ এবং $২০০ এন্ডোর্সমেন্ট / ব্যাংক স্টেটমেন্ট / SBI কার্ড।`;
  }

  // Student Visa (S-1)
  if (query.includes('স্টুডেন্ট') || query.includes('student') || query.includes('পড়াশোনা') || query.includes('বিশ্ববিদ্যালয়') || query.includes('university') || query.includes('s-1')) {
    return isEn
      ? `Student Visa (S-1) Details & Fees:\n\n` +
        `- **Processing + Slot (with ৳1,500 IVAC fee):** **৳5,500**\n` +
        `- **Slot Booking Only:** Total **৳4,500** (৳1,500 IVAC + ৳3,000 Slot)\n` +
        `- **Key Documents:** Original & old passports, 2×2 photo, NID/Birth Certificate, utility bill, original Admission & Bonafide Certificate from the Indian institution (Health Ministry NOC for medical programs), 6-month guardian bank solvency & statement, and academic certificates/Student ID.`
      : `স্টুডেন্ট ভিসা (S-1) তথ্য ও ফি:\n\n` +
        `- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** **৳৫,৫০০**\n` +
        `- **শুধু স্লট বুকিং:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n` +
        `- **মূল কাগজপত্র:** মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID/জন্মনিবন্ধন, ইউটিলিটি বিল, ভারতীয় বিশ্ববিদ্যালয়/কলেজের মূল অ্যাডমিশন ও বোনাফাইড সার্টিফিকেট (মেডিকেলের ক্ষেত্রে স্বাস্থ্য মন্ত্রণালয়ের NOC), ৬ মাসের ব্যাংক সলভেন্সি ও স্টেটমেন্ট এবং একাডেমিক সনদ/স্টুডেন্ট আইডি।`;
  }

  // Notice board queries: Rejection reasons (Official IVAC Notice Board 9 causes)
  if (query.includes('রিজেক্ট') || query.includes('প্রত্যাখ্যান') || query.includes('বাতিল') || query.includes('rejection') || query.includes('reject') || query.includes('refus') || query.includes('ভিসা না পাওয়ার কারণ')) {
    return isEn
      ? 'Official IVAC Notice Board — 9 Possible Causes of Indian Visa Rejection:\n\n' +
        '- 1) Filling incorrect details in the application form\n' +
        '- 2) Attaching any fake/forged document\n' +
        '- 3) Any mismatch between Passport and Voter ID (NID) or Birth Registration\n' +
        '- 4) Overstaying in India on a previous travel visa\n' +
        '- 5) Address mismatch between the application form and electricity bill\n' +
        '- 6) Applying with an old photo or without a 2"×2" photo\n' +
        '- 7) Submitting fake NOC or fake dollar endorsement\n' +
        '- 8) Providing incorrect occupational details (in the occupation column)\n' +
        '- 9) Failing to attach all previous/old passports\n\n' +
        '*(IVAC cannot state reasons for rejection. Official email: visahelp@hcidhaka.gov.in)*'
      : 'অফিশিয়াল IVAC নোটিশ বোর্ড অনুযায়ী ভিসা প্রত্যাখ্যানের সম্ভাব্য ৯টি কারণ:\n\n' +
        '- ১) আবেদনকারীর ফর্মে কোন ভুল তথ্য পূরণ করলে\n' +
        '- ২) কোন ডকুমেন্ট জাল/নকল সংযুক্ত করলে\n' +
        '- ৩) পাসপোর্ট এবং ভোটার আইডি বা জন্ম নিবন্ধনের সাথে কোন গড়মিল থাকলে\n' +
        '- ৪) ভ্রমণ ভিসা নিয়ে গিয়ে Over Stay করলে\n' +
        '- ৫) আবেদন পত্র এবং বিদ্যুৎ বিলের ঠিকানা গড়মিল থাকলে\n' +
        '- ৬) পুরানো ছবি দিয়ে অথবা 2"×2" ছবি ছাড়া আবেদন করলে\n' +
        '- ৭) NOC এবং ডলার এনডোর্সমেন্ট নকল দিলে\n' +
        '- ৮) পেশাগত তথ্য ভুল দিলে (কলম-এ)\n' +
        '- ৯) পুরানো সকল পাসপোর্ট সংযুক্ত না করলে\n\n' +
        '*(IVAC ভিসা প্রত্যাখ্যান কারণ বলতে পারবে না। বিস্তারিত জানার জন্য ই-মেইল করুন: visahelp@hcidhaka.gov.in)*';
  }

  // IVAC Centers / Location queries (5 active IVAC centers + note on 11 temporarily closed centers)
  if (
    query.includes('সেন্টার') || query.includes('লোকেশন') || query.includes('কোথায়') || query.includes('অফিস') ||
    query.includes('center') || query.includes('centre') || query.includes('location') || query.includes('branch') ||
    query.includes('রংপুর') || query.includes('ময়মনসিংহ') || query.includes('ময়মনসিংহ') ||
    query.includes('বরিশাল') || query.includes('কুমিল্লা') || query.includes('নোয়াখালী') || query.includes('নোয়াখালী') ||
    query.includes('ব্রাহ্মণবাড়িয়া') || query.includes('ব্রাহ্মণবাড়িয়া') || query.includes('ঠাকুরগাঁও') ||
    query.includes('বগুড়া') || query.includes('বগুড়া') || query.includes('কুষ্টিয়া') || query.includes('কুষ্টিয়া') ||
    query.includes('যশোর') || query.includes('সাতক্ষীরা') ||
    query.includes('rangpur') || query.includes('mymensingh') || query.includes('barisal') ||
    query.includes('cumilla') || query.includes('comilla') || query.includes('noakhali') ||
    query.includes('brahmanbaria') || query.includes('thakurgaon') || query.includes('bogura') ||
    query.includes('bogra') || query.includes('kushtia') || query.includes('jessore') || query.includes('satkhira')
  ) {
    return isEn
      ? 'Official **IVAC centers** in Bangladesh:\n\n' +
        '1. **Dhaka** — Jamuna Future Park (JFP), Progoti Sarani, Baridhara\n' +
        '2. **Chattogram**\n' +
        '3. **Khulna**\n' +
        '4. **Sylhet**\n' +
        '5. **Rajshahi**\n\n' +
        '⚠️ *Important Note:* The other 11 regional IVAC centers (Rangpur, Mymensingh, Barishal, Cumilla, Noakhali, Brahmanbaria, Thakurgaon, Bogura, Kushtia, Jashore, and Satkhira) are **temporarily closed**. Please select one of the IVAC centers above for your application and slot booking.'
      : 'বাংলাদেশের **আইভ্যাক (IVAC) সেন্টারগুলোর ঠিকানা**:\n\n' +
        '১. **ঢাকা** — যমুনা ফিউচার পার্ক (JFP), প্রগতি সরণি, বারিধারা\n' +
        '২. **চট্টগ্রাম**\n' +
        '৩. **খুলনা**\n' +
        '৪. **সিলেট**\n' +
        '৫. **রাজশাহী**\n\n' +
        '⚠️ *জরুরি নোট:* বাকি ১১টি আঞ্চলিক আইভ্যাক সেন্টার (রংপুর, ময়মনসিংহ, বরিশাল, কুমিল্লা, নোয়াখালী, ব্রাহ্মণবাড়িয়া, ঠাকুরগাঁও, বগুড়া, কুষ্টিয়া, যশোর ও সাতক্ষীরা) **আপাতত সাময়িকভাবে বন্ধ রয়েছে**। তাই উপরের আইভ্যাক সেন্টারগুলোর যেকোনো একটিতে আপনার স্লট ও ফাইল প্রসেসিং সম্পন্ন করতে পারবেন।';
  }

  // IVAC Schedule of charges
  if (query.includes('সরকারি ফি') || query.includes('ivac fee') || query.includes('আইভ্যাক ফি') || query.includes('পোর্ট চার্জ') || query.includes('correction') || query.includes('সংশোধন ফি') || query.includes('schedule of charges') || query.includes('government fee')) {
    return isEn
      ? 'Official IVAC Schedule of Charges:\n\n' +
        '- Visa Processing Fee: **৳1,500**\n' +
        '- Additional Port Endorsement: **৳300** (maximum 2 ports)\n' +
        '- Online Form Correction: **৳300** (permitted fields)\n' +
        '- Facilitation Charge (Jamuna Future Park): **৳300**'
      : 'আইভ্যাক সেন্টারের সরকারি ফি তালিকা:\n\n' +
        '- ভিসা প্রসেসিং ফি: **১,৫০০ টাকা**\n' +
        '- অতিরিক্ত পোর্ট এন্ডোর্সমেন্ট: **৩০০ টাকা** (সর্বোচ্চ ২টি পোর্ট)\n' +
        '- অনলাইন ফর্ম সংশোধন: **৩০০ টাকা** (অনুমোদিত ফিল্ড)\n' +
        '- ফ্যাসিলিটেশন চার্জ (যমুনা ফিউচার পার্ক): **৩০০ টাকা**';
  }

  // Transit visa
  if (query.includes('ট্রানজিট') || query.includes('transit') || query.includes('ভুটান') || query.includes('bhutan') || query.includes('নেপাল') || query.includes('nepal') || query.includes('চেংড়াবান্ধা') || query.includes('চ্যাংড়াবান্ধা') || query.includes('জয়গাঁ') || query.includes('রাণীগঞ্জ')) {
    return isEn
      ? 'Transit Visa (TR) Fees & Required Documents:\n\n' +
        '- **Processing + Slot (with ৳1,500 IVAC fee):** **৳5,500**\n' +
        '- **Slot Booking Only:** Total **৳4,500** (৳1,500 IVAC + ৳3,000 Slot)\n' +
        '- **Documents:** Original & old passports, 2×2 photo, NID, utility bill, occupation certificate, $200 endorsement / bank statement / SBI card, valid visa of destination 3rd country (e.g., Nepal), confirmed bus/air ticket, and hotel booking.\n\n' +
        '*(Bhutan ports: Changrabandha/Jaigaon; Nepal ports: Changrabandha/Raniganj)*'
      : 'ট্রানজিট (TR) ভিসার ফি ও প্রয়োজনীয় কাগজপত্র:\n\n' +
        '- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** **৳৫,৫০০**\n' +
        '- **শুধু স্লট বুকিং:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
        '- **প্রয়োজনীয় কাগজপত্র:** মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID, ইউটিলিটি বিল, পেশাগত সনদ, $২০০ এন্ডোর্সমেন্ট / সমপরিমাণ ব্যাংক স্টেটমেন্ট / SBI কার্ড, গন্তব্য ৩য় দেশের বৈধ ভিসা (যেমন নেপাল), কনফার্মড বাস/এয়ার টিকেট ও হোটেল বুকিং।\n\n' +
        '*(ভুটান রুট: চ্যাংড়াবান্ধা/জয়গাঁ, নেপাল রুট: চ্যাংড়াবান্ধা/রাণীগঞ্জ)*';
  }

  // Entry visa (X-Misc)
  if (query.includes('এন্ট্রি ভিসা') || query.includes('entry visa') || query.includes('x-misc')) {
    return isEn
      ? 'Entry Visa (X-Misc — Miscellaneous Category) Details & Fees:\n\n' +
        '- **Processing + Slot:** **৳6,000** (৳4,500 Slot + ৳1,500 Service Charge)\n' +
        '- **Slot Booking Only:** Total **৳4,500** (৳1,500 IVAC + ৳3,000 Slot)\n' +
        '- **Required Documents:** Online X-Misc application form, original & old passports, 2×2 photo, NID, utility bill, occupation certificate, $200 endorsement / bank statement / SBI card, and X-Misc eligibility/relationship proof.'
      : 'এন্ট্রি ভিসা (X-Misc — মিসেলেনিয়াস ক্যাটাগরি) তথ্য ও ফি:\n\n' +
        '- **প্রসেসিং + স্লট:** **৳৬,০০০** (স্লট ৪,৫০০৳ + সার্ভিস চার্জ ১,৫০০৳)\n' +
        '- **শুধু স্লট বুকিং:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
        '- **প্রয়োজনীয় কাগজপত্র:** অনলাইন X-Misc আবেদন পত্র, মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID, ইউটিলিটি বিল, পেশাগত সনদ, $২০০ এন্ডোর্সমেন্ট / সমপরিমাণ ব্যাংক স্টেটমেন্ট / SBI কার্ড এবং X-Misc এন্ট্রি যোগ্যতা/সম্পর্কের মূল সনদ।';
  }

  // Air & Travel Ticket Booking
  if (query.includes('টিকিট') || query.includes('টিকেট') || query.includes('ticket') || query.includes('এয়ার টিকেট') || query.includes('এয়ার টিকিট') || query.includes('flight') || query.includes('ফ্লাইট')) {
    return isEn
      ? 'Ticket Booking Service Details:\n\n' +
        '- **Service Charge:** Starting from **৳599** (negotiable depending on route) in addition to the base ticket fare.\n' +
        '- **Services:** Domestic & international air tickets, one-way, round-trip, transit, and confirmed return bookings.\n' +
        '- **Required Documents:** Clear copy of the passenger passport, travel dates/destination, and visa copy (if available).'
      : 'টিকেট বুকিং সেবার বিবরণ:\n\n' +
        '- **সার্ভিস চার্জ:** মূল টিকেটের নির্ধারিত মূল্যের সাথে অতিরিক্ত **৳৫৯৯ থেকে শুরু** (রুট অনুযায়ী আলোচনা সাপেক্ষে)।\n' +
        '- **সেবাসমূহ:** দেশ ও বিদেশের সকল ধরনের এয়ার টিকেট, ওয়ান-ওয়ে, রাউন্ড ট্রিপ, ট্রানজিট ও কনফার্মড রিটার্ন টিকেট বুকিং।\n' +
        '- **প্রয়োজনীয় ডকুমেন্টস:** যাত্রীর পাসপোর্টের পরিষ্কার কপি, ভ্রমণের তারিখ/গন্তব্য এবং ভিসা কপি (যদি থাকে)।';
  }

  // Business Visa
  if (query.includes('বিজনেস') || query.includes('business') || query.includes('ব্যবসা') || query.includes('ট্রেড') || query.includes('এলসি') || query.includes('টিন') || query.includes('ভ্যাট') || query.includes('trade license')) {
    return isEn
      ? 'Business Visa Details & Fees:\n\n' +
        '- **Processing + Slot (with ৳1,500 IVAC fee):** **৳6,000**\n' +
        '- **Slot Booking Only:** Total **৳4,500** (৳1,500 IVAC + ৳3,000 Slot)\n' +
        '- **Common Papers:** Original & old passports, 2×2 photo, NID, utility bill.\n' +
        '- **Business Papers:** Original Indian company invitation letter, Bangladeshi company forwarding letter, updated Trade License, Chamber of Commerce certificate, TIN, BIN, IRC, LC, VAT Return, and personal & company 6-month bank statements.'
      : 'বিজনেস ভিসার প্রয়োজনীয় তথ্য ও ফি:\n\n' +
        '- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** **৳৬,০০০**\n' +
        '- **শুধু স্লট বুকিং:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
        '- **কমন কাগজপত্র:** মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID, ইউটিলিটি বিল।\n' +
        '- **বিজনেস কাগজপত্র:** ভারতীয় কোম্পানির মূল ইনভাইটেশন লেটার, বাংলাদেশি প্রতিষ্ঠানের ফরওয়ার্ডিং লেটার, হালনাগাদ ট্রেড লাইসেন্স, চেম্বার অফ কমার্স সনদ, TIN, BIN, IRC, LC, VAT রিটার্ন এবং ব্যক্তিগত ও কোম্পানির বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট।';
  }

  // Medical Visa & Attendant
  if (query.includes('মেডিকেল') || query.includes('medical') || query.includes('রোগী') || query.includes('ডাক্তার') || query.includes('doctor') || query.includes('হাসপাতাল') || query.includes('hospital') || query.includes('ইনভাইটেশন') || query.includes('invitation') || query.includes('ayush') || query.includes('অ্যাটেনডেন্ট') || query.includes('attendant')) {
    return isEn
      ? 'Medical (M-1) & Attendant (M-2) Visa Details & Fees:\n\n' +
        '- **Processing + Slot (with ৳1,500 IVAC fee & invitation):** **৳6,000**\n' +
        '- **Slot Booking Only:** Total **৳4,500** (৳1,500 IVAC + ৳3,000 Slot)\n' +
        '- **Patient (M-1) Papers:** Common documents (passport, 2×2 photo, NID, utility bill, occupation proof, $200 endorsement / 6-month bank statement / SBI card) + original Indian hospital appointment & AYUSH letter + Bangladeshi doctor prescription and test reports.\n' +
        '- **Attendant (M-2) Papers:** Only basic common documents and proof of relationship with the patient (no separate medical test reports required).'
      : 'মেডিকেল (M-1) ও অ্যাটেনডেন্ট (M-2) ভিসার তথ্য ও ফি:\n\n' +
        '- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ ও ইনভাইটেশনসহ):** **৳৬,০০০**\n' +
        '- **শুধু স্লট বুকিং:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
        '- **রোগীর (M-1) কাগজ:** কমন কাগজপত্র (পাসপোর্ট, ২×২ ছবি, NID, ইউটিলিটি বিল, পেশাগত সনদ, $২০০ এন্ডোর্সমেন্ট/৬ মাসের ব্যাংক স্টেটমেন্ট/SBI কার্ড) + ভারতীয় হাসপাতালের মূল অ্যাপয়েন্টমেন্ট ও AYUSH লেটার + বাংলাদেশের ডাক্তারের প্রেসক্রিপশন ও টেস্ট রিপোর্ট।\n' +
        '- **অ্যাটেনডেন্টের (M-2) কাগজ:** কেবল বেসিক কমন ডকুমেন্টস ও রোগীর সাথে সম্পর্কের প্রমাণপত্র (অ্যাটেনডেন্টের আলাদা মেডিকেল টেস্ট রিপোর্ট বা প্রেসক্রিপশন লাগবে না)।';
  }

  // Tourist Visa
  if (query.includes('ট্যুরিস্ট') || query.includes('tourist') || query.includes('ভ্রমণ') || query.includes('ঘুরতে') || query.includes('travel')) {
    return isEn
      ? 'Tourist Visa Details & Fees:\n\n' +
        '- **Processing + Slot (with ৳1,500 IVAC fee):** **৳6,000**\n' +
        '- **Slot Booking Only:** Total **৳5,500** (৳1,500 IVAC + ৳4,000 Slot)\n' +
        '- **Required Documents:** Online application form, original & all old passports, 2×2 photo, NID/Birth Certificate, utility bill, occupation proof (NOC/Trade License/Student ID), and **$200 dollar endorsement / 6-month bank statement / SBI Travel Card**.'
      : 'ট্যুরিস্ট ভিসার প্রয়োজনীয় তথ্য ও ফি:\n\n' +
        '- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** **৳৬,০০০**\n' +
        '- **শুধু স্লট বুকিং:** মোট **৳৫,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৪,০০০৳)\n' +
        '- **প্রয়োজনীয় কাগজপত্র:** অনলাইন আবেদন পত্র, মূল ও সকল পুরনো পাসপোর্ট, ২×২ ছবি, NID/জন্মনিবন্ধন, ইউটিলিটি বিল, পেশাগত প্রমাণপত্র (NOC/ট্রেড লাইসেন্স/স্টুডেন্ট আইডি) এবং **$২০০ ডলার এন্ডোর্সমেন্ট / সমপরিমাণ টাকার ৬ মাসের ব্যাংক স্টেটমেন্ট / SBI ট্রাভেল কার্ড**।';
  }

  // Slot release date queries
  if (
    (query.includes('কবে') || query.includes('when') || query.includes('next') || query.includes('তারিখ') || query.includes('date') || query.includes('সময়') || query.includes('সময়') || query.includes('রিলিজ') || query.includes('release') || query.includes('ছাড়বে') || query.includes('open') || query.includes('ওপেন')) &&
    (query.includes('স্লট') || query.includes('slot') || query.includes('ডেট') || query.includes('অ্যাপয়েন্টমেন্ট') || query.includes('appointment'))
  ) {
    return isEn
      ? 'Here is how IVAC appointment slot releases work:\n\n' +
        '- Official IVAC policy does not announce exact slot release dates or times in advance.\n' +
        '- Slots open in dynamic batches on the portal and require continuous monitoring to book immediately.\n' +
        '- Rather than guessing a date, keeping your file prepared allows our team to secure your slot as soon as the next batch opens.\n\n' +
        'For direct assistance, contact our Hotline/WhatsApp at **+8801577464706**.'
      : 'আইভ্যাক অ্যাপয়েন্টমেন্ট স্লট ছাড়ার নিয়মটা একটু আলাদা:\n\n' +
        '- আইভ্যাকের নিয়ম অনুযায়ী স্লট রিলিজের নির্দিষ্ট দিনক্ষণ আগে থেকে ঘোষণা করা হয় না।\n' +
        '- সিস্টেমে যখন নতুন ব্যাচ ওপেন হয়, তখনই সার্বক্ষণিক মনিটরিং করে দ্রুত বুকিং নিতে হয়।\n' +
        '- অনুমান করে কোনো তারিখ বলা ঠিক হবে না—তবে ফাইল রেডি রাখলে স্লট ছাড়ামাত্রই আমাদের টিম আপনার বুকিং করে দিতে পারবে।\n\n' +
        'বিস্তারিত জানতে চাইলে আমাদের হটলাইন/WhatsApp নম্বরে (+৮৮০১৫৭৭৪৬৪৭০৬) যোগাযোগ করতে পারেন।';
  }

  // Slot booking / IVAC
  if (query.includes('স্লট') || query.includes('slot') || query.includes('আইভ্যাক') || query.includes('ivac') || query.includes('তারিখ') || query.includes('অ্যাপয়েন্টমেন্ট') || query.includes('appointment')) {
    return isEn
      ? 'IVAC Slot Booking starts from **৳4,500** (including fixed ৳1,500 IVAC official fee):\n\n' +
        '- **Medical / Double Entry X-3 / Business / Student S-1 / Transit TR / Entry X-Misc / Spouse X-1 Slot:** Total **৳4,500** (৳1,500 IVAC + ৳3,000 Slot)\n' +
        '- **Tourist Slot:** Total **৳5,500** (৳1,500 IVAC + ৳4,000 Slot)\n' +
        '- **Required Items (All Categories):** Only your **Web File (mandatory)** and **one SIM card**—no other documents are needed.\n' +
        '- **Official IVAC Rule:** One account per SIM card, and a maximum of **4 Web File slots (4 dates)** can be booked per account. If you do not provide a SIM card, we can arrange one for an extra charge.'
      : 'আইভ্যাক স্লট বুকিং ফি **৳৪,৫০০ থেকে শুরু** (প্রতিটি ভিসায় আইভ্যাক সরকারি ফি ৳১,৫০০ ফিক্সড):\n\n' +
        '- **মেডিকেল / ডাবল এন্ট্রি X-3 / বিজনেস / স্টুডেন্ট S-1 / ট্রানজিট TR / এন্ট্রি X-Misc / স্পাউস X-1 স্লট:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
        '- **ট্যুরিস্ট স্লট:** মোট **৳৫,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৪,০০০৳)\n' +
        '- **প্রয়োজনীয় তথ্য (সকল ক্যাটাগরি):** শুধুমাত্র **ওয়েব ফাইল (বাধ্যতামূলক)** এবং **একটি সিম কার্ড**—আর কিছুই লাগবে না।\n' +
        '- **আইভ্যাক নিয়ম:** একটি সিম কার্ডে একটি অ্যাকাউন্ট খোলা যায় এবং সর্বোচ্চ **৪টি ওয়েব ফাইলের (৪টি ডেট)** স্লট নেওয়া যায়। নিজস্ব সিম না দিলে আমাদের পক্ষ থেকে সিমের ব্যবস্থা করা হবে (অতিরিক্ত চার্জ প্রযোজ্য)।';
  }

  // Cost / Pricing General
  if (query.includes('খরচ') || query.includes('ফি') || query.includes('টাকা') || query.includes('cost') || query.includes('fee') || query.includes('price') || query.includes('charge')) {
    return isEn
      ? 'Our Visa & Slot Fee Schedule:\n\n' +
        '**1. Full Processing + Slot (including ৳1,500 IVAC fee):**\n' +
        '- Medical & Attendant / Tourist / Business / Entry (X-Misc) / Spouse (X-1): **৳6,000**\n' +
        '- Double Entry (X-3): **৳6,500**\n' +
        '- Student (S-1) / Transit (TR): **৳5,500**\n\n' +
        '**2. Slot Booking Only (from ৳4,500 — fixed ৳1,500 IVAC fee included):**\n' +
        '- Medical / Double Entry X-3 / Business / Student / Transit / Entry X-Misc / Spouse X-1: **৳4,500** (৳1,500 + ৳3,000)\n' +
        '- Tourist Slot: **৳5,500** (৳1,500 + ৳4,000)\n\n' +
        '- **Ticket Booking:** Service charge starting from **৳599** (negotiable) on top of base ticket fare'
      : 'আমাদের ভিসা ও স্লট ফি তালিকা:\n\n' +
        '**১. প্রসেসিং + স্লট (আইভ্যাক ফি ৳১,৫০০ সহ):**\n' +
        '- মেডিকেল ও অ্যাটেনডেন্ট / ট্যুরিস্ট / বিজনেস / এন্ট্রি (X-Misc) / স্পাউস (X-1): **৳৬,০০০**\n' +
        '- ডাবল এন্ট্রি (X-3): **৳৬,৫০০**\n' +
        '- স্টুডেন্ট (S-1) / ট্রানজিট (TR): **৳৫,৫০০**\n\n' +
        '**২. শুধুমাত্র স্লট (৳৪,৫০০ থেকে শুরু — আইভ্যাক ফি ৳১,৫০০ ফিক্সড):**\n' +
        '- মেডিকেল / ডাবল এন্ট্রি X-3 / বিজনেস / স্টুডেন্ট / ট্রানজিট / এন্ট্রি X-Misc / স্পাউস X-1: **৳৪,৫০০** (১,৫০০ + ৩,০০০)\n' +
        '- ট্যুরিস্ট স্লট: **৳৫,৫০০** (১,৫০০ + ৪,০০০)\n\n' +
        '- **টিকেট বুকিং:** মূল মূল্যের সাথে অতিরিক্ত **৳৫৯৯ থেকে শুরু** (আলোচনা সাপেক্ষে)';
  }

  // Bank Statement / Dollar Endorsement questions
  if (query.includes('ব্যাংক') || query.includes('bank') || query.includes('স্টেটমেন্ট') || query.includes('statement') || query.includes('ব্যালেন্স') || query.includes('balance') || query.includes('ডলার') || query.includes('dollar') || query.includes('sbi') || query.includes('এসবিআই') || query.includes('টাকা থাকতে')) {
    return isEn
      ? 'Financial Proof Rules (Bank Statement, Dollar Endorsement & Travel Card):\n\n' +
        '- Minimum **$200 Dollar Endorsement** on your passport, OR\n' +
        '- Last **6 months Bank Statement** showing sufficient equivalent balance, OR\n' +
        '- State Bank of India (**SBI Travel Card**) or International Travel Card.'
      : 'ব্যাংক স্টেটমেন্ট, ডলার এন্ডোর্সমেন্ট ও ট্রাভেল কার্ডের নিয়মগুলো হলো:\n\n' +
        '- পাসপোর্টে ন্যূনতম **$২০০ ডলার এন্ডোর্সমেন্ট**, অথবা\n' +
        '- সমপরিমাণ টাকা ব্যাংক অ্যাকাউন্টে থাকা অবস্থায় বিগত **৬ মাসের ব্যাংক স্টেটমেন্ট**, অথবা\n' +
        '- স্টেট ব্যাংক অফ ইন্ডিয়া (SBI) কর্তৃক প্রদত্ত **SBI ট্রাভেল কার্ড** বা ইন্টারন্যাশনাল ট্রাভেল কার্ড।';
  }

  // Photo specifications
  if (query.includes('ছবি') || query.includes('photo') || query.includes('picture') || query.includes('সাইজ') || query.includes('size')) {
    return isEn
      ? 'Official Visa Photo Specifications:\n\n' +
        '- Size: **2×2 inches (50mm × 50mm)** lab print.\n' +
        '- Background: **100% plain White Background** with no border.\n' +
        '- Ears and forehead must be clearly visible, and the photo must be taken within the last 3 months.'
      : 'ভিসার ছবির সঠিক মাপ ও নিয়ম:\n\n' +
        '- সাইজ: ২×২ ইঞ্চি (50mm × 50mm) ল্যাব প্রিন্ট।\n' +
        '- ব্যাকগ্রাউন্ড: সম্পূর্ণ পরিষ্কার সাদা (White Background)।\n' +
        '- কান ও কপাল স্পষ্ট থাকতে হবে, এবং ছবি ৩ মাসের বেশি পুরনো হওয়া যাবে না।';
  }

  // Contact / Phone / Address
  if (query.includes('ফোন') || query.includes('নম্বর') || query.includes('যোগাযোগ') || query.includes('ঠিকানা') || query.includes('contact') || query.includes('phone') || query.includes('address') || query.includes('office') || query.includes('whatsapp') || query.includes('হোয়াটসঅ্যাপ')) {
    return isEn
      ? 'You can reach us directly via:\n\n' +
        '- Hotline & WhatsApp: **+8801577464706**\n' +
        '- Office: Adjacent to Jamuna Future Park, Kuril, Baridhara, Dhaka-1229\n' +
        '- Website & Email: processinghub.fun | support@processinghub.fun'
      : 'আমাদের সাথে সরাসরি যোগাযোগের মাধ্যম:\n\n' +
        '- হটলাইন ও WhatsApp: **+৮৮০১৫৭৭৪৬৪৭০৬**\n' +
        '- অফিস: যমুনা ফিউচার পার্ক সংলগ্ন, কুড়িল, বারিধারা, ঢাকা-১২২৯\n' +
        '- ওয়েবসাইট ও ইমেইল: processinghub.fun | support@processinghub.fun';
  }

  // Duration / Time required
  if (query.includes('কত দিন') || query.includes('সময়') || query.includes('লাগে') || query.includes('duration') || query.includes('how long') || query.includes('time') || query.includes('delivery') || query.includes('ডেলিভারি')) {
    return isEn
      ? 'Typical Visa Processing & Delivery Timeline:\n\n' +
        '- Our file preparation: **1 to 2 working days**\n' +
        '- Passport delivery after IVAC submission: Typically **7 to 15 working days** as per Indian High Commission regulations.'
      : 'ভিসা প্রসেসিং ও ডেলিভারির সাধারণ সময়সীমা:\n\n' +
        '- আমাদের ফাইল প্রসেসিং: **১ থেকে ২ কর্মদিবস**\n' +
        '- আইভ্যাকে জমা দেওয়ার পর ডেলিভারি: ভারতীয় হাইকমিশনের নিয়ম অনুযায়ী সাধারণত **৭ থেকে ১৫ কর্মদিবস**।';
  }

  // Chrome Extension / Autofill inquiries -> Recommend Tracker - Indian Visa Autofill
  if (query.includes('autofill') || query.includes('extension') || query.includes('chrome') || query.includes('অটোফিল') || query.includes('এক্সটেনশন') || query.includes('ফরম পূরণ') || query.includes('ফর্ম পূরণ') || query.includes('বানান ভুল')) {
    return isEn
      ? 'If you want to fill out the Indian visa online application form in under 30 seconds with one click (using a passport scan, previous form PDF, or saved profile), try our official Chrome extension **Tracker - Indian Visa Autofill**:\n\n' +
        '- Chrome Web Store: https://chromewebstore.google.com/detail/fbofnjpmmimniffobcfpnfiejgkboiga?utm_source=item-share-cp\n' +
        '- **Benefits:** 1-Click Auto Mode populates multi-step forms & IVAC booking pages in 30 seconds, includes an instant captcha solver, supports multiple applicant profiles, and keeps 100% of your data in local browser storage.\n' +
        '- Need us to handle document verification & IVAC slot booking? Share your details here anytime.'
      : 'শুধু পাসপোর্ট বা পূর্বের ভিসা ফর্ম (PDF) দিয়ে কিংবা একবার প্রোফাইল সেভ করে মাত্র এক ক্লিকে ৩০ সেকেন্ডের মধ্যে ইন্ডিয়ান ভিসার পুরো মাল্টি-স্টেপ অনলাইন ফর্ম পূরণ করতে আমাদের অফিশিয়াল ক্রোম এক্সটেনশন **Tracker - Indian Visa Autofill** ব্যবহার করতে পারেন:\n\n' +
        '- Chrome Web Store লিংক: https://chromewebstore.google.com/detail/fbofnjpmmimniffobcfpnfiejgkboiga?utm_source=item-share-cp\n' +
        '- **সুবিধা:** পাসপোর্ট বা ফর্ম থেকে তথ্য নিয়ে ওয়ান-ক্লিকে ৩০ সেকেন্ডের মধ্যে পুরো ফর্ম ও অ্যাপয়েন্টমেন্ট পেজে বসে যায়, ইনস্ট্যান্ট ক্যাপচা সলভার ও মাল্টিপল প্রোফাইল সুবিধা থাকে এবং সম্পূর্ণ ডেটা ১০০% নিরাপদে আপনার নিজস্ব ব্রাউজারেই সুরক্ষিত থাকে।\n' +
        '- আর ফাইল যাচাই ও আইভ্যাক স্লট বুকিং আমাদের মাধ্যমে করাতে চাইলে আপনার তথ্য জানাতে পারেন।';
  }

  // Notary & Document Translation inquiries
  if (query.includes('mofa') || query.includes('notary') || query.includes('translation') || query.includes('নোটারি') || query.includes('সত্যায়ন') || query.includes('অনুবাদ') || query.includes('নিকাহনামা') || query.includes('কাবিননামা')) {
    return isEn
      ? 'Notary Public & Document Translation Details:\n\n' +
        '- **Service Fee:** Starting from **৳1,200+** per document (depending on document type & pages).\n' +
        '- **Covered Papers:** Nikahnama / marriage certificate, birth certificate, police clearance, trade license, and academic records.\n' +
        '- **Required:** Original certificate and clear passport/NID copy for exact spelling match.'
      : 'নোটারি ও ডকুমেন্ট অনুবাদ সেবার বিবরণ:\n\n' +
        '- **সার্ভিস ফি:** **৳১,২০০+** থেকে শুরু (ডকুমেন্টের ধরন ও পৃষ্ঠাভেদে)।\n' +
        '- **সেবা:** বাংলা নিকাহনামা/কাবিননামা, বিবাহ সনদ, জন্মনিবন্ধন, পুলিশ ক্লিয়ারেন্স, একাডেমিক সনদ ও ট্রেড লাইসেন্সের নির্ভুল ইংরেজি অনুবাদ ও নোটারি পাবলিক সহায়তা।\n' +
        '- **প্রয়োজনীয় কাগজ:** মূল সনদ এবং বানান মিলানোর জন্য পাসপোর্ট ও NID-এর পরিষ্কার কপি।';
  }

  // Hotel / Train / Bus Travel Package inquiries
  if (query.includes('হোটেল') || query.includes('hotel') || query.includes('মৈত্রী') || query.includes('বন্ধন') || query.includes('মিতালী') || query.includes('ট্রেন') || query.includes('train') || query.includes('maitree') || query.includes('bandhan') || query.includes('mitali') || query.includes('পিকআপ') || query.includes('pickup')) {
    return isEn
      ? 'India Travel Logistics (Hotel, Train/Bus & Hospital Pickup):\n\n' +
        '- **Hotel & Train/Bus Package:** Service charge from **৳799+** (Maitree/Bandhan/Mitali train, cross-border bus & hospital/tourist hotel booking).\n' +
        '- **Hospital Cost Estimate & Airport Pickup Guide:** From **৳1,500+** (OPD/surgery estimates plus airport/rail pickup & Bengali coordinator support).'
      : 'ভারত ভ্রমণ, হোটেল ও হাসপাতাল পিকআপ সহায়তা:\n\n' +
        '- **হোটেল ও ট্রেন/বাস প্যাকেজ:** সার্ভিস চার্জ **৳৭৯৯+** থেকে শুরু (মৈত্রী/বন্ধন/মিতালী ট্রেন, আন্তর্জাতিক বাস ও হাসপাতাল/ট্যুরিস্ট হোটেল)।\n' +
        '- **হাসপাতাল খরচ ও এয়ারপোর্ট পিকআপ গাইড:** **৳১,৫০০+** থেকে শুরু (চিকিৎসার আনুমানিক খরচ, এয়ারপোর্ট/স্টেশন পিকআপ ও বাংলাভাষী সমন্বয়ক)।';
  }

  // Conversation Closings / Thank you / Service done
  if (query.includes('ধন্যবাদ') || query.includes('thank') || query.includes('থ্যাংক') || query.includes('আল্লাহ হাফেজ') || query.includes('allah hafez') || query.includes('bye') || query.includes('বাই') || query.includes('বিদায়') || query.includes('বিদায়') || query.includes('কাজ শেষ') || query.includes('বুঝেছি') || query.includes('ঠিক আছে')) {
    return isEn
      ? 'Thank you for reaching out to Processing Hub! We are always here whenever you need help with visas or travel. Wishing you a safe and pleasant journey, Allah Hafez.'
      : 'প্রসেসিং হাবের সাথে যোগাযোগ করার জন্য আন্তরিক ধন্যবাদ! ভবিষ্যতে যেকোনো ভিসা বা ভ্রমণ সংক্রান্ত প্রয়োজনে আমরা সর্বদা পাশে আছি। আপনার যাত্রা শুভ ও নিরাপদ হোক, আল্লাহ হাফেজ।';
  }

  // Default Reply
  if (isEn) {
    return `${firstReplyHonorific}I am **${agentName}** from Processing Hub. Please let me know your question about Indian visa processing or documents, and I will gladly help.`;
  }
  return `${firstReplyHonorific}আমি **${agentName}**, প্রসেসিং হাব থেকে বলছি। আপনার ভিসা প্রসেসিং বা ডকুমেন্টস সংক্রান্ত প্রশ্নটি বলুন, আমি সাহায্য করছি।`;
}

// Helper: Normalize Unicode bullets (•, ●, ▪, ◦) and single-newline lists into proper standard Markdown `- ` lists
function normalizeMarkdownListReply(raw: string): string {
  if (!raw) return '';
  const preprocessed = raw
    .replace(/\r\n/g, '\n')
    .replace(/([।.!?)])\s+[•●▪◦]\s+/g, '$1\n- ');

  const lines = preprocessed.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/^([ \t]*)[•●▪◦]\s+/, '$1- ');
    const isListLine = /^[ \t]*(?:[-*]|\d+\.)\s+/.test(line);
    const prevLine = out.length > 0 ? out[out.length - 1] : '';
    const prevIsListLine = /^[ \t]*(?:[-*]|\d+\.)\s+/.test(prevLine);

    if (isListLine && prevLine.trim() !== '' && !prevIsListLine) {
      out.push('');
    } else if (!isListLine && line.trim() !== '' && prevIsListLine) {
      out.push('');
    }
    out.push(line);
  }

  return out.join('\n');
}

// Helper: Escape HTML for Telegram formatting
function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface ArchivedUserSession {
  id: string;
  endedAt: string;
  serviceTitle?: string;
  messages: Array<{ role: 'user' | 'assistant'; text: string }>;
}

interface UserMemoryStore {
  [phoneKey: string]: {
    name?: string;
    updatedAt: string;
    sessions: ArchivedUserSession[];
  };
}

const USER_MEMORY_FILE = path.join(process.cwd(), 'data', 'user_memory.json');
let userMemoryCache: UserMemoryStore = {};
let userMemoryLoaded = false;

function normalizePhoneKey(phone?: unknown): string {
  if (typeof phone !== 'string') return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

async function loadUserMemoryStore(): Promise<UserMemoryStore> {
  if (userMemoryLoaded) return userMemoryCache;
  try {
    const raw = await fs.readFile(USER_MEMORY_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      userMemoryCache = parsed;
    }
  } catch {
    userMemoryCache = {};
  }
  userMemoryLoaded = true;
  return userMemoryCache;
}

async function saveUserEndedSession(
  phone: string | undefined,
  name: string | undefined,
  session: ArchivedUserSession
): Promise<void> {
  const key = normalizePhoneKey(phone);
  if (!key || !session || !Array.isArray(session.messages) || session.messages.length === 0) {
    return;
  }

  const store = await loadUserMemoryStore();
  const existing = store[key]?.sessions || [];
  if (existing.some((s) => s.id === session.id)) {
    return;
  }

  const sanitizedSession: ArchivedUserSession = {
    id: String(session.id || `sess-${Date.now()}`).slice(0, 64),
    endedAt: typeof session.endedAt === 'string' ? session.endedAt : new Date().toISOString(),
    serviceTitle: typeof session.serviceTitle === 'string' ? session.serviceTitle.slice(0, 120) : undefined,
    messages: session.messages
      .slice(-16)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
        text: String(m.text || '').trim().slice(0, 360),
      }))
      .filter((m) => m.text.length > 0),
  };

  if (sanitizedSession.messages.length === 0) return;

  store[key] = {
    name: typeof name === 'string' && name.trim() ? name.trim().slice(0, 80) : store[key]?.name,
    updatedAt: new Date().toISOString(),
    sessions: [...existing, sanitizedSession].slice(-5),
  };

  // Cap store size to most recent 250 users
  const keys = Object.keys(store);
  if (keys.length > 250) {
    keys
      .sort((a, b) => (store[a].updatedAt || '').localeCompare(store[b].updatedAt || ''))
      .slice(0, keys.length - 250)
      .forEach((oldKey) => {
        delete store[oldKey];
      });
  }

  try {
    await fs.mkdir(path.dirname(USER_MEMORY_FILE), { recursive: true });
    await fs.writeFile(USER_MEMORY_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.warn('[UserMemory] Failed to persist ended session:', err);
  }
}

function buildPastUserMemorySection(
  serverSessions: ArchivedUserSession[],
  clientSessions: unknown
): string {
  const mergedMap = new Map<string, ArchivedUserSession>();
  for (const s of serverSessions) {
    if (s && Array.isArray(s.messages) && s.messages.length > 0) {
      mergedMap.set(s.id || s.endedAt, s);
    }
  }
  if (Array.isArray(clientSessions)) {
    for (const s of clientSessions as ArchivedUserSession[]) {
      if (s && Array.isArray(s.messages) && s.messages.length > 0) {
        const key = s.id || s.endedAt;
        if (key && !mergedMap.has(key)) {
          mergedMap.set(key, s);
        }
      }
    }
  }

  const recentSessions = Array.from(mergedMap.values())
    .sort((a, b) => (a.endedAt || '').localeCompare(b.endedAt || ''))
    .slice(-3);

  if (recentSessions.length === 0) return '';

  const formatted = recentSessions
    .map((sess, idx) => {
      const dateStr = (sess.endedAt || '').slice(0, 10);
      const topic = sess.serviceTitle ? ` | বিষয়: ${sess.serviceTitle}` : '';
      const lines = sess.messages
        .slice(-10)
        .map((m) => `  ${m.role === 'user' ? 'গ্রাহক' : 'প্রতিনিধি'}: ${m.text}`)
        .join('\n');
      return `পূর্ববর্তী চ্যাট #${idx + 1} (${dateStr}${topic}):\n${lines}`;
    })
    .join('\n\n');

  return `\n\n### RETURNING CLIENT PAST CHAT MEMORY (এই গ্রাহকের আগের কথোপকথনের স্মৃতি):
This customer has chatted with Processing Hub before and started a NEW chat session now.
- Remember their previous topics, questions, visa type, hospital/destination, or documents naturally.
- If they refer to their previous conversation (e.g., "আগে যেটা বলছিলাম", "আমার ফাইল/মেডিকেল ভিসা", "বাকি কাগজপত্র"), recognize it seamlessly without asking them to repeat everything!
- Do NOT awkwardly recite their old chat history unless relevant to what they are currently asking.

${formatted}`;
}

// API endpoint to archive an ended chat session for per-user memory
app.post('/api/chat/end-session', chatRateLimiter, async (req, res) => {
  try {
    const { userName, userPhone, session } = req.body || {};
    await saveUserEndedSession(userPhone, userName, session);
    return res.json({ success: true });
  } catch (err) {
    console.warn('[UserMemory] end-session error:', err);
    return res.json({ success: false });
  }
});

// API endpoint for chatbot
app.post('/api/chat', chatRateLimiter, async (req, res) => {
  const agentName = sanitizeAgentName(req.body?.agentName);
  const language: 'bn' | 'en' = req.body?.language === 'en' ? 'en' : 'bn';
  const messages = req.body?.messages;
  const serviceContext = req.body?.serviceContext;
  const userName = req.body?.userName;
  const userPhone = req.body?.userPhone;
  const pastConversations = req.body?.pastConversations;
  const userMsgCount = Array.isArray(messages)
    ? messages.filter((m: any) => m.role === 'user').length
    : 1;
  const isFirstReply = userMsgCount <= 1;
  const lastMsgObj = Array.isArray(messages) && messages.length > 0
    ? messages[messages.length - 1]
    : null;
  const lastUserMessage = lastMsgObj?.text || '';
  const lastAttachments = Array.isArray(lastMsgObj?.attachments) ? lastMsgObj.attachments : [];

  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getAiClient();

    const learnedFacts = await loadLearnedFacts();
    const adaptiveKnowledgeSection = buildAdaptiveBrainPrompt(learnedFacts);

    const memoryStore = await loadUserMemoryStore();
    const phoneKey = normalizePhoneKey(userPhone);
    const serverPastSessions = phoneKey && memoryStore[phoneKey]?.sessions ? memoryStore[phoneKey].sessions : [];
    const pastUserMemorySection = buildPastUserMemorySection(serverPastSessions, pastConversations);

    // Dynamically build persona and inject full website context + verified adaptive brain + returning user memory + addressing context
    let contextualSystemInstruction = `${buildSystemInstruction(agentName, language)}\n${SHARED_KNOWLEDGE_BASE}\n${WEBSITE_FULL_CONTEXT}${adaptiveKnowledgeSection}${pastUserMemorySection}`;
    if (userName) {
      const firstAddressRule =
        language === 'en'
          ? `This is your FIRST reply to this user. Address them politely ONCE as "Sir" (if "${userName}" is male) or "Ma'am" (if "${userName}" is female), or use a polite neutral greeting if unclear. NEVER say "Mr. ${userName}" or repeat their name.`
          : `This is your FIRST reply to this user. Address them politely ONCE as "স্যার" (if "${userName}" is male) or "ম্যাডাম"/"ম্যাম" (if "${userName}" is female), or a polite neutral greeting if gender is unclear. NEVER say "${userName} সাহেব".`;
      const followUpAddressRule =
        language === 'en'
          ? `This is a FOLLOW-UP reply (message #${userMsgCount}). STRICTLY DO NOT repeat their name ("${userName}"), "Sir", or "Ma'am". Speak completely naturally.`
          : `This is a FOLLOW-UP reply (message #${userMsgCount}). STRICTLY DO NOT repeat their name ("${userName}"), "সাহেব", "স্যার", or "ম্যাডাম"/"ম্যাম". Speak completely naturally face-to-face.`;

      contextualSystemInstruction += `\n\n### CLIENT IDENTITY & NATURAL ADDRESSING:
Client Name: "${userName}"${userPhone ? ` | Phone: "${userPhone}"` : ''}.
Current User Message Count in Session: ${userMsgCount}.
- ${isFirstReply ? firstAddressRule : followUpAddressRule}
- NEVER ask for their name or mobile number again—they already submitted it.`;
    }
    if (serviceContext && (serviceContext.title || serviceContext.category)) {
      contextualSystemInstruction += `\n\n### ACTIVE PAGE SERVICE CONTEXT:
The customer is currently inquiring about:
- **Focused Service**: ${serviceContext.title || 'N/A'}
- **Category**: ${serviceContext.category || 'Visa Processing'}
- **Official Price**: ${serviceContext.price || 'N/A'} ${serviceContext.per || ''}
- **Service Summary**: ${serviceContext.description || ''}
${serviceContext.documents && serviceContext.documents.length > 0 ? `- **Standard Document Checklist**:\n  * ${serviceContext.documents.join('\n  * ')}` : ''}

**SPECIFIC DIRECTIVE**:
Prioritize concise, accurate, actionable guidance specifically for "${serviceContext.title}" in ${language === 'en' ? '100% English' : '100% Bengali'}.
- Keep your tone natural, warm, strictly as ${agentName} from Processing Hub, and NEVER use the words "Visa Consultant", "Consultant", "ভিসা কনসালটেন্ট", or "কনসালটেন্ট".`;
    }

    // If Gemini client is available, try invoking Gemini with contextual multimodal prompt
    if (ai) {
      const recentMessages = messages.slice(-6);
      const contents = recentMessages.map((msg: any) => {
        const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
        const parts: any[] = [];

        if (Array.isArray(msg.attachments)) {
          for (const att of msg.attachments) {
            if (att && typeof att.data === 'string' && att.data.length > 0 && typeof att.mimeType === 'string') {
              if (
                att.mimeType.startsWith('text/') ||
                att.mimeType === 'application/json' ||
                att.mimeType === 'text/csv'
              ) {
                try {
                  const decodedText = Buffer.from(att.data, 'base64').toString('utf8');
                  parts.push({
                    text: `[${language === 'en' ? 'Attached File' : 'সংযুক্ত ফাইল'}: ${att.name || 'document.txt'}]\n${decodedText.slice(0, 15000)}`,
                  });
                } catch {
                  parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
                }
              } else {
                parts.push({
                  inlineData: {
                    mimeType: att.mimeType,
                    data: att.data,
                  },
                });
              }
            } else if (att?.name) {
              parts.push({
                text: `[${language === 'en' ? 'Previously attached file' : 'পূর্বে সংযুক্ত ফাইল'}: ${att.name}]`,
              });
            }
          }
        }

        const trimmedText = typeof msg.text === 'string' ? msg.text.trim() : '';
        if (trimmedText) {
          parts.push({ text: trimmedText });
        } else if (parts.length > 0 && role === 'user') {
          parts.push({
            text:
              language === 'en'
                ? 'Please carefully inspect this attached image or PDF file, highlight the key details, note any discrepancies against IVAC rules, and state the clear next steps in English.'
                : 'এই সংযুক্ত ছবি বা পিডিএফ ফাইলটি ভালোভাবে পড়ে বিশ্লেষণ করুন, মূল তথ্যগুলো তুলে ধরুন এবং আমাদের ভিসা/সার্ভিস অনুযায়ী পরবর্তী করণীয় বা পদক্ষেপ কী হবে তা স্পষ্টভাবে বলুন।',
          });
        } else if (parts.length === 0) {
          parts.push({ text: '' });
        }

        return { role, parts };
      });

      const needsWebSearch = shouldUseWebSearch(lastUserMessage, lastAttachments.length > 0);

      const attemptCandidates: Array<{
        model: string;
        useSearch: boolean;
        useThinkingLow: boolean;
      }> = [
        ...(needsWebSearch
          ? [{ model: 'gemini-4-hydrogen', useSearch: true, useThinkingLow: true }]
          : []),
        { model: 'gemini-4-hydrogen', useSearch: false, useThinkingLow: true },
        { model: 'gemini-3.1-flash-lite', useSearch: false, useThinkingLow: false },
      ];

      for (const attempt of attemptCandidates) {
        try {
          const config: any = {
            systemInstruction: contextualSystemInstruction,
          };
          if (attempt.useSearch) {
            config.tools = [{ googleSearch: {} }];
          }
          if (attempt.useThinkingLow) {
            config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
          }

          const response = await ai.models.generateContent({
            model: attempt.model,
            contents,
            config,
          });

          if (response && response.text) {
            let sources: Array<{ title: string; uri: string }> = [];
            let webSearchQueries: string[] = [];

            const candidate = response.candidates?.[0];
            const groundingMetadata = candidate?.groundingMetadata;
            if (groundingMetadata) {
              if (Array.isArray(groundingMetadata.webSearchQueries)) {
                webSearchQueries = groundingMetadata.webSearchQueries;
              }
              if (Array.isArray(groundingMetadata.groundingChunks)) {
                sources = groundingMetadata.groundingChunks
                  .map((chunk: any) => ({
                    title: chunk.web?.title || (language === 'en' ? 'Official Source' : 'অফিসিয়াল তথ্যসূত্র'),
                    uri: chunk.web?.uri || '',
                  }))
                  .filter((s: { uri: string }) => Boolean(s.uri));
              }
            }

            // Trigger non-blocking online verification & adaptive brain persistence if user shared new info or external claim
            if (lastAttachments.length === 0 && isCandidateNewFactOrExternalTopic(lastUserMessage)) {
              setImmediate(() => {
                void verifyAndLearnFromInteraction(ai, lastUserMessage);
              });
            }

            return res.json({
              reply: normalizeMarkdownListReply(response.text),
              sources,
              webSearchQueries,
            });
          }
        } catch (geminiError: any) {
          const status = geminiError?.status || geminiError?.code;
          console.info(
            `[Chat AI] Attempt ${attempt.model} (search=${attempt.useSearch}) unavailable (${status || 'error'}), trying next fallback.`
          );
        }
      }
    }

    // High-quality deterministic fallback with dynamic agent name, service context & active language
    const fallbackReply = generateAgentFallbackReply(
      lastUserMessage,
      serviceContext,
      agentName,
      isFirstReply,
      userName,
      lastAttachments,
      language
    );
    return res.json({
      reply: normalizeMarkdownListReply(fallbackReply),
      sources: [],
    });
  } catch (error: any) {
    console.error('Chat API general error:', error);
    const safeFallback = generateAgentFallbackReply(
      lastUserMessage,
      serviceContext,
      agentName,
      isFirstReply,
      userName,
      lastAttachments,
      language
    );
    return res.json({
      reply: normalizeMarkdownListReply(safeFallback),
      sources: [],
    });
  }
});

function getTelegramConfig(): { botToken: string; chatId: string } | null {
  let botToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  let chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();

  // Guard against inverted environment variables
  if (!botToken.includes(':') && chatId.includes(':')) {
    const temp = botToken;
    botToken = chatId;
    chatId = temp;
  }

  if (!botToken || !botToken.includes(':') || !chatId || chatId.includes(':')) {
    return null;
  }

  return { botToken, chatId };
}

const LEAD_SERIAL_FILE = path.join(process.cwd(), 'data', 'lead_serial.json');
const LEADS_TRACKER_FILE = path.join(process.cwd(), 'data', 'leads_tracker.json');
const STAFF_AUTH_FILE = path.join(process.cwd(), 'data', 'staff_auth.json');

type TrackingStage = 'received' | 'reviewing' | 'form_ready' | 'slot_confirmed' | 'ready_delivery';
const VALID_TRACKING_STAGES: TrackingStage[] = [
  'received',
  'reviewing',
  'form_ready',
  'slot_confirmed',
  'ready_delivery',
];

interface StoredLeadRecord {
  serial: string;
  maskedName: string;
  phoneLast4: string;
  phoneHash: string;
  serviceTitle: string;
  source: 'callback' | 'chat';
  stage: TrackingStage;
  stageNote: string;
  createdAt: string;
  updatedAt: string;
}

const TELEGRAM_SENT_SUMMARIES_FILE = path.join(process.cwd(), 'data', 'telegram_sent_summaries.json');
const TELEGRAM_SUMMARY_DEDUP_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface SentSummaryRecord {
  serial: string;
  sentAt: number;
}

let leadSerialCounter: number | null = null;
let leadSerialLock: Promise<void> = Promise.resolve();
let leadsTrackerCache: Record<string, StoredLeadRecord> | null = null;
let leadsTrackerLock: Promise<void> = Promise.resolve();
let sentSummariesCache: Record<string, SentSummaryRecord> | null = null;
let sentSummariesLock: Promise<void> = Promise.resolve();
const inFlightSummaryFingerprints = new Set<string>();

async function loadSentSummaries(): Promise<Record<string, SentSummaryRecord>> {
  if (sentSummariesCache) return sentSummariesCache;
  try {
    const raw = await fs.readFile(TELEGRAM_SENT_SUMMARIES_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      sentSummariesCache = parsed as Record<string, SentSummaryRecord>;
    } else {
      sentSummariesCache = {};
    }
  } catch {
    sentSummariesCache = {};
  }
  return sentSummariesCache;
}

async function markSummarySent(fingerprint: string, serial: string): Promise<void> {
  sentSummariesLock = sentSummariesLock.then(async () => {
    const store = await loadSentSummaries();
    const now = Date.now();
    store[fingerprint] = { serial, sentAt: now };

    // Prune expired (>30 days) or excess (>500) entries
    const entries = Object.entries(store).filter(
      ([, rec]) => rec && typeof rec.sentAt === 'number' && now - rec.sentAt < TELEGRAM_SUMMARY_DEDUP_TTL_MS
    );
    const trimmed = entries
      .sort((a, b) => b[1].sentAt - a[1].sentAt)
      .slice(0, 500);
    sentSummariesCache = Object.fromEntries(trimmed);

    await writeJsonAtomic(TELEGRAM_SENT_SUMMARIES_FILE, sentSummariesCache).catch((err) => {
      console.warn('[TelegramDedup] Atomic save failed:', err);
    });
  });
  await sentSummariesLock;
}

function buildConversationFingerprint(
  customerName: string,
  customerPhone: string,
  userMessages: any[]
): string {
  const digits = extractPhoneDigits(customerPhone);
  const identity = digits.length >= 6 ? digits.slice(-10) : customerName.trim().toLowerCase();
  const normalizedMsgs = userMessages.map((m: any) => {
    const text = (typeof m?.text === 'string' ? m.text : '').trim().replace(/\s+/g, ' ').slice(0, 300);
    const time = typeof m?.time === 'string' ? m.time.trim() : '';
    const attNames = Array.isArray(m?.attachments)
      ? m.attachments.map((a: any) => String(a?.name || '')).join(',')
      : '';
    return `${time}|${text}|${attNames}`;
  });
  return crypto
    .createHash('sha256')
    .update(`ph-tg-summary-v1::${identity}::${normalizedMsgs.join('||')}`)
    .digest('hex');
}

function extractPhoneDigits(phone: string): string {
  return (phone || '').replace(/\D/g, '');
}

function hashPhoneForAudit(digits: string): string {
  return crypto.createHash('sha256').update(`ph-phone:${digits}`).digest('hex').slice(0, 24);
}

function maskCustomerName(rawName: string): string {
  const clean = (rawName || '').trim().replace(/\s+/g, ' ');
  if (!clean) return 'Guest';
  return clean
    .split(' ')
    .slice(0, 3)
    .map((part) => {
      if (part.length <= 1) return part;
      return `${part.charAt(0)}${'*'.repeat(Math.min(part.length - 1, 5))}`;
    })
    .join(' ');
}

async function loadLeadsTracker(): Promise<Record<string, StoredLeadRecord>> {
  if (leadsTrackerCache) return leadsTrackerCache;
  try {
    const raw = await fs.readFile(LEADS_TRACKER_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      leadsTrackerCache = parsed as Record<string, StoredLeadRecord>;
    } else {
      leadsTrackerCache = {};
    }
  } catch {
    leadsTrackerCache = {};
  }
  return leadsTrackerCache;
}

async function saveLeadTrackerRecord(params: {
  serial: string;
  name: string;
  phone: string;
  serviceTitle: string;
  source: 'callback' | 'chat';
  stageNote?: string;
}): Promise<StoredLeadRecord> {
  const digits = extractPhoneDigits(params.phone);
  const phoneLast4 = digits.slice(-4);
  const now = new Date().toISOString();
  const record: StoredLeadRecord = {
    serial: params.serial.toUpperCase(),
    maskedName: maskCustomerName(params.name),
    phoneLast4,
    phoneHash: hashPhoneForAudit(digits),
    serviceTitle: (params.serviceTitle || 'General Inquiry').trim().slice(0, 140),
    source: params.source,
    stage: 'received',
    stageNote: (
      params.stageNote ||
      'আবেদন/অনুরোধ গৃহীত হয়েছে — আমাদের ডেস্ক ডকুমেন্ট যাচাই করছে।'
    ).slice(0, 240),
    createdAt: now,
    updatedAt: now,
  };

  leadsTrackerLock = leadsTrackerLock.then(async () => {
    const store = await loadLeadsTracker();
    store[record.serial] = record;

    // Keep latest 1000 records to prevent unbounded growth
    const keys = Object.keys(store);
    if (keys.length > 1000) {
      keys
        .sort((a, b) => (store[a].updatedAt || '').localeCompare(store[b].updatedAt || ''))
        .slice(0, keys.length - 1000)
        .forEach((oldKey) => {
          delete store[oldKey];
        });
    }

    await writeJsonAtomic(LEADS_TRACKER_FILE, store).catch((err) => {
      console.warn('[LeadsTracker] Atomic save failed:', err);
    });
  });

  await leadsTrackerLock;
  return record;
}

async function getNextLeadSerial(): Promise<{ code: string; tag: string; number: number }> {
  let result = { code: 'PH-0001', tag: '#PH0001', number: 1 };

  leadSerialLock = leadSerialLock.then(async () => {
    if (leadSerialCounter === null) {
      try {
        const raw = await fs.readFile(LEAD_SERIAL_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.lastSerial === 'number' && Number.isFinite(parsed.lastSerial) && parsed.lastSerial >= 0) {
          leadSerialCounter = Math.floor(parsed.lastSerial);
        } else {
          leadSerialCounter = 0;
        }
      } catch {
        leadSerialCounter = 0;
      }
    }

    leadSerialCounter += 1;
    const padded = String(leadSerialCounter).padStart(4, '0');
    result = {
      code: `PH-${padded}`,
      tag: `#PH${padded}`,
      number: leadSerialCounter,
    };

    try {
      await writeJsonAtomic(LEAD_SERIAL_FILE, {
        lastSerial: leadSerialCounter,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[LeadSerial] Failed to persist counter:', err);
    }
  });

  await leadSerialLock;
  return result;
}

// Staff Authentication Helpers (scrypt + ephemeral runtime HMAC signing secret)
const RUNTIME_TOKEN_SECRET = crypto.randomBytes(32);

interface StoredStaffAuth {
  salt: string;
  hashHex: string;
  createdAt: string;
}

async function readStoredStaffAuth(): Promise<StoredStaffAuth | null> {
  try {
    const raw = await fs.readFile(STAFF_AUTH_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.salt === 'string' && typeof parsed.hashHex === 'string') {
      return parsed as StoredStaffAuth;
    }
  } catch {
    // not configured yet
  }
  return null;
}

function hashPasscodeWithSalt(passcode: string, salt: string): Buffer {
  return crypto.scryptSync(passcode, salt, 64);
}

function issueStaffToken(): { token: string; expiresAt: string } {
  const exp = Date.now() + 4 * 60 * 60 * 1000; // 4 hours
  const nonce = crypto.randomBytes(12).toString('hex');
  const payload = Buffer.from(JSON.stringify({ role: 'staff', exp, nonce })).toString('base64url');
  const sig = crypto.createHmac('sha256', RUNTIME_TOKEN_SECRET).update(payload).digest('base64url');
  return {
    token: `${payload}.${sig}`,
    expiresAt: new Date(exp).toISOString(),
  };
}

function verifyStaffToken(authHeader?: string): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', RUNTIME_TOKEN_SECRET).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return parsed?.role === 'staff' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function requireStaffAuth(req: Request, res: Response, next: NextFunction) {
  if (!verifyStaffToken(req.headers.authorization)) {
    return res.status(401).json({ error: 'Staff authentication required or session expired.' });
  }
  return next();
}

// Public File & Serial Tracking Endpoint (requires serial + last 4 digits of phone)
app.get('/api/track', trackRateLimiter, async (req, res) => {
  try {
    const rawSerial = typeof req.query.serial === 'string' ? req.query.serial.trim().toUpperCase() : '';
    const rawPhone4 = typeof req.query.phone4 === 'string' ? req.query.phone4.replace(/\D/g, '') : '';

    if (!/^PH-\d{4,6}$/.test(rawSerial) || rawPhone4.length !== 4) {
      return res.status(400).json({
        error: 'Valid tracking serial (e.g., PH-0001) and last 4 phone digits are required.',
      });
    }

    const store = await loadLeadsTracker();
    const record = store[rawSerial];
    if (!record || record.phoneLast4 !== rawPhone4) {
      return res.status(404).json({
        error: 'No matching file record found for this serial and phone digits.',
      });
    }

    return res.json({
      success: true,
      record: {
        serial: record.serial,
        maskedName: record.maskedName,
        phoneLast4: record.phoneLast4,
        serviceTitle: record.serviceTitle,
        source: record.source,
        stage: record.stage,
        stageNote: record.stageNote,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
    });
  } catch (err) {
    console.error('[TrackAPI] Lookup error:', err);
    return res.status(500).json({ error: 'Unable to look up tracking serial right now.' });
  }
});

// Staff Auth Status & Management Endpoints
app.get('/api/admin/auth-status', adminAuthRateLimiter, async (_req, res) => {
  const envPasscode = (process.env.STAFF_ADMIN_PASSCODE || '').trim();
  const stored = await readStoredStaffAuth();
  return res.json({
    configured: Boolean(envPasscode || stored),
    envManaged: Boolean(envPasscode),
  });
});

app.post('/api/admin/setup-passcode', adminAuthRateLimiter, async (req, res) => {
  try {
    const envPasscode = (process.env.STAFF_ADMIN_PASSCODE || '').trim();
    if (envPasscode) {
      return res.status(403).json({ error: 'Passcode is already managed via server environment.' });
    }
    const existing = await readStoredStaffAuth();
    if (existing) {
      return res.status(409).json({ error: 'Staff passcode is already configured.' });
    }

    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (passcode.length < 6 || passcode.length > 64) {
      return res.status(400).json({ error: 'Passcode must be between 6 and 64 characters.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashHex = hashPasscodeWithSalt(passcode, salt).toString('hex');
    await writeJsonAtomic(STAFF_AUTH_FILE, {
      salt,
      hashHex,
      createdAt: new Date().toISOString(),
    });

    const issued = issueStaffToken();
    return res.json({ success: true, ...issued });
  } catch (err) {
    console.error('[AdminAuth] Setup error:', err);
    return res.status(500).json({ error: 'Failed to configure staff passcode.' });
  }
});

app.post('/api/admin/login', adminAuthRateLimiter, async (req, res) => {
  try {
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (!passcode) {
      return res.status(400).json({ error: 'Passcode is required.' });
    }

    const envPasscode = (process.env.STAFF_ADMIN_PASSCODE || '').trim();
    if (envPasscode) {
      const a = crypto.createHash('sha256').update(passcode).digest();
      const b = crypto.createHash('sha256').update(envPasscode).digest();
      if (!crypto.timingSafeEqual(a, b)) {
        return res.status(401).json({ error: 'Invalid staff passcode.' });
      }
      const issued = issueStaffToken();
      return res.json({ success: true, ...issued });
    }

    const stored = await readStoredStaffAuth();
    if (!stored) {
      return res.status(400).json({ error: 'Staff passcode not yet configured.' });
    }

    const candidateHash = hashPasscodeWithSalt(passcode, stored.salt);
    const storedHash = Buffer.from(stored.hashHex, 'hex');
    if (candidateHash.length !== storedHash.length || !crypto.timingSafeEqual(candidateHash, storedHash)) {
      return res.status(401).json({ error: 'Invalid staff passcode.' });
    }

    const issued = issueStaffToken();
    return res.json({ success: true, ...issued });
  } catch (err) {
    console.error('[AdminAuth] Login error:', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

app.get('/api/admin/leads', adminAuthRateLimiter, requireStaffAuth, async (_req, res) => {
  try {
    const store = await loadLeadsTracker();
    const list = Object.values(store)
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
      .slice(0, 60)
      .map((r) => ({
        serial: r.serial,
        maskedName: r.maskedName,
        phoneLast4: r.phoneLast4,
        serviceTitle: r.serviceTitle,
        source: r.source,
        stage: r.stage,
        stageNote: r.stageNote,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    return res.json({ success: true, leads: list });
  } catch (err) {
    console.error('[AdminLeads] Fetch error:', err);
    return res.status(500).json({ error: 'Failed to load lead records.' });
  }
});

app.patch('/api/admin/leads/:serial', adminAuthRateLimiter, requireStaffAuth, async (req, res) => {
  try {
    const serial = String(req.params.serial || '').trim().toUpperCase();
    const stage = typeof req.body?.stage === 'string' ? req.body.stage.trim() : '';
    const stageNote = typeof req.body?.stageNote === 'string' ? req.body.stageNote.trim().slice(0, 240) : '';

    if (!/^PH-\d{4,6}$/.test(serial)) {
      return res.status(400).json({ error: 'Invalid serial format.' });
    }
    if (!VALID_TRACKING_STAGES.includes(stage as TrackingStage)) {
      return res.status(400).json({ error: 'Invalid tracking stage.' });
    }

    let updatedRecord: StoredLeadRecord | null = null;
    let notFound = false;

    leadsTrackerLock = leadsTrackerLock.then(async () => {
      const store = await loadLeadsTracker();
      const existing = store[serial];
      if (!existing) {
        notFound = true;
        return;
      }
      existing.stage = stage as TrackingStage;
      if (stageNote) {
        existing.stageNote = stageNote;
      }
      existing.updatedAt = new Date().toISOString();
      store[serial] = existing;
      updatedRecord = existing;
      await writeJsonAtomic(LEADS_TRACKER_FILE, store);
    });

    await leadsTrackerLock;

    if (notFound || !updatedRecord) {
      return res.status(404).json({ error: `Lead serial ${serial} not found.` });
    }

    return res.json({ success: true, record: updatedRecord });
  } catch (err) {
    console.error('[AdminLeads] Update error:', err);
    return res.status(500).json({ error: 'Failed to update lead status.' });
  }
});

// API endpoint for dispatching callback requests to Telegram & recording PH-XXXX tracker
app.post('/api/telegram/callback', leadRateLimiter, async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 80) : '';
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim().slice(0, 30) : '';
    const note = typeof req.body?.note === 'string' ? req.body.note.trim().slice(0, 240) : '';
    const digits = extractPhoneDigits(phone);

    if (!phone || digits.length < 8) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }

    const serial = await getNextLeadSerial();
    await saveLeadTrackerRecord({
      serial: serial.code,
      name: name || 'Callback Guest',
      phone,
      serviceTitle: note || 'ফোন কল অনুরোধ / ভিসা পরামর্শ',
      source: 'callback',
      stageNote: 'কলব্যাক অনুরোধ গৃহীত হয়েছে — আমাদের প্রতিনিধি শীঘ্রই কল করবেন।',
    });

    const tgConfig = getTelegramConfig();
    if (!tgConfig) {
      return res.json({
        success: true,
        serialNumber: serial.code,
        phoneLast4: digits.slice(-4),
        telegramSkipped: true,
      });
    }

    const timeString = new Date().toLocaleString('bn-BD', {
      timeZone: 'Asia/Dhaka',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const htmlMessage =
      `🚨 <b>নতুন কল ব্যাক অনুরোধ (${serial.tag})</b>\n\n` +
      `🔢 <b>সিরিয়াল নং:</b> <code>${serial.code}</code>\n` +
      `👤 <b>নাম:</b> ${escapeHtml(name || 'উল্লেখ করা হয়নি')}\n` +
      `📞 <b>মোবাইল নম্বর:</b> <code>${escapeHtml(phone)}</code>\n` +
      `💼 <b>কাঙ্ক্ষিত সেবা/নোট:</b> ${escapeHtml(note || 'সাধারণ তথ্য')}\n` +
      `⏰ <b>সময়:</b> ${escapeHtml(timeString)}\n` +
      `🌐 <b>উৎস:</b> Processing Hub Website`;

    const tgRes = await fetch(`https://api.telegram.org/bot${tgConfig.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgConfig.chatId,
        text: htmlMessage,
        parse_mode: 'HTML',
      }),
    });

    const tgData = await tgRes.json();
    return res.json({
      success: true,
      serialNumber: serial.code,
      phoneLast4: digits.slice(-4),
      telegram: tgData,
    });
  } catch (error: any) {
    console.error('Telegram callback error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to dispatch callback alert' });
  }
});

// API endpoint for dispatching URGENT MEDICAL VISA INVITATION requests + renamed passport attachments to Telegram
app.post('/api/telegram/medical-invitation', leadRateLimiter, async (req, res) => {
  try {
    const { patient, attendants, attachments } = req.body || {};

    const fullName = typeof patient?.fullName === 'string' ? patient.fullName.trim().slice(0, 100) : '';
    const gender = typeof patient?.gender === 'string' ? patient.gender.trim().slice(0, 40) : '';
    const passportNumber = typeof patient?.passportNumber === 'string' ? patient.passportNumber.trim().slice(0, 40) : '';
    const phone = typeof patient?.phone === 'string' ? patient.phone.trim().slice(0, 35) : '';
    const whatsappPhone = typeof patient?.whatsappPhone === 'string' ? patient.whatsappPhone.trim().slice(0, 35) : '';
    const address = typeof patient?.address === 'string' ? patient.address.trim().slice(0, 260) : '';
    const department = typeof patient?.department === 'string' ? patient.department.trim().slice(0, 120) : '';
    const hospitalName = typeof patient?.hospitalName === 'string' ? patient.hospitalName.trim().slice(0, 160) : '';
    const branchName = typeof patient?.branchName === 'string' ? patient.branchName.trim().slice(0, 160) : '';
    const hasPatientPassport = Boolean(patient?.hasPassportFile);

    const digits = extractPhoneDigits(phone || whatsappPhone);
    if (!fullName || !passportNumber || digits.length < 8) {
      return res.status(400).json({ error: 'Patient full name, passport number, and valid phone are required.' });
    }

    const safeAttendants = Array.isArray(attendants) ? attendants.slice(0, 4) : [];
    const safeAttachments = Array.isArray(attachments) ? attachments.slice(0, 5) : [];

    const serial = await getNextLeadSerial();
    await saveLeadTrackerRecord({
      serial: serial.code,
      name: fullName,
      phone: phone || whatsappPhone,
      serviceTitle: `আর্জেন্ট মেডিকেল ভিসা ইনভাইটেশন — ${hospitalName || 'ভারতীয় হাসপাতাল'}${branchName ? ` (${branchName})` : ''}`,
      source: 'chat',
      stageNote: 'আর্জেন্ট মেডিকেল ইনভাইটেশন লেটার অনুরোধ গৃহীত হয়েছে — এজেন্ট শীঘ্রই যোগাযোগ করবেন।',
    });

    const tgConfig = getTelegramConfig();
    if (!tgConfig) {
      return res.json({
        success: true,
        serialNumber: serial.code,
        phoneLast4: digits.slice(-4),
        telegramSkipped: true,
      });
    }

    const timeString = new Date().toLocaleString('bn-BD', {
      timeZone: 'Asia/Dhaka',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const ordinalLabelsBn = ['১ম অ্যাটেনডেন্ট (1st Attendant)', '২য় অ্যাটেনডেন্ট (2nd Attendant)', '৩য় অ্যাটেনডেন্ট (3rd Attendant)', '৪র্থ অ্যাটেনডেন্ট (4th Attendant)'];

    let attendantsHtml = '';
    if (safeAttendants.length === 0) {
      attendantsHtml = `\n👥 <b>অ্যাটেনডেন্ট (Attendant):</b> নেই (রোগী একা)`;
    } else {
      const blocks = safeAttendants.map((att: any, idx: number) => {
        const attName = typeof att?.fullName === 'string' ? att.fullName.trim().slice(0, 100) : 'উল্লেখ নেই';
        const attGender = typeof att?.gender === 'string' ? att.gender.trim().slice(0, 40) : 'উল্লেখ নেই';
        const attPassport = typeof att?.passportNumber === 'string' ? att.passportNumber.trim().slice(0, 40) : 'উল্লেখ নেই';
        const attAddress = typeof att?.address === 'string' ? att.address.trim().slice(0, 240) : 'উল্লেখ নেই';
        const attHasFile = Boolean(att?.hasPassportFile);
        const attFileTag = attHasFile
          ? `✅ সংযুক্ত (<code>Attendant_${idx + 1}_Passport</code>)`
          : '⚠️ সংযুক্ত করা হয়নি (ম্যানুয়ালি সংগ্রহ করুন)';
        return (
          `👥 <b>${ordinalLabelsBn[idx] || `অ্যাটেনডেন্ট #${idx + 1}`}:</b>\n` +
          `• <b>নাম:</b> ${escapeHtml(attName)}\n` +
          `• <b>লিঙ্গ (Gender):</b> ${escapeHtml(attGender)}\n` +
          `• <b>পাসপোর্ট নং:</b> <code>${escapeHtml(attPassport)}</code>\n` +
          `• <b>পূর্ণ ঠিকানা:</b> ${escapeHtml(attAddress)}\n` +
          `• <b>পাসপোর্ট কপি:</b> ${attFileTag}`
        );
      });
      attendantsHtml = `\n\n${blocks.join('\n\n')}`;
    }

    const patientFileTag = hasPatientPassport
      ? `✅ সংযুক্ত (<code>Patient_Passport</code>)`
      : '⚠️ সংযুক্ত করা হয়নি (পরবর্তীতে ম্যানুয়ালি সংগ্রহ করুন)';

    const htmlMessage =
      `🚨🚨 <b>আর্জেন্ট মেডিকেল ভিসা ইনভাইটেশন</b> 🚨🚨\n` +
      `<b>(URGENT MEDICAL VISA INVITATION)</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔢 <b>সিরিয়াল নং:</b> <code>${serial.code}</code> (${serial.tag})\n` +
      `🏥 <b>হাসপাতাল:</b> <b>${escapeHtml(hospitalName || 'উল্লেখ করা হয়নি')}</b>\n` +
      `📍 <b>শাখা / ব্রাঞ্চ:</b> <b>${escapeHtml(branchName || 'উল্লেখ করা হয়নি')}</b>\n` +
      `🩺 <b>রোগের বিভাগ (Department):</b> <b>${escapeHtml(department || 'উল্লেখ করা হয়নি')}</b>\n\n` +
      `👤 <b>রোগীর বিবরণ (Patient Details):</b>\n` +
      `• <b>পূর্ণ নাম:</b> ${escapeHtml(fullName)}\n` +
      `• <b>লিঙ্গ (Gender):</b> ${escapeHtml(gender || 'উল্লেখ নেই')}\n` +
      `• <b>পাসপোর্ট নম্বর:</b> <code>${escapeHtml(passportNumber)}</code>\n` +
      `• <b>মোবাইল নম্বর:</b> <code>${escapeHtml(phone)}</code>\n` +
      `• <b>হোয়াটসঅ্যাপ নম্বর:</b> <code>${escapeHtml(whatsappPhone || phone)}</code>\n` +
      `• <b>পূর্ণ ঠিকানা:</b> ${escapeHtml(address || 'উল্লেখ নেই')}\n` +
      `• <b>পাসপোর্ট কপি:</b> ${patientFileTag}` +
      `${attendantsHtml}\n\n` +
      `⏰ <b>সময়:</b> ${escapeHtml(timeString)}\n` +
      `🌐 <b>উৎস:</b> Processing Hub — Medical Invitation Desk`;

    // Direct WhatsApp inline button for Telegram agent
    const waRawDigits = extractPhoneDigits(whatsappPhone || phone);
    let waTarget = waRawDigits;
    if (waRawDigits.startsWith('0')) {
      waTarget = `88${waRawDigits}`;
    } else if (!waRawDigits.startsWith('880') && waRawDigits.length === 10) {
      waTarget = `880${waRawDigits}`;
    }

    const inlineKeyboard: Array<Array<{ text: string; url: string }>> = [];
    if (waTarget && waTarget.length >= 11) {
      inlineKeyboard.push([
        {
          text: '💬 রোগীর WhatsApp-এ যোগাযোগ করুন',
          url: `https://wa.me/${waTarget}`,
        },
      ]);
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${tgConfig.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgConfig.chatId,
        text: htmlMessage,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined,
      }),
    });

    const tgData = await tgRes.json();

    // If user attached Patient_Passport / Attendant_X_Passport files, send each renamed file directly to Telegram
    for (const att of safeAttachments) {
      try {
        const base64Data = typeof att?.base64Data === 'string' ? att.base64Data.trim() : '';
        const fileName = typeof att?.fileName === 'string' ? att.fileName.trim() : 'Passport_Copy.jpg';
        const mimeType = typeof att?.mimeType === 'string' ? att.mimeType.trim() : 'application/octet-stream';
        const roleLabel = typeof att?.roleLabel === 'string' ? att.roleLabel.trim() : fileName;

        if (!base64Data) continue;

        const fileBuffer = Buffer.from(base64Data, 'base64');
        const formData = new FormData();
        formData.append('chat_id', tgConfig.chatId);
        formData.append(
          'caption',
          `🚨 আর্জেন্ট মেডিকেল ইনভাইটেশন পাসপোর্ট কপি\n📎 ফাইল: ${fileName}\n👤 পরিচয়: ${roleLabel}\n🔢 সিরিয়াল: ${serial.code} (${fullName})`
        );
        const blob = new Blob([fileBuffer], { type: mimeType });
        formData.append('document', blob, fileName);

        await fetch(`https://api.telegram.org/bot${tgConfig.botToken}/sendDocument`, {
          method: 'POST',
          body: formData,
        });
      } catch (fileErr) {
        console.warn('Failed to send passport document attachment to Telegram:', fileErr);
      }
    }

    return res.json({
      success: true,
      serialNumber: serial.code,
      phoneLast4: digits.slice(-4),
      telegram: tgData,
    });
  } catch (error: any) {
    console.error('Telegram medical invitation error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to dispatch medical invitation alert' });
  }
});

// API endpoint for dispatching consultation summary to Telegram & recording PH-XXXX tracker
app.post('/api/telegram/summary', leadRateLimiter, async (req, res) => {
  let summaryFingerprint: string | null = null;
  try {
    const { user, serviceContext, messages, agentName: rawAgentName } = req.body || {};
    const agentName = sanitizeAgentName(rawAgentName);

    // Only proceed if there are actual user messages
    const userMessages = (Array.isArray(messages) ? messages : []).filter((m: any) => m.role === 'user');
    if (!userMessages || userMessages.length === 0) {
      return res.json({ success: true, skipped: true, reason: 'No user messages to summarize' });
    }

    const customerName = (typeof user?.name === 'string' ? user.name : 'অজ্ঞাত গ্রাহক').trim().slice(0, 80);
    const customerPhone = (typeof user?.phone === 'string' ? user.phone : 'প্রদান করা হয়নি').trim().slice(0, 30);
    const serviceTitle = (typeof serviceContext?.title === 'string' ? serviceContext.title : 'সাধারণ ভিসা জিজ্ঞাসা').trim().slice(0, 120);

    // Server-side persistent + in-flight deduplication so identical chats never re-send to Telegram
    summaryFingerprint = buildConversationFingerprint(customerName, customerPhone, userMessages);
    if (inFlightSummaryFingerprints.has(summaryFingerprint)) {
      return res.json({ success: true, deduplicated: true, reason: 'Summary dispatch already in progress' });
    }
    inFlightSummaryFingerprints.add(summaryFingerprint);

    const sentStore = await loadSentSummaries();
    const existingSent = sentStore[summaryFingerprint];
    if (existingSent && Date.now() - existingSent.sentAt < TELEGRAM_SUMMARY_DEDUP_TTL_MS) {
      inFlightSummaryFingerprints.delete(summaryFingerprint);
      summaryFingerprint = null;
      return res.json({
        success: true,
        deduplicated: true,
        serialNumber: existingSent.serial,
      });
    }

    const serial = await getNextLeadSerial();
    const digits = extractPhoneDigits(customerPhone);
    if (digits.length >= 4) {
      await saveLeadTrackerRecord({
        serial: serial.code,
        name: customerName,
        phone: customerPhone,
        serviceTitle,
        source: 'chat',
        stageNote: `${agentName} চ্যাট পরামর্শ সম্পন্ন হয়েছে — ফাইল প্রসেসিংয়ের জন্য প্রস্তুত।`,
      });
    }

    const tgConfig = getTelegramConfig();
    if (!tgConfig) {
      await markSummarySent(summaryFingerprint, serial.code);
      inFlightSummaryFingerprints.delete(summaryFingerprint);
      summaryFingerprint = null;
      return res.json({
        success: true,
        serialNumber: serial.code,
        phoneLast4: digits.slice(-4),
        telegramSkipped: true,
      });
    }
    const { botToken, chatId } = tgConfig;

    // Build conversation transcript text
    const transcript = (messages || [])
      .map((m: any) => {
        const attNote = Array.isArray(m.attachments) && m.attachments.length > 0
          ? ` [সংযুক্ত ফাইল: ${m.attachments.map((a: any) => a.name || 'ফাইল').join(', ')}]`
          : '';
        return `${m.role === 'user' ? 'গ্রাহক' : agentName}: ${m.text || ''}${attNote}`.trim();
      })
      .join('\n\n');

    let summaryText = '';
    const ai = getAiClient();
    if (ai) {
      try {
        const sumResp = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: [
            {
              role: 'user',
              parts: [{
                text: `You are an executive assistant at "Processing Hub" in Dhaka.
Analyze the following conversation between client "${customerName}" (${customerPhone}) and ${agentName}.

Generate an ULTRA-SHORT 2 to 3 bullet point summary in Bengali (বাংলা).
CRITICAL RULES:
- Maximum 2 or 3 bullet lines total!
- Keep each bullet line very short, crisp, and direct (under 15 words per line).
- NO long paragraphs, NO storytelling.
Format EXACTLY like this (NO asterisks, NO markdown characters, plain text only):
• মূল জিজ্ঞাসা: [সংক্ষেপে গ্রাহকের মূল প্রশ্ন বা চাহিদা]
• প্রদত্ত পরামর্শ: [সংক্ষেপে কী সমাধান বা তথ্য দেওয়া হয়েছে]
• অ্যাকশন: [ফলো-আপের জন্য কী করতে হবে]

CONVERSATION:
${transcript}`
              }]
            }
          ],
        });
        summaryText = sumResp.text ? sumResp.text.trim() : '';
      } catch (err) {
        console.warn('Failed to generate summary with Gemini, using fallback summary:', err);
      }
    }

    // Clean up any stray markdown asterisks, hashes, or brackets
    let cleanSummary = (summaryText || '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s*/g, '')
      .replace(/\[|\]/g, '')
      .trim();

    // Format clean professional bullet points
    let formattedSummary = '';
    const rawLines = cleanSummary.split('\n').map(l => l.trim()).filter(Boolean);
    if (rawLines.length > 0) {
      formattedSummary = rawLines.map(line => {
        const cleanLine = line.replace(/^[•\-\*]\s*/, '');
        const colonIndex = cleanLine.indexOf(':');
        if (colonIndex !== -1 && colonIndex < 35) {
          const label = cleanLine.substring(0, colonIndex).trim();
          const val = cleanLine.substring(colonIndex + 1).trim();
          return `• <b>${escapeHtml(label)}:</b> ${escapeHtml(val)}`;
        }
        return `• ${escapeHtml(cleanLine)}`;
      }).join('\n');
    } else {
      const lastUserMsg = userMessages[userMessages.length - 1]?.text || '';
      formattedSummary = `• <b>মূল জিজ্ঞাসা:</b> ${escapeHtml(lastUserMsg.substring(0, 100) || serviceTitle)}\n• <b>প্রদত্ত পরামর্শ:</b> গ্রাহককে প্রয়োজনীয় ভিসা পরামর্শ দেওয়া হয়েছে।\n• <b>অ্যাকশন:</b> দ্রুত কাস্টমারের সাথে যোগাযোগ করুন।`;
    }

    const now = new Date();
    const bdTime = now.toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // Build native expandable conversation block for Telegram
    let conversationBlock = '';
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const isUser = msg.role === 'user';
      const speaker = isUser ? `👤 <b>${escapeHtml(customerName)} (গ্রাহক)` : `💬 <b>${escapeHtml(agentName)}`;
      const timeStr = msg.time ? ` [${escapeHtml(msg.time)}]</b>:` : `</b>:`;
      const cleanMsgText = escapeHtml(msg.text || '');
      conversationBlock += `${speaker}${timeStr}\n${cleanMsgText}\n\n`;
    }
    conversationBlock = conversationBlock.trim();

    // Prepare direct WhatsApp button
    const digitsOnly = (customerPhone || '').replace(/[^0-9]/g, '');
    let waPhone = digitsOnly;
    if (digitsOnly.startsWith('0')) {
      waPhone = `88${digitsOnly}`;
    } else if (!digitsOnly.startsWith('880') && digitsOnly.length === 10) {
      waPhone = `880${digitsOnly}`;
    }

    const inlineKeyboard: Array<Array<{ text: string; url: string }>> = [];
    if (waPhone && waPhone.length >= 11) {
      inlineKeyboard.push([
        {
          text: '💬 WhatsApp এ চ্যাট করুন',
          url: `https://wa.me/${waPhone}`
        }
      ]);
    }

    const baseMessage = `<b>Processing Hub — নতুন লিড (${serial.tag})</b>

<b>গ্রাহকের বিবরণ:</b>
• <b>সিরিয়াল নং:</b> <code>${serial.code}</code>
• <b>নাম:</b> ${escapeHtml(customerName)}
• <b>মোবাইল:</b> <code>${escapeHtml(customerPhone)}</code>
• <b>আগ্রহের সেবা:</b> ${escapeHtml(serviceTitle)}
• <b>তারিখ ও সময়:</b> ${bdTime} (বাংলাদেশ সময়)

<b>সারসংক্ষেপ:</b>
${formattedSummary}`;

    const combinedMessage = `${baseMessage}\n\n<b>সম্পূর্ণ কথোপকথন (ট্যাপ করে পড়ুন):</b>\n<blockquote expandable>${conversationBlock}</blockquote>`;

    let tgData = null;
    if (combinedMessage.length <= 4000) {
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: combinedMessage,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined,
        }),
      });
      tgData = await tgRes.json();
    } else {
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: baseMessage,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined,
        }),
      });
      tgData = await tgRes.json();

      const maxChunk = 3800;
      for (let i = 0; i < conversationBlock.length; i += maxChunk) {
        const chunk = conversationBlock.substring(i, i + maxChunk);
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `<b>পূর্ণাঙ্গ চ্যাট হিস্ট্রি — <code>${serial.code}</code> (${serial.tag}):</b>\n<blockquote expandable>${chunk}</blockquote>`,
            parse_mode: 'HTML',
          }),
        });
      }
    }

    if (summaryFingerprint) {
      await markSummarySent(summaryFingerprint, serial.code);
      inFlightSummaryFingerprints.delete(summaryFingerprint);
      summaryFingerprint = null;
    }

    return res.json({ success: true, serialNumber: serial.code, telegram: tgData });
  } catch (error: any) {
    if (summaryFingerprint) {
      inFlightSummaryFingerprints.delete(summaryFingerprint);
    }
    console.error('Telegram summary error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to dispatch telegram summary' });
  }
});

// Passport Expiry Date OCR Endpoint (extracts only Date of Expiry in DD/MM/YYYY from Passport photo or PDF)
app.post('/api/passport/extract-expiry', async (req: Request, res: Response) => {
  try {
    const { dataUrl, mimeType } = req.body || {};
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Missing passport file dataUrl' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const base64Match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    const resolvedMime = (base64Match?.[1] || mimeType || 'image/jpeg').trim();
    const rawBase64 = (base64Match?.[2] || dataUrl).trim();

    const promptText = `Look at this passport image or document and find the Passport Date of Expiry (also check the MRZ bottom lines if present).
Return ONLY a valid JSON object with these exact keys:
{
  "found": true or false,
  "expiryDateDmy": "DD/MM/YYYY",
  "expiryDateIso": "YYYY-MM-DD"
}
Rules:
- Convert any month name (e.g. 15 AUG 2027, 05 MAR 2026) into numeric DD/MM/YYYY (e.g. "15/08/2027") and YYYY-MM-DD (e.g. "2027-08-15").
- Day (DD) MUST come first, then Month (MM), then 4-digit Year (YYYY).
- If no expiry date is visible, set "found": false, "expiryDateDmy": "", "expiryDateIso": "".`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: resolvedMime,
              data: rawBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const rawText = (response.text || '{}').trim();
    let parsed: { found?: boolean; expiryDateDmy?: string; expiryDateIso?: string } = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const matchDmy = rawText.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
      if (matchDmy) {
        const [, dd, mm, yyyy] = matchDmy;
        parsed = {
          found: true,
          expiryDateDmy: `${dd}/${mm}/${yyyy}`,
          expiryDateIso: `${yyyy}-${mm}-${dd}`,
        };
      }
    }

    if (parsed.found && parsed.expiryDateDmy && parsed.expiryDateIso) {
      return res.json({
        found: true,
        expiryDateDmy: parsed.expiryDateDmy,
        expiryDateIso: parsed.expiryDateIso,
      });
    }

    return res.json({
      found: false,
      expiryDateDmy: '',
      expiryDateIso: '',
    });
  } catch (error: any) {
    console.error('[PassportExpiryOCR] Error:', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Failed to extract passport expiry date',
    });
  }
});

// Health endpoint (supports both GET and HEAD for keep-alive / uptime monitors)
app.head('/api/health', (_req, res) => {
  res.status(200).end();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', brand: 'Processing Hub', timestamp: new Date().toISOString() });
});

// Keep-alive heartbeat every 14 minutes to prevent Render free tier spin-down
function startKeepAliveHeartbeat() {
  const rawUrl = (process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || '').trim();
  if (!rawUrl || process.env.NODE_ENV !== 'production') {
    return;
  }

  const baseUrl = rawUrl.replace(/\/+$/, '');
  const healthUrl = `${baseUrl}/api/health`;
  const INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

  const ping = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': 'ProcessingHub-KeepAlive/1.0' },
      });
      if (!res.ok) {
        console.warn(`[KeepAlive] Heartbeat returned status ${res.status}`);
      }
    } catch (err: any) {
      console.warn('[KeepAlive] Heartbeat failed:', err?.message || err);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  setInterval(ping, INTERVAL_MS);
  console.log(`[KeepAlive] 14-minute heartbeat active for ${healthUrl}`);
}

// Vite middleware in dev or static files in production
async function startServer() {
  let viteInstance: Awaited<ReturnType<typeof createViteServer>> | null = null;

  if (process.env.NODE_ENV !== 'production') {
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const vitePromise = createViteServer({
      server: {
        middlewareMode: true,
        hmr: disableHmr ? false : undefined,
        ws: disableHmr ? false : undefined,
        watch: disableHmr ? null : undefined,
      },
      appType: 'spa',
    })
      .then((vite) => {
        viteInstance = vite;
        return vite;
      })
      .catch((err) => {
        console.error('[Vite] Failed to initialize dev middleware:', err);
        throw err;
      });

    app.use((req, res, next) => {
      if (viteInstance) {
        viteInstance.middlewares(req, res, next);
        return;
      }
      vitePromise
        .then((vite) => vite.middlewares(req, res, next))
        .catch(next);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(
      express.static(distPath, {
        etag: true,
        lastModified: true,
        setHeaders(res, filePath) {
          const normalized = filePath.replace(/\\/g, '/');
          if (normalized.endsWith('/index.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          } else if (
            normalized.includes('/assets/') ||
            normalized.includes('/fonts/')
          ) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=86400');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Processing Hub server running on http://0.0.0.0:${PORT}`);
    startKeepAliveHeartbeat();
  });

  const shutdown = () => {
    server.close(() => {
      if (viteInstance) {
        viteInstance.close().finally(() => process.exit(0));
      } else {
        process.exit(0);
      }
    });
    setTimeout(() => process.exit(0), 2500).unref?.();
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
