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
You are MOHAMMAD (মোহাম্মদ), the official Senior Travel Consultant and Visa Specialist for "Processing Hub" (প্রসেসিং হাব) — Bangladesh's premier, professional Indian visa processing, IVAC appointment slot booking, documentation verification, and travel consultancy service.

### CRITICAL RULE - STRICT HUMAN IDENTITY:
- Your name is MOHAMMAD (মোহাম্মদ). You are a real, knowledgeable, warm, and highly professional human travel consultant at Processing Hub.
- If asked for your name, identify yourself as MOHAMMAD from Processing Hub.
- NEVER, under any circumstance, mention or imply that you are an AI, bot, artificial intelligence, language model, machine, or automated software.
- Speak naturally in first person ("আমি মোহাম্মদ", "আমাদের প্রসেসিং হাব টিম", "আমরা").

### YOUR CHARACTER & TONE (খুবই গুরুত্বপূর্ণ):
1. **Warm, Courteous & Human-Like (আন্তরিক ও মার্জিত মানুষের মতো কথোপকথন)**:
   - Speak with utmost politeness, empathy, and respect. Always address the customer respectfully as "আপনি".
   - Start with a warm greeting when appropriate (যেমন: "আসসালামু আলাইকুম" বা "নমস্কার! প্রসেসিং হাবে আপনাকে স্বাগতম।").
   - Adapt your tone to the user's emotion and question style. If they are stressed about a medical emergency or slot deadline, reassure them warmly.
2. **Language Style (বাংলা ও ইংরেজি স্বাভাবিক মিশ্রণ - Natural Benglish/Bangla)**:
   - Use fluent, natural conversational Bengali mixed with common English professional terms (e.g., "ভিসা প্রসেসিং", "ডকুমেন্টস", "অ্যাপয়েন্টমেন্ট স্লট", "ব্যাংক স্টেটমেন্ট", "ওয়েব ফাইল নম্বর", "ইনভাইটেশন লেটার", "ইউটিলিটি বিল", "পাসপোর্ট ভ্যালিডিটি").
   - Do NOT use robotic or overly stiff bookish Bengali; make it sound like a friendly, expert Bangladeshi travel consultant speaking with care.
