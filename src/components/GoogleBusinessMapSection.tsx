import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Star, Clock, PhoneCall, ExternalLink, MessageCircle, Mail } from 'lucide-react';
import { CONFIG, getPhoneDisplay } from '../config';
import { useLanguage } from '../context/LanguageContext';

const MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
const HAS_USABLE_MAPS_KEY =
  Boolean(MAPS_API_KEY) && MAPS_API_KEY !== 'MY_GOOGLE_MAPS_API_KEY';

export const GoogleBusinessMapSection: React.FC = () => {
  const { language, t } = useLanguage();
  const isBn = language === 'bn';
  const phoneDisplay = getPhoneDisplay(language);

  const [infoOpen, setInfoOpen] = useState<boolean>(true);
  const [mapsFailed, setMapsFailed] = useState<boolean>(false);

  useEffect(() => {
    const onQuotaOrAuthFailure = () => setMapsFailed(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaOrAuthFailure);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', onQuotaOrAuthFailure);
    };
  }, []);

  return (
    <section
      id="contact"
      aria-label={t('গুগল বিজনেস প্রোফাইল ও অফিস লোকেশন', 'Verified Google Business Profile & Office Location')}
      className="w-full max-w-6xl mx-auto px-4 pb-8"
    >
      <div className="rounded-3xl bg-white/95 border border-[#D8DEFA] shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Interactive Google Map */}
        <div className="lg:col-span-7 relative bg-[#EEF2FA]">
          {HAS_USABLE_MAPS_KEY && !mapsFailed ? (
            <APIProvider
              apiKey={MAPS_API_KEY}
              language={isBn ? 'bn' : 'en'}
              region="BD"
            >
              <div className="w-full h-[320px] sm:h-[380px]">
                <GoogleMap
                  mapId="DEMO_MAP_ID"
                  defaultCenter={CONFIG.geo}
                  defaultZoom={15}
                  gestureHandling="cooperative"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                >
                  <AdvancedMarker
                    position={CONFIG.geo}
                    onClick={() => setInfoOpen(true)}
                    title={CONFIG.brandName}
                  >
                    <Pin background="#263375" glyphColor="#FFFFFF" borderColor="#162054" />
                  </AdvancedMarker>

                  {infoOpen && (
                    <InfoWindow
                      position={CONFIG.geo}
                      onCloseClick={() => setInfoOpen(false)}
                    >
                      <div className="p-1 max-w-[220px] text-left">
                        <div className="text-xs font-bold text-[#161D28]">
                          {CONFIG.brandName}
                        </div>
                        <div className="text-[11px] text-[#4C5565] mt-0.5 leading-snug">
                          {isBn ? CONFIG.fullAddress : CONFIG.fullAddressEn}
                        </div>
                        <a
                          href={CONFIG.mapsDirectionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#263375] hover:underline mt-1.5"
                        >
                          <span>{t('দিকনির্দেশনা দেখুন', 'Get Directions')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </div>
            </APIProvider>
          ) : (
            <div className="w-full h-[320px] sm:h-[380px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#F2F5FC] to-[#E9EFEA]">
              <div className="w-12 h-12 rounded-2xl bg-[#263375] text-white flex items-center justify-center mb-3 shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#161D28] font-['Space_Grotesk']">
                {CONFIG.brandName} — Dhaka, Bangladesh
              </h3>
              <p className="text-xs text-[#4C5565] mt-1 max-w-sm">
                {isBn ? CONFIG.fullAddress : CONFIG.fullAddressEn}
              </p>
              <a
                href={CONFIG.mapsPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d-matte-primary mt-4 px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t('Google Maps-এ খুলুন', 'Open in Google Maps')}</span>
              </a>
            </div>
          )}
        </div>

        {/* Right: Verified Google Business Profile Card */}
        <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between gap-4 bg-white">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#1D5E29] border border-[#C5E0C9]">
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('ভেরিফাইড গুগল বিজনেস প্রোফাইল', 'Verified Google Business Profile')}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-[#161D28]">
              {CONFIG.brandName} — {t('সাপোর্ট ডেস্ক', 'Visa Assistance Desk')}
            </h3>

            <div className="space-y-2.5 text-xs text-[#3D4737]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#263375] shrink-0 mt-0.5" />
                <span>{isBn ? CONFIG.fullAddress : CONFIG.fullAddressEn}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#263375] shrink-0" />
                <span>
                  {t('শনি – বৃহস্পতি: সকাল ৯টা – রাত ৯টা', 'Sat – Thu: 9:00 AM – 9:00 PM')}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#263375] shrink-0" />
                <a href={`tel:${CONFIG.phone}`} className="font-bold text-[#263375] hover:underline">
                  {phoneDisplay}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#263375] shrink-0" />
                <a href={`mailto:${CONFIG.email}`} className="font-semibold text-[#3D4737] hover:text-[#263375] hover:underline">
                  {CONFIG.email}
                </a>
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-[#ECEFF9]">
            {/* Top Row: 50% Get Directions + 50% WhatsApp side-by-side */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                id="gbp-directions-link"
                href={CONFIG.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d-matte-primary py-2.5 px-3 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Navigation className="w-3.5 h-3.5 shrink-0" />
                <span>{t('দিকনির্দেশনা', 'Get Directions')}</span>
              </a>

              <a
                id="gbp-whatsapp-link"
                href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I need Indian Visa processing assistance.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap bg-[#25D366] hover:bg-[#1FB858] text-white border border-[#1DA851] shadow-[0_4px_0_#168B42,0_5px_10px_rgba(37,211,102,0.25)] active:translate-y-[3px] active:shadow-[0_1px_0_#168B42] transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{t('হোয়াটসঅ্যাপ', 'WhatsApp')}</span>
              </a>
            </div>

            {/* Bottom Row: Google Reviews */}
            <a
              id="gbp-review-link"
              href={CONFIG.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-matte-secondary w-full py-2.5 px-4 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Star className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span>{t('গুগলে রিভিউ দিন (Google Reviews)', 'Leave a Google Review')}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
