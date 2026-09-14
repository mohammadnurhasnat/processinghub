import React, { useState } from 'react';
import { X, MessagesSquare } from 'lucide-react';
import { CONFIG } from '../config';
import { VisaService } from '../types';
import { CustomMessageMenuModal } from './CustomMessageMenuModal';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInternalChatbotOpen, setIsInternalChatbotOpen] = useState(false);

  const isChatbotOpen = isChatbotForcedOpen !== undefined ? isChatbotForcedOpen || isInternalChatbotOpen : isInternalChatbotOpen;

  const handleToggleMenu = () => {
    if (isChatbotOpen) {
      setIsInternalChatbotOpen(false);
      onCloseForcedChatbot?.();
      return;
    }
    setIsMenuOpen(prev => !prev);
  };

  const handleOpenChatbot = () => {
    setIsMenuOpen(false);
    setIsInternalChatbotOpen(true);
  };

  const handleCloseChatbot = () => {
    setIsInternalChatbotOpen(false);
    onCloseForcedChatbot?.();
  };

  const handleDirectWhatsApp = () => {
    const waUrl = `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(
      serviceContext?.title
        ? `Hello Processing Hub, I have an inquiry about ${serviceContext.title}.`
        : 'Hello Processing Hub, I have an inquiry about Indian Visa Processing.'
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 sm:bottom-6 sm:right-6 z-60 flex items-center gap-2">
        {/* Tooltip Pill (visible on desktop) */}
        {!isMenuOpen && !isChatbotOpen && (
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 bg-white/95 backdrop-blur-xs border border-[#D5CFBF] text-[#1E2519] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md hover:bg-white hover:border-[#1FA855] transition-all cursor-pointer animate-in fade-in slide-in-from-right-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#1FA855] animate-pulse" />
            <span>{serviceContext?.title ? `${serviceContext.title} পরামর্শ` : 'সহায়তা ও কনসালটেন্সি'}</span>
          </button>
        )}

        <button
          id="support-floating-button"
          type="button"
          onClick={handleToggleMenu}
          className={`wa-float cursor-pointer border-none outline-none ${
            isMenuOpen || isChatbotOpen ? 'bg-[#1E2519] hover:bg-[#2C3524]' : ''
          }`}
          aria-label={isMenuOpen || isChatbotOpen ? 'Close support options' : 'Open live support and contact options'}
          aria-expanded={isMenuOpen || isChatbotOpen}
        >
          {isMenuOpen || isChatbotOpen ? (
            <X className="w-6 h-6 text-white stroke-[2.5]" />
          ) : (
            <div className="relative flex items-center justify-center w-full h-full">
              <MessagesSquare className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] text-white stroke-[2.2]" />
              {/* Subtle active status indicator positioned on border */}
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#A7F3D0] border-2 border-[#128C7E]" />
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Pop-up Options Window */}
      <CustomMessageMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectChatbot={handleOpenChatbot}
        onSelectWhatsApp={handleDirectWhatsApp}
      />

      {/* Support Chat Modal */}
      <AiChatbotModal
        isOpen={isChatbotOpen}
        onClose={handleCloseChatbot}
        onOpenWhatsAppDirect={handleDirectWhatsApp}
        serviceContext={serviceContext}
        onClearServiceContext={onClearServiceContext}
      />
    </>
  );
};
