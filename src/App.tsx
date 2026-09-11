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

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedService, setSelectedService] = useState<VisaService | null>(null);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Scroll listener for sticky header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key & background body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedService(null);
        setIsQuickBookOpen(false);
        setIsMobileNavOpen(false);
      }
    };

    if (selectedService || isQuickBookOpen || isMobileNavOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedService, isQuickBookOpen, isMobileNavOpen]);

  return (
    <>
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
      <ServicesSection onOpenModal={(service) => setSelectedService(service)} />

      {/* Popular Travel Routes */}
      <DestinationsSection />

      {/* Urgent Consultation CTA Strip */}
      <CtaStrip />

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />

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
    </>
  );
}
