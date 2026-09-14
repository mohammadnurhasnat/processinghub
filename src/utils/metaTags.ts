import { VisaService } from '../types';

const DEFAULT_META = {
  title: 'Processing Hub — Indian Visa Processing Service',
  description: 'পেশাদার ইন্ডিয়ান ভিসা অ্যাপ্লিকেশন, আইভ্যাক (IVAC) অ্যাপয়েন্টমেন্ট স্লট বুকিং, ডকুমেন্টস ভেরিফিকেশন ও কনসালটেন্সি সহায়তা।',
  image: 'https://images.moondeveloper.com/attractions/2024/11/25/67446493a8fde.jpg',
  url: 'https://processinghub.com/',
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
    const title = `${service.title} — Processing Hub`;
    const description = `${service.description} সার্ভিস ফি: ${service.price}। আইভ্যাক ফাইল প্রসেসিং ও ডকুমেন্টস ভেরিফিকেশন সহায়তা।`;
    const image = service.image || DEFAULT_META.image;
    const url = `https://processinghub.com/#${service.id}`;

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
