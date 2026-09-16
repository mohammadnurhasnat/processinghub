import React, { useState, useRef, useEffect } from 'react';
import { 
  MessagesSquare, 
  Send, 
  X, 
  RotateCcw, 
  ExternalLink, 
  HelpCircle, 
  Check, 
  Copy, 
  MessageCircle,
  Search,
  Tag
} from 'lucide-react';
import Markdown from 'react-markdown';
import { CONFIG } from '../config';
import { VisaService } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
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

const getWelcomeMessage = (service: VisaService | null | undefined): string => {
  if (service?.title) {
    return `আসসালামু আলাইকুম! আমি **MOHAMMAD** — প্রসেসিং হাবের সিনিয়র ভিসা ও ট্রাভেল কনসালটেন্ট।\n\nআপনি বর্তমানে আমাদের **"${service.title}"** সার্ভিসটি পর্যালোচনা করছেন।\n\nএই ক্যাটাগরির প্রয়োজনীয় কাগজপত্র চেকলিস্ট, অফিসিয়াল ফি (${service.price}), আইভ্যাক স্লট বুকিং বা ফাইল প্রস্তুত নিয়ে আপনার যেকোনো প্রশ্ন আমাকে করতে পারেন।`;
  }
  return 'আসসালামু আলাইকুম! আমি **MOHAMMAD** — প্রসেসিং হাবে আপনাকে স্বাগতম।\n\nইন্ডিয়ান ট্যুরিস্ট, মেডিকেল, বিজনেস বা ডাবল এন্ট্রি ভিসা প্রসেসিং, আইভ্যাক (IVAC) স্লট বুকিং, প্রয়োজনীয় ডকুমেন্টস যাচাই বা যেকোনো পরামর্শের জন্য সরাসরি আমাকে লিখতে পারেন। আমি সার্বক্ষণিক আপনার সেবায় নিয়োজিত আছি।';
};

export const AiChatbotModal: React.FC<AiChatbotModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenWhatsAppDirect,
  serviceContext,
  onClearServiceContext
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'assistant',
      text: getWelcomeMessage(serviceContext),
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevServiceRef = useRef<string | undefined>(serviceContext?.id);

  // When active service context changes, reset welcome message
  useEffect(() => {
    if (serviceContext?.id !== prevServiceRef.current) {
      prevServiceRef.current = serviceContext?.id;
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          text: getWelcomeMessage(serviceContext),
          time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, [serviceContext]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
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
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
        webSearchQueries: data.webSearchQueries || [],
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'আন্তরিকভাবে দুঃখিত, সংযোগে সামান্য সমস্যা হয়েছে। আপনার প্রয়োজনীয় তথ্যের জন্য অনুগ্রহ করে আমাদের সাথে সরাসরি হোয়াটসঅ্যাপে (+8801577464706) যোগাযোগ করুন বা আবার প্রশ্ন করুন।',
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: getWelcomeMessage(serviceContext),
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activePrompts = getContextualQuickPrompts(serviceContext);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-70 sm:inset-auto sm:bottom-20 sm:right-6 flex flex-col items-center justify-end sm:justify-start"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-chat-title"
    >
      {/* Backdrop on mobile only with Liquid Blur */}
      <div 
        className="fixed inset-0 bg-black/45 backdrop-blur-md sm:hidden z-0" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Chat Window Card */}
      <div 
        className="relative z-10 w-full sm:w-[410px] md:w-[440px] h-[92vh] sm:h-[620px] max-h-[96vh] bg-[#FAF8F5] rounded-t-2xl sm:rounded-2xl border border-[#D5CFBF] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-[#1E2519] text-[#FAF8F5] px-4 py-3 flex items-center justify-between border-b border-[#2C3524] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full bg-[#2E7D32]/35 border border-[#4CAF50]/50 flex items-center justify-center text-[#A7F3D0] shadow-xs">
              <MessagesSquare className="w-5 h-5 stroke-[2]" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1FA855] border-2 border-[#1E2519]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="support-chat-title" className="font-semibold text-sm tracking-wide text-[#F3EFE6]">
                  MOHAMMAD
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#2E7D32] text-white">
                  অনলাইন
                </span>
              </div>
              <p className="text-[11px] text-[#A8B2A0] flex items-center gap-1">
                <span>সরাসরি ভিসা ও ডকুমেন্টের পরামর্শ</span>
                <span>•</span>
                <span>প্রসেসিং হাব</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetChat}
              className="p-1.5 rounded-full text-[#A8B2A0] hover:text-[#FAF8F5] hover:bg-white/10 transition-colors cursor-pointer"
              title="নতুন চ্যাট শুরু করুন"
              aria-label="Reset chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-[#FAF8F5] flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close support chat"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Active Page Service Context Focus Ribbon (if active) */}
        {serviceContext?.title && (
          <div className="bg-[#242D1E] border-b border-[#3D4C33] px-3.5 py-1.5 flex items-center justify-between text-[11px] text-[#DCE6D2] flex-shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Tag className="w-3.5 h-3.5 text-[#9AE6B4] shrink-0" />
              <span className="font-medium text-[#A3B899]">ফোকাস:</span>
              <span className="font-bold text-white truncate max-w-[180px] sm:max-w-[220px]">{serviceContext.title}</span>
              <span className="text-[#A7F3D0] font-semibold">({serviceContext.price})</span>
            </div>
            {onClearServiceContext && (
              <button
                type="button"
                onClick={onClearServiceContext}
                className="text-[10px] text-[#A8BCA0] hover:text-white underline cursor-pointer shrink-0 ml-2"
                title="সাধারণ পরামর্শে ফিরুন"
              >
                সাধারণ মোড
              </button>
            )}
          </div>
        )}

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
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm bg-[#F5F2E9]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-[#1E2519] text-[#9AE6B4] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <MessagesSquare className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 shadow-xs relative group ${
                    isUser
                      ? 'bg-[#1E2519] text-[#FAF8F5] rounded-tr-xs'
                      : 'bg-white border border-[#E3DEC3] text-[#22271E] rounded-tl-xs'
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

                  {/* Footer & Copy */}
                  <div className="mt-1 flex items-center justify-between gap-2 text-[10px] opacity-70">
                    <span>{msg.time}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-[#1E2519] text-[#7A8572] cursor-pointer"
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

          {/* Quick Suggestion Chips inside the scrollable container below welcome message */}
          {messages.length <= 1 && !isLoading && (
            <div className="pt-3 pb-1">
              <div className="text-[11.5px] font-semibold text-[#5A6750] mb-2.5 flex items-center gap-1.5 px-1">
                <HelpCircle className="w-3.5 h-3.5 text-[#1FA855]" />
                <span>{serviceContext?.title ? `"${serviceContext.title}" সম্পর্কিত প্রয়োজনীয় প্রশ্ন:` : 'প্রয়োজনীয় প্রশ্নসমূহ:'}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {activePrompts.map((prompt, i) => (
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

          {/* Loading Typing Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 justify-start items-start">
              <div className="w-7 h-7 rounded-full bg-[#1E2519] text-[#9AE6B4] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <MessagesSquare className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-[#E3DEC3] rounded-xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2">
                <span className="text-xs text-[#636F5A] font-medium">উত্তর প্রস্তুত করা হচ্ছে...</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
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
              onChange={(e) => setInputText(e.target.value)}
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
      </div>
    </div>
  );
};
