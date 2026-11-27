import React, { useState, useRef, useEffect } from 'react';
import { 
  MessagesSquare, 
  Send, 
  X, 
  ExternalLink, 
  HelpCircle, 
  Check, 
  CheckCheck,
  Copy, 
  Search,
  Tag,
  User,
  Phone,
  ShieldCheck,
  LogOut,
  ArrowRight,
  Paperclip,
  FileText,
  Puzzle,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { CONFIG } from '../config';
import { VisaService } from '../types';
import { ExtensionAuroraShell } from './ExtensionSpotlightBanner';
import { soundEffects } from '../utils/soundEffects';
import { compressChatAttachment } from '../utils/fileCompressor';
import { useWhatsApp } from '../context/WhatsAppContext';
import { useLanguage, Language } from '../context/LanguageContext';

export interface UserProfile {
  name: string;
  phone: string;
}

const USER_PROFILE_KEY = 'processinghub_user_profile';
const AGENT_STORAGE_KEY = 'processinghub_assigned_agent_v1';
const LAST_SUMMARIZED_KEY = 'processinghub_last_summarized_fp_v1';

const AGENT_NAMES = ['Nur Sajid', 'Eity', 'Nur Hasnat', 'Mohammad', 'Aysha'] as const;
type AgentName = (typeof AGENT_NAMES)[number];

const pickRandomAgent = (exclude?: string): AgentName => {
  const pool = exclude && AGENT_NAMES.length > 1
    ? AGENT_NAMES.filter((name) => name !== exclude)
    : [...AGENT_NAMES];
  return pool[Math.floor(Math.random() * pool.length)];
};

const getOrAssignSessionAgent = (): AgentName => {
  if (typeof window !== 'undefined') {
    try {
      const savedAgent = localStorage.getItem(AGENT_STORAGE_KEY) as AgentName | null;
      if (savedAgent && (AGENT_NAMES as readonly string[]).includes(savedAgent)) {
        return savedAgent;
      }
      const picked = pickRandomAgent();
      localStorage.setItem(AGENT_STORAGE_KEY, picked);
      return picked;
    } catch {
      return pickRandomAgent();
    }
  }
  return AGENT_NAMES[0];
};

interface ChatAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data?: string;
  previewUrl?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  isRead?: boolean;
  attachments?: ChatAttachment[];
  sources?: Array<{ title: string; uri: string }>;
  webSearchQueries?: string[];
}

interface AiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWhatsAppDirect?: () => void;
  serviceContext?: VisaService | null;
  onClearServiceContext?: () => void;
}

const DEFAULT_QUICK_PROMPTS_BN = [
  'ট্যুরিস্ট ভিসার প্রয়োজনীয় ডকুমেন্টস কি কি?',
  'মেডিকেল ভিসার ইনভাইটেশন লেটার কিভাবে পাব?',
  'পরবর্তী ইন্ডিয়ান ভিসা স্লট কবে ছাড়বে?',
  'আইভ্যাক স্লট বুকিং ফি ও সময় কত?',
  'ব্যাংক স্টেটমেন্ট ও ছবির সঠিক নিয়ম কি?'
];

const DEFAULT_QUICK_PROMPTS_EN = [
  'What documents are required for a Tourist Visa?',
  'How do I get a Medical Visa invitation letter?',
  'When will the next Indian visa slots open?',
  'What is the IVAC slot booking fee and timeline?',
  'What are the rules for bank statements and photos?'
];

const getContextualQuickPrompts = (
  service: VisaService | null | undefined,
  language: Language = 'bn'
): string[] => {
  if (!service) {
    return language === 'en' ? DEFAULT_QUICK_PROMPTS_EN : DEFAULT_QUICK_PROMPTS_BN;
  }

  const title = service.title.toLowerCase();
  if (language === 'en') {
    if (title.includes('medical') || title.includes('মেডিকেল')) {
      return [
        'How do I collect the medical invitation letter?',
        'What documents are needed for patient & attendant?',
        'What are the medical visa processing & IVAC slot fees?',
        'How quickly can a slot be arranged for urgent treatment?'
      ];
    }
    if (title.includes('tourist') || title.includes('ট্যুরিস্ট')) {
      return [
        'How much bank balance is needed for a Tourist Visa?',
        'What documents do job holders & business owners need?',
        'What is the Tourist Visa processing & IVAC fee?',
        'How many days does passport delivery take after submission?'
      ];
    }
    if (title.includes('double') || title.includes('ডাবল') || title.includes('transit')) {
      return [
        'How should I submit the transit ticket for Double Entry Visa?',
        'How do I submit the embassy appointment letter?',
        'What is the Double Entry Visa processing charge?',
        'Who is eligible for a Double Entry Visa?'
      ];
    }
    if (title.includes('business') || title.includes('বিজনেস')) {
      return [
        'How should the Indian company invitation letter be formatted?',
        'What are the rules for trade license & tax certificates?',
        'What is the Business Visa processing fee?',
        'How long does an IVAC Business Visa slot take?'
      ];
    }
    if (service.isSlotBooking || title.includes('slot') || title.includes('স্লট')) {
      return [
        'How can I book a fast slot at Dhaka IVAC?',
        'What are the total fees for Tourist & Medical slots?',
        'What are the Web File & SIM card rules for slot booking?',
        'Are slots available for Sylhet or Chattogram centers?'
      ];
    }

    return [
      `What documents are required for ${service.title}?`,
      `What is the total cost & processing time for ${service.title}?`,
      'What are the rules for IVAC slot booking?',
      'What are the steps to start processing directly?'
    ];
  }

  if (title.includes('medical') || title.includes('মেডিকেল')) {
    return [
      'মেডিকেল ইনভাইটেশন লেটার কিভাবে সংগ্রহ করব?',
      'রোগী ও অ্যাটেনডেন্টের কি কি ডকুমেন্টস লাগে?',
      'মেডিকেল ভিসার প্রসেসিং ফি ও আইভ্যাক স্লট চার্জ কত?',
      'জরুরি চিকিৎসার জন্য কত দ্রুত স্লট পাওয়া সম্ভব?'
    ];
  }
  if (title.includes('tourist') || title.includes('ট্যুরিস্ট')) {
    return [
      'ট্যুরিস্ট ভিসায় ব্যাংক ব্যালেন্স কত থাকা লাগে?',
      'চাকুরিজীবী ও ব্যবসায়ীদের কি কি কাগজপত্র লাগবে?',
      'ট্যুরিস্ট ভিসা প্রসেসিং ও আইভ্যাক ফি কত?',
      'আইভ্যাকে জমা দেওয়ার কত দিন পর পাসপোর্ট ডেলিভারি হয়?'
    ];
  }
  if (title.includes('double') || title.includes('ডাবল') || title.includes('transit')) {
    return [
      'ডাবল এন্ট্রি ভিসার জন্য ট্রানজিট টিকেট কিভাবে দেব?',
      'এম্বাসি অ্যাপয়েন্টমেন্ট লেটার কিভাবে সাবমিট করব?',
      'ডাবল এন্ট্রি ভিসা প্রসেসিং চার্জ কত?',
      'কাদের জন্য ডাবল এন্ট্রি ভিসা প্রযোজ্য?'
    ];
  }
  if (title.includes('business') || title.includes('বিজনেস')) {
    return [
      'ইন্ডিয়ান কোম্পানি ইনভাইটেশন লেটার কিভাবে দিতে হয়?',
      'ট্রেড লাইসেন্স ও ট্যাক্স সার্টিফিকেট সংক্রান্ত নিয়ম কি?',
      'বিজনেস ভিসা প্রসেসিং ফি কত?',
      'বিজনেস ভিসার আইভ্যাক স্লট কত দিনে পাওয়া যায়?'
    ];
  }
  if (service.isSlotBooking || title.includes('slot') || title.includes('স্লট')) {
    return [
      'ঢাকা আইভ্যাক সেন্টারে দ্রুত স্লট বুকিং কিভাবে করব?',
      'ট্যুরিস্ট ও মেডিকেল স্লটের মোট ফি কত?',
      'ওয়েব ফাইল ও সিম কার্ড দিয়ে স্লট বুকিংয়ের নিয়ম কি?',
      'সিলেট/চট্টগ্রাম সেন্টারে স্লট পাওয়া যাবে?'
    ];
  }

  return [
    `${service.title} এর প্রয়োজনীয় ডকুমেন্টস কি কি?`,
    `${service.title} এর মোট খরচ ও সময় কত?`,
    'আইভ্যাক স্লট বুকিং এর নিয়ম কি?',
    'সরাসরি প্রসেসিং শুরু করার ধাপগুলো কি কি?'
  ];
};

