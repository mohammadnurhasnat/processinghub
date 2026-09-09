import { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  X, 
  FileText, 
  Send, 
  ShieldCheck, 
  ChevronRight, 
  CalendarClock, 
  Ticket, 
  Plane, 
  Stethoscope, 
  Briefcase, 
  Layers, 
  Compass,
  ArrowRight
} from 'lucide-react';

interface VisaService {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  price: string;
  per: string;
  waText: string;
  documents: string[];
  isSlotBooking?: boolean;
}

interface SlotType {
  id: string;
  name: string;
  ivacFee: number;
  serviceCharge: number;
  totalFee: number;
}

const SLOT_TYPES: SlotType[] = [
  {
    id: 'tourist-slot',
    name: 'Tourist Visa Slot (ট্যুরিস্ট স্লট)',
    ivacFee: 1500,
    serviceCharge: 5000,
    totalFee: 6500
  },
  {
    id: 'medical-slot',
    name: 'Medical Visa Slot (মেডিকেল স্লট)',
    ivacFee: 1500,
    serviceCharge: 4000,
    totalFee: 5500
  },
  {
    id: 'business-slot',
    name: 'Business Visa Slot (বিজনেস স্লট)',
    ivacFee: 1500,
    serviceCharge: 4000,
    totalFee: 5500
  },
  {
    id: 'double-entry-slot',
    name: 'Double Entry Slot (ডাবল এন্ট্রি স্লট)',
    ivacFee: 1500,
    serviceCharge: 4500,
    totalFee: 6000
  }
];

