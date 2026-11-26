import { HospitalEstimatedCosts } from '../types';
import { Language } from '../context/LanguageContext';

interface HospitalExtraEntry {
  costsBn: HospitalEstimatedCosts;
  costsEn: HospitalEstimatedCosts;
  pickupBn: string;
  pickupEn: string;
}

const HOSPITAL_EXTRAS_MAP: Record<string, HospitalExtraEntry> = {
  'medanta-gurugram': {
    costsBn: {
      consultation: '₹১,২০০ – ₹২,০০০ (প্রাথমিক কনসাল্টেশন)',
      diagnosticPackage: '₹১২,০০০ – ₹৩৫,০০০ (কার্ডিয়াক/কমপ্রিহেনসিভ চেকআপ)',
      majorProcedureRange: '₹১,৮০,০০০ – ₹৬,৫০,০০০+ (সার্জারি ও ওয়ার্ড অনুযায়ী)'
    },
    costsEn: {
      consultation: '₹1,200 – ₹2,000 (Specialist OPD)',
      diagnosticPackage: '₹12,000 – ₹35,000 (Cardiac / Comprehensive Checkup)',
      majorProcedureRange: '₹1,80,000 – ₹6,50,000+ (Surgery & Ward dependent)'
    },
    pickupBn: 'দিল্লি ইন্দিরা গান্ধী আন্তর্জাতিক বিমানবন্দর (DEL) থেকে ৩০–৪০ মিনিটের দূরত্বে; মেডিকেল ইনভাইটেশন অনুযায়ী হসপিটাল ক্যাব ও বাংলাভাষী ইন্টারন্যাশনাল ডেস্ক সমন্বয়।',
    pickupEn: '30–40 min from Delhi IGI Airport (DEL); hospital cab pickup & Bengali-speaking international desk coordinated via your medical invitation.'
  },
  'desun-kolkata': {
    costsBn: {
      consultation: '₹৭০০ – ₹১,২০০ (প্রাথমিক কনসাল্টেশন)',
      diagnosticPackage: '₹৬,৫০০ – ₹১৮,০০০ (হেলথ/হার্ট চেকআপ)',
      majorProcedureRange: '₹১,২০,০০০ – ₹৩,৮০,০০০+ (প্রসিডিউর অনুযায়ী)'
    },
    costsEn: {
      consultation: '₹700 – ₹1,200 (Specialist OPD)',
      diagnosticPackage: '₹6,500 – ₹18,000 (Health / Cardiac Panel)',
      majorProcedureRange: '₹1,20,000 – ₹3,80,000+ (Procedure dependent)'
    },
    pickupBn: 'কলকাতা নেতাজি সুভাষ বিমানবন্দর (CCU) থেকে ~৪৫ মিনিট ও শিয়ালদহ/কলকাতা স্টেশন থেকে ২৫–৩৫ মিনিট; অ্যাম্বুলেন্স/ক্যাব ও বাংলাভাষী সহায়তা।',
    pickupEn: '~45 min from Kolkata Airport (CCU) and 25–35 min from Sealdah/Kolkata station; cab/ambulance & Bengali coordinator available.'
  },
  'peerless-kolkata': {
    costsBn: {
      consultation: '₹৭০০ – ₹১,২০০ (প্রাথমিক কনসাল্টেশন)',
      diagnosticPackage: '₹৫,৫০০ – ₹১৬,০০০ (ডায়াগনস্টিক প্যাকেজ)',
      majorProcedureRange: '₹৯৫,০০০ – ₹৩,২০,০০০+ (চিকিৎসার ধরন অনুযায়ী)'
    },
    costsEn: {
      consultation: '₹700 – ₹1,200 (Specialist OPD)',
      diagnosticPackage: '₹5,500 – ₹16,000 (Diagnostic Panel)',
      majorProcedureRange: '₹95,000 – ₹3,20,000+ (Treatment dependent)'
    },
    pickupBn: 'কলকাতা বিমানবন্দর (CCU) থেকে ৪৫–৫৫ মিনিট ও কবি সুভাষ মেট্রো থেকে ৫ মিনিট; বাংলাদেশি রোগী সেল থেকে প্রাইভেট কার সমন্বয়।',
    pickupEn: '45–55 min from Kolkata Airport (CCU) and 5 min from Kavi Subhash Metro; car pickup arranged through Bangladesh Patient Desk.'
  },
  'apollo-hospitals': {
    costsBn: {
      consultation: '₹১,০০০ – ₹১,৮০০ (চেন্নাই/দিল্লি/কলকাতা ভেদে)',
      diagnosticPackage: '₹১০,০০০ – ₹৩০,০০০ (এক্সিকিউটিভ হেলথ চেকআপ)',
      majorProcedureRange: '₹১,৯০,০০০ – ₹৭,৫০,০০০+ (রোবোটিক/ট্রান্সপ্লান্ট/অনকোলজি)'
    },
    costsEn: {
      consultation: '₹1,000 – ₹1,800 (Chennai / Delhi / Kolkata)',
      diagnosticPackage: '₹10,000 – ₹30,000 (Executive Health Panel)',
      majorProcedureRange: '₹1,90,000 – ₹7,50,000+ (Robotic / Oncology / Transplant)'
    },
    pickupBn: 'চেন্নাই (MAA), দিল্লি (DEL) ও কলকাতা (CCU) বিমানবন্দর থেকে ডেডিকেটেড ইন্টারন্যাশনাল পেশেন্ট পিকআপ ও গেস্ট হাউস ড্রপ সুবিধা।',
    pickupEn: 'Dedicated International Patient Lounge pickup from Chennai (MAA), Delhi (DEL), and Kolkata (CCU) airports to hospital or guest house.'
  },
  'rtiics-kolkata': {
    costsBn: {
      consultation: '₹৮০০ – ₹১,৪০০ (কার্ডিয়াক কনসাল্টেশন)',
      diagnosticPackage: '₹৭,৫০০ – ₹২০,০০০ (ইকো/এনজিওগ্রাম/কার্ডিয়াক স্ক্রিনিং)',
      majorProcedureRange: '₹১,৪০,০০০ – ₹৪,২০,০০০+ (বাইপাস/ভালভ/পেডিয়াট্রিক হার্ট)'
    },
    costsEn: {
      consultation: '₹800 – ₹1,400 (Cardiac OPD)',
      diagnosticPackage: '₹7,500 – ₹20,000 (Echo / Angiogram / Cardiac Workup)',
      majorProcedureRange: '₹1,40,000 – ₹4,20,000+ (Bypass / Valve / Pediatric Cardiac)'
    },
    pickupBn: 'কলকাতা বিমানবন্দর (CCU) থেকে ~৪৫ মিনিট ও হাওড়া/মৈত্রী চিৎপুর স্টেশন থেকে ৪০ মিনিট; মুকুন্দপুর বাইপাসে হোটেল/গেস্টহাউস ও গাড়ি সমন্বয়।',
    pickupEn: '~45 min from Kolkata Airport (CCU) and 40 min from Howrah/Chitpur; Mukundapur bypass hotel & private transfer coordinated.'
  },
  'aiims-delhi': {
    costsBn: {
      consultation: 'সরকারি ফি (ন্যূনতম, বিদেশি রোগী প্রোটোকল অনুযায়ী)',
      diagnosticPackage: '₹৩,৫০০ – ₹১৫,০০০ (অ্যাপয়েন্টমেন্ট ও ল্যাব ভেদে)',
      majorProcedureRange: '₹৫০,০০০ – ₹২,৫০,০০০+ (অত্যন্ত সাশ্রয়ী সরকারি রেফারেল রেট)'
    },
    costsEn: {
      consultation: 'Government-subsidized OPD schedule (Foreign Patient protocol)',
      diagnosticPackage: '₹3,500 – ₹15,000 (Lab & imaging dependent)',
      majorProcedureRange: '₹50,000 – ₹2,50,000+ (Subsidized apex referral rates)'
    },
    pickupBn: 'দিল্লি বিমানবন্দর (DEL) থেকে ২৫–৩৫ মিনিট ও AIIMS মেট্রো স্টেশনের পাশে; গ্রিন পার্ক/সাউথ এক্সটেনশন গেস্টহাউস ও অনুবাদক গাইড সহায়তা।',
    pickupEn: '25–35 min from Delhi Airport (DEL), right at AIIMS Metro; Green Park / South Ex stay & Bengali translator support arranged.'
  }
};

