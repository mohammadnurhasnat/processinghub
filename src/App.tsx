import React, { useEffect, useState } from 'react';
import { VisaService } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { DestinationsSection } from './components/DestinationsSection';
import { CtaStrip } from './components/CtaStrip';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { QuickBookModal } from './components/QuickBookModal';
import { ServiceChecklistModal } from './components/ServiceChecklistModal';
import { WhatsAppProvider } from './context/WhatsAppContext';
import { WhatsAppConfirmModal } from './components/WhatsAppConfirmModal';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import { updateMetaForService } from './utils/metaTags';

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedService, setSelectedService] = useState<VisaService | null>(null);
  const [activeServiceContext, setActiveServiceContext] = useState<VisaService | null>(null);
  const [isForcedChatbotOpen, setIsForcedChatbotOpen] = useState(false);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Dynamically update Open Graph meta tags when a service is opened/focused
  useEffect(() => {
    updateMetaForService(selectedService);
    if (selectedService) {
      setActiveServiceContext(selectedService);
    }
  }, [selectedService]);

  // Lock background scrolling completely when any main modal or drawer is open
  const isAnyModalOpen = Boolean(selectedService || isQuickBookOpen || isMobileNavOpen);
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

    if (isAnyModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAnyModalOpen]);

  return (
    <WhatsAppProvider>
      {/* Navigation Header & Mobile Drawer */}
      <Navbar
        isScrolled={isScrolled}
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
        onOpenQuickBook={() => setIsQuickBookOpen(true)}
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
    </WhatsAppProvider>
  );
}
