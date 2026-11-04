import React, { useEffect, useState, useRef } from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { CONFIG } from '../config';
import { X, User, Phone, Tag, Send, AlertCircle, Sparkles } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const WhatsAppConfirmModal: React.FC = () => {
  const { isOpen, closeWhatsAppModal, redirectData } = useWhatsApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Lock background scroll when modal is open
  useBodyScrollLock(isOpen);

  // Whenever modal opens or redirectData changes, initialize inputs
  useEffect(() => {
    if (isOpen && redirectData) {
      setName('');
      setPhone('');
      setSubject(redirectData.serviceTitle || 'ইন্ডিয়ান ভিসা প্রসেসিং ও জরুরি পরামর্শ');
      setErrorMessage(null);
      setIsSubmitting(false);

      // Auto-focus the first name field
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen, redirectData]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeWhatsAppModal();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeWhatsAppModal]);

  if (!isOpen || !redirectData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedSubject = subject.trim() || redirectData.serviceTitle || 'ভিসা প্রসেসিং সেবা';

    // Validation
    if (!trimmedName) {
      setErrorMessage('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      nameInputRef.current?.focus();
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMessage('অনুগ্রহ করে সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর)।');
      return;
    }

    if (!trimmedPhone) {
      setErrorMessage('অনুগ্রহ করে আপনার মোবাইল নম্বরটি লিখুন।');
      return;
    }

    const cleanPhone = trimmedPhone.replace(/[\s-]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর লিখুন (যেমন: 01XXXXXXXXX)।');
      return;
    }

    setIsSubmitting(true);

    // Build the formatted professional Bengali message
    const formattedMessage = `আসসালামু আলাইকুম,
নাম: ${trimmedName}
মোবাইল নম্বর: ${trimmedPhone}
সেবা/বিষয়: ${trimmedSubject}

আমি এই বিষয়ে বিস্তারিত তথ্য ও দ্রুত প্রসেসিং সহায়তা পেতে আগ্রহী।`;

    const targetNumber = CONFIG.phone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(formattedMessage)}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    // Close modal
    setTimeout(() => {
      setIsSubmitting(false);
      closeWhatsAppModal();
    }, 300);
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xl animate-fadeIn overscroll-contain"
      style={{ overscrollBehavior: 'contain' }}
      onClick={closeWhatsAppModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      <div 
        className="bg-[#FAF9F6]/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_25px_60px_rgba(0,0,0,0.18)] max-w-[410px] w-full overflow-hidden text-[#1E2519] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sleek Integrated Minimal Header */}
        <div className="px-5 pt-4.5 pb-3.5 border-b border-[#ECE7DC] flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/12 border border-[#25D366]/25 text-[#15803d] flex items-center justify-center flex-shrink-0 shadow-xs">
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 fill-current"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </div>
            <div>
              <h3 id="whatsapp-modal-title" className="font-bold text-[15px] leading-tight text-[#1E2519]">
                {redirectData.title || 'পরামর্শ ও যোগাযোগ ফর্ম'}
              </h3>
              <p className="text-[11px] text-[#65715D] font-medium mt-0.5">
                সরাসরি WhatsApp-এ কনসালট্যান্টের সাথে কথা বলুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeWhatsAppModal}
            className="btn-3d-red-glass w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Clean Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1st Box: Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#2C3627] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#5F7758]" />
                <span>১. আপনার নাম</span>
              </span>
              <span className="text-[11px] text-[#8C9885] font-normal">আবশ্যক</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: মোঃ রফিকুল ইসলাম"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6C8] bg-white text-sm text-[#1E2519] placeholder:text-[#9EA898] focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/15 transition-all shadow-xs"
              required
            />
          </div>

          {/* 2nd Box: Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-[#2C3627] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#5F7758]" />
                <span>২. মোবাইল নম্বর</span>
              </span>
              <span className="text-[11px] text-[#8C9885] font-normal">আবশ্যক</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="যেমন: 01XXXXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6C8] bg-white text-sm text-[#1E2519] placeholder:text-[#9EA898] focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/15 transition-all font-mono shadow-xs"
              required
            />
          </div>

          {/* 3rd Dynamic Box: Section / Service Topic */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#2C3627] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#5F7758]" />
                <span>৩. সেবা / বিষয়</span>
              </label>
              {redirectData.sectionName && (
                <span className="text-[10.5px] bg-[#EBF5ED] text-[#1E743B] font-medium px-2 py-0.5 rounded-md border border-[#CDE5D5]">
                  {redirectData.sectionName}
                </span>
              )}
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="সেবার নাম বা অনুসন্ধানের বিষয়"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6C8] bg-white text-sm text-[#1E2519] font-medium placeholder:text-[#9EA898] focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/15 transition-all shadow-xs"
            />
          </div>

          {/* Discreet Minimal Info Note */}
          <div className="bg-white/80 border border-[#E2DDD2] rounded-xl px-3 py-2 text-[11px] text-[#4E5C46] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0" />
            <span>তথ্য পূরণ করে পাঠালে সরাসরি কনসালট্যান্টের সাথে চ্যাট শুরু হবে।</span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeWhatsAppModal}
              className="btn-3d-red-glass px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-3d-matte-green flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-70"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'WhatsApp-এ পাঠান'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
