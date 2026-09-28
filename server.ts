import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

const SYSTEM_INSTRUCTION = `
You are MOHAMMAD (মোহাম্মদ), the Senior Visa & Travel Consultant at "Processing Hub". You communicate with clients as a warm, respectful, genuine human professional — never like a robotic, mechanical AI bot.

### CRITICAL RULE - STRICT HUMAN IDENTITY & VOICE:
- Your name is MOHAMMAD (মোহাম্মদ). You are a real human consultant at Processing Hub.
- If asked for your name or identity, introduce yourself warmly as Mohammad from Processing Hub.
- NEVER mention or hint that you are an AI, bot, virtual assistant, language model, algorithm, machine, or automated software.
- Speak naturally, respectfully, and empathetically in first person ("আমি মোহাম্মদ", "আমাদের প্রসেসিং হাব টিম", "আমরা").
- Avoid rigid robotic phrases. Talk like a caring, experienced senior consultant helping a valued client.

### CRITICAL GREETING & CONVERSATIONAL RULES (সালাম ও সম্ভাষণের স্বাভাবিক নিয়ম):
- **সালাম ও অভিবাদনের স্বাভাবিক ব্যবহার (Natural Greeting Exchange)**:
  * সাধারণ মানুষের কথোপকথনে যেভাবে স্বাভাবিক নিয়মে সালাম আদান-প্রদান হয়, ঠিক সেভাবেই কথা বলুন।
  * চ্যাটের শুরুতে প্রথম মেসেজে, অথবা ইউজার নিজে যখন সালাম দেয় বা অভিবাদন জানায়, কেবল তখনই সালাম ("আসসালামু আলাইকুম" বা "ওয়ালাইকুম আসসালাম") বা স্বাগতম জানাবেন।
  * **কঠোরভাবে নিষিদ্ধ**: চলমান কথোপকথনের মাঝে বা প্রতিটা উত্তরের শুরুতে বারবার "আসসালামু আলাইকুম" বলা সম্পূর্ণ নিষেধ। এতে কথা বলা কৃত্রিম ও অস্বস্তিকর লাগে। ইউজার কোনো তথ্য, ফি, ডকুমেন্ট বা ফলো-আপ প্রশ্ন করলে সরাসরি সম্মানসূচক ও সাবলীল ভাষায় মূল উত্তর দিন (যেমন: "জি, এই সেবার সরকারি ফি...", "প্রয়োজনীয় কাগজপত্র নিচে দেওয়া হলো:", "আপনার অবগতির জন্য জানাচ্ছি...").
  * সালামের বিকল্প হিসেবে "নমস্কার", "আদাব" কোনো অবস্থাতেই ব্যবহার করবেন না।
- **Conversation Openings (কথোপকথনের সূচনা)**:
  * শুরুতে কাস্টমারকে সম্মান জানিয়ে স্বাভাবিকভাবে কথা শুরু করবেন। শুরুতে কখনোই "সার্ভিসটি নেওয়ার জন্য ধন্যবাদ" বলবেন না; কারণ ইউজার এখনও সেবা নেয়নি, সে কেবল তথ্য জানতে চাইছে।
- **Conversation Closings (কনভারসেশন সমাপ্তি ও বিদায়)**:
  * যখন ইউজার জানাবে যে তার কাজ শেষ হয়েছে, সার্ভিস নেওয়া সম্পন্ন হয়েছে, সে সন্তুষ্ট, অথবা বিদায় নেবে (যেমন: "ধন্যবাদ", "থ্যাংক ইউ", "কাজ হয়ে গেছে", "সার্ভিস নেওয়া হয়েছে", "বুঝেছি", "বিদায়", "আল্লাহ হাফেজ", "বাই"):
  * তখন বিনম্র ও আন্তরিকভাবে বিদায় জানাবেন এবং কৃতজ্ঞতা প্রকাশ করবেন (যেমন: "প্রসেসিং হাব থেকে সেবা ও পরামর্শ নেওয়ার জন্য আপনাকে আন্তরিক ধন্যবাদ! ভবিষ্যতে যেকোনো ভিসা প্রয়োজনে আমরা আপনার পাশে আছি। আল্লাহ হাফেজ।")।

### CORE COMMUNICATION RULES (কঠোর সংক্ষেপ ও টু-দ্য-পয়েন্ট নীতি):
1. **No Bloat & Ultra-Concise (অতিরিক্ত কথা নয়, যত কম কথায় উত্তর দেওয়া যায়)**:
   - কাস্টমার ঠিক যেটুকু জানতে চেয়েছে, কেবল সেটুকুরই স্পষ্ট, নিখুঁত ও সংক্ষিপ্ত উত্তর দিন।
   - অতিরিক্ত বা অতিরঞ্জিত কোনো কথা বলা যাবে না। কোনো অনাকাঙ্ক্ষিত দীর্ঘ ভূমিকা, অপ্রাসঙ্গিক ব্যাখ্যা বা দীর্ঘ লেকচার দেওয়া সম্পূর্ণ নিষেধ।
   - উত্তর যত বড় হবে, কাস্টমার তত বিরক্ত হবে। তাই যত কম কথায় সাজিয়ে-গুছিয়ে উত্তর দেওয়া যায়, তত ভালো।
   - ঢাকায় শ্যামলী এলাকার প্রফেশনাল ভিসা অফিসের অভিজ্ঞ সিনিয়র কনসালটেন্টের মতো সাবলীল, প্রাঞ্জল ও সম্মানসূচক কথ্য বাংলা ভাষায় কথা বলুন।
2. **Answer What Is Asked (প্রশ্ন অনুযায়ী সুনির্দিষ্ট উত্তর)**:
   - ইউজার যদি সুনির্দিষ্ট একটি প্রশ্ন করে (যেমন: "মেডিকেল ভিসার ইনভাইটেশন লেটার ছাড়া কি আবেদন করা যায়?"), সরাসরি টু-দ্য-পয়েন্ট উত্তর দিন: "না, ভারতীয় হাইকমিশনের নিয়ম অনুযায়ী হাসপাতালের মূল ইনভাইটেশন লেটার ছাড়া মেডিকেল ভিসা আবেদন করা যায় না। তবে আমাদের প্রসেসিং হাব থেকে আপনি জেনুইন ইনভাইটেশন লেটার সংগ্রহে শতভাগ সহায়তা পাবেন।" (অপ্রয়োজনীয় লম্বা চেকলিস্ট দেবেন না যদি না ইউজার ডকুমেন্টস চেকলিস্ট চায়)।
   - ইউজার যখন প্রয়োজনীয় ডকুমেন্টস বা কাগজপত্র চাইবে, শুধুমাত্র তখনই মূল প্রয়োজনীয় কাগজগুলোর অতিসংক্ষিপ্ত বুলেট পয়েন্ট দিন।
3. **Bullet Points Formatting (পয়েন্ট নির্দেশাবলী)**:
   - একাধিক তথ্য বা কাগজপত্রের প্রয়োজন হলে তা রোবটিক বড় তালিকার বদলে ছোট ও পরিষ্কার বুলেট পয়েন্ট (•) আকারে উপস্থাপন করুন।
4. **Human & Courteous Tone (আন্তরিক ও মার্জিত ভাষা)**:
   - সর্বদা কাস্টমারকে শ্রদ্ধার সাথে "আপনি" সম্বোধন করে অত্যন্ত অমায়িক, বিনম্র ও প্রফেশনাল ভাষায় কথা বলুন।

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

H. **Processing Hub Services & Official Charges**:
   • Tourist Visa Processing: ৳১,৫০০
   • Medical Visa (Doctor Invitation সহ): ৳৪,০০০
   • Double Entry Visa: ৳৩,০০০
   • Business Visa: ৳৫,০০০
   • Ticket Booking: ৳১,৫০০ (যেকোনো এয়ার টিকিট ও সকল ধরনের টিকিট বুকিং)
   • IVAC Slot Booking: ট্যুরিস্ট মোট ৫৫০০ (আইভ্যাক ১৫০০ + স্লট ৪০০০), মেডিকেল মোট ৫৫০০ (আইভ্যাক ১৫০০ + স্লট ৩৫০০), বিজনেস মোট ৬০০০ (আইভ্যাক ১৫০০ + স্লট ৪৫০০), ডাবল এন্ট্রি মোট ৬০০০ (আইভ্যাক ১৫০০ + স্লট ৪৫০০)।
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

// Helper: Mohammad Expert Knowledge Engine Fallback
function generateMohammadConsultantReply(userMessage: string, serviceContext?: {
  title?: string;
  category?: string;
  price?: string;
  description?: string;
  documents?: string[];
  isSlotBooking?: boolean;
}): string {
  const query = (userMessage || '').toLowerCase().trim();

  // Greetings & Identity
  if (query.includes('কে আপনি') || query.includes('আপনার নাম') || query.includes('name') || query.includes('ai') || query.includes('bot') || query.includes('রোবট')) {
    return 'আসসালামু আলাইকুম! আমি **মোহাম্মদ**, প্রসেসিং হাবের সিনিয়র ভিসা ও ট্রাভেল কনসালটেন্ট। আপনার যে কোনো ভিসা প্রসেসিং ও পরামর্শে আমি আন্তরিকভাবে সহযোগিতা করতে প্রস্তুত।';
  }

  if (query === 'hi' || query === 'hello' || query === 'hey' || query === 'হ্যালো' || query === 'হাই' || query.includes('আসসালামু') || query.includes('নমস্কার') || query.includes('কেমন আছেন')) {
    if (serviceContext?.title) {
      return `আসসালামু আলাইকুম! প্রসেসিং হাবে আপনাকে স্বাগতম। **${serviceContext.title}** সম্পর্কে আগ্রহ প্রকাশের জন্য ধন্যবাদ। এ বিষয়ে আপনার সুনির্দিষ্ট প্রশ্নটি বলুন, আমি বিস্তারিত তথ্য দিয়ে সাহায্য করছি।`;
    }
    return 'আসসালামু আলাইকুম! প্রসেসিং হাবে আপনাকে স্বাগতম। আমি মোহাম্মদ, আপনার ভিসা ও ভ্রমণ বিষয়ক যে কোনো তথ্যে সহযোগিতা করতে পারি। আপনি কোন সেবা সম্পর্কে জানতে আগ্রহী?';
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
      return `আপনার জিজ্ঞাসার জন্য ধন্যবাদ। **${serviceContext.title}**-এর অফিশিয়াল সার্ভিস চার্জ **${serviceContext.price || '৳১,৫০০'}**।`;
    }

    if (isGeneralDocQuery || isHowToQuery) {
      if (isServiceMedical) {
        return `মেডিকেল ভিসা সম্পর্কে জানতে চাওয়ার জন্য আপনাকে ধন্যবাদ।\n\n` +
          `📋 **প্রয়োজনীয় কাগজপত্রসমূহ:**\n` +
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
        return `ডাবল এন্ট্রি ভিসা সম্পর্কে তথ্য জানতে চাওয়ার জন্য আপনাকে ধন্যবাদ।\n\n` +
          `📋 **প্রয়োজনীয় কাগজপত্রসমূহ:**\n` +
          `• অনলাইন আবেদন পত্র\n` +
          `• ৩য় দেশের কনফার্মড এয়ার টিকেট / এম্বাসি অ্যাপয়েন্টমেন্ট লেটার\n` +
          `• জাতীয় পরিচয় পত্র ও ইউটিলিটি বিল\n` +
          `• ব্যাংক স্টেটমেন্ট বা ডলার এন্ডোর্সমেন্ট\n` +
          `• পেশাগত প্রমাণপত্র\n` +
          `• মূল পাসপোর্ট ও পুরনো পাসপোর্ট।`;
      }
      if (isServiceBusiness) {
        return `বিজনেস ভিসা সম্পর্কে তথ্য জানতে চাওয়ার জন্য আপনাকে ধন্যবাদ।\n\n` +
          `📋 **প্রয়োজনীয় কাগজপত্রসমূহ:**\n` +
          `• আবেদন পত্র\n` +
          `• ভারতীয় কোম্পানির মূল ইনভাইটেশন লেটার\n` +
          `• জাতীয় পরিচয় পত্র ও ইউটিলিটি বিল\n` +
          `• ব্যক্তিগত ও কোম্পানির ব্যাংক স্টেটমেন্ট\n` +
          `• কোম্পানির প্যাডে কভারিং লেটার\n` +
          `• ট্রেড লাইসেন্স, টিন/ভ্যাট সনদ\n` +
          `• মূল পাসপোর্ট ও পুরাতন পাসপোর্ট।`;
      }
      if (serviceContext.title.toLowerCase().includes('ticket') || serviceContext.title.includes('টিকেট') || serviceContext.title.includes('টিকিট')) {
        return `টিকেট বুকিং সেবা সম্পর্কে জানতে চাওয়ার জন্য আপনাকে ধন্যবাদ।\n\n` +
          `✈️ **টিকেট বুকিং সেবার বিবরণ:**\n` +
          `• **সার্ভিস চার্জ:** ১,৫০০ টাকা\n` +
          `• **সেবাসমূহ:** দেশ ও বিদেশের সকল ধরনের এয়ার টিকিট, ওয়ান-ওয়ে, রাউন্ড ট্রিপ, ট্রানজিট টিকিট ও কনফার্মড রিটার্ন টিকিট বুকিং।\n\n` +
          `📋 **প্রয়োজনীয় তথ্য ও ডকুমেন্টস:**\n` +
          `• যাত্রীর মূল পাসপোর্টের পরিষ্কার কপি\n` +
          `• সম্ভাব্য ভ্রমণের তারিখ ও সময়সূচি\n` +
          `• যাত্রা শুরু ও গন্তব্যের তথ্য\n` +
          `• ভিসা কপি (যদি থাকে)।`;
      }
      if (isServiceSlot) {
        return `আইভ্যাক অ্যাপয়েন্টমেন্ট স্লট বুকিং সম্পর্কে জানার আগ্রহ প্রকাশের জন্য আপনাকে ধন্যবাদ।\n\n` +
          `⚡ **প্রয়োজনীয় তথ্যাবলী:**\n` +
          `• পাসপোর্টের পরিষ্কার ছবি\n` +
          `• অনলাইন ভিসা ফর্মের ওয়েব ফাইল নম্বর (Web File No)।`;
      }
    }
  }

  // Double Entry Visa direct queries
  if (query.includes('ডাবল') || query.includes('double')) {
    if (query.includes('স্লট') || query.includes('slot')) {
      return `ডাবল এন্ট্রি ভিসার স্লট সংক্রান্ত তথ্যের জন্য আপনাকে ধন্যবাদ।\n\n` +
        `⚡ **ডাবল এন্ট্রি স্লটের বিবরণ:**\n` +
        `• মোট খরচ: ৬,০০০ টাকা (আইভ্যাক ফি ১৫০০ + স্লট ৪৫০০)\n` +
        `• প্রয়োজনীয় তথ্য: আপনার পাসপোর্টের কপি ও ভিসা ফর্মের ওয়েব ফাইল নম্বর।`;
    }
    return `ডাবল এন্ট্রি ভিসা সম্পর্কে বিস্তারিত জানতে চাওয়ার জন্য আপনাকে ধন্যবাদ।\n\n` +
      `📋 **ডাবল এন্ট্রি ভিসার প্রয়োজনীয় তথ্য ও ডকুমেন্টস:**\n` +
      `• **সার্ভিস চার্জ:** ৩,০০০ টাকা\n` +
      `• **কাগজপত্র:**\n` +
      `  • মূল পাসপোর্ট ও সকল পুরাতন পাসপোর্ট\n` +
      `  • ৩য় দেশের কনফার্মড এয়ার টিকিট অথবা এম্বাসি অ্যাপয়েন্টমেন্ট লেটার\n` +
      `  • জাতীয় পরিচয় পত্র (NID) ও বিদ্যুৎ বিলের কপি\n` +
      `  • ৬ মাসের ব্যাংক স্টেটমেন্ট বা ডলার এন্ডোর্সমেন্ট\n` +
      `  • পেশাগত সনদপত্র (NOC/ট্রেড লাইসেন্স)।`;
  }

  // Notice board queries: Rejection reasons, Notice, Serial ordering
  if (query.includes('রিজেক্ট') || query.includes('প্রত্যাখ্যান') || query.includes('বাতিল') || query.includes('rejection') || query.includes('reject') || query.includes('ভিসা না পাওয়ার কারণ')) {
    return 'আপনার জিজ্ঞাসার জন্য ধন্যবাদ।\n\n📋 **ইন্ডিয়ান ভিসা রিজেক্ট হওয়ার প্রধান কারণসমূহ:**\n\n' +
      '• ফর্মে ভুল তথ্য পূরণ করা\n' +
      '• জাল বা নকল ডকুমেন্ট সংযুক্ত করা\n' +
      '• পাসপোর্ট এবং ভোটার আইডি/জন্ম নিবন্ধনে তথ্যের অমিল থাকা\n' +
      '• ভ্রমণ ভিসা নিয়ে ভারতে Over Stay করা\n' +
      '• আবেদন পত্র এবং বিদ্যুৎ বিলের ঠিকানায় অমিল থাকা\n' +
      '• পুরানো ছবি বা ২"×২" ছাড়া ছবি দেওয়া\n' +
      '• জাল NOC বা ভুয়া ডলার এন্ডোর্সমেন্ট প্রদান করা\n' +
      '• পেশাগত তথ্যে গরমিল থাকা\n' +
      '• পূর্বের সকল পাসপোর্ট জমা না দেওয়া।\n\n' +
      '*(ভিসা সংক্রান্ত অফিসিয়াল তথ্যের ই-মেইল: visahelp@hcidhaka.gov.in)*';
  }

  // IVAC Schedule of charges
  if (query.includes('সরকারি ফি') || query.includes('ivac fee') || query.includes('আইভ্যাক ফি') || query.includes('পোর্ট চার্জ') || query.includes('correction') || query.includes('সংশোধন ফি') || query.includes('schedule of charges')) {
    return 'আপনার জিজ্ঞাসার জন্য ধন্যবাদ।\n\n🏛️ **আইভ্যাক সেন্টারের অফিসিয়াল চার্জ চার্ট:**\n\n' +
      '• ভিসা প্রসেসিং ফি: **১৫০০ টাকা**\n' +
      '• অতিরিক্ত পোর্ট এন্ডোর্সমেন্ট: **৩০০ টাকা** (সর্বোচ্চ ২টি পোর্ট)\n' +
      '• অনলাইন ফর্ম সংশোধন: **৩০০ টাকা** (অনুমোদিত ফিল্ড)\n' +
      '• ভিসা অ্যাপ্লিকেশন ফ্যাসিলিটেশন (যমুনা ফিউচার পার্ক): **৩০০ টাকা**';
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
    return 'বিজনেস ভিসা সম্পর্কে তথ্য জানতে চাওয়ার জন্য আপনাকে ধন্যবাদ।\n\n📋 **বিজনেস ভিসার প্রয়োজনীয় তথ্য:**\n\n' +
      '• **সার্ভিস চার্জ:** ৫,০০০ টাকা\n' +
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
    return 'মেডিকেল ভিসা সংক্রান্ত তথ্য জানতে চাওয়ার জন্য আপনাকে ধন্যবাদ।\n\n📋 **মেডিকেল ভিসার প্রয়োজনীয় তথ্য:**\n\n' +
      '• **সার্ভিস চার্জ:** ৪,০০০ টাকা (ডক্টরস ইনভাইটেশন সহ)\n' +
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
    return 'ট্যুরিস্ট ভিসা সংক্রান্ত তথ্যের জন্য আপনাকে ধন্যবাদ।\n\n📋 **ট্যুরিস্ট ভিসার প্রয়োজনীয় তথ্য:**\n\n' +
      '• **সার্ভিস চার্জ:** ১,৫০০ টাকা\n' +
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
    return 'আইভ্যাক অ্যাপয়েন্টমেন্ট স্লট সংক্রান্ত তথ্যের জন্য আপনাকে ধন্যবাদ।\n\n' +
      '📌 **অ্যাপয়েন্টমেন্ট স্লট ছাড়ার অফিশিয়াল নিয়মাবলী:**\n' +
      '• আইভ্যাকের সাধারণ নিয়ম অনুযায়ী স্লট রিলিজ বা ছাড়ার নির্দিষ্ট দিনক্ষণ আগে থেকে জনসম্মুখে প্রকাশ করা হয় না।\n' +
      '• সিস্টেম হঠাৎ যেকোনো সময় নির্দিষ্ট ব্যাচের স্লট ওপেন করে, যা সার্বক্ষণিক মনিটরিং ছাড়া জানা কঠিন।\n' +
      '• কোনো আনুষ্ঠানিক সরকারি নোটিশ ছাড়া অনুমানের ওপর ভিত্তি করে কোনো তারিখ নিশ্চিত করা সম্ভব নয়।\n\n' +
      '⚡ **আমাদের স্লট বুকিং সাপোর্ট:**\n' +
      '• আমাদের ডেডিকেটেড টিম সার্বক্ষণিক আইভ্যাক পোর্টাল মনিটর করে থাকে। স্লট ওপেন হওয়ামাত্র দ্রুত বুকিং সম্পন্ন করতে আপনি আপনার পাসপোর্ট ও ভিসা ফর্ম দিয়ে ফাইল রেডি রাখতে পারেন।\n' +
      '• বিস্তারিত তথ্য বা বুকিংয়ের জন্য আমাদের হটলাইনে (+8801577464706) যোগাযোগ করতে পারেন।';
  }

  // Slot booking / IVAC
  if (query.includes('স্লট') || query.includes('slot') || query.includes('আইভ্যাক') || query.includes('ivac') || query.includes('তারিখ') || query.includes('অ্যাপয়েন্টমেন্ট')) {
    return 'আইভ্যাক স্লট বুকিং সংক্রান্ত তথ্যের জন্য আপনাকে ধন্যবাদ।\n\n⚡ **অ্যাপয়েন্টমেন্ট স্লট চার্জের বিবরণ:**\n\n' +
      '• ট্যুরিস্ট স্লট: মোট ৫৫০০ টাকা (আইভ্যাক ফি ১৫০০ + স্লট ৪০০০)\n' +
      '• মেডিকেল স্লট: মোট ৫৫০০ টাকা (আইভ্যাক ফি ১৫০০ + স্লট ৩৫০০)\n' +
      '• বিজনেস/ডাবল এন্ট্রি: মোট ৬০০০ টাকা (আইভ্যাক ফি ১৫০০ + স্লট ৪৫০০)\n\n' +
      'স্লট বুক করতে আপনার পাসপোর্টের কপি ও ওয়েব ফাইল নম্বর প্রয়োজন।';
  }

  // Cost / Pricing General
  if (query.includes('খরচ') || query.includes('ফি') || query.includes('টাকা') || query.includes('cost') || query.includes('fee') || query.includes('price') || query.includes('charge')) {
    return 'আপনার জিজ্ঞাসার জন্য ধন্যবাদ।\n\n💰 **আমাদের সার্ভিস চার্জ তালিকা:**\n\n' +
      '• ট্যুরিস্ট ভিসা প্রসেসিং: **৳১,৫০০**\n' +
      '• মেডিকেল ভিসা (ইনভাইটেশন সহ): **৳৪,০০০**\n' +
      '• ডাবল এন্ট্রি ভিসা: **৳৩,০০০**\n' +
      '• বিজনেস ভিসা প্রসেসিং: **৳৫,০০০**\n' +
      '• এয়ার ও ট্রানজিট টিকেট বুকিং: **৳১,৫০০**\n' +
      '• আইভ্যাক সরকারি ফি: **৳১,৫০০**';
  }

  // Bank Statement questions
  if (query.includes('ব্যাংক') || query.includes('bank') || query.includes('স্টেটমেন্ট') || query.includes('ব্যালেন্স') || query.includes('ডলার') || query.includes('টাকা থাকতে')) {
    return 'আপনার জিজ্ঞাসার জন্য ধন্যবাদ।\n\n💳 **ব্যাংক স্টেটমেন্ট ও সলভেন্সির নিয়মাবলী:**\n\n' +
      '• বিগত ৬ মাসের নিয়মিত লেনদেন স্টেটমেন্ট (ন্যূনতম ব্যালেন্স ৩০,০০০+ টাকা থাকা ভালো)।\n' +
      '• ব্যাংক একাউন্ট না থাকলে পাসপোর্টে **$২০০ ডলার এন্ডোর্সমেন্ট** করা যাবে।';
  }

  // Photo specifications
  if (query.includes('ছবি') || query.includes('photo') || query.includes('picture') || query.includes('সাইজ')) {
    return 'আপনার জিজ্ঞাসার জন্য ধন্যবাদ।\n\n📸 **ছবির সঠিক নিয়মাবলী:**\n\n' +
      '• সাইজ: ২×২ ইঞ্চি (50mm × 50mm) ল্যাব প্রিন্ট।\n' +
      '• ব্যাকগ্রাউন্ড: সম্পূর্ণ পরিষ্কার সাদা (White Background)।\n' +
      '• কান ও কপাল স্পষ্ট থাকতে হবে, ৩ মাসের বেশি পুরানো হওয়া যাবে না।';
  }

  // Contact / Phone / Address
  if (query.includes('ফোন') || query.includes('নম্বর') || query.includes('যোগাযোগ') || query.includes('ঠিকানা') || query.includes('contact') || query.includes('phone') || query.includes('address') || query.includes('whatsapp') || query.includes('হোয়াটসঅ্যাপ')) {
    return 'যোগাযোগের তথ্য জানতে চাওয়ার জন্য ধন্যবাদ।\n\n📞 **আমাদের সাথে সরাসরি যোগাযোগের মাধ্যম:**\n\n' +
      '• হটলাইন ও WhatsApp: **+8801577464706**\n' +
      '• অফিস: ঢাকা, বাংলাদেশ\n' +
      '• ইমেইল: support@processinghub.com';
  }

  // Duration / Time required
  if (query.includes('কত দিন') || query.includes('সময়') || query.includes('লাগে') || query.includes('duration') || query.includes('time') || query.includes('ডেলিভারি')) {
    return 'আপনার জিজ্ঞাসার জন্য ধন্যবাদ।\n\n⏱️ **প্রসেসিং ও ডেলিভারি সময়সীমা:**\n\n' +
      '• ফাইল প্রসেসিং: **১ থেকে ২ কর্মদিবস**\n' +
      '• আইভ্যাকে জমা দেওয়ার পর ডেলিভারি: ভারতীয় হাইকমিশনের নিয়ম অনুযায়ী সাধারণত **৭ থেকে ১৫ কর্মদিবস**।';
  }

  // Conversation Closings / Thank you / Service done
  if (query.includes('ধন্যবাদ') || query.includes('thank') || query.includes('থ্যাংক') || query.includes('আল্লাহ হাফেজ') || query.includes('bye') || query.includes('বাই') || query.includes('বিদায়') || query.includes('বিদায়') || query.includes('কাজ শেষ') || query.includes('বুঝেছি') || query.includes('ঠিক আছে')) {
    return 'প্রসেসিং হাবের সেবা ও পরামর্শ নেওয়ার জন্য আপনাকে আন্তরিক ধন্যবাদ! ভবিষ্যতে যেকোনো ভিসা বা ভ্রমণ সংক্রান্ত প্রয়োজনে আমরা সর্বদা আপনার পাশে আছি। আপনার যাত্রা শুভ ও নিরাপদ হোক, আল্লাহ হাফেজ।';
  }

  // Default Consultation Reply
  return 'আসসালামু আলাইকুম! আপনার জিজ্ঞাসার জন্য ধন্যবাদ। আমি **মোহাম্মদ**, প্রসেসিং হাবের সিনিয়র ভিসা কনসালটেন্ট। আপনার যে কোনো ভিসা প্রসেসিং বা ডকুমেন্টস সংক্রান্ত প্রশ্নে আমি সহযোগিতা করতে প্রস্তুত।';
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
  try {
    const { messages, serviceContext, userName, userPhone } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastUserMessage = messages[messages.length - 1]?.text || '';
    const ai = getAiClient();

    // Dynamically inject service context into the system prompt
    let contextualSystemInstruction = SYSTEM_INSTRUCTION;
    if (userName) {
      contextualSystemInstruction += `\n\n### CLIENT IDENTITY (গ্রাহকের পরিচিতি):
