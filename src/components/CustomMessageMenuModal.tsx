import React from 'react';
import { X, MessageSquareText, ArrowRight } from 'lucide-react';
import { CONFIG } from '../config';

interface CustomMessageMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChatbot: () => void;
  onSelectWhatsApp?: () => void;
}

export const CustomMessageMenuModal: React.FC<CustomMessageMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectChatbot,
  onSelectWhatsApp,
}) => {
  if (!isOpen) return null;

  const handleWhatsAppClick = () => {
    onClose();
    if (onSelectWhatsApp) {
      onSelectWhatsApp();
    } else {
      const waUrl = `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(
        'Hello Processing Hub, I have an inquiry about Indian Visa Processing.'
      )}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleChatbotClick = () => {
    onClose();
    onSelectChatbot();
  };

  return (
    <div
      className="fixed inset-0 z-65 flex items-end justify-end p-4 sm:p-6 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-menu-title"
    >
      {/* Invisible or subtle click outside backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md pointer-events-auto transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Pop-up Options Window */}
      <div
        className="relative z-10 pointer-events-auto w-full max-w-[340px] sm:max-w-[360px] mb-16 sm:mb-20 bg-[#FAF8F5] rounded-2xl border border-[#D5CFBF] shadow-[0_16px_40px_rgba(0,0,0,0.18)] p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-5 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAE5DA]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1FA855] animate-ping" />
            <h3 id="message-menu-title" className="font-semibold text-[#1E2519] text-sm sm:text-base">
              যোগাযোগ ও সহায়তা
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-[#D5CFBF] bg-white hover:bg-[#F0ECE1] text-[#4E5C46] hover:text-[#1E2519] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>

        <p className="text-xs text-[#6B7564] mb-3 leading-relaxed">
          আপনার সুবিধার্থে নিচের যেকোনো একটি অপশন নির্বাচন করুন:
        </p>

        {/* The Two Options */}
        <div className="space-y-2.5">
          {/* Option 1: WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="w-full text-left p-3 rounded-xl border border-[#CDE5D5] bg-[#F2FAF5] hover:bg-[#E5F5EC] transition-all flex items-center justify-between group cursor-pointer shadow-xs hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1FA855] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M17.6 6.32A7.85 7.85 0 0 0 12.02 4C7.66 4 4.13 7.53 4.13 11.89c0 1.4.37 2.76 1.06 3.96L4 20l4.27-1.12a7.9 7.9 0 0 0 3.75.95h.01c4.36 0 7.89-3.53 7.89-7.89 0-2.11-.82-4.09-2.32-5.62zm-5.58 12.1h-.01a6.55 6.55 0 0 1-3.34-.92l-.24-.14-2.49.65.67-2.43-.16-.25a6.56 6.56 0 0 1-1.01-3.5c0-3.63 2.96-6.58 6.6-6.58 1.76 0 3.42.69 4.66 1.94a6.55 6.55 0 0 1 1.93 4.65c0 3.63-2.96 6.58-6.61 6.58zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.5.64-.62.77-.11.13-.23.14-.42.05-.2-.1-.83-.31-1.58-.98-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.11.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.33-.11-.01-.24-.01-.37-.01s-.35.05-.53.25c-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.41 2.15 3.42 3.02.48.21.85.33 1.14.42.48.15.92.13 1.26.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-sm text-[#14532D] flex items-center gap-1.5">
                  <span>হোয়াটসঅ্যাপ (WhatsApp)</span>
                  <span className="text-[10px] bg-[#1FA855] text-white px-1.5 py-0.2 rounded-full font-medium shadow-xs">
                    সরাসরি
                  </span>
                </div>
                <p className="text-xs text-[#4F6A56] mt-0.5">
                  সরাসরি আমাদের সিনিয়র কনসালটেন্টের সাথে কথা বলুন
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#1FA855] group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </button>

          {/* Option 2: Live Online Consultant (Text Chat) */}
          <button
            type="button"
            onClick={handleChatbotClick}
            className="w-full text-left p-3 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#F7F5EE] transition-all flex items-center justify-between group cursor-pointer shadow-xs hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1E2519] text-[#A7F3D0] flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[#1E2519] flex items-center gap-1.5">
                  <span>MOHAMMAD</span>
                  <span className="text-[10px] bg-[#2E7D32] text-white px-1.5 py-0.2 rounded-full font-medium shadow-xs">
                    লাইভ চ্যাট
                  </span>
                </div>
                <p className="text-xs text-[#65715D] mt-0.5">
                  MOHAMMAD এর সাথে সরাসরি মেসেজে ভিসা ও ডকুমেন্টের পরামর্শ নিন
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#1E2519] group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-3.5 pt-2.5 border-t border-[#EAE5DA] flex items-center justify-between text-[11px] text-[#7A8572]">
          <span>কল সেন্টার: {CONFIG.phoneDisplay}</span>
          <span className="text-[#1FA855] font-medium">• সার্বক্ষণিক প্রস্তুত</span>
        </div>
      </div>
    </div>
  );
};
