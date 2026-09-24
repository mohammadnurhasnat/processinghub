import React, { useState, useRef, useMemo } from 'react';
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
  Stethoscope
} from 'lucide-react';
import { DESTINATIONS, HOSPITALS } from '../data/visaData';
import { CONFIG } from '../config';
import { Destination, Hospital } from '../types';
import { HospitalDetailModal } from './HospitalDetailModal';
import { DestinationDetailModal } from './DestinationDetailModal';

const DEPARTMENT_FILTERS = [
  { id: 'all', label: 'সকল বিভাগ', emoji: '🏥' },
  { id: 'Cardiology', label: 'কার্ডিওলজি / হার্ট', emoji: '❤️' },
  { id: 'Oncology', label: 'ক্যান্সার / অনকোলজি', emoji: '🎗️' },
  { id: 'Neurology', label: 'নিউরোলজি / ব্রেন', emoji: '🧠' },
  { id: 'Organ Transplant', label: 'অর্গান ট্রান্সপ্লান্ট', emoji: '🫀' },
  { id: 'Orthopedics', label: 'অর্থোপেডিক্স / জয়েন্ট', emoji: '🦴' },
  { id: 'Gastroenterology', label: 'গ্যাস্ট্রোএন্টারোলজি', emoji: '🔬' },
  { id: 'Nephrology', label: 'কিডনি ও নেফ্রোলজি', emoji: '🧪' },
  { id: 'Pediatrics', label: 'শিশু বিভাগ', emoji: '👶' },
];

