import React from 'react';
import { CONFIG } from '../config';
import { useLanguage } from '../context/LanguageContext';

export const CtaStrip: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div id="cta-strip" className="cta-strip">
      <h2>{t('জরুরি ভিসা প্রসেসিং বা তথ্যের প্রয়োজন?', 'Need Urgent Visa Processing or Guidance?')}</h2>
      <p>
        {t(
          'আমাদের অভিজ্ঞ সাপোর্ট টিমের সাথে সরাসরি হোয়াটসঅ্যাপে কথা বলে আপনার ফাইল যাচাই করে নিন।',
          'Chat directly with our experienced support team on WhatsApp to review and verify your visa file.'
        )}
      </p>
      <a 
        id="cta-whatsapp-btn"
        className="btn-primary" 
        href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I need consultation regarding Indian Visa.')}`}
        target="_blank" 
        rel="noopener noreferrer"
      >
        {t('হোয়াটসঅ্যাপে কথা বলুন', 'Chat on WhatsApp')}
      </a>
    </div>
  );
};
