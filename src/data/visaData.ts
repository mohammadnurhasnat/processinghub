import { VisaService, SlotType, Destination, Hospital } from '../types';

export const SLOT_TYPES: SlotType[] = [
  {
    id: 'tourist-slot',
    name: 'Tourist Visa Slot (ট্যুরিস্ট স্লট)',
    ivacFee: 1500,
    serviceCharge: 4000,
    totalFee: 5500
  },
  {
    id: 'medical-slot',
    name: 'Medical Visa Slot (মেডিকেল স্লট)',
    ivacFee: 1500,
    serviceCharge: 3500,
    totalFee: 5500
  },
  {
    id: 'business-slot',
    name: 'Business Visa Slot (বিজনেস স্লট)',
    ivacFee: 1500,
    serviceCharge: 4500,
    totalFee: 6000
  },
  {
    id: 'double-entry-slot',
    name: 'Double Entry Slot (ডাবল এন্ট্রি স্লট)',
    ivacFee: 1500,
    serviceCharge: 4500,
    totalFee: 6000
  }
];

export const VISA_SERVICES: VisaService[] = [
  {
    id: 'tourist-visa',
    title: 'Tourist Visa (ট্যুরিস্ট ভিসা)',
    category: 'ভ্রমণ ও পর্যটন',
    image: 'https://images.moondeveloper.com/attractions/2024/11/25/67446493a8fde.jpg',
    description: 'অনলাইন ফরম ফিলআপ, আইভ্যাক (IVAC) অ্যাপয়েন্টমেন্ট স্লট বুকিং, সঠিক ডকুমেন্টস যাচাই ও ফাইল প্রস্তুতি।',
    price: '৳১,৫০০',
    per: '/ প্রসেসিং চার্জ',
    waText: 'Hello Processing Hub, I want to book Indian Tourist Visa processing (Charge: ৳1,500).',
    documents: [
      'মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদ ও ২টি খালি পৃষ্ঠা থাকতে হবে)',
      'পূর্বের সকল পুরাতন পাসপোর্ট (যদি থাকে)',
      'পাসপোর্ট হারানো থাকলে জিডি কপি',
      'সদ্য তোলা ২×২ ইঞ্চি ল্যাব প্রিন্ট ছবি (সাদা ব্যাকগ্রাউন্ড, কোনো ফ্রেম বা বর্ডার ছাড়া)',
      'জাতীয় পরিচয়পত্র (NID) অথবা অনলাইন ডিজিটাল জন্মনিবন্ধন সনদ',
      'বর্তমান ঠিকানার সাম্প্রতিক বিদ্যুৎ/গ্যাস/পানি বিল কপি',
      'পেশাগত প্রমাণপত্র (চাকরিজীবীদের NOC ও অফিস আইডি / ব্যবসায়ীদের ট্রেড লাইসেন্স / শিক্ষার্থীদের আইডি কার্ড)',
      'আর্থিক সক্ষমতার প্রমাণ (সর্বনিম্ন ৩০,০০০ টাকা ব্যালেন্সসহ বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট অথবা ২০০$ এন্ডোর্সমেন্ট)'
    ]
  },
  {
    id: 'medical-visa',
    title: 'Medical Visa & Attendant (মেডিকেল ভিসা)',
    category: 'চিকিৎসা সেবা',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    description: 'ভারতের শীর্ষ হাসপাতাল থেকে ডক্টরস ইনভাইটেশন লেটার সংগ্রহ, জরুরি অ্যাপয়েন্টমেন্ট ও মেডিকেল অ্যাটেনডেন্ট ফাইল প্রসেসিং।',
    price: '৳৪,০০০',
    per: '/ সার্ভিস চার্জ',
    waText: 'Hello Processing Hub, I want to book Indian Medical Visa processing (Charge: ৳4,000).',
    documents: [
      'রোগী ও মেডিকেল অ্যাটেনডেন্টের মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদসহ)',
      'পূর্বের সকল পুরাতন পাসপোর্ট (যদি থাকে)',
      'পাসপোর্ট হারানো থাকলে জিডি কপি',
      'সদ্য তোলা ২×২ ইঞ্চি ছবি (সাদা ব্যাকগ্রাউন্ড)',
      'ভারতের স্বীকৃত হাসপাতাল থেকে প্রাপ্ত মূল ডক্টরস ইনভাইটেশন লেটার (রোগী ও অ্যাটেনডেন্টের নামসহ)',
      'বাংলাদেশের রেজিস্টার্ড চিকিৎসকের সাম্প্রতিক প্রেসক্রিপশন ও মেডিকেল টেস্ট রিপোর্ট',
      'রোগী ও অ্যাটেনডেন্টের জাতীয় পরিচয়পত্র (NID) বা জন্মনিবন্ধন সনদ',
      'বর্তমান ঠিকানার সাম্প্রতিক ইউটিলিটি বিলের কপি',
      'পেশাগত প্রমাণপত্র ও পর্যাপ্ত ব্যালেন্সসহ বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট',
      'অ্যাটেনডেন্টের সাথে রক্তের বা পারিবারিক সম্পর্কের প্রমাণপত্র'
    ]
  },
  {
    id: 'double-entry-visa',
    title: 'Double Entry Visa (ডাবল এন্ট্রি ভিসা)',
    category: 'ট্রানজিট ভিসা',
    image: 'https://dqliving.com/wp-content/uploads/2021/02/VFS-Global-scaled.jpg',
    description: 'ইউরোপের বিভিন্ন দেশের এম্বাসি ফেস করার জন্য প্রয়োজনীয় ডাবল-এন্ট্রি ইন্ডিয়ান ভিসা প্রসেসিংয়ে ফাইল প্রস্তুতি, ডকুমেন্ট চেকিং ও বিশেষজ্ঞ সহায়তা—সবকিছু একসাথে।',
    price: '৳৩,০০০',
    per: '/ সার্ভিস চার্জ',
    waText: 'Hello Processing Hub, I want to book Indian Double Entry Visa processing (Charge: ৳3,000).',
    documents: [
      'মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদ ও ২টি খালি পৃষ্ঠা থাকতে হবে)',
      'পূর্বের সকল পুরাতন পাসপোর্ট (যদি থাকে)',
      'পাসপোর্ট হারানো থাকলে জিডি কপি',
      'সদ্য তোলা ২×২ ইঞ্চি ল্যাব প্রিন্ট ছবি (সাদা ব্যাকগ্রাউন্ড, কোনো ফ্রেম বা বর্ডার ছাড়া)',
      'জাতীয় পরিচয়পত্র (NID) অথবা অনলাইন ডিজিটাল জন্মনিবন্ধন সনদ',
      'বর্তমান ঠিকানার সাম্প্রতিক বিদ্যুৎ/গ্যাস/পানি বিল কপি',
      'পেশাগত প্রমাণপত্র (চাকরিজীবীদের NOC ও অফিস আইডি / ব্যবসায়ীদের ট্রেড লাইসেন্স / শিক্ষার্থীদের আইডি কার্ড)',
      'আর্থিক সক্ষমতার প্রমাণ (সর্বনিম্ন ৩০,০০০ টাকা ব্যালেন্সসহ বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট অথবা ২০০$ এন্ডোর্সমেন্ট)',
      'পেশাগত প্রমাণপত্র (NOC/ট্রেড লাইসেন্স) ও বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট'
    ]
  },
  {
    id: 'business-visa',
    title: 'Business Visa (বিজনেস ভিসা)',
    category: 'ব্যবসা ও বাণিজ্য',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    description: 'ভারতীয় কোম্পানির ইনভাইটেশন লেটার ভেরিফিকেশন, ট্রেড লাইসেন্স ও ব্যাংক ডকুমেন্টস পেপারওয়ার্ক সহ কমপ্লিট ফাইল প্রসেসিং।',
    price: '৳৫,০০০',
    per: '/ সার্ভিস চার্জ',
    waText: 'Hello Processing Hub, I want to book Indian Business Visa processing (Charge: ৳5,000).',
    documents: [
      'মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদ ও ২টি খালি পৃষ্ঠা থাকতে হবে)',
      'পূর্বের সকল পুরাতন পাসপোর্ট (যদি থাকে)',
      'পাসপোর্ট হারানো থাকলে জিডি কপি',
      'সদ্য তোলা ২×২ ইঞ্চি ছবি ও জাতীয় পরিচয়পত্র (NID)',
      'ভারতীয় রেজিস্টার্ড প্রতিষ্ঠান থেকে ইস্যুকৃত মূল ইনভাইটেশন লেটার',
      'আবেদনকারীর প্রতিষ্ঠানের নিজস্ব প্যাডে স্পনসরশিপ ও কভারিং লেটার',
      'প্রতিষ্ঠানের হালনাগাদ ট্রেড লাইসেন্স ও এর নোটারাইজড ইংরেজি অনুবাদ',
      'আবেদনকারীর ভিজিটিং কার্ড ও অফিশিয়াল এমপ্লয়ি আইডি কার্ড',
      'প্রতিষ্ঠানের ও আবেদনকারীর বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট',
      'টিন (TIN), ভ্যাট সার্টিফিকেট বা আমদানি-রপ্তানি সনদ (প্রযোজ্য ক্ষেত্রে)'
    ]
  },
  {
    id: 'ticket-booking',
    title: 'Ticket Booking (টিকেট বুকিং)',
    category: 'ভ্রমণ ও যাতায়াত',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    description: 'দেশ ও বিদেশের সকল ধরনের এয়ার টিকিট, ওয়ান-ওয়ে, রাউন্ড ট্রিপ, ট্রানজিট টিকিট ও কনফার্মড রিটার্ন টিকিট সহ সমস্ত ধরনের টিকিট বুকিং সেবা প্রদান করা হয়।',
    price: '৳১,৫০০',
    per: '/ সার্ভিস চার্জ',
    waText: 'Hello Processing Hub, I want to book Air / Travel Ticket Booking service (Charge: ৳1,500).',
    documents: [
      'ভ্রমণকারীর মূল পাসপোর্টের তথ্য পাতার পরিষ্কার কপি',
      'ভ্রমণের সম্ভাব্য তারিখ ও যাত্রার সময়সূচি',
      'যাত্রা শুরু ও গন্তব্য শহরের নাম (ওয়ান ওয়ে বা রাউন্ড ট্রিপ)',
      'ভিসা কপি (যদি ইতিমধ্যে ভিসা স্ট্যাম্পিং হয়ে থাকে)',
      'যাত্রীর যোগাযোগের ফোন নম্বর ও ইমেইল ঠিকানা'
    ]
  },
  {
    id: 'visa-slot-booking',
    title: 'Visa Slot Booking (ভিসার স্লট বুকিং)',
    category: 'আইভ্যাক অ্যাপয়েন্টমেন্ট',
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=800&q=80',
    description: 'আইভ্যাক (IVAC) সেন্টারে নির্ধারিত ফি ১৫০০ টাকার সাথে ক্যাটাগরি অনুযায়ী মেডিকেল, বিজনেস, ট্যুরিস্ট ও ডাবল এন্ট্রি স্লট বুকিং।',
    price: '৳১,৫০০+',
    per: '/ আইভ্যাক ফি + চার্জ',
    waText: 'Hello Processing Hub, I want to book an Indian Visa Appointment Slot.',
    isSlotBooking: true,
    documents: [
      'আবেদনকারীর মূল পাসপোর্ট কপি (কমপক্ষে ৬ মাসের মেয়াদসহ)',
      'অনলাইন ভিসা অ্যাপ্লিকেশন ফর্মের ওয়েব ফাইল নম্বর (Web File Number)',
      'পছন্দসই আইভ্যাক সেন্টার (ঢাকা/চট্টগ্রাম/রাজশাহী/সিলেট/খুলনা ইত্যাদি)',
      'স্লটের ক্যাটাগরি নির্বাচন (ট্যুরিস্ট/মেডিকেল/বিজনেস/ডাবল এন্ট্রি)',
      'জরুরি অ্যাপয়েন্টমেন্টের সম্ভাব্য সময় ও তারিখ'
    ]
  }
];

