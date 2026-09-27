import React from 'react';
import { CONFIG } from '../config';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-inner-minimal">
        {/* লার্জ এমবসড ব্র্যান্ড ওয়াটারমার্ক (স্ক্রিনশটের "formal" স্টাইল) */}
        <div className="footer-watermark-brand" aria-label={CONFIG.brandName}>
          processing hub
        </div>

        {/* ওয়াইড লেটারস্পেসড অল-ক্যাপস সাবটাইটেল (Aptos ফন্ট) */}
        <div className="footer-subtitle-spaced">
          VISA PROCESSING &amp; CONSULTANCY SERVICES
        </div>

        {/* বাংলা স্লোগান */}
        <p className="footer-tagline-bengali">
          নির্ভুল ও বিশ্বস্ত ভিসা প্রসেসিং
        </p>

        {/* স্পেসিফিকেশন ও হটলাইন ইনফো (স্ক্রিনশটের "Premium Bifold - V1" স্টাইল) */}
        <p className="footer-service-spec">
          IVAC Slot Booking &amp; Document Consultation &middot; Hotline: {CONFIG.phoneDisplay}
        </p>

        {/* কপিরাইট লাইন (স্ক্রিনশটের বটম স্টাইল) */}
        <div className="footer-copyright">
          &copy; 2026 {CONFIG.brandName} &middot; সর্বস্বত্ব সংরক্ষিত
        </div>
      </div>
    </footer>
  );
};
