import React from 'react';
import { Puzzle, ExternalLink, Sparkles, ShieldCheck, ArrowDownRight } from 'lucide-react';
import { CONFIG } from '../config';
import { useLanguage } from '../context/LanguageContext';

interface HeroExtensionBarProps {
  onJumpToTools?: () => void;
}

export const HeroExtensionBar: React.FC<HeroExtensionBarProps> = ({ onJumpToTools }) => {
  const { t } = useLanguage();

  return (
    <>
      <section
        aria-label={t('অফিশিয়াল ক্রোম এক্সটেনশন সহায়তা', 'Official Chrome Extension Support')}
        className="relative z-10 w-full max-w-5xl mx-auto !px-4 !py-4 sm:!py-6"
      >
        <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-[#CCD3FB] shadow-xs px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#EEF1FE] border border-[#BAC5FA] text-[#263375] flex items-center justify-center shrink-0">
            <Puzzle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E6F4E8] text-[#1D5E29] border border-[#C5E2CA]">
                {t('ক্রোম এক্সটেনশন', 'Chrome Extension')}
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-[#161D28] font-['Space_Grotesk'] truncate">
                {CONFIG.chromeExtension.name}
              </h2>
            </div>
            <p className="text-[11.5px] sm:text-xs text-[#4C5565] mt-0.5 leading-snug">
              {t(
                'নিজে অনলাইন ইন্ডিয়ান ভিসা ফর্ম পূরণে সময় বাঁচাতে ও টাইপিং ভুল এড়াতে আমাদের অফিশিয়াল অটোফিল এক্সটেনশন ব্যবহার করুন।',
                'Save time and prevent typing errors on Indian visa online forms using our official Chrome Web Store autofill extension.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          {onJumpToTools && (
            <button
              type="button"
              id="hero-jump-tools-btn"
              onClick={onJumpToTools}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F4F6FF] hover:bg-[#E7EBFE] text-[#263375] border border-[#CCD3FB] transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>{t('ভিসা টুলস হাব', 'Visa Tools Hub')}</span>
              <ArrowDownRight className="w-3.5 h-3.5" />
            </button>
          )}
          <a
            id="hero-extension-install-link"
            href={CONFIG.chromeExtension.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-3d-matte-primary px-3.5 py-1.5 text-xs font-bold rounded-full inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>{t('Chrome-এ যুক্ত করুন', 'Add to Chrome')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        </div>
      </section>
      <div className="w-full max-w-5xl mx-auto px-5 md:hidden" aria-hidden="true">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#BAC5FA] to-transparent" />
      </div>
    </>
  );
};

export const ExtensionSpotlightCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div
      id="chrome-extension-spotlight"
      className="mt-6 rounded-2xl bg-gradient-to-br from-[#F4F6FF] via-white to-[#F2F6EF] border border-[#C6D0FB] p-4 sm:p-5 shadow-xs"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#263375] text-white">
              <Sparkles className="w-3 h-3" />
              {t('১-ক্লিকে ৩০ সেকেন্ডে ফর্ম অটোফিল', '1-Click 30s Form Autofill')}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#161D28]">
              {CONFIG.chromeExtension.name}
            </h3>
          </div>

          <p className="text-xs sm:text-[13.5px] text-[#3B4454] leading-relaxed">
            {t(
              'শুধু পাসপোর্ট বা পূর্বের ভিসা ফর্ম (PDF) দিয়ে কিংবা একবার প্রোফাইল সেভ করে মাত্র এক ক্লিকে ৩০ সেকেন্ডের মধ্যে ইন্ডিয়ান ভিসার পুরো মাল্টি-স্টেপ অনলাইন ফর্ম ও আইভ্যাক অ্যাপয়েন্টমেন্ট পেজ নির্ভুলভাবে অটোমেটিক পূরণ করুন।',
              'Simply use a passport scan or previous form PDF, or save an applicant profile once, to auto-populate the entire multi-step Indian visa form and IVAC booking fields in under 30 seconds with one click.'
            )}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-[#364935] font-medium pt-0.5">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              {t('১-ক্লিকে মাল্টি-স্টেপ ফর্ম ও ক্যাপচা অ্যাসিস্ট', '1-Click Multi-Step Fill & Instant Captcha Solver')}
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              {t('একাধিক প্রোফাইল ও ছবি/PDF লোকাল স্টোরেজ', 'Multiple Profiles & Local Photo/Document Storage')}
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              {t('১০০% নিরাপদ — কেবল আপনার ব্রাউজারে চলে', '100% Private — Runs Locally in Your Browser')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            id="tools-extension-install-btn"
            href={CONFIG.chromeExtension.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-3d-matte-primary px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Puzzle className="w-4 h-4" />
            <span>{t('Chrome Web Store থেকে দেখুন', 'Install from Chrome Web Store')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