export const DESTINATIONS: Destination[] = [
  {
    id: 'kolkata',
    name: 'Kolkata (কলকাতা)',
    location: 'West Bengal, India',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80',
    rotate: '-2.5deg',
    attractions: ['ভিক্টোরিয়া মেমোরিয়াল', 'হাওড়া ব্রিজ', 'দক্ষিণেশ্বর ও বেলুড় মঠ', 'নিউ মার্কেট শপিং', 'সায়েন্স সিটি'],
    bestTime: 'অক্টোবর থেকে মার্চ (শীত ও উৎসবের সেরা সময়)',
    description: 'বাংলাদেশি পর্যটক ও চিকিৎসা গ্রহণকারীদের সবচেয়ে সহজ ও জনপ্রিয় প্রবেশদ্বার। ঐতিহাসিক স্থাপত্য, কেনাকাটা, ঐতিহ্যবাহী বাঙালি খাবার এবং উন্নত হাসপাতালগুলোর জন্য সুপরিচিত।'
  },
  {
    id: 'delhi-agra',
    name: 'Delhi & Agra (দিল্লি ও আগ্রা)',
    location: 'Delhi NCR & Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
    rotate: '2deg',
    attractions: ['তাজমহল (আগ্রা)', 'লালকেল্লা ও কুতুব মিনার', 'ইন্ডিয়া গেট', 'হুমায়ুনের সমাধি', 'চাঁদনি চক বাজার'],
    bestTime: 'নভেম্বর থেকে ফেব্রুয়ারি',
    description: 'মুঘল ঐতিহ্যের প্রতীক বিশ্বের সপ্তম আশ্চর্যের একটি তাজমহল এবং ভারতের রাজধানী দিল্লির ঐতিহ্যবাহী প্রাচীন দুর্গ ও দর্শনীয় স্থান।'
  },
  {
    id: 'kashmir',
    name: 'Kashmir Valley (কাশ্মীর)',
    location: 'Jammu & Kashmir, India',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80',
    rotate: '-1.5deg',
    attractions: ['ডাল লেক ও হাউসবোট', 'গুলমার্গ গন্ডোলা ক্যাবল কার', 'পেহেলগাম ভ্যালি', 'সোনামার্গ গ্লেসিয়ার', 'টিউলিপ গার্ডেন'],
    bestTime: 'মার্চ থেকে অক্টোবর (গ্রীষ্ম ও বরফের সিজন)',
    description: 'ভূস্বর্গ নামে খ্যাত কাশ্মীর উপত্যকা। তুষারাবৃত পর্বতমালা, পাইন বন, ডাল লেকের শিকারা ভ্রমণ এবং শান্ত সবুজ প্রকৃতির অনন্য অভিজ্ঞতা।'
  },
  {
    id: 'chennai',
    name: 'Chennai (মেডিকেল হাব চেন্নাই)',
    location: 'Tamil Nadu, South India',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    rotate: '2.5deg',
    attractions: ['মেরিনা বিচ', 'কপালীশ্বর মন্দির', 'সান থম ব্যাসিলিকা', 'মায়াপুরের ঐতিহ্যবাহী বাজার', 'মমল্লপুরম শোর টেম্পল'],
    bestTime: 'নভেম্বর থেকে ফেব্রুয়ারি',
    description: 'দক্ষিণ ভারতের প্রধান চিকিৎসা ও কালচারাল রাজধানী। উন্নত মেডিকেল কেয়ার, আন্তর্জাতিক মানের হাসপাতাল এবং সমৃদ্ধ দ্রাবিড় ঐতিহ্যের সংমিশ্রণ।'
  },
  {
    id: 'darjeeling-sikkim',
    name: 'Darjeeling & Sikkim (দার্জিলিং)',
    location: 'West Bengal & Sikkim',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
    rotate: '-2deg',
    attractions: ['কাঞ্চনজঙ্ঘা সানরাইজ (টাইগার হিল)', 'দার্জিলিং হিমালয়ান টয় ট্রেন', 'চা বাগান ও রক গার্ডেন', 'গ্যাংটক ও নাথু লা পাস', 'সোমগো লেক'],
    bestTime: 'মার্চ থেকে মে এবং অক্টোবর থেকে ডিসেম্বর',
    description: 'পাহাড়ের রানী দার্জিলিং ও মেঘের রাজ্য সিকিম। বরফে ঢাকা কাঞ্চনজঙ্ঘার দিগন্তজোড়া রূপ, সবুজ চা বাগান ও মনোরম পাহাড়ি আবহাওয়া।'
  }
];

