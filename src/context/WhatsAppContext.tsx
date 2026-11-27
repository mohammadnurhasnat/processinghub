import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Language, useLanguage } from './LanguageContext';

export interface WhatsAppRedirectConfig {
  url?: string;
  title?: string;
  subtitle?: string;
  serviceTitle?: string;
  sectionName?: string;
  sourceId?: string;
}

export interface HandoffAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data?: string;
  previewUrl?: string;
}

export interface AgentChatHandoff {
  id: string;
  name: string;
  phone: string;
  subject: string;
  sectionName?: string;
  serviceTitle?: string;
  formattedMessage: string;
  attachments?: HandoffAttachment[];
  instantAgentReply?: string;
  skipAutoTelegramSummary?: boolean;
}

interface WhatsAppContextType {
  openWhatsAppModal: (config: WhatsAppRedirectConfig | string) => void;
  closeWhatsAppModal: () => void;
  redirectData: WhatsAppRedirectConfig | null;
  isOpen: boolean;
  pendingAgentHandoff: AgentChatHandoff | null;
  triggerAgentHandoff: (handoff: Omit<AgentChatHandoff, 'id'>) => void;
  clearAgentHandoff: () => void;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

// Helper to determine accurate localized contextual service subject
export const detectServiceSubject = (
  target: HTMLElement,
  url: string,
  language: Language = 'bn'
): { title: string; serviceTitle: string; sectionName: string } => {
  const customService = target.getAttribute('data-service-name') || target.getAttribute('data-whatsapp-service');
  const customTitle = target.getAttribute('data-whatsapp-title');
  const sectionAttr = target.getAttribute('data-section');
  const isBn = language === 'bn';

  if (customService) {
    return {
      title: customTitle || (isBn ? 'যোগাযোগ ও পরামর্শ' : 'Contact & Assistance'),
      serviceTitle: customService,
      sectionName: sectionAttr || (isBn ? 'সেবা সেকশন' : 'Services Section')
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
  const destinationsContainer = target.closest('#destinations-section, #destinations, #places-section');
  const navbarContainer = target.closest('header, nav, #main-navbar');
  const footerContainer = target.closest('footer');
  const floatingContainer = target.closest('#floating-whatsapp-btn');

  if (lower.includes('tourist visa') || lower.includes('ট্যুরিস্ট')) {
    return isBn
      ? {
          title: 'ট্যুরিস্ট ভিসা পরামর্শ',
          serviceTitle: 'ট্যুরিস্ট ভিসা প্রসেসিং ও ডকুমেন্টেশন',
          sectionName: 'ট্যুরিস্ট ভিসা ক্যাটাগরি'
        }
      : {
          title: 'Tourist Visa Assistance',
          serviceTitle: 'Tourist Visa Processing & Documentation',
          sectionName: 'Tourist Visa Category'
        };
  }

  if (lower.includes('medical visa') || lower.includes('মেডিকেল') || lower.includes('hospital') || lower.includes('ডাক্তার')) {
    return isBn
      ? {
          title: 'মেডিকেল ভিসা ও হাসপাতাল সেবা',
          serviceTitle: 'মেডিকেল ভিসা প্রসেসিং ও ইনভাইটেশন লেটার সহায়তা',
          sectionName: 'মেডিকেল ভিসা সেবা'
        }
      : {
          title: 'Medical Visa & Hospital Support',
          serviceTitle: 'Medical Visa Processing & Invitation Letter Support',
          sectionName: 'Medical Visa Service'
        };
  }

  if (lower.includes('business visa') || lower.includes('বিজনেস') || lower.includes('বাণিজ্যিক')) {
    return isBn
      ? {
          title: 'বিজনেস ভিসা পরামর্শ',
          serviceTitle: 'বিজনেস ভিসা প্রসেসিং ও স্পন্সর লেটার যাচাই',
          sectionName: 'বিজনেস ভিসা সেবা'
        }
      : {
          title: 'Business Visa Assistance',
          serviceTitle: 'Business Visa Processing & Invitation Review',
          sectionName: 'Business Visa Service'
        };
  }

  if (lower.includes('double entry') || lower.includes('ডবল এন্ট্রি') || lower.includes('ডাবল')) {
    return isBn
      ? {
          title: 'ডাবল এন্ট্রি ভিসা সেবা',
          serviceTitle: 'ডাবল এন্ট্রি ভিসা প্রসেসিং ও রুট প্ল্যানিং',
          sectionName: 'ডাবল এন্ট্রি ভিসা'
        }
      : {
          title: 'Double Entry Visa Service',
          serviceTitle: 'Double Entry Visa Processing & Route Planning',
          sectionName: 'Double Entry Visa'
        };
  }

  if (lower.includes('ticket') || lower.includes('flight') || lower.includes('train') || lower.includes('টিকেট')) {
    return isBn
      ? {
          title: 'টিকেট বুকিং সার্ভিস',
          serviceTitle: 'ইন্ডিয়ান ট্রেন ও এয়ার টিকেট বুকিং সহায়তা',
          sectionName: 'টিকেট বুকিং সার্ভিস'
        }
      : {
          title: 'Ticket Booking Service',
          serviceTitle: 'Air & Travel Ticket Booking Assistance',
          sectionName: 'Ticket Booking Service'
        };
  }

  if (lower.includes('slot') || lower.includes('appointment') || lower.includes('স্লট')) {
    return isBn
      ? {
          title: 'ভিসা অ্যাপয়েন্টমেন্ট স্লট',
          serviceTitle: 'ভিসা অ্যাপয়েন্টমেন্ট স্লট বুকিং ও শিডিউলিং',
          sectionName: 'ভিসা স্লট সার্ভিস'
        }
      : {
          title: 'Visa Appointment Slot',
          serviceTitle: 'IVAC Visa Appointment Slot Booking & Scheduling',
          sectionName: 'Visa Slot Service'
        };
  }

  if (heroContainer || lower.includes('free consultation') || lower.includes('পরামর্শ')) {
    return isBn
      ? {
          title: 'ফ্রি ভিসা পরামর্শ',
          serviceTitle: 'ফ্রি ভিসা পরামর্শ ও প্রাথমিক ফাইল যাচাই',
          sectionName: 'হিরো সেকশন'
        }
      : {
          title: 'Free Visa Guidance',
          serviceTitle: 'Free Visa Guidance & Initial File Assessment',
          sectionName: 'Hero Section'
        };
  }

  if (floatingContainer) {
    return isBn
      ? {
          title: 'তাৎক্ষণিক সহায়তা',
          serviceTitle: 'সাধারণ অনুসন্ধান ও তাৎক্ষণিক সহায়তা',
          sectionName: 'ফ্লোটিং সাপোর্ট'
        }
      : {
          title: 'Instant Support',
          serviceTitle: 'General Inquiry & Quick Support',
          sectionName: 'Floating Support'
        };
  }

  if (navbarContainer) {
    return isBn
      ? {
          title: 'ভিসা সাপোর্ট ও যোগাযোগ',
          serviceTitle: 'জরুরি ভিসা প্রসেসিং ও ফাইল ওপেনিং',
          sectionName: 'হেডার নেভিগেশন'
        }
      : {
          title: 'Visa Support & Contact',
          serviceTitle: 'Urgent Visa Processing & File Opening',
          sectionName: 'Header Navigation'
        };
  }

  if (destinationsContainer || lower.includes('destination') || lower.includes('tour')) {
    return isBn
      ? {
          title: 'ট্যুর ও ট্রাভেল গাইড',
          serviceTitle: 'ট্রাভেল প্যাকেজ ও হোটেল বুকিং পরামর্শ',
          sectionName: 'ভ্রমণ গন্তব্য সেকশন'
        }
      : {
          title: 'Tour & Travel Guide',
          serviceTitle: 'Travel Route & Visa File Support',
          sectionName: 'Destinations Section'
        };
  }

  if (footerContainer) {
    return isBn
      ? {
          title: 'কাস্টমার সাপোর্ট ও হেল্পডেস্ক',
          serviceTitle: 'সাধারণ কাস্টমার সাপোর্ট ও অনুসন্ধান',
          sectionName: 'ফুটার সেকশন'
        }
      : {
          title: 'Customer Support & Helpdesk',
          serviceTitle: 'General Customer Support & Inquiry',
          sectionName: 'Footer Section'
        };
  }

  if (servicesContainer) {
    return isBn
      ? {
          title: 'ভিসা সার্ভিস পরামর্শ',
          serviceTitle: 'ভিসা প্রসেসিং সেবা ও গাইডলাইন',
          sectionName: 'সার্ভিস সেকশন'
        }
      : {
          title: 'Visa Service Guidance',
          serviceTitle: 'Visa Processing Services & Guidelines',
          sectionName: 'Services Section'
        };
  }

  return isBn
    ? {
        title: customTitle || 'ভিসা পরামর্শ ও যোগাযোগ',
        serviceTitle: 'ইন্ডিয়ান ভিসা প্রসেসিং ও জরুরি পরামর্শ',
        sectionName: 'সাধারণ অনুসন্ধান'
      }
    : {
        title: customTitle || 'Visa Guidance & Contact',
        serviceTitle: 'Indian Visa Processing & Urgent Support',
        sectionName: 'General Inquiry'
      };
};

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const languageRef = useRef<Language>(language);
  languageRef.current = language;

  const [redirectData, setRedirectData] = useState<WhatsAppRedirectConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAgentHandoff, setPendingAgentHandoff] = useState<AgentChatHandoff | null>(null);

  const openWhatsAppModal = (config: WhatsAppRedirectConfig | string) => {
    if (typeof config === 'string') {
      const detected = detectServiceSubject(document.body, config, languageRef.current);
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

  const triggerAgentHandoff = (handoff: Omit<AgentChatHandoff, 'id'>) => {
    setPendingAgentHandoff({
      ...handoff,
      id: `handoff-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    });
  };

  const clearAgentHandoff = () => {
    setPendingAgentHandoff(null);
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

        const detected = detectServiceSubject(target as HTMLElement, targetUrl, languageRef.current);
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
        pendingAgentHandoff,
        triggerAgentHandoff,
        clearAgentHandoff,
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
