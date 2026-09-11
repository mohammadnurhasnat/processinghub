import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  FileText, 
  CalendarClock, 
  MapPin, 
  Sparkles, 
  Download 
} from 'lucide-react';
import { VisaService, SlotType } from '../types';
import { SLOT_TYPES } from '../data/visaData';
import { CONFIG, IVAC_CENTERS } from '../config';
import { generateChecklistPdf } from '../utils/generateChecklistPdf';

interface ServiceChecklistModalProps {
  service: VisaService | null;
  onClose: () => void;
}

export const ServiceChecklistModal: React.FC<ServiceChecklistModalProps> = ({
  service,
  onClose
}) => {
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [selectedSlot, setSelectedSlot] = useState<SlotType>(SLOT_TYPES[0]);
  const [selectedIvacCenter, setSelectedIvacCenter] = useState<string>(IVAC_CENTERS[0]);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!service) return null;

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

  const handleDownloadChecklist = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      await generateChecklistPdf({
        serviceTitle: service.title,
        category: service.category,
        price: service.isSlotBooking 
          ? `৳${selectedSlot.totalFee.toLocaleString('bn-BD')}` 
          : service.price,
        isSlotBooking: service.isSlotBooking,
        slotName: service.isSlotBooking ? selectedSlot.name : undefined,
        ivacCenter: service.isSlotBooking ? selectedIvacCenter : undefined,
        documents: service.documents.map((doc, idx) => ({
          title: doc,
          isCompleted: !!checkedDocs[`${service.id}-${idx}`]
        })),
        phoneDisplay: CONFIG.phoneDisplay,
        email: CONFIG.email,
        brandName: CONFIG.brandName
      });
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const completedCount = getCompletedCount();
  const totalCount = service.documents.length;
  const progressPercent = Math.round((completedCount / (totalCount || 1)) * 100);

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
        style={{ boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)' }}
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
                  মোট ফি: <strong className="text-[#1E2519] font-bold">৳{selectedSlot.totalFee.toLocaleString('bn-BD')}</strong> (আইভ্যাক ফি ১৫০০৳ + সার্ভিস ফি {selectedSlot.serviceCharge.toLocaleString('bn-BD')}৳)
                </span>
              ) : (
                <span>
                  সার্ভিস ফি: <strong className="text-[#1E2519] font-bold">{service.price}</strong> (আইভ্যাক ফি ব্যতীত)
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            id="modal-close-btn"
            onClick={onClose}
            className="p-2 text-[#727C6B] hover:text-[#1E2519] hover:bg-[#ECE8DC] rounded-lg transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="service-modal-body">
          {/* SPECIAL SECTION FOR VISA SLOT BOOKING */}
          {service.isSlotBooking && (
            <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E0D4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#26301F] flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-[#5F7758]" />
                  ভিসার স্লট ক্যাটাগরি নির্বাচন করুন:
                </span>
                <span className="text-[11px] font-medium text-[#65715D] bg-[#ECE8DC] px-2 py-0.5 rounded">
                  IVAC নির্ধারিত ফি: ১৫০০৳
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SLOT_TYPES.map((slot) => {
                  const isSelected = selectedSlot.id === slot.id;
                  return (
                    <div
                      key={slot.id}
                      id={`slot-card-${slot.id}`}
                      onClick={() => setSelectedSlot(slot)}
                      className={`slot-category-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-bold text-[#1E2519]">{slot.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#5F7758] flex-shrink-0 mt-0.5" />}
                      </div>
                      <div className="mt-1.5 text-[11px] text-[#65715D] space-y-0.5">
                        <div>আইভ্যাক ফি: ৳{slot.ivacFee.toLocaleString('bn-BD')}</div>
                        <div>সার্ভিস ফি: ৳{slot.serviceCharge.toLocaleString('bn-BD')}</div>
                        <div className="pt-1 border-t border-[#E5E0D4] font-bold text-[#1E2519]">
                          মোট ফি: ৳{slot.totalFee.toLocaleString('bn-BD')}
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
                  পছন্দসই আইভ্যাক সেন্টার নির্বাচন করুন:
                </label>
                <select
                  id="modal-ivac-center-select"
                  value={selectedIvacCenter}
                  onChange={(e) => setSelectedIvacCenter(e.target.value)}
                  className="w-full text-xs font-medium py-2 px-3 bg-white border border-[#D5CFBF] rounded-lg text-[#1E2519] focus:outline-none focus:border-[#5F7758]"
                >
                  {IVAC_CENTERS.map((center) => (
                    <option key={center} value={center}>{center}</option>
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
                {service.isSlotBooking ? 'স্লট বুকিংয়ের জন্য প্রয়োজনীয় তথ্য' : 'প্রয়োজনীয় ডকুমেন্টস চেকলিস্ট'}
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#F2F6EF] text-[#4E5C46] border border-[#DEE6D8]">
              মোট: {service.documents.length}টি
            </span>
          </div>

          <p className="text-xs text-[#6B7563] leading-relaxed">
            {service.isSlotBooking 
              ? 'আপনার প্রস্তুত থাকা তথ্যে টিক দিন এবং নিচে WhatsApp-এ ক্লিক করে দ্রুত স্লট কনফার্ম করুন:'
              : 'আপনার সংগ্রহে থাকা ডকুমেন্টসগুলোতে টিক চিহ্ন দিন। কোনো ডকুমেন্ট বাকি থাকলে আমরা ফাইল প্রসেসিংয়ে সহায়তা করব:'
            }
          </p>

          {/* Checklist items */}
          <div className="space-y-2.5">
            {service.documents.map((doc, idx) => {
              const isChecked = !!checkedDocs[`${service.id}-${idx}`];
              return (
                <div
                  key={idx}
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
                  <span className={`text-sm leading-relaxed flex-1 ${isChecked ? 'font-semibold text-[#1E2519]' : 'text-[#3A4432]'}`}>
                    {doc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed Bottom Progress Bar - Always visible even when scrolling */}
        <div className="service-modal-progress">
          <div className="flex items-center justify-between text-xs font-medium text-[#26301F]">
            <span className="flex items-center gap-1.5 text-[#3D5237] font-semibold">
              অগ্রগতি: {progressPercent}% সম্পন্ন
            </span>
            {completedCount === totalCount ? (
              <span className="text-[11px] font-bold text-[#20BD5A] bg-[#E8F8EE] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#BCE8CB]">
                <Sparkles className="w-3 h-3" /> সকল তথ্য প্রস্তুত!
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-[#5F7758] bg-[#F2F6EF] px-2 py-0.5 rounded-md border border-[#DEE6D8]">
                {completedCount} / {totalCount} প্রস্তুত
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
              <span>মোট ফি: <strong className="text-[#1E2519]">৳{selectedSlot.totalFee.toLocaleString('bn-BD')}</strong></span>
            ) : (
              <span>সার্ভিস চার্জ: <strong className="text-[#1E2519]">{service.price}</strong></span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5 w-full md:w-auto justify-between sm:justify-end flex-nowrap ml-auto">
            <button
              type="button"
              id="modal-download-checklist-btn"
              onClick={handleDownloadChecklist}
              disabled={isDownloadingPdf}
              title="আপনার সিলেক্টেড ডকুমেন্টস সহ চেকলিস্ট ডাউনলোড করুন"
              className="btn-3d-matte-secondary flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap text-center"
            >
              {isDownloadingPdf ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#3D5237] border-t-transparent rounded-full animate-spin"></span>
                  <span className="text-[11px] sm:text-xs">তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#546E4E] flex-shrink-0" />
                  <span>চেকলিস্ট</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-3d-matte-red flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap text-center"
            >
              বন্ধ করুন
            </button>
            <a
              id="modal-whatsapp-submit-btn"
              href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(
                service.isSlotBooking
                  ? `Hello Processing Hub, I want to book Indian Visa Slot for ${selectedSlot.name}. Selected IVAC Center: ${selectedIvacCenter}. IVAC Fee: ৳${selectedSlot.ivacFee} + Service Charge: ৳${selectedSlot.serviceCharge} (Total: ৳${selectedSlot.totalFee}). Ready Info: (${completedCount}/${totalCount}). Please confirm slot availability.`
                  : `Hello Processing Hub, I want to book ${service.title} (Service Charge: ${service.price}). I have checked my required documents (${completedCount}/${totalCount} ready). Please guide me for file submission.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-matte-green flex-[1.2] sm:flex-initial inline-flex items-center justify-center px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap text-center"
            >
              <span>WhatsApp-এ পাঠান</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
