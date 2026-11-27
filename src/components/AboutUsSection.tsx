import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  CalendarClock,
  HeadphonesIcon,
  MapPin,
  PhoneCall,
  Mail,
  Puzzle,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { CONFIG, getPhoneDisplay } from '../config';
import { useLanguage } from '../context/LanguageContext';
import { ExtensionAuroraShell } from './ExtensionSpotlightBanner';

interface AboutUsSectionProps {
  onNavigateServices?: () => void;
  onNavigateContact?: () => void;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({
  onNavigateServices,
  onNavigateContact,
}) => {
  const { language, t } = useLanguage();
  const phoneDisplay = getPhoneDisplay(language);

  const workflowSteps = [
    {
      stepBn: '০১',
      stepEn: '01',
      titleBn: 'প্রাথমিক ডকুমেন্ট ও প্রোফাইল যাচাই',
      titleEn: 'Initial Document & Profile Audit',
      descBn:
        'আপনার পাসপোর্ট, ভোটার আইডি (NID), ইউটিলিটি বিল এবং পেশাগত ও আর্থিক কাগজপত্রের প্রতিটি তথ্য পুঙ্খানুপুঙ্খভাবে মিলিয়ে দেখা হয় যেন কোনো বানান বা তথ্যের গড়মিল না থাকে।',
      descEn:
        'We thoroughly cross-check your passport, NID, utility bill, and occupational/financial records so there are zero spelling or data discrepancies.',
    },
    {
      stepBn: '০২',
      stepEn: '02',
      titleBn: 'নির্ভুল অনলাইন আবেদন ও ফাইল প্রস্তুতি',
      titleEn: 'Accurate Online Form & File Preparation',
      descBn:
        'ভারতীয় ভিসা অনলাইন পোর্টালে নির্ভুলভাবে আবেদন ফর্ম পূরণ, ২×২ ল্যাব-স্ট্যান্ডার্ড ছবি যাচাই এবং ক্যাটাগরি অনুযায়ী সম্পূর্ণ ফাইল সাজিয়ে প্রস্তুত করা হয়।',
      descEn:
        'We prepare your multi-step online application form, verify 2×2 photo compliance, and organize your complete submission file by visa category.',
    },
    {
      stepBn: '০৩',
      stepEn: '03',
      titleBn: 'আইভ্যাক (IVAC) স্লট বুকিং ও জমা নির্দেশনা',
      titleEn: 'IVAC Slot Booking & Submission Guidance',
      descBn:
        'সার্বক্ষণিক মনিটরিংয়ের মাধ্যমে আপনার পছন্দের আইভ্যাক কেন্দ্রে অ্যাপয়েন্টমেন্ট ডেট বা স্লট বুকিং সম্পন্ন করে ফাইল জমা দেওয়ার পূর্ণাঙ্গ গাইডলাইন প্রদান করা হয়।',
      descEn:
        'Our team monitors slot availability to confirm your appointment at your preferred IVAC center and guides you through smooth counter submission.',
    },
  ];

  const highlights = [
    {
      icon: FileCheck2,
      titleBn: '১০০% নির্ভুল ডকুমেন্ট যাচাই',
      titleEn: '100% Accurate Document Verification',
      descBn:
        'ফর্ম পূরণে ভুল বা কাগজপত্রের অসংগতির কারণে ভিসা রিজেকশনের ঝুঁকি কমাতে প্রতিটি ফাইল অভিজ্ঞ কনসালট্যান্টের মাধ্যমে যাচাই করা হয়।',
      descEn:
        'Every file is audited by experienced consultants to eliminate form errors or document mismatches that cause visa rejection.',
    },
    {
      icon: CalendarClock,
      titleBn: 'দ্রুত আইভ্যাক স্লট ও মেডিকেল সহায়তা',
      titleEn: 'Fast IVAC Slot & Medical Visa Support',
      descBn:
        'ট্যুরিস্ট, মেডিকেল ও অ্যাটেনডেন্ট, বিজনেস, ডাবল এন্ট্রি (X-3) ও স্টুডেন্ট ভিসার স্লট বুকিং এবং ভারতের শীর্ষ হাসপাতালের অফিসিয়াল ইনভাইটেশন লেটার সংগ্রহে দ্রুত সহায়তা।',
      descEn:
        'Dedicated slot booking for Tourist, Medical, Business, Double Entry (X-3), and Student visas plus official hospital invitation letters.',
    },
    {
      icon: HeadphonesIcon,
      titleBn: 'সরাসরি এজেন্ট ও হোয়াটসঅ্যাপ সাপোর্ট',
      titleEn: 'Direct Agent & WhatsApp Assistance',
      descBn:
        'ফাইল তৈরি থেকে শুরু করে আইভ্যাকে জমা দেওয়া পর্যন্ত যেকোনো প্রশ্নে আমাদের সাপোর্ট টিম ফোন ও হোয়াটসঅ্যাপে সার্বক্ষণিক পাশে থাকে।',
      descEn:
        'From initial file preparation to final IVAC counter submission, our specialists remain accessible via phone and WhatsApp.',
    },
  ];

  return (
    <section id="about" className="relative pt-28 sm:pt-32 pb-16 px-4">
      <div className="w-full max-w-6xl mx-auto space-y-10">
        {/* Hero / Header Card */}
        <div className="rounded-3xl bg-white/95 border border-[#D8DEFA] p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E743B] bg-[#EBF7EE] px-3.5 py-1 rounded-full border border-[#CDE5D5]">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('আমাদের সম্পর্কে · Processing Hub', 'About Us · Processing Hub')}
            </span>

            <h1 className="text-2xl sm:text-4xl font-bold text-[#161D28] tracking-tight leading-tight">
              {t(
                'নির্ভুল ইন্ডিয়ান ভিসা প্রসেসিং, ফাইল যাচাই ও ট্রাভেল সহায়তায় আপনার বিশ্বস্ত সহযোগী',
                'Your Trusted Partner for Accurate Indian Visa Processing, File Verification & Travel Support'
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#4A5545] leading-relaxed">
              {t(
                'Processing Hub বাংলাদেশের ভ্রমণকারী, রোগী, শিক্ষার্থী ও ব্যবসায়ীদের জন্য একটি বিশেষায়িত ইন্ডিয়ান ভিসা প্রসেসিং ও ট্রাভেল ডকুমেন্টেশন সহায়তা প্রতিষ্ঠান। আমাদের মূল লক্ষ্য হলো সঠিক তথ্যের ভিত্তিতে নির্ভুলভাবে অনলাইন আবেদন ফর্ম প্রস্তুত করা, প্রয়োজনীয় কাগজপত্র যাচাই করা এবং দ্রুততম সময়ে আইভ্যাক (IVAC) অ্যাপয়েন্টমেন্ট স্লট ও হাসপাতাল ইনভাইটেশন সমন্বয় করা।',
                'Processing Hub is a specialized Indian visa processing and travel documentation assistance center serving travelers, medical patients, students, and business applicants across Bangladesh. Our mission is to eliminate application errors through rigorous document verification, accurate form preparation, and timely IVAC appointment coordination.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {onNavigateServices && (
                <button
                  type="button"
                  onClick={onNavigateServices}
                  className="btn-3d-matte-primary w-fit px-3 py-1.5 leading-tight rounded-[5px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t('আমাদের সকল সেবা দেখুন', 'Explore Our Services')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {onNavigateContact && (
                <button
                  type="button"
                  onClick={onNavigateContact}
                  className="btn-3d-matte-secondary w-fit px-3 py-1.5 leading-tight rounded-[5px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t('অফিসের ঠিকানা ও যোগাযোগ', 'Office Location & Contact')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Official Private Agency Disclaimer (Moved from Footer to About Us Page) */}
        <div
          id="official-agency-disclaimer"
          className="rounded-3xl bg-amber-50/90 border-2 border-amber-300/90 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
              {t('বিশেষ দ্রষ্টব্য · অফিশিয়াল ডিসক্লেইমার', 'Important Notice · Official Disclaimer')}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#161D28]">
              {t(
                'স্বাধীন ও বেসরকারি ভিসা প্রসেসিং এবং ট্রাভেল সহায়তা প্রতিষ্ঠান',
                'Independent Private Visa Processing & Travel Assistance Agency'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#3D4737] leading-relaxed">
              {t(
                'বিশেষ দ্রষ্টব্য: Processing Hub একটি স্বাধীন ও বেসরকারি ভিসা প্রসেসিং এবং ট্রাভেল সহায়তা প্রতিষ্ঠান। আমরা ভারতীয় হাইকমিশন (High Commission of India) বা অফিশিয়াল আইভ্যাক (IVAC)-এর কোনো সরকারি অঙ্গপ্রতিষ্ঠান নই; আমরা কেবল আবেদনকারীদের সুবিধার্থে অনলাইন আবেদন ফর্ম প্রস্তুতি, ডকুমেন্ট যাচাই, স্লট বুকিং সমন্বয় এবং হাসপাতাল ও ট্রাভেল লজিস্টিকসে পেশাদার সহায়তা প্রদান করি। ভিসা মঞ্জুর বা প্রত্যাখ্যানের চূড়ান্ত এখতিয়ার সম্পূর্ণরূপে ভারতীয় হাইকমিশনের।',
                'Disclaimer: Processing Hub is an independent private visa processing and travel assistance service. We are not affiliated with or an official government portal of IVAC or the High Commission of India; we provide independent file preparation, document verification, slot coordination, and medical/travel logistics assistance. Final visa issuance decisions rest solely with the High Commission of India.'
              )}
            </p>
          </div>
        </div>

        {/* Why Choose Processing Hub (3 Highlights) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {highlights.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white/90 border border-[#D8DEFA] p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-3"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#EEF1FE] border border-[#BAC5FA] text-[#263375] flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#161D28]">
                    {t(item.titleBn, item.titleEn)}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A5545] leading-relaxed">
                    {t(item.descBn, item.descEn)}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#ECEFF9] flex items-center gap-1.5 text-xs font-bold text-[#1E743B]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t('যাচাইকৃত ও বিশ্বস্ত সেবা', 'Verified & Trusted Support')}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3-Step Working Process */}
        <div className="rounded-3xl bg-white/95 border border-[#E2DFCC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#263375] bg-[#EEF1FE] px-3 py-1 rounded-full border border-[#CCD3FB]">
              {t('আমাদের কাজের ধাপ', 'How We Work')}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#161D28] mt-2.5">
              {t('মাত্র ৩টি সহজ ধাপে আপনার ভিসা ফাইল প্রস্তুত করা হয়', 'Your Visa File Prepared in 3 Structured Steps')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {workflowSteps.map((w, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#FAF9F5] border border-[#E6E2D5] p-5 space-y-2.5"
              >
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#263375] text-white text-xs font-bold">
                  {t(`ধাপ ${w.stepBn}`, `Step ${w.stepEn}`)}
                </div>
                <h3 className="text-base font-bold text-[#1E2519]">
                  {t(w.titleBn, w.titleEn)}
                </h3>
                <p className="text-xs sm:text-sm text-[#4E5C46] leading-relaxed">
                  {t(w.descBn, w.descEn)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Official Chrome Extension & Office Quick Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Chrome Extension Info (Aurora Highlighted Card) */}
          <ExtensionAuroraShell
            id="about-extension-card"
            variant="about-card"
            className="lg:col-span-7 h-full"
            innerClassName="p-6 h-full flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="ext-aurora-icon-box w-11 h-11 rounded-[8px] text-white flex items-center justify-center shrink-0">
                  <Puzzle className="w-5 h-5" />
                </div>
                <div className="ext-aurora-badge inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-[5px]">
                  <Zap className="w-3.5 h-3.5 text-[#D97706] fill-[#FACC15] shrink-0" />
                  <span>{t('আমাদের অফিশিয়াল প্রযুক্তি টুল', 'Our Official Productivity Tool')}</span>
                </div>
              </div>
              <h3 className="ext-aurora-gradient-text text-lg sm:text-xl font-extrabold tracking-tight">
                {CONFIG.chromeExtension.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#243043] font-medium leading-relaxed">
                {language === 'bn' ? (
                  <>
                    যারা নিজেরাই অনলাইনে ইন্ডিয়ান ভিসার ফর্ম পূরণ করেন, তাদের সময় বাঁচাতে ও টাইপিং ভুল এড়াতে আমরা তৈরি করেছি{' '}
                    <span className="ext-aurora-gradient-text font-extrabold">
                      Tracker - Indian Visa Autofill
                    </span>{' '}
                    ক্রোম এক্সটেনশন। পাসপোর্ট বা পূর্বের ফর্ম (PDF) দিয়ে{' '}
                    <span className="ext-aurora-gradient-text font-extrabold">
                      মাত্র এক ক্লিকে ৩০ সেকেন্ডে পুরো ফর্ম অটোফিল
                    </span>{' '}
                    করা যায়।
                  </>
                ) : (
                  <>
                    For applicants filling out Indian visa forms on their own, we built the{' '}
                    <span className="ext-aurora-gradient-text font-extrabold">
                      Tracker - Indian Visa Autofill
                    </span>{' '}
                    Chrome extension. Populate the entire multi-step form in{' '}
                    <span className="ext-aurora-gradient-text font-extrabold">
                      30 seconds with one click
                    </span>{' '}
                    using a passport scan or saved profile.
                  </>
                )}
              </p>
            </div>
            <div className="pt-1">
              <a
                href={CONFIG.chromeExtension.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d-matte-primary ext-cta-glow w-fit px-3 py-1.5 leading-tight rounded-[5px] text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Puzzle className="w-3.5 h-3.5" />
                <span>{t('Chrome Web Store-এ এক্সটেনশন দেখুন', 'View Extension on Chrome Web Store')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </ExtensionAuroraShell>

          {/* Right: Direct Office Info */}
          <div className="lg:col-span-5 rounded-3xl bg-white/95 border border-[#D8DEFA] p-6 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#161D28]">
                {t('অফিস ও সাপোর্ট ডেস্ক', 'Office & Support Desk')}
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-[#3D4737]">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#263375] shrink-0 mt-0.5" />
                  <span>{language === 'bn' ? CONFIG.fullAddress : CONFIG.fullAddressEn}</span>
                </p>
                <p className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#263375] shrink-0" />
                  <a href={`tel:${CONFIG.phone}`} className="font-bold text-[#263375] hover:underline">
                    {phoneDisplay}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#263375] shrink-0" />
                  <a href={`mailto:${CONFIG.email}`} className="hover:underline">
                    {CONFIG.email}
                  </a>
                </p>
              </div>
            </div>

            {onNavigateContact && (
              <button
                type="button"
                onClick={onNavigateContact}
                className="btn-3d-matte-secondary w-fit self-start py-1.5 px-3 leading-tight rounded-[5px] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{t('গুগল ম্যাপ ও যোগাযোগ পেজে যান', 'Go to Google Map & Contact Page')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
