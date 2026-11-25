import React, { useEffect, useState } from 'react';
import { VisaService } from './types';
import { VISA_SERVICES } from './data/visaData';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { DestinationsSection } from './components/DestinationsSection';
import { CtaStrip } from './components/CtaStrip';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { QuickBookModal } from './components/QuickBookModal';
import { ServiceChecklistModal } from './components/ServiceChecklistModal';
import { WhatsAppProvider, useWhatsApp } from './context/WhatsAppContext';
import { WhatsAppConfirmModal } from './components/WhatsAppConfirmModal';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import { updateMetaForService } from './utils/metaTags';

function matchServiceFromSubject(subject?: string): VisaService | null {
  if (!subject) return null;
  const lower = subject.toLowerCase();
  if (lower.includes('medical') || lower.includes('মেডিকেল') || lower.includes('attendant') || lower.includes('অ্যাটেনডেন্ট')) {
    return VISA_SERVICES.find(s => s.id === 'medical-visa') || null;
  }
  if (lower.includes('tourist') || lower.includes('ট্যুরিস্ট')) {
    return VISA_SERVICES.find(s => s.id === 'tourist-visa') || null;
  }
  if (lower.includes('double') || lower.includes('ডাবল') || lower.includes('ডবল') || lower.includes('x-3')) {
    return VISA_SERVICES.find(s => s.id === 'double-entry-visa') || null;
  }
  if (lower.includes('business') || lower.includes('বিজনেস')) {
    return VISA_SERVICES.find(s => s.id === 'business-visa') || null;
  }
  if (lower.includes('student') || lower.includes('স্টুডেন্ট')) {
    return VISA_SERVICES.find(s => s.id === 'student-visa') || null;
  }
  if (lower.includes('transit') || lower.includes('ট্রানজিট')) {
    return VISA_SERVICES.find(s => s.id === 'transit-visa') || null;
  }
  if (lower.includes('spouse') || lower.includes('স্পাউস') || lower.includes('family') || lower.includes('x-1')) {
    return VISA_SERVICES.find(s => s.id === 'spouse-visa') || null;
  }
  if (lower.includes('entry') || lower.includes('এন্ট্রি') || lower.includes('x-misc')) {
    return VISA_SERVICES.find(s => s.id === 'entry-visa') || null;
  }
  if (lower.includes('slot') || lower.includes('স্লট')) {
    return VISA_SERVICES.find(s => s.id === 'visa-slot-booking' || s.isSlotBooking) || null;
  }
  if (lower.includes('ticket') || lower.includes('টিকেট') || lower.includes('টিকিট')) {
    return VISA_SERVICES.find(s => s.id === 'ticket-booking') || null;
  }
  return null;
}

function AppContent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedService, setSelectedService] = useState<VisaService | null>(null);
  const [activeServiceContext, setActiveServiceContext] = useState<VisaService | null>(null);
  const [isForcedChatbotOpen, setIsForcedChatbotOpen] = useState(false);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const { pendingAgentHandoff } = useWhatsApp();

  // When user clicks "Talk to Agent" from any form, close underlying modals and open chatbot
  useEffect(() => {
    if (pendingAgentHandoff) {
      setSelectedService(null);
      setIsQuickBookOpen(false);
      setIsMobileNavOpen(false);
      const matched = matchServiceFromSubject(pendingAgentHandoff.subject);
      if (matched) {
        setActiveServiceContext(matched);
      }
      setIsForcedChatbotOpen(true);
    }
  }, [pendingAgentHandoff]);

  // Dynamically update Open Graph meta tags when a service is opened/focused
  useEffect(() => {
    updateMetaForService(selectedService);
    if (selectedService) {
      setActiveServiceContext(selectedService);
    }
  }, [selectedService]);

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
        setSelectedService(null);
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

  const handleOpenSlotBooking = () => {
    const slotService = VISA_SERVICES.find(s => s.id === 'visa-slot-booking' || s.isSlotBooking) || VISA_SERVICES[0];
    setSelectedService(slotService);
    setActiveServiceContext(slotService);
  };

  return (
    <>
      {/* Navigation Header & Mobile Drawer */}
      <Navbar
        isScrolled={isScrolled}
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
        onOpenQuickBook={() => setIsQuickBookOpen(true)}
        onOpenSlotBooking={handleOpenSlotBooking}
      />

      {/* Hero Banner */}
      <Hero />

      {/* Visa Services & Packages */}
      <ServicesSection 
        onOpenModal={(service) => {
          setSelectedService(service);
          setActiveServiceContext(service);
        }} 
      />

      {/* Popular Travel Routes */}
      <DestinationsSection />

      {/* Urgent Consultation CTA Strip */}
      <CtaStrip />

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Action Button with dynamic service context */}
      <FloatingWhatsApp 
        serviceContext={activeServiceContext}
        onClearServiceContext={() => setActiveServiceContext(null)}
        isChatbotForcedOpen={isForcedChatbotOpen}
        onCloseForcedChatbot={() => setIsForcedChatbotOpen(false)}
      />

      {/* Quick Booking Service List & Callback Modal */}
      <QuickBookModal
        isOpen={isQuickBookOpen}
        onClose={() => setIsQuickBookOpen(false)}
      />

      {/* Service Details & Document Checklist Modal */}
      <ServiceChecklistModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />

      {/* WhatsApp Confirmation & Redirection Popup Modal */}
      <WhatsAppConfirmModal />
    </>
  );
}

export default function App() {
  return (
    <WhatsAppProvider>
      <AppContent />
    </WhatsAppProvider>
  );
}
