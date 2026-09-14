import React from 'react';
import { 
  Menu, 
  X, 
  PhoneCall, 
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
            
            {/* Nav Menu Items - Simple, Clean & Elegant (English Only) */}
            <div className="flex flex-col gap-2 py-4">
              <a 
                href="#services" 
                onClick={() => setIsMobileNavOpen(false)}
                className="px-4 py-3 rounded-xl bg-white/80 hover:bg-white border border-[#E8E2D3] hover:border-[#1FA855]/50 text-[#1E2519] hover:text-[#1FA855] text-[15px] font-semibold tracking-wide transition-all shadow-xs block"
              >
                Services
              </a>

              <a 
                href="#destinations" 
                onClick={() => setIsMobileNavOpen(false)}
                className="px-4 py-3 rounded-xl bg-white/80 hover:bg-white border border-[#E8E2D3] hover:border-[#1FA855]/50 text-[#1E2519] hover:text-[#1FA855] text-[15px] font-semibold tracking-wide transition-all shadow-xs block"
              >
                Destinations
              </a>

              <a 
                href="#contact" 
                onClick={() => setIsMobileNavOpen(false)}
                className="px-4 py-3 rounded-xl bg-white/80 hover:bg-white border border-[#E8E2D3] hover:border-[#1FA855]/50 text-[#1E2519] hover:text-[#1FA855] text-[15px] font-semibold tracking-wide transition-all shadow-xs block"
              >
                Contact
              </a>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-3 border-t border-[#E8E2D3] flex flex-col gap-2.5">
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
