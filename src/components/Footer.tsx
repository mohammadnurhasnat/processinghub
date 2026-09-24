import React from 'react';
import { PhoneCall, MessageCircle, Facebook, ArrowUpRight } from 'lucide-react';
import { CONFIG } from '../config';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          {/* কলাম ১: ব্র্যান্ড পরিচিতি */}
          <div className="footer-brand">
            <div className="brand">{CONFIG.brandName}</div>
            <p className="footer-brand-desc">
              অভিজ্ঞ কনসালট্যান্ট ও সম্পূর্ণ লিগ্যাল প্রক্রিয়ায় দ্রুততম সময়ে ইন্ডিয়ান ভিসা প্রসেসিং এবং ভারতীয় শীর্ষ হাসপাতালে উন্নত চিকিৎসার জন্য স্পেশালিস্ট ডক্টরস ইনভাইটেশন ও অ্যাপয়েন্টমেন্ট সার্ভিস।
            </p>
          </div>

          {/* কলাম ২ ও ৩: সার্ভিসসমূহ এবং সরাসরি যোগাযোগ */}
          <div className="footer-columns-group">
            {/* কলাম ২: সার্ভিসসমূহ */}
            <div className="footer-col-services">
              <h4 className="footer-heading">সার্ভিসসমূহ</h4>
              <div className="footer-services-list">
                <a href="#our-commitment" className="footer-service-btn group">
                  <span>আমাদের অঙ্গীকার</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
                <a href="#services" className="footer-service-btn group">
                  <span>ভিসা সার্ভিসসমূহ</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
                <a href="#destinations" className="footer-service-btn group">
                  <span>জনপ্রিয় গন্তব্য</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
                <a href="#hero-section" className="footer-service-btn group">
                  <span>ফ্রি পরামর্শ</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>

            {/* কলাম ৩: সরাসরি যোগাযোগ */}
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
                    <span className="contact-item-sub">সরাসরি কল</span>
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

                {/* Facebook Page বাটন */}
                <a 
                  href={CONFIG.facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-contact-item facebook-item"
                  title="আমাদের অফিসিয়াল ফেসবুক পেজে যুক্ত হোন"
                >
                  <div className="contact-icon-wrapper fb-icon-bg">
                    <Facebook className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="contact-item-info">
                    <span className="contact-item-sub">Facebook</span>
                    <span className="contact-item-val">/processinghubbd</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 {CONFIG.brandName}. সর্বস্বত্ব সংরক্ষিত।</span>
          <span className="footer-bottom-tag">বিশ্বস্ত ও নির্ভরযোগ্য ইন্ডিয়ান ভিসা কনসালটেন্সি সার্ভিস</span>
        </div>
      </div>
    </footer>
  );
};