const formatTimestamp = (date: Date = new Date()): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatDisplayTime = (timeStr?: string): string => {
  if (!timeStr) return formatTimestamp();
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  return formatTimestamp();
};

const getWelcomeMessage = (
  service: VisaService | null | undefined,
  agentName: AgentName,
  language: Language = 'bn',
  userName?: string
): string => {
  const greetingName = userName ? ` **${userName}**` : '';
  if (language === 'en') {
    if (service?.title) {
      return `Assalamu Alaikum${greetingName}! I am **${agentName}** from Processing Hub. How can I assist you with **"${service.title}"** today?`;
    }
    return `Assalamu Alaikum${greetingName}! I am **${agentName}** from Processing Hub. How can I help you with your visa or travel processing today?`;
  }
  if (service?.title) {
    return `আসসালামু আলাইকুম${greetingName}! আমি **${agentName}**। **"${service.title}"** সম্পর্কে আপনার কী জানার আছে বলুন, সাহায্য করছি।`;
  }
  return `আসসালামু আলাইকুম${greetingName}! আমি **${agentName}**, প্রসেসিং হাব থেকে বলছি। আপনার কী বিষয়ে সহযোগিতা প্রয়োজন বলুন।`;
};

const STORAGE_KEY = 'processinghub_chat_history_v1';
const USER_MEMORY_KEY = 'processinghub_user_chat_memory_v1';

interface ArchivedSession {
  id: string;
  endedAt: string;
  serviceTitle?: string;
  messages: Array<{ role: 'user' | 'assistant'; text: string }>;
}

const normalizeUserMemoryKey = (phone?: string): string => {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits || 'guest';
};

const loadUserPastSessions = (phone?: string): ArchivedSession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USER_MEMORY_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, ArchivedSession[]>;
    const key = normalizeUserMemoryKey(phone);
    return Array.isArray(map[key]) ? map[key].slice(-5) : [];
  } catch {
    return [];
  }
};

const archiveUserSessionLocally = (
  phone: string | undefined,
  msgs: ChatMessage[],
  serviceTitle?: string,
  language: Language = 'bn'
): ArchivedSession | null => {
  const userMsgs = msgs.filter((m) => m.role === 'user');
  if (userMsgs.length === 0) return null;

  const compactMessages = msgs
    .filter((m) => !(m.role === 'assistant' && m.id.startsWith('welcome-')))
    .slice(-16)
    .map((m) => {
      const attSummary =
        m.attachments && m.attachments.length > 0
          ? ` [${language === 'en' ? 'File' : 'ফাইল'}: ${m.attachments.map((a) => a.name).join(', ')}]`
          : '';
      return {
        role: m.role,
        text: `${(m.text || '').trim()}${attSummary}`.trim().slice(0, 360),
      };
    })
    .filter((m) => m.text.length > 0);

  if (compactMessages.length === 0) return null;

  const sessionRecord: ArchivedSession = {
    id: `sess-${Date.now()}`,
    endedAt: new Date().toISOString(),
    serviceTitle,
    messages: compactMessages,
  };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(USER_MEMORY_KEY);
      const map: Record<string, ArchivedSession[]> = raw ? JSON.parse(raw) : {};
      const key = normalizeUserMemoryKey(phone);
      const prev = Array.isArray(map[key]) ? map[key] : [];
      map[key] = [...prev, sessionRecord].slice(-5);
      localStorage.setItem(USER_MEMORY_KEY, JSON.stringify(map));
    } catch (err) {
      console.error('Failed to archive user chat memory:', err);
    }
  }

  return sessionRecord;
};

// Ensure Unicode bullet characters (•, ●, ▪, ◦) and single-newline lists render as proper separated Markdown <ul><li> lists
const normalizeMarkdownBullets = (raw: string): string => {
  if (!raw) return '';
  const preprocessed = raw
    .replace(/\r\n/g, '\n')
    // Split accidental inline bullets (e.g., "কপি। • **পাসপোর্ট:**") onto separate lines
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
};

