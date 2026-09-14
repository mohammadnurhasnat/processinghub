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

      {/* MOBILE NAVIGATION DRAWER - SIMPLE, CLEAN & BEAUTIFUL */}
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
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E2D3]">
              <div>
                <div className="brand text-lg tracking-tight text-[#1E2519]">{CONFIG.brandName}</div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2E7D32] mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1FA855] animate-pulse" />
                  <span>ভিসা ও কনসালটেন্সি সার্ভিস</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsMobileNavOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EFECE3] hover:bg-[#E3DEC3] text-[#4E5C46] hover:text-[#1E2519] flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
            
            {/* Nav Menu Items - Clean, Uncluttered List */}
            <div className="flex flex-col gap-1 py-4">
              <a 
                href="#services" 
                onClick={() => setIsMobileNavOpen(false)}
                className="group flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[#EFECE3] transition-all text-[#1E2519]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF7EE] text-[#1FA855] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-[#1E2519] group-hover:text-[#1FA855] transition-colors">
                    Services (সেবাসমূহ)
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A0AA98] group-hover:text-[#1FA855] group-hover:translate-x-0.5 transition-all" />
              </a>

              <a 
                href="#destinations" 
                onClick={() => setIsMobileNavOpen(false)}
                className="group flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[#EFECE3] transition-all text-[#1E2519]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF0E6] text-[#C05621] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-[#1E2519] group-hover:text-[#C05621] transition-colors">
                    Destinations (গন্তব্য)
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A0AA98] group-hover:text-[#C05621] group-hover:translate-x-0.5 transition-all" />
              </a>

              <a 
                href="#contact" 
                onClick={() => setIsMobileNavOpen(false)}
                className="group flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[#EFECE3] transition-all text-[#1E2519]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-[#1E2519] group-hover:text-[#4F46E5] transition-colors">
                    Contact (যোগাযোগ)
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A0AA98] group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all" />
              </a>
            </div>

            {/* Simple Clean Info Badge */}
            <div className="mt-auto mb-4 px-3.5 py-2.5 rounded-xl bg-[#F0EDE4] border border-[#E3DEC3]/70 text-[11px] text-[#5A6C58] flex flex-col gap-1">
              <div className="flex items-center justify-between font-medium">
                <span>অফিস: ঢাকা, বাংলাদেশ</span>
                <span className="text-[#1FA855] font-semibold">সকাল ৯টা - রাত ১০টা</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#E8E2D3] flex flex-col gap-2.5">
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
              
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${CONFIG.phone}`}
                  className="btn-3d-matte-secondary py-2 px-2 text-xs font-semibold rounded-full text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#1FA855]" />
                  <span>Call Now</span>
                </a>

                <a
                  href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I am contacting you for Indian Visa Assistance.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="btn-3d-matte-green py-2 px-2 text-xs font-bold rounded-full text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
