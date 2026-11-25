import { VisaService } from '../types';

const DEFAULT_META = {
  title: 'Processing Hub — ইন্ডিয়ান ভিসা প্রসেসিং ও ১৬টি আইভ্যাক (IVAC) স্লট সার্ভিস | processinghub.fun',
  description: 'বাংলাদেশ থেকে দ্রুত ইন্ডিয়ান ভিসা প্রসেসিং ও ১৬টি আইভ্যাক (IVAC) স্লট বুকিং। মেডিকেল ও অ্যাটেনডেন্ট, ট্যুরিস্ট, ডাবল এন্ট্রি (X-3), বিজনেস, স্টুডেন্ট, ট্রানজিট, এন্ট্রি (X-Misc), স্পাউস (X-1) ভিসা ও টিকেট বুকিং। হটলাইন: 01577464706',
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

export function updateMetaForService(service: VisaService | null) {
  if (typeof document === 'undefined') return;

  if (service) {
    const title = `${service.title} প্রসেসিং ও স্লট — Processing Hub`;
    const priceLabel = service.id === 'ticket-booking'
      ? `সার্ভিস চার্জ: ${service.price} (মূল টিকেট মূল্যের সাথে আলোচনা সাপেক্ষে)`
      : service.isSlotBooking
        ? `স্লট ফি: ${service.price} (৪,৫০০৳ থেকে শুরু, আইভ্যাক ফিসহ)`
        : `প্যাকেজ ফি: ${service.price} (${service.per.replace('/ ', '')})`;
    const description = `${service.description} ${priceLabel}। বাংলাদেশের সব ১৬টি আইভ্যাক সেন্টারে স্লট ও ফাইল প্রসেসিং সহায়তা। হটলাইন: 01577464706`;
    const image = service.image || DEFAULT_META.image;
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
    document.title = DEFAULT_META.title;
    setMetaTag('meta[name="description"]', 'content', DEFAULT_META.description);
    setMetaTag('meta[property="og:title"]', 'content', DEFAULT_META.title);
    setMetaTag('meta[property="og:description"]', 'content', DEFAULT_META.description);
    setMetaTag('meta[property="og:image"]', 'content', DEFAULT_META.image);
    setMetaTag('meta[property="og:url"]', 'content', DEFAULT_META.url);
    setMetaTag('meta[name="twitter:title"]', 'content', DEFAULT_META.title);
    setMetaTag('meta[name="twitter:description"]', 'content', DEFAULT_META.description);
    setMetaTag('meta[name="twitter:image"]', 'content', DEFAULT_META.image);
  }
}
