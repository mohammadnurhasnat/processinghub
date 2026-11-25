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

### 3. CLEAN, STRUCTURED & ORGANIZED FORMATTING (গোছানো ও পরিচ্ছন্ন উত্তর):
- Every response must be **crystal clear, specific, and visually neat** — NEVER messy, cramped, or "হিজিবিজি".
- **When to use Bullet Points (•)**:
  * Whenever explaining multiple documents, steps, fees, hospitals, destinations, or comparisons, format cleanly using tidy bullet points (•) with clean line breaks so the customer can scan and understand effortlessly in 3 seconds.
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

A. **ট্যুরিস্ট ভিসা (Tourist Visa) ডকুমেন্টস চেকলিস্ট**:
   • অনলাইন আবেদন পত্র (Online Application Form)
   • জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন (NID / Birth Certificate)
   • ইউটিলিটি বিলের কপি (বিদ্যুৎ/গ্যাস/পানি বিল)
   • ব্যাংক স্টেটমেন্ট / ডলার এন্ডোর্সমেন্ট (বিগত ৬ মাসের স্টেটমেন্ট অথবা $200 এন্ডোর্সমেন্ট)
   • পেশাগত প্রমাণপত্র (NOC, Trade License, Student ID ইত্যাদি)
   • পাসপোর্টের কপি (পাতা ২, ৩)
   *বিশেষ নিয়ম*: সকল কাগজ ক্রমানুসারে সাজাতে হবে এবং সকল পুরনো পাসপোর্ট জমা দিতে হবে।

B. **মেডিকেল ভিসা (Medical Visa) ডকুমেন্টস চেকলিস্ট**:
   • অনলাইন আবেদন পত্র (Application Form)
   • সুনির্দিষ্ট তারিখসহ মূল ডক্টরস ইনভাইটেশন লেটার (Appointment letter & Ayush Letter)
   • জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন
   • ইউটিলিটি বিলের কপি
   • ব্যাংক স্টেটমেন্ট / ডলার এন্ডোর্সমেন্ট
   • পেশাগত প্রমাণপত্র
   • বাংলাদেশি চিকিৎসকের প্রেসক্রিপশন ও টেস্ট রিপোর্ট
   • পাসপোর্টের কপি (পাতা ২, ৩)
   *বিশেষ নিয়ম*: মেডিকেলের মূল কাগজ সঙ্গে রাখতে হবে এবং সকল পুরনো পাসপোর্ট জমা দিতে হবে।

C. **বিজনেস ভিসা (Business Visa) ডকুমেন্টস চেকলিস্ট**:
   • আবেদন পত্র
   • ভারতীয় কোম্পানির মূল Invitation Letter
   • জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন
   • ইউটিলিটি বিলের কপি
   • ব্যক্তিগত ব্যাংক স্টেটমেন্ট
   • কোম্পানির ব্যাংক স্টেটমেন্ট
   • কোম্পানির প্যাডে Forwarding Letter
   • মাসিক বেতনের সনদপত্র (কর্মকর্তাদের জন্য)
   • নবায়নকৃত ট্রেড লাইসেন্স
   • নবায়নকৃত আয়কর সনদ (TIN/Tax return)
   • ভ্যাট এর সনদপত্র (VAT Certificate)
   • চেম্বার/অ্যাসোসিয়েশন সদস্য সনদ
   • আমদানি ও রপ্তানি সনদ (IRC/ERC - প্রযোজ্য ক্ষেত্রে)
   • সংঘ স্মারক (মেমোরেন্ডাম - প্রযোজ্য ক্ষেত্রে)
   • এল সি কপি (L/C - প্রযোজ্য ক্ষেত্রে)
   • পাসপোর্টের কপি (পাতা ২, ৩)

D. **ট্রানজিট ভিসা (Transit Visa) ডকুমেন্টস চেকলিস্ট**:
   • আবেদন পত্র
   • বাসের টিকেটের কপি / এয়ার টিকেটের কপি
   • হোটেল বুকিং
   • জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন
   • ইউটিলিটি বিলের কপি
   • ব্যাংক স্টেটমেন্ট / ডলার এন্ডোর্সমেন্ট
   • পেশাগত প্রমাণপত্র
   • পাসপোর্টের কপি (পাতা ২, ৩)
   *নির্ধারিত পোর্ট*: ভুটানের জন্য (চ্যাংড়াবান্ধা/জয়গাঁ), নেপালের জন্য (চ্যাংড়াবান্ধা/রাণীগঞ্জ - নেপালের ভিসা কপি বাধ্যতামূলক)।