const VISA_SERVICES: VisaService[] = [
  {
    id: 'tourist-visa',
    title: 'Tourist Visa (ট্যুরিস্ট ভিসা)',
    category: 'ভ্রমণ ও পর্যটন',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    description: 'অনলাইন ফরম ফিলআপ, আইভ্যাক (IVAC) অ্যাপয়েন্টমেন্ট স্লট বুকিং, সঠিক ডকুমেন্টস যাচাই ও দ্রুত ফাইল প্রস্তুতি।',
    price: '৳১,৫০০',
    per: '/ সার্ভিস চার্জ',
    waText: 'Hello Processing Hub, I want to book Indian Tourist Visa processing (Charge: ৳1,500).',
    documents: [
      'মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদ ও ২টি খালি পৃষ্ঠা থাকতে হবে)',
      'পূর্বের সকল পুরাতন পাসপোর্ট (যদি থাকে)',
      'সদ্য তোলা ২×২ ইঞ্চি ল্যাব প্রিন্ট ছবি (সাদা ব্যাকগ্রাউন্ড, কোনো ফ্রেম বা বর্ডার ছাড়া)',
      'জাতীয় পরিচয়পত্র (NID) অথবা অনলাইন ডিজিটাল জন্মনিবন্ধন সনদ',
      'বর্তমান ঠিকানার সাম্প্রতিক ইউটিলিটি বিল কপি (বিদ্যুৎ/গ্যাস/পানি/টেলিফোন বিল)',
      'পেশাগত প্রমাণপত্র (চাকরিজীবীদের NOC ও অফিস আইডি / ব্যবসায়ীদের ট্রেড লাইসেন্স / শিক্ষার্থীদের আইডি কার্ড)',
      'আর্থিক সক্ষমতার প্রমাণ (সর্বনিম্ন ২০,০০০ টাকা ব্যালেন্সসহ বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট অথবা ১৫০$ এন্ডোর্সমেন্ট)'
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
    category: 'ট্রানজিট ও ভ্রমণ',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    description: 'নেপাল, ভুটান বা অন্য দেশে ট্রানজিটসহ একই ভিসায় দুইবার ভারতে প্রবেশের জন্য ট্রাভেল রুট, কনফার্মড টিকিট ও নিখুঁত ফাইল প্রসেসিং।',
    price: '৳৩,০০০',
    per: '/ সার্ভিস চার্জ',
    waText: 'Hello Processing Hub, I want to book Indian Double Entry Visa processing (Charge: ৳3,000).',
    documents: [
      'মূল পাসপোর্ট (কমপক্ষে ৬ মাসের মেয়াদ) ও পূর্বের সকল পুরাতন পাসপোর্ট',
      'সদ্য তোলা ২×২ ইঞ্চি ল্যাব প্রিন্ট ছবি (সাদা ব্যাকগ্রাউন্ড)',
      'জাতীয় পরিচয়পত্র (NID) ও সাম্প্রতিক ইউটিলিটি বিলের কপি',
      'তৃতীয় দেশে (নেপাল/ভুটান/অন্যান্য) যাওয়ার কনফার্মড টিকিট বা হোটেল বুকিং কপি',
      'তৃতীয় দেশের বৈধ ভিসা কপি (যদি পূর্বে নেওয়া থাকে)',
      'উভয় এন্ট্রির সুনির্দিষ্ট ভ্রমণ পরিকল্পনা ও উদ্দেশ্য সম্বলিত ট্রাভেল আইটিনারি',
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
      'মূল পাসপোর্ট ও পূর্বের সকল পুরাতন পাসপোর্ট',
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

const DESTINATIONS = [
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

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedService, setSelectedService] = useState<VisaService | null>(null);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotType>(SLOT_TYPES[0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        setIsQuickBookOpen(false);
      }
    };
    if (selectedService || isQuickBookOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedService, isQuickBookOpen]);

  const openModal = (service: VisaService) => {
    setSelectedService(service);
    // Initialize all documents as unchecked or keep track per service
    setCheckedDocs({});
    if (service.isSlotBooking) {
      setSelectedSlot(SLOT_TYPES[0]);
    }
  };

  const closeModal = () => {
    setSelectedService(null);
    setCheckedDocs({});
  };

  const openQuickBook = () => {
    setIsQuickBookOpen(true);
  };

  const closeQuickBook = () => {
    setIsQuickBookOpen(false);
  };

  const toggleDoc = (index: number) => {
    const key = `${selectedService?.id}-${index}`;
    setCheckedDocs((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getCompletedCount = () => {
    if (!selectedService) return 0;
    return selectedService.documents.reduce((count, _, idx) => {
      return count + (checkedDocs[`${selectedService.id}-${idx}`] ? 1 : 0);
    }, 0);
  };

  return (
    <>
      {/* NAVIGATION */}
      <nav id="mainNav" className={isScrolled ? 'scrolled' : ''}>
        <div id="brand-logo" className="brand">Processing Hub</div>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#destinations">Destinations</a>
          <a href="#contact">Contact</a>
        </div>
        <button 
          type="button"
          id="nav-cta-btn"
          className="nav-cta cursor-pointer border-0" 
          onClick={openQuickBook}
        >
          Book Now
        </button>
      </nav>

      {/* HERO */}
      <section id="hero-section" className="hero">
        <div className="hero-content">
          <h1>সহজ ও নির্ভুল ইন্ডিয়ান ভিসা প্রসেসিং</h1>
          <p>আইভ্যাক (IVAC) স্লট বুকিং, অনলাইন ফরম পূরণ, মেডিকেল ইনভাইটেশন এবং সম্পূর্ণ ফাইল প্রসেসিং সেবা — ঝামেলাহীন ও নির্ভরযোগ্য সাপোর্ট।</p>
          <a 
            id="hero-reserve-btn"
            className="btn-primary" 
            href="https://wa.me/8801577464706?text=Hello%20Processing%20Hub,%20I%20want%20to%20apply%20for%20an%20Indian%20Visa." 
            target="_blank" 
            rel="noopener noreferrer"
          >
            আবেদন শুরু করুন
          </a>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services">
        <div className="section-head">
          <span>Our Services</span>
          <h2>ইন্ডিয়ান ভিসা ক্যাটাগরি ও সার্ভিস</h2>
          <p>সঠিক ডকুমেন্টস চেকলিস্ট ও আইভ্যাক (IVAC) নিয়মানুযায়ী আপনার ভিসা ফাইল প্রস্তুত করতে আমাদের দক্ষ টিমের সহায়তা নিন।</p>
        </div>
        <div className="gear-grid">
          {VISA_SERVICES.map((service) => (
            <div 
              key={service.id} 
              id={`service-card-${service.id}`} 
              className="gear-card flex flex-col justify-between h-full"
            >
              <div>
                <div className="gear-img-wrap">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    loading="lazy" 
                  />
                </div>
                <div className="gear-body">
                  <div className="mb-2">
                    <span className="inline-block text-[11px] font-semibold text-[#4E5C46] bg-[#ECE8DC] px-2.5 py-0.5 rounded">
                      {service.category}
                    </span>
                  </div>
                  <h3>{service.title}</h3>
                  <p className="desc">{service.description}</p>
                </div>
              </div>

              {/* Card Footer with generous padding and clear alignment */}
              <div className="gear-footer">
                <div className="gear-price">
                  <span className="lbl">সার্ভিস ফি</span>
                  <div className="flex items-baseline gap-1">
                    <span className="amt">{service.price}</span>
                    <span className="per">{service.per}</span>
                  </div>
                </div>
                <button
                  type="button"
                  id={`book-btn-${service.id}`}
                  onClick={() => openModal(service)}
                  className="gear-book-btn"
                >
                  <span>বুক করুন</span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations">
        <div className="section-head">
          <span>Popular Routes</span>
          <h2>জনপ্রিয় ভ্রমণ ও চিকিৎসা গন্তব্য</h2>
          <p>ভ্রমণ, পড়াশোনা বা চিকিৎসার জন্য বাংলাদেশিদের শীর্ষ পছন্দের ভারতীয় গন্তব্যসমূহ।</p>
        </div>
        <div className="dest-scroll" id="destinations-scroll">
          {DESTINATIONS.map((dest, index) => (
            <div 
              key={index} 
              id={`destination-polaroid-${index}`}
              className="polaroid" 
              style={{ transform: `rotate(${dest.rotate})` }}
            >
              <img 
                src={dest.image} 
                alt={dest.name} 
                loading="lazy" 
              />
              <p>{dest.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <div id="cta-strip" className="cta-strip">
        <h2>জরুরি ভিসা প্রসেসিং বা তথ্যের প্রয়োজন?</h2>
        <p>সরাসরি আমাদের WhatsApp-এ যোগাযোগ করুন — আপনার ফাইল রিভিউ ও প্রয়োজনীয় দিকনির্দেশনা দেওয়া হবে অবিলম্বে।</p>
        <a 
          id="cta-whatsapp-btn"
          className="btn-primary" 
          href="https://wa.me/8801577464706?text=Hello%20Processing%20Hub,%20I%20need%20consultation%20regarding%20Indian%20Visa." 
          target="_blank" 
          rel="noopener noreferrer"
        >
          WhatsApp-এ মেসেজ দিন
        </a>
      </div>

      {/* FOOTER */}
      <footer id="contact">
        <div className="footer-top">
          <div>
            <div className="brand">Processing Hub</div>
            <p>বিশ্বস্ত ইন্ডিয়ান ভিসা প্রসেসিং, আইভ্যাক স্লট কনফার্মেশন ও ডকুমেন্টেশন কনসালটেন্সি সার্ভিস।</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>সার্ভিসসমূহ</h4>
              <a href="#services">Services</a>
              <a href="#destinations">Destinations</a>
            </div>
            <div>
              <h4>যোগাযোগ</h4>
              <a 
                href="https://wa.me/8801577464706" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                WhatsApp: +880 1577-464706
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Processing Hub. All rights reserved.</span>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <a 
        id="whatsapp-floating-button"
        className="wa-float" 
        href="https://wa.me/8801577464706?text=Hello%20Processing%20Hub,%20I%20have%20an%20inquiry%20about%20Indian%20Visa%20Processing." 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.6 6.32A7.85 7.85 0 0 0 12.02 4C7.66 4 4.13 7.53 4.13 11.89c0 1.4.37 2.76 1.06 3.96L4 20l4.27-1.12a7.9 7.9 0 0 0 3.75.95h.01c4.36 0 7.89-3.53 7.89-7.89 0-2.11-.82-4.09-2.32-5.62zm-5.58 12.1h-.01a6.55 6.55 0 0 1-3.34-.92l-.24-.14-2.49.65.67-2.43-.16-.25a6.56 6.56 0 0 1-1.01-3.5c0-3.63 2.96-6.58 6.6-6.58 1.76 0 3.42.69 4.66 1.94a6.55 6.55 0 0 1 1.93 4.65c0 3.63-2.96 6.58-6.61 6.58zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.5.64-.62.77-.11.13-.23.14-.42.05-.2-.1-.83-.31-1.58-.98-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.11.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.33-.11-.01-.24-.01-.37-.01s-.35.05-.53.25c-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.41 2.15 3.42 3.02.48.21.85.33 1.14.42.48.15.92.13 1.26.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24z" />
        </svg>
      </a>

      {/* QUICK BOOK NOW SERVICE SELECTION POPUP MODAL */}
      {isQuickBookOpen && (
        <div 
          id="quick-book-modal"
          className="service-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeQuickBook();
          }}
        >
          <div 
            className="service-modal-card"
            style={{ maxWidth: '580px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)' }}
          >
            {/* Modal Header */}
            <div className="service-modal-header">
              <div>
                <span className="inline-block text-[11px] font-semibold text-[#4E5C46] bg-[#ECE8DC] px-2.5 py-0.5 rounded mb-2">
                  বুকিং সার্ভিস নির্বাচন
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-[#1E2519] leading-snug">
                  আপনার কাঙ্ক্ষিত সেবা নির্বাচন করুন
                </h3>
                <p className="text-xs text-[#6B7563] mt-1.5">
                  নিচের যেকোনো সার্ভিসে ক্লিক করলে তাৎক্ষণিক তথ্যসহ WhatsApp-এ যুক্ত হয়ে যাবেন:
                </p>
              </div>

              <button
                type="button"
                id="quick-book-close-btn"
                onClick={closeQuickBook}
                className="p-2 text-[#727C6B] hover:text-[#1E2519] hover:bg-[#ECE8DC] rounded-lg transition-colors cursor-pointer flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Service List with WhatsApp redirect */}
            <div className="service-modal-body">
              <div className="space-y-2.5">
                {/* 1. Tourist Visa */}
                <a
                  id="quick-tourist-visa"
                  href="https://wa.me/8801577464706?text=Hello%20Processing%20Hub,%20I%20want%20to%20book%20Indian%20Tourist%20Visa%20processing%20(Service%20Charge:%20%E0%A7%B31,500)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="book-service-option"
                  onClick={closeQuickBook}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EFF4EC] flex items-center justify-center text-[#5F7758] flex-shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1E2519]">Tourist Visa (ট্যুরিস্ট ভিসা)</h4>
                      <p className="text-xs text-[#6E7866]">ফরম পূরণ, আইভ্যাক স্লট ও ফাইল প্রসেসিং</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-[#4E5C46] bg-[#F2F6EF] px-2 py-0.5 rounded block">৳১,৫০০</span>
                    <span className="text-[10px] text-[#86907E] inline-flex items-center gap-0.5 mt-0.5">WhatsApp <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </a>

                {/* 2. Medical Visa */}
                <a
                  id="quick-medical-visa"
                  href="https://wa.me/8801577464706?text=Hello%20Processing%20Hub,%20I%20want%20to%20book%20Indian%20Medical%20Visa%20processing%20(Service%20Charge:%20%E0%A7%B34,000)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="book-service-option"
                  onClick={closeQuickBook}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EFF4EC] flex items-center justify-center text-[#5F7758] flex-shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1E2519]">Medical Visa (মেডিকেল ভিসা)</h4>
                      <p className="text-xs text-[#6E7866]">হাসপাতাল ইনভাইটেশন লেটার ও মেডিকেল ফাইল</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-[#4E5C46] bg-[#F2F6EF] px-2 py-0.5 rounded block">৳৪,০০০</span>
                    <span className="text-[10px] text-[#86907E] inline-flex items-center gap-0.5 mt-0.5">WhatsApp <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </a>

                {/* 3. Business Visa */}
                <a
                  id="quick-business-visa"
                  href="https://wa.me/8801577464706?text=Hello%20Processing%20Hub,%20I%20want%20to%20book%20Indian%20Business%20Visa%20processing%20(Service%20Charge:%20%E0%A7%B35,000)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="book-service-option"
                  onClick={closeQuickBook}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EFF4EC] flex items-center justify-center text-[#5F7758] flex-shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1E2519]">Business Visa (বিজনেস ভিসা)</h4>
                      <p className="text-xs text-[#6E7866]">ইনভাইটেশন পেপারস ও ট্রেড ডকুমেন্টস ফাইল</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-[#4E5C46] bg-[#F2F6EF] px-2 py-0.5 rounded block">৳৫,০০০</span>
                    <span className="text-[10px] text-[#86907E] inline-flex items-center gap-0.5 mt-0.5">WhatsApp <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </a>

                {/* 4. Double Entry Visa */}
                <a
                  id="quick-double-entry-visa"
                  href="https://wa.me/8801577464706?text=Hello%20Processing%20Hub,%20I%20want%20to%20book%20Indian%20Double%20Entry%20Visa%20processing%20(Service%20Charge:%20%E0%A7%B33,000)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="book-service-option"
                  onClick={closeQuickBook}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EFF4EC] flex items-center justify-center text-[#5F7758] flex-shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1E2519]">Double Entry Visa (ডবল এন্ট্রি ভিসা)</h4>
                      <p className="text-xs text-[#6E7866]">নেপাল/ভুটান ট্রানজিট ও দুইবার প্রবেশ সুবিধা</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-[#4E5C46] bg-[#F2F6EF] px-2 py-0.5 rounded block">৳৩,০০০</span>
                    <span className="text-[10px] text-[#86907E] inline-flex items-center gap-0.5 mt-0.5">WhatsApp <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </a>

                {/* 5. Ticket Booking */}
                <a
                  id="quick-ticket-booking"
                  href="https://wa.me/8801577464706?text=Hello%20Processing%20Hub,%20I%20want%20to%20book%20Ticket%20Booking%20service%20(Air%20/%20Travel%20Ticket)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="book-service-option"
                  onClick={closeQuickBook}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EFF4EC] flex items-center justify-center text-[#5F7758] flex-shrink-0">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1E2519]">Ticket Booking (টিকেট বুকিং)</h4>
                      <p className="text-xs text-[#6E7866]">এয়ার টিকেট ও ভিসা ট্রানজিট কনফার্মড টিকেট</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-[#4E5C46] bg-[#F2F6EF] px-2 py-0.5 rounded block">৳১,০০০</span>
                    <span className="text-[10px] text-[#86907E] inline-flex items-center gap-0.5 mt-0.5">WhatsApp <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </a>

                {/* 6. Visa Slot Booking */}
                <a
                  id="quick-slot-booking"
                  href="https://wa.me/8801577464706?text=Hello%20Processing%20Hub,%20I%20want%20to%20book%20Indian%20Visa%20Appointment%20Slot%20(Tourist%20/%20Medical%20/%20Business%20/%20Double%20Entry)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="book-service-option"
                  onClick={closeQuickBook}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EFF4EC] flex items-center justify-center text-[#5F7758] flex-shrink-0">
                      <CalendarClock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1E2519]">Slot Booking (ভিসার স্লট বুকিং)</h4>
                      <p className="text-xs text-[#6E7866]">আইভ্যাক ফি ১৫০০৳ + নির্ধারিত ক্যাটাগরি ফি</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-[#4E5C46] bg-[#F2F6EF] px-2 py-0.5 rounded block">১৫০০৳ + ফি</span>
                    <span className="text-[10px] text-[#86907E] inline-flex items-center gap-0.5 mt-0.5">WhatsApp <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="service-modal-footer">
              <button
                type="button"
                onClick={closeQuickBook}
                className="px-4 py-2 text-sm font-medium text-[#55604C] hover:text-[#1E2519] hover:bg-[#ECE8DC] rounded-lg border border-[#D5CFBF] bg-white transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE DETAILS & CHECKLIST POPUP MODAL */}
      {selectedService && (
        <div 
          id="service-checklist-modal"
          className="service-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
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
                  {selectedService.category}
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-[#1E2519] leading-snug">
                  {selectedService.title}
                </h3>
                <p className="text-xs text-[#6B7563] mt-1.5">
                  {selectedService.isSlotBooking ? (
                    <span>
                      মোট ফি: <strong className="text-[#1E2519] font-bold">৳{selectedSlot.totalFee.toLocaleString('bn-BD')}</strong> (আইভ্যাক ফি ১৫০০৳ + সার্ভিস ফি {selectedSlot.serviceCharge.toLocaleString('bn-BD')}৳)
                    </span>
                  ) : (
                    <span>
                      সার্ভিস ফি: <strong className="text-[#1E2519] font-bold">{selectedService.price}</strong> (আইভ্যাক ফি ব্যতীত)
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                id="modal-close-btn"
                onClick={closeModal}
                className="p-2 text-[#727C6B] hover:text-[#1E2519] hover:bg-[#ECE8DC] rounded-lg transition-colors cursor-pointer flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="service-modal-body">
              {/* SPECIAL SECTION FOR VISA SLOT BOOKING */}
              {selectedService.isSlotBooking && (
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
                </div>
              )}

              {/* Checklist header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#EFEBE2]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#5F7758]" />
                  <span className="text-sm font-bold text-[#26301F]">
                    {selectedService.isSlotBooking ? 'স্লট বুকিংয়ের জন্য প্রয়োজনীয় তথ্য' : 'প্রয়োজনীয় ডকুমেন্টস চেকলিস্ট'}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#F2F6EF] text-[#4E5C46] border border-[#DEE6D8]">
                  প্রস্তুত: {getCompletedCount()} / {selectedService.documents.length}
                </span>
              </div>

              <p className="text-xs text-[#6B7563] leading-relaxed">
                {selectedService.isSlotBooking 
                  ? 'আপনার প্রস্তুত থাকা তথ্যে টিক দিন এবং নিচে WhatsApp-এ ক্লিক করে দ্রুত স্লট কনফার্ম করুন:'
                  : 'আপনার সংগ্রহে থাকা ডকুমেন্টসগুলোতে টিক চিহ্ন দিন। কোনো ডকুমেন্ট বাকি থাকলে আমরা ফাইল প্রসেসিংয়ে সহায়তা করব:'
                }
              </p>

              {/* Checklist items */}
              <div className="space-y-2.5">
                {selectedService.documents.map((doc, idx) => {
                  const isChecked = !!checkedDocs[`${selectedService.id}-${idx}`];
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

            {/* Modal Footer */}
            <div className="service-modal-footer">
              <span className="text-xs text-[#6B7563] hidden sm:inline mr-auto">
                {selectedService.isSlotBooking ? (
                  <span>মোট ফি: <strong>৳{selectedSlot.totalFee.toLocaleString('bn-BD')}</strong> ({selectedSlot.name})</span>
                ) : (
                  <span>চার্জ: <strong>{selectedService.price}</strong></span>
                )}
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-[#55604C] hover:text-[#1E2519] hover:bg-[#ECE8DC] rounded-lg border border-[#D5CFBF] bg-white transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                <a
                  id="modal-whatsapp-submit-btn"
                  href={`https://wa.me/8801577464706?text=${encodeURIComponent(
                    selectedService.isSlotBooking
                      ? `Hello Processing Hub, I want to book Indian Visa Slot for ${selectedSlot.name}. IVAC Fee: ৳${selectedSlot.ivacFee} + Service Charge: ৳${selectedSlot.serviceCharge} (Total: ৳${selectedSlot.totalFee}). I have ready information (${getCompletedCount()}/${selectedService.documents.length}). Please confirm slot availability.`
                      : `Hello Processing Hub, I want to book ${selectedService.title} (Service Charge: ${selectedService.price}). I have checked my required documents (${getCompletedCount()}/${selectedService.documents.length} ready). Please guide me for file submission.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#5F7758] hover:bg-[#4B5E45] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp-এ পাঠান</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

