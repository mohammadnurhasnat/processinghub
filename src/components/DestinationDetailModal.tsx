import React, { useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Compass, 
  Calendar, 
  CheckCircle2, 
  Plane, 
  PhoneCall 
} from 'lucide-react';
import { Destination } from '../types';
import { CONFIG } from '../config';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useLanguage } from '../context/LanguageContext';

interface DestinationDetailModalProps {
  destination: Destination | null;
  onClose: () => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  onClose
}) => {
  const { language, t } = useLanguage();
  const isBn = language === 'bn';

  useBodyScrollLock(Boolean(destination));

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (destination) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [destination, onClose]);

  if (!destination) return null;

  const waTravelText = `Hello Processing Hub, I want information and Tourist Visa processing assistance for traveling to *${destination.name}* (${destination.location}). Please help me prepare my travel visa file.`;

  return (
    <div 
      id="destination-detail-modal-overlay"
      className="service-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="destination-detail-modal-card"
        className="service-modal-card max-w-xl"
      >
        {/* Header with Photo & Title */}
        <div className="relative">
          <div className="h-44 sm:h-52 w-full overflow-hidden rounded-t-2xl relative bg-[#1E2519]">
            <img 
              src={destination.image} 
              alt={destination.name}
              className="w-full h-full object-cover object-center opacity-90 transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = CONFIG.fallbackImage;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141B10] via-black/40 to-transparent" />
            
            <div className="absolute bottom-3 left-4 right-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2A6A26] text-white shadow-xs">
                <Compass className="w-3.5 h-3.5" />
                {t('জনপ্রিয় পর্যটন গন্তব্য', 'Popular Travel Destination')}
              </span>
              <h3 className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-white mt-1.5 leading-snug drop-shadow-sm">
                {destination.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#A3D69B]" />
                {destination.location}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="destination-modal-close-btn"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer z-10 backdrop-blur-xs border border-white/20"
            aria-label={t('বন্ধ করুন', 'Close modal')}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="service-modal-body space-y-4 max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {/* Best Time To Visit Box */}
          <div className="p-3 rounded-xl bg-[#F4F9F2] border border-[#D5E8D0] flex items-center gap-2.5">
            <div className="p-2 bg-[#2E7D32] text-white rounded-lg flex-shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#4E5C46] uppercase block">
                {t('ভ্রমণের সেরা সময়:', 'Best Time to Visit:')}
              </span>
              <span className="text-xs sm:text-[13px] font-bold text-[#1E5624]">{destination.bestTime}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-[#65715D] uppercase tracking-wider mb-1.5">
              {t('গন্তব্য পরিচিতি ও আকর্ষণ', 'Destination Overview')}
            </h4>
            <p className="text-xs sm:text-[13.5px] text-[#2C3627] leading-relaxed">
              {destination.description}
            </p>
          </div>

          {/* Top Attractions List */}
          <div>
            <h4 className="text-xs font-bold text-[#65715D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#2E7D32]" />
              {t('প্রধান দর্শনীয় স্থানসমূহ', 'Top Attractions')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {destination.attractions.map((attr, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E4D8] text-xs font-semibold text-[#1E2519]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0" />
                  <span>{attr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="service-modal-footer flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 bg-[#F8F7F2] border-t border-[#E8E4D8]">
          <div className="flex items-center gap-1.5 text-xs text-[#4E5C46]">
            <Plane className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
            <span className="font-medium">
              {t('ট্যুরিস্ট ভিসা ও ফাইল প্রসেসিং সাপোর্ট', 'Tourist Visa & File Processing Support')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 justify-end flex-wrap sm:flex-nowrap w-auto ml-auto">
            <button
              type="button"
              id="dest-modal-bottom-close-btn"
              onClick={onClose}
              className="btn-3d-red-glass w-fit inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs leading-tight font-bold rounded-[5px] whitespace-nowrap cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('বন্ধ', 'Close')}</span>
            </button>

            <a
              id="dest-call-helpline-btn"
              href={`tel:${CONFIG.phone}`}
              className="btn-3d-matte-secondary w-fit inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs leading-tight font-bold rounded-[5px] whitespace-nowrap text-[#1E2519]"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{t('কল করুন', 'Call Now')}</span>
            </a>

            <a
              id="dest-whatsapp-booking-btn"
              href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(waTravelText)}`}
              data-service-name={
                isBn
                  ? `ট্যুরিস্ট ভিসা ও ${destination.name} ট্রাভেল ফাইল`
                  : `Tourist Visa & ${destination.name} Travel File`
              }
              data-section={t('ভ্রমণ গন্তব্য সেকশন', 'Destinations Section')}
              data-whatsapp-title={t('ট্যুরিস্ট ভিসা ও ভ্রমণ গন্তব্য', 'Tourist Visa & Destination')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-matte-green w-fit inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs leading-tight font-bold rounded-[5px] whitespace-nowrap text-center text-[#124218]"
            >
              <span>{t('ভিসা প্রসেসিং করুন', 'Apply for Visa')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
