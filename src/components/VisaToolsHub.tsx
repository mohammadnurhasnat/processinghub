import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calculator,
  Camera,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  MessageCircle,
  ZoomIn,
  RotateCcw,
} from 'lucide-react';
import { CONFIG, getIvacCenters } from '../config';
import { useLanguage } from '../context/LanguageContext';
import { ExtensionSpotlightCard } from './ExtensionSpotlightBanner';

export type VisaToolTab = 'calculator' | 'photo' | 'quiz';

interface VisaToolsHubProps {
  activeTab: VisaToolTab;
  onTabChange: (tab: VisaToolTab) => void;
}

interface CalcCategoryOption {
  id: string;
  bn: string;
  en: string;
  packageTotal: number;
  slotOnlyTotal: number;
}

const CALC_CATEGORIES: CalcCategoryOption[] = [
  { id: 'tourist', bn: 'ট্যুরিস্ট ভিসা (Tourist)', en: 'Tourist Visa', packageTotal: 6000, slotOnlyTotal: 5500 },
  { id: 'medical', bn: 'মেডিকেল ও অ্যাটেনডেন্ট (M-1/M-2)', en: 'Medical & Attendant (M-1/M-2)', packageTotal: 6000, slotOnlyTotal: 4500 },
  { id: 'double-entry', bn: 'ডাবল এন্ট্রি (X-3 Misc)', en: 'Double Entry (X-3 Misc)', packageTotal: 6500, slotOnlyTotal: 4500 },
  { id: 'business', bn: 'বিজনেস ভিসা (B-1/B-2)', en: 'Business Visa (B-1/B-2)', packageTotal: 6000, slotOnlyTotal: 4500 },
  { id: 'student', bn: 'স্টুডেন্ট ভিসা (S-1)', en: 'Student Visa (S-1)', packageTotal: 5500, slotOnlyTotal: 4500 },
  { id: 'transit', bn: 'ট্রানজিট ভিসা (TR)', en: 'Transit Visa (TR)', packageTotal: 5500, slotOnlyTotal: 4500 },
  { id: 'entry', bn: 'এন্ট্রি ভিসা (X-Misc)', en: 'Entry Visa (X-Misc)', packageTotal: 6000, slotOnlyTotal: 4500 },
  { id: 'spouse', bn: 'স্পাউস ও ফ্যামিলি (X-1)', en: 'Spouse & Family (X-1)', packageTotal: 6000, slotOnlyTotal: 4500 },
];

