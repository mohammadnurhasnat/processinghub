export interface IvacCenterGuide {
  id: string;
  nameBn: string;
  nameEn: string;
  addressBn: string;
  addressEn: string;
}

export const CONFIG = {
  brandName: 'Processing Hub',
  domain: 'processinghub.fun',
  websiteUrl: 'https://processinghub.fun',
  facebookUrl: 'https://facebook.com/processinghubbd',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Processing+Hub+Jamuna+Future+Park+Kuril+Dhaka',
  mapsPlaceUrl: 'https://www.google.com/maps/search/?api=1&query=Processing+Hub+Jamuna+Future+Park+Kuril+Dhaka+1229',
  mapsDirectionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=23.8134,90.4243',
  googleReviewUrl: 'https://www.google.com/maps/search/?api=1&query=Processing+Hub+Kuril+Baridhara+Dhaka',
  phone: '8801577464706',
  phoneDisplay: '01577464706',
  email: 'support@processinghub.fun',
  address: 'ঢাকা, বাংলাদেশ',
  fullAddress: 'যমুনা ফিউচার পার্ক সংলগ্ন, কুড়িল চৌরাস্তা, বারিধারা, ঢাকা-১২২৯, বাংলাদেশ',
  fullAddressEn: 'Adjacent to Jamuna Future Park, Kuril Chowrasta, Baridhara, Dhaka-1229, Bangladesh',
  geo: {
    lat: 23.8134,
    lng: 90.4243
  },
  fallbackImage: '/images/services/tourist-visa.jpg',
  chromeExtension: {
    name: 'Tracker - Indian Visa Autofill',
    url: 'https://chromewebstore.google.com/detail/fbofnjpmmimniffobcfpnfiejgkboiga?utm_source=item-share-cp',
    browser: 'Google Chrome'
  }
};

export const IVAC_CENTERS = [
  'ঢাকা (যমুনা ফিউচার পার্ক)',
  'চট্টগ্রাম',
  'খুলনা',
  'সিলেট',
  'রাজশাহী'
];

export const IVAC_CENTERS_EN = [
  'Dhaka (Jamuna Future Park)',
  'Chattogram',
  'Khulna',
  'Sylhet',
  'Rajshahi'
];

export const ACTIVE_IVAC_CENTER_GUIDES: IvacCenterGuide[] = [
  {
    id: 'dhaka-jfp',
    nameBn: 'ঢাকা — যমুনা ফিউচার পার্ক (JFP)',
    nameEn: 'Dhaka — Jamuna Future Park (JFP)',
    addressBn: 'লেভেল জি/১ ও সি-ওয়ান (আন্ডারগ্রাউন্ড ফ্লোর), যমুনা ফিউচার পার্ক, প্রগতি সরণি, কুড়িল, বারিধারা, ঢাকা-১২২৯',
    addressEn: 'Level G/1 & C-1, Jamuna Future Park, Progoti Sarani, Kuril, Baridhara, Dhaka-1229'
  },
  {
    id: 'chattogram',
    nameBn: 'চট্টগ্রাম আইভ্যাক (IVAC Chattogram)',
    nameEn: 'IVAC Chattogram',
    addressBn: '২১১১, জাকির হোসেন রোড, জিইসি মোড় সংলগ্ন, খুলশী, চট্টগ্রাম-৪০০০',
    addressEn: '2111 Zakir Hossain Road, near GEC Circle, Khulshi, Chattogram-4000'
  },
  {
    id: 'sylhet',
    nameBn: 'সিলেট আইভ্যাক (IVAC Sylhet)',
    nameEn: 'IVAC Sylhet',
    addressBn: 'নিরালা ভিলা / মেন্দিবাগ বাগিচা এলাকা, উপশহর রোড সংলগ্ন, সিলেট-৩১০০',
    addressEn: 'Mendibag / Upashahar Area, Sylhet-3100'
  },
  {
    id: 'khulna',
    nameBn: 'খুলনা আইভ্যাক (IVAC Khulna)',
    nameEn: 'IVAC Khulna',
    addressBn: '৪৮, শামসুর রহমান রোড (শান্তিধাম মোড় সংলগ্ন), খুলনা-৯১০০',
    addressEn: '48 Shamsur Rahman Road, Shantidham More, Khulna-9100'
  },
  {
    id: 'rajshahi',
    nameBn: 'রাজশাহী আইভ্যাক (IVAC Rajshahi)',
    nameEn: 'IVAC Rajshahi',
    addressBn: 'মোরশেদ মঞ্জিল, হাউজিং এস্টেট, সপুরা, বোয়ালিয়া, রাজশাহী-৬২০৩',
    addressEn: 'Morshed Manzil, Housing Estate, Sopura, Boalia, Rajshahi-6203'
  }
];

export const CLOSED_IVAC_CENTERS_BN = [
  'রংপুর',
  'ময়মনসিংহ',
  'বরিশাল',
  'কুমিল্লা',
  'নোয়াখালী',
  'ব্রাহ্মণবাড়িয়া',
  'ঠাকুরগাঁও',
  'বগুড়া',
  'কুষ্টিয়া',
  'যশোর',
  'সাতক্ষীরা'
];

export const CLOSED_IVAC_CENTERS_EN = [
  'Rangpur',
  'Mymensingh',
  'Barishal',
  'Cumilla',
  'Noakhali',
  'Brahmanbaria',
  'Thakurgaon',
  'Bogura',
  'Kushtia',
  'Jashore',
  'Satkhira'
];

export const getIvacCenters = (language: 'bn' | 'en'): string[] =>
  language === 'bn' ? IVAC_CENTERS : IVAC_CENTERS_EN;

export const getPhoneDisplay = (language: 'bn' | 'en'): string =>
  language === 'bn' ? '০১৫৭৭৪৬৪৭০৬' : CONFIG.phoneDisplay;
