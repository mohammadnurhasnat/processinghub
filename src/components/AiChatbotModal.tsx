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
  Volume2,
  VolumeX,
  User,
  Phone,
  ShieldCheck,
  LogOut,
  ArrowRight,
  Paperclip,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { CONFIG } from '../config';
import { VisaService } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { compressChatAttachment } from '../utils/fileCompressor';
import { useWhatsApp } from '../context/WhatsAppContext';

export interface UserProfile {
  name: string;
  phone: string;
}

const USER_PROFILE_KEY = 'processinghub_user_profile';
const AGENT_STORAGE_KEY = 'processinghub_assigned_agent_v1';

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

const DEFAULT_QUICK_PROMPTS = [
  'ট্যুরিস্ট ভিসার প্রয়োজনীয় ডকুমেন্টস কি কি?',
  'মেডিকেল ভিসার ইনভাইটেশন লেটার কিভাবে পাব?',
  'পরবর্তী ইন্ডিয়ান ভিসা স্লট কবে ছাড়বে?',
  'আইভ্যাক স্লট বুকিং ফি ও সময় কত?',
  'ব্যাংক স্টেটমেন্ট ও ছবির সঠিক নিয়ম কি?'
];

const getContextualQuickPrompts = (service: VisaService | null | undefined): string[] => {
  if (!service) return DEFAULT_QUICK_PROMPTS;
  
  const title = service.title.toLowerCase();
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
      'পাসপোর্টের কি কি তথ্য স্লট বুকিংয়ের জন্য লাগবে?',
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
  userName?: string
): string => {
  const greetingName = userName ? ` **${userName}**` : '';
  if (service?.title) {
    return `আসসালামু আলাইকুম${greetingName}! আমি **${agentName}**। **"${service.title}"** সম্পর্কে আপনার কী জানার আছে বলুন, সাহায্য করছি।`;
  }
  return `আসসালামু আলাইকুম${greetingName}! আমি **${agentName}**, প্রসেসিং হাব থেকে বলছি। আপনার কী বিষয়ে সহযোগিতা প্রয়োজন বলুন।`;
};

const STORAGE_KEY = 'processinghub_chat_history_v1';

