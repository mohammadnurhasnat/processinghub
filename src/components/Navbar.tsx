import React, { useEffect } from 'react';
import { 
  Menu, 
  X, 
  PhoneCall, 
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  // Mobile history back gesture/button handler
  useEffect(() => {
    if (!isMobileNavOpen) return;

    let hasPushed = false;
    try {
      window.history.pushState({ mobileNavOpen: true }, '');
      hasPushed = true;
    } catch {
      // iFrame fallback
    }

    const handlePopState = () => {
      setIsMobileNavOpen(false);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (hasPushed && window.history.state?.mobileNavOpen) {
        try {
          window.history.back();
        } catch {
          // ignore
        }
      }
    };
  }, [isMobileNavOpen, setIsMobileNavOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileNavOpen(false);
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* HEADER & TOP NAVBAR */}
      <header className={`site-header ${isScrolled ? 'scrolled' : ''} ${isMobileNavOpen ? 'menu-open' : ''}`}>
        <nav id="mainNav" className={isScrolled ? 'scrolled' : ''}>
          <a 
            href="#" 
            id="brand-logo" 
            className="brand-btn"
            onClick={(e) => handleNavClick(e, '#')}
            title={CONFIG.brandName}
          >
            <span className="brand-text">{CONFIG.brandName}</span>
          </a>

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
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-expanded={isMobileNavOpen}
              aria-label={isMobileNavOpen ? "Close mobile menu" : "Open mobile menu"}
            >
              {isMobileNavOpen ? (
                <X className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2.2]" />
              )}
            </button>
          </div>
        </nav>

        {/* MOBILE TOP DROPDOWN MENU */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              key="mobile-nav-dropdown"
              id="mobile-nav-dropdown"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.2 }
              }}
              className="mobile-dropdown-menu md:hidden"
            >
              <div className="mobile-dropdown-content">
                {/* Nav Links */}
                <a 
                  href="#services"
                  onClick={(e) => handleNavClick(e, '#services')}
                  className="mobile-dropdown-link"
                >
                  <span>Services</span>
                  <ChevronRight className="w-4 h-4 text-[#7C9473]" />
                </a>

                <a 
                  href="#destinations"
                  onClick={(e) => handleNavClick(e, '#destinations')}
                  className="mobile-dropdown-link"
                >
                  <span>Destinations</span>
                  <ChevronRight className="w-4 h-4 text-[#7C9473]" />
                </a>

                <a 
                  href="#contact"
                  onClick={(e) => handleNavClick(e, '#contact')}
                  className="mobile-dropdown-link"
                >
                  <span>Contact</span>
                  <ChevronRight className="w-4 h-4 text-[#7C9473]" />
                </a>

                {/* Actions */}
                <div className="mobile-dropdown-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      onOpenQuickBook();
                    }}
                    className="btn-3d-matte-primary w-full py-2.5 text-sm font-semibold rounded-xl text-center cursor-pointer shadow-xs"
                  >
                    Book Now (বুক করুন)
                  </button>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <a
                      href={`tel:${CONFIG.phone}`}
                      className="btn-3d-matte-secondary py-2 px-2 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#1FA855]" />
                      <span>Call Now</span>
                    </a>

                    <a
                      href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I am contacting you for Indian Visa Assistance.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMobileNavOpen(false)}
                      className="btn-3d-matte-green py-2 px-2 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Backdrop overlay for outside click to close dropdown */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.div
            key="mobile-nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="mobile-dropdown-backdrop md:hidden"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
};
