import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  Building2, 
  MapPin, 
  Compass, 
  ShieldCheck, 
  CalendarCheck2, 
  Stethoscope,
  Sparkles,
  FileCheck2
} from 'lucide-react';
import { getDestinations, getHospitals, HOSPITALS, DESTINATIONS } from '../data/visaData';
import { HOSPITALS_EN, DESTINATIONS_EN } from '../data/visaDataEn';
import { CONFIG } from '../config';
import { Destination, Hospital } from '../types';
import { HospitalDetailModal } from './HospitalDetailModal';
import { DestinationDetailModal } from './DestinationDetailModal';
import {
  MedicalInvitationModal,
  VERIFIED_HOSPITAL_BRANCHES,
  MEDICAL_DEPARTMENTS_LIST,
} from './MedicalInvitationModal';
import { useLanguage } from '../context/LanguageContext';

const DEPARTMENT_FILTERS = [
  { id: 'all', bn: 'সকল বিভাগ', en: 'All Departments', emoji: '🏥' },
  { id: 'Cardiology', bn: 'কার্ডিওলজি ও হার্ট', en: 'Cardiology & Heart', emoji: '❤️' },
  { id: 'Oncology', bn: 'ক্যান্সার ও অনকোলজি', en: 'Cancer & Oncology', emoji: '🎗️' },
  { id: 'Neurology', bn: 'নিউরোলজি ও ব্রেন', en: 'Neurology & Brain', emoji: '🧠' },
  { id: 'Gastroenterology', bn: 'গ্যাস্ট্রোএন্টারোলজি', en: 'Gastroenterology', emoji: '🔬' },
  { id: 'Urology', bn: 'ইউরোলজি ও প্রোস্টেট', en: 'Urology & Prostate', emoji: '🩺' },
  { id: 'Nephrology', bn: 'কিডনি ও নেফ্রোলজি', en: 'Kidney & Nephrology', emoji: '🧪' },
  { id: 'Organ Transplant', bn: 'অর্গান ট্রান্সপ্লান্ট', en: 'Organ Transplant', emoji: '🫀' },
  { id: 'Orthopedics', bn: 'অর্থোপেডিক্স ও জয়েন্ট', en: 'Orthopedics & Joint', emoji: '🦴' },
  { id: 'Pediatrics', bn: 'শিশু বিভাগ', en: 'Pediatrics', emoji: '👶' },
];

interface DestinationsSectionProps {
  externalSearchQuery?: string;
  externalDestinationQuery?: string;
  onClearExternalDestinationQuery?: () => void;
}