export const AiChatbotModal: React.FC<AiChatbotModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenWhatsAppDirect,
  serviceContext,
  onClearServiceContext
}) => {
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

  const lastSummarizedMsgIdRef = useRef<string | null>(null);
  const processedHandoffIdRef = useRef<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedProfile = localStorage.getItem(USER_PROFILE_KEY);
        const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;
        const initialName = parsedProfile?.name;
        const currentAgent = getOrAssignSessionAgent();

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
            text: getWelcomeMessage(serviceContext, currentAgent, initialName),
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
        text: getWelcomeMessage(serviceContext, AGENT_NAMES[0]),
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
  const [isMuted, setIsMuted] = useState(soundEffects.getMuted());

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

  // When active service context changes and no custom chat ongoing, update welcome message
  useEffect(() => {
    if (serviceContext?.id && serviceContext?.id !== prevServiceRef.current) {
      prevServiceRef.current = serviceContext?.id;
      const contextMsg: ChatMessage = {
        id: `context-${Date.now()}`,
        role: 'assistant',
        text: getWelcomeMessage(serviceContext, assignedAgent),
        time: formatTimestamp(),
        isRead: false,
      };
      setMessages(prev => [...prev.slice(-9), contextMsg]);
    }
  }, [serviceContext, assignedAgent]);

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
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
          setAttachmentError('একসাথে সর্বোচ্চ ৩টি ফাইল বা ছবি যুক্ত করা যাবে।');
          break;
        }
        if (file.size > maxInputBytes) {
          setAttachmentError(`"${file.name}" ফাইলটি ২৫ MB-এর বেশি। দয়া করে ছোট ফাইল দিন।`);
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
          setAttachmentError(`"${file.name}" ফরম্যাট সাপোর্টেড নয়। ছবি, PDF বা টেক্সট ফাইল দিন।`);
          continue;
        }

        const compressed = await compressChatAttachment(file);
        if (!compressed.base64Data) continue;

        if (compressed.size > maxCompressedBytes) {
          setAttachmentError(`"${file.name}" কম্প্রেস করার পরও অনেক বড়। অনুগ্রহ করে ফাইলটি ছোট করে দিন।`);
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
        setAttachmentError('ফাইলটি প্রসেস করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
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
        throw new Error('সার্ভারে রেসপন্স পাওয়া যায়নি');
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
        text: data.reply || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।',
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
        text: 'আন্তরিকভাবে দুঃখিত, সংযোগে সামান্য সমস্যা হয়েছে। আপনার প্রয়োজনীয় তথ্যের জন্য অনুগ্রহ করে আমাদের সাথে সরাসরি হোয়াটসঅ্যাপে (+8801577464706) যোগাযোগ করুন বা আবার প্রশ্ন করুন।',
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
    clearAgentHandoff();

    if (handoffSendTimerRef.current) {
      clearTimeout(handoffSendTimerRef.current);
    }
    handoffSendTimerRef.current = setTimeout(() => {
      handoffSendTimerRef.current = null;
      if (isMountedRef.current) {
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

  // Helper to trigger full conversation & summary dispatch to Telegram (deduplicated per last message)
  const triggerTelegramSummary = (trigger: 'close' | 'manual' | 'idle' | 'unload') => {
    const {
      messages: currentMessages,
      userProfile: currentProfile,
      serviceContext: currentService,
      assignedAgent: currentAgent,
    } = latestChatRef.current;

    // Only send if the customer asked at least one user question
    const userMsgs = currentMessages.filter(m => m.role === 'user');
    if (userMsgs.length === 0) return;

    const lastMsgId = currentMessages[currentMessages.length - 1]?.id;
    if (!lastMsgId || lastSummarizedMsgIdRef.current === lastMsgId) return;
    lastSummarizedMsgIdRef.current = lastMsgId;

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
      }).catch(err => console.error('Telegram dispatch failed:', err));
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
    triggerTelegramSummary('manual');
    onClose();
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    const trimmedPhone = phoneInput.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setFormError('অনুগ্রহ করে আপনার সঠিক পূর্ণ নাম লিখুন');
      return;
    }

    const cleanedPhone = trimmedPhone.replace(/[\s-]/g, '');
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setFormError('সঠিক মোবাইল বা WhatsApp নম্বর দিন (যেমন: 017XXXXXXXX)');
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
            text: getWelcomeMessage(serviceContext, assignedAgent, trimmedName),
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

    const nextAgent = pickRandomAgent(assignedAgent);
    setAssignedAgent(nextAgent);
    lastSummarizedMsgIdRef.current = null;

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
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: getWelcomeMessage(serviceContext, nextAgent, userProfile?.name),
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
            <div className="bg-white text-[#1E2519] px-4 py-3 flex items-center justify-between border-b border-[#E8E4D9] flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EBF7EE] to-[#D6EFE0] border border-[#BDE0C8] flex items-center justify-center shadow-xs overflow-hidden">
                    <svg
                      viewBox="0 0 40 40"
                      className="w-9 h-9 agent-avatar-bob"
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
                  <div className="flex items-center gap-2">
                    <h3 id="support-chat-title" className="font-semibold text-sm tracking-wide text-[#1E2519] truncate">
                      {assignedAgent}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1FA855] text-white shrink-0">
                      অনলাইন
                    </span>
                  </div>
                  <p className="text-[11px] text-[#636F5A] truncate">
                    is chatting with you
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Sound toggle button */}
                <button
                  type="button"
                  id="chat-sound-toggle-btn"
                  onClick={() => {
                    const muted = soundEffects.toggleMute();
                    setIsMuted(muted);
                  }}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    isMuted 
                      ? 'text-[#8C9884] bg-[#F3F0E8] hover:bg-[#EAE5DA]' 
                      : 'text-[#1FA855] bg-[#EBF7EE] hover:bg-[#DDF2E2]'
                  }`}
                  title={isMuted ? 'সাউন্ড চালু করুন (আনমিউট)' : 'সাউন্ড বন্ধ করুন (মিউট)'}
                  aria-label={isMuted ? 'Unmute typing and notification sound' : 'Mute typing and notification sound'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full border border-[#D5CFBF] bg-[#FAF8F5] hover:bg-[#F0ECE1] text-[#1E2519] flex items-center justify-center transition-all cursor-pointer ml-0.5"
                  aria-label="Close support chat"
                >
                  <X className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Active Page Service Context Focus Ribbon (if active) */}
            {serviceContext?.title && (
              <div className="bg-[#F4F9F2] border-b border-[#D2EAD0] px-3.5 py-1.5 flex items-center justify-between text-[11px] text-[#1E522C] flex-shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                  <Tag className="w-3.5 h-3.5 text-[#1FA855] shrink-0" />
                  <span className="font-medium text-[#4B6B4E]">ফোকাস:</span>
                  <span className="font-bold text-[#14351C] truncate max-w-[180px] sm:max-w-[220px]">{serviceContext.title}</span>
                  <span className="text-[#1FA855] font-semibold">({serviceContext.price})</span>
                </div>
                {onClearServiceContext && (
                  <button
                    type="button"
                    onClick={onClearServiceContext}
                    className="text-[10px] text-[#2E7D32] hover:text-[#14351C] underline cursor-pointer shrink-0 ml-2 font-medium"
                    title="সাধারণ পরামর্শে ফিরুন"
                  >
                    সাধারণ মোড
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
                      সরাসরি লাইভ এজেন্টের সাথে কথা বলুন
                    </h4>
                    <p className="text-[11.5px] text-[#5A687C] mt-1 leading-relaxed">
                      ভিসা প্রসেসিং ও ডকুমেন্টস সংক্রান্ত তাৎক্ষণিক সহযোগিতা পেতে অনুগ্রহ করে আপনার নাম ও যোগাযোগ নম্বর দিন।
                    </p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#2A4365]" />
                        <span>আপনার পূর্ণ নাম <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          if (formError) setFormError('');
                        }}
                        placeholder="যেমন: মোহাম্মদ রহিম"
                        required
                        className="w-full bg-white border border-[#D5D0C5] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15 rounded-xl px-3.5 py-2.5 text-sm text-[#16202E] placeholder-[#8A95A5] focus:outline-none transition-all shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#2A4365]" />
                        <span>মোবাইল / WhatsApp নম্বর <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => {
                          setPhoneInput(e.target.value);
                          if (formError) setFormError('');
                        }}
                        placeholder="01XXXXXXXXX"
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
                        <span>পরামর্শ শুরু করুন</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {isEditingProfile && userProfile && (
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="w-full text-xs text-[#5A687C] hover:text-[#16202E] underline py-1 text-center cursor-pointer font-medium"
                      >
                        বাতিল করুন (চ্যাটে ফিরুন)
                      </button>
                    )}

                    <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-[#5A687C]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2A4365]" />
                      <span>আপনার তথ্য শতভাগ নিরাপদ ও সংরক্ষিত থাকবে</span>
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
                                        {att.mimeType === 'application/pdf' ? 'PDF' : 'File'} • {formatFileSize(att.size)}
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
                            <Markdown>{msg.text}</Markdown>
                          </div>
                        ))}

                        {/* Grounding Web Search Sources if available */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-[#EAE5D9] text-[11px] text-[#636F5A]">
                            <div className="flex items-center gap-1 font-medium mb-1 text-[#2E7D32]">
                              <Search className="w-3 h-3" />
                              <span>তথ্যসূত্র:</span>
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
                        <span className="font-mono tracking-tight leading-none">{formatDisplayTime(msg.time)}</span>
                        
                        {/* Small 'read' status indicator with subtle pop & color transition for assistant messages */}
                        {!isUser && (
                          <span 
                            className={`inline-flex items-center transition-all ${
                              msg.isRead 
                                ? 'text-[#1FA855] read-indicator-anim' 
                                : 'text-[#8C9884]'
                            }`}
                            title={msg.isRead ? 'মেসেজটি পড়া হয়েছে (Read)' : 'পাঠানো হয়েছে (Delivered)'}
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
                            title="টেক্সট কপি করুন"
                            aria-label="Copy message text"
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
                    <span>{serviceContext?.title ? `"${serviceContext.title}" সম্পর্কিত প্রয়োজনীয় প্রশ্ন:` : 'সচরাচর জিজ্ঞাসিত প্রশ্নসমূহ:'}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {getContextualQuickPrompts(serviceContext).map((prompt, i) => (
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
                      {assignedAgent} লিখছেন...
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
                  ফাইল অটো-কম্প্রেস ও প্রস্তুত করা হচ্ছে...
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
                        aria-label={`Remove ${att.name}`}
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
                  title="ছবি বা PDF ফাইল যুক্ত করুন"
                  aria-label="Attach photo or PDF file"
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
                  placeholder={serviceContext?.title ? `${serviceContext.title} সংক্রান্ত প্রশ্ন লিখুন...` : 'আপনার প্রশ্ন লিখুন (বাংলা বা ইংরেজি)...'}
                  disabled={isLoading}
                  className="flex-1 min-w-0 bg-white border border-[#D5CFBF] focus:border-[#1FA855] rounded-lg px-3.5 py-2.5 text-sm text-[#1E2519] placeholder-[#8A9582] focus:outline-none transition-all shadow-xs"
                />
                <button
                  type="submit"
                  disabled={(!inputText.trim() && pendingAttachments.length === 0) || isLoading || isCompressingFiles}
                  className="w-10 h-10 rounded-lg bg-[#1FA855] hover:bg-[#188A45] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:translate-y-0.5 shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>

              <div className="mt-2.5 pb-1 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleEndChatManual}
                  className="btn-3d-matte-red inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap cursor-pointer w-auto"
                  title="End Chat"
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>End Chat</span>
                </button>
                <a
                  href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(
                    serviceContext?.title
                      ? `Hello ${assignedAgent} (Processing Hub), I need direct assistance regarding ${serviceContext.title}.`
                      : `Hello ${assignedAgent} (Processing Hub), I am contacting you for Indian Visa Assistance.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onOpenWhatsAppDirect}
                  className="btn-3d-matte-green inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap cursor-pointer w-auto"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true">
                    <path d="M17.6 6.32A7.85 7.85 0 0 0 12.02 4C7.66 4 4.13 7.53 4.13 11.89c0 1.4.37 2.76 1.06 3.96L4 20l4.27-1.12a7.9 7.9 0 0 0 3.75.95h.01c4.36 0 7.89-3.53 7.89-7.89 0-2.11-.82-4.09-2.32-5.62zm-5.58 12.1h-.01a6.55 6.55 0 0 1-3.34-.92l-.24-.14-2.49.65.67-2.43-.16-.25a6.56 6.56 0 0 1-1.01-3.5c0-3.63 2.96-6.58 6.6-6.58 1.76 0 3.42.69 4.66 1.94a6.55 6.55 0 0 1 1.93 4.65c0 3.63-2.96 6.58-6.61 6.58zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.5.64-.62.77-.11.13-.23.14-.42.05-.2-.1-.83-.31-1.58-.98-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.11.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.33-.11-.01-.24-.01-.37-.01s-.35.05-.53.25c-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.41 2.15 3.42 3.02.48.21.85.33 1.14.42.48.15.92.13 1.26.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
            </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

