import React, { useState } from 'react';
import {
  X,
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
  Phone,
  Stamp,
  HeartPulse,
  Hotel,
  ArrowUpRight
} from 'lucide-react';
import { CONFIG, getPhoneDisplay } from '../config';
import { useLanguage } from '../context/LanguageContext';

interface QuickBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickBookModal: React.FC<QuickBookModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const isBn = language === 'bn';
  const phoneDisplay = getPhoneDisplay(language);

  const [quickBookTab, setQuickBookTab] = useState<'services' | 'callback'>('services');
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [callbackNote, setCallbackNote] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [isSubmittingCallback, setIsSubmittingCallback] = useState(false);

  if (!isOpen) return null;

  const serviceOptions = [
    {
      id: 'quick-tourist-visa',
      icon: Compass,
      title: isBn ? 'ট্যুরিস্ট ভিসা' : 'Tourist Visa',
      shortLabel: isBn ? 'ট্যুরিস্ট ভিসা' : 'Tourist Visa',
      subtitle: isBn
        ? 'ফাইল প্রসেসিং, আইভ্যাক ফি (১,৫০০৳) ও স্লটসহ'
        : 'File processing, IVAC fee (৳1,500) & slot included',
      price: isBn ? '৳৬,০০০' : '৳6,000',
      waText: 'Hello Processing Hub, I want to book Indian Tourist Visa processing with slot (Total: ৳6,000, including ৳1,500 IVAC fee).',
    },
    {
      id: 'quick-medical-visa',
      icon: Stethoscope,
      title: isBn ? 'মেডিকেল ভিসা' : 'Medical Visa',
      shortLabel: isBn ? 'মেডিকেল ভিসা' : 'Medical Visa',
      subtitle: isBn
        ? 'ইনভাইটেশন লেটার, প্রসেসিং, আইভ্যাক ফি ও স্লটসহ'
        : 'Doctor invitation letter, processing, IVAC fee & slot included',
      price: isBn ? '৳৬,০০০' : '৳6,000',
      waText: 'Hello Processing Hub, I want to book Indian Medical Visa processing with slot (Total: ৳6,000, including ৳1,500 IVAC fee).',
    },
    {
      id: 'quick-business-visa',
      icon: Briefcase,
      title: isBn ? 'বিজনেস ভিসা' : 'Business Visa',
      shortLabel: isBn ? 'বিজনেস ভিসা' : 'Business Visa',
      subtitle: isBn
        ? 'ইনভাইটেশন, ট্রেড ফাইল, আইভ্যাক ফি ও স্লটসহ'
        : 'Business invitation, trade file, IVAC fee & slot included',
      price: isBn ? '৳৬,০০০' : '৳6,000',
      waText: 'Hello Processing Hub, I want to book Indian Business Visa processing with slot (Total: ৳6,000, including ৳1,500 IVAC fee).',
    },
    {
      id: 'quick-double-entry-visa',
      icon: Layers,
      title: isBn ? 'ডাবল এন্ট্রি ভিসা (X-3)' : 'Double Entry Visa (X-3)',
      shortLabel: isBn ? 'ডাবল এন্ট্রি (X-3)' : 'Double Entry (X-3)',
      subtitle: isBn
        ? 'এম্বাসি অ্যাপয়েন্টমেন্ট, ওয়ার্ক পারমিট, আইভ্যাক ফি ও স্লটসহ'
        : 'Embassy appointment, work permit, IVAC fee & slot included',
      price: isBn ? '৳৬,৫০০' : '৳6,500',
      waText: 'Hello Processing Hub, I want to book Indian Double Entry Visa (X-3 Miscellaneous) processing with slot (Total: ৳6,500, including ৳1,500 IVAC fee).',
    },
    {
      id: 'quick-student-visa',
      icon: GraduationCap,
      title: isBn ? 'স্টুডেন্ট ভিসা (S-1)' : 'Student Visa (S-1)',
      shortLabel: isBn ? 'স্টুডেন্ট ভিসা' : 'Student Visa',
      subtitle: isBn
        ? 'অ্যাডমিশন ও বোনাফাইড, প্রসেসিং, আইভ্যাক ফি ও স্লটসহ'
        : 'Admission & bonafide file, processing, IVAC fee & slot included',
      price: isBn ? '৳৫,৫০০' : '৳5,500',
      waText: 'Hello Processing Hub, I want to book Indian Student Visa (S-1) processing with slot (Total: ৳5,500, including ৳1,500 IVAC fee & ৳3,000 slot + ৳1,000 processing).',
    },
    {
      id: 'quick-transit-visa',
      icon: Bus,
      title: isBn ? 'ট্রানজিট ভিসা (TR)' : 'Transit Visa (TR)',
      shortLabel: isBn ? 'ট্রানজিট ভিসা' : 'Transit Visa',
      subtitle: isBn
        ? 'নেপাল ও ভুটান ট্রানজিট ফাইল, আইভ্যাক ফি ও স্লটসহ'
        : 'Nepal & Bhutan transit file, IVAC fee & slot included',
      price: isBn ? '৳৫,৫০০' : '৳5,500',
      waText: 'Hello Processing Hub, I want to book Indian Transit Visa (TR) processing with slot (Total: ৳5,500, including ৳1,500 IVAC fee & ৳3,000 slot + ৳1,000 processing).',
    },
    {
      id: 'quick-entry-visa',
      icon: FileCheck2,
      title: isBn ? 'এন্ট্রি ভিসা (X-Misc)' : 'Entry Visa (X-Misc)',
      shortLabel: isBn ? 'এন্ট্রি ভিসা' : 'Entry Visa',
      subtitle: isBn
        ? 'স্লট ৪,৫০০৳ + প্রসেসিং সার্ভিস চার্জ ১,৫০০৳'
        : 'Slot ৳4,500 + processing service charge ৳1,500',
      price: isBn ? '৳৬,০০০' : '৳6,000',
      waText: 'Hello Processing Hub, I want to book Indian Entry Visa (X-Misc) processing with slot (Total: ৳6,000 = ৳4,500 slot + ৳1,500 processing).',
    },
    {
      id: 'quick-spouse-visa',
      icon: Users,
      title: isBn ? 'স্পাউস ও ফ্যামিলি ভিসা (X-1)' : 'Spouse & Family Visa (X-1)',
      shortLabel: isBn ? 'স্পাউস ভিসা (X-1)' : 'Spouse Visa (X-1)',
      subtitle: isBn
        ? 'স্লট ৪,৫০০৳ + ডকুমেন্ট প্রসেসিং চার্জ ১,৫০০৳'
        : 'Slot ৳4,500 + document processing charge ৳1,500',
      price: isBn ? '৳৬,০০০' : '৳6,000',
      waText: 'Hello Processing Hub, I want to book Indian Spouse / Family Visa (X-1) processing with slot (Total: ৳6,000 = ৳4,500 slot + ৳1,500 processing).',
    },
    {
      id: 'quick-slot-booking',
      icon: CalendarClock,
      title: isBn ? 'শুধু স্লট বুকিং' : 'Slot Booking (Only Slot)',
      shortLabel: isBn ? 'শুধু স্লট বুকিং' : 'Slot Booking',
      subtitle: isBn
        ? '৪,৫০০৳ থেকে শুরু (আইভ্যাক ফি ১,৫০০৳ ফিক্সডসহ)'
        : 'Starting from ৳4,500 (including fixed ৳1,500 IVAC fee)',
      price: isBn ? '৳৪,৫০০+' : '৳4,500+',
      waText: 'Hello Processing Hub, I want to book Indian Visa Appointment Slot (Starting from ৳4,500 including ৳1,500 IVAC fee).',
    },
    {
      id: 'quick-ticket-booking',
      icon: Ticket,
      title: isBn ? 'টিকেট বুকিং' : 'Ticket Booking',
      shortLabel: isBn ? 'টিকেট বুকিং' : 'Ticket Booking',
      subtitle: isBn
        ? 'মূল টিকেট মূল্যের সাথে ৫৯৯৳ থেকে শুরু (আলোচনা সাপেক্ষে)'
        : 'Service charge starts from ৳599 on top of base fare (negotiable)',
      price: isBn ? '৳৫৯৯+' : '৳599+',
      waText: 'Hello Processing Hub, I want to book Air / Travel Ticket Booking service (Service Charge starts from ৳599 on top of base ticket fare, negotiable).',
    },
    {
      id: 'quick-mofa-notary',
      icon: Stamp,
      title: isBn ? 'নোটারি ও ডকুমেন্ট অনুবাদ' : 'Notary & Document Translation',
      shortLabel: isBn ? 'নোটারি ও অনুবাদ' : 'Notary & Translation',
      subtitle: isBn
        ? 'নিকাহনামা, জন্মনিবন্ধন ও একাডেমিক সনদের ইংরেজি অনুবাদ ও নোটারি'
        : 'Certified English translation & Notary Public support',
      price: isBn ? '৳১,২০০+' : '৳1,200+',
      waText: 'Hello Processing Hub, I need Notary Public & Document Translation service (starting ৳1,200+). Please share the steps.',
    },
    {
      id: 'quick-medical-pickup',
      icon: HeartPulse,
      title: isBn ? 'হাসপাতাল খরচ ও এয়ারপোর্ট পিকআপ গাইড' : 'Indian Hospital Cost & Airport Pickup Guide',
      shortLabel: isBn ? 'হাসপাতাল ও পিকআপ' : 'Hospital & Pickup',
      subtitle: isBn
        ? 'ভারতের শীর্ষ হাসপাতালে চিকিৎসা খরচ ধারণা ও এয়ারপোর্ট/স্টেশন পিকআপ সমন্বয়'
        : 'Hospital treatment estimate & airport/railway pickup coordination',
      price: isBn ? '৳১,৫০০+' : '৳1,500+',
      waText: 'Hello Processing Hub, I want Hospital Cost Estimate & Airport/Rail Pickup Coordination service in India (starting ৳1,500+).',
    },
    {
      id: 'quick-hotel-rail-bus',
      icon: Hotel,
      title: isBn ? 'হোটেল বুকিং ও ট্রেন/বাস প্যাকেজ' : 'Hotel Booking & Train/Bus Travel Package',
      shortLabel: isBn ? 'হোটেল ও ট্রেন/বাস' : 'Hotel & Train/Bus',
      subtitle: isBn
        ? 'কলকাতা/দিল্লি/চেন্নাই/ভেলোরে হোটেল ও ট্রেন-বাস ট্রাভেল প্যাকেজ'
        : 'Visa-supportive hotel booking & Indian rail/bus ticketing package',
      price: isBn ? '৳৭৯৯+' : '৳799+',
      waText: 'Hello Processing Hub, I want to book Hotel Booking & Train/Bus Travel Package in India (starting ৳799+).',
    },
  ] as const;

  const toggleServiceTag = (label: string) => {
    setSelectedServices((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const combinedCallbackNote = [
    selectedServices.length > 0
      ? `${isBn ? 'নির্বাচিত সেবা' : 'Selected Services'}: ${selectedServices.join(', ')}`
      : '',
    callbackNote.trim(),
  ]
    .filter(Boolean)
    .join(' | ');

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
          note: combinedCallbackNote,
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
        className="w-full max-w-[560px] max-h-[min(88vh,720px)] bg-white text-slate-900 rounded-xl border border-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.22)] flex flex-col overflow-hidden my-auto"
      >
        {/* Modal Header — Clean White Surface with Deep Green-Navy Accent & Neutral Close Button */}
        <div className="px-4 sm:px-6 py-4 bg-white border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#166534] mb-1">
              {t('কুইক মেনু', 'Quick Menu')}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#162238] leading-snug">
              {t('আপনার কাঙ্ক্ষিত সেবা নির্বাচন করুন', 'Select Your Desired Service')}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {t(
                'নিচের তালিকা থেকে যেকোনো সেবা বুক করুন অথবা সরাসরি কথা বলতে ফোন কল অনুরোধ পাঠান।',
                'Book any service from the list below or request a direct phone call from our support team.'
              )}
            </p>
          </div>

          <button
            type="button"
            id="quick-book-close-btn"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200/90 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label={t('বন্ধ করুন', 'Close modal')}
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1 bg-white">
          {/* Clean Segmented Tab Bar */}
          <div className="flex rounded-[6px] bg-slate-100 p-1 mb-4 text-xs font-semibold border border-slate-200/90">
            <button
              type="button"
              onClick={() => setQuickBookTab('services')}
              className={`flex-1 py-2 px-3 rounded-[5px] transition-all cursor-pointer ${
                quickBookTab === 'services'
                  ? 'bg-white text-[#162238] border border-slate-200/90 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('সার্ভিস তালিকা', 'Service List')}
            </button>
            <button
              type="button"
              onClick={() => setQuickBookTab('callback')}
              className={`flex-1 py-2 px-3 rounded-[5px] transition-all cursor-pointer ${
                quickBookTab === 'callback'
                  ? 'bg-white text-[#162238] border border-slate-200/90 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('ফোন কল অনুরোধ', 'Request a Call')}
            </button>
          </div>

          {quickBookTab === 'services' ? (
            <div className="space-y-2">
              {serviceOptions.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.id}
                    id={item.id}
                    href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(item.waText)}`}
                    data-service-name={item.title}
                    data-section={t('কুইক মেনু', 'Quick Menu')}
                    data-whatsapp-title={item.title}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="group flex items-center justify-between gap-3 p-3 rounded-[6px] bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-all cursor-pointer text-decoration-none"
                  >
                    {/* Left: Neutral Light Grey Box with Dark Slate-Navy Icon + Title & Subtitle */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-[5px] bg-slate-100 border border-slate-200/80 text-[#162238] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 group-hover:bg-slate-200/70 transition-colors">
                        <IconComponent className="w-4.5 h-4.5 stroke-[1.9]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[13.5px] sm:text-sm font-bold text-[#162238] leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-[11.5px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right: Plain Bold Price Text & Compact Solid 'বুক করুন' Button */}
                    <div className="flex items-center gap-2.5 shrink-0 pl-2">
                      <span className="text-[13px] sm:text-sm font-bold text-[#162238] whitespace-nowrap">
                        {item.price}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[5px] bg-[#166534] group-hover:bg-[#14532D] text-white text-[11.5px] font-semibold leading-none whitespace-nowrap shadow-2xs transition-colors">
                        <span>{t('বুক করুন', 'Book')}</span>
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
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
                <div className="p-5 text-center bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="w-11 h-11 mx-auto rounded-full bg-[#166534]/10 border border-[#166534]/20 flex items-center justify-center text-[#166534]">
                    <Check className="w-5 h-5 stroke-[2.4]" />
                  </div>
                  <h4 className="text-base font-bold text-[#162238]">
                    {t('অনুরোধ গ্রহণ করা হয়েছে!', 'Request Received!')}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                    {isBn ? (
                      <>
                        ধন্যবাদ <strong>{callbackName || 'সম্মানিত সেবাগ্রহীতা'}</strong>! আমাদের ভিসা সাপোর্ট টিম দ্রুত আপনার নম্বরে (<strong>{callbackPhone}</strong>) কল করে প্রয়োজনীয় সহায়তা প্রদান করবে।
                      </>
                    ) : (
                      <>
                        Thank you, <strong>{callbackName || 'valued guest'}</strong>! Our visa support team will call you shortly at (<strong>{callbackPhone}</strong>) with complete guidance.
                      </>
                    )}
                  </p>
                  {combinedCallbackNote && (
                    <div className="text-[11.5px] text-slate-700 bg-white border border-slate-200 rounded-[5px] px-3 py-2 max-w-md mx-auto">
                      {combinedCallbackNote}
                    </div>
                  )}
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    <a
                      href={`tel:${CONFIG.phone}`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-[5px] bg-[#166534] hover:bg-[#14532D] text-white transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>
                        {t(`সরাসরি কল করুন (${phoneDisplay})`, `Call Hotline (${phoneDisplay})`)}
                      </span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setCallbackSubmitted(false);
                        setSelectedServices([]);
                        setCallbackNote('');
                      }}
                      className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold rounded-[5px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {t('নতুন অনুরোধ', 'New Request')}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-3.5">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t(
                      'সরাসরি আমাদের টিমের ফোন কল পেতে নিচে আপনার নাম ও মোবাইল নম্বর দিন এবং প্রয়োজনীয় সেবা বাছাই করুন:',
                      'Enter your name and mobile number below, select your desired service(s), or write a custom note to receive a phone call:'
                    )}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#162238] mb-1">
                        {t('আপনার নাম', 'Your Full Name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={callbackName}
                        onChange={(e) => setCallbackName(e.target.value)}
                        placeholder={t('যেমন: মোঃ আরিফুল ইসলাম', 'e.g. Md. Ariful Islam')}
                        className="w-full text-xs py-2.5 px-3 bg-white border border-slate-300 rounded-[5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#162238] mb-1">
                        {t('মোবাইল নম্বর', 'Mobile Number')} <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={callbackPhone}
                        onChange={(e) => setCallbackPhone(e.target.value)}
                        placeholder={t('০১৭XXXXXXXX', '017XXXXXXXX')}
                        className="w-full text-xs py-2.5 px-3 bg-white border border-slate-300 rounded-[5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* Tappable Compact Service Tags + Manual Note Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-xs font-semibold text-[#162238]">
                        {t('কাঙ্ক্ষিত সেবা বা নোট (ঐচ্ছিক)', 'Desired Service or Note (Optional)')}
                      </label>
                      {selectedServices.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedServices([])}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          {t('সব মুছুন', 'Clear')}
                        </button>
                      )}
                    </div>

                    {/* Tappable Service Tags */}
                    <div
                      role="group"
                      aria-label={t('সেবা বাছাই করুন', 'Select services')}
                      className="flex flex-wrap gap-1.5 p-2.5 rounded-[6px] bg-slate-50 border border-slate-200/90"
                    >
                      {serviceOptions.map((item) => {
                        const isSelected = selectedServices.includes(item.shortLabel);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleServiceTag(item.shortLabel)}
                            aria-pressed={isSelected}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-[11.5px] font-semibold leading-tight border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#162238] text-white border-[#162238] shadow-2xs'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/90'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[2.5] shrink-0" />}
                            <span>{item.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Manual Custom Note Input */}
                    <input
                      type="text"
                      value={callbackNote}
                      onChange={(e) => setCallbackNote(e.target.value)}
                      placeholder={t(
                        'অথবা নিজের মতো লিখুন (যেমন: আমাকে ফোন করুন / জরুরি মেডিকেল স্লট প্রয়োজন)',
                        'Or type your own note (e.g. Please call me / Urgent medical slot needed)'
                      )}
                      className="w-full text-xs py-2.5 px-3 bg-white border border-slate-300 rounded-[5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15 transition-all"
                    />
                  </div>

                  {/* Centered, Text-Adjustable (w-fit), Solid Deep Forest Green Submit Button */}
                  <div className="pt-1.5 flex justify-center">
                    <button
                      type="submit"
                      id="callback-submit-btn"
                      disabled={isSubmittingCallback}
                      className="w-fit mx-auto px-5 py-2.5 rounded-[5px] bg-[#166534] hover:bg-[#14532D] active:translate-y-[1px] disabled:opacity-70 text-white text-xs sm:text-[13px] font-bold shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                      {isSubmittingCallback ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('অনুরোধ পাঠানো হচ্ছে...', 'Submitting Request...')}</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{t('কল ব্যাক অনুরোধ জমা দিন', 'Submit Call Back Request')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