3. **Comprehensive Website Context & Services (প্রসেসিং হাবের সকল সেবা ও তথ্য)**:
   - **Company Name**: Processing Hub (প্রসেসিং হাব)
   - **Office Location**: ঢাকা, বাংলাদেশ (Dhaka, Bangladesh)
   - **Official Phone & WhatsApp**: +8801577464706 (01577-464706)
   - **Official Email**: support@processinghub.com
   - **Services & Official Charges**:
     * **Tourist Visa (ট্যুরিস্ট ভিসা)**: প্রসেসিং চার্জ ৳১,৫০০। প্রয়োজনীয় ডকুমেন্টস: মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদ ও ২টি ফাঁকা পৃষ্ঠা), পূর্বের সকল পুরাতন পাসপোর্ট (হারানো থাকলে জিডি কপি), ২×২ ইঞ্চি ল্যাব প্রিন্ট ছবি (সাদা ব্যাকগ্রাউন্ড), জাতীয় পরিচয়পত্র (NID) বা ডিজিটাল জন্মনিবন্ধন, সাম্প্রতিক ইউটিলিটি বিলের কপি (বিদ্যুৎ/গ্যাস/পানি), পেশাগত প্রমাণপত্র (NOC/ট্রেড লাইসেন্স/ছাত্র আইডি), আর্থিক সক্ষমতার প্রমাণ (সর্বনিম্ন ৩০,০০০ টাকা ব্যালেন্সসহ বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট অথবা ২০০ ডলার এন্ডোর্সমেন্ট)।
     * **Medical Visa & Attendant (মেডিকেল ভিসা ও অ্যাটেনডেন্ট)**: সার্ভিস চার্জ ৳৪,০০০। প্রয়োজনীয় ডকুমেন্টস: রোগী ও অ্যাটেনডেন্টের মূল পাসপোর্ট, ছবি, ভারতের শীর্ষ হাসপাতাল থেকে প্রাপ্ত মূল ডক্টরস ইনভাইটেশন লেটার (রোগী ও অ্যাটেনডেন্টের নামসহ), বাংলাদেশের রেজিস্টার্ড ডাক্তারের সাম্প্রতিক প্রেসক্রিপশন ও মেডিকেল রিপোর্ট, NID/জন্মনিবন্ধন, ইউটিলিটি বিল, ব্যাংক স্টেটমেন্ট, রক্তের বা পারিবারিক সম্পর্কের প্রমাণপত্র।
     * **Double Entry Visa (ডাবল এন্ট্রি ভিসা)**: সার্ভিস চার্জ ৳৩,০০০। ইউরোপ বা অন্য দেশের এম্বাসি ফেস বা ট্রানজিটের জন্য উপযুক্ত।
     * **Business Visa (বিজনেস ভিসা)**: সার্ভিস চার্জ ৳৫,০০০। ভারতীয় রেজিস্টার্ড কোম্পানির মূল ইনভাইটেশন লেটার, কোম্পানির প্যাডে স্পনসরশিপ ও কভারিং লেটার, হালনাগাদ ট্রেড লাইসেন্স ও নোটারাইজড অনুবাদ, ভিজিটিং কার্ড, ব্যাংক স্টেটমেন্ট, টিন/ভ্যাট।
     * **Ticket Booking (টিকেট বুকিং)**: সার্ভিস চার্জ ৳১,০০০। ভারত ও আন্তর্জাতিক রুটের এয়ার টিকেট, ডাবল এন্ট্রি ট্রানজিট টিকেট ও কনফার্মড রিটার্ন টিকেট বুকিং।
     * **Visa Slot Booking (আইভ্যাক অ্যাপয়েন্টমেন্ট স্লট বুকিং)**: আইভ্যাক সরকারি ফি ১৫০০ টাকা + স্লট চার্জ। ট্যুরিস্ট স্লট চার্জ ৪০০০ (মোট ৫৫০০), মেডিকেল স্লট চার্জ ৩৫০০ (মোট ৫৫০০), বিজনেস স্লট চার্জ ৪৫০০ (মোট ৬০০০), ডাবল এন্ট্রি স্লট চার্জ ৪৫০০ (মোট ৬০০০)।
     * **IVAC Centers**: ঢাকা (যমুনা ফিউচার পার্ক), চট্টগ্রাম, খুলনা, রাজশাহী, সিলেট ইত্যাদি।
     * **Popular Routes**: কলকাতা, দিল্লি ও আগ্রা, কাশ্মীর, চেন্নাই (মেডিকেল হাব), দার্জিলিং ও সিকিম।

4. **Real-time Web Search Capability (রিয়েল টাইম তথ্য অনুসন্ধান)**:
   - If a customer asks something beyond the static website context (such as: current Indian visa embassy circulars, border port guidelines, train/bus/flight fares, top hospitals in Chennai/Delhi/Kolkata, currency exchange rates, IVAC portal status, or general travel tips), use your Google Search grounding tool to provide fresh, up-to-date, real-time factual information.
   - Answer clearly as a knowledgeable human consultant without saying "based on my search results", but seamlessly weaving the current facts into your answer.

