import React, { Suspense, lazy, useEffect, useMemo, useState, useCallback } from 'react';
import { VisaService } from './types';
import { getVisaServices } from './data/visaData';
import { Navbar, PageRoute } from './components/Navbar';
import { Hero } from './components/Hero';
import { HeroExtensionBar } from './components/ExtensionSpotlightBanner';
import { ServicesSection } from './components/ServicesSection';
import { SlotBookingInlineSection } from './components/SlotBookingInlineSection';
import type { VisaToolTab } from './components/VisaToolsHub';
import { CtaStrip } from './components/CtaStrip';
import { Footer } from './components/Footer';
import { WhatsAppProvider, useWhatsApp } from './context/WhatsAppContext';
import { Language, LanguageProvider, useLanguage } from './context/LanguageContext';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import { updateMetaForService } from './utils/metaTags';
import { CONFIG } from './config';

// Route-level & modal-level lazy code splitting for fast initial page load
const VisaToolsHub = lazy(() =>
  import('./components/VisaToolsHub').then((m) => ({ default: m.VisaToolsHub }))
);
const DestinationsSection = lazy(() =>
  import('./components/DestinationsSection').then((m) => ({ default: m.DestinationsSection }))
);
const IvacCentersAndFaqSection = lazy(() =>
  import('./components/IvacCentersAndFaqSection').then((m) => ({ default: m.IvacCentersAndFaqSection }))
);
const GoogleBusinessMapSection = lazy(() =>
  import('./components/GoogleBusinessMapSection').then((m) => ({ default: m.GoogleBusinessMapSection }))
);
const AboutUsSection = lazy(() =>
  import('./components/AboutUsSection').then((m) => ({ default: m.AboutUsSection }))
);
const FloatingWhatsApp = lazy(() =>
  import('./components/FloatingWhatsApp').then((m) => ({ default: m.FloatingWhatsApp }))
);
const QuickBookModal = lazy(() =>
  import('./components/QuickBookModal').then((m) => ({ default: m.QuickBookModal }))
);
const ServiceChecklistModal = lazy(() =>
  import('./components/ServiceChecklistModal').then((m) => ({ default: m.ServiceChecklistModal }))
);
const WhatsAppConfirmModal = lazy(() =>
  import('./components/WhatsAppConfirmModal').then((m) => ({ default: m.WhatsAppConfirmModal }))
);

const PageSectionFallback: React.FC = () => (
  <div className="w-full max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-[#BAC5FA] border-t-[#263375] animate-spin" />
  </div>
);

function matchServiceFromSubject(subject: string | undefined, language: Language): VisaService | null {
  if (!subject) return null;
  const services = getVisaServices(language);
  const lower = subject.toLowerCase();
  if (lower.includes('স্লট বুকিং') || lower.includes('slot booking')) {
    return services.find(s => s.id === 'visa-slot-booking' || s.isSlotBooking) || null;
  }
  if (lower.includes('mofa') || lower.includes('notary') || lower.includes('নোটারি') || lower.includes('সত্যায়ন') || lower.includes('translation') || lower.includes('অনুবাদ')) {
    return services.find(s => s.id === 'mofa-notary-translation') || null;
  }
  if (lower.includes('pickup') || lower.includes('পিকআপ') || lower.includes('hospital cost') || lower.includes('হাসপাতাল খরচ')) {
    return services.find(s => s.id === 'medical-cost-airport-pickup') || null;
  }
  if (lower.includes('hotel') || lower.includes('হোটেল') || lower.includes('train') || lower.includes('ট্রেন') || lower.includes('বাস')) {
    return services.find(s => s.id === 'hotel-rail-bus-package') || null;
  }
  if (lower.includes('medical') || lower.includes('মেডিকেল') || lower.includes('attendant') || lower.includes('অ্যাটেনডেন্ট')) {
    return services.find(s => s.id === 'medical-visa') || null;
  }
  if (lower.includes('tourist') || lower.includes('ট্যুরিস্ট')) {
    return services.find(s => s.id === 'tourist-visa') || null;
  }
  if (lower.includes('double') || lower.includes('ডাবল') || lower.includes('ডবল') || lower.includes('x-3')) {
    return services.find(s => s.id === 'double-entry-visa') || null;
  }
  if (lower.includes('business') || lower.includes('বিজনেস')) {
    return services.find(s => s.id === 'business-visa') || null;
  }
  if (lower.includes('student') || lower.includes('স্টুডেন্ট')) {
    return services.find(s => s.id === 'student-visa') || null;
  }
  if (lower.includes('transit') || lower.includes('ট্রানজিট')) {
    return services.find(s => s.id === 'transit-visa') || null;
  }
  if (lower.includes('spouse') || lower.includes('স্পাউস') || lower.includes('family') || lower.includes('x-1')) {
    return services.find(s => s.id === 'spouse-visa') || null;
  }
  if (lower.includes('entry') || lower.includes('এন্ট্রি') || lower.includes('x-misc')) {
    return services.find(s => s.id === 'entry-visa') || null;
  }
  if (lower.includes('slot') || lower.includes('স্লট')) {
    return services.find(s => s.id === 'visa-slot-booking' || s.isSlotBooking) || null;
  }
  if (lower.includes('ticket') || lower.includes('টিকেট') || lower.includes('টিকিট')) {
    return services.find(s => s.id === 'ticket-booking') || null;
  }
  return null;
}