const REJECTION_QUIZ_ITEMS = [
  {
    id: 'form-accuracy',
    points: 15,
    bn: 'আবেদনকারীর ফর্মে কোনো ভুল তথ্য ছাড়া সবকিছু পাসপোর্ট অনুযায়ী নির্ভুলভাবে পূরণ করা হয়েছে?',
    en: 'Is the online application form completely accurate with no incorrect information?',
    fixBn: '১) আবেদন করার ফর্মে যদি কোনো ভুল তথ্য পূরণ করা হয়, সেক্ষেত্রে ভিসা না পাওয়ার সম্ভাবনা বেড়ে যায়। এক্ষেত্রে স্লট নেওয়ার আগে পুনরায় আবেদনটি সঠিকভাবে পূরণ করতে হবে।',
    fixEn: '1) If any wrong information is filled in the application form, the chances of not getting a visa increase. In that case, you need to fill out the application correctly again before taking a slot..',
  },
  {
    id: 'genuine-docs',
    points: 20,
    bn: 'আবেদনে সংযুক্ত সকল ডকুমেন্ট শতভাগ আসল ও বৈধ (কোনো জাল বা নকল কাগজ নেই)?',
    en: 'Are all attached documents 100% genuine and authentic (no fake/forged documents)?',
    fixBn: '২) কোন ডকুমেন্ট জাল/নকল সংযুক্ত করলে সরাসরি ভিসা প্রত্যাখ্যান হয়—সর্বদা আসল কাগজ ব্যবহার করুন।',
    fixEn: '2) Attaching any fake or forged document leads to immediate rejection—always submit genuine records.',
  },
  {
    id: 'identity-match',
    points: 15,
    bn: 'পাসপোর্ট এবং ভোটার আইডি (NID) বা জন্ম নিবন্ধনের তথ্যে কোনো গড়মিল নেই?',
    en: 'Do your Passport and Voter ID (NID) or Birth Registration details match with zero discrepancy?',
    fixBn: '৩) বর্তমান পাসপোর্টের সাথে জন্ম নিবন্ধন, এনআইডি কার্ড অথবা পূর্ববর্তী পাসপোর্টের কোনো তথ্যগত অমিল থাকে, সেটা অতি দ্রুত সংশোধন করে নিতে হবে। যদি সংশোধন এর জন্য যথেষ্ট পরিমাণ সময় না থাকে, তথ্যের অমিল সংক্রান্ত একটি এফিডেভিট জমা দিতে হবে।',
    fixEn: '3) If there’s any mismatch between your current passport and your birth certificate, NID card, or previous passport, it needs to be corrected as soon as possible. If there isn’t enough time to make the correction, you’ll have to submit an affidavit regarding the information mismatch.',
  },
  {
    id: 'overstay',
    points: 20,
    bn: 'পূর্বের ভ্রমণ ভিসা নিয়ে ভারতে গিয়ে কখনো মেয়াদোত্তীর্ণ অবস্থান (Over Stay) করেননি?',
    en: 'Have you never overstayed during any previous trip to India on a travel visa?',
    fixBn: '৪) ভ্রমণ ভিসা নিয়ে গিয়ে Over Stay করলে পরবর্তী ভিসা প্রত্যাখ্যাত হতে পারে—পূর্বের জটিলতা থাকলে পরামর্শ নিন।',
    fixEn: '4) Previous Over Stay on a travel visa is a major rejection cause—seek guidance if you had an overstay.',
  },
  {
    id: 'utility-bill',
    points: 10,
    bn: 'আবেদন পত্র এবং বিদ্যুৎ / ইউটিলিটি বিলের বর্তমান ঠিকানা হুবহু মিলে যায়?',
    en: 'Does the present address on your application form match your electricity / utility bill exactly?',
    fixBn: '৫) আবেদন পত্র এবং বিদ্যুৎ বিলের ঠিকানা গড়মিল থাকলে ভিসা আটকে যায়—বিলের হুবহু ঠিকানা ফর্মে লিখুন।',
    fixEn: '5) Any address mismatch between the application form and electricity bill risks rejection—match them verbatim.',
  },
  {
    id: 'photo',
    points: 15,
    bn: 'সদ্য তোলা নতুন 2"×2" সাদা ব্যাকগ্রাউন্ড ল্যাব প্রিন্ট ছবি (কোনো পুরানো ছবি নয়) ব্যবহার করছেন?',
    en: 'Are you submitting a recent 2"×2" white-background photo (not an old or non-standard photo)?',
    fixBn: '৬) পুরানো ছবি দিয়ে অথবা 2"×2" ছবি ছাড়া আবেদন করলে ফাইল রিজেক্ট হয়—নতুন সাদা ব্যাকগ্রাউন্ড ছবি তুলুন।',
    fixEn: '6) Using an outdated photo or missing a standard 2"×2" photo causes rejection—provide a fresh lab print.',
  },
  {
    id: 'noc-endorsement',
    points: 15,
    bn: 'অফিসিয়াল NOC এবং ডলার এনডোর্সমেন্ট / ব্যাংক স্টেটমেন্ট শতভাগ বৈধ ও আসল?',
    en: 'Are your NOC and Dollar Endorsement / Bank Statement completely genuine and verifiable?',
    fixBn: '৭) NOC এবং ডলার এনডোর্সমেন্ট নকল দিলে ভিসা সরাসরি প্রত্যাখ্যাত হয়—কেবল অনুমোদিত কাগজ জমা দিন।',
    fixEn: '7) Submitting fake NOC or fake dollar endorsement results in refusal—always use official documents.',
  },
  {
    id: 'occupation-col',
    points: 10,
    bn: 'আবেদন ফর্মের পেশাগত কলামে (কলম-এ) আপনার বর্তমান পেশার সঠিক তথ্য দেওয়া হয়েছে?',
    en: 'Is your occupational information entered accurately in the occupation column of the form?',
    fixBn: '৮) পেশাগত তথ্য ভুল দিলে (কলম-এ) ভিসা প্রত্যাখ্যান হতে পারে—পেশার প্রমাণপত্রের সাথে ফর্মের তথ্য মিলিয়ে নিন।',
    fixEn: '8) Incorrect occupation details in the form column can cause refusal—align it with your profession proof.',
  },
  {
    id: 'old-passports',
    points: 20,
    bn: 'বর্তমান মূল পাসপোর্টের পাশাপাশি পূর্বের সকল পুরানো পাসপোর্ট সংযুক্ত করেছেন?',
    en: 'Have you attached all your previous / old passports along with your current passport?',
    fixBn: '৯) পুরানো সকল পাসপোর্ট সংযুক্ত না করলে আবেদন প্রত্যাখ্যাত হতে পারে—হারানো থাকলে জিডি কপি সংযুক্ত করুন।',
    fixEn: '9) Failing to attach all old passports is a listed IVAC rejection cause—attach all old passports or GD copy.',
  },
];

