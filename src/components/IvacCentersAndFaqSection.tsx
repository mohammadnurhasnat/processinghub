import React, { useEffect, useState } from 'react';
import { Building2, AlertCircle, ChevronDown, HelpCircle, MapPin } from 'lucide-react';
import {
  ACTIVE_IVAC_CENTER_GUIDES,
  CLOSED_IVAC_CENTERS_BN,
  CLOSED_IVAC_CENTERS_EN,
} from '../config';
import { useLanguage } from '../context/LanguageContext';

export interface FaqItem {
  qBn: string;
  qEn: string;
  aBn: string;
  aEn: string;
  introBn?: string;
  introEn?: string;
  bulletsBn: string[];
  bulletsEn: string[];
}

export const OFFICIAL_FAQ_ITEMS: FaqItem[] = [
  {
    qBn: 'ইন্ডিয়ান ভিসার জন্য সকল ক্ষেত্রে কমন ও আর্থিক ডকুমেন্টস কী কী প্রয়োজন?',
    qEn: 'What common and financial documents are mandatory for all Indian visa categories?',
    aBn: 'প্রতিটি ইন্ডিয়ান ভিসার জন্য ন্যূনতম ৬ মাস মেয়াদী মূল পাসপোর্ট ও সকল পুরনো পাসপোর্ট, ২×২ ইঞ্চি সাদা ব্যাকগ্রাউন্ড ল্যাব প্রিন্ট ছবি, জাতীয় পরিচয়পত্র (NID) বা ডিজিটাল জন্মসনদ, সাম্প্রতিক ইউটিলিটি বিল, পেশাগত প্রমাণপত্র (NOC/ট্রেড লাইসেন্স/স্টুডেন্ট আইডি) এবং আর্থিক প্রমাণ হিসেবে $২০০ ডলার পাসপোর্ট এন্ডোর্সমেন্ট অথবা ব্যাংক স্টেটমেন্ট প্রয়োজন।',
    aEn: 'Every application requires an original passport (6+ months validity, 2+ blank pages) plus old passports, 2×2 inch white-background photo, NID or birth certificate, utility bill, occupational proof, and financial proof.',
    introBn: 'প্রতিটি ইন্ডিয়ান ভিসা আবেদনের জন্য নিচের সাধারণ ও আর্থিক কাগজপত্রগুলো থাকা আবশ্যক:',
    introEn: 'Every Indian visa application requires the following mandatory common and financial records:',
    bulletsBn: [
      'ন্যূনতম ৬ মাস মেয়াদী মূল পাসপোর্ট (কমপক্ষে ২টি খালি পৃষ্ঠাসহ) ও পূর্বের সকল পুরনো পাসপোর্ট।',
      'সদ্য তোলা ২×২ ইঞ্চি সাদা ব্যাকগ্রাউন্ড ল্যাব প্রিন্ট ছবি (কোনো পুরানো ছবি গ্রহণযোগ্য নয়)।',
      'জাতীয় পরিচয়পত্র (NID) অথবা ডিজিটাল জন্ম নিবন্ধন সনদের কপি।',
      'বর্তমান ঠিকানার সাম্প্রতিক বিদ্যুৎ, গ্যাস বা পানির (ইউটিলিটি) বিলের কপি।',
      'পেশাগত প্রমাণপত্র: চাকরিজীবী হলে NOC, ব্যবসায়ী হলে হালনাগাদ ট্রেড লাইসেন্স এবং শিক্ষার্থী হলে স্টুডেন্ট আইডি কার্ড।',
      'আর্থিক প্রমাণ: ন্যূনতম $২০০ ডলার পাসপোর্ট এন্ডোর্সমেন্ট অথবা সমপরিমাণ ব্যালেন্সসহ ৬ মাসের ব্যাংক স্টেটমেন্ট অথবা স্টেট ব্যাংক অফ ইন্ডিয়া (SBI) / ইন্টারন্যাশনাল ট্রাভেল কার্ড।',
    ],
    bulletsEn: [
      'Original passport with at least 6 months validity (2+ blank pages) along with all previous old passports.',
      'Recent 2×2 inch lab-print photograph on a plain white background.',
      'Copy of National ID (NID) card or digital Birth Registration Certificate.',
      'Recent utility bill (electricity, gas, or water) matching your present address.',
      'Occupational proof: official NOC for employees, updated Trade License for business owners, or Student ID card.',
      'Financial proof: minimum $200 USD passport endorsement, 6-month bank statement with equivalent balance, or SBI / International Travel Card.',
    ],
  },
  {
    qBn: 'বাংলাদেশে কোন কোন আইভ্যাক (IVAC) ভিসা অফিসে আবেদন জমা দেওয়া যায় এবং কোনগুলো বন্ধ?',
    qEn: 'Which IVAC centers in Bangladesh accept applications and which regional centers are temporarily closed?',
    aBn: 'বাংলাদেশে অফিশিয়াল আইভ্যাক (IVAC) সেন্টারগুলো হলো: ঢাকা (যমুনা ফিউচার পার্ক — JFP), চট্টগ্রাম, খুলনা, সিলেট ও রাজশাহী। ১১টি আঞ্চলিক সেন্টার আপাতত সাময়িকভাবে বন্ধ রয়েছে।',
    aEn: 'The official IVAC centers accepting applications are Dhaka (JFP), Chattogram, Khulna, Sylhet, and Rajshahi. Eleven regional centers remain temporarily suspended.',
    bulletsBn: [
      'আবেদন জমা দেওয়ার আইভ্যাক কেন্দ্রসমূহ: ঢাকা (যমুনা ফিউচার পার্ক — JFP), চট্টগ্রাম, খুলনা, সিলেট ও রাজশাহী।',
      'সাময়িকভাবে বন্ধ থাকা ১১টি আঞ্চলিক কেন্দ্র: রংপুর, ময়মনসিংহ, বরিশাল, কুমিল্লা, নোয়াখালী, ব্রাহ্মণবাড়িয়া, ঠাকুরগাঁও, বগুড়া, কুষ্টিয়া, যশোর ও সাতক্ষীরা।',
      'আঞ্চলিক কেন্দ্রগুলোর কার্যক্রম স্থগিত থাকায় অনুগ্রহ করে উপরের আইভ্যাক কেন্দ্রগুলোর যেকোনো একটি নির্বাচন করে আবেদন করুন।',
    ],
    bulletsEn: [
      'Official IVAC centers accepting submissions: Dhaka (Jamuna Future Park — JFP), Chattogram, Khulna, Sylhet, and Rajshahi.',
      '11 temporarily closed regional centers: Rangpur, Mymensingh, Barishal, Cumilla, Noakhali, Brahmanbaria, Thakurgaon, Bogura, Kushtia, Jashore, and Satkhira.',
      'Please select one of the centers listed above for appointment booking and file submission.',
    ],
  },
  {
    qBn: 'ইন্ডিয়ান ভিসার স্লট কবে ছাড়বে / ভিসার ডেট কবে দিবে?',
    qEn: 'When are Indian visa appointment slots released?',
    aBn: 'ভারতীয় হাইকমিশনের নিয়ম অনুযায়ী স্লট ছাড়ার ক্ষেত্রে কোনো সুনির্দিষ্ট তারিখ নির্ধারিত নেই। তবে প্রতি দুই সপ্তাহ অন্তর অন্তর বৃহস্পতিবার ডেট ছাড়া হয়।',
    aEn: 'According to the High Commission of India, there is no fixed advance schedule for slot releases, though dates are typically released every two weeks on Thursdays.',
    bulletsBn: [
      'ভারতীয় হাইকমিশনের নিয়ম অনুযায়ী স্লট ছাড়ার জন্য কোনো অগ্রিম নির্দিষ্ট ক্যালেন্ডার তারিখ নির্ধারিত নেই।',
      'সাধারণত প্রতি দুই সপ্তাহ অন্তর অন্তর বৃহস্পতিবার নতুন অ্যাপয়েন্টমেন্ট ডেট বা স্লট ছাড়া হয়।',
      'Processing Hub (০১৫৭৭৪৬৪৭০৬) সার্বক্ষণিক সিস্টেম মনিটর করে স্লট ওপেন হওয়া মাত্র দ্রুত বুকিং সম্পন্ন করে দেয়।',
    ],
    bulletsEn: [
      'The High Commission of India does not publish a fixed advance calendar for appointment slot releases.',
      'In practice, new appointment dates are generally released every two weeks on Thursdays.',
      'Processing Hub (01577464706) monitors the portal continuously to secure your slot as soon as dates open.',
    ],
  },
  {
    qBn: 'ইন্ডিয়ান ভিসার রেট ও আইভ্যাক স্লট ফি কত (৳১,৫০০ সরকারি ফিসহ)?',
    qEn: 'What are the visa processing and IVAC slot fees (including ৳1,500 official fee)?',
    aBn: 'প্রসেসিং + স্লটসহ প্যাকেজ ফি: ট্যুরিস্ট ৳৬,০০০, মেডিকেল ও অ্যাটেনডেন্ট ৳৬,০০০, বিজনেস ৳৬,০০০, ডাবল এন্ট্রি ৳৬,৫০০, স্টুডেন্ট ৳৫,৫০০, ট্রানজিট ৳৫,৫০০, এন্ট্রি ৳৬,০০০, স্পাউস ৳৬,০০০। শুধু স্লট বুকিং ৳৪,৫০০ থেকে শুরু।',
    aEn: 'Full Processing + Slot packages start from ৳5,500–৳6,500 (including ৳1,500 IVAC fee), and slot-only booking starts from ৳4,500.',
    introBn: 'আইভ্যাকের ৳১,৫০০ সরকারি ফিসহ আমাদের স্বচ্ছ প্যাকেজ ও স্লট রেট তালিকা:',
    introEn: 'Transparent fee breakdown including the ৳1,500 official IVAC fee:',
    bulletsBn: [
      'ট্যুরিস্ট, মেডিকেল ও অ্যাটেনডেন্ট, বিজনেস, এন্ট্রি (X-Misc) এবং স্পাউস (X-1) পূর্ণাঙ্গ প্রসেসিং + স্লট: ৳৬,০০০।',
      'ডাবল এন্ট্রি (X-3 Miscellaneous) পূর্ণাঙ্গ প্রসেসিং + স্লট: ৳৬,৫০০।',
      'স্টুডেন্ট ভিসা (S-1) ও ট্রানজিট ভিসা (TR) পূর্ণাঙ্গ প্রসেসিং + স্লট: ৳৫,৫০০।',
      'শুধুমাত্র স্লট বুকিং (আইভ্যাক ৳১,৫০০ ফিসহ): ট্যুরিস্ট স্লট ৳৫,৫০০ এবং বাকি সকল ক্যাটাগরির স্লট ৳৪,৫০০।',
    ],
    bulletsEn: [
      'Full Processing + Slot for Tourist, Medical & Attendant, Business, Entry (X-Misc), and Spouse (X-1): ৳6,000.',
      'Full Processing + Slot for Double Entry (X-3 Miscellaneous): ৳6,500.',
      'Full Processing + Slot for Student (S-1) and Transit (TR): ৳5,500.',
      'Slot-only booking (including ৳1,500 IVAC fee): Tourist slot ৳5,500; all other categories ৳4,500.',
    ],
  },
  {
    qBn: 'মেডিকেল ভিসা (M-1) ও অ্যাটেনডেন্ট ভিসার (M-2) কাগজপত্রে কী পার্থক্য?',
    qEn: 'What is the difference between Medical (M-1) and Medical Attendant (M-2) documents?',
    aBn: 'রোগীর (M-1) জন্য ভারতীয় হাসপাতালের মূল ইনভাইটেশন লেটার (MVRN) ও প্রেসক্রিপশন লাগে। অ্যাটেনডেন্টের (M-2) জন্য আলাদা মেডিকেল রিপোর্ট লাগে না।',
    aEn: 'Patients (M-1) need an Indian hospital invitation letter (MVRN) and Bangladeshi prescriptions/reports, whereas Attendants (M-2) only need basic common documents.',
    bulletsBn: [
      'রোগীর মেডিকেল ভিসা (M-1): ভারতীয় হাসপাতালের মূল অ্যাপয়েন্টমেন্ট/ইনভাইটেশন লেটার (MVRN), প্রযোজ্য ক্ষেত্রে AYUSH লেটার এবং বাংলাদেশের ডাক্তারের প্রেসক্রিপশন ও টেস্ট রিপোর্ট প্রয়োজন।',
      'মেডিকেল অ্যাটেনডেন্ট ভিসা (M-2): অ্যাটেনডেন্টের জন্য আলাদা কোনো মেডিকেল টেস্ট রিপোর্ট বা প্রেসক্রিপশন লাগে না—কেবল বেসিক কমন ডকুমেন্টস ও রোগীর সাথে সম্পর্কের প্রমাণপত্র লাগে।',
    ],
    bulletsEn: [
      'Medical Patient Visa (M-1): Requires an Indian hospital appointment/invitation letter (MVRN), AYUSH letter if applicable, and Bangladeshi doctor prescriptions & diagnostic reports.',
      'Medical Attendant Visa (M-2): No medical test reports or prescriptions are needed for the attendant—only basic common documents and proof of relationship with the patient.',
    ],
  },
  {
    qBn: 'ডাবল এন্ট্রি (X-3 Miscellaneous) ও স্পাউস (X-1) ভিসায় কোন কোন কাগজ লাগে?',
    qEn: 'What is required for Double Entry (X-3) and Spouse (X-1) Miscellaneous visas?',
    aBn: 'ডাবল এন্ট্রি (X-3) আবেদনে ৩য় দেশের এম্বাসির অ্যাপয়েন্টমেন্ট লেটার ও ওয়ার্ক পারমিট লাগে। স্পাউস (X-1) ভিসায় সত্যায়িত নিকাহনামা ও ভারতীয় স্পাউসের কাগজপত্র লাগে।',
    aEn: 'Double Entry (X-3) requires a 3rd-country embassy appointment letter and work permit. Spouse (X-1) requires an attested Marriage Certificate and the Indian spouse’s ID copies.',
    bulletsBn: [
      'ডাবল এন্ট্রি ভিসা (X-3): কমন ডকুমেন্টস ছাড়াও ৩য় দেশের এম্বাসির অ্যাপয়েন্টমেন্ট লেটার (যেমন পর্তুগাল, পোল্যান্ড, বুলগেরিয়া, রোমানিয়া, গ্রিসসহ ইউরোপীয় এম্বাসি) এবং ওয়ার্ক পারমিট প্রয়োজন।',
      'স্পাউস ভিসা (X-1): বাংলাদেশী আবেদনকারীর সত্যায়িত নিকাহনামা/ম্যারিজ সার্টিফিকেট ও বেসিক ডকুমেন্টস প্রয়োজন।',
      'ভারতীয় স্পাউসের ডকুমেন্ট: পাসপোর্ট, আধার কার্ড, ভোটার আইডি ও প্যান কার্ডসহ আনুষঙ্গিক কাগজপত্রের কপি সংযুক্ত করতে হবে।',
    ],
    bulletsEn: [
      'Double Entry (X-3): Beyond common documents, requires a 3rd-country embassy appointment letter in India (e.g. Portugal, Poland, Bulgaria, Romania, Greece) and work permit.',
      'Spouse Visa (X-1): Requires an attested Marriage Certificate / Nikahnama and standard applicant documents.',
      'Indian Spouse Records: Clear copies of the Indian spouse’s Passport, Aadhaar Card, Voter ID, and PAN Card.',
    ],
  },
  {
    qBn: 'নোটারি ও ডকুমেন্ট অনুবাদ, হাসপাতাল খরচ গাইড ও হোটেল/ট্রেন বুকিং কীভাবে কাজ করে?',
    qEn: 'How do notary & document translation, hospital cost guides, and hotel/rail booking work?',
    aBn: 'নিকাহনামা, জন্মসনদ বা একাডেমিক সনদের ইংরেজি অনুবাদ ও নোটারি সেবা ৳১,২০০+ থেকে শুরু। হাসপাতাল খরচ গাইড ও হোটেল/ট্রেন বুকিং ৳৭৯৯+ থেকে শুরু।',
    aEn: 'Certified English translation & Notary starts from ৳1,200+, hospital cost guides & airport pickup info are in the hospitals section, and hotel/train packages start from ৳799+.',
    bulletsBn: [
      'নোটারি ও ইংরেজি অনুবাদ: নিকাহনামা, জন্মসনদ, ট্রেড লাইসেন্স বা একাডেমিক সনদের নির্ভুল ইংরেজি অনুবাদ ও নোটারি পাবলিক সেবা ৳১,২০০+ থেকে শুরু।',
      'হাসপাতাল খরচ ও পিকআপ গাইড: আমাদের গন্তব্য পেজের হাসপাতাল সেকশনেই শহরের আনুমানিক চিকিৎসা খরচ ও এয়ারপোর্ট পিকআপ তথ্য দেখা যায়।',
      'হোটেল ও ট্রেন/বাস বুকিং: মৈত্রী/বন্ধন/মিতালী ট্রেন, ক্রস-বর্ডার বাস এবং হোটেল বুকিং সহায়তা ৳৭৯৯+ থেকে শুরু।',
    ],
    bulletsEn: [
      'Notary & Translation: Certified English translation and Notary Public assistance for Nikahnama, birth certificates, and academic records starting from ৳1,200+.',
      'Hospital Cost & Pickup Guide: Indicative treatment cost ranges and airport/station pickup coordination are available inside our Destinations & Hospitals directory.',
      'Hotel & Rail/Bus Packages: Maitree/Bandhan/Mitali train tickets, cross-border buses, and hotel reservations starting from ৳799+.',
    ],
  },
  {
    qBn: 'Tracker - Indian Visa Autofill ক্রোম এক্সটেনশনটি কী এবং কীভাবে সাহায্য করে?',
    qEn: 'What is the Tracker - Indian Visa Autofill Chrome extension and how does it work?',
    aBn: 'Tracker - Indian Visa Autofill হলো গুগল ক্রোম ওয়েব স্টোরে প্রকাশিত আমাদের অফিশিয়াল স্মার্ট ফর্ম-অটোফিল এক্সটেনশন। মাত্র এক ক্লিকে ৩০ সেকেন্ডের মধ্যে পুরো মাল্টি-স্টেপ ফর্ম পূরণ করে।',
    aEn: 'Tracker - Indian Visa Autofill is our official Chrome Web Store extension that populates multi-step Indian visa forms in under 30 seconds with one click.',
    introBn:
      'Tracker - Indian Visa Autofill (Tracker Smart Autofill) হলো গুগল ক্রোম ওয়েব স্টোরে প্রকাশিত আমাদের অফিশিয়াল স্মার্ট ফর্ম-অটোফিল এক্সটেনশন। সাধারণভাবে ইন্ডিয়ান ভিসার মাল্টি-স্টেপ অনলাইন ফর্ম হাতে টাইপ করে পূরণ করতে ১৫–২০ মিনিট লাগে এবং একটি অক্ষর ভুল হলেই ভিসা রিজেক্ট হওয়ার ঝুঁকি থাকে। এই এক্সটেনশনটি যেভাবে কাজ করে:',
    introEn:
      'Tracker - Indian Visa Autofill (Tracker Smart Autofill) is our official Chrome Web Store extension for Indian visa applicants in Bangladesh. Manual form entry takes 15–20 minutes and risks costly typos. Here is how it works:',
    bulletsBn: [
      'পাসপোর্ট বা পূর্বের ফর্ম (PDF) আপলোড করলে কিংবা একবার প্রোফাইল তৈরি করলে এটি আবেদনকারীর নাম, পাসপোর্ট তথ্য, জন্মতারিখ, পরিবারের তথ্য, ঠিকানা ও ভিসা ক্যাটাগরি (Tourist, Medical, Business, Entry, Student) স্বয়ংক্রিয়ভাবে সাজিয়ে নেয়।',
      'ভিসা পোর্টালে (indianvisaonline.gov.in ও IVAC) গিয়ে মাত্র এক ক্লিকে (One-Click Auto Mode) ৩০ সেকেন্ডের মধ্যে পুরো মাল্টি-স্টেপ ফর্ম, আংশিক পূরণকৃত ফর্ম (Partially Filled Form) ও অ্যাপয়েন্টমেন্ট বুকিং পেজের সব ঘর নির্ভুলভাবে অটোমেটিক ফিলাপ করে ফেলে।',
      'এতে বিল্ট-ইন ইনস্ট্যান্ট ক্যাপচা সলভার (Instant Captcha Solver) এবং আবেদনকারীর ছবি ও PDF ডকুমেন্ট লোকালি সংরক্ষণের সুবিধা রয়েছে।',
      'একাধিক আবেদনকারীর (Multiple Profiles) প্রোফাইল সেভ করে এক ক্লিকে সুইচ করা যায় এবং সকল ব্যক্তিগত তথ্য ১০০% নিরাপদে কেবল আপনার নিজস্ব ব্রাউজারের লোকাল স্টোরেজেই সংরক্ষিত থাকে।',
    ],
    bulletsEn: [
      'Upload a passport scan / previous visa form PDF or create a profile once to auto-organize applicant name, passport details, DOB, family records, address, and visa category presets (Tourist, Medical, Business, Entry, Student).',
      'With One-Click Auto Mode, it populates every multi-step online registration page, partially filled form, and IVAC appointment booking field within 30 seconds.',
      'Includes a built-in Instant Captcha Solver along with local storage for applicant photos and PDF documents.',
      'Supports switching across multiple applicant profiles with 100% of your data kept privately inside your own browser’s local storage.',
    ],
  },
];

