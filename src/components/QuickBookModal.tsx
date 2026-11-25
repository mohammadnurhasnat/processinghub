import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  Compass, 
  Stethoscope, 
  Briefcase, 
  Layers, 
  GraduationCap,
  Bus,
  FileCheck2,
  Users,
  Ticket, 
  CalendarClock, 
  Check, 
  Phone 
} from 'lucide-react';
import { CONFIG, getPhoneDisplay } from '../config';
import { useLanguage } from '../context/LanguageContext';

interface QuickBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickBookModal: React.FC<QuickBookModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const isBn = language === 'bn';
  const phoneDisplay = getPhoneDisplay(language);

  const [quickBookTab, setQuickBookTab] = useState<'services' | 'callback'>('services');
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackNote, setCallbackNote] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [isSubmittingCallback, setIsSubmittingCallback] = useState(false);

  if (!isOpen) return null;

  const serviceOptions = [
    {
      id: 'quick-tourist-visa',
      icon: Compass,
      accent: 'mint',
      title: isBn ? 'ট্যুরিস্ট ভিসা' : 'Tourist Visa',
      subtitle: isBn
        ? 'ফাইল প্রসেসিং, আইভ্যাক ফি (১,৫০০৳) ও স্লটসহ'
        : 'File processing, IVAC fee (৳1,500) & slot included',
      price: isBn ? '৳৬,০০০' : '৳6,000',
      waText: 'Hello Processing Hub, I want to book Indian Tourist Visa processing with slot (Total: ৳6,000, including ৳1,500 IVAC fee).',
    },
    {
      id: 'quick-medical-visa',
      icon: Stethoscope,
      accent: 'periwinkle',
      title: isBn ? 'মেডিকেল ভিসা' : 'Medical Visa',
      subtitle: isBn
        ? 'ইনভাইটেশন লেটার, প্রসেসিং, আইভ্যাক ফি ও স্লটসহ'
        : 'Doctor invitation letter, processing, IVAC fee & slot included',
      price: isBn ? '৳৬,০০০' : '৳6,000',
      waText: 'Hello Processing Hub, I want to book Indian Medical Visa processing with slot (Total: ৳6,000, including ৳1,500 IVAC fee).',
    },
    {
      id: 'quick-business-visa',
      icon: Briefcase,
      accent: 'mint',
      title: isBn ? 'বিজনেস ভিসা' : 'Business Visa',
      subtitle: isBn
        ? 'ইনভাইটেশন, ট্রেড ফাইল, আইভ্যাক ফি ও স্লটসহ'
        : 'Business invitation, trade file, IVAC fee & slot included',
      price: isBn ? '৳৬,০০০' : '৳6,000',
      waText: 'Hello Processing Hub, I want to book Indian Business Visa processing with slot (Total: ৳6,000, including ৳1,500 IVAC fee).',
    },
    {
      id: 'quick-double-entry-visa',
      icon: Layers,
      accent: 'periwinkle',
      title: isBn ? 'ডাবল এন্ট্রি ভিসা (X-3)' : 'Double Entry Visa (X-3)',
      subtitle: isBn
        ? 'এম্বাসি অ্যাপয়েন্টমেন্ট, ওয়ার্ক পারমিট, আইভ্যাক ফি ও স্লটসহ'
        : 'Embassy appointment, work permit, IVAC fee & slot included',
      price: isBn ? '৳৬,৫০০' : '৳6,500',
      waText: 'Hello Processing Hub, I want to book Indian Double Entry Visa (X-3 Miscellaneous) processing with slot (Total: ৳6,500, including ৳1,500 IVAC fee).',
    },
    {
      id: 'quick-student-visa',
      icon: GraduationCap,
      accent: 'mint',
      title: isBn ? 'স্টুডেন্ট ভিসা (S-1)' : 'Student Visa (S-1)',
      subtitle: isBn
        ? 'অ্যাডমিশন ও বোনাফাইড, প্রসেসিং, আইভ্যাক ফি ও স্লটসহ'
        : 'Admission & bonafide file, processing, IVAC fee & slot included',
      price: isBn ? '৳৫,৫০০' : '৳5,500',
      waText: 'Hello Processing Hub, I want to book Indian Student Visa (S-1) processing with slot (Total: ৳5,500, including ৳1,500 IVAC fee & ৳3,000 slot + ৳1,000 processing).',
    },
    {
      id: 'quick-transit-visa',
      icon: Bus,
      accent: 'periwinkle',
      title: isBn ? 'ট্রানজিট ভিসা (TR)' : 'Transit Visa (TR)',
      subtitle: isBn
        ? 'নেপাল ও ভুটান ট্রানজিট ফাইল, আইভ্যাক ফি ও স্লটসহ'
        : 'Nepal & Bhutan transit file, IVAC fee & slot included',
      price: isBn ? '৳৫,৫০০' : '৳5,500',
      waText: 'Hello Processing Hub, I want to book Indian Transit Visa (TR) processing with slot (Total: ৳5,500, including ৳1,500 IVAC fee & ৳3,000 slot + ৳1,000 processing).',
    },
    {
      id: 'quick-entry-visa',
      icon: FileCheck2,
      accent: 'mint',
      title: isBn ? 'এন্ট্রি ভিসা (X-Misc)' : 'Entry Visa (X-Misc)',
      subtitle: isBn
        ? 'স্লট ৪,৫০০৳ + প্রসেসিং সার্ভিস চার্জ ১,৫০০৳'
        : 'Slot ৳4,500 + processing service charge ৳1,500',
      price: isBn ? '৳৬,০০০' : '৳6,000',
      waText: 'Hello Processing Hub, I want to book Indian Entry Visa (X-Misc) processing with slot (Total: ৳6,000 = ৳4,500 slot + ৳1,500 processing).',
    },
    {
      id: 'quick-spouse-visa',
      icon: Users,
      accent: 'periwinkle',
      title: isBn ? 'স্পাউস ও ফ্যামিলি ভিসা (X-1)' : 'Spouse & Family Visa (X-1)',
      subtitle: isBn
        ? 'স্লট ৪,৫০০৳ + ডকুমেন্ট প্রসেসিং চার্জ ১,৫০০৳'
        : 'Slot ৳4,500 + document processing charge ৳1,500',
      price: isBn ? '৳৬,০০০' : '৳6,000',
      waText: 'Hello Processing Hub, I want to book Indian Spouse / Family Visa (X-1) processing with slot (Total: ৳6,000 = ৳4,500 slot + ৳1,500 processing).',
    },
    {
      id: 'quick-ticket-booking',
      icon: Ticket,
      accent: 'mint',
      title: isBn ? 'টিকেট বুকিং' : 'Ticket Booking',
      subtitle: isBn
        ? 'মূল টিকেট মূল্যের সাথে ৫৯৯৳ থেকে শুরু (আলোচনা সাপেক্ষে)'
        : 'Service charge starts from ৳599 on top of base fare (negotiable)',
      price: isBn ? '৳৫৯৯+' : '৳599+',
      waText: 'Hello Processing Hub, I want to book Air / Travel Ticket Booking service (Service Charge starts from ৳599 on top of base ticket fare, negotiable).',
    },
    {
      id: 'quick-slot-booking',
      icon: CalendarClock,
      accent: 'periwinkle',
      title: isBn ? 'শুধু স্লট বুকিং' : 'Slot Booking (Only Slot)',
      subtitle: isBn
        ? '৪,৫০০৳ থেকে শুরু (আইভ্যাক ফি ১,৫০০৳ ফিক্সডসহ)'
        : 'Starting from ৳4,500 (including fixed ৳1,500 IVAC fee)',
      price: isBn ? '৳৪,৫০০+' : '৳4,500+',
      waText: 'Hello Processing Hub, I want to book Indian Visa Appointment Slot (Starting from ৳4,500 including ৳1,500 IVAC fee).',
    },
  ] as const;

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim() || isSubmittingCallback) return;

    setIsSubmittingCallback(true);

    try {
      await fetch('/api/telegram/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: callbackName.trim(),
          phone: callbackPhone.trim(),
          note: callbackNote.trim(),
        }),
      });
    } catch (err) {
      console.error('Telegram notification error:', err);
    } finally {
      setIsSubmittingCallback(false);
      setCallbackSubmitted(true);
    }
  };

  return (
    <div 
      id="quick-book-modal"
      className="service-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="service-modal-card"
        style={{ maxWidth: '580px' }}
      >
        {/* Modal Header */}
        <div className="service-modal-header">
          <div>
            <span className="inline-block text-[11px] font-semibold text-[#4A5AB8] bg-[#EEF1FE] border border-[#CCD3FB] px-2.5 py-0.5 rounded-full mb-2">
              {t('বুকিং সার্ভিস নির্বাচন', 'Quick Service Booking')}
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-[#161D28] leading-snug">
              {t('আপনার কাঙ্ক্ষিত সেবা নির্বাচন করুন', 'Select Your Desired Service')}
            </h3>
            <p className="text-xs text-[#5A6474] mt-1.5">
              {t(
                'নিচের যেকোনো সার্ভিসে ক্লিক করে ফর্ম পূরণ করলে সরাসরি হোয়াটসঅ্যাপ বা লাইভ এজেন্টের সাথে যুক্ত হয়ে যাবেন:',
                'Click any service below and submit your details to connect directly via WhatsApp or Live Agent:'
              )}
            </p>
          </div>

          <button
            type="button"
            id="quick-book-close-btn"
            onClick={onClose}
            className="btn-3d-red-glass w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
            aria-label={t('বন্ধ করুন', 'Close modal')}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Modal Body - Service List with WhatsApp redirect or Callback Tab */}
        <div className="service-modal-body">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-[var(--periwinkle-light)] p-1 mb-3.5 text-xs font-semibold border border-[var(--periwinkle-border)]">
            <button
              type="button"
              onClick={() => setQuickBookTab('services')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                quickBookTab === 'services' 
                  ? 'bg-white text-[var(--periwinkle-dark)] border border-[var(--periwinkle-border)] font-bold shadow-xs' 
                  : 'text-[var(--periwinkle-text)] hover:text-[#161D28]'
              }`}
            >
              {t('সার্ভিস তালিকা (হোয়াটসঅ্যাপ / এজেন্ট)', 'Service List (WhatsApp / Agent)')}
            </button>
            <button
              type="button"
              onClick={() => setQuickBookTab('callback')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                quickBookTab === 'callback' 
                  ? 'bg-white text-[var(--periwinkle-dark)] border border-[var(--periwinkle-border)] font-bold shadow-xs' 
                  : 'text-[var(--periwinkle-text)] hover:text-[#161D28]'
              }`}
            >
              {t('ফোন কল অনুরোধ', 'Request a Call Back')}
            </button>
          </div>

          {quickBookTab === 'services' ? (
            <div className="space-y-2.5">
              {serviceOptions.map((item) => {
                const IconComponent = item.icon;
                const isMint = item.accent === 'mint';
                return (
                  <a
                    key={item.id}
                    id={item.id}
                    href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(item.waText)}`}
                    data-service-name={item.title}
                    data-section={t('দ্রুত বুকিং উইন্ডো', 'Quick Booking Modal')}
                    data-whatsapp-title={item.title}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="book-service-option"
                    onClick={onClose}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                          isMint
                            ? 'bg-[var(--mint-light)] text-[var(--mint-dark)] border-[var(--mint-border)]'
                            : 'bg-[var(--periwinkle-light)] text-[var(--periwinkle-dark)] border-[var(--periwinkle-border)]'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#161D28]">{item.title}</h4>
                        <p className="text-xs text-[#5A6474]">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-[var(--mint-dark)] bg-[var(--mint-light)] border border-[var(--mint-border)] px-2 py-0.5 rounded-full block">
                        {item.price}
                      </span>
                      <span className="text-[10px] text-[var(--periwinkle-dark)] inline-flex items-center gap-0.5 mt-0.5">
                        {t('হোয়াটসঅ্যাপ / এজেন্ট', 'WhatsApp / Agent')} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            /* Callback Request Form */
            <div>
              {callbackSubmitted ? (
                <div className="p-5 text-center bg-[#F2F6EF] border border-[#DEE6D8] rounded-xl space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#E2EEDC] flex items-center justify-center text-[#3B6632]">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#1E2519]">
                    {t('অনুরোধ গ্রহণ করা হয়েছে!', 'Request Received!')}
                  </h4>
                  <p className="text-xs text-[#55604C] leading-relaxed">
                    {isBn ? (
                      <>
                        ধন্যবাদ {callbackName || 'সম্মানিত সেবাগ্রহীতা'}! আমাদের ভিসা সাপোর্ট টিম দ্রুত আপনার নম্বরে (<strong>{callbackPhone}</strong>) কল করে প্রয়োজনীয় দিকনির্দেশনা প্রদান করবে।
                      </>
                    ) : (
                      <>
                        Thank you, {callbackName || 'valued guest'}! Our visa support team will call you shortly at (<strong>{callbackPhone}</strong>) with complete guidance.
                      </>
                    )}
                  </p>
                  <div className="pt-2">
                    <a
                      href={`tel:${CONFIG.phone}`}
                      className="btn-3d-matte-primary inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>
                        {t(`এখনই সরাসরি কল করুন (${phoneDisplay})`, `Call Hotline Now (${phoneDisplay})`)}
                      </span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-3.5">
                  <p className="text-xs text-[#65715D] leading-relaxed">
                    {t(
                      'হোয়াটসঅ্যাপ ছাড়াও আপনি চাইলে সরাসরি আমাদের টিমের কল পেতে পারেন। নিচে আপনার তথ্য দিন:',
                      'Prefer a direct phone call from our support team? Enter your details below and we will call you back:'
                    )}
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-[#26301F] mb-1">
                      {t('আপনার নাম', 'Your Full Name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={callbackName}
                      onChange={(e) => setCallbackName(e.target.value)}
                      placeholder={t('যেমন: মোঃ আরিফুল ইসলাম', 'e.g. Md. Ariful Islam')}
                      className="w-full text-xs py-2 px-3 bg-[#FAF9F5] border border-[#D5CFBF] rounded-lg text-[#1E2519] focus:outline-none focus:border-[#5F7758]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#26301F] mb-1">
                      {t('মোবাইল নম্বর', 'Mobile Number')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      placeholder={t('০১৭XXXXXXXX', '017XXXXXXXX')}
                      className="w-full text-xs py-2 px-3 bg-[#FAF9F5] border border-[#D5CFBF] rounded-lg text-[#1E2519] focus:outline-none focus:border-[#5F7758]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#26301F] mb-1">
                      {t('কাঙ্ক্ষিত সেবা বা নোট (ঐচ্ছিক)', 'Desired Service or Note (Optional)')}
                    </label>
                    <input
                      type="text"
                      value={callbackNote}
                      onChange={(e) => setCallbackNote(e.target.value)}
                      placeholder={t('যেমন: মেডিকেল ভিসা স্লট বুকিং', 'e.g. Medical Visa Slot Booking')}
                      className="w-full text-xs py-2 px-3 bg-[#FAF9F5] border border-[#D5CFBF] rounded-lg text-[#1E2519] focus:outline-none focus:border-[#5F7758]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingCallback}
                    className="btn-3d-matte-primary w-full py-2.5 disabled:opacity-75 text-xs font-bold rounded-full flex items-center justify-center gap-2"
                  >
                    {isSubmittingCallback ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>{t('অনুরোধ পাঠানো হচ্ছে...', 'Submitting Request...')}</span>
                      </>
                    ) : (
                      t('কল ব্যাক অনুরোধ জমা দিন', 'Submit Call Back Request')
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