const VALID_TOOL_TABS: VisaToolTab[] = ['calculator', 'photo', 'quiz'];

const PAGE_TO_PATH: Record<PageRoute, string> = {
  home: '/',
  services: '/services',
  destinations: '/destinations',
  slots: '/slots',
  about: '/about',
  contact: '/contact',
};

function resolvePageFromLocation(): PageRoute {
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  if (path === '/services') return 'services';
  if (path === '/destinations') return 'destinations';
  if (path === '/slots') return 'slots';
  if (path === '/about') return 'about';
  if (path === '/contact') return 'contact';

  const hash = window.location.hash.replace(/^#/, '').trim().toLowerCase();
  if (hash === 'services') return 'services';
  if (hash === 'destinations') return 'destinations';
  if (hash === 'slots' || hash === 'tools' || hash === 'faq') return 'slots';
  if (hash === 'about') return 'about';
  if (hash === 'contact') return 'contact';

  return 'home';
}

function AppContent() {
  const { language, t } = useLanguage();
  const services = getVisaServices(language);

  const [activePage, setActivePage] = useState<PageRoute>(() => resolvePageFromLocation());
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [activeServiceContextId, setActiveServiceContextId] = useState<string | null>(null);
  const [isForcedChatbotOpen, setIsForcedChatbotOpen] = useState(false);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<VisaToolTab>('calculator');
  const [deepLinkHospitalQuery, setDeepLinkHospitalQuery] = useState<string>('');
  const [deepLinkDestinationQuery, setDeepLinkDestinationQuery] = useState<string>('');
  const [deepLinkFaqIdx, setDeepLinkFaqIdx] = useState<number | null>(null);
  const [isMapsQuotaExceeded, setIsMapsQuotaExceeded] = useState<boolean>(false);

  const { pendingAgentHandoff } = useWhatsApp();

  const selectedService = useMemo(
    () => (selectedServiceId ? services.find((s) => s.id === selectedServiceId) || null : null),
    [services, selectedServiceId]
  );

  const activeServiceContext = useMemo(
    () => (activeServiceContextId ? services.find((s) => s.id === activeServiceContextId) || null : null),
    [services, activeServiceContextId]
  );

  const slotService = useMemo(
    () => services.find((s) => s.id === 'visa-slot-booking' || s.isSlotBooking) || services[0],
    [services]
  );

  const handleNavigatePage = useCallback((page: PageRoute) => {
    setActivePage(page);
    setIsMobileNavOpen(false);
    try {
      const targetPath = PAGE_TO_PATH[page] || '/';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ page }, '', targetPath);
      }
    } catch {
      // ignore iframe history constraint
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen for Case A Google Maps demo quota exceeded warning
  useEffect(() => {
    const onQuotaExceeded = () => setIsMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  // Deep-link synchronization for pathname, ?service=, #<service-id>, ?tool=, and ?q=
  useEffect(() => {
    const syncFromUrl = () => {
      try {
        const resolvedPage = resolvePageFromLocation();
        setActivePage(resolvedPage);

        const params = new URLSearchParams(window.location.search);
        const hashId = window.location.hash.replace(/^#/, '').trim();
        const serviceParam = params.get('service')?.trim();
        const toolParam = params.get('tool')?.trim() as VisaToolTab | undefined;
        const searchQ = params.get('q')?.trim();

        const targetServiceId = serviceParam || hashId;
        if (targetServiceId) {
          const allServices = getVisaServices(language);
          const matchedService = allServices.find((s) => s.id === targetServiceId);
          if (matchedService) {
            setSelectedServiceId(matchedService.id);
            setActiveServiceContextId(matchedService.id);
          }
        }

        if (toolParam && VALID_TOOL_TABS.includes(toolParam)) {
          setActivePage('slots');
          setActiveToolTab(toolParam);
          setTimeout(() => {
            document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
          }, 120);
        }

        if (searchQ) {
          setActivePage('destinations');
          setDeepLinkHospitalQuery(searchQ);
          setTimeout(() => {
            document.getElementById('hospital-search-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 180);
        }
      } catch {
        // Ignore malformed URLs
      }
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('hashchange', syncFromUrl);
    };
  }, [language]);

  // When user clicks "Talk to Agent" from any form, close underlying modals and open chatbot
  useEffect(() => {
    if (pendingAgentHandoff) {
      setSelectedServiceId(null);
      setIsQuickBookOpen(false);
      setIsMobileNavOpen(false);
      const matched = matchServiceFromSubject(pendingAgentHandoff.subject, language);
      if (matched) {
        setActiveServiceContextId(matched.id);
      }
      setIsForcedChatbotOpen(true);
    }
  }, [pendingAgentHandoff, language]);

  // Dynamically update Open Graph meta tags when a service or language changes
  useEffect(() => {
    updateMetaForService(selectedService, language);
    if (selectedService) {
      setActiveServiceContextId(selectedService.id);
    }
  }, [selectedService, language]);

  // Lock background scrolling completely when main full-screen modals are open
  const isAnyModalOpen = Boolean(selectedService || isQuickBookOpen);
  useBodyScrollLock(isAnyModalOpen);

  // Scroll listener for sticky header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedServiceId(null);
        setIsQuickBookOpen(false);
        setIsMobileNavOpen(false);
      }
    };

    if (isAnyModalOpen || isMobileNavOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAnyModalOpen, isMobileNavOpen]);

  const handleJumpToTools = (tab: VisaToolTab = 'calculator') => {
    setActiveToolTab(tab);
    handleNavigatePage('slots');
    setTimeout(() => {
      document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Global Search Bar result handlers
  const handleSelectSearchService = useCallback((service: VisaService) => {
    setSelectedServiceId(service.id);
    setActiveServiceContextId(service.id);
  }, []);

  const handleSelectSearchDestination = useCallback(
    (destQuery: string) => {
      setDeepLinkDestinationQuery(destQuery);
      handleNavigatePage('destinations');
      setTimeout(() => {
        document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    },
    [handleNavigatePage]
  );

  const handleSelectSearchHospital = useCallback(
    (hospQuery: string) => {
      setDeepLinkHospitalQuery(hospQuery);
      handleNavigatePage('destinations');
      setTimeout(() => {
        document.getElementById('hospital-search-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 140);
    },
    [handleNavigatePage]
  );

  const handleSelectSearchFaq = useCallback(
    (faqIdx: number) => {
      setDeepLinkFaqIdx(faqIdx);
      handleNavigatePage('slots');
      setTimeout(() => {
        document.getElementById(`faq-item-${faqIdx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 160);
    },
    [handleNavigatePage]
  );

  const handleSelectSearchIvac = useCallback(() => {
    handleNavigatePage('slots');
    setTimeout(() => {
      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 140);
  }, [handleNavigatePage]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Google Maps Demo Quota Warning Banner */}
      {isMapsQuotaExceeded && (
        <div
          role="alert"
          className="sticky top-0 z-[100] w-full bg-amber-100 border-b border-amber-300 text-amber-950 px-4 py-2 text-xs flex flex-wrap items-center justify-center gap-2 text-center"
        >
          <span>
            {t(
              'Google Maps দৈনিক কোটা বা কী সীমা পূর্ণ হয়েছে — বিকল্প স্ট্যাটিক ম্যাপ কার্ড প্রদর্শিত হচ্ছে।',
              'Google Maps API quota limit reached — displaying office location fallback card.'
            )}
          </span>
          <a
            href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline text-amber-900"
          >
            {t('বিস্তারিত দেখুন', 'Learn more')}
          </a>
        </div>
      )}

      {/* Navigation Header, Middle Advanced Global Search & Compact Mobile Drawer */}
      <Navbar
        isScrolled={isScrolled}
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
        activePage={activePage}
        onNavigatePage={handleNavigatePage}
        onOpenQuickBook={() => setIsQuickBookOpen(true)}
        onSelectSearchService={handleSelectSearchService}
        onSelectSearchDestination={handleSelectSearchDestination}
        onSelectSearchHospital={handleSelectSearchHospital}
        onSelectSearchFaq={handleSelectSearchFaq}
        onSelectSearchIvac={handleSelectSearchIvac}
      />

      {/* PAGE CONTENT ROUTER */}
      <main className="flex-1">
        {/* 1. HOME PAGE (/) */}
        {activePage === 'home' && (
          <>
            <Hero />
            <HeroExtensionBar onJumpToTools={() => handleJumpToTools('calculator')} />
            <ServicesSection
              previewLimit={6}
              onViewAllServices={() => handleNavigatePage('services')}
              onOpenModal={(service) => {
                setSelectedServiceId(service.id);
                setActiveServiceContextId(service.id);
              }}
            />
            <CtaStrip />
          </>
        )}

        {/* 2. SERVICES PAGE (/services) */}
        {activePage === 'services' && (
          <div className="pt-20 sm:pt-24">
            <ServicesSection
              onOpenModal={(service) => {
                setSelectedServiceId(service.id);
                setActiveServiceContextId(service.id);
              }}
            />
            <CtaStrip />
          </div>
        )}

        {/* 3. DESTINATIONS PAGE (/destinations) */}
        {activePage === 'destinations' && (
          <div className="pt-20 sm:pt-24">
            <Suspense fallback={<PageSectionFallback />}>
              <DestinationsSection
                externalSearchQuery={deepLinkHospitalQuery}
                externalDestinationQuery={deepLinkDestinationQuery}
                onClearExternalDestinationQuery={() => setDeepLinkDestinationQuery('')}
              />
            </Suspense>
            <CtaStrip />
          </div>
        )}

        {/* 4. SLOTS PAGE (/slots) */}
        {activePage === 'slots' && (
          <div className="pt-28 sm:pt-32 pb-8 space-y-6">
            {/* Full Expanded Visa Slot Booking & Checklist Section (Inline, no Slot & Checklist popup button) */}
            <SlotBookingInlineSection service={slotService} />

            {/* Smart Interactive Visa Tools Hub & Chrome Extension Spotlight */}
            <Suspense fallback={<PageSectionFallback />}>
              <VisaToolsHub
                activeTab={activeToolTab}
                onTabChange={setActiveToolTab}
              />

              {/* IVAC Centers & Visible FAQ Accordion */}
              <IvacCentersAndFaqSection externalOpenFaqIdx={deepLinkFaqIdx} />
            </Suspense>
          </div>
        )}

        {/* 5. ABOUT US PAGE (/about) */}
        {activePage === 'about' && (
          <Suspense fallback={<PageSectionFallback />}>
            <AboutUsSection
              onNavigateServices={() => handleNavigatePage('services')}
              onNavigateContact={() => handleNavigatePage('contact')}
            />
          </Suspense>
        )}

        {/* 6. CONTACT PAGE (/contact) */}
        {activePage === 'contact' && (
          <div className="pt-28 sm:pt-32 pb-12 space-y-8">
            <div className="w-full max-w-6xl mx-auto px-4 text-center max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E743B] bg-[#EBF7EE] px-3 py-1 rounded-full border border-[#CDE5D5]">
                {t('অফিসের ঠিকানা ও যোগাযোগ', 'Office Location & Contact')}
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold text-[#161D28] tracking-tight mt-3">
                {t('আমাদের সাপোর্ট ডেস্ক ও গুগল ম্যাপ লোকেশন', 'Visit Our Support Desk or Contact Us Directly')}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[#4A5545] mt-2">
                {t(
                  'যমুনা ফিউচার পার্ক সংলগ্ন আমাদের অফিসে সরাসরি এসে কিংবা ফোন ও হোয়াটসঅ্যাপের মাধ্যমে আপনার ভিসা ফাইল প্রসেসিং ও স্লট বুকিং সম্পন্ন করুন।',
                  'Visit our support desk near Jamuna Future Park or reach out via phone and WhatsApp for Indian visa processing and slot booking.'
                )}
              </p>
            </div>

            <Suspense fallback={<PageSectionFallback />}>
              <GoogleBusinessMapSection />
            </Suspense>
          </div>
        )}
      </main>

      {/* Universal Classic Minimalist Footer across all pages */}
      <Footer />

      {/* Deferred Floating Support Widget & On-Demand Modals */}
      <Suspense fallback={null}>
        <FloatingWhatsApp
          serviceContext={activeServiceContext}
          onClearServiceContext={() => setActiveServiceContextId(null)}
          isChatbotForcedOpen={isForcedChatbotOpen}
          onCloseForcedChatbot={() => setIsForcedChatbotOpen(false)}
        />

        {isQuickBookOpen && (
          <QuickBookModal
            isOpen={isQuickBookOpen}
            onClose={() => setIsQuickBookOpen(false)}
          />
        )}

        {selectedService && (
          <ServiceChecklistModal
            service={selectedService}
            onClose={() => setSelectedServiceId(null)}
          />
        )}

        <WhatsAppConfirmModal />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <WhatsAppProvider>
        <AppContent />
      </WhatsAppProvider>
    </LanguageProvider>
  );
}
