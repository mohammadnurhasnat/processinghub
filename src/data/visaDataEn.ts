import { VisaService, SlotType, Destination, Hospital } from '../types';

export const SLOT_TYPES_EN: SlotType[] = [
  {
    id: 'medical-slot',
    name: 'Medical & Attendant Slot',
    ivacFee: 1500,
    serviceCharge: 3000,
    totalFee: 4500
  },
  {
    id: 'tourist-slot',
    name: 'Tourist Visa Slot',
    ivacFee: 1500,
    serviceCharge: 4000,
    totalFee: 5500
  },
  {
    id: 'double-entry-slot',
    name: 'Double Entry (X-3) Slot',
    ivacFee: 1500,
    serviceCharge: 3000,
    totalFee: 4500
  },
  {
    id: 'business-slot',
    name: 'Business Visa Slot',
    ivacFee: 1500,
    serviceCharge: 3000,
    totalFee: 4500
  },
  {
    id: 'student-slot',
    name: 'Student Visa (S-1) Slot',
    ivacFee: 1500,
    serviceCharge: 3000,
    totalFee: 4500
  },
  {
    id: 'transit-slot',
    name: 'Transit Visa (TR) Slot',
    ivacFee: 1500,
    serviceCharge: 3000,
    totalFee: 4500
  },
  {
    id: 'entry-slot',
    name: 'Entry Visa (X-Misc) Slot',
    ivacFee: 1500,
    serviceCharge: 3000,
    totalFee: 4500
  },
  {
    id: 'spouse-slot',
    name: 'Spouse & Family (X-1) Slot',
    ivacFee: 1500,
    serviceCharge: 3000,
    totalFee: 4500
  }
];

