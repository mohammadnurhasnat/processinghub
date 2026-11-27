import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CONFIG } from '../config';
import { useLanguage } from '../context/LanguageContext';

// 15 Compressed WebP Bangladeshi Natural Beauty Assets for Ultra-Fast Hero Loading
import saintMartinCheradwip from '../assets/images/hd_saintmartin_cheradwip_1790792435084.webp';
import saintMartinSunsetGolden from '../assets/images/hd_saintmartin_sunset_golden_1795759815775.webp';
import sylhetJaflongRiver from '../assets/images/hd_sylhet_jaflong_river_1795759816834.webp';
import rangamatiKaptaiLake from '../assets/images/hd_rangamati_kaptai_lake_1795759818421.webp';
import kuakataSunriseBeach from '../assets/images/hd_kuakata_sunrise_beach_1795759818507.webp';
import coxBazarMarineDrive from '../assets/images/hd_coxsbazar_marinedrive_1790792461383.webp';
import coxBazarInaniBeach from '../assets/images/hd_coxsbazar_inani_beach_1790792475767.webp';
import sreemangalTeaGarden from '../assets/images/hd_sreemangal_teagarden_1790792486507.webp';
import sreemangalLawachara from '../assets/images/hd_sreemangal_lawachara_1790792497624.webp';
import sajekValleyClouds from '../assets/images/hd_sajek_valley_clouds_1790792510491.webp';
import sajekWoodenResort from '../assets/images/hd_sajek_wooden_resort_1790792524379.webp';
import bandarbanNilgiri from '../assets/images/hd_bandarban_nilgiri_1790792536557.webp';
import bandarbanBogaLake from '../assets/images/hd_bandarban_bogalake_1790792547268.webp';
import sundarbansRiver from '../assets/images/hd_sundarbans_river_1790792557896.webp';
import sundarbansMangroveBoat from '../assets/images/hd_sundarbans_mangrove_boat_1790792569900.webp';

interface HeroSlide {
  id: string;
  image: string;
  locationBn: string;
  locationEn: string;
  altBn: string;
  altEn: string;
}

