import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CONFIG } from '../config';

// 12 Ultra-Sharp 8K High-Definition Bangladeshi Natural Beauty Assets
import saintMartinCheradwip from '../assets/images/hd_saintmartin_cheradwip_1790792435084.jpg';
import saintMartinCorals from '../assets/images/hd_saintmartin_corals_1790792449188.jpg';
import coxBazarMarineDrive from '../assets/images/hd_coxsbazar_marinedrive_1790792461383.jpg';
import coxBazarInaniBeach from '../assets/images/hd_coxsbazar_inani_beach_1790792475767.jpg';
import sreemangalTeaGarden from '../assets/images/hd_sreemangal_teagarden_1790792486507.jpg';
import sreemangalLawachara from '../assets/images/hd_sreemangal_lawachara_1790792497624.jpg';
import sajekValleyClouds from '../assets/images/hd_sajek_valley_clouds_1790792510491.jpg';
import sajekWoodenResort from '../assets/images/hd_sajek_wooden_resort_1790792524379.jpg';
import bandarbanNilgiri from '../assets/images/hd_bandarban_nilgiri_1790792536557.jpg';
import bandarbanBogaLake from '../assets/images/hd_bandarban_bogalake_1790792547268.jpg';
import sundarbansRiver from '../assets/images/hd_sundarbans_river_1790792557896.jpg';
import sundarbansMangroveBoat from '../assets/images/hd_sundarbans_mangrove_boat_1790792569900.jpg';

interface HeroSlide {
  id: string;
  image: string;
  location: string;
  division: string;
  alt: string;
}

const ALL_SLIDES: HeroSlide[] = [
  {
    id: 'sajek-1',
    image: sajekValleyClouds,
    location: 'সাজেক ভ্যালি · কংলাক পাহাড়',
    division: 'রাঙ্গামাটি',
    alt: 'সাজেক ভ্যালির মেঘ ও সবুজ পাহাড়'
  },
  {
    id: 'saintmartin-1',
    image: saintMartinCheradwip,
    location: 'ছেঁড়া দ্বীপ · সেন্টমার্টিন',
    division: 'কক্সবাজার',
    alt: 'সেন্টমার্টিন ছেঁড়া দ্বীপের নীল জলরাশি'
  },
  {
    id: 'sreemangal-1',
    image: sreemangalTeaGarden,
    location: 'সবুজ চা বাগান · শ্রীমঙ্গল',
    division: 'মৌলভীবাজার',
    alt: 'শ্রীমঙ্গলের দিগন্তজোড়া চা বাগান'
  },
  {
    id: 'coxsbazar-1',
    image: coxBazarMarineDrive,
    location: 'মেরিন ড্রাইভ · কক্সবাজার',
    division: 'চট্টগ্রাম',
    alt: 'কক্সবাজার মেরিন ড্রাইভ ও সমুদ্র সৈকত'
  },
  {
    id: 'bandarban-1',
    image: bandarbanNilgiri,
    location: 'নীলগিরি হিলটপ · বান্দরবান',
    division: 'বান্দরবান',
    alt: 'বান্দরবান নীলগিরি মেঘের উপত্যকা'
  },
  {
    id: 'sundarbans-1',
    image: sundarbansRiver,
    location: 'সুন্দরবন ম্যানগ্রোভ বন',
    division: 'খুলনা',
    alt: 'সুন্দরবনের শান্ত নদী ও ম্যানগ্রোভ বনাঞ্চল'
  },
  {
    id: 'sajek-2',
    image: sajekWoodenResort,
    location: 'মেঘের রাজ্য · সাজেক রিসোর্ট',
    division: 'রাঙ্গামাটি',
    alt: 'সাজেক ভ্যালির ইকো রিসোর্ট ও পাহাড়ের দৃশ্য'
  },
  {
    id: 'saintmartin-2',
    image: saintMartinCorals,
    location: 'প্রবাল সৈকত · সেন্টমার্টিন দ্বীপ',
    division: 'কক্সবাজার',
    alt: 'সেন্টমার্টিন প্রবাল সৈকত ও স্বচ্ছ সমুদ্র'
  },
  {
    id: 'sreemangal-2',
    image: sreemangalLawachara,
    location: 'লাউয়াছড়া রেইনফরেস্ট · শ্রীমঙ্গল',
    division: 'মৌলভীবাজার',
    alt: 'শ্রীমঙ্গল লাউয়াছড়া জাতীয় উদ্যান'
  },
  {
    id: 'coxsbazar-2',
    image: coxBazarInaniBeach,
    location: 'ইনানী পাথুরে সৈকত · কক্সবাজার',
    division: 'চট্টগ্রাম',
    alt: 'কক্সবাজার ইনানী বিচের সূর্যাস্ত ও প্রবাল পাথর'
  },
  {
    id: 'bandarban-2',
    image: bandarbanBogaLake,
    location: 'বগালেক ও পাহাড় · বান্দরবান',
    division: 'বান্দরবান',
    alt: 'বান্দরবান বগালেক ও সবুজ পর্বতমালা'
  },
  {
    id: 'sundarbans-2',
    image: sundarbansMangroveBoat,
    location: 'ম্যানগ্রোভ জলপথ · সুন্দরবন',
    division: 'বাগেরহাট',
    alt: 'সুন্দরবনের জলপথ ও ঐতিহ্যবাহী কাঠের নৌকা'
  }
];