export const DestinationsSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  
  // Modals state
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const destScrollRef = useRef<HTMLDivElement>(null);
  const hospitalScrollRef = useRef<HTMLDivElement>(null);

  // Filter hospitals based on search input and selected department
  const filteredHospitals = useMemo(() => {
    return HOSPITALS.filter((hospital) => {
      // Department filter
      const matchesDept = selectedDept === 'all' || hospital.departments.some(d => 
        d.toLowerCase().includes(selectedDept.toLowerCase()) || 
        selectedDept.toLowerCase().includes(d.toLowerCase())
      );

      // Search query filter
      if (!searchQuery.trim()) return matchesDept;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = 
        hospital.name.toLowerCase().includes(q) ||
        hospital.city.toLowerCase().includes(q) ||
        hospital.location.toLowerCase().includes(q) ||
        hospital.description.toLowerCase().includes(q) ||
        hospital.specialties.some(s => s.toLowerCase().includes(q)) ||
        hospital.departments.some(d => d.toLowerCase().includes(q));

      return matchesDept && matchesQuery;
    });
  }, [searchQuery, selectedDept]);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="destinations" className="relative py-8 sm:py-12 bg-gradient-to-b from-transparent via-[#F7F6F0]/60 to-transparent">
      
      {/* ========================================================================= */}
      {/* PART 1: POPULAR TOURIST DESTINATIONS (ভ্রমণ গন্তব্যসমূহ)                   */}
      {/* ========================================================================= */}
      <div className="w-full max-w-6xl mx-auto px-4 mb-10 sm:mb-12">
        {/* Tourist Section Header (Badges completely removed as requested) */}
        <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-7">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Space_Grotesk'] text-[#1E2519] tracking-tight leading-tight">
            জনপ্রিয় ভ্রমণ গন্তব্যসমূহ
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#4E5C46] mt-2 leading-relaxed max-w-2xl mx-auto">
            বাংলাদেশি ভ্রমণপিপাসুদের পছন্দের ভারতের সেরা দর্শনীয় স্থানসমূহ। যেকোনো কার্ডে ক্লিক করে দর্শনীয় স্থান ও ভ্রমণের সেরা সময় জেনে নিন।
          </p>
        </div>

        {/* Tourist Destinations Polaroid Row */}
        <div 
          className="dest-scroll" 
          id="destinations-scroll-container"
          ref={destScrollRef}
        >
          {DESTINATIONS.map((dest, index) => (
            <div 
              key={dest.id || index} 
              id={`destination-polaroid-${dest.id || index}`}
              onClick={() => setSelectedDestination(dest)}
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
                    দর্শনীয় স্থান ও তথ্য
                  </span>
                </div>
              </div>

              <div className="mt-2.5 flex flex-col flex-1 justify-between text-left items-start">
                <div className="w-full text-left">
                  <h4 className="font-['Space_Grotesk'] text-[14px] font-bold text-[#1E2519] group-hover:text-[#2A6A26] transition-colors leading-tight text-left">
                    {dest.name}
                  </h4>
                  <p className="text-[12px] font-semibold text-[#2E7D32] mt-0.5 leading-tight text-left">
                    {dest.nameBn || dest.name}
                  </p>
                  <p className="text-[11px] text-[#65715D] flex items-center justify-start gap-1 mt-1 line-clamp-1 text-left">
                    <MapPin className="w-3 h-3 text-[#8C9685] flex-shrink-0" />
                    <span className="text-left">{dest.location}</span>
                  </p>
                </div>

                <div className="w-full mt-2.5 pt-2 border-t border-[#EFEBE0] flex items-center justify-between text-[11px] font-bold text-[#2A6A26]">
                  <span>ভ্রমণ নির্দেশিকা</span>
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
            aria-label="পূর্ববর্তী গন্তব্য"
            title="পূর্ববর্তী"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            id="dest-next-btn"
            onClick={() => scrollContainer(destScrollRef, 'right')}
            className="dest-nav-btn"
            aria-label="পরবর্তী গন্তব্য"
            title="পরবর্তী"
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
      {/* PART 2: TOP INDIAN HOSPITALS & SPECIALISTS (শীর্ষ হাসপাতালসমূহ)            */}
      {/* ========================================================================= */}
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Hospital Section Header (Badges completely removed as requested) */}
        <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-7">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Space_Grotesk'] text-[#1E2519] tracking-tight leading-tight">
            ভারতের শীর্ষ হাসপাতাল ও চিকিৎসাকেন্দ্রসমূহ
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#4E5C46] mt-2 leading-relaxed max-w-2xl mx-auto">
            বাংলাদেশি রোগীদের উন্নত চিকিৎসার জন্য ভারতের স্বনামধন্য সুপার-স্পেশালিটি হাসপাতালসমূহ। প্রতিটি হাসপাতাল থেকে ডক্টরস ইনভাইটেশন ও অ্যাপয়েন্টমেন্ট সাপোর্ট প্রদান করা হয়।
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
                অফিশিয়াল ডক্টরস ইনভাইটেশন ও অ্যাপয়েন্টমেন্ট নিশ্চয়তা
              </h4>
              <p className="text-[11.5px] sm:text-xs text-[#425C47] leading-relaxed mt-0.5">
                আমরা প্রতিটি শীর্ষ হাসপাতাল থেকে রোগীর জন্য সরাসরি <strong>অফিশিয়াল ডক্টরস ইনভাইটেশন লেটার</strong> ও <strong>বিশেষজ্ঞ ডক্টর অ্যাপয়েন্টমেন্ট</strong> কনফার্মেশন সংগ্রহ করি।
              </p>
            </div>
          </div>

          <a
            id="hospital-banner-wa-btn"
            href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I need an official Doctor Invitation Letter & Appointment for an Indian hospital.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-3d-matte-green px-3.5 py-1.5 text-xs font-bold whitespace-nowrap self-stretch sm:self-auto text-center"
          >
            ইনভাইটেশন লেটার নিন
          </a>
        </div>

        {/* Search & Department Filters Box */}
        <div className="bg-white/85 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-[#E3DFC8] shadow-xs mb-5 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A8772] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="hospital-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="রোগের নাম, ডিপার্টমেন্ট বা হাসপাতাল খুঁজুন (যেমন: Heart, Cancer, Neuro, Ortho, Liver, Kolkata, Delhi)..."
              className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-[#FAF9F5] border border-[#D5CFBF] rounded-xl text-[#1E2519] placeholder:text-[#8C9685] focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                id="clear-hospital-search"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C9685] hover:text-[#1E2519] cursor-pointer"
                title="ক্লিয়ার করুন"
              >
                <X className="w-4 h-4" />
              </button>
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
                  <span>{dept.label}</span>
                </button>
              );
            })}
          </div>

          {/* Match Counter & Reset */}
          <div className="flex items-center justify-between text-xs text-[#6B7563] pt-1.5 border-t border-[#EFEBE0]">
            <span>
              মোট <strong>{filteredHospitals.length}</strong>টি হাসপাতাল প্রদর্শিত হচ্ছে
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
                সব ফিল্টার মুছুন
              </button>
            )}
          </div>
        </div>

        {/* Hospital Polaroid Cards Row */}
        {filteredHospitals.length === 0 ? (
          <div className="text-center py-10 bg-white/70 rounded-2xl border border-dashed border-[#D5CFBF] p-6">
            <Building2 className="w-10 h-10 text-[#A0AA98] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1E2519]">কোনো হাসপাতাল পাওয়া যায়নি</p>
            <p className="text-xs text-[#6B7563] mt-1">অন্য কোনো রোগের নাম বা কিওয়ার্ড দিয়ে আবার চেষ্টা করুন।</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('all');
              }}
              className="btn-3d-matte-secondary mt-3 px-3.5 py-1.5 text-xs font-semibold rounded-full"
            >
              সকল হাসপাতাল দেখুন
            </button>
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
                onClick={() => setSelectedHospital(hospital)}
                className="polaroid cursor-pointer group text-left"
              >
                {/* Building Facade Photo with City & Logo Overlay */}
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
                      বিস্তারিত ও ডিপার্টমেন্ট
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

                  {/* Clean Bottom Action Tag (Zero dead space) */}
                  <div className="w-full mt-2.5 pt-2 border-t border-[#EFEBE0] flex items-center justify-between text-[11px] font-bold text-[#2E7D32]">
                    <span>অ্যাপয়েন্টমেন্ট ও তথ্য</span>
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
              aria-label="পূর্ববর্তী হাসপাতাল"
              title="পূর্ববর্তী"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              id="hospital-next-btn"
              onClick={() => scrollContainer(hospitalScrollRef, 'right')}
              className="dest-nav-btn"
              aria-label="পরবর্তী হাসপাতাল"
              title="পরবর্তী"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Hospital Detail Pop-up Modal */}
      <HospitalDetailModal
        hospital={selectedHospital}
        onClose={() => setSelectedHospital(null)}
      />

      {/* Destination Detail Pop-up Modal */}
      <DestinationDetailModal
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
      />
    </section>
  );
};
