import React from 'react';
import { PhoneCall, MessageCircle, ArrowUpRight, Clock } from 'lucide-react';
import { CONFIG } from '../config';

export const Footer: React.FC = () => {
  return (
    <footer id="contact">
      <div className="footer-top">
        <div className="max-w-[340px]">
          <div className="brand">{CONFIG.brandName}</div>
          <p>বিশ্বস্ত ইন্ডিয়ান ভিসা প্রসেসিং, আইভ্যাক স্লট কনফার্মেশন ও ডকুমেন্টেশন কনসালটেন্সি সার্ভিস।</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#8B937E]">
            <Clock className="w-3 h-3 text-[#1FA855]" />
            <span>সাপোর্ট সময়: প্রতিদিন সকাল ৯টা - রাত ১০টা</span>
          </div>
        </div>

        <div className="footer-links">
          <div>
            <h4>সার্ভিসসমূহ</h4>
            <a href="#services" className="footer-text-link">ভিসা সেবাসমূহ</a>
            <a href="#destinations" className="footer-text-link">জনপ্রিয় গন্তব্য</a>
            <a href="#hero-section" className="footer-text-link">ফ্রি কনসালটেশন</a>
          </div>

          <div className="min-w-[240px] sm:min-w-[280px]">
            <h4>সরাসরি যোগাযোগ</h4>
            <div className="flex flex-col gap-2 mt-1.5">
              {/* Call Now Action Card */}
              <a 
                href={`tel:${CONFIG.phone}`}
                className="group flex items-center justify-between py-2 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-white shadow-xs"
                title="সরাসরি ফোন কলে কথা বলতে ট্যাপ করুন"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#2E7D32]/30 border border-[#4CAF50]/40 flex items-center justify-center text-[#9AE6B4] group-hover:scale-105 transition-transform shrink-0">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-[#93A084]">
                      Call Now: (কল করুন)
                    </div>
                    <div className="text-[13px] font-bold text-[#FAF8F5] tracking-wide">
                      {CONFIG.phoneDisplay}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10.5px] text-[#A8B2A0] group-hover:text-white transition-colors shrink-0">
                  <span className="hidden xs:inline">ডায়াল করুন</span>
                  <ArrowUpRight className="w-3 h-3 text-[#9AE6B4] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>

              {/* Text Now WhatsApp Action Card */}
              <a 
                href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I want to inquire about Indian Visa Processing.')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-2 px-2.5 rounded-lg bg-[#1FA855]/10 hover:bg-[#1FA855]/20 border border-[#1FA855]/30 hover:border-[#1FA855]/50 transition-all text-white shadow-xs"
                title="সরাসরি হোয়াটসঅ্যাপে মেসেজ পাঠাতে ট্যাপ করুন"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#1FA855] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-[#86EFAC]">
                      Text Now: (WhatsApp)
                    </div>
                    <div className="text-[13px] font-bold text-[#FAF8F5] tracking-wide">
                      {CONFIG.phoneDisplay}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10.5px] text-[#86EFAC] group-hover:text-white transition-colors shrink-0">
                  <span className="hidden xs:inline">মেসেজ দিন</span>
                  <ArrowUpRight className="w-3 h-3 text-[#86EFAC] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 {CONFIG.brandName}. All rights reserved.</span>
        <span>বিশ্বস্ত ভিসা প্রসেসিং ও কনসালটেন্সি সার্ভিস</span>
      </div>
    </footer>
  );
};
