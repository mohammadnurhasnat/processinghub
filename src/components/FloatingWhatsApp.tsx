import React, { useState, useRef, useEffect } from 'react';
import { X, MessagesSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config';
import { VisaService } from '../types';
import { AiChatbotModal } from './AiChatbotModal';

interface FloatingWhatsAppProps {
  serviceContext?: VisaService | null;
  onClearServiceContext?: () => void;
  isChatbotForcedOpen?: boolean;
  onCloseForcedChatbot?: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  serviceContext,
  onClearServiceContext,
  isChatbotForcedOpen,
  onCloseForcedChatbot
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isInternalChatbotOpen, setIsInternalChatbotOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const isChatbotOpen = isChatbotForcedOpen !== undefined ? isChatbotForcedOpen || isInternalChatbotOpen : isInternalChatbotOpen;

  const handleToggleTrigger = () => {
    if (isChatbotOpen) {
      setIsInternalChatbotOpen(false);
      onCloseForcedChatbot?.();
      return;
    }
    setIsPopupOpen(prev => !prev);
  };

  const handleOpenChatbot = () => {
    setIsPopupOpen(false);
    setIsInternalChatbotOpen(true);
  };

  const handleCloseChatbot = () => {
    setIsInternalChatbotOpen(false);
    onCloseForcedChatbot?.();
  };

  const handleOpenWhatsApp = () => {
    setIsPopupOpen(false);
    const waUrl = `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(
      serviceContext?.title
        ? `Hello Processing Hub, I have an inquiry about ${serviceContext.title}.`
        : 'Hello Processing Hub, I have an inquiry about Indian Visa Processing.'
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Close popup if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isPopupOpen &&
        popupRef.current &&
        !popupRef.current.contains(e.target as Node)
      ) {
        const triggerBtn = document.getElementById('main-support-trigger');
        if (triggerBtn && triggerBtn.contains(e.target as Node)) return;
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopupOpen]);

  return (
    <>
      {/* COMPACT FLOATING POPUP WINDOW WITH SMOOTH BUTTER TRANSITION */}
      <AnimatePresence>
        {isPopupOpen && (
          <motion.div
            key="support-options-popup"
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[86px] right-6 z-60 bg-[#FAF8F5]/95 backdrop-blur-xl border border-[#D5CFBF]/90 shadow-[0_16px_40px_rgba(0,0,0,0.18)] rounded-2xl p-4 w-[240px] origin-bottom-right"
            role="dialog"
            aria-label="যোগাযোগ অপশন"
          >
            {/* Subtle Heading */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#EAE5DA]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1FA855] animate-pulse" />
                <span className="text-[13px] font-semibold text-[#1E2519]">সহায়তা ও যোগাযোগ</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPopupOpen(false)}
                className="w-5 h-5 rounded-full text-[#6B7564] hover:text-[#1E2519] hover:bg-[#EAE5DA] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TWO ICONS SIDE-BY-SIDE: Left (WhatsApp), Right (AI Support) */}
            <div className="grid grid-cols-2 gap-3">
              {/* LEFT: WhatsApp */}
              <button
                type="button"
                id="popup-whatsapp-btn"
                onClick={handleOpenWhatsApp}
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white border border-[#CDE5D5] hover:border-[#25D366] hover:bg-[#F2FAF5] transition-all duration-200 cursor-pointer group shadow-xs hover:-translate-y-0.5 active:scale-95"
                title="হোয়াটসঅ্যাপ চ্যাট"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(37,211,102,0.30)] group-hover:scale-108 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
                    <path d="M17.6 6.32A7.85 7.85 0 0 0 12.02 4C7.66 4 4.13 7.53 4.13 11.89c0 1.4.37 2.76 1.06 3.96L4 20l4.27-1.12a7.9 7.9 0 0 0 3.75.95h.01c4.36 0 7.89-3.53 7.89-7.89 0-2.11-.82-4.09-2.32-5.62zm-5.58 12.1h-.01a6.55 6.55 0 0 1-3.34-.92l-.24-.14-2.49.65.67-2.43-.16-.25a6.56 6.56 0 0 1-1.01-3.5c0-3.63 2.96-6.58 6.6-6.58 1.76 0 3.42.69 4.66 1.94a6.55 6.55 0 0 1 1.93 4.65c0 3.63-2.96 6.58-6.61 6.58zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.5.64-.62.77-.11.13-.23.14-.42.05-.2-.1-.83-.31-1.58-.98-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.11.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.33-.11-.01-.24-.01-.37-.01s-.35.05-.53.25c-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.41 2.15 3.42 3.02.48.21.85.33 1.14.42.48.15.92.13 1.26.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24z" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-[#14532D]">হোয়াটসঅ্যাপ</span>
              </button>

              {/* RIGHT: AI Support / Assistant */}
              <button
                type="button"
                id="popup-ai-support-btn"
                onClick={handleOpenChatbot}
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white border border-[#D5CFBF] hover:border-[#1FA855] hover:bg-[#F2FAF5] transition-all duration-200 cursor-pointer group shadow-xs hover:-translate-y-0.5 active:scale-95"
                title="ভিসা কনসালটেন্সি ও লাইভ চ্যাট"
              >
                <div className="w-12 h-12 rounded-full bg-white text-[#1E2519] border border-[#D5CFBF] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] group-hover:scale-108 group-hover:border-[#1FA855] group-hover:text-[#1FA855] transition-all">
                  <MessagesSquare className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-[11px] font-semibold text-[#1E2519]">লাইভ সাপোর্ট</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN BOTTOM-RIGHT FLOATING TRIGGER BUTTON (WHITE THEME) */}
      <div className="fixed bottom-6 right-6 z-60">
        <button
          id="main-support-trigger"
          type="button"
          onClick={handleToggleTrigger}
          className={`w-[56px] h-[56px] sm:w-[58px] sm:h-[58px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_8px_25px_rgba(0,0,0,0.14)] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.20)] active:translate-y-0 active:scale-95 border border-[#E2DDD2] ${
            isPopupOpen || isChatbotOpen
              ? 'bg-white text-[#1E2519] rotate-90'
              : 'bg-white text-[#1E2519] hover:text-[#1FA855] hover:border-[#1FA855]'
          }`}
          aria-label={isPopupOpen || isChatbotOpen ? 'Close support menu' : 'Open support options'}
          aria-expanded={isPopupOpen}
          title="ভিসা পরামর্শ ও সহায়তা"
        >
          {isPopupOpen || isChatbotOpen ? (
            <X className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <div className="relative flex items-center justify-center">
              <MessagesSquare className="w-[26px] h-[26px] stroke-[2]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#1FA855] border-2 border-white" />
            </div>
          )}
        </button>
      </div>

      {/* Support Chat Modal */}
      <AiChatbotModal
        isOpen={isChatbotOpen}
        onClose={handleCloseChatbot}
        onOpenWhatsAppDirect={handleOpenWhatsApp}
        serviceContext={serviceContext}
        onClearServiceContext={onClearServiceContext}
      />
    </>
  );
};
