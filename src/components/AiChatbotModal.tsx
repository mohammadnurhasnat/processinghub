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
  MessageCircle,
  Search,
  Tag,
  Volume2,
  VolumeX,
  User,
  Phone,
  ShieldCheck,
  Edit3,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { CONFIG } from '../config';
import { VisaService } from '../types';
import { soundEffects } from '../utils/soundEffects';

export interface UserProfile {
  name: string;
  phone: string;
}

const USER_PROFILE_KEY = 'processinghub_user_profile';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  isRead?: boolean;
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

const getWelcomeMessage = (service: VisaService | null | undefined, userName?: string): string => {
  const greetingName = userName ? ` **${userName}**` : '';
  if (service?.title) {
    return `আসসালামু আলাইকুম${greetingName}! আমি মোহাম্মদ। **"${service.title}"** সম্পর্কে আপনার নির্দিষ্ট কী জানার আছে বলুন, সাহায্য করছি।`;
  }
  return `আসসালামু আলাইকুম${greetingName}! আমি মোহাম্মদ, প্রসেসিং হাবের সিনিয়র ভিসা কনসালটেন্ট। আপনার ভিসা সম্পর্কিত প্রশ্নটি বলুন, সাহায্য করছি।`;
};

const STORAGE_KEY = 'processinghub_chat_history_v1';