export function getHospitalExtras(
  hospitalId: string,
  city: string,
  language: Language
): { estimatedCosts: HospitalEstimatedCosts; airportPickup: string } {
  const specific = HOSPITAL_EXTRAS_MAP[hospitalId];
  if (specific) {
    return {
      estimatedCosts: language === 'bn' ? specific.costsBn : specific.costsEn,
      airportPickup: language === 'bn' ? specific.pickupBn : specific.pickupEn
    };
  }

  const cityLower = city.toLowerCase();
  const isKolkata = cityLower.includes('kolkata') || city.includes('কলকাতা') || cityLower.includes('howrah') || city.includes('হাওড়া');
  const isChennai = cityLower.includes('chennai') || city.includes('চেন্নাই');
  const isHyderabad = cityLower.includes('hyderabad') || city.includes('হায়দ্রাবাদ');

  if (language === 'bn') {
    if (isKolkata) {
      return {
        estimatedCosts: {
          consultation: '₹৭৫০ – ₹১,৩০০ (স্পেশালিস্ট ওপিডি)',
          diagnosticPackage: '₹৬,৫০০ – ₹১৮,৫০০ (প্রয়োজনীয় টেস্ট ও ইমেজিং)',
          majorProcedureRange: '₹১,১০,০০০ – ₹৪,০০,০০০+ (চিকিৎসার ধরন ও ওয়ার্ড অনুযায়ী)'
        },
        airportPickup: 'কলকাতা বিমানবন্দর (CCU), চিৎপুর মৈত্রী স্টেশন বা হাওড়া/শিয়ালদহ থেকে ৩০–৫০ মিনিট; প্রাইভেট ক্যাব ও বাংলাভাষী রোগী সহায়তা ডেস্ক সমন্বয়।'
      };
    }
    if (isChennai) {
      return {
        estimatedCosts: {
          consultation: '₹৯০০ – ₹১,৬০০ (স্পেশালিস্ট ওপিডি)',
          diagnosticPackage: '₹৯,০০০ – ₹২৫,০০০ (রোগ অনুযায়ী ডায়াগনস্টিক প্যানেল)',
          majorProcedureRange: '₹১,৬০,০০০ – ₹৫,৮০,০০০+ (সার্জারি ও রুম ক্যাটাগরি অনুযায়ী)'
        },
        airportPickup: 'চেন্নাই আন্তর্জাতিক বিমানবন্দর (MAA) থেকে ২৫–৪৫ মিনিট ও চেন্নাই সেন্ট্রাল রেলস্টেশন থেকে ২০–৩৫ মিনিট; হাসপাতাল ফ্রি/পে-ক্যাব পিকআপ ও বাংলা অনুবাদক সহায়তা।'
      };
    }
    if (isHyderabad) {
      return {
        estimatedCosts: {
          consultation: '₹৮০০ – ₹১,৫০০ (স্পেশালিস্ট ওপিডি)',
          diagnosticPackage: '₹৮,০০০ – ₹২২,০০০ (অনকোলজি/স্পেশালিটি চেকআপ)',
          majorProcedureRange: '₹১,৪০,০০০ – ₹৫,২০,০০০+ (প্যাকেজ ও সার্জারি অনুযায়ী)'
        },
        airportPickup: 'হায়দ্রাবাদ শামশাবাদ বিমানবন্দর (HYD) থেকে ৪৫ মিনিট; হসপিটাল ইন্টারন্যাশনাল ডেস্ক কর্তৃক এয়ারপোর্ট পিকআপ ও কাছাকাছি হোটেল সমন্বয়।'
      };
    }
    return {
      estimatedCosts: {
        consultation: '₹১,০০০ – ₹১,৮০০ (স্পেশালিস্ট ওপিডি)',
        diagnosticPackage: '₹১০,০০০ – ₹২৮,০০০ (ডায়াগনস্টিক ও ইমেজিং)',
        majorProcedureRange: '₹১,৭০,০০০ – ₹৬,০০,০০০+ (সার্জারি ও কেবিন ক্যাটাগরি অনুযায়ী)'
      },
      airportPickup: 'নতুন দিল্লি (DEL) বা ব্যাঙ্গালোর (BLR) বিমানবন্দর থেকে ৩০–৪৫ মিনিট; হসপিটাল ক্যাব পিকআপ, সিম কার্ড ও দোভাষী সমন্বয়।'
    };
  }

  if (isKolkata) {
    return {
      estimatedCosts: {
        consultation: '₹750 – ₹1,300 (Specialist OPD)',
        diagnosticPackage: '₹6,500 – ₹18,500 (Labs & Imaging)',
        majorProcedureRange: '₹1,10,000 – ₹4,00,000+ (Treatment & Ward dependent)'
      },
      airportPickup: '30–50 min from Kolkata Airport (CCU), Chitpur Maitree station, or Howrah/Sealdah; private cab & Bengali coordination desk available.'
    };
  }
  if (isChennai) {
    return {
      estimatedCosts: {
        consultation: '₹900 – ₹1,600 (Specialist OPD)',
        diagnosticPackage: '₹9,000 – ₹25,000 (Specialty Diagnostic Panel)',
        majorProcedureRange: '₹1,60,000 – ₹5,80,000+ (Procedure & Room dependent)'
      },
      airportPickup: '25–45 min from Chennai Airport (MAA) and 20–35 min from Chennai Central; hospital transfer & Bengali translator support coordinated.'
    };
  }
  if (isHyderabad) {
    return {
      estimatedCosts: {
        consultation: '₹800 – ₹1,500 (Specialist OPD)',
        diagnosticPackage: '₹8,000 – ₹22,000 (Oncology / Specialty Panel)',
        majorProcedureRange: '₹1,40,000 – ₹5,20,000+ (Package & Surgery dependent)'
      },
      airportPickup: '45 min from Hyderabad Airport (HYD); hospital international desk coordinates airport pickup and nearby patient-friendly stays.'
    };
  }
  return {
    estimatedCosts: {
      consultation: '₹1,000 – ₹1,800 (Specialist OPD)',
      diagnosticPackage: '₹10,000 – ₹28,000 (Diagnostics & Imaging)',
      majorProcedureRange: '₹1,70,000 – ₹6,00,000+ (Surgery & Room category dependent)'
    },
    airportPickup: '30–45 min from New Delhi (DEL) or Bengaluru (BLR) airports; hospital cab pickup, SIM guidance & translator coordination arranged.'
  };
}