The client's name is: "${userName}".
${userPhone ? `Phone / WhatsApp: "${userPhone}".` : ''}
- Address the client respectfully by their name when appropriate (e.g. "${userName} সাহেব", "${userName} ভাই/স্যার" or politely with their name).
- Do NOT ask them for their name or contact number again because they already provided it in the contact form.`;
    }
    if (serviceContext && (serviceContext.title || serviceContext.category)) {
      contextualSystemInstruction += `\n\n### ACTIVE PAGE SERVICE CONTEXT (ইউজারের বর্তমান ব্রাউজিং পেজ ও সার্ভিস ফোকাস):
The customer is currently actively browsing or inquiring about the following specific service on our website:
- **Focused Service**: ${serviceContext.title || 'N/A'}
- **Category**: ${serviceContext.category || 'Visa Processing'}
- **Official Price**: ${serviceContext.price || 'N/A'} ${serviceContext.per || ''}
- **Service Summary**: ${serviceContext.description || ''}
${serviceContext.documents && serviceContext.documents.length > 0 ? `- **Standard Document Checklist**:\n  * ${serviceContext.documents.join('\n  * ')}` : ''}

**SPECIFIC CONSULTATION DIRECTIVE**:
You are advising a customer who is specifically on the "${serviceContext.title}" section. Prioritize giving precise, actionable, step-by-step advice for "${serviceContext.title}".
- If the user asks open-ended questions (such as "কি কি ডকুমেন্টস লাগবে?", "খরচ কত?", "কিভাবে প্রসেস করব?", "ইনভাইটেশন কিভাবে পাব?"), tailor your direct response specifically to "${serviceContext.title}".
- Highlight the exact pricing, required documentation nuances (e.g. hospital invitation letters for Medical Visa vs NOC for Tourist vs trade license for Business), and IVAC slot recommendations.
- Keep the tone highly professional, empathetic, welcoming, and strictly as Mohammad from Processing Hub.`;
    }

    // If Gemini client is available, try invoking Gemini with contextual prompt
    if (ai) {
      try {
        const recentMessages = messages.slice(-6);
        const contents = recentMessages.map((msg: { role: string; text: string }) => ({
          role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text || '' }],
        }));

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: contextualSystemInstruction,
            tools: [{ googleSearch: {} }],
            temperature: 0.65,
          },
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

          return res.json({
            reply: response.text,
            sources,
            webSearchQueries,
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call encountered an error, activating Mohammad expert knowledge engine fallback:', geminiError?.message || geminiError);
        // Fall through to rich knowledge engine fallback
      }
    }

    // High-quality deterministic fallback as Mohammad Consultant with service context
    const fallbackReply = generateMohammadConsultantReply(lastUserMessage, serviceContext);
    return res.json({
      reply: fallbackReply,
      sources: [],
    });
  } catch (error: any) {
    console.error('Chat API general error:', error);
    const safeFallback = generateMohammadConsultantReply(
      req.body?.messages?.[req.body?.messages?.length - 1]?.text || '',
      req.body?.serviceContext
    );
    return res.json({
      reply: safeFallback,
      sources: [],
    });
  }
});

// API endpoint for dispatching consultation summary to Telegram
app.post('/api/telegram/summary', async (req, res) => {
  try {
    const { user, serviceContext, messages, trigger } = req.body;

    // Only proceed if there are actual user messages
    const userMessages = (messages || []).filter((m: any) => m.role === 'user');
    if (!userMessages || userMessages.length === 0) {
      return res.json({ success: true, skipped: true, reason: 'No user messages to summarize' });
    }

    let botToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
    let chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();

    // Guard against inverted or malformed environment variables
    if (!botToken.includes(':') && chatId.includes(':')) {
      const temp = botToken;
      botToken = chatId;
      chatId = temp;
    }

    if (!botToken || !botToken.includes(':')) {
      botToken = '8705018021:AAEXt7XDAJl3ymojODL3dMeolBuROLMcesA';
    }

    // Telegram bots cannot message themselves; default to the user's actual chat ID
    if (!chatId || chatId === '8705018021' || chatId.includes(':')) {
      chatId = '6574558784';
    }

    const customerName = user?.name || 'অজ্ঞাত গ্রাহক';
    const customerPhone = user?.phone || 'প্রদান করা হয়নি';
    const serviceTitle = serviceContext?.title || 'সাধারণ ভিসা জিজ্ঞাসা';

    // Build conversation transcript text
    const transcript = (messages || [])
      .map((m: any) => `${m.role === 'user' ? 'গ্রাহক' : 'মোহাম্মদ (কনসালটেন্ট)'}: ${m.text}`)
      .join('\n\n');

    let summaryText = '';
    const ai = getAiClient();
    if (ai) {
      try {
        const sumResp = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [{
                text: `You are an executive assistant at "Processing Hub" visa consultancy in Dhaka.
Analyze the following visa consultation conversation between client "${customerName}" (${customerPhone}) and consultant Mohammad.

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
          config: {
            temperature: 0.2,
          }
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
      const speaker = isUser ? `👤 <b>${escapeHtml(customerName)} (গ্রাহক)` : `👨‍💼 <b>মোহাম্মদ (ভিসা কনসালটেন্ট)`;
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

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'Processing Hub' });
});

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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Processing Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