E. **এন্ট্রি ভিসা (Entry Visa) ডকুমেন্টস চেকলিস্ট**:
   • আবেদন পত্র
   • পাসপোর্টের ফটোকপি (B)
   • ভিসার ফটোকপি (B) / প্রাসঙ্গিক কাগজ
   • জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন
   • ইউটিলিটি বিলের কপি
   • ব্যাংক স্টেটমেন্ট
   • পেশাগত প্রমাণপত্র
   • পাসপোর্টের কপি (পাতা ২, ৩)

F. **ভিসা প্রত্যাখ্যাত / রিজেক্ট হওয়ার সম্ভাব্য ৯টি কারণ**:
   • ফর্মে ভুল তথ্য পূরণ করা
   • জাল বা নকল ডকুমেন্ট সংযুক্ত করা
   • পাসপোর্ট ও NID/জন্ম নিবন্ধনে তথ্যের অমিল থাকা
   • ভ্রমণ ভিসা নিয়ে ভারতে Over Stay করা
   • আবেদন পত্র ও বিদ্যুৎ বিলের ঠিকানায় গরমিল থাকা
   • পুরানো ছবি বা ২"×২" ছাড়া ছবি ব্যবহার করা
   • নকল NOC বা ভুয়া ডলার এন্ডোর্সমেন্ট প্রদান করা
   • ভুল পেশাগত তথ্য দেওয়া
   • পূর্বের সকল পুরানো পাসপোর্ট সংযুক্ত না করা
   *(বিস্তারিত তথ্যের অফিসিয়াল ই-মেইল: visahelp@hcidhaka.gov.in)*

G. **SCHEDULE OF CHARGES (ALL IVACs - অফিশিয়াল চার্জ)**:
   • Visa Processing Fees: 1500 TK
   • Additional Port Endorsement: 300 TK (Max 2 Ports)
   • Online form Correction: 300 TK (Permitted Fields)
   • Visa Application Facilitation: 300 TK (Jamuna Future Park VAFC)