export const VISA_SERVICES_EN: VisaService[] = [
  {
    id: 'tourist-visa',
    title: 'Tourist Visa',
    category: 'Travel & Tourism',
    image: 'https://images.moondeveloper.com/attractions/2024/11/25/67446493a8fde.jpg',
    description: 'Online form fill-up, IVAC fee and appointment slot booking, thorough document verification, and complete tourist visa file preparation.',
    price: '৳6,000',
    per: '/ incl. processing & slot',
    waText: 'Hello Processing Hub, I want to book Indian Tourist Visa processing with slot (Total: ৳6,000, including ৳1,500 IVAC fee).',
    documents: [
      'Completed and signed online visa application form',
      'Original passport (at least 6 months validity and 2 blank pages) and all previous passports (GD copy if lost)',
      'Recent 2×2 inch (50mm × 50mm) lab-printed photo with plain white background and no border',
      'National ID card (NID) or online digital birth registration certificate',
      'Recent utility bill copy of current address (electricity, gas, water, or landline)',
      'Professional proof (NOC & office ID for employees / Govt GO / Trade License for business / Student ID for students)',
      'Proof of financial solvency ($200 passport endorsement, 6-month bank statement with equivalent balance, or SBI / International Travel Card)',
      'Tentative travel itinerary and hotel booking details (if applicable)'
    ]
  },
  {
    id: 'medical-visa',
    title: 'Medical & Attendant Visa',
    category: 'Medical Care (M-1 / M-2)',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    description: 'Doctor appointment, hospital invitation and AYUSH letter collection from top Indian hospitals, plus urgent IVAC slot and processing for Patient (M-1) and Attendant (M-2).',
    price: '৳6,000',
    per: '/ incl. processing & slot',
    waText: 'Hello Processing Hub, I want to book Indian Medical & Attendant Visa processing with slot (Total: ৳6,000, including ৳1,500 IVAC fee).',
    documents: [
      'Completed and signed online Medical (M-1) / Attendant (M-2) visa application form',
      'Original passports of patient and attendant (6+ months validity, 2 blank pages) and all old passports (GD copy if lost)',
      'Recent 2×2 inch lab-printed photo (white background, no border)',
      '[Patient M-1] Original Indian hospital appointment / Doctor Invitation Letter (with MVRN and attendant name) and AYUSH letter (if applicable)',
      '[Patient M-1] Recent prescription and medical test reports from a registered Bangladeshi physician (not required separately for the attendant)',
      '[Attendant M-2] Attendant basic documents and proof of family relationship with the patient',
      'National ID (NID) or digital birth certificate and recent utility bill copy of current address',
      'Professional proof (NOC for employees / Trade License for business / Student ID for students)',
      'Financial solvency proof ($200 endorsement, 6-month bank statement with equivalent balance, or SBI / International Travel Card)'
    ]
  },
  {
    id: 'double-entry-visa',
    title: 'Double Entry Visa (X-3)',
    category: 'Miscellaneous (X-3)',
    image: 'https://dqliving.com/wp-content/uploads/2021/02/VFS-Global-scaled.jpg',
    description: 'Official Miscellaneous (X-3) double-entry Indian visa processing, IVAC fee, and slot booking for third-country / European embassy interviews, work permits, and transit.',
    price: '৳6,500',
    per: '/ incl. processing & slot',
    waText: 'Hello Processing Hub, I want to book Indian Double Entry Visa (X-3 Miscellaneous) processing with slot (Total: ৳6,500, including ৳1,500 IVAC fee).',
    documents: [
      'Completed and signed online Miscellaneous (X-3) Double Entry visa application form',
      'Original passport (6+ months validity, 2 blank pages) and all previous passports (GD copy if lost)',
      'Recent 2×2 inch lab-printed photo (white background, no border)',
      'Official embassy appointment / interview confirmation letter for the third country in India',
      'Work permit and contracted company documents for Europe or destination country (job contract, offer, or sponsorship)',
      'Confirmed flight / transit itinerary and cover letter explaining the double-entry purpose',
      'National ID (NID) or digital birth certificate and recent utility bill copy of current address',
      'Professional proof (NOC & office ID / Trade License / Student ID)',
      'Financial solvency proof ($200 endorsement, 6-month bank statement with equivalent balance, or SBI / International Travel Card)'
    ]
  },
  {
    id: 'business-visa',
    title: 'Business Visa',
    category: 'Trade & Commerce (B-1 / B-2)',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    description: 'Complete business visa processing with Indian company invitation letter, forwarding letter, trade license, Chamber of Commerce, TIN, BIN, IRC, LC, VAT return, IVAC fee, and slot.',
    price: '৳6,000',
    per: '/ incl. processing & slot',
    waText: 'Hello Processing Hub, I want to book Indian Business Visa processing with slot (Total: ৳6,000, including ৳1,500 IVAC fee).',
    documents: [
      'Completed online Business Visa application form, original passport (6+ months validity, 2 blank pages), and all previous passports',
      'Recent 2×2 inch white-background photo, National ID (NID), and recent utility bill copy of current address',
      'Original Invitation Letter from a registered Indian company',
      'Forwarding / sponsorship letter on Bangladeshi company letterhead along with visiting card / office ID',
      'Updated Trade License of the business (with notarized English translation)',
      'Chamber of Commerce or recognized business association membership certificate and recommendation letter',
      'Company TIN, BIN, Import/Export certificate (IRC/ERC), LC copy, and latest VAT return',
      'Personal and company bank statements for the past 6 months ($200 endorsement or sufficient balance / SBI & International Card)'
    ]
  },
  {
    id: 'student-visa',
    title: 'Student Visa (S-1)',
    category: 'Higher Education (S-1)',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    description: 'Complete Student Visa package with Indian university admission and bonafide certificate verification, bank solvency preparation, IVAC fee (৳1,500), and slot.',
    price: '৳5,500',
    per: '/ incl. processing & slot',
    waText: 'Hello Processing Hub, I want to book Indian Student Visa (S-1) processing with slot (Total: ৳5,500, including ৳1,500 IVAC fee & ৳3,000 slot + ৳1,000 processing).',
    documents: [
      'Completed online Student Visa (S-1) application form',
      'Original passport (6+ months validity, 2 blank pages) and all previous passports (GD copy if lost)',
      'Recent 2×2 inch lab-printed photo (white background, no border)',
      'Original admission letter and bonafide certificate from a recognized Indian university or college (with course and duration)',
      'NOC from the Ministry of Health & Family Welfare of Bangladesh for medical college admission (if applicable)',
      'National ID (NID) or digital birth certificate and recent utility bill copy of current address',
      'All previous academic certificates, mark sheets, and current student ID card in Bangladesh',
      'Financial solvency: guardian or sponsor bank solvency and 6-month bank statement ($200+ or covering tuition) or SBI / International Travel Card'
    ]
  },
  {
    id: 'transit-visa',
    title: 'Transit Visa (TR)',
    category: 'Border Transit (TR)',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    description: 'Complete Transit Visa processing for traveling through India to Nepal or Bhutan, including confirmed tickets, hotel booking, port selection, IVAC fee (৳1,500), and slot.',
    price: '৳5,500',
    per: '/ incl. processing & slot',
    waText: 'Hello Processing Hub, I want to book Indian Transit Visa (TR) processing with slot (Total: ৳5,500, including ৳1,500 IVAC fee & ৳3,000 slot + ৳1,000 processing).',
    documents: [
      'Completed online Transit Visa (TR) application form',
      'Original passport (6+ months validity, 2 blank pages) and all previous passports (GD copy if lost)',
      'Recent 2×2 inch lab-printed photo (white background, no border)',
      'Valid visa copy of the third destination country (such as Nepal, if applicable) and confirmed onward and return bus/rail/air tickets',
      'Hotel booking in the destination country and route details for approved border ports (Bhutan: Changrabandha/Jaigaon, Nepal: Changrabandha/Raniganj)',
      'National ID (NID) or digital birth certificate and recent utility bill copy of current address',
      'Professional proof (NOC / office ID / Trade License / Student ID)',
      'Financial solvency proof ($200 endorsement, 6-month bank statement with equivalent balance, or SBI / International Travel Card)'
    ]
  },
  {
    id: 'entry-visa',
    title: 'Entry Visa (X-Misc)',
    category: 'Miscellaneous (X-Misc)',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    description: 'Complete Miscellaneous (X-Misc) Entry Visa processing including document verification, eligibility proof attachment, IVAC fee, slot (৳4,500), and service charge (৳1,500).',
    price: '৳6,000',
    per: '/ slot ৳4,500 + service ৳1,500',
    waText: 'Hello Processing Hub, I want to book Indian Entry Visa (X-Misc) processing with slot (Total: ৳6,000 = ৳4,500 slot + ৳1,500 processing).',
    documents: [
      'Completed online Miscellaneous Entry (X-Misc) visa application form',
      'Original passport (6+ months validity, 2 blank pages) and all previous passports (GD copy if lost)',
      'Recent 2×2 inch lab-printed photo (white background, no border)',
      'Original proof of X-Misc entry eligibility / invitation letter / PIO or family relationship certificate',
      'Valid Indian visa and passport copy of the principal visa holder (for dependents)',
      'National ID (NID) or digital birth certificate and recent utility bill copy of current address',
      'Professional proof (NOC / office ID / Trade License / Student ID)',
      'Financial solvency proof ($200 endorsement, 6-month bank statement with equivalent balance, or SBI / International Travel Card)'
    ]
  },
  {
    id: 'spouse-visa',
    title: 'Spouse & Family Visa (X-1)',
    category: 'Miscellaneous (X-1)',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
    description: 'Complete Miscellaneous (X-1) Spouse & Family Visa package for spouses and children of Indian citizens or valid visa holders, including slot (৳4,500) and document service (৳1,500).',
    price: '৳6,000',
    per: '/ slot ৳4,500 + service ৳1,500',
    waText: 'Hello Processing Hub, I want to book Indian Spouse / Family Visa (X-1) processing with slot (Total: ৳6,000 = ৳4,500 slot + ৳1,500 processing).',
    documents: [
      'Completed online Miscellaneous (X-1) Spouse/Family visa application form',
      'Applicant original passport (6+ months validity, 2 blank pages) and all previous passports (GD copy if lost)',
      'Recent 2×2 inch lab-printed photo (white background, no border)',
      'Nikahnama / official marriage certificate (English translation attested by MoFA Bangladesh and Indian High Commission)',
      'Indian spouse passport / Aadhaar / Voter ID and Indian address utility bill (or principal visa and passport copy)',
      'National ID (NID) or digital birth certificate and recent utility bill copy of current address',
      'Professional proof (NOC / office ID / Trade License / Student ID — if applicable)',
      'Financial solvency proof ($200 endorsement, 6-month bank statement with equivalent balance, or SBI / International Travel Card)'
    ]
  },
  {
    id: 'ticket-booking',
    title: 'Ticket Booking',
    category: 'Travel & Transit',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    description: 'Domestic and international air ticket booking (one-way, round-trip, transit, and confirmed return) with service charges starting from ৳599 (negotiable) on top of the base fare.',
    price: '৳599+',
    per: '/ starts from ৳599 (negotiable)',
    waText: 'Hello Processing Hub, I want to book Air / Travel Ticket Booking service (Service Charge starts from ৳599 on top of base ticket fare, negotiable).',
    documents: [
      'Clear copy of the traveler passport information page',
      'Preferred travel dates and departure schedule',
      'Origin and destination cities (one-way or round-trip)',
      'Visa copy (if visa stamping is already completed)',
      'Passenger contact phone number and email address'
    ]
  },
  {
    id: 'visa-slot-booking',
    title: 'Visa Slot Booking',
    category: 'IVAC Appointment',
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=800&q=80',
    description: 'Slot-only booking starts from ৳4,500 (including ৳1,500 fixed IVAC fee). View exact category rates inside: Medical, X-3, Business, Student, Transit, X-Misc, X-1 at ৳4,500 and Tourist at ৳5,500.',
    price: '৳4,500+',
    per: '/ starts from ৳4,500 (incl. IVAC fee)',
    waText: 'Hello Processing Hub, I want to book an Indian Visa Appointment Slot (Starting from ৳4,500 including ৳1,500 IVAC fee).',
    isSlotBooking: true,
    documents: [
      'Applicant original passport copy (at least 6 months validity)',
      'Web File Number from the online visa application form',
      'Select one of the 5 active official IVAC centers in Bangladesh (Dhaka Jamuna Future Park, Chittagong, Khulna, Sylhet, Rajshahi)',
      'Select visa slot category (Medical / Tourist / Double Entry X-3 / Business / Student / Transit / Entry X-Misc / Spouse X-1)',
      'Preferred appointment date and urgency timeline'
    ]
  }
];

