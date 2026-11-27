import React, { useState } from 'react';
import {
  CalendarCheck2,
  MessageCircle,
  CheckCircle2,
  Circle,
  FileText,
  CalendarClock,
  MapPin,
  Sparkles,
  Download,
  AlertCircle,
} from 'lucide-react';
import { VisaService } from '../types';
import { getSlotTypes } from '../data/visaData';
import { CONFIG, getIvacCenters, getPhoneDisplay } from '../config';
import { generateChecklistPdf } from '../utils/generateChecklistPdf';
import { useLanguage } from '../context/LanguageContext';

interface SlotBookingInlineSectionProps {
  service: VisaService;
}

export const SlotBookingInlineSection: React.FC<SlotBookingInlineSectionProps> = ({
  service,
}) => {
  const { language, t, num, currency } = useLanguage();
  const isBn = language === 'bn';
  const slotTypes = getSlotTypes(language);
  const ivacCenters = getIvacCenters(language);

  const [selectedSlotId, setSelectedSlotId] = useState<string>(slotTypes[0]?.id || 'medical-slot');
  const [selectedIvacIdx, setSelectedIvacIdx] = useState<number>(0);
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const selectedSlot = slotTypes.find((s) => s.id === selectedSlotId) || slotTypes[0];
  const selectedIvacCenter = ivacCenters[selectedIvacIdx] || ivacCenters[0];
  const isSlotWebFileChecked = !!checkedDocs[0];
  const isSlotSimChecked = !!checkedDocs[1];
  const totalCount = service.documents.length;
  const progressPercent = isSlotWebFileChecked ? 100 : 0;

  const toggleDoc = (idx: number) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleDownloadChecklist = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      await generateChecklistPdf({
        serviceTitle: service.title,
        category: service.category,
        price: isBn
          ? `${currency(selectedSlot.totalFee)} (আইভ্যাক ফি ১,৫০০৳ + স্লট ফি ${currency(selectedSlot.serviceCharge)})`
          : `${currency(selectedSlot.totalFee)} (IVAC Fee ৳1,500 + Slot Charge ${currency(selectedSlot.serviceCharge)})`,
        isSlotBooking: true,
        slotName: selectedSlot.name,
        ivacCenter: selectedIvacCenter,
        documents: service.documents.map((doc, idx) => ({
          title: doc,
          isCompleted: !!checkedDocs[idx],
        })),
        specialNotes: service.specialNotes,
        portNote: service.portNote,
        phoneDisplay: getPhoneDisplay(language),
        email: CONFIG.email,
        brandName: CONFIG.brandName,
        language,
      });
    } catch (err) {
      console.error('Slot checklist PDF generation error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const slotWhatsAppMessage = `Hello Processing Hub, I want to book Indian Visa Slot (Only Slot) for ${selectedSlot.name}. Selected IVAC Center: ${selectedIvacCenter}. IVAC Fee: ৳${selectedSlot.ivacFee} + Slot Charge: ৳${selectedSlot.serviceCharge} (Total: ৳${selectedSlot.totalFee}). Web File: Ready. SIM Card: ${
    isSlotSimChecked
      ? 'I will provide my own SIM card'
      : 'Please arrange a SIM card (extra charge applicable)'
  }. Please confirm slot availability.`;

  return (
    <section id="visa-slot-booking-full-section" className="w-full max-w-6xl mx-auto px-4 !py-0 space-y-5">
      {/* 1. Top Header Banner Card (No "Slot & Checklist" popup button) */}
      <div className="rounded-3xl bg-white/95 border border-[#C6D0FB] p-5 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-3 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E743B] bg-[#EBF7EE] px-3 py-1 rounded-full border border-[#CDE5D5]">
            <CalendarCheck2 className="w-3.5 h-3.5" />
            {t('আইভ্যাক (IVAC) অ্যাপয়েন্টমেন্ট ও স্লট বুকিং', 'IVAC Appointment & Slot Booking')}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#161D28] tracking-tight">
            {service.title}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#4A5545] leading-relaxed">
            {service.description}
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <div className="px-3 py-1.5 rounded-full bg-[#EEF1FE] border border-[#BAC5FA] text-xs font-bold text-[#263375]">
              {t('শুধু স্লট ফি (শুরু): ', 'Slot Fee (Starting): ')}
              <span>{service.price}</span>{' '}
              <span className="font-normal">{service.per}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-[#F2F9F0] border border-[#8ED183] text-xs font-bold text-[#173E12]">
              {t('আইভ্যাক ৳১,৫০০ সরকারি ফি অন্তর্ভুক্ত', 'Includes ৳1,500 Official IVAC Fee')}
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2 shrink-0">
          <a
            id="slots-page-whatsapp-btn"
            href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(slotWhatsAppMessage)}`}
            data-service-name={
              isBn
                ? `ভিসা স্লট বুকিং (${selectedSlot.name}) - ${selectedIvacCenter}`
                : `Visa Slot Booking (${selectedSlot.name}) - ${selectedIvacCenter}`
            }
            data-section={t('ভিসা স্লট বুকিং সেকশন', 'Visa Slot Booking Section')}
            data-whatsapp-title={t('ভিসা স্লট বুকিং', 'Visa Slot Booking')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-3d-matte-green w-fit px-3.5 py-2 rounded-full text-xs sm:text-[13px] leading-none font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-[#124218]"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{t('হোয়াটসঅ্যাপ কনফার্ম', 'WhatsApp Confirm')}</span>
          </a>
        </div>
      </div>

      {/* 2. Full Expanded Visa Slot Categories, IVAC Center, Requirements Checklist & Rules Section */}
      <div
        id="inline-slot-checklist-section"
        className="rounded-3xl bg-white/95 border border-[#D8DEFA] shadow-xs overflow-hidden"
      >
        {/* Section Header Strip */}
        <div className="p-4 sm:p-6 bg-[#FAF9F5] border-b border-[#E5E0D4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-block text-[11px] font-semibold text-[#4E5C46] bg-[#ECE8DC] px-2.5 py-0.5 rounded mb-1.5">
              {service.category}
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-[#1E2519] leading-snug">
              {t(
                'ভিসা স্লট ক্যাটাগরি, আইভ্যাক সেন্টার ও প্রয়োজনীয় চেকলিস্ট',
                'Visa Slot Categories, IVAC Center & Required Checklist'
              )}
            </h2>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-white border border-[#DCE4D8] text-xs sm:text-sm text-[#4E5C46] self-start sm:self-auto">
            {t('নির্বাচিত স্লট মোট ফি:', 'Selected Slot Total Fee:')}{' '}
            <strong className="text-[#1E2519] font-extrabold text-sm sm:text-base">
              {currency(selectedSlot.totalFee)}
            </strong>{' '}
            <span className="text-[11px] text-[#6B7563] block sm:inline">
              {isBn
                ? `(আইভ্যাক ফি ১,৫০০৳ + স্লট চার্জ ${currency(selectedSlot.serviceCharge)})`
                : `(IVAC Fee ৳1,500 + Slot Charge ${currency(selectedSlot.serviceCharge)})`}
            </span>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Slot Categories Grid + IVAC Center Dropdown */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E0D4] space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-[#26301F] flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4 text-[#5F7758]" />
                {t('১. ভিসার স্লট ক্যাটাগরি নির্বাচন করুন:', '1. Select Visa Slot Category:')}
              </span>
              <span className="text-[11px] font-semibold text-[#65715D] bg-[#ECE8DC] px-2.5 py-0.5 rounded">
                {t('আইভ্যাক নির্ধারিত ফি: ১,৫০০৳', 'Official IVAC Fee: ৳1,500')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {slotTypes.map((slot) => {
                const isSelected = selectedSlot.id === slot.id;
                return (
                  <div
                    key={slot.id}
                    id={`inline-slot-card-${slot.id}`}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`slot-category-card cursor-pointer ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-xs sm:text-[13px] font-bold text-[#1E2519] leading-snug">
                        {slot.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#5F7758] flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="mt-2 text-[11.5px] text-[#65715D] space-y-0.5">
                      <div>
                        {t('আইভ্যাক ফি:', 'IVAC Fee:')} {currency(slot.ivacFee)}
                      </div>
                      <div>
                        {t('স্লট ফি:', 'Slot Charge:')} {currency(slot.serviceCharge)}
                      </div>
                      <div className="pt-1.5 mt-1 border-t border-[#E5E0D4] font-bold text-xs text-[#1E2519]">
                        {t('মোট ফি:', 'Total Fee:')} {currency(slot.totalFee)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Preferred IVAC Center Selection Dropdown */}
            <div className="pt-3 border-t border-[#E5E0D4] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <label
                htmlFor="inline-ivac-center-select"
                className="text-xs sm:text-sm font-bold text-[#26301F] flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-[#5F7758]" />
                {t('২. পছন্দসই আইভ্যাক সেন্টার নির্বাচন করুন:', '2. Select Preferred IVAC Center:')}
              </label>
              <select
                id="inline-ivac-center-select"
                value={selectedIvacIdx}
                onChange={(e) => setSelectedIvacIdx(Number(e.target.value))}
                className="w-full sm:w-80 text-xs sm:text-sm font-medium py-2.5 px-3.5 bg-white border border-[#D5CFBF] rounded-xl text-[#1E2519] focus:outline-none focus:border-[#5F7758]"
              >
                {ivacCenters.map((center, idx) => (
                  <option key={idx} value={idx}>
                    {center}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Required Information Checklist (#1 Web File Mandatory, #2 SIM Optional) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFEBE2]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5F7758]" />
                <span className="text-sm font-bold text-[#26301F]">
                  {t('৩. স্লট বুকিংয়ের জন্য প্রয়োজনীয় তথ্য ও চেকলিস্ট', '3. Required Information for Slot Booking')}
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#F2F6EF] text-[#4E5C46] border border-[#DEE6D8]">
                {isBn ? `মোট: ${num(totalCount)}টি` : `Total: ${totalCount} items`}
              </span>
            </div>

            <p className="text-xs text-[#6B7563] leading-relaxed">
              {t(
                'স্লট বুকিংয়ের জন্য আপনাকে ওয়েব ফাইল বাধ্যতামূলক দিতে হবে (১ নম্বর ঘরে টিক দিন) এবং সিম কার্ড ঐচ্ছিক (নিজস্ব সিম দিতে চাইলে ২ নম্বর ঘরে টিক দিন):',
                'Providing your Web File is mandatory (check item #1) and a SIM card is optional (check item #2 if providing your own SIM):'
              )}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {service.documents.map((doc, idx) => {
                const isChecked = !!checkedDocs[idx];
                return (
                  <div
                    key={idx}
                    id={`inline-slot-requirement-item-${idx + 1}`}
                    onClick={() => toggleDoc(idx)}
                    className={`service-checklist-item cursor-pointer ${isChecked ? 'checked' : ''}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-[#5F7758]" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#B5BCAD]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        {idx === 0 ? (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            {t('বাধ্যতামূলক', 'Mandatory')}
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {t('ঐচ্ছিক (সিম না দিলে অতিরিক্ত চার্জ)', 'Optional (Extra charge if SIM not provided)')}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs sm:text-sm leading-relaxed block ${
                          isChecked ? 'font-semibold text-[#1E2519]' : 'text-[#3A4432]'
                        }`}
                      >
                        <span className="inline-block font-bold text-[#4E5C46] mr-1.5">
                          {isBn ? `${num(idx + 1)})` : `${idx + 1}.`}
                        </span>
                        {doc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official IVAC Slot Booking Rules Box */}
          {service.specialNotes && service.specialNotes.length > 0 && (
            <div
              id="inline-slot-special-notes-box"
              className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-2"
            >
              <div className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>
                  {isBn
                    ? `আইভ্যাক স্লট বুকিং নিয়মাবলি (${selectedSlot.name} — সকল ক্যাটাগরির জন্য প্রযোজ্য):`
                    : `Official IVAC Slot Booking Rules (${selectedSlot.name} — Applies to All Categories):`}
                </span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-xs text-amber-950/90 leading-relaxed">
                {service.specialNotes.map((note, noteIdx) => (
                  <li key={noteIdx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Progress & Action Footer */}
        <div className="px-4 sm:px-6 py-4 bg-[#F8F7F2] border-t border-[#E8E4D8] space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium text-[#26301F]">
            <span className="flex items-center gap-1.5 text-[#3D5237] font-semibold">
              {isSlotWebFileChecked
                ? t('স্লট বুকিংয়ের জন্য প্রস্তুত', 'Ready for Slot Booking')
                : t('ধাপ ১: উপরে ১ নং ওয়েব ফাইল সিলেক্ট করুন', 'Step 1: Select #1 Web File above')}
            </span>
            {isSlotWebFileChecked ? (
              <span className="text-[11px] font-bold text-[#20BD5A] bg-[#E8F8EE] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#BCE8CB]">
                <Sparkles className="w-3 h-3" />
                {isSlotSimChecked
                  ? t('ওয়েব ফাইল ও নিজস্ব সিম প্রস্তুত!', 'Web File & Own SIM Ready!')
                  : t('ওয়েব ফাইল প্রস্তুত (সিম অফিস থেকে — অতিরিক্ত চার্জ)', 'Web File Ready (SIM via Hub — Extra Charge)')}
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                {t('ওয়েব ফাইল নির্বাচন আবশ্যক', 'Web File Selection Required')}
              </span>
            )}
          </div>

          <div className="checklist-progress-track">
            <div className="checklist-progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="text-xs font-semibold text-[#4E5C46] bg-white px-3 py-1.5 rounded-lg border border-[#DEE6D8] w-fit">
              {t('সর্বমোট স্লট ফি:', 'Total Slot Fee:')}{' '}
              <strong className="text-[#1E2519] text-sm">{currency(selectedSlot.totalFee)}</strong>{' '}
              <span className="text-[11px] text-[#6B7563]">
                ({selectedSlot.name} • {selectedIvacCenter})
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {isSlotWebFileChecked ? (
                <>
                  <button
                    type="button"
                    id="inline-download-slot-checklist-btn"
                    onClick={handleDownloadChecklist}
                    disabled={isDownloadingPdf}
                    className="btn-3d-matte-secondary w-fit inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs leading-tight font-bold rounded-[5px] whitespace-nowrap cursor-pointer"
                  >
                    {isDownloadingPdf ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[var(--periwinkle-dark)] border-t-transparent rounded-full animate-spin" />
                        <span>{t('তৈরি হচ্ছে...', 'Generating...')}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-[var(--periwinkle-dark)] shrink-0" />
                        <span>{t('চেকলিস্ট পিডিএফ', 'Checklist PDF')}</span>
                      </>
                    )}
                  </button>

                  <a
                    id="inline-slot-whatsapp-submit-btn"
                    href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(slotWhatsAppMessage)}`}
                    data-service-name={
                      isBn
                        ? `ভিসা স্লট বুকিং (${selectedSlot.name}) - ${selectedIvacCenter} | ${
                            isSlotSimChecked ? 'ওয়েব ফাইল + নিজস্ব সিম' : 'ওয়েব ফাইল (সিম অফিস থেকে — অতিরিক্ত চার্জ)'
                          }`
                        : `Visa Slot Booking (${selectedSlot.name}) - ${selectedIvacCenter} | ${
                            isSlotSimChecked ? 'Web File + Own SIM' : 'Web File (SIM via Hub — Extra Charge)'
                          }`
                    }
                    data-section={t('ভিসা স্লট বুকিং সেকশন', 'Visa Slot Booking Section')}
                    data-whatsapp-title={t('ভিসা স্লট বুকিং', 'Visa Slot Booking')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-3d-matte-green w-fit inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs leading-tight font-bold rounded-[5px] whitespace-nowrap text-[#124218]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('হোয়াটসঅ্যাপ / এজেন্টে স্লট বুক করুন', 'Book Slot via WhatsApp / Agent')}</span>
                  </a>
                </>
              ) : (
                <div className="w-fit text-xs leading-tight font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-[5px]">
                  {t('এগিয়ে যেতে উপরে ১ নং "ওয়েব ফাইল" চেক মার্ক করুন', 'Check #1 "Web File" above to proceed')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
