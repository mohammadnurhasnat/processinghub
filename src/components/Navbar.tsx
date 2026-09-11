import React from 'react';
import { Menu, X, ChevronRight, PhoneCall } from 'lucide-react';
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

      {/* MOBILE NAVIGATION DRAWER */}
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
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE5DA]">
              <div className="brand text-xl">{CONFIG.brandName}</div>
              <button 
                type="button" 
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1 text-[#65715D] hover:text-[#1E2519] rounded-lg transition-colors cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 py-6 font-semibold text-[#1E2519]">
              <a 
                href="#services" 
                onClick={() => setIsMobileNavOpen(false)}
                className="hover:text-[#5F7758] py-1 flex items-center justify-between"
              >
                <span>Services (সেবাসমূহ)</span>
                <ChevronRight className="w-4 h-4 text-[#8A9584]" />
              </a>
              <a 
                href="#destinations" 
                onClick={() => setIsMobileNavOpen(false)}
                className="hover:text-[#5F7758] py-1 flex items-center justify-between"
              >
                <span>Destinations (গন্তব্য)</span>
                <ChevronRight className="w-4 h-4 text-[#8A9584]" />
              </a>
              <a 
                href="#contact" 
                onClick={() => setIsMobileNavOpen(false)}
                className="hover:text-[#5F7758] py-1 flex items-center justify-between"
              >
                <span>Contact (যোগাযোগ)</span>
                <ChevronRight className="w-4 h-4 text-[#8A9584]" />
              </a>
            </div>

            <div className="mt-auto pt-4 border-t border-[#EAE5DA] flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onOpenQuickBook();
                }}
                className="btn-3d-matte-primary w-full py-2.5 text-sm font-semibold rounded-lg text-center"
              >
                Book Now (বুক করুন)
              </button>
              <a
                href={`tel:${CONFIG.phone}`}
                className="btn-3d-matte-secondary w-full py-2 text-sm font-medium rounded-lg text-center flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#546E4E]" />
                <span>{CONFIG.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
