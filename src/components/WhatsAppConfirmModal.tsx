import React, { useEffect, useState, useRef } from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { CONFIG } from '../config';
import { X, User, Phone, Tag, Send, AlertCircle, Sparkles, MessagesSquare } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const USER_PROFILE_KEY = 'processinghub_user_profile';

export const WhatsAppConfirmModal: React.FC = () => {
  const { isOpen, closeWhatsAppModal, redirectData, triggerAgentHandoff } = useWhatsApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Lock background scroll when modal is open
  useBodyScrollLock(isOpen);

  // Whenever modal opens or redirectData changes, initialize inputs (pre-fill saved contact if available)
  useEffect(() => {
    if (isOpen && redirectData) {
      let savedName = '';
      let savedPhone = '';
      try {
        const raw = localStorage.getItem(USER_PROFILE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.name) savedName = String(parsed.name);
          if (parsed?.phone) savedPhone = String(parsed.phone);
        }
      } catch {
        // Ignore storage read error
      }

      setName(savedName);
      setPhone(savedPhone);
      setSubject(redirectData.serviceTitle || 'ইন্ডিয়ান ভিসা প্রসেসিং ও জরুরি পরামর্শ');
      setErrorMessage(null);
      setIsSubmitting(false);

      // Auto-focus the first name field if empty
      const timer = setTimeout(() => {
        if (!savedName) {
          nameInputRef.current?.focus();
        }
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

  const validateFields = () => {
    setErrorMessage(null);
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedSubject = subject.trim() || redirectData.serviceTitle || 'ভিসা প্রসেসিং সেবা';

    if (!trimmedName) {
      setErrorMessage('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      nameInputRef.current?.focus();
      return null;
    }

    if (trimmedName.length < 2) {
      setErrorMessage('অনুগ্রহ করে সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর)।');
      nameInputRef.current?.focus();
      return null;
    }

    if (!trimmedPhone) {
      setErrorMessage('অনুগ্রহ করে আপনার মোবাইল নম্বরটি লিখুন।');
      return null;
    }

    const cleanPhone = trimmedPhone.replace(/[\s-]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর লিখুন (যেমন: 01XXXXXXXXX)।');
      return null;
    }

    return {
      trimmedName,
      trimmedPhone,
      cleanPhone,
      trimmedSubject,
    };
  };

  const handleSubmitWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = validateFields();
    if (!valid) return;

    setIsSubmitting(true);

    // Build the formatted professional Bengali message
    const formattedMessage = `আসসালামু আলাইকুম,
নাম: ${valid.trimmedName}
মোবাইল নম্বর: ${valid.trimmedPhone}
সেবা/বিষয়: ${valid.trimmedSubject}

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

  const handleTalkToAgent = () => {
    const valid = validateFields();
    if (!valid) return;

    try {
      localStorage.setItem(
        USER_PROFILE_KEY,
        JSON.stringify({
          name: valid.trimmedName,
          phone: valid.cleanPhone,
        })
      );
    } catch {
      // Ignore storage write error
    }

    const formattedChatMessage = `নাম: ${valid.trimmedName}
মোবাইল নম্বর: ${valid.trimmedPhone}
সেবা/বিষয়: ${valid.trimmedSubject}${redirectData.sectionName ? `\nসেকশন: ${redirectData.sectionName}` : ''}

আমি এই বিষয়ে বিস্তারিত তথ্য ও সহায়তা পেতে আগ্রহী।`;

    triggerAgentHandoff({
      name: valid.trimmedName,
      phone: valid.cleanPhone,
      subject: valid.trimmedSubject,
      sectionName: redirectData.sectionName,
      serviceTitle: valid.trimmedSubject,
      formattedMessage: formattedChatMessage,
    });

    closeWhatsAppModal();
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
        className="bg-[#FAF9F6]/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_25px_60px_rgba(0,0,0,0.18)] max-w-[430px] w-full overflow-hidden text-[#1E2519] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sleek Integrated Minimal Header */}
        <div className="px-5 pt-4.5 pb-3.5 border-b border-[#ECE7DC] flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/12 border border-[#25D366]/25 text-[#15803d] flex items-center justify-center flex-shrink-0 shadow-xs">
              <MessagesSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 id="whatsapp-modal-title" className="font-bold text-[15px] leading-tight text-[#1E2519]">
                {redirectData.title || 'পরামর্শ ও যোগাযোগ ফর্ম'}
              </h3>
              <p className="text-[11px] text-[#65715D] font-medium mt-0.5">
                সরাসরি WhatsApp অথবা লাইভ এজেন্টের সাথে কথা বলুন
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
        <form onSubmit={handleSubmitWhatsApp} className="p-4 sm:p-5 space-y-3.5">
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
            <span>তথ্য পূরণ করে Talk to Agent বা WhatsApp-এ সরাসরি কথা শুরু করুন।</span>
          </div>

          {/* Actions: Talk to Agent + WhatsApp + Cancel */}
          <div className="pt-2 space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="modal-talk-to-agent-btn"
                onClick={handleTalkToAgent}
                disabled={isSubmitting}
                className="btn-3d-matte-secondary inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer disabled:opacity-70"
              >
                <MessagesSquare className="w-4 h-4 flex-shrink-0" />
                <span>Talk to Agent</span>
              </button>
              <button
                type="submit"
                id="modal-send-whatsapp-btn"
                disabled={isSubmitting}
                className="btn-3d-matte-green inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer disabled:opacity-70"
              >
                <Send className="w-4 h-4 flex-shrink-0" />
                <span>{isSubmitting ? 'প্রসেসিং...' : 'WhatsApp-এ পাঠান'}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={closeWhatsAppModal}
              className="btn-3d-red-glass w-full py-2 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer"
            >
              বাতিল
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
