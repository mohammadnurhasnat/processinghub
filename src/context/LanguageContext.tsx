import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'bn' | 'en';

const LANGUAGE_STORAGE_KEY = 'processinghub_lang';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const;

export function toBnDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => BN_DIGITS[Number(digit)]);
}

export function toEnDigits(value: string | number): string {
  return String(value).replace(/[০-৯]/g, (digit) => String(BN_DIGITS.indexOf(digit as (typeof BN_DIGITS)[number])));
}

export function formatLocalizedDigits(value: string | number, language: Language): string {
  return language === 'bn' ? toBnDigits(value) : toEnDigits(value);
}

export function formatLocalizedCurrency(amount: number, language: Language): string {
  if (language === 'bn') {
    return `৳${toBnDigits(amount.toLocaleString('en-US'))}`;
  }
  return `৳${amount.toLocaleString('en-US')}`;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (bnText: string, enText: string) => string;
  num: (value: string | number) => string;
  currency: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved === 'en' || saved === 'bn') {
          return saved;
        }
      } catch {
        // Ignore storage read errors
      }
    }
    return 'bn';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      } catch {
        // Ignore storage write errors
      }
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const t = (bnText: string, enText: string) => (language === 'bn' ? bnText : enText);
  const num = (value: string | number) => formatLocalizedDigits(value, language);
  const currency = (amount: number) => formatLocalizedCurrency(amount, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, num, currency }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