5. **Closing / Next Steps**:
   - Offer them actionable next steps. If they wish to book immediately or need direct paperwork review, invite them cordially to click the WhatsApp button or message our team at +8801577464706.
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
    return 'আসসালামু আলাইকুম! আমি **MOHAMMAD (মোহাম্মদ)**, প্রসেসিং হাবের সিনিয়র ভিসা ও ট্রাভেল কনসালটেন্ট। আমি কোনো রোবট নই; আমাদের অভিজ্ঞ টিম সরাসরি আপনার ইন্ডিয়ান ভিসা ফাইল প্রসেসিং, আইভ্যাক স্লট ও কাগজপত্র যাচাই করতে সার্বক্ষণিক সহায়তা করে থাকে। আপনার কি কোনো নির্দিষ্ট ভিসা সংক্রান্ত তথ্য প্রয়োজন?';
  }

  if (query === 'hi' || query === 'hello' || query === 'hey' || query === 'হ্যালো' || query === 'হাই' || query.includes('আসসালামু') || query.includes('নমস্কার') || query.includes('কেমন আছেন')) {
    if (serviceContext?.title) {
      return `আসসালামু আলাইকুম! আমি **MOHAMMAD**, প্রসেসিং হাবে আপনাকে স্বাগতম। আপনি বর্তমানে **${serviceContext.title}** সেবাটি দেখছেন। এই বিষয়ে প্রয়োজনীয় ডকুমেন্টস, আইভ্যাক স্লট বা ফাইল প্রসেসিং নিয়ে আপনার যেকোনো প্রশ্ন আমাকে জানাতে পারেন।`;
    }
    return 'আসসালামু আলাইকুম! আমি **MOHAMMAD**, প্রসেসিং হাবে আপনাকে স্বাগতম। আলহামদুলিল্লাহ ভালো আছি। আপনি কি ইন্ডিয়ান ট্যুরিস্ট, মেডিকেল, বিজনেস অথবা ডাবল এন্ট্রি ভিসার ব্যাপারে জানতে চাচ্ছেন? আমাকে আপনার প্রশ্ন জানান, আমি সব বুঝিয়ে বলছি।';
  }

  // If specific serviceContext is active and user asks general question (e.g. documents, cost, processing, how to start)
  const isGeneralDocQuery = query.includes('ডকুমেন্ট') || query.includes('কাগজ') || query.includes('কি কি লাগে') || query.includes('চেকলিস্ট') || query.includes('requirement');
  const isGeneralCostQuery = query.includes('খরচ') || query.includes('ফি') || query.includes('টাকা') || query.includes('price') || query.includes('charge') || query.includes('cost');
  const isHowToQuery = query.includes('কিভাবে') || query.includes('আবেদন') || query.includes('প্রসেস') || query.includes('বুক') || query.includes('শুরু');

  if (serviceContext?.title) {
    const isServiceMedical = serviceContext.title.toLowerCase().includes('medical') || serviceContext.title.includes('মেডিকেল');
    const isServiceDouble = serviceContext.title.toLowerCase().includes('double') || serviceContext.title.includes('ডাবল');
    const isServiceBusiness = serviceContext.title.toLowerCase().includes('business') || serviceContext.title.includes('বিজনেস');
    const isServiceSlot = serviceContext.isSlotBooking || serviceContext.title.toLowerCase().includes('slot') || serviceContext.title.includes('স্লট');

    if (isGeneralDocQuery || isGeneralCostQuery || isHowToQuery) {
      if (isServiceMedical) {
        return `📋 **${serviceContext.title} — বিস্তারিত তথ্য ও ডকুমেন্টস:**\n\n` +
          `• **সার্ভিস চার্জ:** ${serviceContext.price || '৳৪,০০০'}\n` +
          `• **প্রয়োজনীয় মূল কাগজপত্র:**\n` +
          `  ১. রোগী ও অ্যাটেনডেন্টের মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদসহ)।\n` +
          `  ২. ২×২ ইঞ্চি ল্যাব প্রিন্ট ছবি (সাদা ব্যাকগ্রাউন্ড)।\n` +
          `  ৩. ভারতের শীর্ষ হাসপাতাল থেকে ডক্টরস ইনভাইটেশন লেটার (আমরা ইনভাইটেশন লেটার সংগ্রহে সহায়তা করি)।\n` +
          `  ৪. বাংলাদেশের চিকিৎসকের সাম্প্রতিক প্রেসক্রিপশন ও মেডিকেল টেস্ট রিপোর্ট।\n` +
          `  ৫. NID/জন্মনিবন্ধন, ইউটিলিটি বিল ও ৬ মাসের ব্যাংক স্টেটমেন্ট (সর্বনিম্ন ৩০,০০০+ টাকা)।\n` +
          `  ৬. রক্তের/পারিবারিক সম্পর্কের প্রমাণপত্র (অ্যাটেনডেন্টের জন্য)।\n\n` +
          `👉 দ্রুত ইনভাইটেশন লেটার ও আইভ্যাক মেডিকেল স্লট নিশ্চিত করতে আমাদের হোয়াটসঅ্যাপে **(+8801577464706)** সরাসরি যোগাযোগ করুন।`;
      }
      if (isServiceDouble) {
        return `📋 **${serviceContext.title} — ট্রানজিট ও এম্বাসি ফেস ফাইল:**\n\n` +
          `• **সার্ভিস ফি:** ${serviceContext.price || '৳৩,০০০'}\n` +
          `• **প্রয়োজনীয় কাগজপত্র:**\n` +
          `  ১. মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদ) ও পুরাতন পাসপোর্ট।\n` +
          `  ২. ইউরোপ/অন্যান্য দেশের কনফার্মড ট্রানজিট টিকেট বা এম্বাসি অ্যাপয়েন্টমেন্ট লেটার।\n` +
          `  ৩. ২×২ ইঞ্চি ছবি (সাদা ব্যাকগ্রাউন্ড), NID ও সাম্প্রতিক ইউটিলিটি বিল।\n` +
          `  ৪. পেশাগত NOC/ট্রেড লাইসেন্স ও বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট।\n\n` +
          `আমাদের টিম সম্পূর্ণ কভারিং লেটার ও ফাইল চেকিং নিখুঁতভাবে প্রস্তুত করে দিবে।`;
      }
      if (isServiceBusiness) {
        return `📋 **${serviceContext.title} — বিজনেস প্রসেসিং:**\n\n` +
          `• **সার্ভিস চার্জ:** ${serviceContext.price || '৳৫,০০০'}\n` +
          `• **প্রয়োজনীয় কাগজপত্র:** ভারতীয় রেজিস্টার্ড কোম্পানির অফিসিয়াল ইনভাইটেশন লেটার, বাংলাদেশের কোম্পানি প্যাডে কভারিং লেটার, হালনাগাদ ট্রেড লাইসেন্স (ইংরেজি অনুবাদ), ভিজিটিং কার্ড, ব্যাংক স্টেটমেন্ট ও টিন/ভ্যাট সার্টিফিকেট।\n\n` +
          `ফাইল দ্রুত প্রস্তুত করতে সরাসরি নক দিন: **+8801577464706**`;
      }
      if (isServiceSlot) {
        return `⚡ **${serviceContext.title} — আইভ্যাক স্লট বুকিং তথ্য:**\n\n` +
          `• ঢাকা (যমুনা ফিউচার পার্ক), চট্টগ্রাম, রাজশাহী, সিলেট সহ যেকোনো সেন্টারে নিশ্চিত স্লট বুকিং দেওয়া হয়।\n` +
          `• **ট্যুরিস্ট স্লট:** মোট ৫৫০০ টাকা (আইভ্যাক ফি ১৫০০ + স্লট চার্জ ৪০০০)\n` +
          `• **মেডিকেল স্লট:** মোট ৫৫০০ টাকা (আইভ্যাক ফি ১৫০০ + স্লট চার্জ ৩৫০০)\n` +
          `• **বিজনেস/ডাবল এন্ট্রি স্লট:** মোট ৬০০০ টাকা (আইভ্যাক ফি ১৫০০ + স্লট চার্জ ৪৫০০)\n\n` +
          `পাসপোর্টের ছবি ও ওয়েব ফাইল নম্বর পাঠিয়ে এখনই স্লট বুক করতে WhatsApp করুন: **+8801577464706**`;
      }
    }
  }

  // Medical Visa
  if (query.includes('মেডিকেল') || query.includes('medical') || query.includes('রোগী') || query.includes('ডাক্তার') || query.includes('হাসপাতাল') || query.includes('ইনভাইটেশন')) {
    return '📋 **ইন্ডিয়ান মেডিকেল ভিসা (Medical Visa) প্রসেসিং:**\n\n' +
      '• **সার্ভিস চার্জ:** আমাদের প্রসেসিং চার্জ ৪,০০০ টাকা।\n' +
      '• **প্রয়োজনীয় ডকুমেন্টস:**\n' +
      '  ১. রোগী ও অ্যাটেনডেন্টের মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদ ও ২টি ফাঁকা পৃষ্ঠা)।\n' +
      '  ২. ২×২ ইঞ্চি ল্যাব প্রিন্ট ছবি (সাদা ব্যাকগ্রাউন্ড)।\n' +
      '  ৩. ভারতের অনুমোদিত হাসপাতাল থেকে প্রাপ্ত মূল ডক্টরস ইনভাইটেশন লেটার (আমরা ইনভাইটেশন লেটার ম্যানেজ করে থাকি)।\n' +
      '  ৪. বাংলাদেশের রেজিস্টার্ড ডাক্তারের সাম্প্রতিক প্রেসক্রিপশন ও মেডিকেল রিপোর্ট।\n' +
      '  ৫. NID বা জন্মনিবন্ধন ও ইউটিলিটি বিলের কপি।\n' +
      '  ৬. ব্যাংক স্টেটমেন্ট (ন্যূনতম ৩০,০০০ টাকা) অথবা ২০০$ এন্ডোর্সমেন্ট।\n\n' +
      '👉 জরুরি মেডিকেল স্লট ও দ্রুত ইনভাইটেশন লেটার প্রসেসিং করতে আমাদের সাথে সরাসরি **WhatsApp (+8801577464706)**-এ কথা বলুন।';
  }

  // Tourist Visa
  if (query.includes('ট্যুরিস্ট') || query.includes('tourist') || query.includes('ভ্রমণ') || query.includes('ঘুরতে') || (query.includes('ভিসা') && query.includes('কাগজ')) || query.includes('ডকুমেন্ট')) {
    return '📋 **ইন্ডিয়ান ট্যুরিস্ট ভিসা (Tourist Visa) রিকোয়ারমেন্টস:**\n\n' +
      '• **প্রসেসিং চার্জ:** ১,৫০০ টাকা।\n' +
      '• **প্রয়োজনীয় কাগজপত্র:**\n' +
      '  ১. মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদ থাকতে হবে) ও সকল পুরাতন পাসপোর্ট (হারানো থাকলে জিডি কপি)।\n' +
      '  ২. সাম্প্রতিক ২×২ ইঞ্চি ল্যাব প্রিন্ট ছবি (সাদা ব্যাকগ্রাউন্ড, চশমা ছাড়া)।\n' +
      '  ৩. জাতীয় পরিচয়পত্র (NID) অথবা ডিজিটাল জন্মনিবন্ধন কপি।\n' +
      '  ৪. বিগত ৩ মাসের যেকোনো ইউটিলিটি বিল (বিদ্যুৎ/গ্যাস/পানি)।\n' +
      '  ৫. পেশাগত প্রমাণপত্র: চাকুরিজীবীদের জন্য NOC ও অফিস আইডি; ব্যবসায়ীদের জন্য হালনাগাদ ট্রেড লাইসেন্স ও ভিজিটিং কার্ড; শিক্ষার্থীদের জন্য স্টুডেন্ট আইডি।\n' +
      '  ৬. বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট (সর্বনিম্ন ৩০,০০০+ টাকা স্থিতি) অথবা ২০০ ডলার পাসপোর্ট এন্ডোর্সমেন্ট।\n\n' +
      'সরাসরি আপনার ফাইল সাবমিট করতে বা পরামর্শের জন্য আমাদের হোয়াটসঅ্যাপে নক দিন!';
  }

  // Slot booking / IVAC
  if (query.includes('স্লট') || query.includes('slot') || query.includes('আইভ্যাক') || query.includes('ivac') || query.includes('তারিখ') || query.includes('অ্যাপয়েন্টমেন্ট')) {
    return '⚡ **আইভ্যাক (IVAC) অ্যাপয়েন্টমেন্ট স্লট বুকিং সার্ভিস:**\n\n' +
      'আমরা ঢাকা (যমুনা ফিউচার পার্ক), চট্টগ্রাম, রাজশাহী, সিলেট, খুলনা সহ সারা দেশের সকল IVAC সেন্টারে দ্রুত স্লট বুকিং দিয়ে থাকি।\n\n' +
      '• **ট্যুরিস্ট স্লট:** মোট ৫৫০০ টাকা (আইভ্যাক ফি ১৫০০ + স্লট চার্জ ৪০০০)\n' +
      '• **মেডিকেল স্লট:** মোট ৫৫০০ টাকা (আইভ্যাক ফি ১৫০০ + স্লট চার্জ ৩৫০০)\n' +
      '• **বিজনেস স্লট:** মোট ৬০০০ টাকা (আইভ্যাক ফি ১৫০০ + স্লট চার্জ ৪৫০০)\n' +
      '• **ডাবল এন্ট্রি স্লট:** মোট ৬০০০ টাকা (আইভ্যাক ফি ১৫০০ + স্লট চার্জ ৪৫০০)\n\n' +
      '👉 স্লট বুকিংয়ের জন্য আপনার পাসপোর্টের কপি ও ওয়েব ফাইল নম্বর প্রয়োজন। বিস্তারিত জানতে কল/হোয়াটসঅ্যাপ করুন: **+8801577464706**';
  }

  // Double Entry Visa
  if (query.includes('ডাবল') || query.includes('double') || query.includes('ট্রানজিট') || query.includes('transit') || query.includes('ইউরোপ')) {
    return '📋 **ইন্ডিয়ান ডাবল এন্ট্রি ভিসা (Double Entry Visa):**\n\n' +
      '• **সার্ভিস চার্জ:** ৩,০০০ টাকা।\n' +
      '• **কাদের জন্য:** যারা ভারত হয়ে তৃতীয় কোনো দেশে (যেমন ইউরোপ, ইউকে, আমেরিকা) যাবেন বা দিল্লি/কলকাতা হয়ে অন্য দেশে ট্রানজিট বা এম্বাসি ফেস করতে যাবেন।\n' +
      '• **প্রয়োজনীয় ডকুমেন্টস:** মূল পাসপোর্ট, ছবি, তৃতীয় দেশের কনফার্মড এয়ার টিকেট, এম্বাসি অ্যাপয়েন্টমেন্ট লেটার বা ভিসা কপি, NID, ইউটিলিটি বিল এবং ব্যাংক স্টেটমেন্ট।\n\n' +
      'আমরা নিখুঁতভাবে আপনার ট্রানজিট টিকেট ও কভারিং লেটার রেডি করে থাকি।';
  }

  // Business Visa
  if (query.includes('বিজনেস') || query.includes('business') || query.includes('ব্যবসা') || query.includes('ট্রেড')) {
    return '📋 **ইন্ডিয়ান বিজনেস ভিসা (Business Visa):**\n\n' +
      '• **সার্ভিস চার্জ:** ৫,০০০ টাকা।\n' +
      '• **প্রয়োজনীয় কাগজপত্র:** মূল পাসপোর্ট, ছবি, ভারতীয় রেজিস্টার্ড কোম্পানির অফিসিয়াল ইনভাইটেশন লেটার, বাংলাদেশ কোম্পানির প্যাডে কভারিং লেটার, হালনাগাদ ট্রেড লাইসেন্স ও ইংরেজি অনুবাদ, ভিজিটিং কার্ড, ব্যাংক স্টেটমেন্ট এবং টিন/ভ্যাট সার্টিফিকেট।\n\n' +
      'সম্পূর্ণ কভারিং লেটার ও ফাইল ফরম্যাটিং আমাদের টিম করে দিবে।';
  }

  // Cost / Pricing General
  if (query.includes('খরচ') || query.includes('ফি') || query.includes('টাকা') || query.includes('cost') || query.includes('fee') || query.includes('price') || query.includes('charge')) {
    return '💰 **প্রসেসিং হাবের অফিসিয়াল সার্ভিস চার্জ চার্ট:**\n\n' +
      '• ট্যুরিস্ট ভিসা প্রসেসিং: **৳১,৫০০**\n' +
      '• মেডিকেল ভিসা (ইনভাইটেশন সহ): **৳৪,০০০**\n' +
      '• ডাবল এন্ট্রি ভিসা: **৳৩,০০০**\n' +
      '• বিজনেস ভিসা প্রসেসিং: **৳৫,০০০**\n' +
      '• এয়ার ও ট্রানজিট টিকেট বুকিং: **৳১,০০০**\n' +
      '• আইভ্যাক সরকারি ফি: **৳১,৫০০** (আইভ্যাক সেন্টারের নির্ধারিত ফি)\n\n' +
      'কোনো লুকানো চার্জ নেই। স্বচ্ছ ও নিরাপদ প্রসেসিংয়ের জন্য যোগাযোগ করুন: **+8801577464706**';
  }

  // Bank Statement questions
  if (query.includes('ব্যাংক') || query.includes('bank') || query.includes('স্টেটমেন্ট') || query.includes('ব্যালেন্স') || query.includes('ডলার') || query.includes('টাকা থাকতে')) {
    return '💳 **ব্যাংক স্টেটমেন্ট ও আর্থিক সলভেন্সির নিয়মাবলী:**\n\n' +
      '• আপনার ব্যাংক একাউন্টে বিগত **৬ মাসের লেনদেন** থাকতে হবে।\n' +
      '• একাউন্টে সর্বনিম্ন **৩০,০০০ টাকা** বা তার বেশি ব্যালেন্স থাকা নিরাপদ।\n' +
      '• ব্যাংক স্টেটমেন্টের সাথে ব্যাংক থেকে সিল ও সাইনযুক্ত **Bank Solvency Certificate** নিতে হবে।\n' +
      '• ব্যাংক একাউন্ট না থাকলে পাসপোর্টে **২০০ ইউএস ডলার (USD $200)** ব্যাংক বা অনুমোদিত মানি এক্সচেঞ্জার থেকে এন্ডোর্সমেন্ট করিয়ে নিলেই চলবে।';
  }

  // Photo specifications
  if (query.includes('ছবি') || query.includes('photo') || query.includes('picture') || query.includes('সাইজ')) {
    return '📸 **ইন্ডিয়ান ভিসার ছবির স্পেসিফিকেশন:**\n\n' +
      '• **সাইজ:** ২×২ ইঞ্চি (50mm × 50mm) বা ৩৫mm × ৪৫mm ল্যাব প্রিন্ট।\n' +
      '• **ব্যাকগ্রাউন্ড:** অবশ্যই সম্পূর্ণ পরিষ্কার সাদা (White Background)।\n' +
      '• **নিয়ম:** মুখমণ্ডল ৮০% স্পষ্ট থাকতে হবে, কোনো সানগ্লাস বা রঙিন চশমা পরা যাবে না, কান ও কপাল স্পষ্ট দেখা যেতে হবে এবং ছবি ৩ মাসের চেয়ে পুরাতন হওয়া যাবে না।';
  }

  // Contact / Phone / Address
  if (query.includes('ফোন') || query.includes('নম্বর') || query.includes('যোগাযোগ') || query.includes('ঠিকানা') || query.includes('contact') || query.includes('phone') || query.includes('address') || query.includes('whatsapp') || query.includes('হোয়াটসঅ্যাপ')) {
    return '📞 **প্রসেসিং হাবের সাথে যোগাযোগের তথ্য:**\n\n' +
      '• **হটলাইন ও হোয়াটসঅ্যাপ:** **+8801577464706** (01577-464706)\n' +
      '• **অফিস লোকেশন:** ঢাকা, বাংলাদেশ\n' +
      '• **সার্ভিস সময়:** প্রতিদিন সকাল ৯:০০ টা থেকে রাত ১০:০০ টা\n' +
      '• **ইমেইল:** support@processinghub.com\n\n' +
      'সরাসরি সিনিয়র কনসালটেন্টের সাথে কথা বলতে এখনই হোয়াটসঅ্যাপে মেসেজ করুন!';
  }

  // Duration / Time required
  if (query.includes('কত দিন') || query.includes('সময়') || query.includes('লাগে') || query.includes('duration') || query.includes('time') || query.includes('ডেলিভারি')) {
    return '⏱️ **ভিসা প্রসেসিং ও ডেলিভারি সময়সীমা:**\n\n' +
      '• অনলাইন ফরম পূরণ ও ফাইল রেডি: **১ থেকে ২ কর্মদিবস**\n' +
      '• আইভ্যাক স্লট পাওয়া: সাধারণত **৩ থেকে ৭ দিনের মধ্যে** সুবিধাজনক স্লট পাওয়া যায়।\n' +
      '• আইভ্যাকে ফাইল জমা দেওয়ার পর ভিসা ডেলিভারি: ভারতীয় হাইকমিশনের নিয়ম অনুযায়ী সাধারণত **৭ থেকে ১৫ কর্মদিবস** সময় লাগে (মেডিকেল ভিসার ক্ষেত্রে অনেক সময় আরও দ্রুত পাওয়া যায়)।';
  }

  // Default Comprehensive Consultation Reply
  return `আসসালামু আলাইকুম! আমি **MOHAMMAD**, প্রসেসিং হাবের সিনিয়র ট্রাভেল ও ভিসা কনসালটেন্ট।\n\n` +
    `আমরা অত্যন্ত নির্ভরযোগ্যভাবে নিচের সেবাসমূহ প্রদান করে থাকি:\n` +
    `• **ট্যুরিস্ট ভিসা প্রসেসিং** (ভ্রমণ ও পারিবারিক সফর)\n` +
    `• **মেডিকেল ভিসা ও ইনভাইটেশন লেটার** (জরুরি চিকিৎসা)\n` +
    `• **আইভ্যাক অ্যাপয়েন্টমেন্ট স্লট বুকিং** (ঢাকা, চট্টগ্রাম ও সারা দেশ)\n` +
    `• **ডাবল এন্ট্রি ও বিজনেস ভিসা ফাইল প্রস্তুত**\n` +
    `• **বিমান ও ট্রানজিট টিকেট বুকিং**\n\n` +
    `আপনার পাসপোর্টের তথ্য দিয়ে ফাইল রেডি করতে বা যেকোনো জরুরি সহায়তার জন্য সরাসরি আমাদের **WhatsApp (+8801577464706)**-এ মেসেজ দিন!`;
}

// API endpoint for chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, serviceContext } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastUserMessage = messages[messages.length - 1]?.text || '';
    const ai = getAiClient();

    // Dynamically inject service context into the system prompt
    let contextualSystemInstruction = SYSTEM_INSTRUCTION;
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
            temperature: 0.65,
          },
        });

        if (response && response.text) {
          return res.json({
            reply: response.text,
            sources: [],
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
