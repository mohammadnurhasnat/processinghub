import React from 'react';
import { CONFIG } from '../config';

export const CtaStrip: React.FC = () => {
  return (
    <div id="cta-strip" className="cta-strip">
      <h2>জরুরি ভিসা প্রসেসিং বা তথ্যের প্রয়োজন?</h2>
      <p>আমাদের অভিজ্ঞ ভিসা স্পেশালিস্টদের সাথে সরাসরি হোয়াটসঅ্যাপে কথা বলে আপনার ফাইল যাচাই করে নিন।</p>
      <a 
        id="cta-whatsapp-btn"
        className="btn-primary" 
        href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I need consultation regarding Indian Visa.')}`}
        target="_blank" 
        rel="noopener noreferrer"
      >
        হোয়াটসঅ্যাপে কথা বলুন
      </a>
    </div>
  );
};