export const AiChatbotModal: React.FC<AiChatbotModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenWhatsAppDirect,
  serviceContext,
  onClearServiceContext
}) => {
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
  const [endChatNotice, setEndChatNotice] = useState<string | null>(null);

  const lastSummarizedMsgIdRef = useRef<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedProfile = localStorage.getItem(USER_PROFILE_KEY);
        const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;
        const initialName = parsedProfile?.name;

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(-10);
          }
        }
        return [
          {
            id: 'welcome-1',
            role: 'assistant',
            text: getWelcomeMessage(serviceContext, initialName),
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
        text: getWelcomeMessage(serviceContext),
        time: formatTimestamp(),
        isRead: true,
      }
    ];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(soundEffects.getMuted());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevServiceRef = useRef<string | undefined>(serviceContext?.id);

  // Auto-scroll to bottom helper that guarantees the latest incoming message is kept in view
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  // Sync messages to localStorage whenever messages change (keep last 10)
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        const toSave = messages.slice(-10);
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
        text: getWelcomeMessage(serviceContext),
        time: formatTimestamp(),
        isRead: false,
      };
      setMessages(prev => [...prev.slice(-9), contextMsg]);
    }
  }, [serviceContext]);

  // Robust Auto-scroll listener: triggers on new messages, loading indicator, and modal open
  useEffect(() => {
    if (isOpen) {
      // Immediate scroll
      scrollToBottom('auto');

      // Subsequent frame scroll to account for DOM reflow / markdown rendering
      const rAf = requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });

      const timer = setTimeout(() => {
        scrollToBottom('smooth');
        inputRef.current?.focus();
      }, 100);

      const secondTimer = setTimeout(() => {
        scrollToBottom('smooth');
      }, 250);

      return () => {
        cancelAnimationFrame(rAf);
        clearTimeout(timer);
        clearTimeout(secondTimer);
      };
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Play sending sound
    soundEffects.playSendPop();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      time: formatTimestamp(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            text: m.text,
          })),
          userName: userProfile?.name,
          userPhone: userProfile?.phone,
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
      setIsLoading(false);
    }
  };

  // Helper to trigger Telegram summary dispatch
  const triggerTelegramSummary = (trigger: 'close' | 'manual') => {
    // Only send if the customer asked at least one user question
    const userMsgs = messages.filter(m => m.role === 'user');
    if (userMsgs.length === 0) return;

    const lastMsgId = messages[messages.length - 1]?.id;
    if (lastSummarizedMsgIdRef.current === lastMsgId) return;
    lastSummarizedMsgIdRef.current = lastMsgId;

    try {
      fetch('/api/telegram/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true, // Guarantees browser executes the dispatch even when modal unmounts
        body: JSON.stringify({
          user: userProfile,
          serviceContext: serviceContext ? {
            id: serviceContext.id,
            title: serviceContext.title,
            price: serviceContext.price,
            category: serviceContext.category,
          } : undefined,
          messages: messages.map(m => ({ role: m.role, text: m.text, time: m.time })),
          trigger,
        }),
      }).catch(err => console.error('Telegram dispatch failed:', err));
    } catch (err) {
      console.error('Failed to send telegram summary:', err);
    }
  };

  const handleClose = () => {
    triggerTelegramSummary('close');
    onClose();
  };

  const handleEndChatManual = () => {
    triggerTelegramSummary('manual');
    setEndChatNotice('আপনার পরামর্শের সারসংক্ষেপ সিনিয়র কনসালটেন্টের কাছে সফলভাবে পাঠানো হয়েছে।');
    setTimeout(() => {
      setEndChatNotice(null);
    }, 4500);
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
            text: getWelcomeMessage(serviceContext, trimmedName),
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear chat storage:', e);
      }
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: getWelcomeMessage(serviceContext, userProfile?.name),
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-70 sm:inset-auto sm:bottom-20 sm:right-6 flex flex-col items-center justify-end sm:justify-start pointer-events-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-chat-title"
        >
          {/* Backdrop on mobile only with Liquid Blur */}
          <motion.div 
            key="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-black/45 backdrop-blur-md sm:hidden z-0 pointer-events-auto" 
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Main Chat Window Card with smooth physics-based spring entrance and slight bounce */}
          <motion.div 
            key="chat-window-card"
            initial={{ opacity: 0, scale: 0.92, y: 85 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 45, transition: { duration: 0.22, ease: "easeOut" } }}
            transition={{ 
              type: "spring",
              damping: 18,
              stiffness: 240,
              mass: 0.85
            }}
            className="relative z-10 w-full sm:w-[420px] md:w-[450px] h-[92vh] sm:h-[630px] max-h-[96vh] bg-white rounded-t-2xl sm:rounded-2xl border border-[#D5CFBF] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden origin-bottom-right pointer-events-auto"
          >
            {/* Header (White / Light Theme) */}
            <div className="bg-white text-[#1E2519] px-4 py-3 flex items-center justify-between border-b border-[#E8E4D9] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-[#EBF7EE] border border-[#CDE5D5] flex items-center justify-center text-[#1FA855] shadow-xs">
                  <MessagesSquare className="w-5 h-5 stroke-[2]" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1FA855] border-2 border-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 id="support-chat-title" className="font-semibold text-sm tracking-wide text-[#1E2519]">
                      MOHAMMAD
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1FA855] text-white">
                      অনলাইন
                    </span>
                  </div>
                  <p className="text-[11px] text-[#636F5A] flex items-center gap-1">
                    <span>সরাসরি ভিসা ও ডকুমেন্টের পরামর্শ</span>
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

            {/* User Identity / Active Consultation Bar */}
            {userProfile && !isEditingProfile && (
              <div className="bg-[#FBF9F5] border-b border-[#E8E2D2] px-3.5 py-1.5 flex items-center justify-between text-[11px] text-[#3E4A35] flex-shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-[#1FA855] shrink-0" />
                  <span className="font-bold text-[#14351C] truncate max-w-[140px] sm:max-w-[180px]">{userProfile.name}</span>
                  <span className="text-[#7A8870] font-mono text-[10.5px]">({userProfile.phone.slice(-4).padStart(userProfile.phone.length, '•')})</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(userProfile.name);
                      setPhoneInput(userProfile.phone);
                      setIsEditingProfile(true);
                    }}
                    className="inline-flex items-center gap-1 text-[10.5px] text-[#2E7D32] hover:text-[#14351C] hover:underline cursor-pointer font-medium"
                    title="তথ্য পরিবর্তন করুন"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>এডিট</span>
                  </button>
                  <span className="text-[#D5CFBF]">|</span>
                  <button
                    type="button"
                    onClick={handleEndChatManual}
                    className="inline-flex items-center gap-1 text-[10.5px] text-[#636F5A] hover:text-red-700 cursor-pointer font-medium"
                    title="কথোপকথন সমাপ্ত করুন ও সামারি পাঠান"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>সমাপ্তি</span>
                  </button>
                </div>
              </div>
            )}

            {/* End chat confirmation banner if triggered */}
            {endChatNotice && (
              <div className="bg-[#EBF7EE] border-b border-[#CDE5D5] px-3.5 py-2 flex items-center gap-2 text-xs text-[#1E522C] flex-shrink-0 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-[#1FA855] shrink-0" />
                <span className="flex-1 font-medium">{endChatNotice}</span>
              </div>
            )}

            {/* GATE: If user has not provided contact info yet or is editing profile, show Contact Form */}
            {(!userProfile || isEditingProfile) ? (
              <div className="flex-1 overflow-y-auto px-5 py-6 bg-gradient-to-b from-[#FAF8F5] via-white to-[#F6F4EE] flex flex-col justify-center">
                <div className="max-w-sm mx-auto w-full">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EBF7EE] to-[#D5EFDB] border border-[#BDE3C6] text-[#1FA855] shadow-xs mb-3">
                      <MessagesSquare className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <h4 className="text-base font-bold text-[#1E2519]">
                      সরাসরি সিনিয়র কনসালটেন্টের সাথে কথা বলুন
                    </h4>
                    <p className="text-xs text-[#636F5A] mt-1.5 leading-relaxed">
                      ভিসা প্রসেসিং ও ডকুমেন্টস সংক্রান্ত তাৎক্ষণিক পরামর্শ পেতে অনুগ্রহ করে আপনার নাম ও যোগাযোগ নম্বর প্রদান করুন।
                    </p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#2D3825] mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#1FA855]" />
                        <span>আপনার পূর্ণ নাম <span className="text-red-500">*</span></span>
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
                        className="w-full bg-white border border-[#D5CFBF] focus:border-[#1FA855] focus:ring-2 focus:ring-[#1FA855]/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1E2519] placeholder-[#8A9582] focus:outline-none transition-all shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2D3825] mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#1FA855]" />
                        <span>মোবাইল / WhatsApp নম্বর <span className="text-red-500">*</span></span>
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
                        className="w-full bg-white border border-[#D5CFBF] focus:border-[#1FA855] focus:ring-2 focus:ring-[#1FA855]/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1E2519] placeholder-[#8A9582] focus:outline-none transition-all shadow-xs"
                      />
                    </div>

                    {formError && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <span>⚠️ {formError}</span>
                      </p>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1FA855] to-[#168E45] hover:from-[#188A45] hover:to-[#127236] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(31,168,85,0.25)] hover:shadow-[0_6px_18px_rgba(31,168,85,0.32)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                      >
                        <span>পরামর্শ শুরু করুন</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {isEditingProfile && userProfile && (
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="w-full text-xs text-[#636F5A] hover:text-[#1E2519] underline py-1 text-center cursor-pointer font-medium"
                      >
                        বাতিল করুন (চ্যাটে ফিরুন)
                      </button>
                    )}

                    <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-[#7A8870]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1FA855]" />
                      <span>আপনার তথ্য শতভাগ নিরাপদ ও সংরক্ষিত থাকবে</span>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <>

            {/* Direct WhatsApp Quick-Bar Banner */}
            <div className="bg-[#EBF7EE] border-b border-[#CDE5D5] px-3.5 py-2 flex items-center justify-between text-xs text-[#1E522C] flex-shrink-0">
              <span className="flex items-center gap-1.5 font-medium truncate">
                <MessageCircle className="w-3.5 h-3.5 text-[#1FA855] shrink-0" />
                সরাসরি সিনিয়র কনসালটেন্টের সাথে কথা বলুন
              </span>
              <a
                href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(
                  serviceContext?.title
                    ? `Hello Mohammad (Processing Hub), I need direct consultation regarding ${serviceContext.title}.`
                    : 'Hello Processing Hub, I am contacting you for Indian Visa Assistance.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onOpenWhatsAppDirect}
                className="shrink-0 ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1FA855] hover:bg-[#188A45] text-white font-medium text-[11px] shadow-xs transition-all cursor-pointer"
              >
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Messages Body */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm bg-[#FAF8F5] scroll-smooth"
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#EBF7EE] to-[#DDF2E2] border border-[#C6E2CD] text-[#1FA855] flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-semibold text-xs select-none" title="মোহাম্মদ - সিনিয়র কনসালটেন্ট">
                        <span>M</span>
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
                        {/* Message Content */}
                        {isUser ? (
                          <p className="whitespace-pre-wrap leading-relaxed text-[13.5px]">
                            {msg.text}
                          </p>
                        ) : (
                          <div className="markdown-body text-[13.5px] leading-relaxed">
                            <Markdown>{msg.text}</Markdown>
                          </div>
                        )}

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

              {/* Compact CSS-based Wave Typing Indicator */}
              {isLoading && (
                <div className="flex gap-2 justify-start items-center animate-in fade-in duration-150">
                  <div className="w-6 h-6 rounded-full bg-white border border-[#D5CFBF] text-[#1FA855] flex items-center justify-center shrink-0 shadow-2xs">
                    <MessagesSquare className="w-3 h-3" />
                  </div>
                  <div className="bg-white border border-[#E3DEC3] rounded-xl rounded-tl-xs px-3 py-1.5 shadow-2xs flex items-center gap-2 h-[28px]">
                    <div className="flex items-center gap-1 px-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855] typing-dot-1" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855] typing-dot-2" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855] typing-dot-3" />
                    </div>
                    <span className="text-[11px] text-[#5A6750] font-medium hidden sm:inline">তথ্য যাচাই ও প্রস্তুত করা হচ্ছে...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#FAF8F5] border-t border-[#EAE5DA] flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
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
                  className="flex-1 bg-white border border-[#D5CFBF] focus:border-[#1FA855] rounded-lg px-4 py-2.5 text-sm text-[#1E2519] placeholder-[#8A9582] focus:outline-none transition-all shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="w-10 h-10 rounded-lg bg-[#1FA855] hover:bg-[#188A45] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:translate-y-0.5 shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <div className="mt-1.5 text-center">
                <span className="text-[10px] text-[#8C9884]">
                  প্রসেসিং হাব অফিসিয়াল কাস্টমার সাপোর্ট ডেস্ক
                </span>
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

