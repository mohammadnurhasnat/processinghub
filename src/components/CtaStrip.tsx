import React from 'react';
import { CONFIG } from '../config';

export const CtaStrip: React.FC = () => {
  return (
    <div id="cta-strip" className="cta-strip">
      <h2>জরুরি ভিসা প্রসেসিং বা তথ্যের প্রয়োজন?</h2>
      <p>সরাসরি আমাদের WhatsApp-এ যোগাযোগ করুন — আপনার ফাইল রিভিউ ও প্রয়োজনীয় দিকনির্দেশনা দেওয়া হবে অবিলম্বে।</p>
      <a 
        id="cta-whatsapp-btn"
        className="btn-primary" 
        href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I need consultation regarding Indian Visa.')}`}
        target="_blank" 
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
    </div>
  );
};
