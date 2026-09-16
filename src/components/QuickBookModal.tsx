import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  Compass, 
  Stethoscope, 
  Briefcase, 
  Layers, 
  Ticket, 
  CalendarClock, 
  Check, 
  Phone 
} from 'lucide-react';
import { CONFIG } from '../config';

interface QuickBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickBookModal: React.FC<QuickBookModalProps> = ({ isOpen, onClose }) => {
  const [quickBookTab, setQuickBookTab] = useState<'services' | 'callback'>('services');
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackNote, setCallbackNote] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [isSubmittingCallback, setIsSubmittingCallback] = useState(false);

  if (!isOpen) return null;

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim() || isSubmittingCallback) return;

    setIsSubmittingCallback(true);

    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };

    const timeString = new Date().toLocaleString('bn-BD', {
      timeZone: 'Asia/Dhaka',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const safeName = escapeHtml(callbackName.trim() || 'উল্লেখ করা হয়নি');
    const safePhone = escapeHtml(callbackPhone.trim());
    const safeNote = escapeHtml(callbackNote.trim() || 'সাধারণ তথ্য');

    const htmlMessage = 
      `🚨 <b>নতুন কল ব্যাক অনুরোধ এসেছে!</b>\n\n` +
      `👤 <b>নাম:</b> ${safeName}\n` +
      `📞 <b>মোবাইল নম্বর:</b> <code>${safePhone}</code>\n` +
      `💼 <b>কাঙ্ক্ষিত সেবা/নোট:</b> ${safeNote}\n` +
      `⏰ <b>সময়:</b> ${timeString}\n` +
      `🌐 <b>উৎস:</b> Processing Hub Website`;

    try {
      if (CONFIG.telegram?.botToken && CONFIG.telegram?.chatId) {
        await fetch(`https://api.telegram.org/bot${CONFIG.telegram.botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: CONFIG.telegram.chatId,
            text: htmlMessage,
            parse_mode: 'HTML',
          }),
        });
      }
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
              বুকিং সার্ভিস নির্বাচন
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-[#161D28] leading-snug">
              আপনার কাঙ্ক্ষিত সেবা নির্বাচন করুন
            </h3>
            <p className="text-xs text-[#5A6474] mt-1.5">
              নিচের যেকোনো সার্ভিসে ক্লিক করলে তাৎক্ষণিক তথ্যসহ WhatsApp-এ যুক্ত হয়ে যাবেন:
            </p>
          </div>

          <button
            type="button"
            id="quick-book-close-btn"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[var(--periwinkle-border)] bg-white hover:bg-[var(--periwinkle-light)] text-[var(--periwinkle-dark)] flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
            aria-label="Close modal"
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
              সার্ভিস লিস্ট (WhatsApp)
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
              ফোন কল অনুরোধ (Call Back)
            </button>
          </div>

          {quickBookTab === 'services' ? (
            <div className="space-y-2.5">
              {/* 1. Tourist Visa */}
              <a
                id="quick-tourist-visa"
                href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I want to book Indian Tourist Visa processing (Service Charge: ৳1,500).')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="book-service-option"
                onClick={onClose}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--mint-light)] flex items-center justify-center text-[var(--mint-dark)] border border-[var(--mint-border)] flex-shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#161D28]">Tourist Visa (ট্যুরিস্ট ভিসা)</h4>
                    <p className="text-xs text-[#5A6474]">ফরম পূরণ, আইভ্যাক স্লট ও ফাইল প্রসেসিং</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-[var(--mint-dark)] bg-[var(--mint-light)] border border-[var(--mint-border)] px-2 py-0.5 rounded-full block">৳১,৫০০</span>
                  <span className="text-[10px] text-[var(--periwinkle-dark)] inline-flex items-center gap-0.5 mt-0.5">WhatsApp <ChevronRight className="w-3 h-3" /></span>
                </div>
              </a>

              {/* 2. Medical Visa */}
              <a
                id="quick-medical-visa"
                href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I want to book Indian Medical Visa processing (Service Charge: ৳4,000).')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="book-service-option"
                onClick={onClose}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--periwinkle-light)] flex items-center justify-center text-[var(--periwinkle-dark)] border border-[var(--periwinkle-border)] flex-shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#161D28]">Medical Visa (মেডিকেল ভিসা)</h4>
                    <p className="text-xs text-[#5A6474]">হাসপাতাল ইনভাইটেশন লেটার ও মেডিকেল ফাইল</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-[var(--mint-dark)] bg-[var(--mint-light)] border border-[var(--mint-border)] px-2 py-0.5 rounded-full block">৳৪,০০০</span>
                  <span className="text-[10px] text-[var(--periwinkle-dark)] inline-flex items-center gap-0.5 mt-0.5">WhatsApp <ChevronRight className="w-3 h-3" /></span>
                </div>
              </a>

              {/* 3. Business Visa */}
              <a
                id="quick-business-visa"
                href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I want to book Indian Business Visa processing (Service Charge: ৳5,000).')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="book-service-option"
                onClick={onClose}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--mint-light)] flex items-center justify-center text-[var(--mint-dark)] border border-[var(--mint-border)] flex-shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#161D28]">Business Visa (বিজনেস ভিসা)</h4>
                    <p className="text-xs text-[#5A6474]">ইনভাইটেশন পেপারস ও ট্রেড ডকুমেন্টস ফাইল</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-[var(--mint-dark)] bg-[var(--mint-light)] border border-[var(--mint-border)] px-2 py-0.5 rounded-full block">৳৫,০০০</span>
                  <span className="text-[10px] text-[var(--periwinkle-dark)] inline-flex items-center gap-0.5 mt-0.5">WhatsApp <ChevronRight className="w-3 h-3" /></span>
                </div>
              </a>

              {/* 4. Double Entry Visa */}
              <a
                id="quick-double-entry-visa"
                href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I want to book Indian Double Entry Visa processing (Service Charge: ৳3,000).')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="book-service-option"
                onClick={onClose}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--periwinkle-light)] flex items-center justify-center text-[var(--periwinkle-dark)] border border-[var(--periwinkle-border)] flex-shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#161D28]">Double Entry Visa (ডবল এন্ট্রি ভিসা)</h4>
                    <p className="text-xs text-[#5A6474]">নেপাল/ভুটান ট্রানজিট ও দুইবার প্রবেশ সুবিধা</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-[var(--mint-dark)] bg-[var(--mint-light)] border border-[var(--mint-border)] px-2 py-0.5 rounded-full block">৳৩,০০০</span>
                  <span className="text-[10px] text-[var(--periwinkle-dark)] inline-flex items-center gap-0.5 mt-0.5">WhatsApp <ChevronRight className="w-3 h-3" /></span>
                </div>
              </a>

              {/* 5. Ticket Booking */}
              <a
                id="quick-ticket-booking"
                href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I want to book Ticket Booking service (Air / Travel Ticket).')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="book-service-option"
                onClick={onClose}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--mint-light)] flex items-center justify-center text-[var(--mint-dark)] border border-[var(--mint-border)] flex-shrink-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#161D28]">Ticket Booking (টিকেট বুকিং)</h4>
                    <p className="text-xs text-[#5A6474]">এয়ার টিকেট ও ভিসা ট্রানজিট কনফার্মড টিকেট</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-[var(--mint-dark)] bg-[var(--mint-light)] border border-[var(--mint-border)] px-2 py-0.5 rounded-full block">৳১,০০০</span>
                  <span className="text-[10px] text-[var(--periwinkle-dark)] inline-flex items-center gap-0.5 mt-0.5">WhatsApp <ChevronRight className="w-3 h-3" /></span>
                </div>
              </a>

              {/* 6. Visa Slot Booking */}
              <a
                id="quick-slot-booking"
                href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I want to book Indian Visa Appointment Slot (Tourist / Medical / Business / Double Entry).')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="book-service-option"
                onClick={onClose}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--periwinkle-light)] flex items-center justify-center text-[var(--periwinkle-dark)] border border-[var(--periwinkle-border)] flex-shrink-0">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#161D28]">Slot Booking (ভিসার স্লট বুকিং)</h4>
                    <p className="text-xs text-[#5A6474]">আইভ্যাক ফি ১৫০০৳ + নির্ধারিত ক্যাটাগরি ফি</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-[var(--mint-dark)] bg-[var(--mint-light)] border border-[var(--mint-border)] px-2 py-0.5 rounded-full block">১৫০০৳ + ফি</span>
                  <span className="text-[10px] text-[var(--periwinkle-dark)] inline-flex items-center gap-0.5 mt-0.5">WhatsApp <ChevronRight className="w-3 h-3" /></span>
                </div>
              </a>
            </div>
          ) : (
            /* Callback Request Form */
            <div>
              {callbackSubmitted ? (
                <div className="p-5 text-center bg-[#F2F6EF] border border-[#DEE6D8] rounded-xl space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#E2EEDC] flex items-center justify-center text-[#3B6632]">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#1E2519]">অনুরোধ গ্রহণ করা হয়েছে!</h4>
                  <p className="text-xs text-[#55604C] leading-relaxed">
                    ধন্যবাদ {callbackName || 'সম্মানিত সেবাগ্রহীতা'}! আমাদের ভিসা কনসালটেন্ট দল দ্রুত আপনার নম্বরে (<strong>{callbackPhone}</strong>) কল করে প্রয়োজনীয় দিকনির্দেশনা প্রদান করবে।
                  </p>
                  <div className="pt-2">
                    <a
                      href={`tel:${CONFIG.phone}`}
                      className="btn-3d-matte-primary inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>এখনই সরাসরি কল করুন ({CONFIG.phoneDisplay})</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-3.5">
                  <p className="text-xs text-[#65715D] leading-relaxed">
                    WhatsApp ছাড়াও আপনি চাইলে সরাসরি আমাদের কনসালটেন্টের কল পেতে পারেন। নিচে আপনার তথ্য দিন:
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-[#26301F] mb-1">
                      আপনার নাম
                    </label>
                    <input
                      type="text"
                      required
                      value={callbackName}
                      onChange={(e) => setCallbackName(e.target.value)}
                      placeholder="উদা: মোঃ আরিফুল ইসলাম"
                      className="w-full text-xs py-2 px-3 bg-[#FAF9F5] border border-[#D5CFBF] rounded-lg text-[#1E2519] focus:outline-none focus:border-[#5F7758]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#26301F] mb-1">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-xs py-2 px-3 bg-[#FAF9F5] border border-[#D5CFBF] rounded-lg text-[#1E2519] focus:outline-none focus:border-[#5F7758]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#26301F] mb-1">
                      কাঙ্ক্ষিত সেবা বা নোট (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={callbackNote}
                      onChange={(e) => setCallbackNote(e.target.value)}
                      placeholder="উদা: মেডিকেল ভিসা স্লট বুকিং"
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
                        <span>অনুরোধ পাঠানো হচ্ছে...</span>
                      </>
                    ) : (
                      'কল ব্যাক অনুরোধ জমা দিন'
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
