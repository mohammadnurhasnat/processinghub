import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  FileText,
  Compass,
  Building2,
  HelpCircle,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  VISA_SERVICES,
  DESTINATIONS,
  HOSPITALS,
  getVisaServices,
  getDestinations,
  getHospitals,
} from '../data/visaData';
import {
  VISA_SERVICES_EN,
  DESTINATIONS_EN,
  HOSPITALS_EN,
} from '../data/visaDataEn';
import { ACTIVE_IVAC_CENTER_GUIDES } from '../config';
import { OFFICIAL_FAQ_ITEMS } from './IvacCentersAndFaqSection';
import { useLanguage } from '../context/LanguageContext';
import { VisaService } from '../types';

export interface GlobalSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (service: VisaService) => void;
  onSelectDestination: (destinationName: string) => void;
  onSelectHospital: (hospitalName: string) => void;
  onSelectFaq: (faqIndex: number) => void;
  onSelectIvac: () => void;
}

interface SearchMatchItem {
  id: string;
  kind: 'service' | 'destination' | 'hospital' | 'ivac' | 'faq';
  title: string;
  subtitle: string;
  badge?: string;
  score: number;
  service?: VisaService;
  filterQuery?: string;
  faqIdx?: number;
}

const QUICK_SHORTCUTS = [
  { bn: 'মেডিকেল ভিসা', en: 'Medical Visa', queryBn: 'মেডিকেল', queryEn: 'Medical' },
  { bn: 'স্লট বুকিং', en: 'Slot Booking', queryBn: 'স্লট', queryEn: 'Slot' },
  { bn: 'ট্যুরিস্ট ভিসা', en: 'Tourist Visa', queryBn: 'ট্যুরিস্ট', queryEn: 'Tourist' },
  { bn: 'অ্যাপোলো হাসপাতাল', en: 'Apollo Hospital', queryBn: 'অ্যাপোলো', queryEn: 'Apollo' },
  { bn: 'দার্জিলিং', en: 'Darjeeling', queryBn: 'দার্জিলিং', queryEn: 'Darjeeling' },
];

