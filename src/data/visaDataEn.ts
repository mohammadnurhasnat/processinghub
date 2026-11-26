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
      'Online Visa Application Form',
      'National ID Card (NID) / Birth Registration Certificate',
      'Utility Bill Copy',
      'Bank Statement / Dollar Endorsement',
      'Proof of Occupation / Profession',
      'Passport Photocopy (Pages 2 & 3)'
    ],
    specialNotes: [
      'All documents must be arranged strictly in the serial order listed above',
      'All previous / old passports must be submitted'
    ]
  },
  {
    id: 'medical-visa',
    title: 'Medical & Attendant Visa',
    category: 'Medical Care (M-1 / M-2)',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    description: 'Doctor appointment, hospital invitation and AYUSH letter collection from top Indian hospitals, plus urgent IVAC slot and processing for Patient (M-1) and Attendant (M-2).',
    price: '৳6,000',
    per: '/ incl. processing & slot',
    waText: 'Hello Processing Hub, I want to book Indian Medical & Attendant Visa processing with slot (Total: ৳6,000, including ৳1,500 IVAC fee).',
    documents: [
      'Online Medical (M-1) / Attendant (M-2) Application Form',
      'Specific-Dated Hospital Appointment Letter & Ayush Letter',
      'National ID Card (NID) / Birth Registration Certificate',
      'Utility Bill Copy',
      'Bank Statement / Dollar Endorsement',
      'Proof of Occupation / Profession',
      'Copies of Recent Medical Documents & Test Reports',
      'Passport Photocopy (Pages 2 & 3)'
    ],
    specialNotes: [
      'Original medical documents must be brought along at submission',
      'All documents must be arranged strictly in the serial order listed above',
      'All previous / old passports must be submitted',
      'Medical Attendant (M-2) applicants do not need separate medical reports; only common documents and proof of relationship with the patient are required'
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
      'Online Application Form (Miscellaneous X-3 Double Entry)',
      'Official 3rd-Country / European Embassy Appointment Letter',
      'Work Permit / Employment Contract & Confirmed Travel Route / Cover Letter',
      'National ID Card (NID) / Birth Registration Certificate',
      'Utility Bill Copy',
      'Bank Statement / Dollar Endorsement',
      'Proof of Occupation / Profession',
      'Passport Photocopy (Pages 2 & 3)'
    ],
    specialNotes: [
      'Original / verified copies of the embassy appointment and work permit must be brought along',
      'All documents must be arranged strictly in the serial order listed above',
      'All previous / old passports must be submitted'
    ]
  },
  {
    id: 'business-visa',
    title: 'Business Visa',
    category: 'Trade & Commerce (B-1 / B-2)',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    description: 'Complete business visa processing with Indian company invitation letter, company letterhead request, renewed trade license, TIN, VAT, Chamber of Commerce, IRC/ERC, Memorandum, L/C, IVAC fee, and slot.',
    price: '৳6,000',
    per: '/ incl. processing & slot',
    waText: 'Hello Processing Hub, I want to book Indian Business Visa processing with slot (Total: ৳6,000, including ৳1,500 IVAC fee).',
    documents: [
      'Online Business Visa Application Form',
      'Visa Invitation Letter (from Indian Company)',
      'National ID Card (NID) / Birth Registration Certificate',
      'Utility Bill Copy',
      'Personal Bank Statement',
      'Company Bank Statement',
      'Visa Request / Forwarding Letter on Company Letterhead',
      'Monthly Salary Certificate',
      'Renewed Trade License',
      'Renewed Income Tax Certificate (TIN / Return)',
      'VAT Registration Certificate (BIN)',
      'Renewed Chamber of Commerce / Association Membership Certificate',
      'Renewed Import & Export Certificate (IRC / ERC)',
      'Company Memorandum of Association (MoA)',
      'Letter of Credit (L/C)',
      'Passport Photocopy (Pages 2 & 3)'
    ],
    specialNotes: [
      'All documents must be arranged strictly in the serial order listed above',
      'All previous / old passports must be submitted'
    ]
  },
  {
    id: 'student-visa',
    title: 'Student Visa (S-1)',
    category: 'Higher Education (S-1)',
    image: '/images/services/student-visa.jpg',
    description: 'Complete Student Visa package with Indian university admission and bonafide certificate verification, bank solvency preparation, IVAC fee (৳1,500), and slot.',
    price: '৳5,500',
    per: '/ incl. processing & slot',
    waText: 'Hello Processing Hub, I want to book Indian Student Visa (S-1) processing with slot (Total: ৳5,500, including ৳1,500 IVAC fee & ৳3,000 slot + ৳1,000 processing).',
    documents: [
      'Online Application Form (Student Visa S-1)',
      'Original Admission Letter & Bonafide Certificate from Indian University/College',
      'Previous Academic Certificates, Mark Sheets & Health Ministry NOC (if Medical College)',
      'National ID Card (NID) / Birth Registration Certificate',
      'Utility Bill Copy',
      'Guardian/Sponsor Bank Solvency & 6-Month Bank Statement / Dollar Endorsement',
      'Current Student ID Card (Academic / Occupational Proof)',
      'Passport Photocopy (Pages 2 & 3)'
    ],
    specialNotes: [
      'Original admission letter and academic certificates must be brought along',
      'All documents must be arranged strictly in the serial order listed above',
      'All previous / old passports must be submitted'
    ]
  },
  {
    id: 'transit-visa',
    title: 'Transit Visa (TR)',
    category: 'Border Transit (TR)',
    image: '/images/services/transit-visa.jpg',
    description: 'Complete Transit Visa processing for traveling through India to Nepal or Bhutan, including confirmed tickets, hotel booking, port selection, IVAC fee (৳1,500), and slot.',
    price: '৳5,500',
    per: '/ incl. processing & slot',
    waText: 'Hello Processing Hub, I want to book Indian Transit Visa (TR) processing with slot (Total: ৳5,500, including ৳1,500 IVAC fee & ৳3,000 slot + ৳1,000 processing).',
    documents: [
      'Online Transit Visa (TR) Application Form',
      'Bus Ticket Copy (Onward & Return)',
      'Hotel Booking Confirmation',
      'National ID Card (NID) / Birth Registration Certificate',
      'Utility Bill Copy',
      'Bank Statement / Dollar Endorsement',
      'Proof of Occupation / Profession',
      'Passport Photocopy (Pages 2 & 3)'
    ],
    portNote: 'Bhutan: Changrabandha / Jaigaon · Nepal: Changrabandha / Raniganj (Nepal Visa Mandatory)',
    specialNotes: [
      'Original bus ticket must be brought along at submission',
      'All documents must be arranged strictly in the serial order listed above',
      'All previous / old passports must be submitted'
    ]
  },
  {
    id: 'entry-visa',
    title: 'Entry Visa (X-Misc)',
    category: 'Miscellaneous (X-Misc)',
    image: '/images/services/entry-visa-desk.jpg',
    description: 'Complete Miscellaneous (X-Misc) Entry Visa processing including document verification, eligibility proof attachment, IVAC fee, slot (৳4,500), and service charge (৳1,500).',
    price: '৳6,000',
    per: '/ slot ৳4,500 + service ৳1,500',
    waText: 'Hello Processing Hub, I want to book Indian Entry Visa (X-Misc) processing with slot (Total: ৳6,000 = ৳4,500 slot + ৳1,500 processing).',
    documents: [
      'Online Entry Visa (X-Misc) Application Form',
      'Passport Photocopy (B — Principal / Inviting Holder)',
      'Visa Photocopy (B) / All Relevant & Relationship Supporting Documents',
      'National ID Card (NID) / Birth Registration Certificate',
      'Utility Bill Copy',
      'Bank Statement',
      'Proof of Occupation / Profession',
      'Passport Photocopy (Pages 2 & 3)'
    ],
    specialNotes: [
      'All documents must be arranged strictly in the serial order listed above',
      'All previous / old passports must be submitted'
    ]
  },
  {
    id: 'spouse-visa',
    title: 'Spouse & Family Visa (X-1)',
    category: 'Miscellaneous (X-1)',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    description: 'Complete Miscellaneous (X-1) Spouse & Family Visa package for spouses and children of Indian citizens or valid visa holders, including slot (৳4,500) and document service (৳1,500).',
    price: '৳6,000',
    per: '/ slot ৳4,500 + service ৳1,500',
    waText: 'Hello Processing Hub, I want to book Indian Spouse / Family Visa (X-1) processing with slot (Total: ৳6,000 = ৳4,500 slot + ৳1,500 processing).',
    documents: [
      'Online Application Form (Spouse & Family X-1)',
      'Nikahnama / Official Marriage Certificate (English Translated & Attested)',
      'Indian Spouse Passport / Aadhaar / Voter ID & Address Proof (or Principal Visa Copy)',
      'National ID Card (NID) / Birth Registration Certificate',
      'Utility Bill Copy',
      'Bank Statement / Dollar Endorsement',
      'Proof of Occupation / Profession (if applicable)',
      'Passport Photocopy (Pages 2 & 3)'
    ],
    specialNotes: [
      'Original marriage certificate and relationship documents must be brought along',
      'All documents must be arranged strictly in the serial order listed above',
      'All previous / old passports must be submitted'
    ]
  },
  {
    id: 'ticket-booking',
    title: 'Ticket Booking',
    category: 'Travel & Transit',
    image: '/images/services/ticket-booking.jpg',
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
    image: '/images/services/slot-booking-ivac.jpg',
    description: 'Slot-only booking starts from ৳4,500 (including fixed ৳1,500 IVAC fee). Only your Web File and one SIM card are required—up to 4 Web File slots can be booked under one SIM account.',
    price: '৳4,500+',
    per: '/ starts from ৳4,500 (incl. IVAC fee)',
    waText: 'Hello Processing Hub, I want to book an Indian Visa Appointment Slot (Starting from ৳4,500 including ৳1,500 IVAC fee).',
    isSlotBooking: true,
    documents: [
      'Online Visa Application Web File (Mandatory)',
      'One SIM Card (Optional — check this box if you will provide your own SIM with your Web File; if not provided, we will arrange a SIM for an extra charge)'
    ],
    specialNotes: [
      'The slot booking rule is identical across all visa categories—only a Web File and one SIM card are required, with no additional documents needed.',
      'Under official IVAC regulations, only one account can be created per SIM card, and a maximum of 4 Web File slots (4 appointment dates) can be booked under one account—no more than 4.',
      'If you do not provide your own SIM card, our team will arrange a SIM, open the account, and book your slot by uploading your Web File; an extra charge applies for the SIM.'
    ]
  },
  {
    id: 'mofa-notary-translation',
    title: 'Notary & Document Translation',
    category: 'Documentation & Translation',
    image: '/images/services/mofa-notary.jpg',
    description: 'Certified English translation and Notary Public assistance for Nikahnama, marriage/birth certificates, police clearance, academic certificates, and trade licenses.',
    price: '৳1,200+',
    per: '/ per document (depends on type)',
    waText: 'Hello Processing Hub, I need Notary Public and Certified English Document Translation assistance (Starting from ৳1,200).',
    documents: [
      'Original certificate or document (Bengali Nikahnama, Marriage/Birth Certificate, Police Clearance, or Trade License)',
      'Clear copy of applicant passport and NID (to match exact spelling in translation)',
      'Supporting relationship or principal documents for Spouse (X-1) or Entry cases',
      'Authorization details for Notary Public & translation file handling (if applicable)',
      'Contact phone number and preferred turnaround timeline'
    ]
  },
  {
    id: 'medical-cost-airport-pickup',
    title: 'Hospital Cost Estimate & Airport Pickup Guide',
    category: 'Medical Coordination & Logistics',
    image: '/images/services/medical-pickup.jpg',
    description: 'Estimated OPD, diagnostic, and procedure cost ranges across top hospitals in Kolkata, Delhi, Chennai & Hyderabad plus airport/rail pickup and Bengali-speaking coordinator support.',
    price: '৳1,500+',
    per: '/ coordination & guide package',
    waText: 'Hello Processing Hub, I need Indian Hospital Treatment Cost Estimate & Airport/Station Pickup coordination (Starting from ৳1,500).',
    documents: [
      'Recent medical reports, doctor prescriptions, or discharge summary (for treatment cost estimate)',
      'Preferred Indian city and hospital (e.g. Kolkata, Chennai, Delhi, Hyderabad)',
      'Copies of patient and attendant passports and Indian medical visas',
      'Arrival airport, train station, or border port schedule for cab/ambulance pickup',
      'Special requests such as wheelchair assistance or Bengali interpreter'
    ]
  },
  {
    id: 'hotel-rail-bus-package',
    title: 'Hotel Booking & Train/Bus Travel Package',
    category: 'Travel & Accommodation',
    image: '/images/services/hotel-rail-bus.jpg',
    description: 'Verified hospital-adjacent and tourist hotel bookings in Kolkata, Delhi, and Chennai plus Maitree/Bandhan/Mitali Express train or cross-border bus ticketing and full route planning.',
    price: '৳799+',
    per: '/ service charge (route dependent)',
    waText: 'Hello Processing Hub, I want to book Hotel Booking & India Train/Bus Travel Package assistance (Service charge starts from ৳799).',
    documents: [
      'Clear passport copies and valid Indian visa details for all travelers',
      'Entry and return border port (Benapole-Petrapole, Gede, Hili, Changrabandha, or Airport)',
      'Preferred hotel budget and room type near hospital or sightseeing area',
      'Travel dates for Maitree/Bandhan/Mitali Express train or international bus seats',
      'Traveler phone number and WhatsApp contact'
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