export const DESTINATIONS_EN: Destination[] = [
  {
    id: 'kolkata',
    name: 'Kolkata',
    location: 'West Bengal, India',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80',
    rotate: '-1deg',
    attractions: ['Victoria Memorial', 'Howrah Bridge', 'Dakshineswar & Belur Math', 'New Market Shopping', 'Science City & Eco Park'],
    bestTime: 'October to March (Winter & Festive Season)',
    description: 'The closest and most loved gateway for Bangladeshi travelers. Famous for the historic Victoria Memorial, vibrant New Market shopping, traditional sweets, Bengali cuisine, and easy transit.'
  },
  {
    id: 'delhi-agra',
    name: 'Delhi & Agra',
    location: 'Delhi NCR & Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
    rotate: '1deg',
    attractions: ['Taj Mahal (Agra)', 'Red Fort & Qutub Minar', 'India Gate', 'Humayun Tomb', 'Chandni Chowk & Jama Masjid'],
    bestTime: 'October to March',
    description: 'Experience the architectural marvel of the Taj Mahal, one of the Seven Wonders of the World, alongside historic Mughal monuments, grand avenues, and iconic cuisine in India’s capital.'
  },
  {
    id: 'kashmir',
    name: 'Kashmir Valley',
    location: 'Jammu & Kashmir, India',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80',
    rotate: '-1.5deg',
    attractions: ['Dal Lake & Houseboats', 'Gulmarg Gondola Cable Car', 'Pahalgam & Betaab Valley', 'Sonamarg Glacier', 'Indira Gandhi Tulip Garden'],
    bestTime: 'March to October (Summer) & December to February (Snowfall)',
    description: 'Renowned as Paradise on Earth, featuring snow-capped Pir Panjal mountains, pine forests, serene Shikara rides on Dal Lake, and the snowy meadows of Gulmarg and Pahalgam.'
  },
  {
    id: 'darjeeling-sikkim',
    name: 'Darjeeling & Gangtok',
    location: 'West Bengal & Sikkim',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
    rotate: '1deg',
    attractions: ['Tiger Hill (Kanchenjunga Sunrise)', 'Himalayan Toy Train', 'Gangtok MG Marg', 'Nathu La Pass & Tsomgo Lake', 'Darjeeling Tea Gardens & Rock Garden'],
    bestTime: 'March to May and October to December',
    description: 'The Queen of the Hills, Darjeeling, paired with cloud-kissed Sikkim. Enjoy panoramic views of Mount Kanchenjunga, the UNESCO heritage Toy Train, and crisp mountain air.'
  },
  {
    id: 'meghalaya-shillong',
    name: 'Meghalaya & Shillong',
    location: 'Meghalaya, North-East India',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80',
    rotate: '-1deg',
    attractions: ['Dawki Umngot Crystal River', 'Cherrapunji Living Root Bridges', 'Elephant & Nohkalikai Waterfalls', 'Shillong Peak & Umiam Lake', 'Mawlynnong Cleanest Village'],
    bestTime: 'September to May',
    description: 'Home of the clouds, Meghalaya offers crystal-clear waters in Dawki, misty valleys and towering waterfalls in Cherrapunji, and remarkable living root bridges.'
  },
  {
    id: 'shimla-manali',
    name: 'Shimla & Manali',
    location: 'Himachal Pradesh, India',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
    rotate: '1.5deg',
    attractions: ['Solang Valley & Snow Sports', 'Rohtang Pass & Atal Tunnel', 'Shimla The Mall Road', 'Hadimba Devi Temple', 'Scenic Himachal Apple Orchards'],
    bestTime: 'October to June (December–February for snowfall)',
    description: 'Himachal Pradesh’s most popular mountain retreats featuring soaring snow peaks, paragliding, skiing, apple orchards, and scenic alpine highways.'
  },
  {
    id: 'jaipur-rajasthan',
    name: 'Jaipur & Rajasthan',
    location: 'Rajasthan, India',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    rotate: '-1deg',
    attractions: ['Hawa Mahal & City Palace', 'Amber Fort & Jal Mahal', 'Nahargarh & Jaigarh Forts', 'Jodhpur Mehrangarh Fort', 'Thar Desert Camel Safari & Folk Dance'],
    bestTime: 'October to March',
    description: 'Discover the Pink City of Jaipur and the royal heritage of Rajasthan, filled with grand hilltop forts, ornate palaces, vibrant bazaars, and Thar Desert safaris.'
  },
  {
    id: 'goa',
    name: 'Goa Beaches',
    location: 'Goa, West India',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    rotate: '1deg',
    attractions: ['Baga & Calangute Beaches', 'Dudhsagar Waterfalls', 'Old Goa Basilica of Bom Jesus', 'Aguada Fort', 'Scuba Diving & Water Sports'],
    bestTime: 'November to April',
    description: 'India’s premier coastal getaway with golden beaches, centuries-old Portuguese churches, sunset cruises, lush waterfalls, and exciting water sports.'
  },
  {
    id: 'kerala',
    name: 'Kerala Backwaters',
    location: 'Kerala, South India',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
    rotate: '-1.5deg',
    attractions: ['Alleppey Backwater Houseboats', 'Munnar Tea Plantations', 'Historic Fort Kochi', 'Kovalam Beach', 'Periyar National Park & Wildlife'],
    bestTime: 'September to March',
    description: 'Known as God’s Own Country, Kerala enchants visitors with tranquil Alleppey houseboat cruises, emerald tea hills in Munnar, and refreshing tropical nature.'
  },
  {
    id: 'varanasi',
    name: 'Varanasi (Banaras)',
    location: 'Uttar Pradesh, India',
    image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=600&q=80',
    rotate: '1deg',
    attractions: ['Dashashwamedh Ghat Evening Aarti', 'Kashi Vishwanath Temple', 'Assi Ghat Sunrise Boat Ride', 'Sarnath Buddhist Stupa', 'Banarasi Silk & Street Food'],
    bestTime: 'October to March',
    description: 'One of the world’s oldest continuously inhabited spiritual cities, famed for mesmerizing evening lamp ceremonies along the sacred Ganges riverbanks and historic ghats.'
  },
  {
    id: 'chennai-pondicherry',
    name: 'Chennai & Pondicherry',
    location: 'Tamil Nadu & Puducherry',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    rotate: '-1deg',
    attractions: ['Marina Beach', 'Mahabalipuram Shore Temple (UNESCO)', 'Pondicherry French Quarter & Auroville', 'Kapaleeshwarar Temple', 'San Thome Basilica'],
    bestTime: 'November to February',
    description: 'Gateway to South India paired with the charming French-colonial coastal town of Pondicherry, showcasing Dravidian heritage, grand temples, and peaceful boulevards.'
  },
  {
    id: 'ladakh',
    name: 'Ladakh',
    location: 'Ladakh, High Himalayas',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=600&q=80',
    rotate: '1.5deg',
    attractions: ['Pangong Tso Blue Lake', 'Nubra Valley & Bactrian Camels', 'Khardung La High Mountain Pass', 'Magnetic Hill', 'Leh Palace & Thiksey Monastery'],
    bestTime: 'May to September',
    description: 'Land of high mountain passes and sapphire Himalayan lakes. Famous for the shifting blue waters of Pangong Lake, ancient cliffside monasteries, and epic road trips.'
  },
  {
    id: 'andaman',
    name: 'Andaman Islands',
    location: 'Andaman & Nicobar Islands',
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80',
    rotate: '-1deg',
    attractions: ['Radhanagar Beach Havelock', 'Cellular Jail Light & Sound Show', 'Neil Island Coral Reefs', 'Scuba Diving & Snorkeling', 'Elephant Beach Water Sports'],
    bestTime: 'October to May',
    description: 'A tropical island paradise in the Bay of Bengal featuring turquoise lagoons, powdery white beaches, vibrant coral reefs, and world-class scuba diving.'
  },
  {
    id: 'amritsar',
    name: 'Amritsar',
    location: 'Punjab, North India',
    image: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=600&q=80',
    rotate: '1deg',
    attractions: ['Golden Temple (Harmandir Sahib)', 'Wagah Border Flag Ceremony', 'Jallianwala Bagh Memorial', 'Gobindgarh Fort', 'Punjabi Kulcha & Lassi Trail'],
    bestTime: 'October to March',
    description: 'The cultural heart of Punjab, renowned for the shimmering Golden Temple surrounded by a sacred pool, the energetic Wagah Border ceremony, and legendary hospitality.'
  }
];