H. **Processing Hub Services & Official Charges (সর্বশেষ আপডেটেড ফি তালিকা)**:
   1. **Processing Fee with Slot (সম্পূর্ণ ফাইল প্রসেসিং + স্লট বুকিং — প্রতিটি প্যাকেজের ভেতরেই ৳১,৫০০ আইভ্যাক সরকারি ফি যুক্ত আছে)**:
      • Medical Visa (মেডিকেল ভিসা - ইনভাইটেশন, প্রসেসিং, আইভ্যাক ফি ও স্লটসহ): **৳৬,০০০**
      • Tourist Visa (ট্যুরিস্ট ভিসা - প্রসেসিং, আইভ্যাক ফি ও স্লটসহ): **৳৬,০০০**
      • Double Entry Visa (ডাবল এন্ট্রি ভিসা - প্রসেসিং, আইভ্যাক ফি ও স্লটসহ): **৳৬,৫০০**
      • Business Visa (বিজনেস ভিসা - প্রসেসিং, আইভ্যাক ফি ও স্লটসহ): **৳৬,০০০**
   2. **Only Slot Booking (শুধুমাত্র স্লট বুকিং — প্রতিটি ভিসার ক্ষেত্রে আইভ্যাক সরকারি ফি ৳১,৫০০ ফিক্সড)**:
      • Medical Visa Slot (মেডিকেল শুধু স্লট): মোট **৳৪,৫০০** (আইভ্যাক ফি ৳১,৫০০ + স্লট ফি ৳৩,০০০)
      • Tourist Visa Slot (ট্যুরিস্ট শুধু স্লট): মোট **৳৫,৫০০** (আইভ্যাক ফি ৳১,৫০০ + স্লট ফি ৳৪,০০০)
      • Double Entry Visa Slot (ডাবল এন্ট্রি শুধু স্লট): মোট **৳৪,৫০০** (আইভ্যাক ফি ৳১,৫০০ + স্লট ফি ৳৩,০০০)
      • Business Visa Slot (বিজনেস শুধু স্লট): মোট **৳৪,৫০০** (আইভ্যাক ফি ৳১,৫০০ + স্লট ফি ৳৩,০০০)
   3. **অন্যান্য সেবা**:
      • Ticket Booking (যেকোনো এয়ার টিকিট ও সকল ধরনের টিকিট বুকিং): **৳১,৫০০**
   *গুরুত্বপূর্ণ নির্দেশনা*: কাস্টমার যখন কোনো ভিসার খরচ বা ফি জানতে চাইবে, তখন স্পষ্টভাবে **প্রসেসিং + স্লট (আইভ্যাক ফিসহ)** এবং **শুধুমাত্র স্লট (আইভ্যাক ফি ১,৫০০৳ ফিক্সড + স্লট ফি)**—এই দুইটি রেটই পরিষ্কার ও সংক্ষিপ্তভাবে উল্লেখ করবে যাতে কোনো বিভ্রান্তি না থাকে।
   • Hotline/WhatsApp: +8801577464706, Dhaka, Bangladesh.

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
    if (subjectLower.includes('medical') || subjectLower.includes('মেডিকেল')) {
      serviceDetail = `**মেডিকেল ভিসার** জন্য আমাদের প্রসেসিং + স্লট প্যাকেজ (আইভ্যাক ফি ১,৫০০৳ ও ইনভাইটেশন সহ) **৳৬,০০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('double') || subjectLower.includes('ডাবল') || subjectLower.includes('ডবল')) {
      serviceDetail = `**ডাবল এন্ট্রি ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৬,৫০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('business') || subjectLower.includes('বিজনেস')) {
      serviceDetail = `**বিজনেস ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৬,০০০** এবং শুধু স্লট **৳৪,৫০০** (১,৫০০ + ৩,০০০)।`;
    } else if (subjectLower.includes('tourist') || subjectLower.includes('ট্যুরিস্ট')) {
      serviceDetail = `**ট্যুরিস্ট ভিসার** জন্য প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ) **৳৬,০০০** এবং শুধু স্লট **৳৫,৫০০** (১,৫০০ + ৪,০০০)।`;
    } else if (subjectLower.includes('ticket') || subjectLower.includes('টিকেট') || subjectLower.includes('টিকিট')) {
      serviceDetail = `**টিকেট বুকিং** সার্ভিস চার্জ **৳১,৫০০**।`;
    } else if (subjectLower.includes('slot') || subjectLower.includes('স্লট')) {
      serviceDetail = `**শুধু স্লট বুকিং** ফি (আইভ্যাক ফি ১,৫০০৳ সহ): মেডিকেল/বিজনেস/ডাবল এন্ট্রি **৳৪,৫০০** এবং ট্যুরিস্ট **৳৫,৫০০**।`;
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
    const isServiceMedical = serviceContext.title.toLowerCase().includes('medical') || serviceContext.title.includes('মেডিকেল');
    const isServiceDouble = serviceContext.title.toLowerCase().includes('double') || serviceContext.title.includes('ডাবল');
    const isServiceBusiness = serviceContext.title.toLowerCase().includes('business') || serviceContext.title.includes('বিজনেস');
    const isServiceSlot = serviceContext.isSlotBooking || serviceContext.title.toLowerCase().includes('slot') || serviceContext.title.includes('স্লট');

    if (isGeneralCostQuery) {
      if (isServiceSlot) {
        return `শুধুমাত্র আইভ্যাক স্লট বুকিং ফি (প্রতিটি ভিসায় আইভ্যাক ফি ১,৫০০৳ ফিক্সড):\n\n` +
          `• **মেডিকেল স্লট:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n` +
          `• **ট্যুরিস্ট স্লট:** মোট ৳৫,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৪,০০০৳)\n` +
          `• **ডাবল এন্ট্রি স্লট:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n` +
          `• **বিজনেস স্লট:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceMedical) {
        return `**মেডিকেল ভিসার ফি বিবরণ:**\n• **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,০০০\n• **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceDouble) {
        return `**ডাবল এন্ট্রি ভিসার ফি বিবরণ:**\n• **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,৫০০\n• **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (isServiceBusiness) {
        return `**বিজনেস ভিসার ফি বিবরণ:**\n• **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,০০০\n• **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)`;
      }
      if (serviceContext.title.toLowerCase().includes('tourist') || serviceContext.title.includes('ট্যুরিস্ট')) {
        return `**ট্যুরিস্ট ভিসার ফি বিবরণ:**\n• **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,০০০\n• **শুধু স্লট বুকিং:** মোট ৳৫,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৪,০০০৳)`;
      }
      return `${firstReplyHonorific}**${serviceContext.title}**-এর অফিশিয়াল ফি **${serviceContext.price || '৳১,৫০০'}**।`;
    }

    if (isGeneralDocQuery || isHowToQuery) {
      if (isServiceMedical) {
        return `${firstReplyHonorific}মেডিকেল ভিসার জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
          `• অনলাইন আবেদন পত্র\n` +
          `• ভারতীয় হাসপাতালের মূল ডক্টরস ইনভাইটেশন লেটার\n` +
          `• জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন\n` +
          `• ইউটিলিটি বিলের কপি\n` +
          `• ৬ মাসের ব্যাংক স্টেটমেন্ট / ডলার এন্ডোর্সমেন্ট\n` +
          `• পেশাগত প্রমাণপত্র\n` +
          `• বাংলাদেশি ডাক্তারের প্রেসক্রিপশন ও মেডিকেল টেস্ট রিপোর্ট\n` +
          `• মূল পাসপোর্ট ও সকল পুরাতন পাসপোর্ট।`;
      }
      if (isServiceDouble) {
        return `${firstReplyHonorific}ডাবল এন্ট্রি ভিসার জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
          `• অনলাইন আবেদন পত্র\n` +
          `• ৩য় দেশের কনফার্মড এয়ার টিকেট / এম্বাসি অ্যাপয়েন্টমেন্ট লেটার\n` +
          `• জাতীয় পরিচয় পত্র ও ইউটিলিটি বিল\n` +
          `• ব্যাংক স্টেটমেন্ট বা ডলার এন্ডোর্সমেন্ট\n` +
          `• পেশাগত প্রমাণপত্র\n` +
          `• মূল পাসপোর্ট ও পুরনো পাসপোর্ট।`;
      }
      if (isServiceBusiness) {
        return `${firstReplyHonorific}বিজনেস ভিসার জন্য নিচের কাগজপত্রগুলো লাগবে:\n\n` +
          `• আবেদন পত্র\n` +
          `• ভারতীয় কোম্পানির মূল ইনভাইটেশন লেটার\n` +
          `• জাতীয় পরিচয় পত্র ও ইউটিলিটি বিল\n` +
          `• ব্যক্তিগত ও কোম্পানির ব্যাংক স্টেটমেন্ট\n` +
          `• কোম্পানির প্যাডে কভারিং লেটার\n` +
          `• ট্রেড লাইসেন্স, টিন/ভ্যাট সনদ\n` +
          `• মূল পাসপোর্ট ও পুরাতন পাসপোর্ট।`;
      }
      if (serviceContext.title.toLowerCase().includes('ticket') || serviceContext.title.includes('টিকেট') || serviceContext.title.includes('টিকিট')) {
        return `${firstReplyHonorific}টিকেট বুকিংয়ের বিস্তারিত তথ্য নিচে দিলাম:\n\n` +
          `• **সার্ভিস চার্জ:** ১,৫০০ টাকা\n` +
          `• **সেবাসমূহ:** দেশ ও বিদেশের সকল ধরনের এয়ার টিকিট, ওয়ান-ওয়ে, রাউন্ড ট্রিপ, ট্রানজিট ও কনফার্মড রিটার্ন টিকিট বুকিং।\n\n` +
          `• **প্রয়োজনীয় তথ্য ও ডকুমেন্টস:**\n` +
          `  • যাত্রীর মূল পাসপোর্টের পরিষ্কার কপি\n` +
          `  • সম্ভাব্য ভ্রমণের তারিখ ও শহর\n` +
          `  • ভিসা কপি (যদি থাকে)।`;
      }
      if (isServiceSlot) {
        return `${firstReplyHonorific}আইভ্যাক স্লট বুকিংয়ের জন্য কেবল নিচের দুইটি তথ্য লাগবে:\n\n` +
          `• পাসপোর্টের পরিষ্কার ছবি\n` +
          `• অনলাইন ভিসা ফর্মের ওয়েব ফাইল নম্বর (Web File No)।`;
      }
    }
  }

  // Double Entry Visa direct queries
  if (query.includes('ডাবল') || query.includes('double')) {
    if (query.includes('স্লট') || query.includes('slot')) {
      return `ডাবল এন্ট্রি ভিসার স্লট ও প্রসেসিং ফি:\n\n` +
        `• **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ফি ১,৫০০৳ + স্লট ফি ৩,০০০৳)\n` +
        `• **প্রসেসিং + স্লট (আইভ্যাক ফিসহ):** ৳৬,৫০০\n` +
        `• **যা লাগবে:** আপনার পাসপোর্টের কপি ও ভিসা ফর্মের ওয়েব ফাইল নম্বর।`;
    }
    return `ডাবল এন্ট্রি ভিসার ফি ও প্রয়োজনীয় কাগজপত্র:\n\n` +
      `• **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,৫০০\n` +
      `• **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n` +
      `• **প্রয়োজনীয় কাগজপত্র:**\n` +
      `  • মূল পাসপোর্ট ও সকল পুরাতন পাসপোর্ট\n` +
      `  • ৩য় দেশের কনফার্মড এয়ার টিকিট অথবা এম্বাসি অ্যাপয়েন্টমেন্ট লেটার\n` +
      `  • জাতীয় পরিচয় পত্র (NID) ও বিদ্যুৎ বিলের কপি\n` +
      `  • ৬ মাসের ব্যাংক স্টেটমেন্ট বা ডলার এন্ডোর্সমেন্ট\n` +
      `  • পেশাগত সনদপত্র (NOC/ট্রেড লাইসেন্স)।`;
  }

  // Notice board queries: Rejection reasons, Notice, Serial ordering
  if (query.includes('রিজেক্ট') || query.includes('প্রত্যাখ্যান') || query.includes('বাতিল') || query.includes('rejection') || query.includes('reject') || query.includes('ভিসা না পাওয়ার কারণ')) {
    return 'ইন্ডিয়ান ভিসা সাধারণত যেসব কারণে রিজেক্ট হয়:\n\n' +
      '• ফর্মে ভুল তথ্য পূরণ করা\n' +
      '• জাল বা অসম্পূর্ণ ডকুমেন্ট সংযুক্ত করা\n' +
      '• পাসপোর্ট ও NID/জন্ম নিবন্ধনে তথ্যের অমিল থাকা\n' +
      '• ভ্রমণ ভিসা নিয়ে ভারতে নির্ধারিত সময়ের বেশি থাকা (Over Stay)\n' +
      '• আবেদন পত্র এবং বিদ্যুৎ বিলের ঠিকানায় অমিল থাকা\n' +
      '• পুরানো ছবি বা ২"×২" সাদা ব্যাকগ্রাউন্ড ছাড়া ছবি দেওয়া\n' +
      '• জাল NOC বা ভুয়া ডলার এন্ডোর্সমেন্ট দেওয়া\n' +
      '• পেশাগত তথ্যে গরমিল থাকা\n' +
      '• পূর্বের সকল পুরনো পাসপোর্ট জমা না দেওয়া।\n\n' +
      '*(অফিসিয়াল সহায়তা ইমেইল: visahelp@hcidhaka.gov.in)*';
  }

  // IVAC Schedule of charges
  if (query.includes('সরকারি ফি') || query.includes('ivac fee') || query.includes('আইভ্যাক ফি') || query.includes('পোর্ট চার্জ') || query.includes('correction') || query.includes('সংশোধন ফি') || query.includes('schedule of charges')) {
    return 'আইভ্যাক সেন্টারের সরকারি ফি তালিকা:\n\n' +
      '• ভিসা প্রসেসিং ফি: **১,৫০০ টাকা**\n' +
      '• অতিরিক্ত পোর্ট এন্ডোর্সমেন্ট: **৩০০ টাকা** (সর্বোচ্চ ২টি পোর্ট)\n' +
      '• অনলাইন ফর্ম সংশোধন: **৩০০ টাকা** (অনুমোদিত ফিল্ড)\n' +
      '• ফ্যাসিলিটেশন চার্জ (যমুনা ফিউচার পার্ক): **৩০০ টাকা**';
  }

  // Transit visa
  if (query.includes('ট্রানজিট') || query.includes('transit') || query.includes('ভুটান') || query.includes('নেপাল') || query.includes('চেংড়াবান্ধা') || query.includes('চ্যাংড়াবান্ধা') || query.includes('জয়গাঁ') || query.includes('রাণীগঞ্জ')) {
    return 'ট্রানজিট ভিসার বিষয়ে জানার জন্য আপনাকে ধন্যবাদ।\n\n📋 **প্রয়োজনীয় কাগজপত্র:**\n\n' +
      '• আবেদন পত্র\n' +
      '• বাসের মূল টিকিট বা এয়ার টিকিট\n' +
      '• হোটেল বুকিং কপি\n' +
      '• জাতীয় পরিচয় পত্র / জন্ম নিবন্ধন\n' +
      '• ইউটিলিটি বিলের কপি\n' +
      '• ব্যাংক স্টেটমেন্ট বা ডলার এন্ডোর্সমেন্ট\n' +
      '• পেশাগত প্রমাণপত্র\n' +
      '• মূল পাসপোর্ট ও সকল পুরাতন পাসপোর্ট।\n\n' +
      '*(ভুটান রুট: চ্যাংড়াবান্ধা/জয়গাঁ, নেপাল রুট: চ্যাংড়াবান্ধা/রাণীগঞ্জ)*';
  }

  // Entry visa
  if (query.includes('এন্ট্রি ভিসা') || query.includes('entry visa')) {
    return 'এন্ট্রি ভিসার বিষয়ে জিজ্ঞাসার জন্য আপনাকে ধন্যবাদ।\n\n📋 **প্রয়োজনীয় কাগজপত্র:**\n\n' +
      '• আবেদন পত্র\n' +
      '• পাসপোর্টের কপি ও ভিসার কপি\n' +
      '• জাতীয় পরিচয় পত্র ও ইউটিলিটি বিলের কপি\n' +
      '• ব্যাংক স্টেটমেন্ট\n' +
      '• পেশাগত প্রমাণপত্র\n' +
      '• মূল পাসপোর্ট ও সকল পুরাতন পাসপোর্ট।';
  }

  // Air & Travel Ticket Booking
  if (query.includes('টিকিট') || query.includes('টিকেট') || query.includes('ticket') || query.includes('এয়ার টিকেট') || query.includes('এয়ার টিকিট') || query.includes('flight') || query.includes('ফ্লাইট')) {
    return 'টিকেট বুকিং সংক্রান্ত তথ্যের জন্য আপনাকে ধন্যবাদ।\n\n' +
      '✈️ **টিকেট বুকিং সেবার বিবরণ:**\n' +
      '• **সার্ভিস চার্জ:** ১,৫০০ টাকা\n' +
      '• **সেবাসমূহ:** দেশ ও বিদেশের সকল ধরনের এয়ার টিকিট, ওয়ান-ওয়ে, রাউন্ড ট্রিপ, ট্রানজিট টিকিট ও কনফার্মড রিটার্ন টিকিট সহ সকল টিকিট বুকিং।\n\n' +
      '📋 **প্রয়োজনীয় ডকুমেন্টস:**\n' +
      '• যাত্রীর পাসপোর্টের পরিষ্কার কপি\n' +
      '• ভ্রমণের সম্ভাব্য তারিখ ও শহর/গন্তব্যের নাম\n' +
      '• ভিসা কপি (যদি থাকে)।';
  }

  // Business Visa
  if (query.includes('বিজনেস') || query.includes('business') || query.includes('ব্যবসা') || query.includes('ট্রেড') || query.includes('এলসি') || query.includes('টিন') || query.includes('ভ্যাট')) {
    return 'বিজনেস ভিসার প্রয়োজনীয় তথ্য ও ফি:\n\n' +
      '• **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,০০০\n' +
      '• **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
      '• **প্রয়োজনীয় কাগজপত্র:**\n' +
      '  • আবেদন পত্র\n' +
      '  • ভারতীয় কোম্পানির মূল ইনভাইটেশন লেটার\n' +
      '  • NID ও ইউটিলিটি বিলের কপি\n' +
      '  • ব্যক্তিগত ও কোম্পানির ব্যাংক স্টেটমেন্ট\n' +
      '  • কোম্পানির ফরওয়ার্ডিং লেটার\n' +
      '  • ট্রেড লাইসেন্স, টিন/ভ্যাট সনদ\n' +
      '  • মূল ও পুরাতন পাসপোর্ট।';
  }

  // Medical Visa
  if (query.includes('মেডিকেল') || query.includes('medical') || query.includes('রোগী') || query.includes('ডাক্তার') || query.includes('হাসপাতাল') || query.includes('ইনভাইটেশন') || query.includes('ayush')) {
    return 'মেডিকেল ভিসার প্রয়োজনীয় তথ্য ও ফি:\n\n' +
      '• **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ ও ইনভাইটেশন সহ):** ৳৬,০০০\n' +
      '• **শুধু স্লট বুকিং:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
      '• **প্রয়োজনীয় কাগজপত্র:**\n' +
      '  • আবেদন পত্র\n' +
      '  • ভারতীয় হাসপাতালের মূল ইনভাইটেশন লেটার\n' +
      '  • NID/জন্ম নিবন্ধন\n' +
      '  • ইউটিলিটি বিল\n' +
      '  • ব্যাংক স্টেটমেন্ট/ডলার এন্ডোর্সমেন্ট\n' +
      '  • পেশাগত সনদ\n' +
      '  • বাংলাদেশি ডাক্তারের সাম্প্রতিক প্রেসক্রিপশন ও রিপোর্ট\n' +
      '  • মূল ও সকল পুরাতন পাসপোর্ট।';
  }

  // Tourist Visa
  if (query.includes('ট্যুরিস্ট') || query.includes('tourist') || query.includes('ভ্রমণ') || query.includes('ঘুরতে')) {
    return 'ট্যুরিস্ট ভিসার প্রয়োজনীয় তথ্য ও ফি:\n\n' +
      '• **প্রসেসিং + স্লট (আইভ্যাক ফি ১,৫০০৳ সহ):** ৳৬,০০০\n' +
      '• **শুধু স্লট বুকিং:** মোট ৳৫,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৪,০০০৳)\n' +
      '• **প্রয়োজনীয় কাগজপত্র:**\n' +
      '  • অনলাইন আবেদন পত্র\n' +
      '  • জাতীয় পরিচয় পত্র (NID) বা জন্ম নিবন্ধন\n' +
      '  • সাম্প্রতিক বিদ্যুৎ/গ্যাস/পানি বিলের কপি\n' +
      '  • ৬ মাসের ব্যাংক স্টেটমেন্ট বা $২০০ ডলার এন্ডোর্সমেন্ট\n' +
      '  • পেশাগত প্রমাণপত্র (NOC/ট্রেড লাইসেন্স/স্টুডেন্ট আইডি)\n' +
      '  • মূল পাসপোর্ট ও সকল পুরাতন পাসপোর্ট।';
  }

  // Slot release date queries
  if (
    (query.includes('কবে') || query.includes('next') || query.includes('তারিখ') || query.includes('সময়') || query.includes('সময়') || query.includes('রিলিজ') || query.includes('ছাড়বে') || query.includes('ওপেন')) &&
    (query.includes('স্লট') || query.includes('slot') || query.includes('ডেট') || query.includes('অ্যাপয়েন্টমেন্ট'))
  ) {
    return 'আইভ্যাক অ্যাপয়েন্টমেন্ট স্লট ছাড়ার নিয়মটা একটু আলাদা:\n\n' +
      '• আইভ্যাকের নিয়ম অনুযায়ী স্লট রিলিজের নির্দিষ্ট দিনক্ষণ আগে থেকে জানানো হয় না।\n' +
      '• সিস্টেমে যখন নতুন ব্যাচ ওপেন হয়, তখনই সার্বক্ষণিক মনিটরিং করে দ্রুত বুকিং নিতে হয়।\n' +
      '• অনুমান করে কোনো তারিখ বলা ঠিক হবে না—তবে ফাইল রেডি রাখলে স্লট ছাড়ামাত্রই আমাদের টিম আপনার বুকিং করে দিতে পারবে।\n\n' +
      'বিস্তারিত জানতে চাইলে আমাদের হটলাইন/WhatsApp নম্বরে (+8801577464706) যোগাযোগ করতে পারেন।';
  }

  // Slot booking / IVAC
  if (query.includes('স্লট') || query.includes('slot') || query.includes('আইভ্যাক') || query.includes('ivac') || query.includes('তারিখ') || query.includes('অ্যাপয়েন্টমেন্ট')) {
    return 'আইভ্যাক স্লট বুকিং ফি (প্রতিটি ভিসায় আইভ্যাক সরকারি ফি ৳১,৫০০ ফিক্সড):\n\n' +
      '• **মেডিকেল স্লট:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
      '• **ট্যুরিস্ট স্লট:** মোট ৳৫,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৪,০০০৳)\n' +
      '• **ডাবল এন্ট্রি স্লট:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n' +
      '• **বিজনেস স্লট:** মোট ৳৪,৫০০ (আইভ্যাক ১,৫০০৳ + স্লট ৩,০০০৳)\n\n' +
      'স্লট বুক করতে আপনার পাসপোর্টের কপি ও ওয়েব ফাইল নম্বর লাগবে।';
  }

  // Cost / Pricing General
  if (query.includes('খরচ') || query.includes('ফি') || query.includes('টাকা') || query.includes('cost') || query.includes('fee') || query.includes('price') || query.includes('charge')) {
    return 'আমাদের ভিসা ও স্লট ফি তালিকা:\n\n' +
      '**১. প্রসেসিং + স্লট (আইভ্যাক ফি ৳১,৫০০ সহ):**\n' +
      '• মেডিকেল ভিসা: **৳৬,০০০**\n' +
      '• ট্যুরিস্ট ভিসা: **৳৬,০০০**\n' +
      '• ডাবল এন্ট্রি ভিসা: **৳৬,৫০০**\n' +
      '• বিজনেস ভিসা: **৳৬,০০০**\n\n' +
      '**২. শুধুমাত্র স্লট (আইভ্যাক ফি ৳১,৫০০ ফিক্সড):**\n' +
      '• মেডিকেল স্লট: **৳৪,৫০০** (১,৫০০ + ৩,০০০)\n' +
      '• ট্যুরিস্ট স্লট: **৳৫,৫০০** (১,৫০০ + ৪,০০০)\n' +
      '• ডাবল এন্ট্রি স্লট: **৳৪,৫০০** (১,৫০০ + ৩,০০০)\n' +
      '• বিজনেস স্লট: **৳৪,৫০০** (১,৫০০ + ৩,০০০)\n\n' +
      '• এয়ার ও ট্রানজিট টিকেট বুকিং: **৳১,৫০০**';
  }

  // Bank Statement questions
  if (query.includes('ব্যাংক') || query.includes('bank') || query.includes('স্টেটমেন্ট') || query.includes('ব্যালেন্স') || query.includes('ডলার') || query.includes('টাকা থাকতে')) {
    return 'ব্যাংক স্টেটমেন্ট ও ডলার এন্ডোর্সমেন্টের নিয়মগুলো হলো:\n\n' +
      '• বিগত ৬ মাসের নিয়মিত লেনদেন স্টেটমেন্ট (ন্যূনতম ব্যালেন্স ৩০,০০০+ টাকা থাকা ভালো)।\n' +
      '• ব্যাংক একাউন্ট না থাকলে পাসপোর্টে **$২০০ ডলার এন্ডোর্সমেন্ট** করা যাবে।';
  }

  // Photo specifications
  if (query.includes('ছবি') || query.includes('photo') || query.includes('picture') || query.includes('সাইজ')) {
    return 'ভিসার ছবির সঠিক মাপ ও নিয়ম:\n\n' +
      '• সাইজ: ২×২ ইঞ্চি (50mm × 50mm) ল্যাব প্রিন্ট।\n' +
      '• ব্যাকগ্রাউন্ড: সম্পূর্ণ পরিষ্কার সাদা (White Background)।\n' +
      '• কান ও কপাল স্পষ্ট থাকতে হবে, এবং ছবি ৩ মাসের বেশি পুরনো হওয়া যাবে না।';
  }

  // Contact / Phone / Address
  if (query.includes('ফোন') || query.includes('নম্বর') || query.includes('যোগাযোগ') || query.includes('ঠিকানা') || query.includes('contact') || query.includes('phone') || query.includes('address') || query.includes('whatsapp') || query.includes('হোয়াটসঅ্যাপ')) {
    return 'আমাদের সাথে সরাসরি যোগাযোগের মাধ্যম:\n\n' +
      '• হটলাইন ও WhatsApp: **+8801577464706**\n' +
      '• অফিস: ঢাকা, বাংলাদেশ\n' +
      '• ইমেইল: support@processinghub.com';
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

// Helper: Escape HTML for Telegram formatting
function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// API endpoint for chatbot
app.post('/api/chat', async (req, res) => {
  const agentName = sanitizeAgentName(req.body?.agentName);
  const messages = req.body?.messages;
  const serviceContext = req.body?.serviceContext;
  const userName = req.body?.userName;
  const userPhone = req.body?.userPhone;
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

    // Dynamically build persona and inject full website context + verified adaptive brain + addressing context
    let contextualSystemInstruction = `${buildSystemInstruction(agentName)}\n${SHARED_KNOWLEDGE_BASE}\n${WEBSITE_FULL_CONTEXT}${adaptiveKnowledgeSection}`;
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
              reply: response.text,
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
      reply: fallbackReply,
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
      reply: safeFallback,
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

    const timeString = new Date().toLocaleString('bn-BD', {
      timeZone: 'Asia/Dhaka',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const htmlMessage =
      `🚨 <b>নতুন কল ব্যাক অনুরোধ এসেছে!</b>\n\n` +
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
    return res.json({ success: true, telegram: tgData });
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

    const baseMessage = `<b>Processing Hub — নতুন কনসালটেন্সি লিড</b>

<b>গ্রাহকের বিবরণ:</b>
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
            text: `<b>পূর্ণাঙ্গ চ্যাট হিস্ট্রি (ট্যাপ করে পড়ুন):</b>\n<blockquote expandable>${chunk}</blockquote>`,
            parse_mode: 'HTML',
          }),
        });
      }
    }

    return res.json({ success: true, telegram: tgData });
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
