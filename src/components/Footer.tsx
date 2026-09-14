import React from 'react';
import { PhoneCall, MessageCircle, ArrowUpRight } from 'lucide-react';
import { CONFIG } from '../config';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-top">
        {/* কলাম ১: ব্র্যান্ড পরিচিতি */}
        <div className="footer-brand">
          <div className="brand">{CONFIG.brandName}</div>
          <p>বিশ্বস্ত ইন্ডিয়ান ভিসা প্রসেসিং, আইভ্যাক স্লট কনফার্মেশন ও ডকুমেন্টেশন কনসালটেন্সি সার্ভিস।</p>
        </div>

        {/* সার্ভিসসমূহ (বাম পাশে ৩টি বাটন) এবং সরাসরি যোগাযোগ (ডান পাশে ২টি বাটন) */}
        <div className="footer-columns-wrapper">
          {/* বাম পাশ: সার্ভিসসমূহ */}
          <div className="footer-col-services">
            <h4 className="footer-heading">সার্ভিসসমূহ</h4>
            <div className="footer-services-list">
              <a href="#services" className="footer-service-btn">
                ভিসা সেবাসমূহ
              </a>
              <a href="#destinations" className="footer-service-btn">
                জনপ্রিয় গন্তব্য
              </a>
              <a href="#hero-section" className="footer-service-btn">
                ফ্রি কনসালটেশন
              </a>
            </div>
          </div>

          {/* ডান পাশ: সরাসরি যোগাযোগ */}
          <div className="footer-col-contact">
            <h4 className="footer-heading">সরাসরি যোগাযোগ</h4>
            <div className="footer-contact-list">
              {/* Call Now বাটন */}
              <a 
                href={`tel:${CONFIG.phone}`}
                className="footer-contact-item phone-item"
                title="সরাসরি কল করুন"
              >
                <div className="contact-icon-wrapper phone-icon-bg">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <div className="contact-item-info">
                  <span className="contact-item-sub">কল করুন</span>
                  <span className="contact-item-val">{CONFIG.phoneDisplay}</span>
                </div>
              </a>

              {/* WhatsApp বাটন */}
              <a 
                href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I want to inquire about Indian Visa Processing.')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-contact-item whatsapp-item"
                title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
              >
                <div className="contact-icon-wrapper wa-icon-bg">
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="contact-item-info">
                  <span className="contact-item-sub">WhatsApp</span>
                  <span className="contact-item-val">{CONFIG.phoneDisplay}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 {CONFIG.brandName}. All rights reserved.</span>
        <span className="footer-bottom-tag">বিশ্বস্ত ভিসা প্রসেসিং ও কনসালটেন্সি সার্ভিস</span>
      </div>
    </footer>
  );
};


