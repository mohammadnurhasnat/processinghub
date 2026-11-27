import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  Menu,
  X,
  PhoneCall,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config';
import { useLanguage } from '../context/LanguageContext';
import { VisaService } from '../types';

const LazyGlobalSearchBar = lazy(() =>
  import('./GlobalSearchBar').then((m) => ({ default: m.GlobalSearchBar }))
);

export type PageRoute = 'home' | 'services' | 'destinations' | 'slots' | 'about' | 'contact';

interface NavbarProps {
  isScrolled: boolean;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (isOpen: boolean) => void;
  activePage: PageRoute;
  onNavigatePage: (page: PageRoute) => void;
  onOpenQuickBook: () => void;
  onSelectSearchService: (service: VisaService) => void;
  onSelectSearchDestination: (destQuery: string) => void;
  onSelectSearchHospital: (hospQuery: string) => void;
  onSelectSearchFaq: (faqIdx: number) => void;
  onSelectSearchIvac: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isScrolled,
  isMobileNavOpen,
  setIsMobileNavOpen,
  activePage,
  onNavigatePage,
  onOpenQuickBook,
  onSelectSearchService,
  onSelectSearchDestination,
  onSelectSearchHospital,
  onSelectSearchFaq,
  onSelectSearchIvac,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const handlePageSelect = (
    e: React.MouseEvent<HTMLAnchorElement>,
    page: PageRoute
  ) => {
    e.preventDefault();
    setIsMobileNavOpen(false);
    setIsSearchOpen(false);
    onNavigatePage(page);
  };

  const handleToggleSearch = () => {
    setIsMobileNavOpen(false);
    setIsSearchOpen((prev) => !prev);
  };

