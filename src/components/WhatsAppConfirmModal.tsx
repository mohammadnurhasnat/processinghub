import React, { useEffect } from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { CONFIG } from '../config';
import { X, ExternalLink } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const WhatsAppConfirmModal: React.FC = () => {
  const { isOpen, closeWhatsAppModal, redirectData } = useWhatsApp();

  // Completely lock background page scrolling when WhatsApp popup is open
  useBodyScrollLock(isOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeWhatsAppModal();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeWhatsAppModal]);

  if (!isOpen || !redirectData) return null;

  const handleProceed = () => {
    if (redirectData.url) {
      window.open(redirectData.url, '_blank', 'noopener,noreferrer');
    }
    closeWhatsAppModal();
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/45 backdrop-blur-xl animate-fadeIn overscroll-contain"
      style={{ overscrollBehavior: 'contain' }}
      onClick={closeWhatsAppModal}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-[#FAF8F5] rounded-2xl border border-[#D5CFBF] shadow-[0_20px_50px_rgba(0,0,0,0.22)] max-w-[320px] w-full overflow-hidden text-[#26301F] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FAF8F5] border-b border-[#EAE5DA] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1FA855] text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <svg 
                viewBox="0 0 24 24" 
                className="w-4 h-4 fill-current"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-[#1E2519]">
                {redirectData.title || 'WhatsApp চ্যাট'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={closeWhatsAppModal}
            className="w-7 h-7 rounded-full border border-[#D5CFBF] bg-white hover:bg-[#F0ECE1] text-[#4E5C46] hover:text-[#1E2519] flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 bg-[#FAF8F5]">
          <p className="text-xs text-[#46523E] leading-relaxed">
            সরাসরি WhatsApp-এ যোগাযোগ করতে চান?
          </p>

          <div className="bg-white border border-[#D5CFBF] rounded-xl p-2.5 flex items-center justify-between text-xs shadow-xs">
            <span className="text-[#65715D]">নম্বর:</span>
            <strong className="font-mono text-xs text-[#1E2519] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E0DACE]">
              {CONFIG.phoneDisplay}
            </strong>
          </div>

          {redirectData.serviceTitle && (
            <p className="text-[11px] text-[#4E5C46] bg-white px-2.5 py-1.5 rounded-xl border border-[#D5CFBF] font-medium truncate shadow-xs">
              {redirectData.serviceTitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-[#FAF8F5] border-t border-[#EAE5DA] px-4 py-3 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeWhatsAppModal}
            className="btn-3d-matte-red px-4 py-2 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap text-center cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleProceed}
            className="btn-3d-matte-green inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-full whitespace-nowrap text-center cursor-pointer"
          >
            <span>WhatsApp-এ যান</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