export const VisaToolsHub: React.FC<VisaToolsHubProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { language, t, num, currency } = useLanguage();
  const isBn = language === 'bn';
  const ivacCenters = getIvacCenters(language);

  // ---------------- TAB 1: FEE CALCULATOR ----------------
  const [calcCatId, setCalcCatId] = useState<string>('tourist');
  const [calcMode, setCalcMode] = useState<'package' | 'slotOnly'>('package');
  const [applicantCount, setApplicantCount] = useState<number>(1);
  const [selectedIvacCenterIdx, setSelectedIvacCenterIdx] = useState<number>(0);
  const [addEndorsement, setAddEndorsement] = useState<boolean>(false);
  const [addMofaService, setAddMofaService] = useState<boolean>(false);

  const selectedCat = useMemo(
    () => CALC_CATEGORIES.find((c) => c.id === calcCatId) || CALC_CATEGORIES[0],
    [calcCatId]
  );

  const calcBreakdown = useMemo(() => {
    const ivacGovtPerPerson = 1500;
    const perPersonVisaRate = calcMode === 'package' ? selectedCat.packageTotal : selectedCat.slotOnlyTotal;
    const serviceAndSlotPerPerson = Math.max(0, perPersonVisaRate - ivacGovtPerPerson);
    const portAddonPerPerson = addEndorsement ? 300 : 0;
    const mofaAddonFlat = addMofaService ? 1200 : 0;

    const totalIvacGovt = ivacGovtPerPerson * applicantCount;
    const totalServiceAndSlot = serviceAndSlotPerPerson * applicantCount;
    const totalAddons = portAddonPerPerson * applicantCount + mofaAddonFlat;
    const grandTotal = totalIvacGovt + totalServiceAndSlot + totalAddons;

    return {
      ivacGovtPerPerson,
      serviceAndSlotPerPerson,
      totalIvacGovt,
      totalServiceAndSlot,
      totalAddons,
      grandTotal,
    };
  }, [calcMode, selectedCat, applicantCount, addEndorsement, addMofaService]);

  // ---------------- TAB 2: 2x2 PHOTO CROPPER & PASSPORT PRE-CHECKER ----------------
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [photoImgObj, setPhotoImgObj] = useState<HTMLImageElement | null>(null);
  const [photoZoom, setPhotoZoom] = useState<number>(1.0);
  const [photoOffsetX, setPhotoOffsetX] = useState<number>(0);
  const [photoOffsetY, setPhotoOffsetY] = useState<number>(0);
  const [photoWhiteBgScore, setPhotoWhiteBgScore] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStateRef = useRef<{ active: boolean; startX: number; startY: number; origX: number; origY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const [passportExpiryDate, setPassportExpiryDate] = useState<string>('');
  const [intendedTravelDate, setIntendedTravelDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [hasTwoBlankPages, setHasTwoBlankPages] = useState<boolean>(true);
  const [hasOldPassports, setHasOldPassports] = useState<boolean>(true);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        setPhotoImgObj(img);
        setPhotoSrc(dataUrl);
        setPhotoZoom(1.0);
        setPhotoOffsetX(0);
        setPhotoOffsetY(0);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !photoImgObj) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 600;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    const baseScale = Math.max(size / photoImgObj.width, size / photoImgObj.height);
    const drawW = photoImgObj.width * baseScale * photoZoom;
    const drawH = photoImgObj.height * baseScale * photoZoom;
    const drawX = (size - drawW) / 2 + photoOffsetX * 2;
    const drawY = (size - drawH) / 2 + photoOffsetY * 2;

    ctx.drawImage(photoImgObj, drawX, drawY, drawW, drawH);

    // Measure corner/top-border white-background luminance compliance
    try {
      const samplePoints = [
        [20, 20],
        [size - 20, 20],
        [20, 120],
        [size - 20, 120],
        [size / 2, 16],
      ];
      let brightCount = 0;
      for (const [sx, sy] of samplePoints) {
        const px = ctx.getImageData(sx, sy, 1, 1).data;
        const luma = 0.2126 * px[0] + 0.7152 * px[1] + 0.0722 * px[2];
        if (luma >= 215) brightCount++;
      }
      setPhotoWhiteBgScore(Math.round((brightCount / samplePoints.length) * 100));
    } catch {
      setPhotoWhiteBgScore(null);
    }
  }, [photoImgObj, photoZoom, photoOffsetX, photoOffsetY]);

  const handleDownloadCroppedPhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.94);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ivac-photo-2x2-600x600.jpg';
    a.click();
  };

  const passportValidityResult = useMemo(() => {
    if (!passportExpiryDate) return null;
    const exp = new Date(passportExpiryDate);
    const refDate = intendedTravelDate ? new Date(intendedTravelDate) : new Date();
    if (Number.isNaN(exp.getTime()) || Number.isNaN(refDate.getTime())) return null;

    const minReq = new Date(refDate);
    minReq.setMonth(minReq.getMonth() + 6);
    const diffDays = Math.floor((exp.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
    const hasSixMonths = exp >= minReq;
    return {
      diffDays,
      hasSixMonths,
      fullyEligible: hasSixMonths && hasTwoBlankPages && hasOldPassports,
    };
  }, [passportExpiryDate, intendedTravelDate, hasTwoBlankPages, hasOldPassports]);

  // ---------------- TAB 4: 9-POINT VISA REJECTION RISK QUIZ ----------------
  const [quizAnswers, setQuizAnswers] = useState<Record<string, 'yes' | 'no'>>({});

  const quizEvaluation = useMemo(() => {
    const totalAnswered = Object.keys(quizAnswers).length;
    const failedItems = REJECTION_QUIZ_ITEMS.filter((item) => quizAnswers[item.id] === 'no');
    const riskScore = failedItems.reduce((sum, item) => sum + item.points, 0);
    const level: 'low' | 'medium' | 'high' =
      riskScore === 0 ? 'low' : riskScore <= 25 ? 'medium' : 'high';
    return { totalAnswered, failedItems, riskScore, level };
  }, [quizAnswers]);

  const tabs: { id: VisaToolTab; icon: React.ComponentType<{ className?: string }>; bn: string; en: string }[] = [
    { id: 'calculator', icon: Calculator, bn: 'ভিসা ফি ক্যালকুলেটর', en: 'Fee Calculator' },
    { id: 'photo', icon: Camera, bn: '২×২ ছবি ও পাসপোর্ট চেকার', en: '2×2 Photo & Passport' },
    { id: 'quiz', icon: ShieldAlert, bn: 'রিজেকশন ঝুঁকি যাচাই', en: 'Rejection Risk Check' },
  ];

  const calcWhatsAppText = `Hello Processing Hub, I used your Visa Fee Calculator:\n- Category: ${selectedCat.en}\n- Service Type: ${calcMode === 'package' ? 'Full File Processing + Slot' : 'Slot Booking Only'}\n- Applicants: ${applicantCount}\n- IVAC Center: ${ivacCenters[selectedIvacCenterIdx]}\n- Estimated Total: ৳${calcBreakdown.grandTotal.toLocaleString('en-US')}\nPlease assist me with booking.`;

  return (
    <section
      id="tools"
      className="relative py-8 sm:py-12 px-4"
    >
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-6">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#EEF1FE] text-[#263375] border border-[#BAC5FA] mb-2">
            {t('স্মার্ট ভিসা টুলস হাব', 'Smart Visa Tools Hub')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#161D28] tracking-tight">
            {t('আবেদনের আগে নিজের ফাইল নিজেই যাচাই করুন', 'Verify Fees & Pre-Check Your Application')}
          </h2>
          <p className="text-xs sm:text-sm text-[#4C5565] mt-2 leading-relaxed">
            {t(
              'ভিসা খরচ হিসাব করুন, ব্রাউজারেই ২×২ ইঞ্চি ছবি ক্রপ ও পাসপোর্টের মেয়াদ যাচাই করুন এবং ভিসা রিজেকশনের ৯টি কারণ মিলিয়ে নিন।',
              'Calculate exact multi-applicant fees, crop 2×2 inch lab-standard photos locally, and audit your 9 rejection risks.'
            )}
          </p>
        </div>

        {/* Main Tools Container Card */}
        <div className="rounded-3xl bg-white/95 border border-[#D8DEFA] shadow-sm overflow-hidden">
          {/* Tab Header Strip */}
          <div
            role="tablist"
            aria-label={t('ভিসা টুলস মেনু', 'Visa Tools Tabs')}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-[#F6F8FF] border-b border-[#E1E6FC]"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tool-tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#263375] text-white border-[#263375] shadow-xs'
                      : 'bg-white text-[#344054] border-[#DCE2FA] hover:bg-[#EEF1FE] hover:text-[#263375]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{isBn ? tab.bn : tab.en}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-6">
            {/* ============================================================== */}
            {/* TAB 1: MULTI-APPLICANT FEE CALCULATOR                          */}
            {/* ============================================================== */}
            {activeTab === 'calculator' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label htmlFor="calc-category" className="block text-xs font-bold text-[#1E2519] mb-1.5">
                      {t('১. ভিসা ক্যাটাগরি নির্বাচন করুন', '1. Select Visa Category')}
                    </label>
                    <select
                      id="calc-category"
                      value={calcCatId}
                      onChange={(e) => setCalcCatId(e.target.value)}
                      className="w-full text-xs sm:text-sm font-medium py-2.5 px-3 bg-[#FAF9F5] border border-[#D5CFBF] rounded-xl text-[#1E2519] focus:outline-none focus:border-[#263375]"
                    >
                      {CALC_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {isBn ? c.bn : c.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-[#1E2519] mb-1.5">
                      {t('২. সেবার ধরন নির্বাচন করুন', '2. Select Service Type')}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setCalcMode('package')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          calcMode === 'package'
                            ? 'bg-[#EEF1FE] border-[#263375] text-[#161D28]'
                            : 'bg-[#FAF9F5] border-[#DCD6C4] text-[#4C5565]'
                        }`}
                      >
                        <div className="text-xs font-bold">
                          {t('সম্পূর্ণ ফাইল প্রসেসিং + স্লট', 'Full File Processing + Slot')}
                        </div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          {t('আবেদন ফর্ম, চেকলিস্ট, আইভ্যাক ফি ও স্লটসহ', 'Includes form filing, audit, IVAC fee & slot')}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCalcMode('slotOnly')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          calcMode === 'slotOnly'
                            ? 'bg-[#EEF1FE] border-[#263375] text-[#161D28]'
                            : 'bg-[#FAF9F5] border-[#DCD6C4] text-[#4C5565]'
                        }`}
                      >
                        <div className="text-xs font-bold">
                          {t('শুধুমাত্র স্লট বুকিং', 'Slot Booking Only')}
                        </div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          {t('সরকারি ১,৫০০৳ আইভ্যাক ফি + স্লট চার্জসহ', 'Includes official ৳1,500 IVAC fee + slot')}
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="calc-applicants" className="block text-xs font-bold text-[#1E2519] mb-1.5">
                        {t('৩. আবেদনকারীর সংখ্যা', '3. Number of Applicants')}
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setApplicantCount((prev) => Math.max(1, prev - 1))}
                          className="w-9 h-9 rounded-lg border border-[#D5CFBF] bg-[#FAF9F5] font-bold text-sm cursor-pointer"
                          aria-label={t('সংখ্যা কমান', 'Decrease applicants')}
                        >
                          -
                        </button>
                        <input
                          id="calc-applicants"
                          type="number"
                          min={1}
                          max={10}
                          value={applicantCount}
                          onChange={(e) => setApplicantCount(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                          className="w-16 text-center py-2 rounded-lg border border-[#D5CFBF] bg-white font-bold text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setApplicantCount((prev) => Math.min(10, prev + 1))}
                          className="w-9 h-9 rounded-lg border border-[#D5CFBF] bg-[#FAF9F5] font-bold text-sm cursor-pointer"
                          aria-label={t('সংখ্যা বাড়ান', 'Increase applicants')}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="calc-ivac-center" className="block text-xs font-bold text-[#1E2519] mb-1.5">
                        {t('৪. আইভ্যাক সেন্টার', '4. IVAC Center')}
                      </label>
                      <select
                        id="calc-ivac-center"
                        value={selectedIvacCenterIdx}
                        onChange={(e) => setSelectedIvacCenterIdx(Number(e.target.value))}
                        className="w-full text-xs sm:text-sm font-medium py-2.5 px-3 bg-[#FAF9F5] border border-[#D5CFBF] rounded-xl text-[#1E2519]"
                      >
                        {ivacCenters.map((center, idx) => (
                          <option key={idx} value={idx}>
                            {center}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-1 space-y-2">
                    <span className="block text-xs font-bold text-[#1E2519]">
                      {t('৫. ঐচ্ছিক অতিরিক্ত সেবা', '5. Optional Add-on Services')}
                    </span>
                    <label className="flex items-center gap-2.5 text-xs text-[#344054] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addEndorsement}
                        onChange={(e) => setAddEndorsement(e.target.checked)}
                        className="rounded border-[#D5CFBF]"
                      />
                      <span>
                        {t(
                          'অতিরিক্ত পোর্ট এন্ডোর্সমেন্ট / VAFC ফর্ম সংশোধন (+৳৩০০ / জন)',
                          'Extra Port Endorsement / VAFC Form Correction (+৳300 / applicant)'
                        )}
                      </span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs text-[#344054] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addMofaService}
                        onChange={(e) => setAddMofaService(e.target.checked)}
                        className="rounded border-[#D5CFBF]"
                      />
                      <span>
                        {t(
                          'নোটারি ও ডকুমেন্ট অনুবাদ প্যাকেজ (+৳১,২০০ থেকে শুরু)',
                          'Notary & Document Translation Package (+৳1,200 starting)'
                        )}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Live Cost Summary Card */}
                <div className="lg:col-span-5 rounded-2xl bg-[#F7F9F5] border border-[#CDE0C8] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#DCE7D7] pb-2.5">
                    <h3 className="text-sm font-bold text-[#1E2519]">
                      {t('স্বচ্ছ খরচের বিবরণী', 'Transparent Cost Breakdown')}
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E6F4E8] text-[#1D5E29]">
                      {isBn ? `${num(applicantCount)} জন আবেদনকারী` : `${applicantCount} Applicant(s)`}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-[#3D4737]">
                    <div className="flex justify-between">
                      <span>{t('সরকারি আইভ্যাক (IVAC) ফি (৳১,৫০০ × জন)', 'Official IVAC Govt Fee (৳1,500 × qty)')}</span>
                      <strong className="text-[#1E2519]">{currency(calcBreakdown.totalIvacGovt)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('প্রসেসিং ও স্লট বুকিং ফি', 'Processing & Slot Booking Charge')}</span>
                      <strong className="text-[#1E2519]">{currency(calcBreakdown.totalServiceAndSlot)}</strong>
                    </div>
                    {calcBreakdown.totalAddons > 0 && (
                      <div className="flex justify-between">
                        <span>{t('অতিরিক্ত সেবা (পোর্ট / নোটারি)', 'Optional Add-ons (Port / Notary)')}</span>
                        <strong className="text-[#1E2519]">{currency(calcBreakdown.totalAddons)}</strong>
                      </div>
                    )}
                    <div className="pt-2.5 border-t border-[#DCE7D7] flex justify-between items-baseline">
                      <span className="text-sm font-bold text-[#1E2519]">
                        {t('সর্বমোট আনুমানিক খরচ', 'Total Estimated Payable')}
                      </span>
                      <span className="text-xl font-extrabold text-[#1D5E29]">
                        {currency(calcBreakdown.grandTotal)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#55604C] leading-relaxed">
                    {t(
                      'নির্বাচিত সেন্টার:',
                      'Selected Center:'
                    )}{' '}
                    <strong>{ivacCenters[selectedIvacCenterIdx]}</strong>
                  </p>

                  <a
                    id="calc-whatsapp-send-btn"
                    href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(calcWhatsAppText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-service-name={isBn ? `${selectedCat.bn} (${num(applicantCount)} জন)` : `${selectedCat.en} (${applicantCount})`}
                    data-section={t('ভিসা ফি ক্যালকুলেটর', 'Visa Fee Calculator')}
                    data-whatsapp-title={t('ক্যালকুলেটর বুকিং', 'Calculator Quote')}
                    className="btn-3d-matte-green w-fit px-3 py-1.5 leading-tight rounded-[5px] text-xs font-bold inline-flex items-center justify-center gap-1.5 text-[#124218]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{t('এই হিসাবসহ হোয়াটসঅ্যাপ / এজেন্টে পাঠান', 'Send Estimate via WhatsApp / Agent')}</span>
                  </a>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: 2x2 INCH PHOTO CROPPER & PASSPORT PRE-CHECKER           */}
            {/* ============================================================== */}
            {activeTab === 'photo' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Photo Cropper */}
                <div className="lg:col-span-6 space-y-3 bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E0D4]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#1E2519]">
                      {t('২×২ ইঞ্চি (50×50mm / 600×600px) ছবি ক্রপার', '2×2 Inch (50×50mm / 600×600px) Photo Cropper')}
                    </h3>
                    <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded bg-[#E6F4E8] text-[#1D5E29]">
                      {t('১০০% ব্রাউজার-লোকাল', '100% Browser Local')}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#55604C] leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#263375] shrink-0 mt-[7px]" aria-hidden="true" />
                      <span>
                        {t(
                          'আপনার ছবি কখনোই সার্ভারে আপলোড হয় না — সম্পূর্ণভাবে আপনার নিজস্ব ব্রাউজারে প্রসেস হয়।',
                          'Your photo never leaves your device — 100% processed locally in your browser.'
                        )}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#263375] shrink-0 mt-[7px]" aria-hidden="true" />
                      <span>
                        {t(
                          'সরাসরি ৬০০×৬০০ পিক্সেল (২×২ ইঞ্চি) সাদা ব্যাকগ্রাউন্ড ও হেড অ্যালাইনমেন্ট গাইডসহ ক্রপ করে ডাউনলোড করুন।',
                          'Crop to exact 600×600px (2×2 inch) JPEG with a plain white background and head alignment guide.'
                        )}
                      </span>
                    </li>
                  </ul>

                  <label className="btn-3d-matte-secondary w-fit inline-flex items-center gap-1.5 px-3 py-1.5 leading-tight rounded-[5px] text-xs font-bold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('ছবি নির্বাচন করুন (JPG/PNG)', 'Upload Photo (JPG/PNG)')}</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>

                  {photoSrc && (
                    <div className="space-y-3 pt-1">
                      <div
                        className="relative w-60 h-60 mx-auto rounded-xl overflow-hidden border-2 border-[#263375] bg-white cursor-move select-none"
                        onPointerDown={(e) => {
                          dragStateRef.current = {
                            active: true,
                            startX: e.clientX,
                            startY: e.clientY,
                            origX: photoOffsetX,
                            origY: photoOffsetY,
                          };
                        }}
                        onPointerMove={(e) => {
                          if (!dragStateRef.current.active) return;
                          setPhotoOffsetX(dragStateRef.current.origX + (e.clientX - dragStateRef.current.startX));
                          setPhotoOffsetY(dragStateRef.current.origY + (e.clientY - dragStateRef.current.startY));
                        }}
                        onPointerUp={() => {
                          dragStateRef.current.active = false;
                        }}
                        onPointerLeave={() => {
                          dragStateRef.current.active = false;
                        }}
                      >
                        <canvas ref={canvasRef} className="w-full h-full block" />
                        {/* Non-destructive face alignment overlay */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-40 rounded-full border-2 border-dashed border-[#263375]/55" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <ZoomIn className="w-4 h-4 text-[#263375]" />
                        <input
                          type="range"
                          min={0.6}
                          max={2.4}
                          step={0.05}
                          value={photoZoom}
                          onChange={(e) => setPhotoZoom(Number(e.target.value))}
                          className="flex-1"
                          aria-label={t('জুম নিয়ন্ত্রণ', 'Zoom level')}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoZoom(1);
                            setPhotoOffsetX(0);
                            setPhotoOffsetY(0);
                          }}
                          className="p-1.5 rounded-lg border border-[#D5CFBF] bg-white cursor-pointer"
                          title={t('রিসেট', 'Reset')}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {photoWhiteBgScore !== null && (
                        <div
                          className={`text-xs px-3 py-2 rounded-xl border ${
                            photoWhiteBgScore >= 80
                              ? 'bg-[#E8F5E9] border-[#C5E0C9] text-[#1E5624]'
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}
                        >
                          {photoWhiteBgScore >= 80
                            ? t(
                                `সাদা ব্যাকগ্রাউন্ড যাচাই: চমৎকার (${num(photoWhiteBgScore)}%)`,
                                `White background check: Good (${photoWhiteBgScore}%)`
                              )
                            : t(
                                `সতর্কতা: ব্যাকগ্রাউন্ড যথেষ্ট সাদা নয় (${num(photoWhiteBgScore)}%) — ল্যাব প্রিন্টে সাদা ব্যাকগ্রাউন্ড নিশ্চিত করুন।`,
                                `Heads up: Background edges look shaded (${photoWhiteBgScore}% white). Ensure plain white background for IVAC print.`
                              )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleDownloadCroppedPhoto}
                        className="btn-3d-matte-primary w-fit px-3 py-1.5 leading-tight rounded-[5px] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('৬০০×৬০০ JPEG ডাউনলোড করুন', 'Download 600×600 JPEG')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Passport Validity & Blank Pages Pre-Checker */}
                <div className="lg:col-span-6 space-y-3 bg-[#F6F8FF] p-4 rounded-2xl border border-[#D8DEFA]">
                  <h3 className="text-sm font-bold text-[#161D28]">
                    {t('পাসপোর্ট মেয়াদ ও পৃষ্ঠা প্রি-চেকার', 'Passport Validity & Blank Pages Checker')}
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#4C5565] leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#263375] shrink-0 mt-[7px]" aria-hidden="true" />
                      <span>
                        {t(
                          'আবেদন জমার তারিখ থেকে পাসপোর্টের মেয়াদ কমপক্ষে ৬ মাস (১৮০ দিন) থাকা বাধ্যতামূলক।',
                          'Passport must have at least 6 months (180 days) remaining validity from submission date.'
                        )}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#263375] shrink-0 mt-[7px]" aria-hidden="true" />
                      <span>
                        {t(
                          'পাসপোর্টে অন্তত ২টি সম্পূর্ণ খালি পৃষ্ঠা এবং পূর্বের সকল পুরনো পাসপোর্ট সাথে থাকতে হবে।',
                          'Must contain at least 2 completely blank pages along with all previous old passports.'
                        )}
                      </span>
                    </li>
                  </ul>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="passport-expiry-input" className="block text-xs font-bold text-[#1E2519] mb-1">
                        {t('পাসপোর্ট মেয়াদোত্তীর্ণের তারিখ', 'Passport Expiry Date')}
                      </label>
                      <input
                        id="passport-expiry-input"
                        type="date"
                        value={passportExpiryDate}
                        onChange={(e) => setPassportExpiryDate(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl border border-[#C6D0FB] bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="intended-travel-input" className="block text-xs font-bold text-[#1E2519] mb-1">
                        {t('আবেদন / সম্ভাব্য জমার তারিখ', 'Submission / Travel Date')}
                      </label>
                      <input
                        id="intended-travel-input"
                        type="date"
                        value={intendedTravelDate}
                        onChange={(e) => setIntendedTravelDate(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl border border-[#C6D0FB] bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 text-xs text-[#1E2519] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasTwoBlankPages}
                        onChange={(e) => setHasTwoBlankPages(e.target.checked)}
                      />
                      <span>{t('পাসপোর্টে কমপক্ষে ২টি সম্পূর্ণ খালি পৃষ্ঠা আছে', 'Passport has at least 2 completely blank pages')}</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[#1E2519] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasOldPassports}
                        onChange={(e) => setHasOldPassports(e.target.checked)}
                      />
                      <span>{t('পূর্বের সকল পুরনো পাসপোর্ট (বা হারানো থাকলে জিডি) সাথে আছে', 'All previous passports (or Police GD if lost) are available')}</span>
                    </label>
                  </div>

                  {passportValidityResult && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        passportValidityResult.fullyEligible
                          ? 'bg-[#E8F5E9] border-[#B9DFBF] text-[#1B4D20]'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        {passportValidityResult.fullyEligible ? (
                          <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        )}
                        <span>
                          {passportValidityResult.fullyEligible
                            ? t('পাসপোর্ট শর্তাবলি পূরণ করেছে!', 'Passport Meets IVAC Validity Requirements!')
                            : t('সতর্কতা: পাসপোর্ট প্রস্তুতিতে ঘাটতি রয়েছে', 'Action Needed Before Applying')}
                        </span>
                      </div>
                      <p>
                        {isBn
                          ? `জমার তারিখ থেকে অবশিষ্ট মেয়াদ: প্রায় ${num(passportValidityResult.diffDays)} দিন`
                          : `Remaining validity from selected date: ${passportValidityResult.diffDays} days`}
                      </p>
                      {!passportValidityResult.hasSixMonths && (
                        <p className="font-semibold">
                          {t(
                            '• ৬ মাসের কম মেয়াদ থাকায় নতুন ই-পাসপোর্ট নবায়নের পরামর্শ দেওয়া হচ্ছে।',
                            '• Less than 6 months left — renew your passport before IVAC submission.'
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: 9-POINT REJECTION RISK QUIZ                             */}
            {/* ============================================================== */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E5E8F5]">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#161D28]">
                      {t('ভিসা রিজেকশন ঝুঁকি যাচাই (৯টি কারণ)', '9-Point Visa Rejection Risk Audit')}
                    </h3>
                    <p className="text-xs text-[#5A6474]">
                      {t(
                        'প্রতিটি প্রশ্নের হ্যাঁ বা না নির্বাচন করে ফাইল জমা দেওয়ার আগেই দুর্বলতা চিহ্নিত করুন।',
                        'Answer Yes or No for each IVAC rule to spot and fix potential rejection issues before applying.'
                      )}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EEF1FE] text-[#263375] border border-[#C6D0FB] self-start">
                    {isBn
                      ? `উত্তর সম্পন্ন: ${num(quizEvaluation.totalAnswered)} / ৯`
                      : `Answered: ${quizEvaluation.totalAnswered} / 9`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {REJECTION_QUIZ_ITEMS.map((item, idx) => {
                    const ans = quizAnswers[item.id];
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          ans === 'no'
                            ? 'bg-rose-50/70 border-rose-200'
                            : ans === 'yes'
                            ? 'bg-[#F3F8F2] border-[#C7DFC4]'
                            : 'bg-[#FAFBFD] border-[#E1E6FC]'
                        }`}
                      >
                        <p className="text-xs font-semibold text-[#1E2519] leading-relaxed">
                          {isBn ? `${num(idx + 1)}. ${item.bn}` : `${idx + 1}. ${item.en}`}
                        </p>
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [item.id]: 'yes' }))}
                            className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                              ans === 'yes'
                                ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                                : 'bg-white text-[#344054] border-[#D0D7EE]'
                            }`}
                          >
                            {t('হ্যাঁ, প্রস্তুত', 'Yes, Ready')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [item.id]: 'no' }))}
                            className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                              ans === 'no'
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-white text-[#344054] border-[#D0D7EE]'
                            }`}
                          >
                            {t('না / সমস্যা আছে', 'No / Unsure')}
                          </button>
                        </div>
                        {ans === 'no' && (
                          <ul className="mt-2.5 space-y-1.5 text-[11.5px] text-rose-800 bg-white/85 rounded-lg px-3 py-2 border border-rose-200 leading-relaxed">
                            {(isBn ? item.fixBn : item.fixEn)
                              .replace(/^[০-৯0-9]+\)\s*/, '')
                              .split(/(?<=[।.])\s+|—/)
                              .map((seg) => seg.trim())
                              .filter(Boolean)
                              .map((point, pIdx) => (
                                <li key={pIdx} className="flex items-start gap-2">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-[6px]"
                                    aria-hidden="true"
                                  />
                                  <span>{point}</span>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>

                {quizEvaluation.totalAnswered > 0 && (
                  <div
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      quizEvaluation.level === 'low'
                        ? 'bg-[#E8F5E9] border-[#B9DFBF] text-[#1B4D20]'
                        : quizEvaluation.level === 'medium'
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold">
                        {quizEvaluation.level === 'low'
                          ? t('ফাইলের ঝুঁকি অত্যন্ত কম (প্রস্তুতি সন্তোষজনক)', 'Low Rejection Risk — File Looks Well Prepared')
                          : quizEvaluation.level === 'medium'
                          ? t(
                              `মাঝারি ঝুঁকি (${num(quizEvaluation.failedItems.length)}টি বিষয় সংশোধন প্রয়োজন)`,
                              `Moderate Risk (${quizEvaluation.failedItems.length} item(s) need attention)`
                            )
                          : t(
                              `উচ্চ ঝুঁকি! (${num(quizEvaluation.failedItems.length)}টি জরুরি বিষয় আগে ঠিক করুন)`,
                              `High Risk! Fix ${quizEvaluation.failedItems.length} critical item(s) before filing`
                            )}
                      </div>
                      <p className="text-xs opacity-90 mt-0.5">
                        {t(
                          'ফাইল জমার আগে আমাদের প্রসেসিং টিম দিয়ে ডকুমেন্টগুলো নিখুঁতভাবে যাচাই করে নিতে পারেন।',
                          'Our processing desk can review your paperwork before slot confirmation to minimize rejection risk.'
                        )}
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(
                        `Hello Processing Hub, I completed the 9-Point Risk Quiz and flagged ${quizEvaluation.failedItems.length} item(s). Please help review my visa file.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-3d-matte-green w-fit px-3 py-1.5 leading-tight rounded-[5px] text-xs font-bold shrink-0 text-[#124218]"
                    >
                      {t('এজেন্টের সহায়তা নিন', 'Get File Reviewed')}
                    </a>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E0D4] text-[11.5px] text-[#4E5C46] leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <span>
                    <strong className="text-[#1E2519]">{t('অফিশিয়াল IVAC নোটিশ বোর্ড নির্দেশনা:', 'Official IVAC Notice Board Note:')}</strong>{' '}
                    {t(
                      'IVAC ভিসা প্রত্যাখ্যান কারণ বলতে পারবে না। বিস্তারিত জানার জন্য ই-মেইল করুন:',
                      'IVAC cannot state reasons for visa rejection. For official queries, email:'
                    )}{' '}
                    <a href="mailto:visahelp@hcidhaka.gov.in" className="font-bold text-[#263375] underline">
                      visahelp@hcidhaka.gov.in
                    </a>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Extension Spotlight inside Visa Tools Hub */}
        <ExtensionSpotlightCard />
      </div>
    </section>
  );
};