// Helper to create a randomized order of slide indices
const createRandomizedSequence = (count: number): number[] => {
  const indices = Array.from({ length: count }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
};

export const Hero: React.FC = () => {
  const [slides] = useState<HeroSlide[]>(ALL_SLIDES);
  const [sequence] = useState<number[]>(() => createRandomizedSequence(ALL_SLIDES.length));
  const [sequenceIndex, setSequenceIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const activeSlideIndex = sequence[sequenceIndex] ?? 0;
  const currentSlide = slides[activeSlideIndex];

  const goToNextSlide = useCallback(() => {
    setSequenceIndex((prev) => (prev + 1) % sequence.length);
  }, [sequence.length]);

  // 6-second automatic slide change interval
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

  return (
    <section 
      id="hero-section" 
      className="hero relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="বাংলাদেশের প্রাকৃতিক সৌন্দর্যের দৃশ্য ও ভিসা সার্ভিস"
    >
      {/* Background Slides Container with Crystal Clear Visibility & High Resolution */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950 pointer-events-none">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;
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
                alt={slide.alt}
                className="w-full h-full object-cover object-center select-none"
                referrerPolicy="no-referrer"
                loading={idx < 4 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          );
        })}

        {/* Soft Transparent Scrim for Maximum Clarity while Maintaining Crisp Text Readability */}
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
            {currentSlide.location} ({currentSlide.division})
          </span>
        </div>

        <h1 className="text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] font-bold">
          সহজ ও নির্ভুল ইন্ডিয়ান ভিসা প্রসেসিং
        </h1>
        
        <p className="text-white text-base sm:text-lg leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-medium">
          সঠিক ডকুমেন্টেশন ও অভিজ্ঞ ভিসা কনসালট্যান্টদের সহায়তায় দ্রুততম সময়ে ভারতীয় ভিসা প্রাপ্তি নিশ্চিত করুন। কোনো প্রকার ঝামেলা ছাড়াই নিশ্চিন্তে আবেদন করুন।
        </p>

        <div className="mt-6">
          <a 
            id="hero-reserve-btn"
            className="btn-primary inline-flex items-center gap-2" 
            href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I would like to get a free consultation for Indian Visa Processing.')}`}
            target="_blank" 
            rel="noopener noreferrer"
          >
            <span>ফ্রি ভিসা পরামর্শ নিন</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* 12-Slide Progress Indicator Dots - Beautifully Centered at the Middle Bottom */}
      <div 
        className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center pointer-events-auto"
        aria-label="স্লাইড নির্দেশক"
      >
        <div className="flex items-center gap-1.5 bg-black/45 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
          {sequence.map((slideIndex, sIdx) => {
            const isDotActive = sIdx === sequenceIndex;
            return (
              <button
                key={slides[slideIndex].id}
                type="button"
                onClick={() => setSequenceIndex(sIdx)}
                className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isDotActive 
                    ? 'w-7 bg-emerald-400 shadow-md shadow-emerald-400/60' 
                    : 'w-2 bg-white/50 hover:bg-white/90 hover:w-3'
                }`}
                aria-label={`স্লাইড ${sIdx + 1} (${slides[slideIndex].location})`}
                title={slides[slideIndex].location}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
