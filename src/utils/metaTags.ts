import { VisaService } from '../types';
import { Language, toBnDigits } from '../context/LanguageContext';

const DEFAULT_META_BN = {
  title: 'Processing Hub — ইন্ডিয়ান ভিসা প্রসেসিং ও ৫টি সচল আইভ্যাক স্লট সার্ভিস | processinghub.fun',
  description:
    'বাংলাদেশ থেকে দ্রুত ইন্ডিয়ান ভিসা প্রসেসিং ও ৫টি সচল আইভ্যাক (IVAC) স্লট বুকিং। মেডিকেল ও অ্যাটেনডেন্ট, ট্যুরিস্ট, ডাবল এন্ট্রি (X-3), বিজনেস, স্টুডেন্ট, ট্রানজিট, এন্ট্রি (X-Misc), স্পাউস (X-1) ভিসা ও টিকেট বুকিং। হটলাইন: ০১৫৭৭৪৬৪৭০৬',
  image: 'https://images.moondeveloper.com/attractions/2024/11/25/67446493a8fde.jpg',
  url: 'https://processinghub.fun/',
};

const DEFAULT_META_EN = {
  title: 'Processing Hub — Indian Visa Processing & 5 Active IVAC Slot Services | processinghub.fun',
  description:
    'Fast Indian visa processing and appointment slot booking across the 5 active IVAC centers in Bangladesh. Medical & Attendant, Tourist, Double Entry (X-3), Business, Student, Transit, Entry (X-Misc), Spouse (X-1) visas and ticket booking. Hotline: 01577464706',
  image: 'https://images.moondeveloper.com/attractions/2024/11/25/67446493a8fde.jpg',
  url: 'https://processinghub.fun/',
};

function setMetaTag(selector: string, attr: string, value: string) {
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    const [attrName, attrVal] = selector.replace('meta[', '').replace(']', '').split('=');
    if (attrName && attrVal) {
      element.setAttribute(attrName, attrVal.replace(/['"]/g, ''));
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attr, value);
}

export function updateMetaForService(service: VisaService | null, language: Language = 'bn') {
  if (typeof document === 'undefined') return;

  const defaults = language === 'bn' ? DEFAULT_META_BN : DEFAULT_META_EN;

  if (service) {
    const title =
      language === 'bn'
        ? `${service.title} প্রসেসিং ও স্লট — Processing Hub`
        : `${service.title} Processing & Slot — Processing Hub`;

    const priceLabel =
      language === 'bn'
        ? service.id === 'ticket-booking'
          ? `সার্ভিস চার্জ: ${toBnDigits(service.price)} (মূল টিকেট মূল্যের সাথে আলোচনা সাপেক্ষে)`
          : service.isSlotBooking
            ? `স্লট ফি: ${toBnDigits(service.price)} (৪,৫০০৳ থেকে শুরু, আইভ্যাক ফিসহ)`
            : `প্যাকেজ ফি: ${toBnDigits(service.price)} (${service.per.replace('/ ', '')})`
        : service.id === 'ticket-booking'
          ? `Service Charge: ${service.price} (on top of base ticket fare, negotiable)`
          : service.isSlotBooking
            ? `Slot Fee: ${service.price} (starts from ৳4,500 incl. IVAC fee)`
            : `Package Fee: ${service.price} (${service.per.replace('/ ', '')})`;

    const description =
      language === 'bn'
        ? `${service.description} ${priceLabel}। বাংলাদেশের সচল ৫টি আইভ্যাক সেন্টারে (ঢাকা যমুনা ফিউচার পার্ক, চট্টগ্রাম, খুলনা, সিলেট, রাজশাহী) স্লট ও ফাইল প্রসেসিং সহায়তা। হটলাইন: ০১৫৭৭৪৬৪৭০৬`
        : `${service.description} ${priceLabel}. Appointment slot and file processing assistance across the 5 active IVAC centers in Bangladesh (Dhaka Jamuna Future Park, Chittagong, Khulna, Sylhet, Rajshahi). Hotline: 01577464706`;

    const image = service.image || defaults.image;
    const url = `https://processinghub.fun/#${service.id}`;

    document.title = title;
    setMetaTag('meta[name="description"]', 'content', description);
    setMetaTag('meta[property="og:title"]', 'content', title);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:image"]', 'content', image);
    setMetaTag('meta[property="og:url"]', 'content', url);
    setMetaTag('meta[name="twitter:title"]', 'content', title);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
    setMetaTag('meta[name="twitter:image"]', 'content', image);
  } else {
    document.title = defaults.title;
    setMetaTag('meta[name="description"]', 'content', defaults.description);
    setMetaTag('meta[property="og:title"]', 'content', defaults.title);
    setMetaTag('meta[property="og:description"]', 'content', defaults.description);
    setMetaTag('meta[property="og:image"]', 'content', defaults.image);
    setMetaTag('meta[property="og:url"]', 'content', defaults.url);
    setMetaTag('meta[name="twitter:title"]', 'content', defaults.title);
    setMetaTag('meta[name="twitter:description"]', 'content', defaults.description);
    setMetaTag('meta[name="twitter:image"]', 'content', defaults.image);
  }
}