interface IvacCentersAndFaqSectionProps {
  externalOpenFaqIdx?: number | null;
}

export const IvacCentersAndFaqSection: React.FC<IvacCentersAndFaqSectionProps> = ({
  externalOpenFaqIdx,
}) => {
  const { language, t } = useLanguage();
  const isBn = language === 'bn';
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  useEffect(() => {
    if (typeof externalOpenFaqIdx === 'number' && externalOpenFaqIdx >= 0 && externalOpenFaqIdx < OFFICIAL_FAQ_ITEMS.length) {
      setOpenFaqIdx(externalOpenFaqIdx);
    }
  }, [externalOpenFaqIdx]);

  return (
    <section id="faq" className="relative py-8 sm:py-12 px-4">
      <div className="w-full max-w-6xl mx-auto space-y-10">
        {/* IVAC Centers & Addresses Guide */}
        <div className="rounded-3xl bg-white/90 border border-[#E2DFCC] p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#1D5E29] border border-[#C5E0C9] mb-2">
                <Building2 className="w-3.5 h-3.5" />
                {t('আইভ্যাক সেন্টার গাইড', 'IVAC Center Directory')}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1E2519]">
                {t('আইভ্যাক (IVAC) কেন্দ্রের ঠিকানা', 'IVAC Centers & Addresses')}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ACTIVE_IVAC_CENTER_GUIDES.map((center) => (
              <div
                key={center.id}
                className="rounded-2xl bg-[#FAF9F5] border border-[#E6E2D5] p-3.5 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="mb-1.5">
                    <span className="text-xs font-bold text-[#1E2519] block">
                      {isBn ? center.nameBn : center.nameEn}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#4E5C46] leading-snug flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#5F7758] shrink-0 mt-0.5" />
                    <span>{isBn ? center.addressBn : center.addressEn}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 11 Temporarily Closed Notice */}
          <div className="rounded-2xl bg-amber-50/85 border border-amber-200 px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong>{t('সাময়িকভাবে বন্ধ ১১টি আঞ্চলিক কেন্দ্র:', '11 Temporarily Closed Regional Centers:')}</strong>{' '}
              <span>{isBn ? CLOSED_IVAC_CENTERS_BN.join(' · ') : CLOSED_IVAC_CENTERS_EN.join(' · ')}</span>
              {' — '}
              <span>
                {t(
                  'এই কেন্দ্রগুলোর কার্যক্রম স্থগিত থাকায় অনুগ্রহ করে উপরের আইভ্যাক কেন্দ্রগুলোর যেকোনো একটি নির্বাচন করুন।',
                  'Please choose one of the IVAC centers above for file submission and slot booking.'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Visible Accessible FAQ Accordion with Clean Circular Bullet Lists */}
        <div className="rounded-3xl bg-white/95 border border-[#D8DEFA] p-5 sm:p-7 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EEF1FE] text-[#263375] border border-[#C6D0FB] mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              {t('সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর (FAQ)', 'Frequently Asked Questions')}
            </span>
            <h2 className="text-xl sm:text-3xl font-bold text-[#161D28]">
              {t('ভিসা আবেদন, ফি ও স্লট সংক্রান্ত সকল প্রশ্নোত্তর', 'Answers on Visa Rules, IVAC Slots & Fees')}
            </h2>
          </div>

          <div className="space-y-2.5 max-w-4xl mx-auto">
            {OFFICIAL_FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              const intro = isBn ? item.introBn : item.introEn;
              const bullets = isBn ? item.bulletsBn : item.bulletsEn;

              return (
                <div
                  key={idx}
                  id={`faq-item-${idx}`}
                  className="rounded-2xl border border-[#E1E6FC] bg-[#FAFBFD] overflow-hidden"
                >
                  <button
                    type="button"
                    id={`faq-toggle-${idx}`}
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F1F4FD] transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#161D28] leading-snug">
                      {isBn ? item.qBn : item.qEn}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#263375] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 pt-3 text-xs sm:text-[13.5px] text-[#3C4657] leading-relaxed border-t border-[#EAEEFD] bg-white space-y-2.5">
                      {intro && (
                        <p className="text-[#2B3445] leading-relaxed">{intro}</p>
                      )}
                      <ul className="space-y-2">
                        {bullets.map((point, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5 leading-relaxed">
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-[#263375] shrink-0 mt-[8px]"
                              aria-hidden="true"
                            />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
