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
  name: string;
  image: string;
  rotate: string;
}
