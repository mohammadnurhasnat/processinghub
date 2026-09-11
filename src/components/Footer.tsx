import React from 'react';
import { CONFIG } from '../config';

export const Footer: React.FC = () => {
  return (
    <footer id="contact">
      <div className="footer-top">
        <div>
          <div className="brand">{CONFIG.brandName}</div>
          <p>বিশ্বস্ত ইন্ডিয়ান ভিসা প্রসেসিং, আইভ্যাক স্লট কনফার্মেশন ও ডকুমেন্টেশন কনসালটেন্সি সার্ভিস।</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>সার্ভিসসমূহ</h4>
            <a href="#services">Services</a>
            <a href="#destinations">Destinations</a>
          </div>
          <div>
            <h4>যোগাযোগ</h4>
            <a 
              href={`https://wa.me/${CONFIG.phone}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              WhatsApp: {CONFIG.phoneDisplay}
            </a>
            <a 
              href={`tel:${CONFIG.phone}`}
              className="mt-1 block text-sm"
            >
              Phone: {CONFIG.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 {CONFIG.brandName}. All rights reserved.</span>
      </div>
    </footer>
  );
};
