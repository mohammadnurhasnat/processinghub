import React from 'react';
import { 
  Menu, 
  X, 
  ChevronRight, 
  PhoneCall, 
  Compass, 
  MapPin, 
  MessageSquare, 
  ShieldCheck, 
  MessageCircle 
} from 'lucide-react';
import { CONFIG } from '../config';

interface NavbarProps {
  isScrolled: boolean;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (isOpen: boolean) => void;
  onOpenQuickBook: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isScrolled,
  isMobileNavOpen,
  setIsMobileNavOpen,
  onOpenQuickBook
}) => {
  return (
    <>
      {/* MAIN NAVIGATION */}
      <nav id="mainNav" className={isScrolled ? 'scrolled' : ''}>
        <div id="brand-logo" className="brand">{CONFIG.brandName}</div>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#destinations">Destinations</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            id="nav-cta-btn"
            className="nav-cta cursor-pointer border-0" 
            onClick={onOpenQuickBook}
          >
            Book Now
          </button>
          <button
            type="button"
            id="mobile-nav-toggle-btn"
            className="mobile-nav-toggle"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open mobile navigation"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* MOBILE NAVIGATION DRAWER - LIQUID GLASS & PREMIUM LOOK */}
      {isMobileNavOpen && (
        <div 
          id="mobile-nav-drawer-overlay"
          className="mobile-drawer-overlay"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <div 
            className="mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D3]">
              <div>
                <div className="brand text-xl tracking-tight text-[#1E2519]">{CONFIG.brandName}</div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#2E7D32] bg-[#EBF7EE] px-2 py-0.5 rounded-full mt-1 border border-[#C3E6CB]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855] animate-pulse" />
                  <span>ভিসা ও কনসালটেন্সি</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsMobileNavOpen(false)}
                className="w-8 h-8 rounded-full border border-[#D5CFBF] bg-white hover:bg-[#F0ECE1] text-[#4E5C46] hover:text-[#1E2519] flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
            
            {/* Nav Menu Items */}
            <div className="flex flex-col gap-2.5 py-4">
              <a 
                href="#services" 
                onClick={() => setIsMobileNavOpen(false)}
                className="group flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#FAF8F2] border border-[#D5CFBF] shadow-xs transition-all text-[#1E2519]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EBF7EE] border border-[#C3E6CB] flex items-center justify-center text-[#1FA855] group-hover:scale-105 transition-transform">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[13.5px] font-bold text-[#1E2519] leading-snug">
                      Services (সেবাসমূহ)
                    </div>
                    <div className="text-[11px] text-[#6E7B67]">
                      ট্যুরিস্ট, মেডিকেল ও বিজনেস ভিসা
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A9584] group-hover:text-[#1FA855] group-hover:translate-x-0.5 transition-all" />
              </a>

              <a 
                href="#destinations" 
                onClick={() => setIsMobileNavOpen(false)}
                className="group flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#FAF8F2] border border-[#D5CFBF] shadow-xs transition-all text-[#1E2519]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FAF0E6] border border-[#EED7C5] flex items-center justify-center text-[#C05621] group-hover:scale-105 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[13.5px] font-bold text-[#1E2519] leading-snug">
                      Destinations (গন্তব্য)
                    </div>
                    <div className="text-[11px] text-[#6E7B67]">
                      জনপ্রিয় ভ্রমণ ও মেডিকেল শহরসমূহ
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A9584] group-hover:text-[#1FA855] group-hover:translate-x-0.5 transition-all" />
              </a>

              <a 
                href="#contact" 
                onClick={() => setIsMobileNavOpen(false)}
                className="group flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#FAF8F2] border border-[#D5CFBF] shadow-xs transition-all text-[#1E2519]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] border border-[#D0DBFF] flex items-center justify-center text-[#4F46E5] group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[13.5px] font-bold text-[#1E2519] leading-snug">
                      Contact (যোগাযোগ)
                    </div>
                    <div className="text-[11px] text-[#6E7B67]">
                      সরাসরি সহায়তা ও পরামর্শ
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A9584] group-hover:text-[#1FA855] group-hover:translate-x-0.5 transition-all" />
              </a>
            </div>

            {/* Middle Feature/Trust Card */}
            <div className="my-auto py-3.5 px-3.5 rounded-2xl bg-white border border-[#D5CFBF] shadow-xs">
              <div className="flex items-center gap-2 mb-1.5 text-[#24532B] font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-[#1FA855]" />
                <span>বিশ্বস্ত ভিসা ও আইভ্যাক সেবা</span>
              </div>
              <p className="text-[11.5px] text-[#5A6C58] leading-relaxed">
                জরুরি আইভ্যাক (IVAC) স্লট বুকিং, ডকুমেন্টস চেকিং ও দ্রুত ভিসা প্রসেসিং সহায়তা।
              </p>
              <div className="mt-2.5 pt-2 border-t border-[#E8E3D5] flex items-center justify-between text-[10.5px] text-[#6E7D6B]">
                <span>অফিস: ঢাকা, বাংলাদেশ</span>
                <span className="text-[#1FA855] font-semibold">সকাল ৯টা - রাত ১০টা</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-4 border-t border-[#E8E2D3] flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onOpenQuickBook();
                }}
                className="btn-3d-matte-primary w-full py-2.5 text-sm font-semibold rounded-full text-center cursor-pointer"
              >
                Book Now (বুক করুন)
              </button>
              
              <a
                href={`tel:${CONFIG.phone}`}
                className="btn-3d-matte-secondary w-full py-2.5 px-3 text-sm font-semibold rounded-full text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#1FA855]" />
                <span>{CONFIG.phoneDisplay}</span>
              </a>

              <a
                href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I am contacting you for Indian Visa Assistance.')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileNavOpen(false)}
                className="w-full py-2 px-3 text-xs font-semibold rounded-full text-center flex items-center justify-center gap-1.5 text-[#1FA855] hover:bg-[#EBF7EE]/70 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>হোয়াটসঅ্যাপে সরাসরি চ্যাট</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