const ALL_SLIDES: HeroSlide[] = [
  {
    id: 'saintmartin-2',
    image: saintMartinSunsetGolden,
    locationBn: 'সোনালী সূর্যাস্ত · সেন্টমার্টিন দ্বীপ',
    locationEn: 'Golden Sunset · Saint Martin’s Island',
    altBn: 'সেন্টমার্টিন দ্বীপের সোনালী সূর্যাস্ত, প্রবাল সৈকত ও স্বচ্ছ নীল সাগর',
    altEn: 'Golden hour sunset, coral shoreline and turquoise sea at Saint Martin’s Island'
  },
  {
    id: 'jaflong-1',
    image: sylhetJaflongRiver,
    locationBn: 'স্বচ্ছ নদী ও পাহাড় · জাফলং, সিলেট',
    locationEn: 'Crystal River & Hills · Jaflong, Sylhet',
    altBn: 'সিলেট জাফলংয়ের স্বচ্ছ নীল নদী, রঙিন পাথর ও সবুজ পাহাড়',
    altEn: 'Crystal emerald river, smooth pebbles, boats and hills in Jaflong, Sylhet'
  },
  {
    id: 'kaptai-1',
    image: rangamatiKaptaiLake,
    locationBn: 'কুয়াশাচ্ছন্ন সকাল · কাপ্তাই লেক, রাঙামাটি',
    locationEn: 'Misty Morning · Kaptai Lake, Rangamati',
    altBn: 'রাঙামাটি কাপ্তাই লেকের কুয়াশাচ্ছন্ন সকাল ও সবুজ পাহাড়ের এরিয়াল দৃশ্য',
    altEn: 'Aerial view of misty morning emerald waters and green hills at Kaptai Lake, Rangamati'
  },
  {
    id: 'kuakata-1',
    image: kuakataSunriseBeach,
    locationBn: 'সোনালী সূর্যোদয় · কুয়াকাটা সমুদ্রসৈকত',
    locationEn: 'Golden Sunrise · Kuakata Sea Beach',
    altBn: 'কুয়াকাটা সমুদ্রসৈকতে সাগরের দিগন্তে সোনালী সূর্যোদয়',
    altEn: 'Warm golden sunrise reflecting across calm ocean waves at Kuakata Sea Beach'
  },
  {
    id: 'sajek-1',
    image: sajekValleyClouds,
    locationBn: 'সাজেক ভ্যালি · কংলাক পাহাড়',
    locationEn: 'Sajek Valley · Konglak Hill',
    altBn: 'সাজেক ভ্যালির মেঘ ও সবুজ পাহাড়',
    altEn: 'Clouds and green hills of Sajek Valley'
  },
  {
    id: 'saintmartin-1',
    image: saintMartinCheradwip,
    locationBn: 'ছেঁড়া দ্বীপ · সেন্টমার্টিন',
    locationEn: 'Chera Dwip · Saint Martin’s',
    altBn: 'সেন্টমার্টিন ছেঁড়া দ্বীপের নীল জলরাশি',
    altEn: 'Turquoise waters of Chera Dwip, Saint Martin’s'
  },
  {
    id: 'sreemangal-1',
    image: sreemangalTeaGarden,
    locationBn: 'সবুজ চা বাগান · শ্রীমঙ্গল',
    locationEn: 'Lush Tea Gardens · Sreemangal',
    altBn: 'শ্রীমঙ্গলের দিগন্তজোড়া চা বাগান',
    altEn: 'Expansive green tea gardens in Sreemangal'
  },
  {
    id: 'coxsbazar-1',
    image: coxBazarMarineDrive,
    locationBn: 'মেরিন ড্রাইভ · কক্সবাজার',
    locationEn: 'Marine Drive · Cox’s Bazar',
    altBn: 'কক্সবাজার মেরিন ড্রাইভ ও সমুদ্র সৈকত',
    altEn: 'Marine Drive scenic coastline in Cox’s Bazar'
  },
  {
    id: 'bandarban-1',
    image: bandarbanNilgiri,
    locationBn: 'নীলগিরি হিলটপ · বান্দরবান',
    locationEn: 'Nilgiri Hilltop · Bandarban',
    altBn: 'বান্দরবান নীলগিরি মেঘের উপত্যকা',
    altEn: 'Misty mountain valley at Nilgiri, Bandarban'
  },
  {
    id: 'sundarbans-1',
    image: sundarbansRiver,
    locationBn: 'সুন্দরবন ম্যানগ্রোভ বন',
    locationEn: 'Sundarbans Mangrove Forest',
    altBn: 'সুন্দরবনের শান্ত নদী ও ম্যানগ্রোভ বনাঞ্চল',
    altEn: 'Serene river and mangroves of the Sundarbans'
  },
  {
    id: 'sajek-2',
    image: sajekWoodenResort,
    locationBn: 'মেঘের রাজ্য · সাজেক রিসোর্ট',
    locationEn: 'Kingdom of Clouds · Sajek Resort',
    altBn: 'সাজেক ভ্যালির ইকো রিসোর্ট ও পাহাড়ের দৃশ্য',
    altEn: 'Eco wooden resort overlooking Sajek hills'
  },
  {
    id: 'sreemangal-2',
    image: sreemangalLawachara,
    locationBn: 'লাউয়াছড়া রেইনফরেস্ট · শ্রীমঙ্গল',
    locationEn: 'Lawachara Rainforest · Sreemangal',
    altBn: 'শ্রীমঙ্গল লাউয়াছড়া জাতীয় উদ্যান',
    altEn: 'Lawachara National Park rainforest in Sreemangal'
  },
  {
    id: 'coxsbazar-2',
    image: coxBazarInaniBeach,
    locationBn: 'ইনানী পাথুরে সৈকত · কক্সবাজার',
    locationEn: 'Inani Coral Beach · Cox’s Bazar',
    altBn: 'কক্সবাজার ইনানী বিচের সূর্যাস্ত ও প্রবাল পাথর',
    altEn: 'Sunset and coral stones at Inani Beach, Cox’s Bazar'
  },
  {
    id: 'bandarban-2',
    image: bandarbanBogaLake,
    locationBn: 'বগালেক ও পাহাড় · বান্দরবান',
    locationEn: 'Boga Lake & Hills · Bandarban',
    altBn: 'বান্দরবান বগালেক ও সবুজ পর্বতমালা',
    altEn: 'Boga Lake surrounded by green hills in Bandarban'
  },
  {
    id: 'sundarbans-2',
    image: sundarbansMangroveBoat,
    locationBn: 'ম্যানগ্রোভ জলপথ · সুন্দরবন',
    locationEn: 'Mangrove Waterways · Sundarbans',
    altBn: 'সুন্দরবনের জলপথ ও ঐতিহ্যবাহী কাঠের নৌকা',
    altEn: 'Traditional wooden boat along Sundarbans waterways'
  }
];

