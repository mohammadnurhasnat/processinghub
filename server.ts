import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { SLOT_TYPES, VISA_SERVICES, DESTINATIONS, HOSPITALS } from './src/data/visaData';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

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

function buildSystemInstruction(agentName: string): string {
  return `
You are ${agentName}, a real live customer support team member at "Processing Hub" in Dhaka. You chat with clients just like a genuine, experienced human colleague on WhatsApp/Live Chat — warm, natural, polite, and practical.

### 1. 100%–150% AUTHENTIC HUMAN VOICE (একজন স্বাভাবিক মানুষের মতো কথা বলার নিয়ম):
- Your name is ${agentName}, and you work at Processing Hub's support desk.
- **STRICTLY BANNED TITLES & AI CLUES**: NEVER use "Visa Consultant", "Consultant", "Senior Consultant", "ভিসা কনসালটেন্ট", "সিনিয়র কনসালটেন্ট", or "কনসালটেন্ট". NEVER hint or reveal in any way that you are an AI, bot, virtual assistant, or model.
- **WRITE LIKE A REAL PERSON, NOT A TEMPLATE**:
  * **NEVER start replies with robotic boilerplate** like "আপনার জিজ্ঞাসার জন্য ধন্যবাদ", "অবশ্যই! নিচে বিস্তারিত দেওয়া হলো:", "আমি আপনাকে সাহায্য করতে পেরে আনন্দিত", or "এখানে আপনার প্রশ্নের উত্তর দেওয়া হলো:"!
  * Speak naturally in Dhaka polite conversational Bangla: e.g., "জি, ...", "হ্যাঁ, অবশ্যই...", "দেখুন, এখানে নিয়মটা হলো...", "আপনার সুবিধার জন্য বলি...", "একটা বিষয় খেয়াল রাখবেন—...".
  * Avoid stiff machine-translated phrasing (say "নিচের কাগজগুলো লাগবে" instead of "নিম্নলিখিত নথিপত্রসমূহ সংযুক্ত করুন").
  * Vary your sentence rhythm naturally. Don't wrap every second word in **bold**; bold only key amounts, headings, or crucial points so the text feels human and clean.
  * If the customer speaks casually or briefly, match their pace politely while always keeping respectful "আপনি" tone.

### 2. NATURAL ADDRESSING & GREETING RULES (সম্বোধন ও সালামের স্বাভাবিক নিয়ম):
- **NEVER repeat the customer's name** (NEVER say "রহিম সাহেব", "রহিম ভাই").
- **First Reply Only**: On your VERY FIRST reply to a new client, politely address them ONCE based on their name as **"স্যার"** (male) or **"ম্যাডাম"/"ম্যাম"** (female), or politely neutral if unclear.
- **Follow-up Replies**: In ALL subsequent replies in the session, DO NOT repeat "স্যার", "ম্যাডাম", "ম্যাম", or their name. Talk directly and naturally face-to-face.
- **Saalam Rules**: Give "আসসালামু আলাইকুম" / "ওয়ালাইকুম আসসালাম" ONLY on the very first greeting or if the user greets you with Saalam. NEVER repeat Saalam on follow-up answers. NEVER use "নমস্কার" or "আদাব".
- **Handoff & Closings**:
  * On initial form handoff (name/phone/subject), greet briefly, answer the chosen service concisely, and ask how you can help today (NEVER say "সার্ভিসটি নেওয়ার জন্য ধন্যবাদ").
  * Only when the user says goodbye or thanks to close ("ধন্যবাদ", "আল্লাহ হাফেজ", "কাজ শেষ", "বাই"), give a warm natural closing ("প্রসেসিং হাবের সাথে যোগাযোগ করার জন্য ধন্যবাদ! যেকোনো প্রয়োজনে জানাবেন, আল্লাহ হাফেজ।").

### 3. CLEAN, STRUCTURED & ORGANIZED FORMATTING (গোছানো ও পরিচ্ছন্ন বুলেট-পয়েন্ট উত্তর):
- Every response must be **crystal clear, specific, and visually neat** — NEVER messy, cramped, or "হিজিবিজি".
- **STRICT MARKDOWN BULLET LIST RULE (অবশ্যপালনীয়)**:
  * Whenever explaining multiple documents, steps, fees, hospitals, destinations, or comparisons, ALWAYS use standard Markdown hyphen bullets ("- ") — NEVER use the "•" character, and NEVER merge multiple bullet items into one paragraph!
  * Put ONE item per line, with a blank line before the list starts and a blank line after the list ends. Example:

    জি, নিচের কাগজপত্রগুলো লাগবে:

    - **পাসপোর্ট:** বর্তমান মূল পাসপোর্ট ও সকল পুরনো পাসপোর্ট।
    - **ছবি:** সাদা ব্যাকগ্রাউন্ডের ২×২ ইঞ্চি ল্যাব প্রিন্ট ছবি।

- **When NOT to bloat**:
  * If the user asks a simple single question (e.g., yes/no, one fee, one specific rule), reply directly in 1–3 clear sentences without dumping an unsolicited long checklist.

### 4. FULL WEBSITE CONTEXT & ADAPTIVE VERIFICATION BRAIN:
- You have the COMPLETE context of Processing Hub's website in your memory (all Visa Services, IVAC Slot Fees, 14 Indian Travel Destinations, and 16 Partner Indian Hospitals + AYUSH invitation details, plus any newly verified online facts).
- Always answer accurately about ANY hospital, destination, visa service, checklist, or fee shown on the website.
- **Handling New Info / Unlisted Questions from Customers**:
  * If a customer shares new information (e.g., new rule/fee/circular/border update) or asks about something not in our static website data, cross-check it via real-time Google Search.
  * Rely ONLY on verified facts confirmed online by official/credible sources. If an unconfirmed claim cannot be verified online, politely clarify that there is no official confirmation rather than blindly agreeing or saving false claims.

### 5. DOCUMENT, PHOTO & PDF ANALYSIS:
- When the user attaches a photo, image, or PDF (passport, NID, photo, utility bill, bank statement, medical report/invitation, ticket, online form):
  * Inspect every readable detail carefully, briefly summarize what you checked in clean bullet points, note any mismatch or missing item against IVAC rules (e.g., 2"×2" white background photo, NID/passport spelling & DOB match, utility address, 6-month bank statement), and state the clear next step.`;
}

