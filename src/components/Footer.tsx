import React from 'react';
import { Puzzle, ExternalLink } from 'lucide-react';
import { CONFIG, getPhoneDisplay } from '../config';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const phoneDisplay = getPhoneDisplay(language);

  return (
    <footer className="site-footer">
      <div className="footer-inner-minimal">
        {/* Brand Watermark */}
        <div className="footer-watermark-brand" aria-label={CONFIG.brandName}>
          processing hub
        </div>

        {/* Subtitle */}
        <div className="footer-subtitle-spaced">
          {t(
            'ভিসা প্রসেসিং ও ফাইল সহায়তা সেবা',
            'VISA PROCESSING & FILE ASSISTANCE SERVICES'
          )}
        </div>

        {/* Tagline */}
        <p className="footer-tagline-bengali">
          {t(
            'নির্ভুল ও বিশ্বস্ত ভিসা প্রসেসিং',
            'Accurate & Trusted Visa Processing'
          )}
        </p>

        {/* Service & Hotline Spec */}
        <p className="footer-service-spec !mb-3">
          {t(
            `আইভ্যাক স্লট বুকিং ও ডকুমেন্ট সহায়তা · হটলাইন: ${phoneDisplay}`,
            `IVAC Slot Booking & Document Support · Hotline: ${phoneDisplay}`
          )}
        </p>

        {/* Chrome Extension Line right above copyright */}
        <div className="mb-6 px-3">
          <a
            id="footer-extension-link"
            href={CONFIG.chromeExtension.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-wrap items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-[#CCD3FB] text-xs sm:text-[13px] font-semibold text-[#1E2519] shadow-2xs transition-all group"
          >
            <Puzzle className="w-3.5 h-3.5 text-[#263375] shrink-0" />
            <span>
              {t(
                'নির্ভুল এবং দ্রুত আবেদনের জন্য ব্যবহার করতে পারেন',
                'For fast and accurate applications, you can use'
              )}
            </span>
            <span className="font-bold text-[#263375] group-hover:underline inline-flex items-center gap-1">
              {CONFIG.chromeExtension.name}
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          {t(
            `© ২০২৬ ${CONFIG.brandName} · সর্বস্বত্ব সংরক্ষিত`,
            `© 2026 ${CONFIG.brandName} · All Rights Reserved`
          )}
        </div>
      </div>
    </footer>
  );
};
