import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WhatsAppRedirectConfig {
  url: string;
  title?: string;
  subtitle?: string;
  serviceTitle?: string;
}

interface WhatsAppContextType {
  openWhatsAppModal: (config: WhatsAppRedirectConfig | string) => void;
  closeWhatsAppModal: () => void;
  redirectData: WhatsAppRedirectConfig | null;
  isOpen: boolean;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [redirectData, setRedirectData] = useState<WhatsAppRedirectConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openWhatsAppModal = (config: WhatsAppRedirectConfig | string) => {
    if (typeof config === 'string') {
      setRedirectData({ url: config });
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

  // Intercept all direct clicks on wa.me anchors anywhere on the page
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && target.href.includes('wa.me')) {
        // Prevent default direct redirection
        e.preventDefault();
        e.stopPropagation();

        const url = target.href;
        const customTitle = target.getAttribute('data-whatsapp-title');
        const customSubtitle = target.getAttribute('data-whatsapp-subtitle');

        // Extract message from URL text parameter if present
        let serviceTitle = '';
        try {
          const urlObj = new URL(url);
          const textParam = urlObj.searchParams.get('text');
          if (textParam) {
            if (textParam.includes('Tourist Visa')) serviceTitle = 'Tourist Visa (ট্যুরিস্ট ভিসা)';
            else if (textParam.includes('Medical Visa')) serviceTitle = 'Medical Visa (মেডিকেল ভিসা)';
            else if (textParam.includes('Business Visa')) serviceTitle = 'Business Visa (বিজনেস ভিসা)';
            else if (textParam.includes('Double Entry')) serviceTitle = 'Double Entry Visa (ডবল এন্ট্রি ভিসা)';
            else if (textParam.includes('Ticket Booking')) serviceTitle = 'Ticket Booking (টিকেট বুকিং)';
            else if (textParam.includes('Slot')) serviceTitle = 'ভিসা অ্যাপয়েন্টমেন্ট স্লট বুকিং';
            else if (textParam.includes('consultation')) serviceTitle = 'জরুরি ভিসা পরামর্শ';
            else if (textParam.includes('apply')) serviceTitle = 'নতুন ভিসা আবেদন';
          }
        } catch {
          // fallback ignore
        }

        openWhatsAppModal({
          url,
          title: customTitle || undefined,
          subtitle: customSubtitle || undefined,
          serviceTitle: serviceTitle || undefined
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
