import React from 'react';
import { Puzzle, ExternalLink, Zap, ShieldCheck, ArrowDownRight } from 'lucide-react';
import { CONFIG } from '../config';
import { useLanguage } from '../context/LanguageContext';

export type ExtensionAuroraVariant = 'hero-bar' | 'spotlight' | 'about-card' | 'footer' | 'compact';

interface ExtensionAuroraShellProps {
  variant: ExtensionAuroraVariant;
  id?: string;
  className?: string;
  innerClassName?: string;
  href?: string;
  target?: string;
  rel?: string;
  title?: string;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLDivElement>;
  children: React.ReactNode;
}

const VARIANT_RADII: Record<ExtensionAuroraVariant, { outer: string; inner: string }> = {
  'hero-bar': { outer: 'rounded-[18px]', inner: 'rounded-[16.25px]' },
  spotlight: { outer: 'rounded-[20px]', inner: 'rounded-[18.25px]' },
  'about-card': { outer: 'rounded-[26px]', inner: 'rounded-[24.25px]' },
  footer: { outer: 'rounded-[6.5px]', inner: 'rounded-[5px]' },
  compact: { outer: 'rounded-[12px]', inner: 'rounded-[10.5px]' },
};

export const ExtensionAuroraShell: React.FC<ExtensionAuroraShellProps> = ({
  variant,
  id,
  className = '',
  innerClassName = '',
  href,
  target,
  rel,
  title,
  ariaLabel,
  onClick,
  children,
}) => {
  const { outer, inner } = VARIANT_RADII[variant];
  const variantClass =
    variant === 'footer'
      ? 'ext-aurora-outer--footer'
      : variant === 'compact'
        ? 'ext-aurora-outer--compact'
        : '';
  const outerClasses = `ext-aurora-outer ${variantClass} ${outer} ${className}`;
  const isAboutCard = variant === 'about-card';

  const content = (
    <div className={`ext-aurora-border-frame ${outer} ${isAboutCard ? 'h-full' : ''}`}>
      <div className={`ext-aurora-inner ${inner} ${innerClassName}`}>
        {/* 4 Fluid GPU-Accelerated Processing Hub Brand Orbs */}
        <div className="ext-aurora-orbs" aria-hidden="true">
          <span className="ext-aurora-orb ext-aurora-orb--blue" />
          <span className="ext-aurora-orb ext-aurora-orb--green" />
          <span className="ext-aurora-orb ext-aurora-orb--cyan" />
          <span className="ext-aurora-orb ext-aurora-orb--purple" />
        </div>

        {/* Soft Frosted Glass Sheen (Static, No Shimmer Sweep) */}
        <div className="ext-aurora-glaze" aria-hidden="true" />

        {/* High-Contrast Foreground Slot */}
        <div className={`ext-aurora-content ${isAboutCard ? 'h-full flex flex-col justify-between gap-4' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        id={id}
        href={href}
        target={target}
        rel={rel}
        title={title}
        aria-label={ariaLabel}
        onClick={onClick}
        className={`${outerClasses} group`}
      >
        {content}
      </a>
    );
  }

  return (
    <div id={id} title={title} aria-label={ariaLabel} onClick={onClick} className={outerClasses}>
      {content}
    </div>
  );
};

interface HeroExtensionBarProps {
  onJumpToTools?: () => void;
}

export const HeroExtensionBar: React.FC<HeroExtensionBarProps> = ({ onJumpToTools }) => {
  const { language, t } = useLanguage();

  return (
    <>
      <section
        aria-label={t('অফিশিয়াল ক্রোম এক্সটেনশন সহায়তা', 'Official Chrome Extension Support')}
        className="relative z-10 w-full max-w-5xl mx-auto !px-4 !py-4 sm:!py-6"
      >
        <ExtensionAuroraShell
          variant="hero-bar"
          innerClassName="px-4 py-3.5 sm:px-5 sm:py-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="ext-aurora-icon-box w-11 h-11 rounded-[8px] text-white flex items-center justify-center shrink-0">
                <Puzzle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="ext-aurora-badge inline-flex items-center gap-1 text-[10.5px] font-bold tracking-wide px-2.5 py-0.5 rounded-[5px]">
                    <Zap className="w-3 h-3 text-[#D97706] fill-[#FACC15] shrink-0" />
                    {t('ক্রোম এক্সটেনশন', 'Chrome Extension')}
                  </span>
                  <h2 className="ext-aurora-gradient-text text-sm sm:text-[15.5px] font-extrabold font-['Space_Grotesk'] tracking-tight truncate">
                    {CONFIG.chromeExtension.name}
                  </h2>
                </div>
                <p className="text-[12px] sm:text-[12.5px] text-[#243043] font-medium mt-1 leading-snug">
                  {language === 'bn' ? (
                    <>
                      নিজে অনলাইন ইন্ডিয়ান ভিসা ফর্ম পূরণে সময় বাঁচাতে ও টাইপিং ভুল এড়াতে মাত্র{' '}
                      <span className="ext-aurora-gradient-text font-extrabold">
                        ৩০ সেকেন্ডে অটোফিল
                      </span>{' '}
                      করুন আমাদের অফিশিয়াল এক্সটেনশনে।
                    </>
                  ) : (
                    <>
                      Save time and prevent typing errors with{' '}
                      <span className="ext-aurora-gradient-text font-extrabold">
                        30s 1-Click Autofill
                      </span>{' '}
                      for Indian visa online forms via our official Chrome extension.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-auto justify-end shrink-0 ml-auto">
              {onJumpToTools && (
                <button
                  type="button"
                  id="hero-jump-tools-btn"
                  onClick={onJumpToTools}
                  className="w-fit px-2.5 py-1.5 leading-tight rounded-[5px] text-xs font-semibold bg-white/80 hover:bg-white text-[#1E2E6E] border border-[#BAC5FA]/80 shadow-2xs transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
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
                className="btn-3d-matte-primary ext-cta-glow w-fit px-2.5 py-1.5 leading-tight text-xs font-bold rounded-[5px] inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>{t('Chrome-এ যুক্ত করুন', 'Add to Chrome')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </ExtensionAuroraShell>
      </section>
      <div className="w-full max-w-5xl mx-auto px-5 md:hidden" aria-hidden="true">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#BAC5FA] to-transparent" />
      </div>
    </>
  );
};

export const ExtensionSpotlightCard: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <ExtensionAuroraShell
      id="chrome-extension-spotlight"
      variant="spotlight"
      className="mt-6"
      innerClassName="p-4 sm:p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="ext-aurora-icon-box w-10 h-10 rounded-[8px] text-white flex items-center justify-center shrink-0">
              <Puzzle className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="ext-aurora-badge inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] text-[11px] font-bold">
                <Zap className="w-3.5 h-3.5 text-[#D97706] fill-[#FACC15] shrink-0" />
                <span className="ext-aurora-gradient-text font-extrabold">
                  {t('১-ক্লিকে ৩০ সেকেন্ডে ফর্ম অটোফিল', '1-Click 30s Form Autofill')}
                </span>
              </span>
              <h3 className="ext-aurora-gradient-text text-base sm:text-lg font-extrabold tracking-tight">
                {CONFIG.chromeExtension.name}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-[13.5px] text-[#243043] font-medium leading-relaxed">
            {language === 'bn' ? (
              <>
                শুধু পাসপোর্ট বা পূর্বের ভিসা ফর্ম (PDF) দিয়ে কিংবা একবার প্রোফাইল সেভ করে মাত্র{' '}
                <span className="ext-aurora-gradient-text font-extrabold">
                  এক ক্লিকে ৩০ সেকেন্ডের মধ্যে
                </span>{' '}
                ইন্ডিয়ান ভিসার পুরো মাল্টি-স্টেপ অনলাইন ফর্ম ও আইভ্যাক অ্যাপয়েন্টমেন্ট পেজ নির্ভুলভাবে অটোমেটিক পূরণ করুন।
              </>
            ) : (
              <>
                Simply use a passport scan or previous form PDF, or save an applicant profile once, to auto-populate the entire multi-step Indian visa form and IVAC booking fields in{' '}
                <span className="ext-aurora-gradient-text font-extrabold">
                  under 30 seconds with one click
                </span>
                .
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-[#1D3524] font-semibold pt-0.5">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B7A3B]" />
              {t('১-ক্লিকে মাল্টি-স্টেপ ফর্ম ও ক্যাপচা অ্যাসিস্ট', '1-Click Multi-Step Fill & Instant Captcha Solver')}
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B7A3B]" />
              {t('একাধিক প্রোফাইল ও ছবি/PDF লোকাল স্টোরেজ', 'Multiple Profiles & Local Photo/Document Storage')}
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B7A3B]" />
              {t('১০০% নিরাপদ — কেবল আপনার ব্রাউজারে চলে', '100% Private — Runs Locally in Your Browser')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            id="tools-extension-install-btn"
            href={CONFIG.chromeExtension.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-3d-matte-primary ext-cta-glow w-fit px-3 py-1.5 leading-tight rounded-[5px] text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>{t('Chrome Web Store থেকে দেখুন', 'Install from Chrome Web Store')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </ExtensionAuroraShell>
  );
};