function buildFullWebsiteContext(): string {
  const servicesBlock = VISA_SERVICES.map((s) =>
    `• **${s.title}** (${s.category}) — ফি: ${s.price} ${s.per}\n  বিবরণ: ${s.description}\n  কাগজপত্র: ${s.documents.join(' | ')}`
  ).join('\n');

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
  if (text.includes('নাম:') && text.includes('সেবা/বিষয়:')) return false;

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

A. **ট্যুরিস্ট ভিসা (Tourist Visa) ডকুমেন্টস চেকলিস্ট**:
   - উপরোক্ত কমন ডকুমেন্টস + সম্ভাব্য ভ্রমণ বিবরণ ও হোটেল বুকিং (প্রযোজ্য ক্ষেত্রে)।

B. **মেডিকেল (M-1) ও মেডিকেল অ্যাটেনডেন্ট (M-2) ভিসা চেকলিস্ট**:
   - **রোগীর (M-1) জন্য**: কমন ডকুমেন্টস + ভারতের স্বীকৃত হাসপাতালের মূল অ্যাপয়েন্টমেন্ট / ডক্টরস ইনভাইটেশন লেটার (MVRN ও অ্যাটেনডেন্টের নামসহ) + আয়ুষ (AYUSH) লেটার + বাংলাদেশের সাম্প্রতিক ডাক্তারের প্রেসক্রিপশন ও মেডিকেল টেস্ট রিপোর্ট।
   - **অ্যাটেনডেন্টের (M-2) জন্য**: কেবল অ্যাটেনডেন্টের বেসিক কমন ডকুমেন্টস ও রোগীর সাথে সম্পর্কের প্রমাণপত্র লাগবে (**অ্যাটেনডেন্টের আলাদা মেডিকেল টেস্ট রিপোর্ট বা প্রেসক্রিপশন লাগবে না**)।

C. **ডাবল এন্ট্রি ভিসা — মিসেলেনিয়াস ক্যাটাগরি (Double Entry Visa X-3) চেকলিস্ট**:
   - কমন ডকুমেন্টস + যে দেশের এম্বাসি ফেস করতে ভারতে যাবেন সেই **এম্বাসির অফিশিয়াল অ্যাপয়েন্টমেন্ট লেটার** + **ওয়ার্ক পারমিট (Work Permit)** সহ ইউরোপগামী বা ৩য় দেশের চুক্তিকৃত কোম্পানির প্রয়োজনীয় কাগজপত্র (Job Contract / Offer / Sponsorship) + কনফার্মড ফ্লাইট/ট্রানজিট রুট ও কভারিং লেটার।

D. **বিজনেস ভিসা (Business Visa B-1/B-2) চেকলিস্ট**:
   - কমন ডকুমেন্টস + ভারতীয় কোম্পানির মূল ইনভাইটেশন লেটার + বাংলাদেশি প্রতিষ্ঠানের প্যাডে ফরওয়ার্ডিং লেটার + নবায়নকৃত ট্রেড লাইসেন্স (ইংরেজি অনুবাদসহ) + **চেম্বার অফ কমার্স (Chamber of Commerce)** সদস্য/সুপারিশ সনদ + **টিন (TIN)**, **বিন (BIN)**, **আইআরসি/ইআরসি (IRC/ERC)**, **এলসি (LC)**, **ভ্যাট রিটার্ন (VAT Return)** এবং ব্যক্তিগত ও কোম্পানির বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট।

E. **স্টুডেন্ট ভিসা (Student Visa S-1) চেকলিস্ট**:
   - কমন ডকুমেন্টস + ভারতের স্বীকৃত বিশ্ববিদ্যালয়/কলেজের মূল অ্যাডমিশন লেটার ও বোনাফাইড সার্টিফিকেট (কোর্স ও সময়কালসহ) + অভিভাবক/স্পনসরের ব্যাংক সলভেন্সি ও ৬ মাসের ব্যাংক স্টেটমেন্ট + মেডিকেল কলেজের ক্ষেত্রে স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয়ের NOC + পূর্বের একাডেমিক সার্টিফিকেট ও বর্তমান স্টুডেন্ট আইডি কার্ড।

F. **ট্রানজিট ভিসা (Transit Visa TR) চেকলিস্ট**:
   - কমন ডকুমেন্টস + গন্তব্য ৩য় দেশের বৈধ ভিসা কপি (যেমন নেপালের ভিসা) + কনফার্মড অনওয়ার্ড ও রিটার্ন বাস/রেল/এয়ার টিকেট + হোটেল বুকিং + অনুমোদিত সীমান্ত পোর্ট (ভুটান: চ্যাংড়াবান্ধা/জয়গাঁ, নেপাল: চ্যাংড়াবান্ধা/রাণীগঞ্জ)।

G. **এন্ট্রি ভিসা — মিসেলেনিয়াস ক্যাটাগরি (Entry Visa X-Misc) চেকলিস্ট**:
   - কমন ডকুমেন্টস + X-Misc এন্ট্রি যোগ্যতার মূল প্রমাণপত্র / ইনভাইটেশন লেটার / PIO বা সম্পর্কের সনদ + প্রিন্সিপাল ভিসা ও পাসপোর্টের কপি (ডিপেন্ডেন্ট ক্ষেত্রে)।

H. **স্পাউস ও ফ্যামিলি ভিসা — মিসেলেনিয়াস ক্যাটাগরি (Spouse Visa X-1) চেকলিস্ট**:
   - কমন ডকুমেন্টস + নিকাহনামা / সরকারি ম্যারিজ সার্টিফিকেট (ইংরেজি অনুবাদ, MoFA ও ভারতীয় হাইকমিশন সত্যায়িত) + ভারতীয় স্পাউসের পাসপোর্ট / আধার কার্ড / ভোটার আইডি কার্ড ও ভারতীয় ঠিকানার ইউটিলিটি বিল (বা প্রিন্সিপাল ভিসা ও পাসপোর্ট কপি)।

I. **ভিসা প্রত্যাখ্যাত / রিজেক্ট হওয়ার সম্ভাব্য ৯টি কারণ**:
   - ফর্মে ভুল তথ্য পূরণ করা বা জাল/অসম্পূর্ণ ডকুমেন্ট সংযুক্ত করা
   - পাসপোর্ট ও NID/জন্ম নিবন্ধনে তথ্যের অমিল থাকা বা পূর্বের সকল পুরনো পাসপোর্ট জমা না দেওয়া
   - ভ্রমণ ভিসা নিয়ে ভারতে Over Stay করা বা আবেদন পত্র ও ইউটিলিটি বিলের ঠিকানায় গরমিল থাকা
   - পুরনো ছবি বা ২"×২" সাদা ব্যাকগ্রাউন্ড ছাড়া ছবি ব্যবহার করা বা নকল NOC / ভুয়া এন্ডোর্সমেন্ট দেওয়া।
   *(অফিসিয়াল সহায়তা ই-মেইল: visahelp@hcidhaka.gov.in)*

J. **বাংলাদেশের অফিশিয়াল ১৬টি আইভ্যাক (IVAC) সেন্টারসমূহ**:
   - ঢাকা (শুধুমাত্র যমুনা ফিউচার পার্ক — JFP), চট্টগ্রাম, খুলনা, সিলেট, রাজশাহী, রংপুর, ময়মনসিংহ, বরিশাল, কুমিল্লা, নোয়াখালী, ব্রাহ্মণবাড়িয়া, ঠাকুরগাঁও, বগুড়া, কুষ্টিয়া, যশোর ও সাতক্ষীরা।

K. **SCHEDULE OF CHARGES & Processing Hub Official Rates (সর্বশেষ আপডেটেড ফি তালিকা)**:
   - সরকারি আইভ্যাক (IVAC) ফি: ১,৫০০ টাকা (অতিরিক্ত পোর্ট এন্ডোর্সমেন্ট / ফর্ম সংশোধন / VAFC চার্জ: ৩০০ টাকা)।
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
   3. **Ticket Booking (সকল ধরনের এয়ার/ট্রাভেল টিকেট বুকিং)**:
      - মূল টিকেটের নির্ধারিত মূল্যের সাথে অতিরিক্ত **৳৫৯৯ থেকে শুরু (আলোচনা সাপেক্ষে)** সার্ভিস চার্জ প্রযোজ্য।
   *গুরুত্বপূর্ণ নির্দেশনা*: কাস্টমার যখন কোনো ভিসার খরচ বা ফি জানতে চাইবে, তখন স্পষ্টভাবে **প্রসেসিং + স্লট (আইভ্যাক ফিসহ)** এবং **শুধুমাত্র স্লট (আইভ্যাক ফি ১,৫০০৳ ফিক্সড + স্লট ফি)**—এই দুইটি রেটই পরিষ্কার ও সংক্ষিপ্তভাবে উল্লেখ করবে যাতে কোনো বিভ্রান্তি না থাকে।
   - Hotline/WhatsApp: +8801577464706, Dhaka, Bangladesh.

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

function detectCourtesyHonorific(userName?: string): string {
  if (!userName) return 'স্যার';
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
  return isFemale ? 'ম্যাডাম' : 'স্যার';
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
  attachments?: Array<{ name?: string; mimeType?: string }>
): string {
  const query = (userMessage || '').toLowerCase().trim();
  const firstReplyHonorific = isFirstReply ? `${detectCourtesyHonorific(userName)}, ` : '';

  if (Array.isArray(attachments) && attachments.length > 0) {
    const fileNames = attachments.map((a) => a.name || 'ফাইল').join(', ');
    return `${firstReplyHonorific}আপনার পাঠানো **${fileNames}** ফাইলটি পেয়েছি। সাময়িকভাবে অটো-রিডিংয়ে সংযোগ সমস্যা থাকায় ফাইলটি সরাসরি যাচাই করে পরবর্তী পদক্ষেপ জানাতে আমাদের WhatsApp নম্বরে (+8801577464706) অথবা আপনার কী বিষয়ে সহায়তা প্রয়োজন তা সংক্ষেপে লিখে দিন।`;
  }

  // Structured Form Handoff Detection (from Talk to Agent button)
  if (userMessage.includes('নাম:') && userMessage.includes('সেবা/বিষয়:')) {
    const subjectLine = userMessage
      .split('\n')
      .find((line) => line.startsWith('সেবা/বিষয়:'))
      ?.replace('সেবা/বিষয়:', '')
      .trim() || serviceContext?.title || 'ভিসা প্রসেসিং';
    const subjectLower = subjectLine.toLowerCase();

    let serviceDetail = '';
    if (subjectLower.includes('medical') || subjectLower.includes('মেডিকেল') || subjectLower.includes('attendant') || subjectLower.includes('অ্যাটেনডেন্ট')) {
      serviceDetail = `**মেডিকেল ও অ্যাটেনডেন্ট ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ ও ইনভাইটেশনসহ) **৳৬,০০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('double') || subjectLower.includes('ডাবল') || subjectLower.includes('ডবল') || subjectLower.includes('x-3')) {
      serviceDetail = `**ডাবল এন্ট্রি (X-3) ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৬,৫০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('business') || subjectLower.includes('বিজনেস')) {
      serviceDetail = `**বিজনেস ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৬,০০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('student') || subjectLower.includes('স্টুডেন্ট')) {
      serviceDetail = `**স্টুডেন্ট (S-1) ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৫,৫০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('transit') || subjectLower.includes('ট্রানজিট')) {
      serviceDetail = `**ট্রানজিট (TR) ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৫,৫০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('spouse') || subjectLower.includes('স্পাউস') || subjectLower.includes('family') || subjectLower.includes('x-1')) {
      serviceDetail = `**স্পাউস ও ফ্যামিলি (X-1) ভিসার** জন্য প্রসেসিং + স্লট **৳৬,০০০** (স্লট ৪,৫০০ + ডকুমেন্ট প্রসেসিং ১,৫০০) এবং শুধু স্লট **৳৪,৫০০**।`;
    } else if (subjectLower.includes('entry') || subjectLower.includes('এন্ট্রি') || subjectLower.includes('x-misc')) {
      serviceDetail = `**এন্ট্রি (X-Misc) ভিসার** জন্য প্রসেসিং + স্লট **৳৬,০০০** (স্লট ৪,৫০০ + প্রসেসিং ১,৫০০) এবং শুধু স্লট **৳৪,৫০০**।`;
    } else if (subjectLower.includes('tourist') || subjectLower.includes('ট্যুরিস্ট')) {
      serviceDetail = `**ট্যুরিস্ট ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৬,০০০** এবং শুধু স্লট **৳৫,৫০০** (১,৫০০ + ৪,০০০)।`;
    } else if (subjectLower.includes('ticket') || subjectLower.includes('টিকেট') || subjectLower.includes('টিকিট')) {
      serviceDetail = `**টিকেট বুকিংয়ের** ক্ষেত্রে মূল টিকেটের নির্ধারিত মূল্যের সাথে অতিরিক্ত **৳৫৯৯ থেকে শুরু** (আলোচনা সাপেক্ষে) সার্ভিস চার্জ প্রযোজ্য।`;
    } else if (subjectLower.includes('slot') || subjectLower.includes('স্লট')) {
      serviceDetail = `**শুধু স্লট বুকিং** **৳৪,৫০০ থেকে শুরু** (আইভ্যাক ফি ১,৫০০৳ ফিক্সডসহ): মেডিকেল/বিজনেস/ডাবল এন্ট্রি X-3/স্টুডেন্ট/ট্রানজিট/এন্ট্রি X-Misc/স্পাউস X-1 **৳৪,৫০০** এবং ট্যুরিস্ট **৳৫,৫০০**।`;
    } else if (serviceContext?.price) {
      serviceDetail = `**${subjectLine}**-এর ফি **${serviceContext.price}**।`;
    }

    return `আসসালামু আলাইকুম ${detectCourtesyHonorific(userName)}! আপনার তথ্যগুলো পেয়েছি। আমি **${agentName}**, প্রসেসিং হাব থেকে বলছি।\n\n${serviceDetail ? `${serviceDetail}\n\n` : ''}**${subjectLine}** বিষয়ে আপনাকে কীভাবে সহযোগিতা করতে পারি?`;
  }

  // Greetings & Identity
  if (query.includes('কে আপনি') || query.includes('আপনার নাম') || query.includes('name') || query.includes('ai') || query.includes('bot') || query.includes('রোবট')) {
    return `${isFirstReply ? `আসসালামু আলাইকুম ${detectCourtesyHonorific(userName)}! ` : ''}আমি **${agentName}**, প্রসেসিং হাব থেকে বলছি। আপনার যে কোনো ভিসা প্রসেসিং ও তথ্য দিয়ে সাহায্য করতে প্রস্তুত।`;
  }

  if (query === 'hi' || query === 'hello' || query === 'hey' || query === 'হ্যালো' || query === 'হাই' || query.includes('আসসালামু') || query.includes('কেমন আছেন')) {
    if (serviceContext?.title) {
      return `আসসালামু আলাইকুম ${detectCourtesyHonorific(userName)}! প্রসেসিং হাবে স্বাগতম। আমি **${agentName}**। **${serviceContext.title}** সম্পর্কে আপনার কী জানার আছে বলুন, সাহায্য করছি।`;
    }
    return `আসসালামু আলাইকুম ${detectCourtesyHonorific(userName)}! প্রসেসিং হাবে স্বাগতম। আমি **${agentName}**। আপনাকে কীভাবে সহযোগিতা করতে পারি?`;
  }

  // If specific serviceContext is active and user asks general question (e.g. documents, cost, processing, how to start)
  const isGeneralDocQuery = query.includes('ডকুমেন্ট') || query.includes('কাগজ') || query.includes('কি কি লাগে') || query.includes('চেকলিস্ট') || query.includes('requirement');
  const isGeneralCostQuery = query.includes('খরচ') || query.includes('ফি') || query.includes('টাকা') || query.includes('price') || query.includes('charge') || query.includes('cost');
  const isHowToQuery = query.includes('কিভাবে') || query.includes('আবেদন') || query.includes('প্রসেস') || query.includes('বুক') || query.includes('শুরু') || query.includes('নিতে চাই') || query.includes('করতে চাই');

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
        return `শুধুমাত্র আইভ্যাক স্লট বুকিং ফি ৳৪,৫০০ থেকে শুরু (প্রতিটি ভিসায় আইভ্যাক ফি ১,৫০০৳ ফিক্সড):\n\n` +
          `- **মেডিকেল / ডাবল এন্ট্রি X-3 / বিজনেস / স্টুডেন্ট / ট্রানজিট / এন্ট্রি X-Misc / স্পাউস X-1 স্লট:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n` +
          `- **ট্যুরিস্ট স্লট:** মোট ৳৫,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৪,০০০৳)`;
      }
      if (isServiceMedical) {
        return `**মেডিকেল ও অ্যাটেনডেন্ট ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,০০০\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceDouble) {
        return `**ডাবল এন্ট্রি (X-3) ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,৫০০\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceBusiness) {
        return `**বিজনেস ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,০০০\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceStudent) {
        return `**স্টুডেন্ট (S-1) ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৫,৫০০\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceTransit) {
        return `**ট্রানজিট (TR) ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৫,৫০০\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceSpouse) {
        return `**স্পাউস ও ফ্যামিলি (X-1) ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট:** ৳৬,০০০ (স্লট ৪,৫০০৳ + ডকুমেন্ট প্রসেসিং ১,৫০০৳)\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceEntry) {
        return `**এন্ট্রি (X-Misc) ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট:** ৳৬,০০০ (স্লট ৪,৫০০৳ + সার্ভিস চার্জ ১,৫০০৳)\n- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (titleLower.includes('tourist') || serviceContext.title.includes('ট্যুরিস্ট')) {
        return `**ট্যুরিস্ট ভিসার ফি বিবরণ:**\n\n- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,০০০\n- **শুধু স্লট বুকিং:** মোট ৳৫,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৪,০০০৳)`;
      }
      if (titleLower.includes('ticket') || serviceContext.title.includes('টিকেট')) {
        return `**টিকেট বুকিং সার্ভিস চার্জ:** মূল টিকেটের নির্ধারিত মূল্যের সাথে অতিরিক্ত **৳৫৯৯ থেকে শুরু** (আলোচনা সাপেক্ষে)।`;
      }
      return `${firstReplyHonorific}**${serviceContext.title}**-এর অফিশিয়াল ফি **${serviceContext.price || '৳৬,০০০'}**।`;
    }

    if (isGeneralDocQuery || isHowToQuery) {
      if (isServiceMedical) {
        return `${firstReplyHonorific}মেডিকেল ও অ্যাটেনডেন্ট ভিসার কাগজপত্রগুলো নিচে দিলাম:\n\n` +
          `- **সাধারণ ডকুমেন্টস:** মূল ও সকল পুরনো পাসপোর্ট, ২×২ সাদা ব্যাকগ্রাউন্ড ছবি, NID/জন্মনিবন্ধন, ইউটিলিটি বিল, পেশাগত সনদ এবং $২০০ এন্ডোর্সমেন্ট / সমপরিমাণ টাকার ৬ মাসের ব্যাংক স্টেটমেন্ট / SBI ট্রাভেল কার্ড।\n` +
          `- **রোগীর (M-1) অতিরিক্ত কাগজ:** ভারতীয় হাসপাতালের মূল অ্যাপয়েন্টমেন্ট ও AYUSH লেটার এবং বাংলাদেশের ডাক্তারের প্রেসক্রিপশন ও টেস্ট রিপোর্ট।\n` +
          `- **অ্যাটেনডেন্টের (M-2) কাগজ:** কেবল বেসিক ডকুমেন্টস ও রোগীর সাথে সম্পর্কের প্রমাণপত্র (আলাদা মেডিকেল টেস্ট রিপোর্ট লাগবে না)।`;
      }
      if (isServiceDouble) {
        return `${firstReplyHonorific}ডাবল এন্ট্রি (X-3) ভিসার জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
          `- অনলাইন Miscellaneous (X-3) আবেদন পত্র, মূল ও সকল পুরনো পাসপোর্ট এবং ২×২ সাদা ব্যাকগ্রাউন্ড ছবি\n` +
          `- সংশ্লিষ্ট ৩য়/ইউরোপীয় দেশের **এম্বাসির অফিশিয়াল অ্যাপয়েন্টমেন্ট লেটার**\n` +
          `- **ওয়ার্ক পারমিট (Work Permit)** সহ ইউরোপগামী চুক্তিকৃত কোম্পানির প্রয়োজনীয় কাগজপত্র\n` +
          `- কনফার্মড ফ্লাইট/ট্রানজিট রুট, কভারিং লেটার, NID ও ইউটিলিটি বিল\n` +
          `- পেশাগত প্রমাণপত্র এবং $২০০ এন্ডোর্সমেন্ট / সমপরিমাণ টাকার ৬ মাসের ব্যাংক স্টেটমেন্ট / SBI ট্রাভেল কার্ড।`;
      }
      if (isServiceBusiness) {
        return `${firstReplyHonorific}বিজনেস ভিসার জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
          `- আবেদন পত্র, মূল ও সকল পুরনো পাসপোর্ট, ২×২ ছবি, NID ও ইউটিলিটি বিল\n` +
          `- ভারতীয় কোম্পানির মূল ইনভাইটেশন লেটার ও বাংলাদেশি প্রতিষ্ঠানের ফরওয়ার্ডিং লেটার\n` +
          `- হালনাগাদ ট্রেড লাইসেন্স, চেম্বার অফ কমার্স সনদ, TIN, BIN, IRC, LC ও VAT রিটার্ন\n` +
          `- ব্যক্তিগত ও কোম্পানির বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট ($২০০ বা সমপরিমাণ / SBI কার্ড)।`;
      }
      if (isServiceStudent) {
        return `${firstReplyHonorific}স্টুডেন্ট ভিসার (S-1) জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
          `- অনলাইন আবেদন পত্র, মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID/জন্মনিবন্ধন ও ইউটিলিটি বিল\n` +
          `- ভারতের স্বীকৃত বিশ্ববিদ্যালয়/কলেজের মূল অ্যাডমিশন ও বোনাফাইড সার্টিফিকেট (মেডিকেলের ক্ষেত্রে স্বাস্থ্য মন্ত্রণালয়ের NOC)\n` +
          `- অভিভাবক/স্পনসরের ব্যাংক সলভেন্সি ও ৬ মাসের স্টেটমেন্ট ($২০০+ / SBI কার্ড)\n` +
          `- পূর্বের একাডেমিক সার্টিফিকেট ও বর্তমান স্টুডেন্ট আইডি কার্ড।`;
      }
      if (isServiceTransit) {
        return `${firstReplyHonorific}ট্রানজিট ভিসার (TR) জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
          `- অনলাইন আবেদন পত্র, মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID ও ইউটিলিটি বিল\n` +
          `- গন্তব্য ৩য় দেশের বৈধ ভিসা, কনফার্মড বাস/এয়ার টিকেট এবং হোটেল বুকিং\n` +
          `- পেশাগত প্রমাণপত্র ও $২০০ এন্ডোর্সমেন্ট / সমপরিমাণ ব্যাংক স্টেটমেন্ট / SBI ট্রাভেল কার্ড।`;
      }
      if (isServiceSpouse) {
        return `${firstReplyHonorific}স্পাউস ও ফ্যামিলি (X-1) ভিসার জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
          `- অনলাইন Miscellaneous (X-1) আবেদন পত্র, মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID ও ইউটিলিটি বিল\n` +
          `- নিকাহনামা / ম্যারিজ সার্টিফিকেট (ইংরেজি অনুবাদ, MoFA ও ভারতীয় হাইকমিশন সত্যায়িত)\n` +
          `- স্পাউসের ভারতীয় পাসপোর্ট / আধার / ভোটার আইডি ও ঠিকানার প্রমাণ\n` +
          `- পেশাগত সনদ (প্রযোজ্য ক্ষেত্রে) ও $২০০ এন্ডোর্সমেন্ট / ব্যাংক স্টেটমেন্ট / SBI কার্ড।`;
      }
      if (isServiceEntry) {
        return `${firstReplyHonorific}এন্ট্রি (X-Misc) ভিসার জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
          `- অনলাইন Miscellaneous (X-Misc) আবেদন পত্র, মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID ও ইউটিলিটি বিল\n` +
          `- X-Misc এন্ট্রি যোগ্যতার মূল প্রমাণপত্র / ইনভাইটেশন বা প্রিন্সিপাল পাসপোর্ট-ভিসা কপি\n` +
          `- পেশাগত প্রমাণপত্র ও $২০০ এন্ডোর্সমেন্ট / সমপরিমাণ ব্যাংক স্টেটমেন্ট / SBI ট্রাভেল কার্ড।`;
      }
      if (titleLower.includes('ticket') || serviceContext.title.includes('টিকেট')) {
        return `${firstReplyHonorific}টিকেট বুকিংয়ের বিস্তারিত তথ্য নিচে দিলাম:\n\n` +
          `- **সার্ভিস চার্জ:** মূল টিকেটের নির্ধারিত মূল্যের সাথে অতিরিক্ত **৳৫৯৯ থেকে শুরু** (আলোচনা সাপেক্ষে)।\n` +
          `- **সেবাসমূহ:** দেশ ও বিদেশের এয়ার টিকেট, ওয়ান-ওয়ে, রাউন্ড ট্রিপ, ট্রানজিট ও কনফার্মড রিটার্ন টিকেট বুকিং।\n` +
          `- **প্রয়োজনীয় তথ্য:** যাত্রীর পাসপোর্ট কপি, সম্ভাব্য তারিখ, গন্তব্য শহর ও ভিসা কপি (যদি থাকে)।`;
      }
      if (isServiceSlot) {
        return `${firstReplyHonorific}আইভ্যাক স্লট বুকিংয়ের জন্য কেবল নিচের দুইটি তথ্য লাগবে:\n\n` +
          `- পাসপোর্টের পরিষ্কার ছবি\n` +
          `- অনলাইন ভিসা ফর্মের ওয়েব ফাইল নম্বর (Web File No)।`;
      }
    }
  }

  // Double Entry Visa direct queries (X-3)
  if (query.includes('ডাবল') || query.includes('ডবল') || query.includes('double') || query.includes('x-3') || query.includes('এম্বাসি') || query.includes('পর্তুগাল') || query.includes('পোল্যান্ড') || query.includes('ওয়ার্ক পারমিট')) {
    if (query.includes('স্লট') || query.includes('slot')) {
      return `ডাবল এন্ট্রি (X-3) ভিসার স্লট ও প্রসেসিং ফি:\n\n` +
        `- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ফি ১,৫০০৳ + স্লট ফি ৩,০০০৳)\n` +
        `- **প্রসেসিং + স্লট (আইভ্যাক ফিসহ):** ৳৬,৫০০\n` +
        `- **যা লাগবে:** আপনার পাসপোর্টের কপি ও ভিসা ফর্মের ওয়েব ফাইল নম্বর।`;
    }
    return `ডাবল এন্ট্রি ভিসা — মিসেলেনিয়াস (X-3) ফি ও কাগজপত্র:\n\n` +
      `- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,৫০০\n` +
      `- **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n` +
      `- **অতিরিক্ত জরুরি কাগজপত্র:** যে দেশের এম্বাসি ফেস করবেন তার **অ্যাপয়েন্টমেন্ট লেটার**, **ওয়ার্ক পারমিট** সহ ইউরোপগামী চুক্তিকৃত কোম্পানির কাগজপত্র ও কভারিং লেটার।\n` +
      `- **কমন কাগজপত্র:** মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID, ইউটিলিটি বিল, NOC/ট্রেড লাইসেন্স এবং $২০০ এন্ডোর্সমেন্ট / ব্যাংক স্টেটমেন্ট / SBI ট্রাভেল কার্ড।`;
  }

  // Spouse & Family Visa (X-1)
  if (query.includes('স্পাউস') || query.includes('spouse') || query.includes('x-1') || query.includes('ফ্যামিলি ভিসা') || query.includes('নিকাহনামা') || query.includes('স্ত্রী') || query.includes('স্বামী')) {
    return `স্পাউস ও ফ্যামিলি ভিসা (X-1 মিসেলেনিয়াস) তথ্য ও ফি:\n\n` +
      `- **প্রসেসিং + স্লট:** **৳৬,০০০** (স্লট ৪,৫০০৳ + ডকুমেন্ট প্রসেসিং ১,৫০০৳)\n` +
      `- **শুধু স্লট বুকিং:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n` +
      `- **মূল কাগজপত্র:** মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID, ইউটিলিটি বিল, ইংরেজিতে MoFA ও হাইকমিশন সত্যায়িত নিকাহনামা/ম্যারিজ সার্টিফিকেট, স্পাউসের ভারতীয় পাসপোর্ট/আধার/ঠিকানার প্রমাণ এবং $২০০ এন্ডোর্সমেন্ট / ব্যাংক স্টেটমেন্ট / SBI কার্ড।`;
  }

  // Student Visa (S-1)
  if (query.includes('স্টুডেন্ট') || query.includes('student') || query.includes('পড়াশোনা') || query.includes('বিশ্ববিদ্যালয়') || query.includes('s-1')) {
    return `স্টুডেন্ট ভিসা (S-1) তথ্য ও ফি:\n\n` +
      `- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** **৳৫,৫০০**\n` +
      `- **শুধু স্লট বুকিং:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n` +
      `- **মূল কাগজপত্র:** মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID/জন্মনিবন্ধন, ইউটিলিটি বিল, ভারতীয় বিশ্ববিদ্যালয়/কলেজের মূল অ্যাডমিশন ও বোনাফাইড সার্টিফিকেট (মেডিকেলের ক্ষেত্রে স্বাস্থ্য মন্ত্রণালয়ের NOC), ৬ মাসের ব্যাংক সলভেন্সি ও স্টেটমেন্ট এবং একাডেমিক সনদ/স্টুডেন্ট আইডি।`;
  }

  // Notice board queries: Rejection reasons, Notice, Serial ordering
  if (query.includes('রিজেক্ট') || query.includes('প্রত্যাখ্যান') || query.includes('বাতিল') || query.includes('rejection') || query.includes('reject') || query.includes('ভিসা না পাওয়ার কারণ')) {
    return 'ইন্ডিয়ান ভিসা সাধারণত যেসব কারণে রিজেক্ট হয়:\n\n' +
      '- ফর্মে ভুল তথ্য পূরণ করা বা জাল/অসম্পূর্ণ ডকুমেন্ট সংযুক্ত করা\n' +
      '- পাসপোর্ট ও NID/জন্ম নিবন্ধনে তথ্যের অমিল থাকা\n' +
      '- পূর্বের সকল পুরনো পাসপোর্ট জমা না দেওয়া বা ভ্রমণ ভিসা নিয়ে ভারতে Over Stay করা\n' +
      '- আবেদন পত্র এবং বিদ্যুৎ বিলের ঠিকানায় অমিল থাকা\n' +
      '- পুরানো ছবি বা ২"×২" সাদা ব্যাকগ্রাউন্ড ছাড়া ছবি দেওয়া\n' +
      '- জাল NOC বা ভুয়া ব্যাংক/ডলার এন্ডোর্সমেন্ট দেওয়া।\n\n' +
      '*(অফিসিয়াল সহায়তা ইমেইল: visahelp@hcidhaka.gov.in)*';
  }

  // IVAC Centers / Location queries (ONLY the real 16 IVAC centers!)
  if (query.includes('সেন্টার') || query.includes('লোকেশন') || query.includes('কোথায়') || query.includes('অফিস') || query.includes('center') || query.includes('location') || query.includes('branch')) {
    return 'বাংলাদেশে ভারতীয় ভিসা জমা দেওয়ার অফিশিয়াল ১৬টি আইভ্যাক (IVAC) সেন্টার রয়েছে:\n\n' +
      '- **ঢাকা বিভাগ (১টি):** ঢাকা — যমুনা ফিউচার পার্ক (JFP), প্রগতি সরণি, বারিধারা\n' +
      '- **অন্যান্য ১৫টি কেন্দ্র:** চট্টগ্রাম, খুলনা, সিলেট, রাজশাহী, রংপুর, ময়মনসিংহ, বরিশাল, কুমিল্লা, নোয়াখালী, ব্রাহ্মণবাড়িয়া, ঠাকুরগাঁও, বগুড়া, কুষ্টিয়া, যশোর ও সাতক্ষীরা।\n\n' +
      'আমাদের **Processing Hub** সাপোর্ট সেন্টার ঢাকা যমুনা ফিউচার পার্ক সংলগ্ন কুড়িল, বারিধারায় অবস্থিত—আর অনলাইনে ৬৪ জেলা থেকে সব সেন্টারের স্লট ও প্রসেসিং সেবা দেওয়া হয়।';
  }

  // IVAC Schedule of charges
  if (query.includes('সরকারি ফি') || query.includes('ivac fee') || query.includes('আইভ্যাক ফি') || query.includes('পোর্ট চার্জ') || query.includes('correction') || query.includes('সংশোধন ফি') || query.includes('schedule of charges')) {
    return 'আইভ্যাক সেন্টারের সরকারি ফি তালিকা:\n\n' +
      '- ভিসা প্রসেসিং ফি: **১,৫০০ টাকা**\n' +
      '- অতিরিক্ত পোর্ট এন্ডোর্সমেন্ট: **৩০০ টাকা** (সর্বোচ্চ ২টি পোর্ট)\n' +
      '- অনলাইন ফর্ম সংশোধন: **৩০০ টাকা** (অনুমোদিত ফিল্ড)\n' +
      '- ফ্যাসিলিটেশন চার্জ (যমুনা ফিউচার পার্ক): **৩০০ টাকা**';
  }

  // Transit visa
  if (query.includes('ট্রানজিট') || query.includes('transit') || query.includes('ভুটান') || query.includes('নেপাল') || query.includes('চেংড়াবান্ধা') || query.includes('চ্যাংড়াবান্ধা') || query.includes('জয়গাঁ') || query.includes('রাণীগঞ্জ')) {
    return 'ট্রানজিট (TR) ভিসার ফি ও প্রয়োজনীয় কাগজপত্র:\n\n' +
      '- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** **৳৫,৫০০**\n' +
      '- **শুধু স্লট বুকিং:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
      '- **প্রয়োজনীয় কাগজপত্র:** মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID, ইউটিলিটি বিল, পেশাগত সনদ, $২০০ এন্ডোর্সমেন্ট / সমপরিমাণ ব্যাংক স্টেটমেন্ট / SBI কার্ড, গন্তব্য ৩য় দেশের বৈধ ভিসা (যেমন নেপাল), কনফার্মড বাস/এয়ার টিকেট ও হোটেল বুকিং।\n\n' +
      '*(ভুটান রুট: চ্যাংড়াবান্ধা/জয়গাঁ, নেপাল রুট: চ্যাংড়াবান্ধা/রাণীগঞ্জ)*';
  }

  // Entry visa (X-Misc)
  if (query.includes('এন্ট্রি ভিসা') || query.includes('entry visa') || query.includes('x-misc')) {
    return 'এন্ট্রি ভিসা (X-Misc — মিসেলেনিয়াস ক্যাটাগরি) তথ্য ও ফি:\n\n' +
      '- **প্রসেসিং + স্লট:** **৳৬,০০০** (স্লট ৪,৫০০৳ + সার্ভিস চার্জ ১,৫০০৳)\n' +
      '- **শুধু স্লট বুকিং:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
      '- **প্রয়োজনীয় কাগজপত্র:** অনলাইন X-Misc আবেদন পত্র, মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID, ইউটিলিটি বিল, পেশাগত সনদ, $২০০ এন্ডোর্সমেন্ট / সমপরিমাণ ব্যাংক স্টেটমেন্ট / SBI কার্ড এবং X-Misc এন্ট্রি যোগ্যতা/সম্পর্কের মূল সনদ।';
  }

  // Air & Travel Ticket Booking
  if (query.includes('টিকিট') || query.includes('টিকেট') || query.includes('ticket') || query.includes('এয়ার টিকেট') || query.includes('এয়ার টিকিট') || query.includes('flight') || query.includes('ফ্লাইট')) {
    return 'টিকেট বুকিং সেবার বিবরণ:\n\n' +
      '- **সার্ভিস চার্জ:** মূল টিকেটের নির্ধারিত মূল্যের সাথে অতিরিক্ত **৳৫৯৯ থেকে শুরু** (রুট অনুযায়ী আলোচনা সাপেক্ষে)।\n' +
      '- **সেবাসমূহ:** দেশ ও বিদেশের সকল ধরনের এয়ার টিকেট, ওয়ান-ওয়ে, রাউন্ড ট্রিপ, ট্রানজিট ও কনফার্মড রিটার্ন টিকেট বুকিং।\n' +
      '- **প্রয়োজনীয় ডকুমেন্টস:** যাত্রীর পাসপোর্টের পরিষ্কার কপি, ভ্রমণের তারিখ/গন্তব্য এবং ভিসা কপি (যদি থাকে)।';
  }

  // Business Visa
  if (query.includes('বিজনেস') || query.includes('business') || query.includes('ব্যবসা') || query.includes('ট্রেড') || query.includes('এলসি') || query.includes('টিন') || query.includes('ভ্যাট')) {
    return 'বিজনেস ভিসার প্রয়োজনীয় তথ্য ও ফি:\n\n' +
      '- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** **৳৬,০০০**\n' +
      '- **শুধু স্লট বুকিং:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
      '- **কমন কাগজপত্র:** মূল ও পুরনো পাসপোর্ট, ২×২ ছবি, NID, ইউটিলিটি বিল।\n' +
      '- **বিজনেস কাগজপত্র:** ভারতীয় কোম্পানির মূল ইনভাইটেশন লেটার, বাংলাদেশি প্রতিষ্ঠানের ফরওয়ার্ডিং লেটার, হালনাগাদ ট্রেড লাইসেন্স, চেম্বার অফ কমার্স সনদ, TIN, BIN, IRC, LC, VAT রিটার্ন এবং ব্যক্তিগত ও কোম্পানির বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট।';
  }

  // Medical Visa & Attendant
  if (query.includes('মেডিকেল') || query.includes('medical') || query.includes('রোগী') || query.includes('ডাক্তার') || query.includes('হাসপাতাল') || query.includes('ইনভাইটেশন') || query.includes('ayush') || query.includes('অ্যাটেনডেন্ট') || query.includes('attendant')) {
    return 'মেডিকেল (M-1) ও অ্যাটেনডেন্ট (M-2) ভিসার তথ্য ও ফি:\n\n' +
      '- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ ও ইনভাইটেশনসহ):** **৳৬,০০০**\n' +
      '- **শুধু স্লট বুকিং:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
      '- **রোগীর (M-1) কাগজ:** কমন কাগজপত্র (পাসপোর্ট, ২×২ ছবি, NID, ইউটিলিটি বিল, পেশাগত সনদ, $২০০ এন্ডোর্সমেন্ট/৬ মাসের ব্যাংক স্টেটমেন্ট/SBI কার্ড) + ভারতীয় হাসপাতালের মূল অ্যাপয়েন্টমেন্ট ও AYUSH লেটার + বাংলাদেশের ডাক্তারের প্রেসক্রিপশন ও টেস্ট রিপোর্ট।\n' +
      '- **অ্যাটেনডেন্টের (M-2) কাগজ:** কেবল বেসিক কমন ডকুমেন্টস ও রোগীর সাথে সম্পর্কের প্রমাণপত্র (অ্যাটেনডেন্টের আলাদা মেডিকেল টেস্ট রিপোর্ট বা প্রেসক্রিপশন লাগবে না)।';
  }

  // Tourist Visa
  if (query.includes('ট্যুরিস্ট') || query.includes('tourist') || query.includes('ভ্রমণ') || query.includes('ঘুরতে')) {
    return 'ট্যুরিস্ট ভিসার প্রয়োজনীয় তথ্য ও ফি:\n\n' +
      '- **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** **৳৬,০০০**\n' +
      '- **শুধু স্লট বুকিং:** মোট **৳৫,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৪,০০০৳)\n' +
      '- **প্রয়োজনীয় কাগজপত্র:** অনলাইন আবেদন পত্র, মূল ও সকল পুরনো পাসপোর্ট, ২×২ ছবি, NID/জন্মনিবন্ধন, ইউটিলিটি বিল, পেশাগত প্রমাণপত্র (NOC/ট্রেড লাইসেন্স/স্টুডেন্ট আইডি) এবং **$২০০ ডলার এন্ডোর্সমেন্ট / সমপরিমাণ টাকার ৬ মাসের ব্যাংক স্টেটমেন্ট / SBI ট্রাভেল কার্ড**।';
  }

  // Slot release date queries
  if (
    (query.includes('কবে') || query.includes('next') || query.includes('তারিখ') || query.includes('সময়') || query.includes('সময়') || query.includes('রিলিজ') || query.includes('ছাড়বে') || query.includes('ওপেন')) &&
    (query.includes('স্লট') || query.includes('slot') || query.includes('ডেট') || query.includes('অ্যাপয়েন্টমেন্ট'))
  ) {
    return 'আইভ্যাক অ্যাপয়েন্টমেন্ট স্লট ছাড়ার নিয়মটা একটু আলাদা:\n\n' +
      '- আইভ্যাকের নিয়ম অনুযায়ী স্লট রিলিজের নির্দিষ্ট দিনক্ষণ আগে থেকে ঘোষণা করা হয় না।\n' +
      '- সিস্টেমে যখন নতুন ব্যাচ ওপেন হয়, তখনই সার্বক্ষণিক মনিটরিং করে দ্রুত বুকিং নিতে হয়।\n' +
      '- অনুমান করে কোনো তারিখ বলা ঠিক হবে না—তবে ফাইল রেডি রাখলে স্লট ছাড়ামাত্রই আমাদের টিম আপনার বুকিং করে দিতে পারবে।\n\n' +
      'বিস্তারিত জানতে চাইলে আমাদের হটলাইন/WhatsApp নম্বরে (+8801577464706) যোগাযোগ করতে পারেন।';
  }

  // Slot booking / IVAC
  if (query.includes('স্লট') || query.includes('slot') || query.includes('আইভ্যাক') || query.includes('ivac') || query.includes('তারিখ') || query.includes('অ্যাপয়েন্টমেন্ট')) {
    return 'আইভ্যাক স্লট বুকিং ফি **৳৪,৫০০ থেকে শুরু** (প্রতিটি ভিসায় আইভ্যাক সরকারি ফি ৳১,৫০০ ফিক্সড):\n\n' +
      '- **মেডিকেল / ডাবল এন্ট্রি X-3 / বিজনেস / স্টুডেন্ট S-1 / ট্রানজিট TR / এন্ট্রি X-Misc / স্পাউস X-1 স্লট:** মোট **৳৪,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
      '- **ট্যুরিস্ট স্লট:** মোট **৳৫,৫০০** (আইভ্যাক ১,৫০০৳ + স্লট ৪,০০০৳)\n\n' +
      'স্লট বুক করতে আপনার পাসপোর্টের কপি ও ওয়েব ফাইল নম্বর লাগবে।';
  }

  // Cost / Pricing General
  if (query.includes('খরচ') || query.includes('ফি') || query.includes('টাকা') || query.includes('cost') || query.includes('fee') || query.includes('price') || query.includes('charge')) {
    return 'আমাদের ভিসা ও স্লট ফি তালিকা:\n\n' +
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
  if (query.includes('ব্যাংক') || query.includes('bank') || query.includes('স্টেটমেন্ট') || query.includes('ব্যালেন্স') || query.includes('ডলার') || query.includes('sbi') || query.includes('এসবিআই') || query.includes('টাকা থাকতে')) {
    return 'ব্যাংক স্টেটমেন্ট, ডলার এন্ডোর্সমেন্ট ও ট্রাভেল কার্ডের নিয়মগুলো হলো:\n\n' +
      '- পাসপোর্টে ন্যূনতম **$২০০ ডলার এন্ডোর্সমেন্ট**, অথবা\n' +
      '- সমপরিমাণ টাকা ব্যাংক অ্যাকাউন্টে থাকা অবস্থায় বিগত **৬ মাসের ব্যাংক স্টেটমেন্ট**, অথবা\n' +
      '- স্টেট ব্যাংক অফ ইন্ডিয়া (SBI) কর্তৃক প্রদত্ত **SBI ট্রাভেল কার্ড** বা ইন্টারন্যাশনাল ট্রাভেল কার্ড।';
  }

  // Photo specifications
  if (query.includes('ছবি') || query.includes('photo') || query.includes('picture') || query.includes('সাইজ')) {
    return 'ভিসার ছবির সঠিক মাপ ও নিয়ম:\n\n' +
      '- সাইজ: ২×২ ইঞ্চি (50mm × 50mm) ল্যাব প্রিন্ট।\n' +
      '- ব্যাকগ্রাউন্ড: সম্পূর্ণ পরিষ্কার সাদা (White Background)।\n' +
      '- কান ও কপাল স্পষ্ট থাকতে হবে, এবং ছবি ৩ মাসের বেশি পুরনো হওয়া যাবে না।';
  }

  // Contact / Phone / Address
  if (query.includes('ফোন') || query.includes('নম্বর') || query.includes('যোগাযোগ') || query.includes('ঠিকানা') || query.includes('contact') || query.includes('phone') || query.includes('address') || query.includes('whatsapp') || query.includes('হোয়াটসঅ্যাপ')) {
    return 'আমাদের সাথে সরাসরি যোগাযোগের মাধ্যম:\n\n' +
      '- হটলাইন ও WhatsApp: **+8801577464706**\n' +
      '- অফিস: যমুনা ফিউচার পার্ক সংলগ্ন, কুড়িল, বারিধারা, ঢাকা-১২২৯\n' +
      '- ওয়েবসাইট ও ইমেইল: processinghub.fun | support@processinghub.fun';
  }

  // Duration / Time required
  if (query.includes('কত দিন') || query.includes('সময়') || query.includes('লাগে') || query.includes('duration') || query.includes('time') || query.includes('ডেলিভারি')) {
    return 'ভিসা প্রসেসিং ও ডেলিভারির সাধারণ সময়সীমা:\n\n' +
      '• আমাদের ফাইল প্রসেসিং: **১ থেকে ২ কর্মদিবস**\n' +
      '• আইভ্যাকে জমা দেওয়ার পর ডেলিভারি: ভারতীয় হাইকমিশনের নিয়ম অনুযায়ী সাধারণত **৭ থেকে ১৫ কর্মদিবস**।';
  }

  // Conversation Closings / Thank you / Service done
  if (query.includes('ধন্যবাদ') || query.includes('thank') || query.includes('থ্যাংক') || query.includes('আল্লাহ হাফেজ') || query.includes('bye') || query.includes('বাই') || query.includes('বিদায়') || query.includes('বিদায়') || query.includes('কাজ শেষ') || query.includes('বুঝেছি') || query.includes('ঠিক আছে')) {
    return 'প্রসেসিং হাবের সাথে যোগাযোগ করার জন্য আন্তরিক ধন্যবাদ! ভবিষ্যতে যেকোনো ভিসা বা ভ্রমণ সংক্রান্ত প্রয়োজনে আমরা সর্বদা পাশে আছি। আপনার যাত্রা শুভ ও নিরাপদ হোক, আল্লাহ হাফেজ।';
  }

  // Default Reply
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
app.post('/api/chat/end-session', async (req, res) => {
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
app.post('/api/chat', async (req, res) => {
  const agentName = sanitizeAgentName(req.body?.agentName);
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
    let contextualSystemInstruction = `${buildSystemInstruction(agentName)}\n${SHARED_KNOWLEDGE_BASE}\n${WEBSITE_FULL_CONTEXT}${adaptiveKnowledgeSection}${pastUserMemorySection}`;
    if (userName) {
      contextualSystemInstruction += `\n\n### CLIENT IDENTITY & NATURAL ADDRESSING:
Client Name: "${userName}"${userPhone ? ` | Phone: "${userPhone}"` : ''}.
Current User Message Count in Session: ${userMsgCount}.
- ${isFirstReply
  ? `This is your FIRST reply to this user. Address them politely ONCE as "স্যার" (if "${userName}" is male) or "ম্যাডাম"/"ম্যাম" (if "${userName}" is female), or a polite neutral greeting if gender is unclear. NEVER say "${userName} সাহেব".`
  : `This is a FOLLOW-UP reply (message #${userMsgCount}). STRICTLY DO NOT repeat their name ("${userName}"), "সাহেব", "স্যার", or "ম্যাডাম"/"ম্যাম". Speak completely naturally face-to-face.`
}
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
Prioritize concise, accurate, actionable guidance specifically for "${serviceContext.title}".
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
                    text: `[সংযুক্ত ফাইল: ${att.name || 'document.txt'}]\n${decodedText.slice(0, 15000)}`,
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
              parts.push({ text: `[পূর্বে সংযুক্ত ফাইল: ${att.name}]` });
            }
          }
        }

        const trimmedText = typeof msg.text === 'string' ? msg.text.trim() : '';
        if (trimmedText) {
          parts.push({ text: trimmedText });
        } else if (parts.length > 0 && role === 'user') {
          parts.push({
            text: 'এই সংযুক্ত ছবি বা পিডিএফ ফাইলটি ভালোভাবে পড়ে বিশ্লেষণ করুন, মূল তথ্যগুলো তুলে ধরুন এবং আমাদের ভিসা/সার্ভিস অনুযায়ী পরবর্তী করণীয় বা পদক্ষেপ কী হবে তা স্পষ্টভাবে বলুন।',
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
                    title: chunk.web?.title || 'অফিসিয়াল তথ্যসূত্র',
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

    // High-quality deterministic fallback with dynamic agent name & service context
    const fallbackReply = generateAgentFallbackReply(
      lastUserMessage,
      serviceContext,
      agentName,
      isFirstReply,
      userName,
      lastAttachments
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
      lastAttachments
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
let leadSerialCounter: number | null = null;
let leadSerialLock: Promise<void> = Promise.resolve();

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
      await fs.mkdir(path.dirname(LEAD_SERIAL_FILE), { recursive: true });
      await fs.writeFile(
        LEAD_SERIAL_FILE,
        JSON.stringify({ lastSerial: leadSerialCounter, updatedAt: new Date().toISOString() }, null, 2),
        'utf8'
      );
    } catch (err) {
      console.warn('[LeadSerial] Failed to persist counter:', err);
    }
  });

  await leadSerialLock;
  return result;
}

// API endpoint for dispatching callback requests to Telegram
app.post('/api/telegram/callback', async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
    const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const tgConfig = getTelegramConfig();
    if (!tgConfig) {
      return res.json({ success: false, skipped: true, reason: 'Telegram credentials not configured' });
    }

    const serial = await getNextLeadSerial();

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
    return res.json({ success: true, serialNumber: serial.code, telegram: tgData });
  } catch (error: any) {
    console.error('Telegram callback error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to dispatch callback alert' });
  }
});

// API endpoint for dispatching consultation summary to Telegram
app.post('/api/telegram/summary', async (req, res) => {
  try {
    const { user, serviceContext, messages, agentName: rawAgentName } = req.body;
    const agentName = sanitizeAgentName(rawAgentName);

    // Only proceed if there are actual user messages
    const userMessages = (messages || []).filter((m: any) => m.role === 'user');
    if (!userMessages || userMessages.length === 0) {
      return res.json({ success: true, skipped: true, reason: 'No user messages to summarize' });
    }

    const tgConfig = getTelegramConfig();
    if (!tgConfig) {
      return res.json({ success: false, skipped: true, reason: 'Telegram credentials not configured' });
    }
    const { botToken, chatId } = tgConfig;

    const customerName = user?.name || 'অজ্ঞাত গ্রাহক';
    const customerPhone = user?.phone || 'প্রদান করা হয়নি';
    const serviceTitle = serviceContext?.title || 'সাধারণ ভিসা জিজ্ঞাসা';

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

    const serial = await getNextLeadSerial();

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

    return res.json({ success: true, serialNumber: serial.code, telegram: tgData });
  } catch (error: any) {
    console.error('Telegram summary error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to dispatch telegram summary' });
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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Processing Hub server running on http://0.0.0.0:${PORT}`);
    startKeepAliveHeartbeat();
  });
}

startServer();