export const DestinationsSection: React.FC<DestinationsSectionProps> = ({
  externalSearchQuery,
  externalDestinationQuery,
  onClearExternalDestinationQuery,
}) => {
  const { language, t, num } = useLanguage();
  const isBn = language === 'bn';

  const destinations = getDestinations(language);
  const hospitals = getHospitals(language);

  const [destFilterQuery, setDestFilterQuery] = useState(externalDestinationQuery || '');
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [selectedDept, setSelectedDept] = useState('all');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  // Medical Invitation Modal state
  const [isMedicalInvitationOpen, setIsMedicalInvitationOpen] = useState(false);
  const [invitationHospital, setInvitationHospital] = useState<Hospital | null>(null);

  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof externalDestinationQuery === 'string') {
      setDestFilterQuery(externalDestinationQuery);
    }
  }, [externalDestinationQuery]);

  useEffect(() => {
    if (typeof externalSearchQuery === 'string' && externalSearchQuery.trim()) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const filteredDestinations = useMemo(() => {
    const q = destFilterQuery.toLowerCase().trim();
    if (!q) return destinations;
    const bnMap = new Map(DESTINATIONS.map((d) => [d.id, d]));
    const enMap = new Map(DESTINATIONS_EN.map((d) => [d.id, d]));

    return destinations.filter((dest) => {
      const bnItem = bnMap.get(dest.id);
      const enItem = enMap.get(dest.id);
      const candidates = [dest, bnItem, enItem].filter((item): item is Destination => Boolean(item));
      return candidates.some(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.attractions || []).some((a) => a.toLowerCase().includes(q)) ||
          item.bestTime.toLowerCase().includes(q)
      );
    });
  }, [destinations, destFilterQuery]);
  
  // Modals state by ID so switching language updates open modals live
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);

  const selectedHospital: Hospital | null = useMemo(
    () => (selectedHospitalId ? hospitals.find((h) => h.id === selectedHospitalId) || null : null),
    [hospitals, selectedHospitalId]
  );

  const selectedDestination: Destination | null = useMemo(
    () => (selectedDestId ? destinations.find((d) => d.id === selectedDestId) || null : null),
    [destinations, selectedDestId]
  );

  const destScrollRef = useRef<HTMLDivElement>(null);
  const hospitalScrollRef = useRef<HTMLDivElement>(null);

  // Resolve matching department IDs from bilingual synonyms (e.g., "হার্ট", "হৃদরোগ", "cardiology", "ইউরোলজি", "urology")
  const matchedDepartmentRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return MEDICAL_DEPARTMENTS_LIST.slice(0, 6);
    return MEDICAL_DEPARTMENTS_LIST.filter(
      (dept) =>
        dept.bn.toLowerCase().includes(q) ||
        dept.en.toLowerCase().includes(q) ||
        dept.id.toLowerCase().includes(q) ||
        dept.keywords
          .toLowerCase()
          .split(/\s+/)
          .some((kw) => kw.includes(q) || q.includes(kw))
    );
  }, [searchQuery]);

  // Filter hospitals with enriched bilingual cross-search (matches BN & EN datasets + department synonyms + verified branches)
  const filteredHospitals = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const bnMap = new Map(HOSPITALS.map((h) => [h.id, h]));
    const enMap = new Map(HOSPITALS_EN.map((h) => [h.id, h]));

    // If user typed a department keyword in Bangla or English, collect canonical department targets
    const synonymDeptTargets = q
      ? MEDICAL_DEPARTMENTS_LIST.filter(
          (dept) =>
            dept.bn.toLowerCase().includes(q) ||
            dept.en.toLowerCase().includes(q) ||
            dept.keywords
              .toLowerCase()
              .split(/\s+/)
              .some((kw) => kw.includes(q) || q.includes(kw))
        ).map((d) => d.id.toLowerCase())
      : [];

    return hospitals.filter((hospital) => {
      const bnItem = bnMap.get(hospital.id);
      const enItem = enMap.get(hospital.id);
      const candidates = [hospital, bnItem, enItem].filter((item): item is Hospital => Boolean(item));
      const verifiedRecord = VERIFIED_HOSPITAL_BRANCHES.find((vh) => vh.hospitalId === hospital.id);

      // Department filter chip check
      const matchesDept =
        selectedDept === 'all' ||
        (selectedDept === 'Urology' &&
          candidates.some((item) =>
            item.departments.some((d) =>
              ['urology', 'nephrology', 'kidney', 'organ transplant'].some((k) => d.toLowerCase().includes(k))
            ) ||
            item.specialties.some((s) =>
              ['urology', 'ইউরোলজি', 'কিডনি', 'kidney', 'renal'].some((k) => s.toLowerCase().includes(k))
            )
          )) ||
        candidates.some((item) =>
          item.departments.some(
            (d) =>
              d.toLowerCase().includes(selectedDept.toLowerCase()) ||
              selectedDept.toLowerCase().includes(d.toLowerCase())
          )
        );

      if (!q) return matchesDept;

      // Direct text match across BN and EN hospital fields
      const directMatch = candidates.some(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.specialties.some((s) => s.toLowerCase().includes(q)) ||
          item.departments.some((d) => d.toLowerCase().includes(q))
      );

      // Verified branch match (both Bangla & English branch names)
      const branchMatch = verifiedRecord
        ? verifiedRecord.bnName.toLowerCase().includes(q) ||
          verifiedRecord.enName.toLowerCase().includes(q) ||
          verifiedRecord.branches.some(
            (b) => b.bn.toLowerCase().includes(q) || b.en.toLowerCase().includes(q)
          )
        : false;

      // Department synonym match (e.g. user searched "হার্ট" or "ইউরোলজি" or "গ্যাস্ট্রো")
      const synonymMatch =
        synonymDeptTargets.length > 0 &&
        candidates.some((item) =>
          item.departments.some((d) => {
            const dl = d.toLowerCase();
            return (
              synonymDeptTargets.some((target) => dl.includes(target) || target.includes(dl)) ||
              (synonymDeptTargets.includes('urology') && (dl.includes('nephrology') || dl.includes('transplant')))
            );
          })
        );

      return matchesDept && (directMatch || branchMatch || synonymMatch);
    });
  }, [hospitals, searchQuery, selectedDept]);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };

  const handleOpenGeneralInvitation = () => {
    setInvitationHospital(null);
    setIsMedicalInvitationOpen(true);
  };

  const handleOpenHospitalInvitation = (hosp: Hospital) => {
    setSelectedHospitalId(null);
    setInvitationHospital(hosp);
    setIsMedicalInvitationOpen(true);
  };

  return (
    <section id="destinations" className="relative py-8 sm:py-12 bg-gradient-to-b from-transparent via-[#F7F6F0]/60 to-transparent">
      
      {/* ========================================================================= */}
      {/* PART 1: POPULAR TOURIST DESTINATIONS                                      */}
      {/* ========================================================================= */}
      <div className="w-full max-w-6xl mx-auto px-4 mb-10 sm:mb-12">
        <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-7">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Space_Grotesk'] text-[#1E2519] tracking-tight leading-tight">
            {t('জনপ্রিয় ভ্রমণ গন্তব্যসমূহ', 'Popular Indian Travel Destinations')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#4E5C46] mt-2 leading-relaxed max-w-2xl mx-auto">
            {t(
              'বাংলাদেশি ভ্রমণপিপাসুদের পছন্দের ভারতের সেরা দর্শনীয় স্থানসমূহ। যেকোনো কার্ডে ক্লিক করে দর্শনীয় স্থান ও ভ্রমণের সেরা সময় জেনে নিন।',
              'Explore top Indian destinations favored by Bangladeshi travelers. Click any card to view key attractions and the best time to visit.'
            )}
          </p>
        </div>

        {destFilterQuery.trim() && (
          <div
            id="destination-filter-banner"
            className="mb-4 px-4 py-2.5 rounded-xl bg-[#EEF1FE] border border-[#BAC5FA] flex flex-wrap items-center justify-between gap-2 text-xs text-[#263375]"
          >
            <span>
              {isBn ? (
                <>
                  গন্তব্য ফিল্টার সক্রিয়: <strong>“{destFilterQuery}”</strong> ({num(filteredDestinations.length)}টি ফলাফল)
                </>
              ) : (
                <>
                  Active destination filter: <strong>“{destFilterQuery}”</strong> ({filteredDestinations.length} match)
                </>
              )}
            </span>
            <button
              type="button"
              id="clear-destination-filter-btn"
              onClick={() => {
                setDestFilterQuery('');
                onClearExternalDestinationQuery?.();
              }}
              className="px-3 py-1 rounded-full bg-white text-[#263375] border border-[#BAC5FA] font-bold hover:bg-[#DCE3FF] transition-colors cursor-pointer"
            >
              {t('সকল গন্তব্য দেখুন', 'Show All Destinations')}
            </button>
          </div>
        )}

        {/* Tourist Destinations Polaroid Row */}
        <div 
          className="dest-scroll" 
          id="destinations-scroll-container"
          ref={destScrollRef}
        >
          {filteredDestinations.map((dest, index) => (
            <div 
              key={dest.id || index} 
              id={`destination-polaroid-${dest.id || index}`}
              onClick={() => setSelectedDestId(dest.id)}
              className="polaroid cursor-pointer group text-left" 
            >
              <div className="relative overflow-hidden rounded-lg bg-[#E8E4D8]">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  loading="lazy" 
                  className="w-full h-[180px] object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = CONFIG.fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center">
                  <span className="bg-white/95 text-[#1E2519] text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#2A6A26]" />
                    {t('দর্শনীয় স্থান ও তথ্য', 'Attractions & Info')}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 flex flex-col flex-1 justify-between text-left items-start">
                <div className="w-full text-left">
                  <h4 className="font-['Space_Grotesk'] text-[14px] font-bold text-[#1E2519] group-hover:text-[#2A6A26] transition-colors leading-tight text-left">
                    {dest.name}
                  </h4>
                  <p className="text-[11px] text-[#65715D] flex items-center justify-start gap-1 mt-1.5 line-clamp-1 text-left">
                    <MapPin className="w-3 h-3 text-[#8C9685] flex-shrink-0" />
                    <span className="text-left">{dest.location}</span>
                  </p>
                </div>

                <div className="w-full mt-2.5 pt-2 border-t border-[#EFEBE0] flex items-center justify-between text-[11px] font-bold text-[#2A6A26]">
                  <span>{t('ভ্রমণ নির্দেশিকা', 'Travel Guide')}</span>
                  <span className="text-[#2A6A26] group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tourist Nav Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4">
          <button
            type="button"
            id="dest-prev-btn"
            onClick={() => scrollContainer(destScrollRef, 'left')}
            className="dest-nav-btn"
            aria-label={t('পূর্ববর্তী গন্তব্য', 'Previous destination')}
            title={t('পূর্ববর্তী', 'Previous')}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            id="dest-next-btn"
            onClick={() => scrollContainer(destScrollRef, 'right')}
            className="dest-nav-btn"
            aria-label={t('পরবর্তী গন্তব্য', 'Next destination')}
            title={t('পরবর্তী', 'Next')}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Clean Subtle Divider */}
      <div className="w-full max-w-5xl mx-auto px-4 my-8">
        <div className="border-t border-[#E3DFC8]" />
      </div>

      {/* ========================================================================= */}
      {/* PART 2: TOP INDIAN HOSPITALS & SPECIALISTS                                */}
      {/* ========================================================================= */}
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-7">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Space_Grotesk'] text-[#1E2519] tracking-tight leading-tight">
            {t('ভারতের শীর্ষ হাসপাতাল ও চিকিৎসাকেন্দ্রসমূহ', 'Top Indian Hospitals & Medical Centers')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#4E5C46] mt-2 leading-relaxed max-w-2xl mx-auto">
            {t(
              'বাংলাদেশি রোগীদের উন্নত চিকিৎসার জন্য ভারতের স্বনামধন্য সুপার-স্পেশালিটি হাসপাতালসমূহ। প্রতিটি হাসপাতাল থেকে ডাক্তারের ইনভাইটেশন ও অ্যাপয়েন্টমেন্ট সাপোর্ট প্রদান করা হয়।',
              'Leading Indian super-specialty hospitals trusted by Bangladeshi patients. We arrange official doctor invitation letters and appointment confirmations for medical visas.'
            )}
          </p>
        </div>

        {/* Doctor Invitation Letter & Appointment Trust Banner */}
        <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-white/95 border border-[#CDE5D5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center flex-shrink-0 border border-[#C8E6C9]">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs sm:text-sm font-bold text-[#1E5624] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                {t('অফিশিয়াল ডাক্তারের ইনভাইটেশন ও অ্যাপয়েন্টমেন্ট নিশ্চয়তা', 'Official Doctor Invitation & Appointment Assurance')}
              </h4>
              <p className="text-[11.5px] sm:text-xs text-[#425C47] leading-relaxed mt-0.5">
                {isBn ? (
                  <>
                    আমরা প্রতিটি শীর্ষ হাসপাতাল থেকে রোগীর জন্য সরাসরি <strong>অফিশিয়াল ডাক্তারের ইনভাইটেশন লেটার</strong> ও <strong>বিশেষজ্ঞ ডাক্তার অ্যাপয়েন্টমেন্ট</strong> কনফার্মেশন সংগ্রহ করি।
                  </>
                ) : (
                  <>
                    We directly arrange verified <strong>Official Doctor Invitation Letters</strong> and <strong>Specialist Appointment Confirmations</strong> from every partner hospital.
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="hospital-banner-wa-btn"
            onClick={handleOpenGeneralInvitation}
            className="btn-3d-matte-green px-3.5 py-1.5 text-xs font-bold whitespace-nowrap self-stretch sm:self-auto text-center cursor-pointer"
          >
            {t('ইনভাইটেশন লেটার নিন', 'Get Invitation Letter')}
          </button>
        </div>

        {/* Enriched Bilingual Smart Search & Department Filters Box */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-[#D4E2D6] shadow-sm mb-5 space-y-3">
          {/* Smart Bilingual Search Input with Live Autocomplete Dropdown */}
          <div ref={searchWrapperRef} className="relative">
            <div className="relative flex items-center">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                <Search className="w-4 h-4 text-[#2E7D32]" />
              </div>
              <input
                id="hospital-search-input"
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchDropdownOpen(true);
                }}
                placeholder={t(
                  'বাংলা বা ইংরেজিতে রোগের বিভাগ, হাসপাতাল বা শহর খুঁজুন (যেমন: কার্ডিওলজি, Urology, গ্যাস্ট্রো, অ্যাপোলো, চেন্নাই, কলকাতা)...',
                  'Search department, hospital, or city in Bangla or English (e.g. Cardiology, Urology, Gastro, Apollo, Chennai, Kolkata)...'
                )}
                className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm bg-[#F8FAF8] border border-[#C5D8C7] rounded-xl text-[#1E2519] font-medium placeholder:text-[#788873] focus:outline-none focus:border-[#2E7D32] focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/15 transition-all"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    type="button"
                    id="clear-hospital-search"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDept('all');
                    }}
                    className="p-1 rounded-lg text-[#65715D] hover:text-[#1E2519] hover:bg-[#EFECE4] cursor-pointer transition-colors"
                    title={t('মুছে ফেলুন', 'Clear search')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#1E5624] text-[10px] font-bold border border-[#C8E6C9]">
                    <Sparkles className="w-2.5 h-2.5 text-[#2E7D32]" />
                    {t('বাংলা / EN', 'BN / EN')}
                  </span>
                )}
              </div>
            </div>

            {/* Live Autocomplete Suggestion Dropdown */}
            {isSearchDropdownOpen && (
              <div
                id="hospital-smart-search-dropdown"
                className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-xl border border-[#CDE0C8] shadow-xl max-h-80 overflow-y-auto divide-y divide-[#EFECE4] text-left"
              >
                {/* Matching Medical Departments */}
                {matchedDepartmentRecords.length > 0 && (
                  <div className="p-2.5">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#5A6B58] px-2 pb-1.5 flex items-center justify-between">
                      <span>{t('চিকিৎসা ও রোগের বিভাগ (বাংলা ও English)', 'Medical Departments (Bangla & English)')}</span>
                      <span className="text-[10px] text-[#2E7D32] font-semibold">
                        {t('ক্লিক করে ফিল্টার করুন', 'Click to filter')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {matchedDepartmentRecords.slice(0, 8).map((dept) => (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => {
                            const hasChip = DEPARTMENT_FILTERS.some((df) => df.id === dept.id);
                            if (hasChip) {
                              setSelectedDept(dept.id);
                              setSearchQuery('');
                            } else {
                              setSelectedDept('all');
                              setSearchQuery(isBn ? dept.bn.split('(')[0].trim() : dept.en.split('(')[0].trim());
                            }
                            setIsSearchDropdownOpen(false);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F3F8F4] hover:bg-[#E2F2E5] border border-[#CDE2D0] text-[11px] font-semibold text-[#1B4B27] transition-colors cursor-pointer"
                        >
                          <Stethoscope className="w-3 h-3 text-[#2E7D32]" />
                          <span>{isBn ? dept.bn : dept.en}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Partner Hospitals & Verified Branches */}
                <div className="p-2.5">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#5A6B58] px-2 pb-1.5 flex items-center justify-between">
                    <span>
                      {t('হাসপাতাল ও শাখাসমূহ', 'Partner Hospitals & Branches')} ({num(filteredHospitals.length)})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSearchDropdownOpen(false)}
                      className="text-[10.5px] text-[#65715D] hover:text-[#1E2519] font-semibold cursor-pointer"
                    >
                      {t('বন্ধ করুন ✕', 'Close ✕')}
                    </button>
                  </div>

                  {filteredHospitals.length === 0 ? (
                    <div className="px-3 py-3 text-xs text-[#65715D] flex items-center justify-between gap-2">
                      <span>
                        {t(
                          'তালিকায় সরাসরি মিল পাওয়া যায়নি — তবে আপনি যেকোনো হাসপাতালের জন্য ইনভাইটেশন লেটারের আবেদন করতে পারবেন।',
                          'No exact filter match — you can still request an invitation letter for any custom hospital.'
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchDropdownOpen(false);
                          handleOpenGeneralInvitation();
                        }}
                        className="btn-3d-matte-green px-2.5 py-1 text-[11px] font-bold rounded-[5px] whitespace-nowrap cursor-pointer"
                      >
                        {t('ইনভাইটেশন ফর্ম খুলুন', 'Open Invitation Form')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredHospitals.slice(0, 6).map((hosp) => {
                        const verifiedRec = VERIFIED_HOSPITAL_BRANCHES.find((v) => v.hospitalId === hosp.id);
                        return (
                          <div
                            key={hosp.id}
                            className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#F5F8F5] transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setIsSearchDropdownOpen(false);
                                setSelectedHospitalId(hosp.id);
                              }}
                              className="flex items-start gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                            >
                              <Building2 className="w-4 h-4 text-[#2E7D32] mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#1E2519] truncate">
                                  {hosp.name}
                                </div>
                                <div className="text-[11px] text-[#5A6854] truncate">
                                  {hosp.location}
                                  {verifiedRec ? ` • ${num(verifiedRec.branches.length)}${t('টি শাখা', ' branches')}` : ''}
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setIsSearchDropdownOpen(false);
                                handleOpenHospitalInvitation(hosp);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#14451D] border border-[#A5D6A7] text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors"
                            >
                              <FileCheck2 className="w-3 h-3 text-[#2E7D32]" />
                              <span>{t('ইনভাইটেশন নিন', 'Get Invitation')}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Department Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
            {DEPARTMENT_FILTERS.map((dept) => {
              const isSelected = selectedDept === dept.id;
              return (
                <button
                  key={dept.id}
                  id={`filter-dept-${dept.id}`}
                  type="button"
                  onClick={() => setSelectedDept(dept.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer border text-[11.5px] ${
                    isSelected
                      ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-xs'
                      : 'bg-[#FAF9F5] text-[#4E5C46] border-[#DCD6C4] hover:bg-[#F0EBE0] hover:text-[#1E2519]'
                  }`}
                >
                  <span>{dept.emoji}</span>
                  <span>{isBn ? dept.bn : dept.en}</span>
                </button>
              );
            })}
          </div>

          {/* Match Counter & Reset */}
          <div className="flex items-center justify-between text-xs text-[#6B7563] pt-1.5 border-t border-[#EFEBE0]">
            <span>
              {isBn ? (
                <>
                  মোট <strong>{num(filteredHospitals.length)}</strong>টি হাসপাতাল প্রদর্শিত হচ্ছে
                </>
              ) : (
                <>
                  Showing <strong>{filteredHospitals.length}</strong> partner hospitals
                </>
              )}
            </span>
            {(searchQuery || selectedDept !== 'all') && (
              <button
                type="button"
                id="reset-hospital-filters"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('all');
                }}
                className="text-[#2E7D32] font-semibold hover:underline cursor-pointer"
              >
                {t('সব ফিল্টার মুছুন', 'Reset Filters')}
              </button>
            )}
          </div>
        </div>

        {/* Hospital Polaroid Cards Row */}
        {filteredHospitals.length === 0 ? (
          <div className="text-center py-10 bg-white/70 rounded-2xl border border-dashed border-[#D5CFBF] p-6">
            <Building2 className="w-10 h-10 text-[#A0AA98] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1E2519]">
              {t('কোনো হাসপাতাল পাওয়া যায়নি', 'No matching hospitals found')}
            </p>
            <p className="text-xs text-[#6B7563] mt-1">
              {t('অন্য কোনো রোগের নাম বা শব্দ দিয়ে আবার চেষ্টা করুন অথবা সরাসরি ইনভাইটেশন ফর্মে আপনার হাসপাতালের নাম লিখুন।', 'Try searching with a different condition, city, or hospital name, or enter your hospital manually in the invitation form.')}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('all');
                }}
                className="btn-3d-matte-secondary px-3.5 py-1.5 text-xs font-semibold rounded-full cursor-pointer"
              >
                {t('সকল হাসপাতাল দেখুন', 'Show All Hospitals')}
              </button>
              <button
                type="button"
                onClick={handleOpenGeneralInvitation}
                className="btn-3d-matte-green px-3.5 py-1.5 text-xs font-bold rounded-full cursor-pointer"
              >
                {t('ইনভাইটেশন লেটার নিন', 'Get Invitation Letter')}
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="dest-scroll" 
            id="hospitals-scroll-container"
            ref={hospitalScrollRef}
          >
            {filteredHospitals.map((hospital) => (
              <div 
                key={hospital.id} 
                id={`hospital-polaroid-${hospital.id}`}
                onClick={() => setSelectedHospitalId(hospital.id)}
                className="polaroid cursor-pointer group text-left"
              >
                {/* Building Facade Photo with City Tag */}
                <div className="relative overflow-hidden rounded-lg bg-[#E8E4D8]">
                  <img 
                    src={hospital.image} 
                    alt={hospital.name} 
                    loading="lazy" 
                    className="w-full h-[180px] object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = CONFIG.fallbackImage;
                    }}
                  />
                  
                  {/* Top-Left: City Tag */}
                  <div className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1 border border-white/20 z-10 shadow-sm">
                    <MapPin className="w-2.5 h-2.5 text-[#A3D69B]" />
                    <span>{hospital.city}</span>
                  </div>

                  {/* Quick View Hint Overlay */}
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center">
                    <span className="bg-white/95 text-[#1E2519] text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-[#2E7D32]" />
                      {t('বিস্তারিত ও বিভাগসমূহ', 'Details & Departments')}
                    </span>
                  </div>
                </div>

                {/* Hospital Info & Specialties */}
                <div className="mt-2.5 flex flex-col flex-1 justify-between text-left items-start">
                  <div className="w-full text-left">
                    {/* Hospital Name: Fixed 2-line height for aligned cards */}
                    <h4 className="font-['Space_Grotesk'] text-[14px] font-bold text-[#1E2519] group-hover:text-[#2E7D32] transition-colors line-clamp-2 min-h-[38px] flex items-start text-left leading-snug">
                      {hospital.name}
                    </h4>
                    <p className="text-[11px] text-[#65715D] flex items-center justify-start gap-1 mt-0.5 line-clamp-1 text-left">
                      <Building2 className="w-3 h-3 text-[#8C9685] flex-shrink-0" />
                      <span className="text-left truncate">{hospital.location}</span>
                    </p>

                    {/* Top 2 Specialities Pills */}
                    <div className="mt-2 flex flex-wrap gap-1 justify-start text-left">
                      {hospital.specialties.slice(0, 2).map((spec, i) => (
                        <span 
                          key={i}
                          className="text-[10px] font-medium bg-[#F0ECE1] text-[#3D4737] px-2 py-0.5 rounded line-clamp-1 max-w-full text-left"
                        >
                          {spec.replace(/^[^\w\u0980-\u09FF]+/, '')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Clean Bottom Action Tag */}
                  <div className="w-full mt-2.5 pt-2 border-t border-[#EFEBE0] flex items-center justify-between text-[11px] font-bold text-[#2E7D32]">
                    <span>{t('অ্যাপয়েন্টমেন্ট ও তথ্য', 'Appointment & Details')}</span>
                    <span className="text-[#2E7D32] group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Arrows for Hospital Scroll */}
        {filteredHospitals.length > 0 && (
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4">
            <button
              type="button"
              id="hospital-prev-btn"
              onClick={() => scrollContainer(hospitalScrollRef, 'left')}
              className="dest-nav-btn"
              aria-label={t('পূর্ববর্তী হাসপাতাল', 'Previous hospital')}
              title={t('পূর্ববর্তী', 'Previous')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              id="hospital-next-btn"
              onClick={() => scrollContainer(hospitalScrollRef, 'right')}
              className="dest-nav-btn"
              aria-label={t('পরবর্তী হাসপাতাল', 'Next hospital')}
              title={t('পরবর্তী', 'Next')}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Hospital Detail Pop-up Modal */}
      <HospitalDetailModal
        hospital={selectedHospital}
        onClose={() => setSelectedHospitalId(null)}
        onOpenInvitation={handleOpenHospitalInvitation}
      />

      {/* Dedicated Medical Visa & Hospital Invitation Letter Modal */}
      <MedicalInvitationModal
        isOpen={isMedicalInvitationOpen}
        onClose={() => setIsMedicalInvitationOpen(false)}
        initialHospital={invitationHospital}
      />

      {/* Destination Detail Pop-up Modal */}
      <DestinationDetailModal
        destination={selectedDestination}
        onClose={() => setSelectedDestId(null)}
      />
    </section>
  );
};

