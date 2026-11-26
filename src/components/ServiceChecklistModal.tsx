import React, { useEffect, useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  FileText, 
  CalendarClock, 
  MapPin, 
  Sparkles, 
  Download,
  Puzzle,
  ExternalLink,
  AlertCircle,
  Compass
} from 'lucide-react';
import { VisaService } from '../types';
import { getSlotTypes } from '../data/visaData';
import { CONFIG, getIvacCenters, getPhoneDisplay } from '../config';
import { generateChecklistPdf } from '../utils/generateChecklistPdf';
import { useLanguage } from '../context/LanguageContext';

interface ServiceChecklistModalProps {
  service: VisaService | null;
  onClose: () => void;
}

export const ServiceChecklistModal: React.FC<ServiceChecklistModalProps> = ({
  service,
  onClose
}) => {
  const { language, t, num, currency } = useLanguage();
  const isBn = language === 'bn';
  const slotTypes = getSlotTypes(language);
  const ivacCenters = getIvacCenters(language);

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [selectedSlotId, setSelectedSlotId] = useState<string>(slotTypes[0]?.id || 'medical-slot');
  const [selectedIvacIdx, setSelectedIvacIdx] = useState<number>(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Reset slot booking checkboxes whenever modal closes so mandatory Web File gating starts fresh
  useEffect(() => {
    if (!service) {
      setCheckedDocs((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (k.startsWith('visa-slot-booking-')) {
            delete next[k];
          }
        });
        return next;
      });
    }
  }, [service]);

  if (!service) return null;

  const selectedSlot = slotTypes.find((s) => s.id === selectedSlotId) || slotTypes[0];
  const selectedIvacCenter = ivacCenters[selectedIvacIdx] || ivacCenters[0];
  const isSlotWebFileChecked = !!checkedDocs[`${service.id}-0`];
  const isSlotSimChecked = !!checkedDocs[`${service.id}-1`];
  const canShowActionButtons = !service.isSlotBooking || isSlotWebFileChecked;

  const toggleDoc = (index: number) => {
    const key = `${service.id}-${index}`;
    setCheckedDocs((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getCompletedCount = () => {
    return service.documents.reduce((count, _, idx) => {
      return count + (checkedDocs[`${service.id}-${idx}`] ? 1 : 0);
    }, 0);
  };

  const isNonVisaAddonService = [
    'ticket-booking',
    'mofa-notary-translation',
    'medical-cost-airport-pickup',
    'hotel-rail-bus-package'
  ].includes(service.id);

  const handleDownloadChecklist = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      await generateChecklistPdf({
        serviceTitle: service.title,
        category: service.category,
        price: service.isSlotBooking 
          ? isBn
            ? `${currency(selectedSlot.totalFee)} (আইভ্যাক ফি ১,৫০০৳ + স্লট ফি ${currency(selectedSlot.serviceCharge)})`
            : `${currency(selectedSlot.totalFee)} (IVAC Fee ৳1,500 + Slot Charge ${currency(selectedSlot.serviceCharge)})`
          : service.id === 'ticket-booking'
            ? isBn
              ? `${service.price} (মূল টিকেট মূল্যের সাথে অতিরিক্ত, আলোচনা সাপেক্ষে)`
              : `${service.price} (Service charge on top of base fare, negotiable)`
            : isNonVisaAddonService
              ? `${service.price} (${service.per.replace('/ ', '')})`
              : isBn
                ? `${service.price} (আইভ্যাক ফি ১,৫০০৳ ও স্লটসহ)`
                : `${service.price} (Including ৳1,500 IVAC fee & slot)`,
        isSlotBooking: service.isSlotBooking,
        slotName: service.isSlotBooking ? selectedSlot.name : undefined,
        ivacCenter: service.isSlotBooking ? selectedIvacCenter : undefined,
        documents: service.documents.map((doc, idx) => ({
          title: doc,
          isCompleted: !!checkedDocs[`${service.id}-${idx}`]
        })),
        specialNotes: service.specialNotes,
        portNote: service.portNote,
        phoneDisplay: getPhoneDisplay(language),
        email: CONFIG.email,
        brandName: CONFIG.brandName,
        language
      });
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const completedCount = getCompletedCount();
  const totalCount = service.documents.length;
  const progressPercent = service.isSlotBooking
    ? isSlotWebFileChecked
      ? 100
      : 0
    : Math.round((completedCount / (totalCount || 1)) * 100);

  return (
    <div 
      id="service-checklist-modal"
      className="service-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="service-modal-card"
      >
        {/* Modal Header */}
        <div className="service-modal-header">
          <div>
            <span className="inline-block text-[11px] font-semibold text-[#4E5C46] bg-[#ECE8DC] px-2.5 py-0.5 rounded mb-2">
              {service.category}
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-[#1E2519] leading-snug">
              {service.title}
            </h3>
            <p className="text-xs text-[#6B7563] mt-1.5">
              {service.isSlotBooking ? (
                <span>
                  {t('মোট ফি:', 'Total Fee:')}{' '}
                  <strong className="text-[#1E2519] font-bold">{currency(selectedSlot.totalFee)}</strong>{' '}
                  {isBn
                    ? `(আইভ্যাক ফি ১,৫০০৳ + স্লট ফি ${currency(selectedSlot.serviceCharge)})`
                    : `(IVAC Fee ৳1,500 + Slot Charge ${currency(selectedSlot.serviceCharge)})`}
                </span>
              ) : service.id === 'ticket-booking' ? (
                <span>
                  {t('সার্ভিস ফি:', 'Service Fee:')}{' '}
                  <strong className="text-[#1E2519] font-bold">{service.price}</strong>{' '}
                  {t(
                    '(মূল টিকেট মূল্যের সাথে অতিরিক্ত ৳৫৯৯ থেকে শুরু, আলোচনা সাপেক্ষে)',
                    '(Starting from ৳599 on top of base ticket fare, negotiable)'
                  )}
                </span>
              ) : isNonVisaAddonService ? (
                <span>
                  {t('সার্ভিস চার্জ:', 'Service Charge:')}{' '}
                  <strong className="text-[#1E2519] font-bold">{service.price}</strong>{' '}
                  <span>({service.per.replace('/ ', '')})</span>
                </span>
              ) : (
                <span>
                  {t('মোট ফি:', 'Total Fee:')}{' '}
                  <strong className="text-[#1E2519] font-bold">{service.price}</strong>{' '}
                  {t('(আইভ্যাক ফি ১,৫০০৳ ও স্লটসহ)', '(Including ৳1,500 IVAC fee & slot)')}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="service-modal-body">
          {/* SPECIAL SECTION FOR VISA SLOT BOOKING */}
          {service.isSlotBooking && (
            <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E0D4] space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#26301F] flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-[#5F7758]" />
                  {t('ভিসার স্লট ক্যাটাগরি নির্বাচন করুন:', 'Select Visa Slot Category:')}
                </span>
                <span className="text-[11px] font-medium text-[#65715D] bg-[#ECE8DC] px-2 py-0.5 rounded">
                  {t('আইভ্যাক নির্ধারিত ফি: ১,৫০০৳', 'Official IVAC Fee: ৳1,500')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {slotTypes.map((slot) => {
                  const isSelected = selectedSlot.id === slot.id;
                  return (
                    <div
                      key={slot.id}
                      id={`slot-card-${slot.id}`}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`slot-category-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-bold text-[#1E2519]">{slot.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#5F7758] flex-shrink-0 mt-0.5" />}
                      </div>
                      <div className="mt-1.5 text-[11px] text-[#65715D] space-y-0.5">
                        <div>{t('আইভ্যাক ফি:', 'IVAC Fee:')} {currency(slot.ivacFee)}</div>
                        <div>{t('স্লট ফি:', 'Slot Charge:')} {currency(slot.serviceCharge)}</div>
                        <div className="pt-1 border-t border-[#E5E0D4] font-bold text-[#1E2519]">
                          {t('মোট ফি:', 'Total Fee:')} {currency(slot.totalFee)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* IVAC Center Selection Dropdown */}
              <div className="pt-2 border-t border-[#E5E0D4] flex flex-col gap-1.5">
                <label htmlFor="modal-ivac-center-select" className="text-xs font-bold text-[#26301F] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#5F7758]" />
                  {t('পছন্দসই আইভ্যাক সেন্টার নির্বাচন করুন:', 'Select Preferred IVAC Center:')}
                </label>
                <select
                  id="modal-ivac-center-select"
                  value={selectedIvacIdx}
                  onChange={(e) => setSelectedIvacIdx(Number(e.target.value))}
                  className="w-full text-xs font-medium py-2 px-3 bg-white border border-[#D5CFBF] rounded-lg text-[#1E2519] focus:outline-none focus:border-[#5F7758]"
                >
                  {ivacCenters.map((center, idx) => (
                    <option key={idx} value={idx}>{center}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Checklist header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#EFEBE2]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#5F7758]" />
              <span className="text-sm font-bold text-[#26301F]">
                {service.isSlotBooking
                  ? t('স্লট বুকিংয়ের জন্য প্রয়োজনীয় তথ্য', 'Required Information for Slot Booking')
                  : t('প্রয়োজনীয় ডকুমেন্টস চেকলিস্ট', 'Required Documents Checklist')}
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#F2F6EF] text-[#4E5C46] border border-[#DEE6D8]">
              {isBn ? `মোট: ${num(totalCount)}টি` : `Total: ${totalCount} items`}
            </span>
          </div>

          <p className="text-xs text-[#6B7563] leading-relaxed">
            {service.isSlotBooking 
              ? t(
                  'স্লট বুকিংয়ের জন্য আপনাকে ওয়েব ফাইল বাধ্যতামূলক দিতে হবে (১ নম্বর ঘরে টিক দিন) এবং সিম কার্ড ঐচ্ছিক (নিজস্ব সিম দিতে চাইলে ২ নম্বর ঘরে টিক দিন)। ওয়েব ফাইল সিলেক্ট করলেই নিচের চেকলিস্ট ও হোয়াটসঅ্যাপ / এজেন্ট বাটন দৃশ্যমান হবে:',
                  'Providing your Web File is mandatory (check item #1) and a SIM card is optional (check item #2 if providing your own SIM). Once Web File is checked, the Checklist PDF and WhatsApp / Agent buttons will appear below:'
                )
              : t(
                  'আপনার সংগ্রহে থাকা ডকুমেন্টসগুলোতে টিক চিহ্ন দিন। কোনো ডকুমেন্ট বাকি থাকলে আমরা ফাইল প্রসেসিংয়ে সহায়তা করব:',
                  'Check off the documents you already have ready. If anything is missing, our team will guide you on how to prepare it:'
                )
            }
          </p>

          {/* Checklist items */}
          <div className="space-y-2.5">
            {service.documents.map((doc, idx) => {
              const isChecked = !!checkedDocs[`${service.id}-${idx}`];
              const isVisaFormService =
                !service.isSlotBooking &&
                ![
                  'ticket-booking',
                  'mofa-notary-translation',
                  'medical-cost-airport-pickup',
                  'hotel-rail-bus-package'
                ].includes(service.id);

              return (
                <React.Fragment key={idx}>
                  <div
                    id={service.isSlotBooking ? `slot-requirement-item-${idx + 1}` : undefined}
                    onClick={() => toggleDoc(idx)}
                    className={`service-checklist-item ${isChecked ? 'checked' : ''}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-[#5F7758]" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#B5BCAD]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {service.isSlotBooking && (
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
                      )}
                      <span className={`text-sm leading-relaxed block ${isChecked ? 'font-semibold text-[#1E2519]' : 'text-[#3A4432]'}`}>
                        <span className="inline-block font-bold text-[#4E5C46] mr-1.5">
                          {isBn ? `${num(idx + 1)})` : `${idx + 1}.`}
                        </span>
                        {doc}
                      </span>
                    </div>
                  </div>

                  {idx === 0 && isVisaFormService && (
                    <div className="ml-2 sm:ml-6 p-2.5 rounded-xl bg-[#EEF1FE] border border-[#C6D0FB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2 text-[#1E2B6B]">
                        <Puzzle className="w-4 h-4 text-[#263375] shrink-0 mt-0.5" />
                        <span>
                          {t(
                            `নিজে অনলাইন ভিসা ফর্ম পূরণ করলে সময় বাঁচাতে ও ভুল এড়াতে আমাদের "${CONFIG.chromeExtension.name}" ক্রোম এক্সটেনশন ব্যবহার করতে পারেন।`,
                            `Filling the online visa form yourself? Use "${CONFIG.chromeExtension.name}" in Chrome to enter fields faster with fewer typos.`
                          )}
                        </span>
                      </div>
                      <a
                        id="modal-extension-helper-link"
                        href={CONFIG.chromeExtension.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 font-bold text-[#263375] bg-white px-2.5 py-1 rounded-full border border-[#BAC5FA] hover:bg-[#F7F8FE] shrink-0 self-start sm:self-auto"
                      >
                        <span>{t('Chrome Web Store', 'Chrome Web Store')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Transit Visa Approved Border Port Box */}
          {service.portNote && (
            <div className="p-3.5 rounded-xl bg-[#EEF6F0] border border-[#C4DFC9] space-y-1">
              <div className="text-xs font-bold text-[#1D5E29] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#1E743B] flex-shrink-0" />
                <span>{t('অনুমোদিত সীমান্ত পোর্ট (IVAC নোটিশ বোর্ড):', 'Approved Border Ports (IVAC Notice Board):')}</span>
              </div>
              <p className="text-xs text-[#26422C] leading-relaxed pl-5.5">
                {service.portNote}
              </p>
            </div>
          )}

          {/* Dedicated IVAC Notice Board Special Notes / Slot Booking Rules Box */}
          {service.specialNotes && service.specialNotes.length > 0 && (
            <div
              id="modal-special-notes-box"
              className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 space-y-1.5"
            >
              <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>
                  {service.isSlotBooking
                    ? isBn
                      ? `আইভ্যাক স্লট বুকিং নিয়মাবলি (${selectedSlot.name} — সকল ক্যাটাগরির জন্য প্রযোজ্য):`
                      : `Official IVAC Slot Booking Rules (${selectedSlot.name} — Applies to All Categories):`
                    : t('বিশেষ দ্রষ্টব্য (IVAC নোটিশ বোর্ড):', 'Special Notes (IVAC Notice Board):')}
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

        {/* Fixed Bottom Progress Bar - Always visible even when scrolling */}
        <div className="service-modal-progress">
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium text-[#26301F]">
            <span className="flex items-center gap-1.5 text-[#3D5237] font-semibold">
              {service.isSlotBooking
                ? isSlotWebFileChecked
                  ? t('স্লট বুকিংয়ের জন্য প্রস্তুত', 'Ready for Slot Booking')
                  : t('ধাপ ১: ওয়েব ফাইল সিলেক্ট করুন', 'Step 1: Select Web File')
                : isBn
                  ? `অগ্রগতি: ${num(progressPercent)}% সম্পন্ন`
                  : `Progress: ${progressPercent}% Completed`}
            </span>
            {service.isSlotBooking ? (
              isSlotWebFileChecked ? (
                <span className="text-[11px] font-bold text-[#20BD5A] bg-[#E8F8EE] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#BCE8CB]">
                  <Sparkles className="w-3 h-3" />
                  {isSlotSimChecked
                    ? t('ওয়েব ফাইল ও নিজস্ব সিম প্রস্তুত!', 'Web File & Own SIM Ready!')
                    : t('ওয়েব ফাইল প্রস্তুত (সিম অফিস থেকে — অতিরিক্ত চার্জ)', 'Web File Ready (SIM via Hub — Extra Charge)')}
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {t('ওয়েব ফাইল নির্বাচন আবশ্যক', 'Web File Selection Required')}
                </span>
              )
            ) : completedCount === totalCount ? (
              <span className="text-[11px] font-bold text-[#20BD5A] bg-[#E8F8EE] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#BCE8CB]">
                <Sparkles className="w-3 h-3" /> {t('সকল তথ্য প্রস্তুত!', 'All Items Ready!')}
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-[#5F7758] bg-[#F2F6EF] px-2 py-0.5 rounded-md border border-[#DEE6D8]">
                {isBn
                  ? `${num(completedCount)} / ${num(totalCount)} প্রস্তুত`
                  : `${completedCount} / ${totalCount} Ready`}
              </span>
            )}
          </div>
          <div className="checklist-progress-track">
            <div 
              className="checklist-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="service-modal-footer">
          <div className="text-xs font-semibold text-[#4E5C46] bg-[#F2F6EF] px-2.5 py-1.5 rounded-md border border-[#DEE6D8] hidden md:inline-flex items-center flex-shrink-0">
            {service.isSlotBooking ? (
              <span>{t('মোট ফি:', 'Total Fee:')} <strong className="text-[#1E2519]">{currency(selectedSlot.totalFee)}</strong></span>
            ) : isNonVisaAddonService ? (
              <span>{t('সার্ভিস চার্জ:', 'Service Charge:')} <strong className="text-[#1E2519]">{service.price}</strong></span>
            ) : (
              <span>{t('মোট ফি (স্লটসহ):', 'Total (With Slot):')} <strong className="text-[#1E2519]">{service.price}</strong></span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5 w-full md:w-auto justify-between sm:justify-end flex-nowrap ml-auto">
            {/* 1. Red 3D Glassmorphism Close Button */}
            <button
              type="button"
              id="modal-bottom-close-btn"
              onClick={onClose}
              title={t('উইন্ডো বন্ধ করুন', 'Close window')}
              className="btn-3d-red-glass flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-full whitespace-nowrap cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('বন্ধ', 'Close')}</span>
            </button>

            {/* 2. Download Checklist & 3. WhatsApp/Agent Submit Buttons — gated on Web File check for Slot Booking */}
            {canShowActionButtons ? (
              <>
                <button
                  type="button"
                  id="modal-download-checklist-btn"
                  onClick={handleDownloadChecklist}
                  disabled={isDownloadingPdf}
                  title={t(
                    'আপনার সিলেক্টেড ডকুমেন্টস সহ চেকলিস্ট ডাউনলোড করুন',
                    'Download PDF checklist with your selected items'
                  )}
                  className="btn-3d-matte-secondary flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap text-center"
                >
                  {isDownloadingPdf ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[var(--periwinkle-dark)] border-t-transparent rounded-full animate-spin"></span>
                      <span className="text-[11px] sm:text-xs">{t('তৈরি হচ্ছে...', 'Generating...')}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-[var(--periwinkle-dark)] flex-shrink-0" />
                      <span>{t('চেকলিস্ট', 'Checklist PDF')}</span>
                    </>
                  )}
                </button>

                <a
                  id="modal-whatsapp-submit-btn"
                  href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(
                    service.isSlotBooking
                      ? `Hello Processing Hub, I want to book Indian Visa Slot (Only Slot) for ${selectedSlot.name}. Selected IVAC Center: ${selectedIvacCenter}. IVAC Fee: ৳${selectedSlot.ivacFee} + Slot Charge: ৳${selectedSlot.serviceCharge} (Total: ৳${selectedSlot.totalFee}). Web File: Ready. SIM Card: ${isSlotSimChecked ? 'I will provide my own SIM card' : 'Please arrange a SIM card (extra charge applicable)'}. Please confirm slot availability.`
                      : service.id === 'ticket-booking'
                        ? `Hello Processing Hub, I want to book ${service.title} (Service Charge starts from ৳599 on top of base ticket fare, negotiable). I have checked my required documents (${completedCount}/${totalCount} ready). Please guide me for booking.`
                        : isNonVisaAddonService
                          ? `Hello Processing Hub, I want to book ${service.title} (${service.price}). I have checked my required documents (${completedCount}/${totalCount} ready). Please guide me.`
                          : `Hello Processing Hub, I want to book ${service.title} with slot (Total: ${service.price}, including ৳1,500 IVAC fee). I have checked my required documents (${completedCount}/${totalCount} ready). Please guide me for file submission.`
                  )}`}
                  data-service-name={
                    service.isSlotBooking
                      ? isBn
                        ? `ভিসা স্লট বুকিং (${selectedSlot.name}) - ${selectedIvacCenter} | ${isSlotSimChecked ? 'ওয়েব ফাইল + নিজস্ব সিম' : 'ওয়েব ফাইল (সিম অফিস থেকে — অতিরিক্ত চার্জ)'}`
                        : `Visa Slot Booking (${selectedSlot.name}) - ${selectedIvacCenter} | ${isSlotSimChecked ? 'Web File + Own SIM' : 'Web File (SIM via Hub — Extra Charge)'}`
                      : isBn
                        ? `${service.title} প্রসেসিং`
                        : `${service.title} Processing`
                  }
                  data-section={t('চেকলিস্ট ও বুকিং উইন্ডো', 'Checklist & Booking Modal')}
                  data-whatsapp-title={service.isSlotBooking ? t('ভিসা স্লট বুকিং', 'Visa Slot Booking') : service.title}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-3d-matte-green flex-[1.2] sm:flex-initial inline-flex items-center justify-center px-3.5 sm:px-4.5 py-2 text-xs sm:text-sm font-bold rounded-full whitespace-nowrap text-center"
                >
                  <span>{t('হোয়াটসঅ্যাপ / এজেন্ট', 'WhatsApp / Agent')}</span>
                </a>
              </>
            ) : (
              <div
                id="slot-webfile-required-hint"
                className="flex-1 sm:flex-initial text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-2 rounded-full text-center"
              >
                {t('এগিয়ে যেতে ১ নং "ওয়েব ফাইল" চেক মার্ক করুন', 'Check #1 "Web File" above to proceed')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
