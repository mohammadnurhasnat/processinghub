import React, { useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Building2, 
  HeartHandshake, 
  CheckCircle2, 
  Sparkles, 
  PhoneCall, 
  Stethoscope, 
  CalendarCheck2, 
  ShieldCheck 
} from 'lucide-react';
import { Hospital } from '../types';
import { CONFIG } from '../config';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface HospitalDetailModalProps {
  hospital: Hospital | null;
  onClose: () => void;
}

export const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({
  hospital,
  onClose
}) => {
  useBodyScrollLock(Boolean(hospital));

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (hospital) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hospital, onClose]);

  if (!hospital) return null;

  const waAppointmentText = `Hello Processing Hub, I need Doctor Appointment & Medical Visa Invitation Letter for *${hospital.name}* (${hospital.location}). Please assist me with the doctor confirmation and visa file processing.`;

  return (
    <div 
      id="hospital-detail-modal-overlay"
      className="service-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="hospital-detail-modal-card"
        className="service-modal-card max-w-2xl"
      >
        {/* Modal Header with Hospital Image & Close */}
        <div className="relative">
          <div className="h-44 sm:h-52 w-full overflow-hidden rounded-t-2xl relative bg-[#1E2519]">
            <img 
              src={hospital.image} 
              alt={hospital.name}
              className="w-full h-full object-cover object-center opacity-90 transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = CONFIG.fallbackImage;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141B10] via-black/40 to-transparent" />
            
            {/* City Badge, Brand Logo & Details */}
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2A7E3B] text-white shadow-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    {hospital.city}
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-white mt-1.5 leading-snug drop-shadow-sm">
                  {hospital.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-[#A3D69B]" />
                  {hospital.location}
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            id="hospital-modal-close-btn"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer z-10 backdrop-blur-xs border border-white/20"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="service-modal-body space-y-4 max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {/* Trust Guarantee Box */}
          <div className="p-3.5 rounded-xl bg-[#F0F8F1] border border-[#CDE5D5] flex items-start gap-3 text-left">
            <div className="p-2 bg-[#2E7D32] text-white rounded-lg flex-shrink-0 mt-0.5 shadow-xs">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1E5624] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                অফিশিয়াল ইনভাইটেশন ও অ্যাপয়েন্টমেন্ট নিশ্চয়তা
              </h4>
              <p className="text-xs text-[#35533A] leading-relaxed mt-1">
                আমরা সরাসরি <strong>{hospital.name}</strong> থেকে রোগীর জন্য ডক্টরস ইনভাইটেশন লেটার (Visa Invitation Letter), আয়ুশ (AYUSH) ও রেজিস্টার্ড বিশেষজ্ঞ ডাক্তারের অ্যাপয়েন্টমেন্ট কনফার্মেশন সংগ্রহ করে মেডিকেল ভিসা ফাইল প্রস্তুত করি।
              </p>
            </div>
          </div>

          {/* Hospital Overview */}
          <div>
            <h4 className="text-xs font-bold text-[#65715D] uppercase tracking-wider mb-1.5">
              হাসপাতালের পরিচিতি
            </h4>
            <p className="text-xs sm:text-[13.5px] text-[#2C3627] leading-relaxed">
              {hospital.description}
            </p>
          </div>

          {/* Specialties & Treatment Departments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#65715D] uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#2E7D32]" />
                প্রধান চিকিৎসা বিভাগ ও বিশেষত্ব (Specialties)
              </h4>
              <span className="text-[11px] font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded">
                {hospital.specialties.length}টি প্রধান বিভাগ
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {hospital.specialties.map((spec, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E4D8] text-xs font-semibold text-[#1E2519]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
                  <span className="leading-snug">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Highlights */}
          {hospital.highlights && hospital.highlights.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#65715D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
                প্রধান সুযোগ-সুবিধা ও বৈশিষ্ট্য
              </h4>
              <ul className="space-y-1.5">
                {hospital.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] text-[#3D4737] leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mt-1.5 flex-shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer with Direct Actions */}
        <div className="service-modal-footer flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 bg-[#F8F7F2] border-t border-[#E8E4D8]">
          <div className="flex items-center gap-2 text-xs text-[#4E5C46]">
            <HeartHandshake className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
            <span className="font-medium">মেডিকেল ভিসা ও ইনভাইটেশন হেল্পলাইন</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              id="hospital-call-helpline-btn"
              href={`tel:${CONFIG.phone}`}
              className="btn-3d-matte-secondary flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full whitespace-nowrap text-[#1E2519]"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>কল করুন</span>
            </a>

            <a
              id="hospital-whatsapp-booking-btn"
              href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(waAppointmentText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-matte-green flex-[1.4] sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-full whitespace-nowrap text-center text-[#124218]"
            >
              <span>ডক্টর অ্যাপয়েন্টমেন্ট নিন</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