function highlightMatch(text: string, query: string): React.ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  if (parts.length <= 1) return text;

  return parts.map((part, idx) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark
        key={idx}
        className="bg-[#DCE3FF] text-[#1C275F] font-bold rounded-[3px] px-0.5"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  isOpen,
  onClose,
  onSelectService,
  onSelectDestination,
  onSelectHospital,
  onSelectFaq,
  onSelectIvac,
}) => {
  const { language, t, num } = useLanguage();
  const isBn = language === 'bn';
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const services = useMemo(() => getVisaServices(language), [language]);
  const destinations = useMemo(() => getDestinations(language), [language]);
  const hospitals = useMemo(() => getHospitals(language), [language]);

  // Advanced 1-word bilingual multi-source matching engine
  const groupedResults = useMemo(() => {
    const rawQ = query.trim().toLowerCase();
    if (!rawQ) {
      return {
        services: [] as SearchMatchItem[],
        destinations: [] as SearchMatchItem[],
        hospitals: [] as SearchMatchItem[],
        ivacFaq: [] as SearchMatchItem[],
        total: 0,
      };
    }

    const tokens = rawQ.split(/\s+/).filter(Boolean);
    const matchesAllTokens = (haystack: string) => {
      const lower = haystack.toLowerCase();
      return tokens.every((tok) => lower.includes(tok));
    };

    const bnServiceMap = new Map(VISA_SERVICES.map((s) => [s.id, s]));
    const enServiceMap = new Map(VISA_SERVICES_EN.map((s) => [s.id, s]));

    const matchedServices: SearchMatchItem[] = [];
    services.forEach((svc) => {
      const bnS = bnServiceMap.get(svc.id);
      const enS = enServiceMap.get(svc.id);
      const docsText = [
        ...(bnS?.documents || []),
        ...(enS?.documents || []),
        ...(bnS?.specialNotes || []),
        ...(enS?.specialNotes || []),
      ].join(' ');

      const fullText = [
        svc.title,
        svc.category,
        svc.description,
        svc.price,
        bnS?.title,
        bnS?.category,
        bnS?.description,
        enS?.title,
        enS?.category,
        enS?.description,
        docsText,
      ]
        .filter(Boolean)
        .join(' ');

      if (matchesAllTokens(fullText)) {
        const titleHit =
          svc.title.toLowerCase().includes(rawQ) ||
          (bnS?.title.toLowerCase().includes(rawQ) ?? false) ||
          (enS?.title.toLowerCase().includes(rawQ) ?? false);

        matchedServices.push({
          id: `svc-${svc.id}`,
          kind: 'service',
          title: svc.title,
          subtitle: `${svc.category} · ${svc.price} ${svc.per}`,
          badge: t('ভিসা সেবা', 'Service'),
          score: titleHit ? 10 : 5,
          service: svc,
        });
      }
    });

    const bnDestMap = new Map(DESTINATIONS.map((d) => [d.id, d]));
    const enDestMap = new Map(DESTINATIONS_EN.map((d) => [d.id, d]));

    const matchedDestinations: SearchMatchItem[] = [];
    destinations.forEach((dest) => {
      const bnD = bnDestMap.get(dest.id);
      const enD = enDestMap.get(dest.id);
      const fullText = [
        dest.name,
        dest.location,
        dest.description,
        dest.bestTime,
        ...(dest.attractions || []),
        bnD?.name,
        bnD?.location,
        bnD?.description,
        ...(bnD?.attractions || []),
        enD?.name,
        enD?.location,
        enD?.description,
        ...(enD?.attractions || []),
      ]
        .filter(Boolean)
        .join(' ');

      if (matchesAllTokens(fullText)) {
        const titleHit =
          dest.name.toLowerCase().includes(rawQ) ||
          (bnD?.name.toLowerCase().includes(rawQ) ?? false) ||
          (enD?.name.toLowerCase().includes(rawQ) ?? false);

        matchedDestinations.push({
          id: `dest-${dest.id}`,
          kind: 'destination',
          title: dest.name,
          subtitle: dest.location,
          badge: t('ভ্রমণ গন্তব্য', 'Destination'),
          score: titleHit ? 10 : 5,
          filterQuery: dest.name,
        });
      }
    });

    const bnHospMap = new Map(HOSPITALS.map((h) => [h.id, h]));
    const enHospMap = new Map(HOSPITALS_EN.map((h) => [h.id, h]));

    const matchedHospitals: SearchMatchItem[] = [];
    hospitals.forEach((hosp) => {
      const bnH = bnHospMap.get(hosp.id);
      const enH = enHospMap.get(hosp.id);
      const fullText = [
        hosp.name,
        hosp.city,
        hosp.location,
        hosp.description,
        ...hosp.specialties,
        ...hosp.departments,
        bnH?.name,
        bnH?.city,
        bnH?.location,
        ...(bnH?.specialties || []),
        ...(bnH?.departments || []),
        enH?.name,
        enH?.city,
        enH?.location,
        ...(enH?.specialties || []),
        ...(enH?.departments || []),
      ]
        .filter(Boolean)
        .join(' ');

      if (matchesAllTokens(fullText)) {
        const titleHit =
          hosp.name.toLowerCase().includes(rawQ) ||
          hosp.city.toLowerCase().includes(rawQ) ||
          (bnH?.name.toLowerCase().includes(rawQ) ?? false) ||
          (enH?.name.toLowerCase().includes(rawQ) ?? false);

        matchedHospitals.push({
          id: `hosp-${hosp.id}`,
          kind: 'hospital',
          title: hosp.name,
          subtitle: `${hosp.city} · ${hosp.departments.slice(0, 2).join(', ')}`,
          badge: t('হাসপাতাল', 'Hospital'),
          score: titleHit ? 10 : 5,
          filterQuery: hosp.name,
        });
      }
    });

    const matchedIvacFaq: SearchMatchItem[] = [];
    ACTIVE_IVAC_CENTER_GUIDES.forEach((center) => {
      const fullText = `${center.nameBn} ${center.nameEn} ${center.addressBn} ${center.addressEn} ivac আইভ্যাক স্লট সেন্টার`;
      if (matchesAllTokens(fullText)) {
        matchedIvacFaq.push({
          id: `ivac-${center.id}`,
          kind: 'ivac',
          title: isBn ? center.nameBn : center.nameEn,
          subtitle: isBn ? center.addressBn : center.addressEn,
          badge: t('আইভ্যাক কেন্দ্র', 'IVAC'),
          score: 6,
        });
      }
    });

    OFFICIAL_FAQ_ITEMS.forEach((faq, idx) => {
      const fullText = [
        faq.qBn,
        faq.qEn,
        faq.aBn,
        faq.aEn,
        faq.introBn,
        faq.introEn,
        ...faq.bulletsBn,
        ...faq.bulletsEn,
      ]
        .filter(Boolean)
        .join(' ');

      if (matchesAllTokens(fullText)) {
        matchedIvacFaq.push({
          id: `faq-${idx}`,
          kind: 'faq',
          title: isBn ? faq.qBn : faq.qEn,
          subtitle: isBn ? faq.bulletsBn[0] : faq.bulletsEn[0],
          badge: t('প্রশ্নোত্তর', 'FAQ'),
          score: 7,
          faqIdx: idx,
        });
      }
    });

    matchedServices.sort((a, b) => b.score - a.score);
    matchedDestinations.sort((a, b) => b.score - a.score);
    matchedHospitals.sort((a, b) => b.score - a.score);

    const total =
      matchedServices.length +
      matchedDestinations.length +
      matchedHospitals.length +
      matchedIvacFaq.length;

    return {
      services: matchedServices,
      destinations: matchedDestinations,
      hospitals: matchedHospitals,
      ivacFaq: matchedIvacFaq,
      total,
    };
  }, [query, services, destinations, hospitals, isBn, t]);

  const handleResultClick = (item: SearchMatchItem) => {
    onClose();
    if (item.kind === 'service' && item.service) {
      onSelectService(item.service);
    } else if (item.kind === 'destination' && item.filterQuery) {
      onSelectDestination(item.filterQuery);
    } else if (item.kind === 'hospital' && item.filterQuery) {
      onSelectHospital(item.filterQuery);
    } else if (item.kind === 'faq' && typeof item.faqIdx === 'number') {
      onSelectFaq(item.faqIdx);
    } else if (item.kind === 'ivac') {
      onSelectIvac();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Click-outside backdrop */}
          <motion.div
            key="global-search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#161D28]/25 backdrop-blur-[3px]"
            aria-hidden="true"
          />

          {/* Centered Advanced Search Panel with exact 5px border radius */}
          <motion.div
            key="global-search-panel"
            id="global-search-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-50 w-full max-w-2xl mx-auto mt-2 px-0 sm:px-4 pointer-events-auto"
          >
            <div className="bg-white/98 backdrop-blur-xl border border-[#BAC5FA] rounded-[5px] shadow-[0_18px_40px_rgba(22,29,40,0.18)] overflow-hidden">
              {/* Search Input Row (5px radius) */}
              <div className="p-2.5 sm:p-3 border-b border-[#E5E9FA] bg-[#F8FAFF]">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-[#263375] absolute left-3 pointer-events-none" />
                  <input
                    ref={inputRef}
                    id="global-header-search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t(
                      'যেকোনো ১টি শব্দ লিখুন (মেডিকেল, স্লট, দার্জিলিং, অ্যাপোলো, পাসপোর্ট)...',
                      'Type any 1 word (Medical, Slot, Darjeeling, Apollo, Passport)...'
                    )}
                    className="w-full pl-9 pr-16 py-2 text-xs sm:text-sm bg-white border border-[#C6D0FB] rounded-[5px] text-[#161D28] placeholder:text-[#7A8499] focus:outline-none focus:border-[#263375] focus:ring-2 focus:ring-[#263375]/15 transition-all"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    {query && (
                      <button
                        type="button"
                        id="global-search-clear-btn"
                        onClick={() => {
                          setQuery('');
                          inputRef.current?.focus();
                        }}
                        className="p-1 rounded-[5px] text-[#6B7280] hover:text-[#161D28] hover:bg-[#EEF1FE] transition-colors cursor-pointer"
                        aria-label={t('মুছুন', 'Clear')}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      id="global-search-close-btn"
                      onClick={onClose}
                      className="px-1.5 py-0.5 rounded-[5px] text-[10.5px] font-bold text-[#374492] bg-[#EEF1FE] hover:bg-[#DCE3FF] border border-[#CCD3FB] transition-colors cursor-pointer"
                    >
                      {t('বন্ধ', 'ESC')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Body: Quick Shortcuts or Grouped Results */}
              <div className="max-h-[62vh] overflow-y-auto p-3 space-y-3.5">
                {!query.trim() ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#5A6474] px-0.5">
                      <span>{t('জনপ্রিয় কুইক সার্চ শর্টকাট', 'Popular Quick Search Shortcuts')}</span>
                      <span>{t('১ শব্দেই সব খুঁজুন', '1-Word Instant Search')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_SHORTCUTS.map((sc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          id={`quick-search-chip-${idx}`}
                          onClick={() => setQuery(isBn ? sc.queryBn : sc.queryEn)}
                          className="px-2.5 py-1.5 rounded-[5px] text-xs font-semibold bg-[#F4F6FF] hover:bg-[#E5EAFF] text-[#263375] border border-[#CCD3FB] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Search className="w-3 h-3 opacity-70" />
                          <span>{isBn ? sc.bn : sc.en}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : groupedResults.total === 0 ? (
                  <div className="py-7 text-center space-y-2">
                    <p className="text-sm font-bold text-[#161D28]">
                      {t('এই শব্দে কোনো ফলাফল পাওয়া যায়নি', 'No matching results found')}
                    </p>
                    <p className="text-xs text-[#5A6474]">
                      {t(
                        'অন্য কোনো ১টি শব্দ দিয়ে চেষ্টা করুন (যেমন: মেডিকেল, ট্যুরিস্ট, কলকাতা, হৃদরোগ, স্লট)।',
                        'Try a different keyword (e.g., Medical, Tourist, Kolkata, Heart, Slot).'
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-[11px] text-[#5A6474] pb-1 border-b border-[#ECEFF9]">
                      <span>
                        {isBn
                          ? `মোট ${num(groupedResults.total)}টি প্রাসঙ্গিক ফলাফল পাওয়া গেছে`
                          : `Found ${groupedResults.total} matching results`}
                      </span>
                      <span className="font-semibold text-[#263375]">
                        “{query.trim()}”
                      </span>
                    </div>

                    {/* 1. Visa Services */}
                    {groupedResults.services.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1E743B] px-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>
                            {t(
                              `ভিসা সেবাসমূহ (${num(groupedResults.services.length)})`,
                              `Visa Services (${groupedResults.services.length})`
                            )}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {groupedResults.services.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleResultClick(item)}
                              className="w-full text-left px-2.5 py-2 rounded-[5px] hover:bg-[#F3F6FF] border border-transparent hover:border-[#CCD3FB] transition-all flex items-center justify-between gap-2 cursor-pointer group"
                            >
                              <div className="min-w-0">
                                <div className="text-xs sm:text-[13px] font-bold text-[#161D28] truncate">
                                  {highlightMatch(item.title, query)}
                                </div>
                                <div className="text-[11px] text-[#55604C] truncate mt-0.5">
                                  {highlightMatch(item.subtitle, query)}
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-[#263375] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Travel Destinations */}
                    {groupedResults.destinations.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#263375] px-1">
                          <Compass className="w-3.5 h-3.5" />
                          <span>
                            {t(
                              `ভ্রমণ গন্তব্যসমূহ (${num(groupedResults.destinations.length)})`,
                              `Travel Destinations (${groupedResults.destinations.length})`
                            )}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {groupedResults.destinations.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleResultClick(item)}
                              className="w-full text-left px-2.5 py-2 rounded-[5px] hover:bg-[#F3F6FF] border border-transparent hover:border-[#CCD3FB] transition-all flex items-center justify-between gap-2 cursor-pointer group"
                            >
                              <div className="min-w-0">
                                <div className="text-xs sm:text-[13px] font-bold text-[#161D28] truncate">
                                  {highlightMatch(item.title, query)}
                                </div>
                                <div className="text-[11px] text-[#55604C] truncate mt-0.5 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{highlightMatch(item.subtitle, query)}</span>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-[#263375] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Top Indian Hospitals */}
                    {groupedResults.hospitals.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1D5E29] px-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>
                            {t(
                              `ভারতের শীর্ষ হাসপাতাল (${num(groupedResults.hospitals.length)})`,
                              `Top Indian Hospitals (${groupedResults.hospitals.length})`
                            )}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {groupedResults.hospitals.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleResultClick(item)}
                              className="w-full text-left px-2.5 py-2 rounded-[5px] hover:bg-[#F2F9F0] border border-transparent hover:border-[#B9DFBF] transition-all flex items-center justify-between gap-2 cursor-pointer group"
                            >
                              <div className="min-w-0">
                                <div className="text-xs sm:text-[13px] font-bold text-[#161D28] truncate">
                                  {highlightMatch(item.title, query)}
                                </div>
                                <div className="text-[11px] text-[#55604C] truncate mt-0.5">
                                  {highlightMatch(item.subtitle, query)}
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-[#1D5E29] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. IVAC Centers & FAQ */}
                    {groupedResults.ivacFaq.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#374492] px-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>
                            {t(
                              `আইভ্যাক কেন্দ্র ও প্রশ্নোত্তর (${num(groupedResults.ivacFaq.length)})`,
                              `IVAC Centers & FAQ (${groupedResults.ivacFaq.length})`
                            )}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {groupedResults.ivacFaq.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleResultClick(item)}
                              className="w-full text-left px-2.5 py-2 rounded-[5px] hover:bg-[#F3F6FF] border border-transparent hover:border-[#CCD3FB] transition-all flex items-center justify-between gap-2 cursor-pointer group"
                            >
                              <div className="min-w-0">
                                <div className="text-xs sm:text-[13px] font-bold text-[#161D28] line-clamp-1">
                                  {highlightMatch(item.title, query)}
                                </div>
                                <div className="text-[11px] text-[#55604C] line-clamp-1 mt-0.5">
                                  {highlightMatch(item.subtitle, query)}
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-[#263375] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