const createRandomizedSequence = (count: number): number[] => {
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
};

export const Hero: React.FC = () => {
  const { language, t, num } = useLanguage();
  const [slides] = useState<HeroSlide[]>(ALL_SLIDES);
  const [sequence] = useState<number[]>(() => createRandomizedSequence(ALL_SLIDES.length));
  const [sequenceIndex, setSequenceIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const initialSlideIndex = sequence[0] ?? 0;
  const activeSlideIndex = sequence[sequenceIndex] ?? 0;
  const nextSlideIndex = sequence[(sequenceIndex + 1) % sequence.length] ?? 0;
  const currentSlide = slides[activeSlideIndex];

  // Only mount Slide 0 on initial paint; remaining slides load progressively in background
  const [mountedSlides, setMountedSlides] = useState<Set<number>>(
    () => new Set([initialSlideIndex])
  );

  // Inject high-priority preload hint for the exact first visible Hero WebP slide
  useEffect(() => {
    const initialImage = slides[initialSlideIndex]?.image;
    if (!initialImage) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = initialImage;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
    };
  }, [initialSlideIndex, slides]);

  const mountSlide = useCallback((idx: number) => {
    setMountedSlides((prev) => {
      if (prev.has(idx)) return prev;
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }, []);

  // Defer preloading next slide until browser is idle so first slide paints with zero contention
  useEffect(() => {
    mountSlide(activeSlideIndex);
    let cancelled = false;
    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const scheduleNext = () => {
      if (cancelled) return;
      mountSlide(nextSlideIndex);
    };

    const delayMs = sequenceIndex === 0 ? 1800 : 900;
    timeoutId = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleId = (window as Window & {
          requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number;
        }).requestIdleCallback(scheduleNext, { timeout: 1500 });
      } else {
        scheduleNext();
      }
    }, delayMs);

    return () => {
      cancelled = true;
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (idleId !== null && 'cancelIdleCallback' in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
    };
  }, [activeSlideIndex, nextSlideIndex, sequenceIndex, mountSlide]);

  const goToNextSlide = useCallback(() => {
    setSequenceIndex((prev) => (prev + 1) % sequence.length);
  }, [sequence.length]);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      goToNextSlide();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, goToNextSlide]);

  const activeLocation = language === 'bn' ? currentSlide.locationBn : currentSlide.locationEn;

  return (
    <section
      id="hero-section"
      className="hero relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label={t('বাংলাদেশের প্রাকৃতিক সৌন্দর্যের দৃশ্য ও ভিসা সার্ভিস', 'Scenic views of Bangladesh and visa services')}
    >
      {/* Background Slides Container with Compressed WebP & Progressive Background Loading */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950 pointer-events-none">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;
          const isInitial = idx === initialSlideIndex;
          const shouldMount = isActive || mountedSlides.has(idx);
          if (!shouldMount) return null;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={language === 'bn' ? slide.altBn : slide.altEn}
                className="w-full h-full object-cover object-center select-none"
                referrerPolicy="no-referrer"
                loading={isActive || isInitial ? 'eager' : 'lazy'}
                fetchPriority={isActive ? 'high' : 'low'}
                decoding={isInitial ? 'sync' : 'async'}
              />
            </div>
          );
        })}

        {/* Soft Transparent Scrim */}
        <div
          className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-black/60 via-black/25 to-transparent md:from-black/65 md:via-black/25 md:to-transparent"
        />
        <div
          className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/45 via-transparent to-black/20"
        />
      </div>

      {/* Hero Content Overlay */}
      <div className="hero-content relative z-30 max-w-[650px] w-full text-white">
        {/* Scenic Location Indicator Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4 rounded-full bg-black/50 backdrop-blur-md border border-white/25 text-xs text-emerald-300 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide text-white drop-shadow">
            {activeLocation}
          </span>
        </div>

        <h1 className="text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] font-bold">
          {t('সহজ ও নির্ভুল ইন্ডিয়ান ভিসা প্রসেসিং', 'Fast & Accurate Indian Visa Processing')}
        </h1>

        <p className="text-white text-base sm:text-lg leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-medium">
          {t(
            'সঠিক ডকুমেন্টেশন ও অভিজ্ঞ ভিসা বিশেষজ্ঞদের সহায়তায় দ্রুততম সময়ে ভারতীয় ভিসা প্রাপ্তি নিশ্চিত করুন। কোনো প্রকার ঝামেলা ছাড়াই নিশ্চিন্তে আবেদন করুন।',
            'Ensure smooth Indian visa processing with accurate documentation and experienced specialist guidance. Apply with confidence and zero hassle.'
          )}
        </p>

        <div className="mt-6">
          <a
            id="hero-reserve-btn"
            className="btn-primary inline-flex items-center gap-2"
            href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I would like to get a free consultation for Indian Visa Processing.')}`}
            data-service-name={t('ফ্রি ভিসা পরামর্শ ও প্রাথমিক ফাইল যাচাই', 'Free Visa Consultation & Initial File Review')}
            data-section={t('হিরো সেকশন', 'Hero Section')}
            data-whatsapp-title={t('ফ্রি ভিসা পরামর্শ', 'Free Visa Consultation')}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{t('ফ্রি ভিসা পরামর্শ নিন', 'Get Free Visa Consultation')}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* 15-Slide Progress Indicator Dots */}
      <div
        className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center pointer-events-auto px-3"
        aria-label={t('স্লাইড নির্দেশক', 'Slide indicators')}
      >
        <div className="flex items-center gap-1 sm:gap-1.5 bg-black/45 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full border border-white/20 shadow-lg max-w-full overflow-x-auto no-scrollbar">
          {sequence.map((slideIndex, sIdx) => {
            const isDotActive = sIdx === sequenceIndex;
            const slideLoc = language === 'bn' ? slides[slideIndex].locationBn : slides[slideIndex].locationEn;
            return (
              <button
                key={slides[slideIndex].id}
                type="button"
                onClick={() => setSequenceIndex(sIdx)}
                className={`hero-dot-btn h-1.5 sm:h-2 rounded-full transition-all duration-300 shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isDotActive
                    ? 'w-5 sm:w-7 bg-emerald-400 shadow-md shadow-emerald-400/60'
                    : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/90 hover:w-3'
                }`}
                aria-label={t(`স্লাইড ${num(sIdx + 1)} (${slideLoc})`, `Slide ${sIdx + 1} (${slideLoc})`)}
                title={slideLoc}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
