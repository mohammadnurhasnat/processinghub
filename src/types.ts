export interface VisaService {
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

export interface SlotType {
  id: string;
  name: string;
  ivacFee: number;
  serviceCharge: number;
  totalFee: number;
}

export interface Destination {
  id: string;
  name: string;
  location: string;
  image: string;
  rotate: string;
  attractions: string[];
  bestTime: string;
  description: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  city: string;
  image: string;
  rotate?: string;
  specialties: string[];
  departments: string[];
  highlights: string[];
  description: string;
  ayushSupport?: boolean;
}
