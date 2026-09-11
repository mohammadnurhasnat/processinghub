import { VisaService, SlotType, Destination } from '../types';

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
    description: 'ভারত ও আন্তর্জাতিক রুটের এয়ার টিকেট, ডাবল এন্ট্রি ট্রানজিট টিকেট এবং কনফার্মড রিটার্ন টিকেট বুকিং সেবা।',
    price: '৳১,০০০',
    per: '/ সার্ভিস চার্জ',
    waText: 'Hello Processing Hub, I want to book Air / Travel Ticket Booking service.',
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
    name: 'Kolkata (কলকাতা)',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=500&q=80',
    rotate: '-3deg'
  },
  {
    name: 'Delhi & Agra (দিল্লি ও আগ্রা)',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=500&q=80',
    rotate: '2deg'
  },
  {
    name: 'Kashmir Valley (কাশ্মীর)',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=500&q=80',
    rotate: '-1.5deg'
  },
  {
    name: 'Chennai (মেডিকেল হাব চেন্নাই)',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=500&q=80',
    rotate: '3deg'
  },
  {
    name: 'Darjeeling & Sikkim (দার্জিলিং)',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=500&q=80',
    rotate: '-2deg'
  }
];