  const handleToggleMobileNav = () => {
    setIsSearchOpen(false);
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const navLabels = {
    home: t('হোম', 'Home'),
    services: t('সেবাসমূহ', 'Services'),
    destinations: t('গন্তব্য', 'Destinations'),
    slots: t('স্লট', 'Slots'),
    about: t('আমাদের সম্পর্কে', 'About Us'),
    contact: t('যোগাযোগ', 'Contact'),
    cta: t('বুকিং করুন', 'Book Now'),
    callNow: t('কল করুন', 'Call'),
    whatsapp: t('হোয়াটসঅ্যাপ', 'WhatsApp'),
    searchPlaceholder: t('খুঁজুন...', 'Search...'),
  };

  const menuItems: Array<{ page: PageRoute; href: string; label: string; id: string }> = [
    { page: 'home', href: '/', label: navLabels.home, id: 'home' },
    { page: 'services', href: '/services', label: navLabels.services, id: 'services' },
    { page: 'destinations', href: '/destinations', label: navLabels.destinations, id: 'destinations' },
    { page: 'slots', href: '/slots', label: navLabels.slots, id: 'slots' },
    { page: 'about', href: '/about', label: navLabels.about, id: 'about' },
    { page: 'contact', href: '/contact', label: navLabels.contact, id: 'contact' },
  ];

  const isHeaderSolid = isScrolled || activePage !== 'home';

  return (
    <>
      {/* HEADER & TOP NAVBAR */}
      <header className={`site-header ${isHeaderSolid ? 'scrolled' : ''} ${isMobileNavOpen ? 'menu-open' : ''}`}>
        <nav id="mainNav" className={isHeaderSolid ? 'scrolled' : ''}>
          {/* Left: Brand Logo */}
          <a
            href="/"
            id="brand-logo"
            className="brand-btn"
            onClick={(e) => handlePageSelect(e, 'home')}
            title={CONFIG.brandName}
          >
            <span className="brand-text">{CONFIG.brandName}</span>
          </a>

          {/* MIDDLE ZONE — Desktop Nav Capsule + Middle 5px Global Search Trigger */}
          <div className="nav-menu-capsule-wrapper gap-2.5">
            <div className="nav-menu-capsule">
              {menuItems.map((item, idx) => {
                const isActive = activePage === item.page;
                return (
                  <React.Fragment key={item.page}>
                    {idx > 0 && (
                      <span className="nav-capsule-separator" aria-hidden="true">|</span>
                    )}
                    <a
                      href={item.href}
                      id={`desktop-link-${item.id}`}
                      aria-current={isActive ? 'page' : undefined}
                      className={`nav-capsule-item ${
                        isActive
                          ? '!bg-[#263375] !text-white !border-[#1C275F] shadow-sm'
                          : ''
                      }`}
                      onClick={(e) => handlePageSelect(e, item.page)}
                    >
                      {item.label}
                    </a>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Desktop Middle Global Search Button (5px border radius) */}
            <button
              type="button"
              id="desktop-global-search-btn"
              onClick={handleToggleSearch}
              aria-expanded={isSearchOpen}
              aria-label={t('গ্লোবাল সার্চ খুলুন', 'Open global search')}
              className={`w-fit inline-flex items-center gap-1.5 px-2.5 py-1.5 leading-tight rounded-[5px] text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isSearchOpen
                  ? 'bg-[#263375] text-white border-[#1C275F] shadow-xs'
                  : 'bg-white/90 hover:bg-white text-[#263375] border-[#BAC5FA] shadow-2xs'
              }`}
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span>{navLabels.searchPlaceholder}</span>
            </button>
          </div>

          {/* Mobile Middle Global Search Trigger (positioned cleanly in the middle of mobile top bar, 5px radius) */}
          <div className="flex md:hidden items-center justify-center flex-1 px-1">
            <button
              type="button"
              id="mobile-global-search-btn"
              onClick={handleToggleSearch}
              aria-expanded={isSearchOpen}
              aria-label={t('গ্লোবাল সার্চ খুলুন', 'Open global search')}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 h-[28px] w-full max-w-[118px] rounded-[5px] text-[11.5px] leading-none font-semibold border transition-all cursor-pointer ${
                isSearchOpen
                  ? 'bg-[#263375] text-white border-[#1C275F]'
                  : 'bg-[#F4F6FF] hover:bg-[#E7ECFF] text-[#374492] border-[#BAC5FA]'
              }`}
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{navLabels.searchPlaceholder}</span>
            </button>
          </div>

          {/* Right: Language (desktop), Slim Compact Book Now, Animated Multicolor Border Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop Top-Nav Language Switcher (Icon-free, matched 6px/5px radius: বাং | EN) */}
            <div
              id="desktop-language-toggle"
              role="group"
              aria-label={t('ভাষা নির্বাচন করুন', 'Select language')}
              className="hidden md:inline-flex items-center gap-0.5 p-0.5 rounded-[6px] bg-white/85 backdrop-blur-md border border-[#BAC5FA] shadow-xs shrink-0"
            >
              <button
                type="button"
                id="desktop-lang-bn"
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 rounded-[5px] text-xs font-bold leading-none whitespace-nowrap transition-all cursor-pointer ${
                  language === 'bn'
                    ? 'bg-[#263375] text-white shadow-xs'
                    : 'text-[#263375] hover:bg-[#EEF1FE]'
                }`}
                aria-pressed={language === 'bn'}
              >
                বাং
              </button>
              <button
                type="button"
                id="desktop-lang-en"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-[5px] text-xs font-bold leading-none whitespace-nowrap transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#263375] text-white shadow-xs'
                    : 'text-[#263375] hover:bg-[#EEF1FE]'
                }`}
                aria-pressed={language === 'en'}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              id="nav-cta-btn"
              className="nav-cta cursor-pointer border-0 whitespace-nowrap shrink-0"
              onClick={() => {
                setIsSearchOpen(false);
                setIsMobileNavOpen(false);
                onOpenQuickBook();
              }}
            >
              {navLabels.cta}
            </button>

            {/* Animated Multi-Color Moving Border Wrapper around Mobile Hamburger Button */}
            <div className="hamburger-rainbow-wrap md:hidden">
              <button
                type="button"
                id="mobile-nav-toggle-btn"
                className="mobile-nav-toggle"
                onClick={handleToggleMobileNav}
                aria-expanded={isMobileNavOpen}
                aria-label={
                  isMobileNavOpen
                    ? t('মোবাইল মেনু বন্ধ করুন', 'Close mobile menu')
                    : t('মোবাইল মেনু খুলুন', 'Open mobile menu')
                }
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMobileNavOpen ? (
                    <motion.span
                      key="close-icon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="flex items-center justify-center"
                    >
                      <X className="w-4 h-4 stroke-[2.3]" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu-icon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="flex items-center justify-center"
                    >
                      <Menu className="w-4 h-4 stroke-[2.3]" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </nav>

        {/* EXPANDABLE ADVANCED GLOBAL SEARCH PANEL (Lazy-loaded on first open) */}
        {isSearchOpen && (
          <Suspense fallback={null}>
            <LazyGlobalSearchBar
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onSelectService={onSelectSearchService}
              onSelectDestination={onSelectSearchDestination}
              onSelectHospital={onSelectSearchHospital}
              onSelectFaq={onSelectSearchFaq}
              onSelectIvac={onSelectSearchIvac}
            />
          </Suspense>
        )}

        {/* COMPACT RIGHT-ALIGNED AUTO-FIT MOBILE FLOATING DROPDOWN (Directly under Hamburger) */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <div className="mobile-dropdown-anchor md:hidden">
              <motion.div
                key="mobile-nav-dropdown"
                id="mobile-nav-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1]
                }}
                style={{ willChange: 'transform, opacity' }}
                className="mobile-floating-card"
              >
                {/* Single-Column Serial Right-Aligned Text-Adjustable Page Links */}
                <div className="mobile-card-list">
                  {menuItems.map((item) => {
                    const isActive = activePage === item.page;
                    return (
                      <a
                        key={item.page}
                        href={item.href}
                        id={`mobile-link-${item.id}`}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={(e) => handlePageSelect(e, item.page)}
                        className={`mobile-card-link ${
                          isActive
                            ? '!bg-[#263375] !text-white !border-[#1C275F] shadow-2xs'
                            : ''
                        }`}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </div>

                <div className="mobile-menu-divider" aria-hidden="true" />

                {/* Centered, Matched-Corner, Icon-Free Language Switcher (বাং | EN) */}
                <div
                  id="mobile-language-toggle"
                  role="group"
                  aria-label={t('ভাষা পরিবর্তন', 'Switch language')}
                  className="inline-flex items-center gap-0.5 p-0.5 rounded-[6px] bg-[#EEF1FE] border border-[#BAC5FA] w-fit mx-auto"
                >
                  <button
                    type="button"
                    id="mobile-lang-bn"
                    onClick={() => setLanguage('bn')}
                    className={`py-1.5 px-2.5 rounded-[5px] text-[11.5px] leading-none font-bold inline-flex items-center justify-center transition-all cursor-pointer ${
                      language === 'bn'
                        ? 'bg-[#263375] text-white shadow-2xs'
                        : 'text-[#263375] hover:bg-white/70'
                    }`}
                    aria-pressed={language === 'bn'}
                  >
                    বাং
                  </button>
                  <button
                    type="button"
                    id="mobile-lang-en"
                    onClick={() => setLanguage('en')}
                    className={`py-1.5 px-2.5 rounded-[5px] text-[11.5px] leading-none font-bold inline-flex items-center justify-center transition-all cursor-pointer ${
                      language === 'en'
                        ? 'bg-[#263375] text-white shadow-2xs'
                        : 'text-[#263375] hover:bg-white/70'
                    }`}
                    aria-pressed={language === 'en'}
                  >
                    EN
                  </button>
                </div>

                {/* Side-by-Side Centered Icon-Only Contact Actions (Call + Authentic WhatsApp Icon) */}
                <div className="mobile-card-secondary-row">
                  <a
                    href={`tel:${CONFIG.phone}`}
                    id="mobile-call-pill"
                    className="mobile-pill-call"
                    aria-label={navLabels.callNow}
                    title={navLabels.callNow}
                  >
                    <PhoneCall className="w-4 h-4 text-[#374492] shrink-0" />
                  </a>

                  <a
                    href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I am contacting you for Indian Visa Assistance.')}`}
                    id="mobile-whatsapp-pill"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="mobile-pill-whatsapp"
                    aria-label={navLabels.whatsapp}
                    title={navLabels.whatsapp}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
                      <path d="M17.6 6.32A7.85 7.85 0 0 0 12.02 4C7.66 4 4.13 7.53 4.13 11.89c0 1.4.37 2.76 1.06 3.96L4 20l4.27-1.12a7.9 7.9 0 0 0 3.75.95h.01c4.36 0 7.89-3.53 7.89-7.89 0-2.11-.82-4.09-2.32-5.62zm-5.58 12.1h-.01a6.55 6.55 0 0 1-3.34-.92l-.24-.14-2.49.65.67-2.43-.16-.25a6.56 6.56 0 0 1-1.01-3.5c0-3.63 2.96-6.58 6.6-6.58 1.76 0 3.42.69 4.66 1.94a6.55 6.55 0 0 1 1.93 4.65c0 3.63-2.96 6.58-6.61 6.58zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.5.64-.62.77-.11.13-.23.14-.42.05-.2-.1-.83-.31-1.58-.98-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.11.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.33-.11-.01-.24-.01-.37-.01s-.35.05-.53.25c-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.41 2.15 3.42 3.02.48.21.85.33 1.14.42.48.15.92.13 1.26.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24z" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            </div>
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
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mobile-dropdown-backdrop md:hidden"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
};
