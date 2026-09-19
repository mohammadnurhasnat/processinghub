import React, { useEffect } from 'react';
import { 
  Menu, 
  X, 
  PhoneCall, 
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config';

interface NavbarProps {
  isScrolled: boolean;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (isOpen: boolean) => void;
  onOpenQuickBook: () => void;
  onOpenSlotBooking?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isScrolled,
  isMobileNavOpen,
  setIsMobileNavOpen,
  onOpenQuickBook,
  onOpenSlotBooking
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

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>, 
    href: string,
    action?: () => void
  ) => {
    e.preventDefault();
    setIsMobileNavOpen(false);

    if (action) {
      action();
      return;
    }

    // Small delay to allow any mobile transition/render to settle cleanly
    setTimeout(() => {
      if (href === '#' || href === '#hero-section') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const target = document.querySelector(href);
        if (target) {
          const headerOffset = 70;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }, 40);
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
            <a 
              href="#hero-section" 
              id="desktop-link-home"
              onClick={(e) => handleNavClick(e, '#hero-section')}
            >
              Home
            </a>
            <span className="nav-link-separator" aria-hidden="true">|</span>
            <a 
              href="#our-commitment" 
              id="desktop-link-commitment"
              onClick={(e) => handleNavClick(e, '#our-commitment')}
            >
              Our Commitment
            </a>
            <span className="nav-link-separator" aria-hidden="true">|</span>
            <a 
              href="#services" 
              id="desktop-link-services"
              onClick={(e) => handleNavClick(e, '#services')}
            >
              Services
            </a>
            <span className="nav-link-separator" aria-hidden="true">|</span>
            <a 
              href="#destinations" 
              id="desktop-link-destinations"
              onClick={(e) => handleNavClick(e, '#destinations')}
            >
              Destinations
            </a>
            <span className="nav-link-separator" aria-hidden="true">|</span>
            <a 
              href="#services" 
              id="desktop-link-slot-booking"
              onClick={(e) => handleNavClick(e, '#services', onOpenSlotBooking)}
            >
              Slot Booking
            </a>
            <span className="nav-link-separator" aria-hidden="true">|</span>
            <a 
              href="#contact" 
              id="desktop-link-contact"
              onClick={(e) => handleNavClick(e, '#contact')}
            >
              Contact Us
            </a>
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
              <AnimatePresence mode="wait" initial={false}>
                {isMobileNavOpen ? (
                  <motion.span
                    key="close-icon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="flex items-center justify-center"
                  >
                    <X className="w-5 h-5 stroke-[2.2]" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu-icon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="flex items-center justify-center"
                  >
                    <Menu className="w-5 h-5 stroke-[2.2]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>

        {/* MOBILE FLOATING DROPDOWN CARD (MATCHING REFERENCE IMAGE) */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              key="mobile-nav-dropdown"
              id="mobile-nav-dropdown"
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.96 }}
              transition={{ 
                duration: 0.26, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              style={{ willChange: 'transform, opacity' }}
              className="mobile-floating-card md:hidden"
            >
              {/* Centered navigation links */}
              <div className="mobile-card-links">
                <a 
                  href="#hero-section"
                  id="mobile-link-home"
                  onClick={(e) => handleNavClick(e, '#hero-section')}
                  className="mobile-card-link"
                >
                  Home
                </a>

                <div className="mobile-menu-divider" aria-hidden="true" />

                <a 
                  href="#our-commitment"
                  id="mobile-link-commitment"
                  onClick={(e) => handleNavClick(e, '#our-commitment')}
                  className="mobile-card-link"
                >
                  Our Commitment
                </a>

                <div className="mobile-menu-divider" aria-hidden="true" />

                <a 
                  href="#services"
                  id="mobile-link-services"
                  onClick={(e) => handleNavClick(e, '#services')}
                  className="mobile-card-link"
                >
                  Services
                </a>

                <div className="mobile-menu-divider" aria-hidden="true" />

                <a 
                  href="#destinations"
                  id="mobile-link-destinations"
                  onClick={(e) => handleNavClick(e, '#destinations')}
                  className="mobile-card-link"
                >
                  Destinations
                </a>

                <div className="mobile-menu-divider" aria-hidden="true" />

                <a 
                  href="#services"
                  id="mobile-link-slot-booking"
                  onClick={(e) => handleNavClick(e, '#services', onOpenSlotBooking)}
                  className="mobile-card-link"
                >
                  Slot Booking
                </a>

                <div className="mobile-menu-divider" aria-hidden="true" />

                <a 
                  href="#contact"
                  id="mobile-link-contact"
                  onClick={(e) => handleNavClick(e, '#contact')}
                  className="mobile-card-link"
                >
                  Contact Us
                </a>
              </div>

              {/* Secondary Quick Contact Pills */}
              <div className="mobile-card-secondary-row">
                <a
                  href={`tel:${CONFIG.phone}`}
                  id="mobile-call-pill"
                  className="mobile-pill-call"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#374492]" />
                  <span>Call Now</span>
                </a>

                <a
                  href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I am contacting you for Indian Visa Assistance.')}`}
                  id="mobile-whatsapp-pill"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="mobile-pill-whatsapp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
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
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mobile-dropdown-backdrop md:hidden"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
};
