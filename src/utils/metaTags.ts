import { VisaService } from '../types';
import { Language, toBnDigits } from '../context/LanguageContext';

const DEFAULT_META_BN = {
  title: 'Processing Hub — ইন্ডিয়ান ভিসা প্রসেসিং, আইভ্যাক (IVAC) স্লট বুকিং সার্ভিস | processinghub.fun',
  description:
    'বাংলাদেশ থেকে দ্রুত ইন্ডিয়ান ভিসা প্রসেসিং ও আইভ্যাক (IVAC) স্লট বুকিং। মেডিকেল ও অ্যাটেনডেন্ট, ট্যুরিস্ট, ডাবল এন্ট্রি (X-3), বিজনেস, স্টুডেন্ট, ট্রানজিট, এন্ট্রি (X-Misc), স্পাউস (X-1), নোটারি ও ডকুমেন্ট অনুবাদ ও টিকেট বুকিং। হটলাইন: ০১৫৭৭৪৬৪৭০৬',
  image: 'https://images.moondeveloper.com/attractions/2024/11/25/67446493a8fde.jpg',
  url: 'https://processinghub.fun/',
};

const DEFAULT_META_EN = {
  title: 'Processing Hub — Indian Visa Processing & IVAC Slot Booking Services | processinghub.fun',
  description:
    'Fast Indian visa processing and appointment slot booking across IVAC centers in Bangladesh. Medical & Attendant, Tourist, Double Entry (X-3), Business, Student, Transit, Entry (X-Misc), Spouse (X-1), Notary & Document Translation, and travel packages. Hotline: 01577464706',
  image: 'https://images.moondeveloper.com/attractions/2024/11/25/67446493a8fde.jpg',
  url: 'https://processinghub.fun/',
};

function toAbsoluteUrl(src: string | undefined, fallback: string): string {
  if (!src) return fallback;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `https://processinghub.fun${src.startsWith('/') ? '' : '/'}${src}`;
}

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
        ? service.id === 'ticket-booking' || service.id === 'hotel-rail-bus-package'
          ? `সার্ভিস চার্জ: ${toBnDigits(service.price)} (রুট অনুযায়ী আলোচনা সাপেক্ষে)`
          : service.isSlotBooking
            ? `স্লট ফি: ${toBnDigits(service.price)} (৪,৫০০৳ থেকে শুরু, আইভ্যাক ফিসহ)`
            : `ফি: ${toBnDigits(service.price)} (${service.per.replace('/ ', '')})`
        : service.id === 'ticket-booking' || service.id === 'hotel-rail-bus-package'
          ? `Service Charge: ${service.price} (route-dependent, negotiable)`
          : service.isSlotBooking
            ? `Slot Fee: ${service.price} (starts from ৳4,500 incl. IVAC fee)`
            : `Fee: ${service.price} (${service.per.replace('/ ', '')})`;

    const description =
      language === 'bn'
        ? `${service.description} ${priceLabel}। আইভ্যাক সেন্টারে (ঢাকা যমুনা ফিউচার পার্ক, চট্টগ্রাম, খুলনা, সিলেট, রাজশাহী) স্লট ও ফাইল প্রসেসিং সহায়তা। হটলাইন: ০১৫৭৭৪৬৪৭০৬`
        : `${service.description} ${priceLabel}. Appointment slot and file processing assistance across IVAC centers in Bangladesh (Dhaka Jamuna Future Park, Chattogram, Khulna, Sylhet, Rajshahi). Hotline: 01577464706`;

    const image = toAbsoluteUrl(service.image, defaults.image);
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