export const AiChatbotModal: React.FC<AiChatbotModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenWhatsAppDirect,
  serviceContext,
  onClearServiceContext
}) => {
  const { language, t, num } = useLanguage();
  const { pendingAgentHandoff, clearAgentHandoff } = useWhatsApp();

  const [assignedAgent, setAssignedAgent] = useState<AgentName>(() => getOrAssignSessionAgent());

  // Load saved user profile (Name & Phone) from localStorage
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedProfile = localStorage.getItem(USER_PROFILE_KEY);
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          if (parsed && parsed.name && parsed.phone) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to load user profile:', e);
      }
    }
    return null;
  });

  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [formError, setFormError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const computeSummaryFingerprint = (
    msgs: ChatMessage[],
    profile: UserProfile | null
  ): string | null => {
    const userMsgs = msgs.filter((m) => m.role === 'user');
    if (userMsgs.length === 0) return null;
    const phoneKey = (profile?.phone || '').replace(/\D/g, '').slice(-10);
    const nameKey = (profile?.name || '').trim().toLowerCase().slice(0, 40);
    const userSig = userMsgs
      .map((m) => `${m.id}|${(m.text || '').trim().slice(0, 160)}|${m.attachments?.length || 0}`)
      .join('||');
    return `${phoneKey || nameKey}::${userMsgs.length}::${userSig}`;
  };

  const lastSummarizedFpRef = useRef<string | null>(
    typeof window !== 'undefined'
      ? (() => {
          try {
            return localStorage.getItem(LAST_SUMMARIZED_KEY);
          } catch {
            return null;
          }
        })()
      : null
  );
  // Only dispatch Telegram leads when the customer actually sent a NEW message during this page session
  // (prevents old localStorage chats from yesterday from ever re-sending on reload/tab-switch)
  const hasUnsentUserActivityRef = useRef<boolean>(false);
  const processedHandoffIdRef = useRef<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedProfile = localStorage.getItem(USER_PROFILE_KEY);
        const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;
        const initialName = parsedProfile?.name;
        const currentAgent = getOrAssignSessionAgent();
        const savedLangRaw = localStorage.getItem('processinghub_lang');
        const initialLang: Language = savedLangRaw === 'en' ? 'en' : 'bn';

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(-50);
          }
        }
        return [
          {
            id: 'welcome-1',
            role: 'assistant',
            text: getWelcomeMessage(serviceContext, currentAgent, initialLang, initialName),
            time: formatTimestamp(),
            isRead: true,
          }
        ];
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        text: getWelcomeMessage(serviceContext, AGENT_NAMES[0], language),
        time: formatTimestamp(),
        isRead: true,
      }
    ];
  });
  const [inputText, setInputText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [isCompressingFiles, setIsCompressingFiles] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTypingBubble, setShowTypingBubble] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevServiceRef = useRef<string | undefined>(serviceContext?.id);
  const isMountedRef = useRef(true);
  const chatSessionIdRef = useRef(0);
  const typingRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handoffSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOpenRef = useRef(false);
  const initialMessageIdsRef = useRef<Set<string>>(new Set(messages.map((m) => m.id)));

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (typingRevealTimerRef.current) clearTimeout(typingRevealTimerRef.current);
      if (handoffSendTimerRef.current) clearTimeout(handoffSendTimerRef.current);
    };
  }, []);

  // Scroll only inside the chat message container (never scrollIntoView, which can shake outer layout)
  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (behavior === 'smooth') {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Sync messages to localStorage whenever messages change (strip heavy base64 payloads so storage quota is safe)
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        const toSave = messages.slice(-50).map((m) => ({
          ...m,
          attachments: m.attachments?.map((a) => ({
            id: a.id,
            name: a.name,
            mimeType: a.mimeType,
            size: a.size,
          })),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        console.error('Failed to persist chat messages:', e);
      }
    }
  }, [messages]);

  // Read status management: When modal is open and assistant messages exist, mark as read with subtle transition and pop audio cue
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const hasUnread = messages.some(m => m.role === 'assistant' && !m.isRead);
      if (hasUnread) {
        const timer = setTimeout(() => {
          soundEffects.playReadCheckPop();
          setMessages(prev =>
            prev.map(m => (m.role === 'assistant' ? { ...m, isRead: true } : m))
          );
        }, 450);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, messages]);

  // When active service context changes, update welcome message
  useEffect(() => {
    if (serviceContext?.id && serviceContext?.id !== prevServiceRef.current) {
      prevServiceRef.current = serviceContext?.id;
      const contextMsg: ChatMessage = {
        id: `context-${Date.now()}`,
        role: 'assistant',
        text: getWelcomeMessage(serviceContext, assignedAgent, language, userProfile?.name),
        time: formatTimestamp(),
        isRead: false,
      };
      setMessages(prev => [...prev.slice(-9), contextMsg]);
    }
  }, [serviceContext, assignedAgent, language, userProfile?.name]);

  // Sync single welcome greeting if site language toggles before chat conversation starts
  useEffect(() => {
    setMessages((prev) => {
      if (
        prev.length === 1 &&
        prev[0].role === 'assistant' &&
        (prev[0].id.startsWith('welcome-') || prev[0].id.startsWith('context-'))
      ) {
        const refreshedText = getWelcomeMessage(serviceContext, assignedAgent, language, userProfile?.name);
        if (prev[0].text !== refreshedText) {
          return [{ ...prev[0], text: refreshedText }];
        }
      }
      return prev;
    });
  }, [language, serviceContext, assignedAgent, userProfile?.name]);

  // Smooth scroll management: align cleanly on open without fighting entrance animation, smooth scroll on new messages
  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }

    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;

    if (justOpened) {
      const rAf = requestAnimationFrame(() => {
        scrollToBottom('auto');
      });

      const focusTimer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches) {
          inputRef.current?.focus({ preventScroll: true });
        }
      }, 270);

      return () => {
        cancelAnimationFrame(rAf);
        clearTimeout(focusTimer);
      };
    }

    const rAf = requestAnimationFrame(() => {
      scrollToBottom('smooth');
    });

    return () => cancelAnimationFrame(rAf);
  }, [isOpen, messages.length, showTypingBubble]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${num(bytes)} B`;
    if (bytes < 1024 * 1024) return `${num((bytes / 1024).toFixed(1))} KB`;
    return `${num((bytes / (1024 * 1024)).toFixed(1))} MB`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAttachmentError(null);

    const maxInputBytes = 25 * 1024 * 1024; // Accept large photos/PDFs up to 25 MB and auto-compress them
    const maxCompressedBytes = 10 * 1024 * 1024;
    const maxCount = 3;
    const nextList: ChatAttachment[] = [...pendingAttachments];
    const fileArray = Array.from(files);
    e.target.value = '';

    setIsCompressingFiles(true);
    try {
      for (const file of fileArray) {
        if (nextList.length >= maxCount) {
          setAttachmentError(
            t(
              'একসাথে সর্বোচ্চ ৩টি ফাইল বা ছবি যুক্ত করা যাবে।',
              'You can attach up to 3 files or photos at once.'
            )
          );
          break;
        }
        if (file.size > maxInputBytes) {
          setAttachmentError(
            t(
              `"${file.name}" ফাইলটি ২৫ MB-এর বেশি। দয়া করে ছোট ফাইল দিন।`,
              `"${file.name}" exceeds 25 MB. Please upload a smaller file.`
            )
          );
          continue;
        }

        const mimeType =
          file.type ||
          (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
        const isSupported =
          mimeType.startsWith('image/') ||
          mimeType === 'application/pdf' ||
          mimeType.startsWith('text/') ||
          mimeType === 'text/csv';

        if (!isSupported) {
          setAttachmentError(
            t(
              `"${file.name}" ফরম্যাট সাপোর্টেড নয়। ছবি, PDF বা টেক্সট ফাইল দিন।`,
              `"${file.name}" format is not supported. Please attach an image, PDF, or text file.`
            )
          );
          continue;
        }

        const compressed = await compressChatAttachment(file);
        if (!compressed.base64Data) continue;

        if (compressed.size > maxCompressedBytes) {
          setAttachmentError(
            t(
              `"${file.name}" কম্প্রেস করার পরও অনেক বড়। অনুগ্রহ করে ফাইলটি ছোট করে দিন।`,
              `"${file.name}" is still too large after compression. Please use a smaller file.`
            )
          );
          continue;
        }

        nextList.push({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: compressed.name,
          mimeType: compressed.mimeType,
          size: compressed.size,
          data: compressed.base64Data,
          previewUrl: compressed.mimeType.startsWith('image/') ? compressed.dataUrl : undefined,
        });
      }

      if (isMountedRef.current) {
        setPendingAttachments(nextList);
      }
    } catch (err) {
      console.error('Attachment compression error:', err);
      if (isMountedRef.current) {
        setAttachmentError(
          t(
            'ফাইলটি প্রসেস করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
            'Failed to process the file. Please try again.'
          )
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsCompressingFiles(false);
      }
    }
  };

  const handleRemovePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((item) => item.id !== id));
    setAttachmentError(null);
  };

  const handleSendMessage = async (
    textToSend?: string,
    overrideProfile?: UserProfile,
    overrideAgent?: AgentName
  ) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    const attachmentsToSend = textToSend !== undefined ? [] : pendingAttachments;
    if ((!text && attachmentsToSend.length === 0) || isLoading) return;

    const activeProfile = overrideProfile || userProfile;
    const activeAgent = overrideAgent || assignedAgent;
    const currentSessionId = chatSessionIdRef.current;
    const requestStartedAt = Date.now();
    // Natural human-like reading + typing window (5 to 7 seconds)
    const targetReplyDelayMs = 5000 + Math.floor(Math.random() * 2001);

    // Play sending sound
    soundEffects.playSendPop();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      time: formatTimestamp(),
      attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
    };

    const newMessages = [...messages, userMessage];
    hasUnsentUserActivityRef.current = true;
    setMessages(newMessages);
    if (textToSend === undefined) {
      setInputText('');
      setPendingAttachments([]);
      setAttachmentError(null);
    }
    setIsLoading(true);
    setShowTypingBubble(false);

    if (typingRevealTimerRef.current) {
      clearTimeout(typingRevealTimerRef.current);
    }
    typingRevealTimerRef.current = setTimeout(() => {
      if (isMountedRef.current && chatSessionIdRef.current === currentSessionId) {
        setShowTypingBubble(true);
      }
    }, 650);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m, idx) => ({
            role: m.role,
            text: m.text,
            attachments: m.attachments?.map((a) => ({
              name: a.name,
              mimeType: a.mimeType,
              // Send binary data only for recent messages (last 4 messages) to keep payload lean
              data: idx >= newMessages.length - 4 ? a.data : undefined,
            })),
          })),
          userName: activeProfile?.name,
          userPhone: activeProfile?.phone,
          agentName: activeAgent,
          language,
          pastConversations: loadUserPastSessions(activeProfile?.phone),
          serviceContext: serviceContext ? {
            id: serviceContext.id,
            title: serviceContext.title,
            category: serviceContext.category,
            price: serviceContext.price,
            per: serviceContext.per,
            description: serviceContext.description,
            documents: serviceContext.documents,
            isSlotBooking: serviceContext.isSlotBooking,
          } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(t('সার্ভারে রেসপন্স পাওয়া যায়নি', 'No response from server'));
      }

      const data = await response.json();

      const elapsedMs = Date.now() - requestStartedAt;
      const remainingDelay = Math.max(0, targetReplyDelayMs - elapsedMs);
      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay));
      }

      if (!isMountedRef.current || chatSessionIdRef.current !== currentSessionId) return;

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply || t('দুঃখিত, কোনো উত্তর পাওয়া যায়নি।', 'Sorry, no response was received.'),
        time: formatTimestamp(),
        isRead: false,
        sources: data.sources || [],
        webSearchQueries: data.webSearchQueries || [],
      };

      setMessages(prev => [...prev, assistantMessage]);
      // Play melodious reply notification chime
      soundEffects.playReplyChime();
    } catch (error) {
      console.error('Chat error:', error);
      const elapsedMs = Date.now() - requestStartedAt;
      const remainingDelay = Math.max(0, targetReplyDelayMs - elapsedMs);
      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay));
      }

      if (!isMountedRef.current || chatSessionIdRef.current !== currentSessionId) return;

      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: t(
          'আন্তরিকভাবে দুঃখিত, সংযোগে সামান্য সমস্যা হয়েছে। আপনার প্রয়োজনীয় তথ্যের জন্য অনুগ্রহ করে আমাদের সাথে সরাসরি হোয়াটসঅ্যাপে (+৮৮০১৫৭৭৪৬৪৭০৬) যোগাযোগ করুন বা আবার প্রশ্ন করুন।',
          'Sorry, there was a brief connection issue. Please try asking again or message us directly on WhatsApp (+8801577464706) for immediate assistance.'
        ),
        time: formatTimestamp(),
        isRead: false,
      };
      setMessages(prev => [...prev, errorMessage]);
      soundEffects.playReplyChime();
    } finally {
      if (typingRevealTimerRef.current) {
        clearTimeout(typingRevealTimerRef.current);
        typingRevealTimerRef.current = null;
      }
      if (isMountedRef.current && chatSessionIdRef.current === currentSessionId) {
        setShowTypingBubble(false);
        setIsLoading(false);
      }
    }
  };

  // Auto-fill profile and smoothly send formatted inquiry after chat window entrance settles
  useEffect(() => {
    if (!isOpen || !pendingAgentHandoff) return;
    if (processedHandoffIdRef.current === pendingAgentHandoff.id) return;

    processedHandoffIdRef.current = pendingAgentHandoff.id;

    const nextProfile: UserProfile = {
      name: pendingAgentHandoff.name,
      phone: pendingAgentHandoff.phone,
    };

    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(nextProfile));
    } catch (err) {
      console.error('Failed to persist user profile from handoff:', err);
    }

    setUserProfile(nextProfile);
    setIsEditingProfile(false);
    setFormError('');

    const messageToSend = pendingAgentHandoff.formattedMessage;
    const handoffAttachments = pendingAgentHandoff.attachments;
    const instantReply = pendingAgentHandoff.instantAgentReply;
    const skipAutoSummary = Boolean(pendingAgentHandoff.skipAutoTelegramSummary);
    clearAgentHandoff();

    if (handoffSendTimerRef.current) {
      clearTimeout(handoffSendTimerRef.current);
    }
    handoffSendTimerRef.current = setTimeout(() => {
      handoffSendTimerRef.current = null;
      if (!isMountedRef.current) return;

      if (instantReply) {
        soundEffects.playSendPop();
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          text: messageToSend,
          time: formatTimestamp(),
          attachments: handoffAttachments && handoffAttachments.length > 0 ? handoffAttachments : undefined,
        };
        setMessages((prev) => [...prev, userMessage]);
        hasUnsentUserActivityRef.current = !skipAutoSummary;
        setShowTypingBubble(true);

        if (typingRevealTimerRef.current) {
          clearTimeout(typingRevealTimerRef.current);
        }
        typingRevealTimerRef.current = setTimeout(() => {
          typingRevealTimerRef.current = null;
          if (!isMountedRef.current) return;
          setShowTypingBubble(false);
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: instantReply,
            time: formatTimestamp(),
            isRead: false,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          soundEffects.playReplyChime();
        }, 700);
      } else {
        handleSendMessage(messageToSend, nextProfile, assignedAgent);
      }
    }, 260);
  }, [isOpen, pendingAgentHandoff]);

  // Keep latest state in a ref for reliable background/pagehide/idle dispatch
  const latestChatRef = useRef({
    messages,
    userProfile,
    serviceContext,
    assignedAgent,
  });

  useEffect(() => {
    latestChatRef.current = {
      messages,
      userProfile,
      serviceContext,
      assignedAgent,
    };
  }, [messages, userProfile, serviceContext, assignedAgent]);

  // Helper to trigger full conversation & summary dispatch to Telegram (strictly deduplicated across reloads/tabs)
  const triggerTelegramSummary = (trigger: 'close' | 'manual' | 'idle' | 'unload') => {
    // Never re-send old restored localStorage chats that had no new user activity in this session
    if (!hasUnsentUserActivityRef.current) return;

    const {
      messages: currentMessages,
      userProfile: currentProfile,
      serviceContext: currentService,
      assignedAgent: currentAgent,
    } = latestChatRef.current;

    // Only send if the customer asked at least one user question
    const userMsgs = currentMessages.filter(m => m.role === 'user');
    if (userMsgs.length === 0) return;

    const fingerprint = computeSummaryFingerprint(currentMessages, currentProfile);
    if (!fingerprint) return;

    // Check both in-memory ref and persistent localStorage so tab switches / reloads never resend
    let persistedFp: string | null = null;
    try {
      persistedFp = localStorage.getItem(LAST_SUMMARIZED_KEY);
    } catch {
      persistedFp = null;
    }

    if (lastSummarizedFpRef.current === fingerprint || persistedFp === fingerprint) {
      hasUnsentUserActivityRef.current = false;
      return;
    }

    lastSummarizedFpRef.current = fingerprint;
    hasUnsentUserActivityRef.current = false;
    try {
      localStorage.setItem(LAST_SUMMARIZED_KEY, fingerprint);
    } catch {
      // Ignore storage quota errors
    }

    const payload = JSON.stringify({
      user: currentProfile,
      agentName: currentAgent,
      serviceContext: currentService ? {
        id: currentService.id,
        title: currentService.title,
        price: currentService.price,
        category: currentService.category,
      } : undefined,
      messages: currentMessages.map(m => ({
        role: m.role,
        text: m.text,
        time: m.time,
        attachments: m.attachments?.map(a => ({ name: a.name, mimeType: a.mimeType })),
      })),
      trigger,
    });

    try {
      // Use sendBeacon on tab close/hide for maximum browser delivery reliability
      if (trigger === 'unload' && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([payload], { type: 'application/json' });
        const queued = navigator.sendBeacon('/api/telegram/summary', blob);
        if (queued) return;
      }

      fetch('/api/telegram/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true, // Guarantees browser executes the dispatch even when modal unmounts
        body: payload,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.serialNumber && isMountedRef.current) {
            try {
              localStorage.setItem('processinghub_last_serial', String(data.serialNumber));
            } catch {
              // Ignore storage quota errors
            }
          }
        })
        .catch(err => console.error('Telegram dispatch failed:', err));
    } catch (err) {
      console.error('Failed to send telegram summary:', err);
    }
  };

  // Auto-dispatch to Telegram if the user stops talking for 2 minutes after receiving a reply
  useEffect(() => {
    if (!isOpen || isLoading) return;
    const hasUserMsg = messages.some(m => m.role === 'user');
    if (!hasUserMsg) return;

    const idleTimer = setTimeout(() => {
      triggerTelegramSummary('idle');
    }, 2 * 60 * 1000); // 2 minutes of inactivity

    return () => clearTimeout(idleTimer);
  }, [messages, inputText, isOpen, isLoading]);

  // Auto-dispatch if the user closes the browser tab, navigates away, or backgrounds the page
  useEffect(() => {
    const handlePageHide = () => {
      triggerTelegramSummary('unload');
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerTelegramSummary('unload');
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleClose = () => {
    triggerTelegramSummary('close');
    onClose();
  };

  const handleEndChatManual = () => {
    const {
      messages: currentMessages,
      userProfile: currentProfile,
      serviceContext: currentService,
    } = latestChatRef.current;

    // 1. Silently dispatch Telegram summary if there were user messages
    triggerTelegramSummary('manual');

    // 2. Archive this finished chat into per-user memory (local + server) so future new chats remember the user
    const archivedSession = archiveUserSessionLocally(
      currentProfile?.phone,
      currentMessages,
      currentService?.title,
      language
    );

    if (archivedSession) {
      try {
        fetch('/api/chat/end-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({
            userName: currentProfile?.name,
            userPhone: currentProfile?.phone,
            session: archivedSession,
          }),
        }).catch(() => {});
      } catch {
        // Ignore background persistence errors
      }
    }

    // 3. Conclude and clear the active chat completely so reopening always starts a brand-new chat
    handleResetChat();
    onClose();
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    const trimmedPhone = phoneInput.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setFormError(t('অনুগ্রহ করে আপনার সঠিক পূর্ণ নাম লিখুন', 'Please enter your valid full name'));
      return;
    }

    const cleanedPhone = trimmedPhone.replace(/[\s-]/g, '');
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setFormError(
        t(
          'সঠিক মোবাইল বা হোয়াটসঅ্যাপ নম্বর দিন (যেমন: ০১৭XXXXXXXX)',
          'Please enter a valid mobile or WhatsApp number (e.g. 017XXXXXXXX)'
        )
      );
      return;
    }

    const newProfile: UserProfile = {
      name: trimmedName,
      phone: cleanedPhone,
    };

    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile));
    } catch (err) {
      console.error('Failed to persist user profile:', err);
    }

    setUserProfile(newProfile);
    setIsEditingProfile(false);
    setFormError('');

    // If chat only has the initial welcome message, personalize it
    setMessages(prev => {
      if (prev.length <= 1) {
        return [
          {
            id: `welcome-${Date.now()}`,
            role: 'assistant',
            text: getWelcomeMessage(serviceContext, assignedAgent, language, trimmedName),
            time: formatTimestamp(),
            isRead: true,
          }
        ];
      }
      return prev;
    });

    soundEffects.playReplyChime();
  };

  const handleResetChat = () => {
    chatSessionIdRef.current += 1;
    if (typingRevealTimerRef.current) {
      clearTimeout(typingRevealTimerRef.current);
      typingRevealTimerRef.current = null;
    }
    if (handoffSendTimerRef.current) {
      clearTimeout(handoffSendTimerRef.current);
      handoffSendTimerRef.current = null;
    }
    setIsLoading(false);
    setShowTypingBubble(false);
    setInputText('');
    setPendingAttachments([]);
    setAttachmentError(null);

    const nextAgent = pickRandomAgent(assignedAgent);
    setAssignedAgent(nextAgent);
    hasUnsentUserActivityRef.current = false;

    const freshWelcomeId = `welcome-${Date.now()}`;
    initialMessageIdsRef.current.add(freshWelcomeId);

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(AGENT_STORAGE_KEY, nextAgent);
      } catch (e) {
        console.error('Failed to clear chat storage:', e);
      }
    }
    setMessages([
      {
        id: freshWelcomeId,
        role: 'assistant',
        text: getWelcomeMessage(serviceContext, nextAgent, language, userProfile?.name),
        time: formatTimestamp(),
        isRead: true,
      }
    ]);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeDisplayProfile: UserProfile | null = userProfile || (
    pendingAgentHandoff
      ? { name: pendingAgentHandoff.name, phone: pendingAgentHandoff.phone }
      : null
  );
  const showProfileGate = !activeDisplayProfile || isEditingProfile;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className={`fixed inset-0 z-70 ${
            showProfileGate 
              ? 'flex items-center justify-center p-3 sm:p-4' 
              : 'sm:inset-auto sm:bottom-20 sm:right-6 flex flex-col items-center justify-end sm:justify-start'
          } pointer-events-none`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-chat-title"
        >
          {/* Backdrop with Blur */}
          <motion.div 
            key="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed inset-0 bg-black/45 backdrop-blur-md ${
              showProfileGate ? 'block' : 'sm:hidden'
            } z-0 pointer-events-auto`} 
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Main Chat Window Card with smooth GPU ease-out transition */}
          <motion.div 
            key="chat-window-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.18, ease: 'easeIn' } }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full sm:w-[410px] md:w-[420px] ${
              showProfileGate 
                ? 'h-auto max-h-[90vh] rounded-3xl' 
                : 'h-[85vh] sm:h-[600px] max-h-[92vh] rounded-t-2xl sm:rounded-2xl'
            } bg-white border border-[#D5CFBF] shadow-[0_25px_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden overscroll-contain pointer-events-auto`}
          >
            {/* Header (White / Light Theme) */}
            <div className="bg-white text-[#1E2519] px-3 py-2.5 flex items-center justify-between gap-2 border-b border-[#E8E4D9] flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="relative w-9 h-9 flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EBF7EE] to-[#D6EFE0] border border-[#BDE0C8] flex items-center justify-center shadow-xs overflow-hidden">
                    <svg
                      viewBox="0 0 40 40"
                      className="w-8 h-8 agent-avatar-bob"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      {/* Shirt / Shoulders */}
                      <path
                        d="M7.5 39C8.2 31.8 13.4 28.5 20 28.5C26.6 28.5 31.8 31.8 32.5 39H7.5Z"
                        fill="#1FA855"
                      />
                      <path
                        d="M16.5 28.7L20 33L23.5 28.7"
                        fill="#FFFFFF"
                        opacity="0.92"
                      />
                      {/* Neck */}
                      <rect x="17.2" y="24.2" width="5.6" height="5.2" rx="2.2" fill="#F2BE97" />
                      {/* Ears */}
                      <circle cx="11.2" cy="18.2" r="2.1" fill="#F2BE97" />
                      <circle cx="28.8" cy="18.2" r="2.1" fill="#F2BE97" />
                      {/* Headset Band & Earcups */}
                      <path
                        d="M10.4 17.5C10.4 11.7 14.7 7.5 20 7.5C25.3 7.5 29.6 11.7 29.6 17.5"
                        stroke="#1E293B"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                      />
                      <rect x="8.8" y="15.3" width="3" height="5.4" rx="1.5" fill="#1E293B" />
                      <rect x="28.2" y="15.3" width="3" height="5.4" rx="1.5" fill="#1E293B" />
                      {/* Face */}
                      <ellipse cx="20" cy="17.6" rx="8.1" ry="8.6" fill="#FAD2B4" />
                      {/* Hair */}
                      <path
                        d="M11.8 15.8C12 10.6 15.5 8 20.2 8C24.8 8 28 10.8 28.2 15.4C26.3 13.3 23.7 12.6 20 12.8C16.6 13 13.8 13.8 11.8 15.8Z"
                        fill="#1E293B"
                      />
                      {/* Animated Cartoon Eyes */}
                      <ellipse cx="16.8" cy="17.6" rx="1.15" ry="1.35" fill="#1E293B" className="agent-avatar-eye" />
                      <ellipse cx="23.2" cy="17.6" rx="1.15" ry="1.35" fill="#1E293B" className="agent-avatar-eye" />
                      {/* Soft Cheek Highlights */}
                      <ellipse cx="14.5" cy="20.1" rx="1.4" ry="0.8" fill="#F49B86" opacity="0.5" />
                      <ellipse cx="25.5" cy="20.1" rx="1.4" ry="0.8" fill="#F49B86" opacity="0.5" />
                      {/* Friendly Smile */}
                      <path
                        d="M17.2 21.1C18.1 22.3 21.9 22.3 22.8 21.1"
                        stroke="#9C4A32"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      {/* Headset Mic Boom */}
                      <path
                        d="M29.2 19.6C29.2 22.2 26.8 23.2 23.8 23.2"
                        stroke="#1E293B"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <circle cx="23.2" cy="23.2" r="1.1" fill="#1FA855" />
                    </svg>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1FA855] border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 id="support-chat-title" className="font-semibold text-[13px] tracking-wide text-[#1E2519] truncate">
                      {assignedAgent}
                    </h3>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#1FA855] text-white shrink-0">
                      {t('অনলাইন', 'Online')}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#636F5A] truncate">
                    {t('আপনার সাথে চ্যাট করছেন', 'is chatting with you')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!showProfileGate && (
                  <>
                    <a
                      href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(
                        language === 'en'
                          ? serviceContext?.title
                            ? `Hello ${assignedAgent} (Processing Hub), I need direct assistance regarding ${serviceContext.title}.`
                            : `Hello ${assignedAgent} (Processing Hub), I am contacting you for Indian Visa Assistance.`
                          : serviceContext?.title
                            ? `আসসালামু আলাইকুম ${assignedAgent} (প্রসেসিং হাব), আমার ${serviceContext.title} সম্পর্কে সরাসরি সহায়তা প্রয়োজন।`
                            : `আসসালামু আলাইকুম ${assignedAgent} (প্রসেসিং হাব), ইন্ডিয়ান ভিসা সহায়তার জন্য যোগাযোগ করছি।`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onOpenWhatsAppDirect}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0 shadow-xs"
                      title={t('হোয়াটসঅ্যাপ', 'WhatsApp')}
                      aria-label={t('হোয়াটসঅ্যাপে চ্যাট করুন', 'Chat on WhatsApp')}
                    >
                      <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
                        <circle cx="16" cy="16" r="16" fill="#25D366" />
                        <path
                          fill="#FFFFFF"
                          d="M23.62 8.34A10.67 10.67 0 0 0 6.8 21.18L5.28 26.7l5.65-1.48a10.66 10.66 0 0 0 5.1 1.3h.01c5.88 0 10.67-4.79 10.67-10.67 0-2.85-1.11-5.53-3.09-7.51zm-7.58 16.38h-.01a8.86 8.86 0 0 1-4.52-1.24l-.32-.19-3.36.88.9-3.27-.21-.34a8.87 8.87 0 0 1-1.36-4.72c0-4.9 3.99-8.88 8.89-8.88 2.37 0 4.6.93 6.28 2.61a8.84 8.84 0 0 1 2.6 6.28c0 4.9-3.99 8.87-8.89 8.87zm4.87-6.65c-.27-.13-1.58-.78-1.82-.87-.24-.09-.42-.13-.6.13-.18.27-.69.87-.84 1.05-.16.18-.31.2-.58.07-.27-.13-1.13-.42-2.15-1.33-.79-.71-1.33-1.58-1.48-1.85-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.44.09-.18.04-.33-.02-.47-.07-.13-.6-1.44-.82-1.97-.22-.52-.44-.45-.6-.46h-.51c-.18 0-.47.07-.71.33-.24.27-.93.91-.93 2.22s.96 2.58 1.09 2.75c.13.18 1.88 2.88 4.56 4.03.64.27 1.13.44 1.52.56.64.2 1.22.17 1.68.1.51-.08 1.58-.64 1.8-1.27.22-.62.22-1.15.16-1.27-.07-.11-.24-.18-.51-.31z"
                        />
                      </svg>
                    </a>
                    <button
                      type="button"
                      onClick={handleEndChatManual}
                      className="btn-3d-matte-red inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap cursor-pointer w-auto"
                      title={t('চ্যাট শেষ করুন', 'End Chat')}
                    >
                      <LogOut className="w-3 h-3 flex-shrink-0" />
                      <span>{t('শেষ করুন', 'End')}</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-7 h-7 rounded-full border border-[#D5CFBF] bg-[#FAF8F5] hover:bg-[#F0ECE1] text-[#1E2519] flex items-center justify-center transition-all cursor-pointer shrink-0"
                  aria-label={t('সাপোর্ট চ্যাট বন্ধ করুন', 'Close support chat')}
                >
                  <X className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Active Page Service Context Focus Ribbon (if active) */}
            {serviceContext?.title && (
              <div className="bg-[#F4F9F2] border-b border-[#D2EAD0] px-3.5 py-1.5 flex items-center justify-between text-[11px] text-[#1E522C] flex-shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                  <Tag className="w-3.5 h-3.5 text-[#1FA855] shrink-0" />
                  <span className="font-medium text-[#4B6B4E]">{t('ফোকাস:', 'Focus:')}</span>
                  <span className="font-bold text-[#14351C] truncate max-w-[180px] sm:max-w-[220px]">{serviceContext.title}</span>
                  <span className="text-[#1FA855] font-semibold">({serviceContext.price})</span>
                </div>
                {onClearServiceContext && (
                  <button
                    type="button"
                    onClick={onClearServiceContext}
                    className="text-[10px] text-[#2E7D32] hover:text-[#14351C] underline cursor-pointer shrink-0 ml-2 font-medium"
                    title={t('সাধারণ পরামর্শে ফিরুন', 'Return to general assistance')}
                  >
                    {t('সাধারণ মোড', 'General Mode')}
                  </button>
                )}
              </div>
            )}

            {/* GATE: If user has not provided contact info yet or is editing profile, show Contact Form */}
            {showProfileGate ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gradient-to-b from-[#FAF8F5] via-white to-[#F5F7FA]">
                <div className="max-w-sm mx-auto w-full">
                  <div className="text-center mb-3.5">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#EEF2F8] to-[#DCE6F2] border border-[#C6D6E8] text-[#1E3A8A] shadow-xs mb-2">
                      <MessagesSquare className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <h4 className="text-[15px] font-bold text-[#16202E]">
                      {t('সরাসরি লাইভ এজেন্টের সাথে কথা বলুন', 'Chat Directly with a Live Agent')}
                    </h4>
                    <p className="text-[11.5px] text-[#5A687C] mt-1 leading-relaxed">
                      {t(
                        'ভিসা প্রসেসিং ও ডকুমেন্টস সংক্রান্ত তাৎক্ষণিক সহযোগিতা পেতে অনুগ্রহ করে আপনার নাম ও যোগাযোগ নম্বর দিন।',
                        'Please enter your name and contact number for instant assistance with visa processing and documents.'
                      )}
                    </p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#2A4365]" />
                        <span>{t('আপনার পূর্ণ নাম', 'Your Full Name')} <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          if (formError) setFormError('');
                        }}
                        placeholder={t('যেমন: মোহাম্মদ রহিম', 'e.g. Mohammad Rahim')}
                        required
                        className="w-full bg-white border border-[#D5D0C5] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15 rounded-xl px-3.5 py-2.5 text-sm text-[#16202E] placeholder-[#8A95A5] focus:outline-none transition-all shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#2A4365]" />
                        <span>{t('মোবাইল / হোয়াটসঅ্যাপ নম্বর', 'Mobile / WhatsApp Number')} <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => {
                          setPhoneInput(e.target.value);
                          if (formError) setFormError('');
                        }}
                        placeholder={t('০১৭XXXXXXXX', '017XXXXXXXX')}
                        required
                        className="w-full bg-white border border-[#D5D0C5] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15 rounded-xl px-3.5 py-2.5 text-sm text-[#16202E] placeholder-[#8A95A5] focus:outline-none transition-all font-mono shadow-xs"
                      />
                    </div>

                    {formError && (
                      <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <span>⚠️ {formError}</span>
                      </p>
                    )}

                    <div className="pt-1">
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1E2E48] to-[#142033] hover:from-[#243755] hover:to-[#1A2840] active:scale-[0.99] text-white font-bold text-sm shadow-[0_3px_0_#0D1624,0_6px_18px_rgba(20,32,51,0.22)] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>{t('পরামর্শ শুরু করুন', 'Start Chatting')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {isEditingProfile && userProfile && (
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="w-full text-xs text-[#5A687C] hover:text-[#16202E] underline py-1 text-center cursor-pointer font-medium"
                      >
                        {t('বাতিল করুন (চ্যাটে ফিরুন)', 'Cancel (Back to Chat)')}
                      </button>
                    )}

                    <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-[#5A687C]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2A4365]" />
                      <span>
                        {t(
                          'আপনার তথ্য শতভাগ নিরাপদ ও সংরক্ষিত থাকবে',
                          'Your information remains 100% private and secure'
                        )}
                      </span>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <>

            {/* Messages Body */}
            <div 
              ref={messagesContainerRef}
              className="chatbot-messages-body flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm bg-[#FAF8F5] overscroll-contain"
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const shouldAnimateEnter = !initialMessageIdsRef.current.has(msg.id);
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} ${shouldAnimateEnter ? 'chat-msg-enter' : ''}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#EBF7EE] to-[#DDF2E2] border border-[#C6E2CD] text-[#1FA855] flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-semibold text-xs select-none" title={assignedAgent}>
                        <span>{assignedAgent.charAt(0).toUpperCase()}</span>
                      </div>
                    )}

                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] group`}>
                      {/* Message Bubble Card with Clean Professional Aesthetic */}
                      <div
                        className={`w-fit rounded-2xl px-4 py-2.5 relative ${
                          isUser
                            ? 'bg-gradient-to-r from-[#1FA855] to-[#168E45] text-white rounded-tr-xs shadow-[0_2px_8px_rgba(31,168,85,0.18)]'
                            : 'bg-white border border-[#E2DDD0] text-[#1E2519] rounded-tl-xs shadow-[0_2px_12px_rgba(0,0,0,0.035)]'
                        }`}
                      >
                        {/* Attached Images / PDFs / Files inside Bubble */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className={`${msg.text ? 'mb-2' : ''} space-y-1.5`}>
                            {msg.attachments.map((att) => (
                              <div key={att.id}>
                                {att.previewUrl ? (
                                  <div className="rounded-xl overflow-hidden border border-white/25 bg-black/10 max-w-[230px]">
                                    <img
                                      src={att.previewUrl}
                                      alt={att.name}
                                      className="max-h-44 w-full object-cover"
                                    />
                                    <div className="px-2 py-1 text-[10px] truncate bg-black/20 text-white/95">
                                      {att.name}
                                    </div>
                                  </div>
                                ) : (
                                  <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs ${
                                    isUser
                                      ? 'bg-white/15 border border-white/25 text-white'
                                      : 'bg-[#F4F9F2] border border-[#CDE5D5] text-[#1E2519]'
                                  }`}>
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium truncate max-w-[165px]">{att.name}</p>
                                      <p className={`text-[10px] ${isUser ? 'text-white/80' : 'text-[#636F5A]'}`}>
                                        {att.mimeType === 'application/pdf' ? 'PDF' : t('ফাইল', 'File')} • {formatFileSize(att.size)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Message Content */}
                        {msg.text && (isUser ? (
                          <p className="whitespace-pre-wrap leading-relaxed text-[13.5px]">
                            {msg.text}
                          </p>
                        ) : (
                          <div className="markdown-body text-[13.5px] leading-relaxed">
                            <Markdown>{normalizeMarkdownBullets(msg.text)}</Markdown>
                          </div>
                        ))}

                        {/* Grounding Web Search Sources if available */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-[#EAE5D9] text-[11px] text-[#636F5A]">
                            <div className="flex items-center gap-1 font-medium mb-1 text-[#2E7D32]">
                              <Search className="w-3 h-3" />
                              <span>{t('তথ্যসূত্র:', 'Sources:')}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.sources.map((src, idx) => (
                                <a
                                  key={idx}
                                  href={src.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-[#F1EFE9] hover:bg-[#E5E0D5] text-[#3E4A35] px-2 py-0.5 rounded text-[10px] transition-colors border border-[#DDD6C7]"
                                >
                                  <span className="truncate max-w-[130px]">{src.title}</span>
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Small, light-grey timestamp and read indicator below the bubble */}
                      <div className={`flex items-center gap-2 mt-1 px-1 text-[10.5px] text-[#8C9884] select-none ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span className="font-mono tracking-tight leading-none">{num(formatDisplayTime(msg.time))}</span>
                        
                        {/* Small 'read' status indicator with subtle pop & color transition for assistant messages */}
                        {!isUser && (
                          <span 
                            className={`inline-flex items-center transition-all ${
                              msg.isRead 
                                ? 'text-[#1FA855] read-indicator-anim' 
                                : 'text-[#8C9884]'
                            }`}
                            title={msg.isRead ? t('মেসেজটি পড়া হয়েছে', 'Read') : t('পাঠানো হয়েছে', 'Delivered')}
                          >
                            {msg.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5 stroke-[2.2] text-[#1FA855]" />
                            ) : (
                              <Check className="w-3 h-3 stroke-[2]" />
                            )}
                          </span>
                        )}

                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-[#1E2519] text-[#8C9884] cursor-pointer ml-0.5"
                            title={t('টেক্সট কপি করুন', 'Copy message text')}
                            aria-label={t('মেসেজ টেক্সট কপি করুন', 'Copy message text')}
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-[#1FA855]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Initial full question prompt cards if only 1 welcome message exists */}
              {messages.length <= 1 && !isLoading && (
                <div className="pt-2 pb-1">
                  <div className="text-[11.5px] font-semibold text-[#5A6750] mb-2.5 flex items-center gap-1.5 px-1">
                    <HelpCircle className="w-3.5 h-3.5 text-[#1FA855]" />
                    <span>
                      {serviceContext?.title
                        ? t(`"${serviceContext.title}" সম্পর্কিত প্রয়োজনীয় প্রশ্ন:`, `Common Questions for "${serviceContext.title}":`)
                        : t('সচরাচর জিজ্ঞাসিত প্রশ্নসমূহ:', 'Frequently Asked Questions:')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {getContextualQuickPrompts(serviceContext, language).map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="text-[12px] text-left leading-snug bg-white hover:bg-[#FAF8F5] active:bg-[#F0ECE1] text-[#1E2519] px-3.5 py-2.5 rounded-xl border border-[#D5CFBF] hover:border-[#1FA855] transition-all cursor-pointer shadow-xs hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-between group"
                      >
                        <span>{prompt}</span>
                        <span className="text-[#1FA855] text-xs font-semibold opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-2 shrink-0">→</span>
                      </button>
                    ))}
                  </div>

                  {/* Aurora Highlighted Chrome Extension Recommendation */}
                  <ExtensionAuroraShell
                    id="chatbot-extension-tip"
                    variant="compact"
                    href={CONFIG.chromeExtension.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5"
                    innerClassName="px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11.5px]">
                      <span className="flex items-center gap-1.5 font-bold min-w-0">
                        <span className="ext-aurora-icon-box w-5 h-5 rounded-[5px] text-white inline-flex items-center justify-center shrink-0">
                          <Puzzle className="w-3 h-3" />
                        </span>
                        <Zap className="w-3 h-3 text-[#D97706] fill-[#FACC15] shrink-0" />
                        <span className="ext-aurora-gradient-text font-extrabold truncate">
                          {t(
                            `৩০ সেকেন্ডে অটোফিল: ${CONFIG.chromeExtension.name}`,
                            `30s Autofill: ${CONFIG.chromeExtension.name}`
                          )}
                        </span>
                      </span>
                      <ExternalLink className="w-3 h-3 text-[#0E7490] shrink-0" />
                    </div>
                  </ExtensionAuroraShell>
                </div>
              )}

              {/* Compact CSS-based Human Typing Indicator (appears after natural reading pause) */}
              {showTypingBubble && (
                <div className="flex gap-2.5 justify-start items-center animate-fadeIn">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#EBF7EE] to-[#DDF2E2] border border-[#C6E2CD] text-[#1FA855] flex items-center justify-center shrink-0 shadow-xs font-semibold text-xs select-none" title={assignedAgent}>
                    <span>{assignedAgent.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="bg-white border border-[#E2DDD0] rounded-2xl rounded-tl-xs px-3.5 py-2 shadow-2xs flex items-center gap-2">
                    <div className="flex items-center gap-1 px-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855] typing-dot-1" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855] typing-dot-2" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855] typing-dot-3" />
                    </div>
                    <span className="text-[11px] text-[#5A6750] font-medium">
                      {t(`${assignedAgent} লিখছেন...`, `${assignedAgent} is typing...`)}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar + Attach + Bottom Action Buttons */}
            <div className="p-3 bg-[#FAF8F5] border-t border-[#EAE5DA] flex-shrink-0">
              {attachmentError && (
                <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1 mb-2">
                  {attachmentError}
                </p>
              )}

              {isCompressingFiles && (
                <p className="text-[11px] text-[#1E522C] bg-[#EBF7EE] border border-[#C6E2CD] rounded-lg px-2.5 py-1 mb-2">
                  {t('ফাইল অটো-কম্প্রেস ও প্রস্তুত করা হচ্ছে...', 'Compressing and preparing your file...')}
                </p>
              )}

              {pendingAttachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {pendingAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="inline-flex items-center gap-1.5 bg-white border border-[#D5CFBF] rounded-lg px-2 py-1 text-[11px] text-[#1E2519] shadow-2xs max-w-[230px]"
                    >
                      {att.previewUrl ? (
                        <img
                          src={att.previewUrl}
                          alt={att.name}
                          className="w-5 h-5 rounded object-cover shrink-0"
                        />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-[#1FA855] shrink-0" />
                      )}
                      <span className="truncate font-medium">{att.name}</span>
                      <span className="text-[10px] text-[#636F5A] shrink-0">
                        ({formatFileSize(att.size)})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePendingAttachment(att.id)}
                        className="text-[#8C9884] hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                        aria-label={t(`${att.name} সরান`, `Remove ${att.name}`)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.pdf,.txt,.csv"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isCompressingFiles}
                  className="w-10 h-10 rounded-lg bg-white hover:bg-[#F3F0E8] border border-[#D5CFBF] text-[#4E5C46] hover:text-[#1FA855] disabled:opacity-40 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                  title={t('ছবি বা PDF ফাইল যুক্ত করুন', 'Attach image or PDF file')}
                  aria-label={t('ছবি বা PDF ফাইল যুক্ত করুন', 'Attach photo or PDF file')}
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    soundEffects.playTypingTick();
                  }}
                  placeholder={
                    serviceContext?.title
                      ? t(`${serviceContext.title} সংক্রান্ত প্রশ্ন লিখুন...`, `Ask about ${serviceContext.title}...`)
                      : t('আপনার প্রশ্ন লিখুন...', 'Type your question...')
                  }
                  disabled={isLoading}
                  className="flex-1 min-w-0 bg-white border border-[#D5CFBF] focus:border-[#1FA855] rounded-lg px-3.5 py-2.5 text-sm text-[#1E2519] placeholder-[#8A9582] focus:outline-none transition-all shadow-xs"
                />
                <button
                  type="submit"
                  disabled={(!inputText.trim() && pendingAttachments.length === 0) || isLoading || isCompressingFiles}
                  className="w-10 h-10 rounded-lg bg-[#1FA855] hover:bg-[#188A45] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:translate-y-0.5 shrink-0"
                  aria-label={t('মেসেজ পাঠান', 'Send message')}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
            </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

