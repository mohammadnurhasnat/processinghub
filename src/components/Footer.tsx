import React from 'react';
import { CONFIG, getPhoneDisplay } from '../config';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const phoneDisplay = getPhoneDisplay(language);

  return (
    <footer id="contact" className="site-footer">
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

        {/* Specification & Hotline */}
        <p className="footer-service-spec">
          {t(
            `আইভ্যাক স্লট বুকিং ও ডকুমেন্ট সহায়তা · হটলাইন: ${phoneDisplay}`,
            `IVAC Slot Booking & Document Assistance · Hotline: ${phoneDisplay}`
          )}
        </p>

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