export const HOSPITALS: Hospital[] = [
  {
    id: 'medanta-gurugram',
    name: 'Medanta – The Medicity',
    location: 'Gurugram, Delhi-NCR',
    city: 'দিল্লি / গুরুগ্রাম',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
    rotate: '-2deg',
    specialties: [
      '❤️ হৃদরোগ ও হার্ট সার্জারি',
      '🎗️ ক্যান্সার (Oncology)',
      '🧠 নিউরোলজি ও নিউরোসার্জারি',
      '🫀 কিডনি/লিভার ও অর্গান ট্রান্সপ্লান্ট',
      '🦴 Orthopedics & Joint Replacement',
      'Gastroenterology & GI Surgery'
    ],
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Organ Transplant', 'Orthopedics', 'Gastroenterology'],
    highlights: [
      'বিশ্বমানের রোবোটিক সার্জারি ও কার্ডিয়াক কেয়ার',
      'লিভার ও কিডনি প্রতিস্থাপনে ভারতের অন্যতম শীর্ষ প্রতিষ্ঠান',
      'আন্তর্জাতিক রোগীদের জন্য ডেডিকেটেড হেল্পডেস্ক'
    ],
    description: 'ভারতের সর্বাধুনিক মাল্টি-সুপারস্পেশালিটি হাসপাতালগুলোর একটি, যেখানে ডাঃ নরেশ ত্রেহানের নেতৃত্বে বিশ্বমানের হৃদরোগ, নিউরো ও অঙ্গ প্রতিস্থাপন চিকিৎসা প্রদান করা হয়।',
    ayushSupport: true
  },
  {
    id: 'desun-kolkata',
    name: 'Desun Hospital & Heart Institute',
    location: 'EM Bypass, Kolkata',
    city: 'কলকাতা',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    rotate: '1.5deg',
    specialties: [
      '❤️ হৃদরোগ ও হার্ট সার্জারি',
      '🧠 নিউরোলজি ও ব্রেন ট্রিটমেন্ট',
      '🎗️ ক্যান্সার কেয়ার',
      '🫁 Critical Care & ICU Support',
      '🦴 Orthopedics & Trauma',
      'General & Multi-speciality Treatment'
    ],
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Critical Care', 'Orthopedics', 'General Surgery'],
    highlights: [
      'কলকাতায় বাংলাদেশিদের জন্য দ্রুত ও সহজ যাতায়াত ব্যবস্থা',
      '২৪/৭ অ্যাডভান্সড কার্ডিয়াক ইমার্জেন্সি ও ট্রমা সেন্টার',
      'সুলভ ও নির্ভরযোগ্য প্যাকেজে আধুনিক চিকিৎসা'
    ],
    description: 'কলকাতার অন্যতম প্রধান কার্ডিয়াক ও মাল্টি-স্পেশালিটি হাসপাতাল। জরুরি হার্ট অ্যাটাক ও ক্রিটিক্যাল কেয়ার চিকিৎসায় অত্যন্ত সুপরিচিত।',
    ayushSupport: true
  },
  {
    id: 'peerless-kolkata',
    name: 'Peerless Hospital',
    location: 'Panchasayar, EM Bypass, Kolkata',
    city: 'কলকাতা',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    rotate: '-1.5deg',
    specialties: [
      '❤️ Cardiology',
      '🎗️ Oncology',
      '🧠 Neurology & Neurosurgery',
      '🦴 Orthopedics & Spine',
      'Gastroenterology',
      'Nephrology & Urology',
      'General Surgery'
    ],
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Gastroenterology', 'Nephrology'],
    highlights: [
      'বাংলাদেশি রোগীদের জন্য বিশেষ সহায়তা সেল',
      'অভিজ্ঞ ক্লিনিক্যাল টিম ও আধুনিক ডায়াগনস্টিক সুবিধা',
      'সাশ্রয়ী খরচে সমন্বিত চিকিৎসা ব্যবস্থা'
    ],
    description: 'কলকাতার ইএম বাইপাসের পার্শ্ববর্তী অন্যতম দীর্ঘদিনের আস্থাশীল হাসপাতাল। গ্যাস্ট্রোএন্টারোলজি, কার্ডিওলজি ও অর্থোপেডিকসে নিয়মিত হাজারো বাংলাদেশি সেবা নেন।',
    ayushSupport: true
  },
  {
    id: 'apollo-hospitals',
    name: 'Apollo Hospitals, India',
    location: 'Chennai / Delhi / Kolkata / Hyderabad',
    city: 'চেন্নাই / কলকাতা / দিল্লি',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80',
    rotate: '2deg',
    specialties: [
      '❤️ Cardiology & Heart Surgery',
      '🎗️ Cancer Treatment (Proton Therapy)',
      '🧠 Neurology & Neurosurgery',
      '🫀 Kidney/Liver Transplant',
      '🦴 Orthopedics & Joint Replacement',
      'Gastroenterology & Hepatology',
      'Urology & Nephrology',
      'Pediatrics & Gynecology'
    ],
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Organ Transplant', 'Orthopedics', 'Gastroenterology', 'Urology', 'Pediatrics'],
    highlights: [
      'প্রোটন বিম থেরাপিসহ এশিয়ার সর্বাধুনিক ক্যান্সার কেয়ার',
      'অর্গান ট্রান্সপ্লান্টে বিশ্বখ্যাত আন্তর্জাতিক নেটওয়ার্ক',
      'JCI স্বীকৃত আন্তর্জাতিক মানের প্রিমিয়াম হসপিটাল'
    ],
    description: 'এশিয়ার বৃহত্তম এবং সবচেয়ে নির্ভরযোগ্য স্বাস্থ্যসেবা নেটওয়ার্ক। জটিল হার্ট সার্জারি, রোবোটিক ক্যান্সার চিকিৎসা এবং লিভার ট্রান্সপ্লান্টে শীর্ষস্থানীয়।',
    ayushSupport: true
  },
  {
    id: 'fortis-hospital',
    name: 'Fortis Hospital',
    location: 'Kolkata, Delhi-NCR, Bengaluru',
    city: 'কলকাতা / দিল্লি / ব্যাঙ্গালোর',
    image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=600&q=80',
    rotate: '-2.5deg',
    specialties: [
      '❤️ Cardiology & Cardiac Surgery',
      '🧠 Neurology & Neurosurgery',
      '🎗️ Oncology (ক্যান্সার কেয়ার)',
      '🫀 Kidney/Liver Transplant',
      '🦴 Orthopedics & Spine Surgery',
      'Gastroenterology',
      'Nephrology & Dialysis'
    ],
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Organ Transplant', 'Orthopedics', 'Gastroenterology', 'Nephrology'],
    highlights: [
      'অত্যাধুনিক কার্ডিয়াক ও নিউরো কেয়ার পরিকাঠামো',
      'আন্তর্জাতিক রোগী সহায়তা ও দ্রুত ভিসা ইনভাইটেশন টিম',
      'রোবোটিক জয়েন্ট রিপ্লেসমেন্ট প্রযুক্তি'
    ],
    description: 'ভারতের অন্যতম অগ্রণী মাল্টি-স্পেশালিটি হাসপাতাল চেইন। কিডনি ট্রান্সপ্লান্ট, হার্ট ও নিউরো সার্জারিতে সর্বোচ্চ সাফল্যের হার রয়েছে।',
    ayushSupport: true
  },
  {
    id: 'yashoda-hospitals',
    name: 'Yashoda Hospitals',
    location: 'Somajiguda, Secunderabad, Hyderabad',
    city: 'হায়দ্রাবাদ',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80',
    rotate: '1.5deg',
    specialties: [
      '🎗️ ক্যান্সার (Medical, Surgical & Radiation Oncology)',
      '❤️ হৃদরোগ ও ভাস্কুলার সার্জারি',
      '🧠 নিউরোলজি ও নিউরোসার্জারি',
      '🫀 কিডনি/লিভার ট্রান্সপ্লান্ট',
      'Gastroenterology & Hepatology',
      'Orthopedics & Joint Reconstruction',
      'Urology'
    ],
    departments: ['Oncology', 'Cardiology', 'Neurology', 'Organ Transplant', 'Gastroenterology', 'Orthopedics', 'Urology'],
    highlights: [
      'ভারতে ৩টি ডেডিকেটেড ক্যান্সার ইনস্টিটিউট ও দ্রুত চিকিৎসা',
      'কম খরচে উন্নত কোয়ালিটির জটিল অপারেশন',
      'হায়দ্রাবাদে বাংলাদেশিদের জন্য বিশেষ হেল্পলাইন'
    ],
    description: 'হায়দ্রাবাদের অন্যতম বৃহত্তম হাসপাতাল গোষ্ঠী। বিশেষ করে অ্যাডভান্সড ক্যান্সার থেরাপি, ইন্টারভেনশনাল পালমোনোলজি ও ট্রান্সপ্লান্টেশনে আন্তর্জাতিক মানের।',
    ayushSupport: true
  },
  {
    id: 'mgm-healthcare',
    name: 'MGM Healthcare',
    location: 'Nelson Manickam Road, Aminjikarai, Chennai',
    city: 'চেন্নাই',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80',
    rotate: '-2deg',
    specialties: [
      '❤️ Cardiology & Cardiac Surgery',
      '🧠 Neurology & Neurosurgery',
      '🎗️ Oncology',
      '🫀 Organ Transplant (Heart, Lung, Liver, Kidney)',
      'Gastroenterology',
      'Orthopedics',
      'Women & Child Care'
    ],
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Organ Transplant', 'Gastroenterology', 'Orthopedics', 'Women Care'],
    highlights: [
      'হার্ট ও ফুসফুস (Lung) ট্রান্সপ্লান্টে এশিয়ার অন্যতম সেরা টিম',
      'ভারতে প্রথম ইউএসজিবিসি LEED প্লাটিনাম সার্টিফাইড গ্রিন হাসপাতাল',
      'অত্যাধুনিক মডুলার আইসিইউ ও ওটি সুবিধা'
    ],
    description: 'চেন্নাইয়ের অত্যাধুনিক বিশ্বমানের সুপার স্পেশালিটি হাসপাতাল। ডাঃ কে আর বালাকৃষ্ণানের নেতৃত্বে হার্ট ট্রান্সপ্লান্টেশনে অসাধারণ খ্যাতির অধিকারী।',
    ayushSupport: true
  },
  {
    id: 'miot-international',
    name: 'MIOT International',
    location: 'Manapakkam, Chennai',
    city: 'চেন্নাই',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
    rotate: '2deg',
    specialties: [
      '🦴 Orthopedics & Joint Replacement (Knee/Hip)',
      '🫀 Organ Transplant',
      '❤️ Cardiac Sciences',
      '🎗️ Oncology (ক্যান্সার কেয়ার)',
      '🧠 Neurology & Spine',
      'Gastroenterology & Liver Care',
      'Trauma & Critical Care'
    ],
    departments: ['Orthopedics', 'Organ Transplant', 'Cardiology', 'Oncology', 'Neurology', 'Gastroenterology', 'Critical Care'],
    highlights: [
      'অর্থোপেডিকস ও জয়েন্ট রিপ্লেসমেন্টে ভারতের শীর্ষ কেন্দ্র',
      'শূন্য-সংক্রমণ (Zero Infection) যুক্ত ওটি পরিবেশ',
      'বাংলাদেশি রোগীদের জন্য বিশেষ লজিস্টিক সাপোর্ট'
    ],
    description: 'চেন্নাইয়ের বিখ্যাত প্রিমিয়ার ইনস্টিটিউট। বিশেষত অর্থোপেডিক সার্জারি, জটিল জয়েন্ট রিপ্লেসমেন্ট এবং স্পোর্টস মেডিসিনে বিশ্বব্যাপী সুনামধারী।',
    ayushSupport: true
  },
  {
    id: 'narayana-superspeciality',
    name: 'Narayana Superspeciality Hospital',
    location: 'Andul Road, Howrah / Kolkata',
    city: 'কলকাতা / হাওড়া',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
    rotate: '-1.5deg',
    specialties: [
      '❤️ Cardiology & Heart Surgery',
      '🎗️ Cancer Care (Comprehensive Oncology)',
      '🧠 Neurology & Neurosurgery',
      'Nephrology & Dialysis',
      'Gastroenterology',
      'Orthopedics',
      'General & Multi-speciality Treatment'
    ],
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Nephrology', 'Gastroenterology', 'Orthopedics'],
    highlights: [
      'ডাঃ দেবী শেঠির নারায়ণা হেলথ চেইনের অন্যতম ফ্ল্যাগশিপ হসপিটাল',
      'পূর্ব ভারতের অন্যতম বড় ক্যান্সার ও কার্ডিয়াক সেন্টার',
      'বাংলাদেশি রোগীদের জন্য সবচেয়ে সুবিধাজনক অবস্থান'
    ],
    description: 'হাওড়া ও কলকাতায় অবস্থিত ডাঃ দেবী প্রসাদ শেঠির নারায়ণা গ্রুপের নির্ভরযোগ্য সুপার স্পেশালিটি সেন্টার। সাধ্যের মধ্যে উন্নত চিকিৎসা নিশ্চিত করে।',
    ayushSupport: true
  },
  {
    id: 'rtiics-kolkata',
    name: 'Rabindranath Tagore Hospital (RTIICS)',
    location: 'Mukundapur, EM Bypass, Kolkata',
    city: 'কলকাতা',
    image: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=600&q=80',
    rotate: '2.5deg',
    specialties: [
      '❤️ Cardiology ও Cardiac Surgery',
      'Interventional Cardiology & Cath Lab',
      'Pediatric Cardiology (শিশু হার্ট সার্জারি)',
      'Heart Transplant & Advanced HF Clinic',
      'Electrophysiology & Pacemaker',
      'Critical Care Medicine'
    ],
    departments: ['Cardiology', 'Pediatric Cardiology', 'Organ Transplant', 'Critical Care', 'Cardiac Surgery'],
    highlights: [
      'পূর্ব ভারতে শিশুদের এবং বয়স্কদের হার্ট অপারেশনে ১ নম্বর কেন্দ্র',
      'হাজার হাজার সফল বাইপাস ও ভালভ রিপ্লেসমেন্ট সার্জারি',
      'বাংলাদেশ থেকে প্রতিদিন সবচেয়ে বেশি রোগী ভ্রমণ করেন'
    ],
    description: 'আর এন টেগোর (RTIICS) কলকাতার অন্যতম শীর্ষ কার্ডিয়াক সেন্টার। হার্ট ফেইলিউর, পেডিয়াট্রিক কার্ডিওলজি ও জটিল কার্ডিয়াক অপারেশনে অত্যন্ত জনপ্রিয়।',
    ayushSupport: true
  },
  {
    id: 'ganga-ram-hospital',
    name: 'Sir Ganga Ram Hospital',
    location: 'Rajinder Nagar, New Delhi',
    city: 'নতুন দিল্লি',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    rotate: '-2deg',
    specialties: [
      '❤️ Cardiology',
      '🧠 Neurology & Neurosurgery',
      '🎗️ Oncology',
      'Gastroenterology & Hepatobiliary',
      'Nephrology & Renal Transplant',
      'Orthopedics',
      'General & Advanced Minimal Access Surgery'
    ],
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Gastroenterology', 'Nephrology', 'Orthopedics', 'General Surgery'],
    highlights: [
      'ভারতের ঐতিহাসিক ও অন্যতম বিশ্বস্ত মাল্টি-স্পেশালিটি হাসপাতাল',
      'ল্যাপারোস্কোপিক ও রোবোটিক সার্জারিতে ভারতের প্রথম দিকের পথপ্রদর্শক',
      'প্রতিটি বিভাগের প্রবীণ ও বিশিষ্ট প্রফেসর চিকিৎসকমণ্ডলী'
    ],
    description: 'নতুন দিল্লির ঐতিহাসিক এবং অন্যতম শীর্ষস্থানীয় টারশিয়ারি কেয়ার হাসপাতাল। জটিল রোগ নির্ণয় ও নিখুঁত চিকিৎসায় সমগ্র দক্ষিণ এশিয়ায় সুপরিচিত।',
    ayushSupport: true
  },
  {
    id: 'manipal-hospital',
    name: 'Manipal Hospital',
    location: 'Old Airport Road, Bengaluru / Kolkata / Delhi',
    city: 'ব্যাঙ্গালোর / কলকাতা / দিল্লি',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80',
    rotate: '1.5deg',
    specialties: [
      '❤️ Cardiology',
      '🎗️ Oncology (ক্যান্সার সেন্টার)',
      '🧠 Neurology & Neurosurgery',
      '🫀 Organ Transplant',
      'Gastroenterology',
      'Orthopedics',
      'Nephrology',
      'Pediatrics'
    ],
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Organ Transplant', 'Gastroenterology', 'Orthopedics', 'Nephrology', 'Pediatrics'],
    highlights: [
      '৭০ বছরেরও বেশি অভিজ্ঞতাসম্পন্ন ভারতের শীর্ষ হেলথকেয়ার গ্রুপ',
      'জটিল ব্রেন ও স্পাইন সার্জারিতে উন্নত নিউরো-নেভিগেশন সিস্টেম',
      'ক্যান্সার চিকিৎসায় ব্যাপক সাফল্য ও প্রিমিয়াম কেয়ার'
    ],
    description: 'ভারতের শীর্ষস্থানীয় মাল্টি-স্পেশালিটি হাসপাতাল নেটওয়ার্ক। ব্যাঙ্গালোর, দিল্লি ও কলকাতায় রোগীদের জন্য সর্বোচ্চ আধুনিক চিকিৎসা সেবা প্রদান করে।',
    ayushSupport: true
  },
  {
    id: 'artemis-hospitals',
    name: 'Artemis Hospitals',
    location: 'Sector 51, Gurugram, Delhi-NCR',
    city: 'গুরুগ্রাম / দিল্লি-এনসিআর',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    rotate: '-2.5deg',
    specialties: [
      '❤️ Heart & Cardiac Surgery',
      '🎗️ Cancer Care (Comprehensive Institute)',
      '🧠 Neurology & Neurosurgery',
      '🫀 Liver/Kidney/Bone Marrow Transplant',
      '🦴 Orthopedics',
      'Gastro Sciences',
      'Women & Child Care'
    ],
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Organ Transplant', 'Orthopedics', 'Gastroenterology', 'Women Care'],
    highlights: [
      'দিল্লি-এনসিআরের প্রথম JCI ও NABH অনুমোদিত হাসপাতাল',
      'বোন ম্যারো এবং অর্গান ট্রান্সপ্লান্টে বিশ্বস্ত ফলাফল',
      'রোগীবান্ধব আধুনিক আর্কিটেকচার ও উন্নত পরিবেশ'
    ],
    description: 'দিল্লি-এনসিআরের অন্যতম প্রধান অত্যাধুনিক টারশিয়ারি কেয়ার হাসপাতাল। বোন ম্যারো ট্রান্সপ্লান্ট, হার্ট ও ক্যান্সার চিকিৎসায় প্রখ্যাত।',
    ayushSupport: true
  },
  {
    id: 'max-healthcare',
    name: 'Max Super Speciality Hospital',
    location: 'Saket, New Delhi & NCR',
    city: 'নতুন দিল্লি / সাকেত',
    image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=600&q=80',
    rotate: '2deg',
    specialties: [
      '🎗️ Cancer Care (Max Institute of Cancer Care)',
      '❤️ Cardiology & Cardiac Surgery',
      '🧠 Neurology & Neurosurgery',
      '🫀 Kidney/Liver Transplant',
      'Gastroenterology',
      'Orthopedics & Joint Replacement',
      'Nephrology'
    ],
    departments: ['Oncology', 'Cardiology', 'Neurology', 'Organ Transplant', 'Gastroenterology', 'Orthopedics', 'Nephrology'],
    highlights: [
      'আন্তর্জাতিক রোগী সেবায় ভারতের শীর্ষ হাসপাতালের তালিকায় স্থান',
      'রোবোটিক হার্ট ও অনকোলজি সার্জারি ইউনিট',
      'দ্রুত ভিসা সাপোর্ট ও সার্বক্ষণিক সাহায্য'
    ],
    description: 'দিল্লি সাকেতের ম্যাক্স সুপার স্পেশালিটি অত্যন্ত উচ্চমানের চিকিৎসা প্রযুক্তি ও স্বনামধন্য ডাক্তারদের সমন্বয়ে গঠিত অন্যতম শীর্ষ হাসপাতাল।',
    ayushSupport: true
  },
  {
    id: 'aiims-delhi',
    name: 'AIIMS – All India Institute of Medical Sciences',
    location: 'Ansari Nagar, New Delhi',
    city: 'নতুন দিল্লি',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80',
    rotate: '-1.5deg',
    specialties: [
      '🧠 Neurology & Neurosurgery',
      '❤️ Cardiology & Cardiac Surgery',
      '🎗️ Oncology (Dr. BRA IRCH)',
      '🫀 Organ Transplant',
      'Gastroenterology',
      'Nephrology',
      'Orthopedics',
      'Pediatrics',
      'Rare & Complex Diseases'
    ],
    departments: ['Neurology', 'Cardiology', 'Oncology', 'Organ Transplant', 'Gastroenterology', 'Nephrology', 'Orthopedics', 'Pediatrics'],
    highlights: [
      'ভারতের ১ নম্বর জাতীয় চিকিৎসা ও গবেষণা প্রতিষ্ঠান',
      'সবচেয়ে জটিল ও বিরল রোগের নির্ভুল চিকিৎসা ও রেফারাল কেন্দ্র',
      'দেশের শীর্ষ বিশেষজ্ঞ প্রবীণ প্রফেসর ও সার্জনমণ্ডলী'
    ],
    description: 'ভারতের সর্বোচ্চ মর্যাদাপূর্ণ জাতীয় মেডিকেল ইনস্টিটিউট। যেকোনো জটিল ও দীর্ঘমেয়াদী জটিল রোগ চিকিৎসায় সমগ্র ভারতের প্রধান রেফারেল কেন্দ্র।',
    ayushSupport: true
  }
];

