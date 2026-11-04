import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WhatsAppRedirectConfig {
  url?: string;
  title?: string;
  subtitle?: string;
  serviceTitle?: string;
  sectionName?: string;
  sourceId?: string;
}

interface WhatsAppContextType {
  openWhatsAppModal: (config: WhatsAppRedirectConfig | string) => void;
  closeWhatsAppModal: () => void;
  redirectData: WhatsAppRedirectConfig | null;
  isOpen: boolean;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

// Helper to determine accurate Bengali contextual service subject
export const detectServiceSubject = (target: HTMLElement, url: string): { title: string; serviceTitle: string; sectionName: string } => {
  const customService = target.getAttribute('data-service-name') || target.getAttribute('data-whatsapp-service');
  const customTitle = target.getAttribute('data-whatsapp-title');
  const sectionAttr = target.getAttribute('data-section');

  if (customService) {
    return {
      title: customTitle || 'WhatsApp পরামর্শ',
      serviceTitle: customService,
      sectionName: sectionAttr || 'সেবা সেকশন'
    };
  }

  let textParam = '';
  try {
    const urlObj = new URL(url);
    textParam = decodeURIComponent(urlObj.searchParams.get('text') || '');
  } catch {
    textParam = url;
  }

  const lower = textParam.toLowerCase();

  // Find parent container context if available
  const heroContainer = target.closest('#hero-section, .hero');
  const servicesContainer = target.closest('#services-section, #visa-categories');
  const destinationsContainer = target.closest('#destinations-section, #places-section');
  const navbarContainer = target.closest('header, nav, #main-navbar');
  const footerContainer = target.closest('footer');
  const floatingContainer = target.closest('#floating-whatsapp-btn');

  if (lower.includes('tourist visa') || lower.includes('ট্যুরিস্ট')) {
    return {
      title: 'ট্যুরিস্ট ভিসা কনসালটেশন',
      serviceTitle: 'ট্যুরিস্ট ভিসা প্রসেসিং ও ডকুমেন্টেশন',
      sectionName: 'ট্যুরিস্ট ভিসা ক্যাটাগরি'
    };
  }

  if (lower.includes('medical visa') || lower.includes('মেডিকেল') || lower.includes('hospital') || lower.includes('ডাক্তার')) {
    return {
      title: 'মেডিকেল ভিসা ও হাসপাতাল সেবা',
      serviceTitle: 'মেডিকেল ভিসা প্রসেসিং ও ইনভাইটেশন লেটার সহায়তা',
      sectionName: 'মেডিকেল ভিসা সেবা'
    };
  }

  if (lower.includes('business visa') || lower.includes('বিজনেস') || lower.includes('বাণিজ্যিক')) {
    return {
      title: 'বিজনেস ভিসা কনসালটেশন',
      serviceTitle: 'বিজনেস ভিসা প্রসেসিং ও স্পন্সর লেটার যাচাই',
      sectionName: 'বিজনেস ভিসা সেবা'
    };
  }

  if (lower.includes('double entry') || lower.includes('ডবল এন্ট্রি') || lower.includes('ডাবল')) {
    return {
      title: 'ডবল এন্ট্রি ভিসা সেবা',
      serviceTitle: 'ডবল এন্ট্রি ভিসা প্রসেসিং ও রুট প্ল্যানিং',
      sectionName: 'ডবল এন্ট্রি ভিসা'
    };
  }

  if (lower.includes('ticket') || lower.includes('flight') || lower.includes('train') || lower.includes('টিকেট')) {
    return {
      title: 'টিকেট বুকিং সার্ভিস',
      serviceTitle: 'ইন্ডিয়ান ট্রেন / ফ্লাইট টিকেট বুকিং সহায়তা',
      sectionName: 'টিকেট বুকিং সার্ভিস'
    };
  }

  if (lower.includes('slot') || lower.includes('appointment') || lower.includes('স্লট')) {
    return {
      title: 'ভিসা অ্যাপয়েন্টমেন্ট স্লট',
      serviceTitle: 'ভিসা অ্যাপয়েন্টমেন্ট স্লট বুকিং ও শিডিউলিং',
      sectionName: 'ভিসা স্লট সার্ভিস'
    };
  }

  if (heroContainer || lower.includes('free consultation') || lower.includes('পরামর্শ')) {
    return {
      title: 'ফ্রি ভিসা কনসালটেশন',
      serviceTitle: 'ফ্রি ভিসা পরামর্শ ও প্রাথমিক ফাইল যাচাই',
      sectionName: 'হিরো সেকশন'
    };
  }

  if (floatingContainer) {
    return {
      title: 'তাৎক্ষণিক WhatsApp সহায়তা',
      serviceTitle: 'সাধারণ অনুসন্ধান ও তাৎক্ষণিক সহায়তা',
      sectionName: 'ফ্লোটিং সাপোর্ট'
    };
  }

  if (navbarContainer) {
    return {
      title: 'ভিসা কনসালটেশন ও সাপোর্ট',
      serviceTitle: 'জরুরি ভিসা কনসালটেশন ও ফাইল ওপেনিং',
      sectionName: 'হেডার নেভিগেশন'
    };
  }

  if (destinationsContainer || lower.includes('destination') || lower.includes('tour')) {
    return {
      title: 'ট্যুর ও ট্রাভেল গাইড',
      serviceTitle: 'ট্রাভেল প্যাকেজ ও হোটেল বুকিং পরামর্শ',
      sectionName: 'ভ্রমণ গন্তব্য সেকশন'
    };
  }

  if (footerContainer) {
    return {
      title: 'কাস্টমার সাপোর্ট ও হেল্পডেস্ক',
      serviceTitle: 'সাধারণ কাস্টমার সাপোর্ট ও অনুসন্ধান',
      sectionName: 'ফুটার সেকশন'
    };
  }

  if (servicesContainer) {
    return {
      title: 'ভিসা সার্ভিস পরামর্শ',
      serviceTitle: 'ভিসা প্রসেসিং সেবা ও গাইডলাইন',
      sectionName: 'সার্ভিস সেকশন'
    };
  }

  return {
    title: customTitle || 'ভিসা পরামর্শ ও যোগাযোগ',
    serviceTitle: 'ইন্ডিয়ান ভিসা প্রসেসিং ও জরুরি পরামর্শ',
    sectionName: 'সাধারণ অনুসন্ধান'
  };
};

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [redirectData, setRedirectData] = useState<WhatsAppRedirectConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openWhatsAppModal = (config: WhatsAppRedirectConfig | string) => {
    if (typeof config === 'string') {
      const detected = detectServiceSubject(document.body, config);
      setRedirectData({
        url: config,
        title: detected.title,
        serviceTitle: detected.serviceTitle,
        sectionName: detected.sectionName,
      });
    } else {
      setRedirectData(config);
    }
    setIsOpen(true);
  };

  const closeWhatsAppModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setRedirectData(null);
    }, 200);
  };

  // Intercept all clicks on wa.me links globally across the website
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a, button');
      if (!target) return;

      const href = (target as HTMLAnchorElement).href;
      const dataHref = target.getAttribute('data-href');
      const targetUrl = href || dataHref || '';

      if (targetUrl.includes('wa.me')) {
        // Prevent default direct browser redirect to show our contact form popup
        e.preventDefault();
        e.stopPropagation();

        const detected = detectServiceSubject(target as HTMLElement, targetUrl);
        const customTitle = target.getAttribute('data-whatsapp-title') || detected.title;
        const customSubtitle = target.getAttribute('data-whatsapp-subtitle');
        const serviceTitle = target.getAttribute('data-service-name') || detected.serviceTitle;
        const sectionName = target.getAttribute('data-section') || detected.sectionName;

        openWhatsAppModal({
          url: targetUrl,
          title: customTitle,
          subtitle: customSubtitle || undefined,
          serviceTitle: serviceTitle,
          sectionName: sectionName,
        });
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
    };
  }, []);

  return (
    <WhatsAppContext.Provider
      value={{
        openWhatsAppModal,
        closeWhatsAppModal,
        redirectData,
        isOpen,
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
};
