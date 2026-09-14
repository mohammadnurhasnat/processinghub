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

// API endpoint for chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getAiClient();

    // Fallback if GEMINI_API_KEY is not configured in environment
    if (!ai) {
      const lastUserMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
      let fallbackText = 'আসসালামু আলাইকুম! আমি MOHAMMAD, প্রসেসিং হাবের পক্ষ থেকে আপনাকে স্বাগতম। ';

      if (lastUserMsg.includes('ট্যুরিস্ট') || lastUserMsg.includes('tourist')) {
        fallbackText += 'ইন্ডিয়ান ট্যুরিস্ট ভিসার জন্য প্রসেসিং চার্জ ১,৫০০ টাকা। প্রয়োজনীয় ডকুমেন্টস: মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদ), ২x২ সাইজের সাদা ব্যাকগ্রাউন্ডের ল্যাব প্রিন্ট ছবি, NID বা জন্মনিবন্ধন, ইউটিলিটি বিলের কপি, পেশাগত প্রমাণপত্র (NOC/ট্রেড লাইসেন্স) এবং বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট (সর্বনিম্ন ৩০,০০০ টাকা ব্যালেন্স) অথবা ২০০$ এন্ডোর্সমেন্ট। দ্রুত প্রসেসিং করতে আমাদের সাথে যোগাযোগ করুন।';
      } else if (lastUserMsg.includes('মেডিকেল') || lastUserMsg.includes('medical') || lastUserMsg.includes('ডাক্তার') || lastUserMsg.includes('hospital')) {
        fallbackText += 'মেডিকেল ভিসার জন্য সার্ভিস চার্জ ৪,০০০ টাকা। এর জন্য রোগীর ও অ্যাটেনডেন্টের পাসপোর্ট, ছবি, বাংলাদেশ ও ভারতের ডাক্তারের প্রেসক্রিপশন ও ভারতের অনুমোদিত হাসপাতাল থেকে ইনভাইটেশন লেটার প্রয়োজন। আমরা দ্রুত ইনভাইটেশন লেটার সংগ্রহ ও ফাইল প্রসেসিং করে থাকি।';
      } else if (lastUserMsg.includes('স্লট') || lastUserMsg.includes('slot') || lastUserMsg.includes('ivac') || lastUserMsg.includes('ফি') || lastUserMsg.includes('খরচ')) {
        fallbackText += 'আইভ্যাক অ্যাপয়েন্টমেন্ট স্লট বুকিং ফি: আইভ্যাকের নির্ধারিত ফি ১৫০০ টাকা + স্লট সার্ভিস চার্জ। ট্যুরিস্ট স্লট মোট ৫৫০০ টাকা, মেডিকেল স্লট ৫৫০০ টাকা, বিজনেস স্লট ৬০০০ টাকা। ঢাকা, চট্টগ্রাম, খুলনা সহ যেকোনো সেন্টারে স্লট প্রসেসিং করা হয়।';
      } else if (lastUserMsg.includes('যোগাযোগ') || lastUserMsg.includes('phone') || lastUserMsg.includes('number') || lastUserMsg.includes('ঠিকানা')) {
        fallbackText += 'আমাদের অফিস ঢাকা, বাংলাদেশে অবস্থিত। সরাসরি কথা বলতে কল বা হোয়াটসঅ্যাপ করুন: +8801577464706 নম্বরে অথবা ইমেইল করুন support@processinghub.com এ।';
      } else {
        fallbackText += 'আমরা ইন্ডিয়ান ট্যুরিস্ট, মেডিকেল, বিজনেস ও ডাবল এন্ট্রি ভিসা প্রসেসিং, আইভ্যাক স্লট বুকিং এবং টিকেট বুকিং সেবা প্রদান করি। আপনার যেকোনো প্রশ্নের বিস্তারিত জানতে আমাকে জানান বা সরাসরি আমাদের হোয়াটসঅ্যাপে (+8801577464706) যোগাযোগ করুন!';
      }

      return res.json({
        reply: fallbackText,
        sources: [],
      });
    }

    // Format messages for Gemini API
    // Use the last 8 messages for contextual history
    const recentMessages = messages.slice(-8);
    const contents = recentMessages.map((msg: { role: string; text: string }) => ({
      role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text || '' }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        tools: [
          { googleSearch: {} },
        ],
      },
    });

    const reply = response.text || 'দুঃখিত, এই মুহূর্তে উত্তরটি প্রক্রিয়াকরণ করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন বা সরাসরি হোয়াটসঅ্যাপে নক দিন।';
    
    // Extract grounding sources if available
    const candidate = response.candidates?.[0];
    const webSearchQueries = candidate?.groundingMetadata?.webSearchQueries || [];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => ({
        title: chunk.web?.title || 'ওয়েব তথ্য',
        uri: chunk.web?.uri || '',
      }))
      .filter((s: { uri: string }) => Boolean(s.uri))
      .slice(0, 3);

    return res.json({
      reply,
      sources,
      webSearchQueries,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'সার্ভারে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন অথবা সরাসরি আমাদের হোয়াটসঅ্যাপে মেসেজ দিন।',
      details: error?.message || 'Unknown error',
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