export const HOSPITALS_EN: Hospital[] = [
  {
    id: 'medanta-gurugram',
    name: 'Medanta – The Medicity',
    location: 'Gurugram, Delhi-NCR',
    city: 'Delhi / Gurugram',
    image: '/images/hospitals/facades/medanta.jpg',
    logo: 'MEDANTA',
    logoUrl: '/images/hospitals/logos/medanta.svg',
    brandColor: '#D84315',
    rotate: '0deg',
    specialties: [
      'Cardiology & Heart Surgery',
      'Oncology (Cancer Care)',
      'Neurology & Neurosurgery',
      'Kidney, Liver & Organ Transplant',
      'Orthopedics & Joint Replacement',
      'Gastroenterology & GI Surgery'
    ],
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Organ Transplant', 'Orthopedics', 'Gastroenterology'],
    highlights: [
      'World-class robotic surgery and dedicated cardiac care institute',
      'One of India’s leading centers for liver and kidney transplantation',
      'Dedicated international patient coordination helpdesk'
    ],
    description: 'One of India’s most advanced multi-super-specialty hospitals, led by Dr. Naresh Trehan, delivering world-class cardiac, neuro, and organ transplant care.',
    ayushSupport: true
  },
  {
    id: 'desun-kolkata',
    name: 'Desun Hospital & Heart Institute',
    location: 'EM Bypass, Kolkata',
    city: 'Kolkata',
    image: '/images/hospitals/facades/desun.jpg',
    logo: 'DESUN',
    logoUrl: '/images/hospitals/logos/desun.jpg',
    brandColor: '#1565C0',
    rotate: '0deg',
    specialties: [
      'Cardiology & Heart Surgery',
      'Neurology & Brain Care',
      'Oncology & Cancer Care',
      'Critical Care & ICU Support',
      'Orthopedics & Trauma',
      'General & Multi-Specialty Surgery'
    ],
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Critical Care', 'Orthopedics', 'General Surgery'],
    highlights: [
      'Fast and convenient access in Kolkata for Bangladeshi patients',
      '24/7 advanced cardiac emergency and trauma unit',
      'Reliable treatment packages at accessible costs'
    ],
    description: 'A leading cardiac and multi-specialty hospital in Kolkata, widely trusted for emergency heart care and critical care management.',
    ayushSupport: true
  },
  {
    id: 'peerless-kolkata',
    name: 'Peerless Hospital',
    location: 'Panchasayar, EM Bypass, Kolkata',
    city: 'Kolkata',
    image: '/images/hospitals/facades/peerless.webp',
    logo: 'PEERLESS',
    logoUrl: '/images/hospitals/logos/peerless.webp',
    brandColor: '#2E7D32',
    rotate: '0deg',
    specialties: [
      'Cardiology & Heart Care',
      'Oncology & Cancer Care',
      'Neurology & Neurosurgery',
      'Orthopedics & Spine',
      'Gastroenterology',
      'Nephrology & Urology',
      'General Surgery'
    ],
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Gastroenterology', 'Nephrology'],
    highlights: [
      'Dedicated assistance desk for Bangladeshi patients',
      'Experienced clinical teams with modern diagnostic facilities',
      'Integrated treatment options at affordable pricing'
    ],
    description: 'A long-standing trusted hospital near EM Bypass in Kolkata, regularly visited by Bangladeshi patients for gastroenterology, cardiology, and orthopedics.',
    ayushSupport: true
  },
  {
    id: 'apollo-hospitals',
    name: 'Apollo Hospitals, India',
    location: 'Chennai / Delhi / Kolkata / Hyderabad',
    city: 'Chennai / Kolkata / Delhi',
    image: '/images/hospitals/facades/apollo.jpg',
    logo: 'APOLLO',
    logoUrl: '/images/hospitals/logos/apollo.svg',
    brandColor: '#00838F',
    rotate: '0deg',
    specialties: [
      'Cardiology & Heart Surgery',
      'Cancer Treatment (Proton Therapy)',
      'Neurology & Neurosurgery',
      'Kidney & Liver Transplant',
      'Orthopedics & Joint Replacement',
      'Gastroenterology & Hepatology',
      'Urology & Nephrology',
      'Pediatrics & Gynecology'
    ],
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Organ Transplant', 'Orthopedics', 'Gastroenterology', 'Urology', 'Pediatrics'],
    highlights: [
      'Advanced cancer care including Asia Proton Beam Therapy',
      'Globally recognized network for organ transplantation',
      'JCI-accredited international quality hospital group'
    ],
    description: 'Asia largest and most trusted healthcare network, leading in complex cardiac surgery, robotic oncology, and liver transplants.',
    ayushSupport: true
  },
  {
    id: 'fortis-hospital',
    name: 'Fortis Hospital',
    location: 'Kolkata, Delhi-NCR, Bengaluru',
    city: 'Kolkata / Delhi / Bengaluru',
    image: '/images/hospitals/facades/fortis.jpg',
    logo: 'FORTIS',
    logoUrl: '/images/hospitals/logos/fortis.svg',
    brandColor: '#1B5E20',
    rotate: '0deg',
    specialties: [
      'Cardiology & Cardiac Surgery',
      'Neurology & Neurosurgery',
      'Oncology (Cancer Care)',
      'Kidney & Liver Transplant',
      'Orthopedics & Spine Surgery',
      'Gastroenterology',
      'Nephrology & Dialysis'
    ],
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Organ Transplant', 'Orthopedics', 'Gastroenterology', 'Nephrology'],
    highlights: [
      'State-of-the-art cardiac and neuro care infrastructure',
      'Fast international patient desk and visa invitation support',
      'Robotic joint replacement technology'
    ],
    description: 'One of India premier multi-specialty hospital chains with outstanding success rates in kidney transplants, cardiac care, and neurosurgery.',
    ayushSupport: true
  },
  {
    id: 'yashoda-hospitals',
    name: 'Yashoda Hospitals',
    location: 'Somajiguda, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    image: '/images/hospitals/facades/yashoda.jpg',
    logo: 'YASHODA',
    logoUrl: '/images/hospitals/logos/yashoda.png',
    brandColor: '#C2185B',
    rotate: '0deg',
    specialties: [
      'Medical, Surgical & Radiation Oncology',
      'Cardiology & Vascular Surgery',
      'Neurology & Neurosurgery',
      'Kidney & Liver Transplant',
      'Gastroenterology & Hepatology',
      'Orthopedics & Joint Reconstruction',
      'Urology'
    ],
    departments: ['Oncology', 'Cardiology', 'Neurology', 'Organ Transplant', 'Gastroenterology', 'Orthopedics', 'Urology'],
    highlights: [
      'Three dedicated cancer institutes offering rapid treatment',
      'High-quality complex surgeries at transparent costs',
      'Dedicated support helpline for Bangladeshi patients in Hyderabad'
    ],
    description: 'One of Hyderabad largest hospital groups, internationally recognized for advanced oncology therapy, interventional pulmonology, and transplants.',
    ayushSupport: true
  },
  {
    id: 'mgm-healthcare',
    name: 'MGM Healthcare',
    location: 'Nelson Manickam Road, Aminjikarai, Chennai',
    city: 'Chennai',
    image: '/images/hospitals/facades/mgm.png',
    logo: 'MGM',
    logoUrl: '/images/hospitals/logos/mgm.png',
    brandColor: '#00695C',
    rotate: '0deg',
    specialties: [
      'Cardiology & Cardiac Surgery',
      'Neurology & Neurosurgery',
      'Oncology & Cancer Care',
      'Heart, Lung, Liver & Kidney Transplant',
      'Gastroenterology',
      'Orthopedics',
      'Women & Child Care'
    ],
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Organ Transplant', 'Gastroenterology', 'Orthopedics', 'Women Care'],
    highlights: [
      'One of Asia premier teams for heart and lung transplants',
      'India first USGBC LEED Platinum certified green hospital',
      'Modern modular ICUs and operation theatres'
    ],
    description: 'A modern super-specialty hospital in Chennai led by Dr. K. R. Balakrishnan, renowned globally for excellence in heart and lung transplantation.',
    ayushSupport: true
  },
  {
    id: 'miot-international',
    name: 'MIOT International',
    location: 'Manapakkam, Chennai',
    city: 'Chennai',
    image: '/images/hospitals/facades/miot.jpg',
    logo: 'MIOT',
    logoUrl: '/images/hospitals/logos/miot.png',
    brandColor: '#880E4F',
    rotate: '0deg',
    specialties: [
      'Orthopedics & Joint Replacement (Knee/Hip)',
      'Organ Transplant',
      'Cardiac Sciences',
      'Oncology (Cancer Care)',
      'Neurology & Spine',
      'Gastroenterology & Liver Care',
      'Trauma & Critical Care'
    ],
    departments: ['Orthopedics', 'Organ Transplant', 'Cardiology', 'Oncology', 'Neurology', 'Gastroenterology', 'Critical Care'],
    highlights: [
      'Top center in India for orthopedics and joint replacement',
      'Zero-infection modular surgical suites',
      'Dedicated logistics assistance for Bangladeshi patients'
    ],
    description: 'A premier quaternary care institute in Chennai globally acclaimed for orthopedic surgery, complex joint replacements, and sports medicine.',
    ayushSupport: true
  },
  {
    id: 'narayana-superspeciality',
    name: 'Narayana Superspeciality Hospital',
    location: 'Andul Road, Howrah / Kolkata',
    city: 'Kolkata / Howrah',
    image: '/images/hospitals/facades/narayana.jpg',
    logo: 'NARAYANA',
    logoUrl: '/images/hospitals/logos/narayana.svg',
    brandColor: '#E65100',
    rotate: '0deg',
    specialties: [
      'Cardiology & Heart Surgery',
      'Comprehensive Oncology (Cancer Care)',
      'Neurology & Neurosurgery',
      'Nephrology & Dialysis',
      'Gastroenterology',
      'Orthopedics',
      'General & Multi-Specialty Treatment'
    ],
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Nephrology', 'Gastroenterology', 'Orthopedics'],
    highlights: [
      'Flagship hospital of Dr. Devi Shetty Narayana Health group',
      'One of Eastern India largest cancer and cardiac centers',
      'Convenient location for travelers arriving from Bangladesh'
    ],
    description: 'A trusted super-specialty hospital in Howrah / Kolkata under Dr. Devi Prasad Shetty Narayana Group, delivering quality care within budget.',
    ayushSupport: true
  },
  {
    id: 'rtiics-kolkata',
    name: 'Rabindranath Tagore Hospital (RTIICS)',
    location: 'Mukundapur, EM Bypass, Kolkata',
    city: 'Kolkata',
    image: '/images/hospitals/facades/rtiics.jpg',
    logo: 'RTIICS',
    logoUrl: '/images/hospitals/logos/rtiics.svg',
    brandColor: '#B71C1C',
    rotate: '0deg',
    specialties: [
      'Cardiology & Cardiac Surgery',
      'Interventional Cardiology & Cath Lab',
      'Pediatric Cardiology (Child Heart Surgery)',
      'Heart Transplant & Advanced HF Clinic',
      'Electrophysiology & Pacemaker',
      'Critical Care Medicine'
    ],
    departments: ['Cardiology', 'Pediatric Cardiology', 'Organ Transplant', 'Critical Care', 'Cardiac Surgery'],
    highlights: [
      'Leading center in Eastern India for pediatric and adult heart surgery',
      'Thousands of successful bypass and valve replacement procedures',
      'One of the highest-visited cardiac centers for Bangladeshi patients'
    ],
    description: 'RTIICS is Kolkata foremost cardiac hospital, widely preferred for heart failure care, pediatric cardiology, and complex heart surgeries.',
    ayushSupport: true
  },
  {
    id: 'ganga-ram-hospital',
    name: 'Sir Ganga Ram Hospital',
    location: 'Rajinder Nagar, New Delhi',
    city: 'New Delhi',
    image: '/images/hospitals/facades/sgrh.jpg',
    logo: 'SGRH',
    logoUrl: '/images/hospitals/logos/sgrh.webp',
    brandColor: '#1565C0',
    rotate: '0deg',
    specialties: [
      'Cardiology & Heart Care',
      'Neurology & Neurosurgery',
      'Oncology & Cancer Care',
      'Gastroenterology & Hepatobiliary',
      'Nephrology & Renal Transplant',
      'Orthopedics',
      'Minimal Access & Robotic Surgery'
    ],
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Gastroenterology', 'Nephrology', 'Orthopedics', 'General Surgery'],
    highlights: [
      'One of India historic and most respected multi-specialty hospitals',
      'Pioneers in laparoscopic and robotic surgery in India',
      'Senior professors and specialist consultants across every department'
    ],
    description: 'A historic tertiary care landmark in New Delhi recognized across South Asia for accurate diagnosis and comprehensive clinical excellence.',
    ayushSupport: true
  },
  {
    id: 'manipal-hospital',
    name: 'Manipal Hospital',
    location: 'Old Airport Road, Bengaluru / Kolkata / Delhi',
    city: 'Bengaluru / Kolkata / Delhi',
    image: '/images/hospitals/facades/manipal.jpg',
    logo: 'MANIPAL',
    logoUrl: '/images/hospitals/logos/manipal.webp',
    brandColor: '#0D47A1',
    rotate: '0deg',
    specialties: [
      'Cardiology & Heart Care',
      'Oncology (Cancer Center)',
      'Neurology & Neurosurgery',
      'Organ Transplant',
      'Gastroenterology',
      'Orthopedics',
      'Nephrology',
      'Pediatrics'
    ],
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Organ Transplant', 'Gastroenterology', 'Orthopedics', 'Nephrology', 'Pediatrics'],
    highlights: [
      'Over 70 years of healthcare heritage across India',
      'Advanced neuro-navigation systems for complex brain and spine surgery',
      'Comprehensive cancer care with high clinical outcomes'
    ],
    description: 'A top multi-specialty hospital network delivering advanced medical treatments across Bengaluru, Delhi, and Kolkata.',
    ayushSupport: true
  },
  {
    id: 'artemis-hospitals',
    name: 'Artemis Hospitals',
    location: 'Sector 51, Gurugram, Delhi-NCR',
    city: 'Gurugram / Delhi-NCR',
    image: '/images/hospitals/facades/artemis.jpg',
    logo: 'ARTEMIS',
    logoUrl: '/images/hospitals/logos/artemis.png',
    brandColor: '#6A1B9A',
    rotate: '0deg',
    specialties: [
      'Heart & Cardiac Surgery',
      'Comprehensive Cancer Care Institute',
      'Neurology & Neurosurgery',
      'Liver, Kidney & Bone Marrow Transplant',
      'Orthopedics & Joint Care',
      'Gastro Sciences',
      'Women & Child Care'
    ],
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Organ Transplant', 'Orthopedics', 'Gastroenterology', 'Women Care'],
    highlights: [
      'First JCI and NABH accredited hospital in Gurugram',
      'Strong outcomes in bone marrow and solid organ transplants',
      'Patient-centric modern campus and clinical infrastructure'
    ],
    description: 'A leading tertiary care hospital in Delhi-NCR known for bone marrow transplantation, advanced cardiac care, and oncology.',
    ayushSupport: true
  },
  {
    id: 'max-healthcare',
    name: 'Max Super Speciality Hospital',
    location: 'Saket, New Delhi & NCR',
    city: 'New Delhi / Saket',
    image: '/images/hospitals/facades/max.jpg',
    logo: 'MAX',
    logoUrl: '/images/hospitals/logos/max.svg',
    brandColor: '#0277BD',
    rotate: '0deg',
    specialties: [
      'Max Institute of Cancer Care',
      'Cardiology & Cardiac Surgery',
      'Neurology & Neurosurgery',
      'Kidney & Liver Transplant',
      'Gastroenterology',
      'Orthopedics & Joint Replacement',
      'Nephrology'
    ],
    departments: ['Oncology', 'Cardiology', 'Neurology', 'Organ Transplant', 'Gastroenterology', 'Orthopedics', 'Nephrology'],
    highlights: [
      'Ranked among India top destinations for international patient care',
      'Robotic cardiac and oncology surgical units',
      'Rapid visa assistance and dedicated patient support'
    ],
    description: 'Max Super Speciality Hospital in Saket, Delhi brings together cutting-edge medical technology and renowned clinical specialists.',
    ayushSupport: true
  },
  {
    id: 'aiims-delhi',
    name: 'AIIMS – All India Institute of Medical Sciences',
    location: 'Ansari Nagar, New Delhi',
    city: 'New Delhi',
    image: '/images/hospitals/facades/aiims.jpg',
    logo: 'AIIMS',
    logoUrl: '/images/hospitals/logos/aiims.png',
    brandColor: '#2E7D32',
    rotate: '0deg',
    specialties: [
      'Neurology & Neurosurgery',
      'Cardiology & Cardiac Surgery',
      'Oncology (Dr. BRA IRCH)',
      'Organ Transplant',
      'Gastroenterology',
      'Nephrology',
      'Orthopedics',
      'Pediatrics',
      'Rare & Complex Diseases'
    ],
    departments: ['Neurology', 'Cardiology', 'Oncology', 'Organ Transplant', 'Gastroenterology', 'Nephrology', 'Orthopedics', 'Pediatrics'],
    highlights: [
      'India top-ranked national medical and research institute',
      'Apex referral center for complex and rare medical conditions',
      'Led by the country foremost senior professors and surgeons'
    ],
    description: 'India premier national medical institute and apex referral center for intricate, long-term, and rare clinical treatments.',
    ayushSupport: true
  }
];
