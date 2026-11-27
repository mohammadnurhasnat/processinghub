import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Stethoscope,
  Building2,
  MapPin,
  User,
  Phone,
  FileText,
  Upload,
  CheckCircle2,
  UserPlus,
  Trash2,
  ChevronDown,
  Send,
  ShieldCheck,
  AlertCircle,
  Paperclip,
} from 'lucide-react';
import { Hospital } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useWhatsApp, HandoffAttachment } from '../context/WhatsAppContext';
import { compressChatAttachment } from '../utils/fileCompressor';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export interface HospitalBranchOption {
  id: string;
  hospitalId: string;
  bnName: string;
  enName: string;
  branches: Array<{ bn: string; en: string }>;
}

export const VERIFIED_HOSPITAL_BRANCHES: HospitalBranchOption[] = [
  {
    id: 'apollo-hospitals',
    hospitalId: 'apollo-hospitals',
    bnName: 'অ্যাপোলো হাসপাতাল (Apollo Hospitals)',
    enName: 'Apollo Hospitals, India',
    branches: [
      { bn: 'চেন্নাই — গ্রিমস রোড (মেইন শাখা)', en: 'Chennai — Greams Road (Flagship)' },
      { bn: 'চেন্নাই — অ্যাপোলো প্রোটন ক্যান্সার সেন্টার (OMR)', en: 'Chennai — Apollo Proton Cancer Centre (OMR)' },
      { bn: 'চেন্নাই — ভানাগারাম (স্পেশালিটি শাখা)', en: 'Chennai — Vanagaram Specialty' },
      { bn: 'কলকাতা — ফুলবাগান (ক্যানাল সার্কুলার রোড)', en: 'Kolkata — Phoolbagan (Canal Circular Road)' },
      { bn: 'নতুন দিল্লি — ইন্দ্রপ্রস্থ অ্যাপোলো (মথুরা রোড)', en: 'New Delhi — Indraprastha Apollo (Mathura Road)' },
      { bn: 'হায়দ্রাবাদ — জুবিলি হিলস', en: 'Hyderabad — Jubilee Hills' },
      { bn: 'ব্যাঙ্গালোর — ব্যানারঘাটা রোড', en: 'Bengaluru — Bannerghatta Road' },
      { bn: 'ব্যাঙ্গালোর — জয়নগর ও শেষাদ্রিপুরম', en: 'Bengaluru — Jayanagar & Seshadripuram' },
      { bn: 'মুম্বাই — নাভি মুম্বাই (CBD বেলাপুর)', en: 'Mumbai — Navi Mumbai (CBD Belapur)' },
      { bn: 'আহমেদাবাদ — গান্ধীনগর হাইওয়ে', en: 'Ahmedabad — Gandhinagar Highway' },
      { bn: 'গুয়াহাটি — জিএস রোড', en: 'Guwahati — GS Road' },
    ],
  },
  {
    id: 'fortis-hospital',
    hospitalId: 'fortis-hospital',
    bnName: 'ফোর্টিস হাসপাতাল (Fortis Healthcare)',
    enName: 'Fortis Hospital',
    branches: [
      { bn: 'কলকাতা — আনন্দপুর (ইএম বাইপাস)', en: 'Kolkata — Anandapur (EM Bypass)' },
      { bn: 'কলকাতা — গড়িয়াহাট (ফোর্টিস মেডিকেল সেন্টার)', en: 'Kolkata — Gariahat Medical Centre' },
      { bn: 'গুরুগ্রাম — ফোর্টিস মেমোরিয়াল রিসার্চ ইনস্টিটিউট (FMRI)', en: 'Gurugram — Fortis Memorial Research Institute (FMRI)' },
      { bn: 'নতুন দিল্লি — ফোর্টিস এসকর্টস হার্ট ইনস্টিটিউট (ওখলা)', en: 'New Delhi — Fortis Escorts Heart Institute (Okhla)' },
      { bn: 'নতুন দিল্লি — বসন্ত কুঞ্জ', en: 'New Delhi — Vasant Kunj' },
      { bn: 'নতুন দিল্লি — শালিমার বাগ', en: 'New Delhi — Shalimar Bagh' },
      { bn: 'নয়ডা — সেক্টর ৬২ (দিল্লি-এনসিআর)', en: 'Noida — Sector 62 (Delhi-NCR)' },
      { bn: 'ব্যাঙ্গালোর — ব্যানারঘাটা রোড', en: 'Bengaluru — Bannerghatta Road' },
      { bn: 'ব্যাঙ্গালোর — কানিংহাম রোড', en: 'Bengaluru — Cunningham Road' },
      { bn: 'মুম্বাই — মুলুন্দ ও ভাসি', en: 'Mumbai — Mulund & Vashi' },
      { bn: 'মোহালি — পাঞ্জাব', en: 'Mohali — Punjab' },
    ],
  },
  {
    id: 'medanta-gurugram',
    hospitalId: 'medanta-gurugram',
    bnName: 'মেডান্টা – দ্য মেডিসিটি (Medanta)',
    enName: 'Medanta – The Medicity',
    branches: [
      { bn: 'গুরুগ্রাম — সেক্টর ৩৮ (দ্য মেডিসিটি মেইন ক্যাম্পাস)', en: 'Gurugram — Sector 38 (The Medicity Flagship)' },
      { bn: 'নতুন দিল্লি — ডিফেন্স কলোনি (মেডান্টা মেডিক্লিনিক)', en: 'New Delhi — Defence Colony Mediclinic' },
      { bn: 'নয়ডা — সেক্টর ৫০ (দিল্লি-এনসিআর)', en: 'Noida — Sector 50 (Delhi-NCR)' },
      { bn: 'লখনউ — অমর শহীদ পথ (গলফ সিটি)', en: 'Lucknow — Amar Shaheed Path (Golf City)' },
      { bn: 'পাটনা — কঙ্করবাগ', en: 'Patna — Kankarbagh' },
      { bn: 'রাঁচি — ইরবা (NH-33)', en: 'Ranchi — Irba (NH-33)' },
      { bn: 'ইন্দোর — বিজয় নগর', en: 'Indore — Vijay Nagar' },
    ],
  },
  {
    id: 'manipal-hospital',
    hospitalId: 'manipal-hospital',
    bnName: 'মণিপাল হাসপাতাল (Manipal Hospitals)',
    enName: 'Manipal Hospital',
    branches: [
      { bn: 'ব্যাঙ্গালোর — ওল্ড এয়ারপোর্ট রোড (মেইন শাখা)', en: 'Bengaluru — Old Airport Road (Flagship)' },
      { bn: 'ব্যাঙ্গালোর — হোয়াইটফিল্ড', en: 'Bengaluru — Whitefield' },
      { bn: 'ব্যাঙ্গালোর — যশবন্তপুর ও হেব্বাল', en: 'Bengaluru — Yeshwanthpur & Hebbal' },
      { bn: 'কলকাতা — মুকুন্দপুর (ইএম বাইপাস)', en: 'Kolkata — Mukundapur (EM Bypass)' },
      { bn: 'কলকাতা — সল্টলেক (সেক্টর ৩)', en: 'Kolkata — Salt Lake (Sector III)' },
      { bn: 'কলকাতা — ঢাকুরিয়া ও ব্রডওয়ে', en: 'Kolkata — Dhakuria & Broadway' },
      { bn: 'নতুন দিল্লি — দ্বারকা (সেক্টর ৬)', en: 'New Delhi — Dwarka (Sector 6)' },
      { bn: 'গুরুগ্রাম — পালাম বিহার', en: 'Gurugram — Palam Vihar' },
      { bn: 'জয়পুর — বিদ্যাধর নগর', en: 'Jaipur — Vidhyadhar Nagar' },
      { bn: 'পুনে — খারাদি ও বানের', en: 'Pune — Kharadi & Baner' },
    ],
  },
  {
    id: 'yashoda-hospitals',
    hospitalId: 'yashoda-hospitals',
    bnName: 'যশোদা হাসপাতাল (Yashoda Hospitals)',
    enName: 'Yashoda Hospitals',
    branches: [
      { bn: 'হায়দ্রাবাদ — সোমাজিগুদা শাখা', en: 'Hyderabad — Somajiguda Branch' },
      { bn: 'হায়দ্রাবাদ — সেকেন্দ্রাবাদ শাখা', en: 'Hyderabad — Secunderabad Branch' },
      { bn: 'হায়দ্রাবাদ — মালাকপেট শাখা', en: 'Hyderabad — Malakpet Branch' },
      { bn: 'হায়দ্রাবাদ — হাইটেক সিটি (Hitec City) শাখা', en: 'Hyderabad — Hitec City Branch' },
    ],
  },
  {
    id: 'narayana-superspeciality',
    hospitalId: 'narayana-superspeciality',
    bnName: 'নারায়ণা সুপারস্পেশালিটি হাসপাতাল (Narayana Health)',
    enName: 'Narayana Superspeciality Hospital',
    branches: [
      { bn: 'হাওড়া / কলকাতা — আন্দুল রোড (সুপারস্পেশালিটি)', en: 'Howrah / Kolkata — Andul Road Superspeciality' },
      { bn: 'কলকাতা — মুকুন্দপুর (রবীন্দ্রনাথ ঠাকুর RTIICS)', en: 'Kolkata — Mukundapur (Rabindranath Tagore RTIICS)' },
      { bn: 'কলকাতা — বারাসাত (যশোর রোড)', en: 'Kolkata — Barasat (Jessore Road)' },
      { bn: 'ব্যাঙ্গালোর — নারায়ণা হেলথ সিটি (বোম্মাসান্দ্রা মেইন)', en: 'Bengaluru — Narayana Health City (Bommasandra Flagship)' },
      { bn: 'নতুন দিল্লি — ধরমশীলা নারায়ণা সুপারস্পেশালিটি', en: 'New Delhi — Dharamshila Narayana Superspeciality' },
      { bn: 'গুরুগ্রাম — ডিএলএফ ফেজ ৩', en: 'Gurugram — DLF Phase 3' },
      { bn: 'গুয়াহাটি — আমিনগাঁও', en: 'Guwahati — Amingaon' },
      { bn: 'জয়পুর — প্রতাপ নগর', en: 'Jaipur — Pratap Nagar' },
    ],
  },
  {
    id: 'rtiics-kolkata',
    hospitalId: 'rtiics-kolkata',
    bnName: 'রবীন্দ্রনাথ ঠাকুর হাসপাতাল (RTIICS, Kolkata)',
    enName: 'Rabindranath Tagore Hospital (RTIICS)',
    branches: [
      { bn: 'কলকাতা — মুকুন্দপুর (ইএম বাইপাস মেইন ক্যাম্পাস)', en: 'Kolkata — Mukundapur (EM Bypass Main Campus)' },
      { bn: 'হাওড়া — আন্দুল রোড (নারায়ণা সুপারস্পেশালিটি)', en: 'Howrah — Andul Road (Narayana Superspeciality)' },
      { bn: 'ব্যাঙ্গালোর — নারায়ণা ইনস্টিটিউট অব কার্ডিয়াক সায়েন্সেস', en: 'Bengaluru — Narayana Institute of Cardiac Sciences' },
    ],
  },
  {
    id: 'desun-kolkata',
    hospitalId: 'desun-kolkata',
    bnName: 'দেশুন হাসপাতাল ও হার্ট ইনস্টিটিউট (Desun Hospital)',
    enName: 'Desun Hospital & Heart Institute',
    branches: [
      { bn: 'কলকাতা — কসবা গোলপার্ক (ইএম বাইপাস মেইন শাখা)', en: 'Kolkata — Kasba Golpark (EM Bypass Main Branch)' },
      { bn: 'শিলিগুড়ি — কাওয়াখালি (উত্তরবঙ্গ শাখা)', en: 'Siliguri — Kawakhali (North Bengal Branch)' },
    ],
  },
  {
    id: 'peerless-kolkata',
    hospitalId: 'peerless-kolkata',
    bnName: 'পিয়ারলেস হাসপাতাল (Peerless Hospital)',
    enName: 'Peerless Hospital',
    branches: [
      { bn: 'কলকাতা — পঞ্চসায়র (ইএম বাইপাস মেইন শাখা)', en: 'Kolkata — Panchasayar (EM Bypass Flagship)' },
      { bn: 'গুয়াহাটি — অহম গাঁও (আসাম শাখা)', en: 'Guwahati — Ahom Gaon (Assam Branch)' },
    ],
  },
  {
    id: 'max-healthcare',
    hospitalId: 'max-healthcare',
    bnName: 'ম্যাক্স সুপার স্পেশালিটি হাসপাতাল (Max Healthcare)',
    enName: 'Max Super Speciality Hospital',
    branches: [
      { bn: 'নতুন দিল্লি — সাকেত (ইস্ট ও ওয়েস্ট ব্লক মেইন)', en: 'New Delhi — Saket (East & West Block Flagship)' },
      { bn: 'নতুন দিল্লি — বিএলকে-ম্যাক্স (পুসা রোড)', en: 'New Delhi — BLK-Max (Pusa Road)' },
      { bn: 'নতুন দিল্লি — পাটপরগঞ্জ', en: 'New Delhi — Patparganj' },
      { bn: 'নতুন দিল্লি — শালিমার বাগ', en: 'New Delhi — Shalimar Bagh' },
      { bn: 'গাজিয়াবাদ / দিল্লি-এনসিআর — বৈশালী', en: 'Ghaziabad / Delhi-NCR — Vaishali' },
      { bn: 'গুরুগ্রাম — সেক্টর ৪৩', en: 'Gurugram — Sector 43' },
      { bn: 'মুম্বাই — নানাভাতি-ম্যাক্স (ভিলে পার্লে)', en: 'Mumbai — Nanavati-Max (Vile Parle)' },
      { bn: 'মোহালি — পাঞ্জাব', en: 'Mohali — Punjab' },
    ],
  },
  {
    id: 'mgm-healthcare',
    hospitalId: 'mgm-healthcare',
    bnName: 'এমজিএম হেলথকেয়ার (MGM Healthcare)',
    enName: 'MGM Healthcare, Chennai',
    branches: [
      { bn: 'চেন্নাই — নেলসন মানিক্কম রোড (আমিনজিকারাই মেইন)', en: 'Chennai — Nelson Manickam Road (Aminjikarai Flagship)' },
      { bn: 'চেন্নাই — মালার আদায়ার (MGM Malar)', en: 'Chennai — Adyar (MGM Malar Campus)' },
    ],
  },
  {
    id: 'miot-international',
    hospitalId: 'miot-international',
    bnName: 'মিওট ইন্টারন্যাশনাল (MIOT International)',
    enName: 'MIOT International, Chennai',
    branches: [
      { bn: 'চেন্নাই — মানাপাক্কম (মাউন্ট পুনামাল্লি রোড মেইন)', en: 'Chennai — Manapakkam (Mount Poonamallee Road Flagship)' },
    ],
  },
  {
    id: 'ganga-ram-hospital',
    hospitalId: 'ganga-ram-hospital',
    bnName: 'স্যার গঙ্গা রাম হাসপাতাল (Sir Ganga Ram Hospital)',
    enName: 'Sir Ganga Ram Hospital, New Delhi',
    branches: [
      { bn: 'নতুন দিল্লি — রাজিন্দর নগর (মেইন ক্যাম্পাস)', en: 'New Delhi — Old Rajinder Nagar (Main Campus)' },
      { bn: 'নতুন দিল্লি — পুসা রোড (সিটি হাসপাতাল ইউনিট)', en: 'New Delhi — Pusa Road (City Hospital Unit)' },
    ],
  },
  {
    id: 'artemis-hospitals',
    hospitalId: 'artemis-hospitals',
    bnName: 'আর্টেমিস হাসপাতাল (Artemis Hospital)',
    enName: 'Artemis Hospital, Gurugram',
    branches: [
      { bn: 'গুরুগ্রাম — সেক্টর ৫১ (দিল্লি-এনসিআর মেইন ক্যাম্পাস)', en: 'Gurugram — Sector 51 (Delhi-NCR Flagship Campus)' },
      { bn: 'নতুন দিল্লি — দ্বারকা (ড্যাফোডিলস বাই আর্টেমিস)', en: 'New Delhi — Dwarka Unit' },
    ],
  },
  {
    id: 'aiims-delhi',
    hospitalId: 'aiims-delhi',
    bnName: 'এইমস – AIIMS (All India Institute of Medical Sciences)',
    enName: 'AIIMS – All India Institute of Medical Sciences',
    branches: [
      { bn: 'নতুন দিল্লি — আনসারি নগর (AIIMS New Delhi মেইন)', en: 'New Delhi — Ansari Nagar (AIIMS New Delhi Flagship)' },
      { bn: 'কল্যাণী — পশ্চিমবঙ্গ (AIIMS Kalyani)', en: 'Kalyani — West Bengal (AIIMS Kalyani)' },
      { bn: 'ভুবনেশ্বর — ওড়িশা (AIIMS Bhubaneswar)', en: 'Bhubaneswar — Odisha (AIIMS Bhubaneswar)' },
      { bn: 'যোধপুর — রাজস্থান (AIIMS Jodhpur)', en: 'Jodhpur — Rajasthan (AIIMS Jodhpur)' },
      { bn: 'পাটনা — বিহার (AIIMS Patna)', en: 'Patna — Bihar (AIIMS Patna)' },
      { bn: 'হৃষীকেশ — উত্তরাখণ্ড (AIIMS Rishikesh)', en: 'Rishikesh — Uttarakhand (AIIMS Rishikesh)' },
    ],
  },
  {
    id: 'cmc-vellore',
    hospitalId: 'cmc-vellore',
    bnName: 'সিএমসি ভেলোর (CMC Vellore)',
    enName: 'Christian Medical College (CMC) Vellore',
    branches: [
      { bn: 'ভেলোর — আইডা স্কুডার রোড (মেইন টাউন ক্যাম্পাস)', en: 'Vellore — Ida Scudder Road (Main Town Campus)' },
      { bn: 'রানিপেট — কন্নমঙ্গলম (নতুন সুপার-স্পেশালিটি ক্যাম্পাস)', en: 'Ranipet — Kannigapuram (Super-Specialty Campus)' },
      { bn: 'চিত্তুর — অন্ধ্রপ্রদেশ ক্যাম্পাস', en: 'Chittoor — Andhra Pradesh Campus' },
    ],
  },
  {
    id: 'medica-kolkata',
    hospitalId: 'medica-kolkata',
    bnName: 'মেডিকা সুপারস্পেশালিটি হাসপাতাল (Medica Superspecialty)',
    enName: 'Medica Superspecialty Hospital',
    branches: [
      { bn: 'কলকাতা — মুকুন্দপুর (ইএম বাইপাস মেইন শাখা)', en: 'Kolkata — Mukundapur (EM Bypass Flagship)' },
      { bn: 'শিলিগুড়ি — মেডিকা নর্থ বেঙ্গল ক্লিনিক ও ক্যান্সার হাসপাতাল', en: 'Siliguri — Medica North Bengal Clinic & Cancer Hospital' },
      { bn: 'রাঁচি — ভগবান মহাবীর মেডিকা সুপারস্পেশালিটি', en: 'Ranchi — Bhagwan Mahavir Medica Superspecialty' },
    ],
  },
  {
    id: 'tata-memorial',
    hospitalId: 'tata-memorial',
    bnName: 'টাটা মেমোরিয়াল হাসপাতাল (Tata Memorial Hospital)',
    enName: 'Tata Memorial Hospital',
    branches: [
      { bn: 'মুম্বাই — পারেল (মেইন ক্যান্সার ইনস্টিটিউট)', en: 'Mumbai — Parel (Main Cancer Institute)' },
      { bn: 'নাভি মুম্বাই — খারঘর (ACTREC ক্যাম্পাস)', en: 'Navi Mumbai — Kharghar (ACTREC Campus)' },
      { bn: 'কলকাতা — রাজারহাট নিউ টাউন (টাটা মেডিকেল সেন্টার)', en: 'Kolkata — Rajarhat New Town (Tata Medical Center)' },
    ],
  },
  {
    id: 'sankara-nethralaya',
    hospitalId: 'sankara-nethralaya',
    bnName: 'শঙ্কর নেত্রালয় চক্ষু হাসপাতাল (Sankara Nethralaya)',
    enName: 'Sankara Nethralaya Eye Hospital',
    branches: [
      { bn: 'চেন্নাই — কলেজ রোড (নুঙ্গামবাক্কাম মেইন শাখা)', en: 'Chennai — College Road (Nungambakkam Flagship)' },
      { bn: 'কলকাতা — মুকুন্দপুর (ইএম বাইপাস শাখা)', en: 'Kolkata — Mukundapur (EM Bypass Branch)' },
      { bn: 'কলকাতা — রাজারহাট নিউ টাউন শাখা', en: 'Kolkata — Rajarhat New Town Branch' },
    ],
  },
  {
    id: 'aig-hyderabad',
    hospitalId: 'aig-hyderabad',
    bnName: 'এআইজি হাসপাতাল (AIG Hospitals, Hyderabad)',
    enName: 'AIG Hospitals (Asian Institute of Gastroenterology)',
    branches: [
      { bn: 'হায়দ্রাবাদ — গাচিবৌলি (মাইন্ডস্পেস রোড মেইন)', en: 'Hyderabad — Gachibowli (Mindspace Road Flagship)' },
      { bn: 'হায়দ্রাবাদ — সোমাজিগুদা শাখা', en: 'Hyderabad — Somajiguda Branch' },
    ],
  },
  {
    id: 'rela-hospital',
    hospitalId: 'rela-hospital',
    bnName: 'রেলা হাসপাতাল (Rela Hospital, Chennai)',
    enName: 'Rela Hospital (Dr. Mohamed Rela Institute)',
    branches: [
      { bn: 'চেন্নাই — ক্রোমপেট (জিএসটি রোড মেইন ক্যাম্পাস)', en: 'Chennai — Chromepet (GST Road Flagship Campus)' },
    ],
  },
];

export const MEDICAL_DEPARTMENTS_LIST: Array<{ id: string; bn: string; en: string; keywords: string }> = [
  { id: 'Cardiology', bn: 'কার্ডিওলজি ও হৃদরোগ (Cardiology & Heart Surgery)', en: 'Cardiology & Heart Surgery', keywords: 'heart cardiac bypass valve হার্ট হৃদরোগ বুক ব্যথা বাইপাস' },
  { id: 'Oncology', bn: 'অনকোলজি ও ক্যান্সার (Oncology & Cancer Care)', en: 'Oncology & Cancer Care', keywords: 'cancer tumor chemo radiation ক্যান্সার টিউমার কেমো রেডিয়েশন' },
  { id: 'Urology', bn: 'ইউরোলজি ও প্রোস্টেট (Urology)', en: 'Urology & Prostate Care', keywords: 'urology kidney stone bladder prostate ইউরোলজি মূত্রনালী প্রোস্টেট পাথর' },
  { id: 'Gastroenterology', bn: 'গ্যাস্ট্রোএন্টারোলজি ও পরিপাকতন্ত্র (Gastroenterology)', en: 'Gastroenterology & Digestive Care', keywords: 'gastro stomach ulcer endoscopy colon গ্যাস্ট্রো পেট আলসার লিভার' },
  { id: 'Neurology', bn: 'নিউরোলজি ও নিউরোসার্জারি (Neurology & Brain)', en: 'Neurology & Neurosurgery', keywords: 'neuro brain stroke spine paralysis নিউরো ব্রেন মস্তিষ্ক স্ট্রোক প্যারালাইসিস' },
  { id: 'Nephrology', bn: 'নেফ্রোলজি ও কিডনি রোগ (Nephrology & Kidney)', en: 'Nephrology & Kidney Care', keywords: 'nephrology kidney dialysis renal কিডনি ডায়ালাইসিস নেফ্রোলজি' },
  { id: 'Organ Transplant', bn: 'লিভার, কিডনি ও অঙ্গ প্রতিস্থাপন (Organ Transplant)', en: 'Liver, Kidney & Organ Transplant', keywords: 'transplant liver kidney heart bone marrow প্রতিস্থাপন ট্রান্সপ্লান্ট লিভার কিডনি' },
  { id: 'Orthopedics', bn: 'অর্থোপেডিক্স ও জয়েন্ট প্রতিস্থাপন (Orthopedics & Joint)', en: 'Orthopedics & Joint Replacement', keywords: 'ortho bone knee hip joint fracture অর্থো হাড় জয়েন্ট হাঁটু কোমর' },
  { id: 'Hepatology', bn: 'হেপাটোলজি ও লিভার সিরোসিস (Hepatology & Liver)', en: 'Hepatology & Liver Care', keywords: 'liver cirrhosis hepatitis jaundice লিভার সিরোসিস জন্ডিস হেপাটাইটিস' },
  { id: 'Hematology', bn: 'হেমাটোলজি ও বোন ম্যারো (Hematology & Bone Marrow)', en: 'Hematology & Bone Marrow Transplant', keywords: 'blood thalassemia leukemia bmt রক্ত থ্যালাসেমিয়া বোন ম্যারো' },
  { id: 'Spine Surgery', bn: 'মেরুদণ্ড ও স্পাইন সার্জারি (Spine Surgery)', en: 'Spine & Back Surgery', keywords: 'spine back disc slip মেরুদণ্ড কোমর ব্যথা ডিস্ক' },
  { id: 'Pulmonology', bn: 'বক্ষব্যাধি ও ফুসফুস (Pulmonology & Lungs)', en: 'Pulmonology & Respiratory Care', keywords: 'lung chest asthma breathing ফুসফুস বক্ষব্যাধি শ্বাসকষ্ট' },
  { id: 'Gynecology', bn: 'স্ত্রীরোগ ও বন্ধ্যাত্ব / IVF (Gynecology & Fertility)', en: 'Gynecology, Obstetrics & IVF', keywords: 'gynecology ivf infertility pregnancy স্ত্রীরোগ গাইনি বন্ধ্যাত্ব আইভিএফ' },
  { id: 'Pediatrics', bn: 'শিশু রোগ ও শিশু সার্জারি (Pediatrics)', en: 'Pediatrics & Pediatric Surgery', keywords: 'child baby pediatric heart শিশু বাচ্চা পেডিয়াট্রিক' },
  { id: 'Ophthalmology', bn: 'চক্ষু ও রেটিনা বিভাগ (Ophthalmology & Eye Care)', en: 'Ophthalmology & Eye Surgery', keywords: 'eye retina cornea cataract চোখ চক্ষু রেটিনা ছানি' },
  { id: 'ENT', bn: 'নাক, কান ও গলা (ENT & Head-Neck)', en: 'ENT (Ear, Nose & Throat)', keywords: 'ear nose throat sinus thyroid নাক কান গলা থাইরয়েড' },
  { id: 'Endocrinology', bn: 'ডায়াবেটিস ও হরমোন (Endocrinology & Diabetes)', en: 'Endocrinology, Diabetes & Thyroid', keywords: 'diabetes hormone thyroid ডায়াবেটিস হরমোন থাইরয়েড' },
  { id: 'General Surgery', bn: 'জেনারেল ও ল্যাপারোস্কোপিক সার্জারি (General Surgery)', en: 'General & Laparoscopic Surgery', keywords: 'hernia gallbladder appendix surgery হার্নিয়া পিত্তথলি অপারেশন' },
];

interface RenamedPassportFile {
  originalName: string;
  renamedFileName: string;
  mimeType: string;
  size: number;
  base64Data: string;
  previewUrl?: string;
}

interface AttendantEntry {
  id: string;
  fullName: string;
  gender: string;
  passportNumber: string;
  address: string;
  passportFile: RenamedPassportFile | null;
}

interface SearchableComboboxProps {
  id: string;
  label: string;
  value: string;
  onChange: (nextVal: string, matchedId?: string) => void;
  options: Array<{ id: string; label: string; searchText?: string }>;
  placeholder: string;
  helperText?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  helperText,
  icon,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = value.toLowerCase().trim();
    if (!q) return options;
    const exactMatch = options.some((o) => o.label.toLowerCase() === q);
    if (exactMatch) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.searchText && o.searchText.toLowerCase().includes(q))
    );
  }, [options, value]);

  return (
    <div ref={containerRef} className="relative space-y-1 text-left">
      <label htmlFor={id} className="text-xs font-bold text-[#1E2519] flex items-center gap-1.5">
        {icon}
        <span>{label}</span>
        {required && <span className="text-rose-600">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-3 pr-9 py-2 rounded-lg border border-[#D4CFC2] bg-white text-xs sm:text-[13px] text-[#1E2519] font-medium placeholder:text-[#8E9887] focus:outline-none focus:border-[#1E5624] focus:ring-2 focus:ring-[#1E5624]/15 transition-all"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#64705E] hover:text-[#1E2519] cursor-pointer"
          aria-label="Toggle options"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {helperText && (
        <p className="text-[10.5px] text-[#687461] leading-tight">{helperText}</p>
      )}

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-lg bg-white border border-[#C6D2C4] shadow-lg divide-y divide-[#F2EFE7]">
          {filteredOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.label, opt.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                value === opt.label
                  ? 'bg-[#E8F5E9] text-[#14471E] font-bold'
                  : 'text-[#1E2519] hover:bg-[#F5F8F4]'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.label && <CheckCircle2 className="w-3.5 h-3.5 text-[#1E743B] shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface MedicalInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHospital?: Hospital | null;
}

export const MedicalInvitationModal: React.FC<MedicalInvitationModalProps> = ({
  isOpen,
  onClose,
  initialHospital,
}) => {
  const { language, t, num } = useLanguage();
  const isBn = language === 'bn';
  const { triggerAgentHandoff } = useWhatsApp();

  useBodyScrollLock(isOpen);

  // Patient state
  const [patientName, setPatientName] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientPassportNo, setPatientPassportNo] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientWhatsapp, setPatientWhatsapp] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [patientAddress, setPatientAddress] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [selectedHospitalName, setSelectedHospitalName] = useState('');
  const [selectedBranchName, setSelectedBranchName] = useState('');
  const [patientPassportFile, setPatientPassportFile] = useState<RenamedPassportFile | null>(null);

  // Progressive Attendants (Up to 4)
  const [attendants, setAttendants] = useState<AttendantEntry[]>([]);

  // Status & Validation
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill hospital when opened from a specific Hospital card's "Book Appointment" button
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');

    try {
      const saved = localStorage.getItem('processinghub_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name && !patientName) setPatientName(parsed.name);
        if (parsed?.phone && !patientPhone) {
          setPatientPhone(parsed.phone);
          if (!patientWhatsapp) setPatientWhatsapp(parsed.phone);
        }
      }
    } catch {
      // ignore storage errors
    }

    if (initialHospital) {
      const matchedGroup = VERIFIED_HOSPITAL_BRANCHES.find(
        (h) => h.hospitalId === initialHospital.id || h.id === initialHospital.id
      );
      if (matchedGroup) {
        setSelectedHospitalId(matchedGroup.id);
        setSelectedHospitalName(isBn ? matchedGroup.bnName : matchedGroup.enName);
        if (matchedGroup.branches.length > 0) {
          setSelectedBranchName(isBn ? matchedGroup.branches[0].bn : matchedGroup.branches[0].en);
        }
      } else {
        setSelectedHospitalId(initialHospital.id);
        setSelectedHospitalName(initialHospital.name);
        setSelectedBranchName(initialHospital.location || initialHospital.city);
      }
    }
  }, [isOpen, initialHospital, isBn]);

  useEffect(() => {
    if (sameAsMobile) {
      setPatientWhatsapp(patientPhone);
    }
  }, [sameAsMobile, patientPhone]);

  // Options for Department Combobox
  const departmentOptions = useMemo(
    () =>
      MEDICAL_DEPARTMENTS_LIST.map((d) => ({
        id: d.id,
        label: isBn ? d.bn : d.en,
        searchText: `${d.bn} ${d.en} ${d.keywords}`,
      })),
    [isBn]
  );

  // Options for Hospital Combobox
  const hospitalOptions = useMemo(
    () =>
      VERIFIED_HOSPITAL_BRANCHES.map((h) => ({
        id: h.id,
        label: isBn ? h.bnName : h.enName,
        searchText: `${h.bnName} ${h.enName} ${h.branches.map((b) => `${b.bn} ${b.en}`).join(' ')}`,
      })),
    [isBn]
  );

  // Options for Branch Combobox (dynamically scoped to selected hospital, or all branches if custom hospital typed)
  const branchOptions = useMemo(() => {
    const matchedGroup = VERIFIED_HOSPITAL_BRANCHES.find(
      (h) =>
        h.id === selectedHospitalId ||
        h.bnName.toLowerCase() === selectedHospitalName.toLowerCase().trim() ||
        h.enName.toLowerCase() === selectedHospitalName.toLowerCase().trim() ||
        (selectedHospitalName.trim().length >= 3 &&
          (h.bnName.toLowerCase().includes(selectedHospitalName.toLowerCase().trim()) ||
            h.enName.toLowerCase().includes(selectedHospitalName.toLowerCase().trim())))
    );

    if (matchedGroup) {
      return matchedGroup.branches.map((b, idx) => ({
        id: `${matchedGroup.id}-branch-${idx}`,
        label: isBn ? b.bn : b.en,
        searchText: `${b.bn} ${b.en}`,
      }));
    }

    // Fallback: popular Indian medical hub cities/branches
    const generalBranches = [
      { bn: 'চেন্নাই — মেইন শাখা (Chennai Main Campus)', en: 'Chennai — Main Campus' },
      { bn: 'কলকাতা — ইএম বাইপাস / মুকুন্দপুর (Kolkata EM Bypass)', en: 'Kolkata — EM Bypass / Mukundapur' },
      { bn: 'নতুন দিল্লি / গুরুগ্রাম — মেইন শাখা (New Delhi / NCR)', en: 'New Delhi / Gurugram — Main Campus' },
      { bn: 'ব্যাঙ্গালোর — মেইন শাখা (Bengaluru Main Campus)', en: 'Bengaluru — Main Campus' },
      { bn: 'হায়দ্রাবাদ — মেইন শাখা (Hyderabad Main Campus)', en: 'Hyderabad — Main Campus' },
      { bn: 'ভেলোর — মেইন ক্যাম্পাস (Vellore Main Campus)', en: 'Vellore — Main Campus' },
      { bn: 'মুম্বাই — মেইন শাখা (Mumbai Main Campus)', en: 'Mumbai — Main Campus' },
    ];
    return generalBranches.map((b, idx) => ({
      id: `general-branch-${idx}`,
      label: isBn ? b.bn : b.en,
      searchText: `${b.bn} ${b.en}`,
    }));
  }, [selectedHospitalId, selectedHospitalName, isBn]);

  const genderOptions = useMemo(
    () => [
      { value: isBn ? 'পুরুষ (Male)' : 'Male', label: t('পুরুষ', 'Male') },
      { value: isBn ? 'মহিলা (Female)' : 'Female', label: t('মহিলা', 'Female') },
      { value: isBn ? 'অন্যান্য (Other)' : 'Other', label: t('অন্যান্য', 'Other') },
    ],
    [isBn, t]
  );

  const getFileExtension = (file: File, mimeType: string): string => {
    if (mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return 'pdf';
    }
    if (mimeType === 'image/png') return 'png';
    if (mimeType === 'image/webp') return 'webp';
    return 'jpg';
  };

  const handlePassportUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'patient' | number
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setErrorMsg('');
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg(
        t(
          'ফাইলটি ২৫ MB-এর বেশি। অনুগ্রহ করে ছোট ছবি বা PDF ফাইল নির্বাচন করুন।',
          'File exceeds 25 MB. Please upload a smaller image or PDF.'
        )
      );
      return;
    }

    setIsProcessingFile(true);
    try {
      const compressed = await compressChatAttachment(file);
      if (!compressed.base64Data) {
        throw new Error('Empty file data');
      }

      const ext = getFileExtension(file, compressed.mimeType);
      const renamedBase =
        target === 'patient'
          ? 'Patient_Passport'
          : `Attendant_${target + 1}_Passport`;
      const renamedFileName = `${renamedBase}.${ext}`;

      const renamedObj: RenamedPassportFile = {
        originalName: file.name,
        renamedFileName,
        mimeType: compressed.mimeType,
        size: compressed.size,
        base64Data: compressed.base64Data,
        previewUrl: compressed.mimeType.startsWith('image/') ? compressed.dataUrl : undefined,
      };

      if (target === 'patient') {
        setPatientPassportFile(renamedObj);
      } else {
        setAttendants((prev) =>
          prev.map((att, idx) => (idx === target ? { ...att, passportFile: renamedObj } : att))
        );
      }
    } catch (err) {
      console.error('Passport file compression error:', err);
      setErrorMsg(
        t(
          'পাসপোর্ট ফাইলটি প্রসেস করতে সমস্যা হয়েছে। অনুগ্রহ করে JPG, PNG বা PDF দিন।',
          'Could not process passport file. Please attach a valid JPG, PNG, or PDF.'
        )
      );
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Progressive Attendant Add Handler (max 4 attendants)
  const handleAddAttendant = () => {
    if (attendants.length >= 4) return;
    setAttendants((prev) => [
      ...prev,
      {
        id: `att-${Date.now()}-${prev.length + 1}`,
        fullName: '',
        gender: '',
        passportNumber: '',
        address: patientAddress || '',
        passportFile: null,
      },
    ]);
  };

  const handleRemoveAttendant = (indexToRemove: number) => {
    setAttendants((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateAttendant = (
    index: number,
    field: keyof Omit<AttendantEntry, 'id' | 'passportFile'>,
    val: string
  ) => {
    setAttendants((prev) =>
      prev.map((att, idx) => (idx === index ? { ...att, [field]: val } : att))
    );
  };

  // Determine whether the progressive "Add Attendant" button should show and what its label is
  const canShowAddAttendantBtn = useMemo(() => {
    if (attendants.length === 0) return true; // Show "Add Attendant"
    if (attendants.length >= 4) return false; // Max 4 reached
    // Only show "Add Second / Third / Fourth Attendant" once the last added attendant has Name & Passport filled
    const lastAtt = attendants[attendants.length - 1];
    return (
      lastAtt.fullName.trim().length >= 2 &&
      lastAtt.passportNumber.trim().length >= 4
    );
  }, [attendants]);

  const addAttendantButtonLabel = useMemo(() => {
    const count = attendants.length;
    if (count === 0) {
      return t('+ অ্যাটেনডেন্ট যুক্ত করুন (Add Attendant)', '+ Add Attendant');
    }
    if (count === 1) {
      return t('+ ২য় অ্যাটেনডেন্ট যুক্ত করুন (Add Second Attendant)', '+ Add Second Attendant');
    }
    if (count === 2) {
      return t('+ ৩য় অ্যাটেনডেন্ট যুক্ত করুন (Add Third Attendant)', '+ Add Third Attendant');
    }
    return t('+ ৪র্থ অ্যাটেনডেন্ট যুক্ত করুন (Add Fourth Attendant)', '+ Add Fourth Attendant');
  }, [attendants.length, t]);

  const getAttendantHeading = (idx: number) => {
    const bnOrdinals = ['১ম অ্যাটেনডেন্ট', '২য় অ্যাটেনডেন্ট', '৩য় অ্যাটেনডেন্ট', '৪র্থ অ্যাটেনডেন্ট'];
    const enOrdinals = ['1st Attendant', '2nd Attendant', '3rd Attendant', '4th Attendant'];
    return isBn
      ? `${bnOrdinals[idx]} (${enOrdinals[idx]}) এর বিবরণ`
      : `${enOrdinals[idx]} Details`;
  };

  const handleSubmitToAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = patientName.trim();
    const cleanGender = patientGender.trim();
    const cleanPassport = patientPassportNo.trim().toUpperCase();
    const cleanPhone = patientPhone.trim();
    const cleanWhatsapp = (sameAsMobile ? patientPhone : patientWhatsapp).trim() || cleanPhone;
    const cleanAddress = patientAddress.trim();
    const cleanDept = selectedDepartment.trim();
    const cleanHospital = selectedHospitalName.trim();
    const cleanBranch = selectedBranchName.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg(t('অনুগ্রহ করে রোগীর পূর্ণ নাম লিখুন।', 'Please enter the patient full name.'));
      return;
    }
    if (!cleanGender) {
      setErrorMsg(t('অনুগ্রহ করে রোগীর লিঙ্গ (Gender) নির্বাচন করুন।', 'Please select the patient gender.'));
      return;
    }
    if (!cleanPassport || cleanPassport.length < 5) {
      setErrorMsg(t('অনুগ্রহ করে রোগীর সঠিক পাসপোর্ট নম্বর লিখুন।', 'Please enter a valid patient passport number.'));
      return;
    }
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg(t('অনুগ্রহ করে সঠিক মোবাইল নম্বর লিখুন।', 'Please enter a valid mobile number.'));
      return;
    }
    if (!cleanWhatsapp || cleanWhatsapp.replace(/\D/g, '').length < 10) {
      setErrorMsg(t('অনুগ্রহ করে সঠিক হোয়াটসঅ্যাপ নম্বর লিখুন।', 'Please enter a valid WhatsApp number.'));
      return;
    }
    if (!cleanAddress || cleanAddress.length < 3) {
      setErrorMsg(t('অনুগ্রহ করে রোগীর পূর্ণ ঠিকানা লিখুন।', 'Please enter the patient full address.'));
      return;
    }
    if (!cleanDept) {
      setErrorMsg(
        t(
          'অনুগ্রহ করে রোগের বিভাগ (Department) নির্বাচন করুন বা লিখুন।',
          'Please select or type the medical department.'
        )
      );
      return;
    }
    if (!cleanHospital) {
      setErrorMsg(
        t(
          'অনুগ্রহ করে হাসপাতালের নাম নির্বাচন করুন বা লিখুন।',
          'Please select or type the preferred hospital.'
        )
      );
      return;
    }
    if (!cleanBranch) {
      setErrorMsg(
        t(
          'অনুগ্রহ করে হাসপাতালের শাখা বা ব্রাঞ্চ নির্বাচন করুন বা লিখুন।',
          'Please select or type the hospital branch / location.'
        )
      );
      return;
    }

    // Validate any added attendants
    for (let i = 0; i < attendants.length; i++) {
      const att = attendants[i];
      const ordBn = ['১ম', '২য়', '৩য়', '৪র্থ'][i];
      const ordEn = ['1st', '2nd', '3rd', '4th'][i];
      if (!att.fullName.trim() || att.fullName.trim().length < 2) {
        setErrorMsg(
          t(
            `অনুগ্রহ করে ${ordBn} অ্যাটেনডেন্টের পূর্ণ নাম লিখুন।`,
            `Please enter the ${ordEn} attendant's full name.`
          )
        );
        return;
      }
      if (!att.gender.trim()) {
        setErrorMsg(
          t(
            `অনুগ্রহ করে ${ordBn} অ্যাটেনডেন্টের লিঙ্গ (Gender) নির্বাচন করুন।`,
            `Please select the ${ordEn} attendant's gender.`
          )
        );
        return;
      }
      if (!att.passportNumber.trim() || att.passportNumber.trim().length < 5) {
        setErrorMsg(
          t(
            `অনুগ্রহ করে ${ordBn} অ্যাটেনডেন্টের পাসপোর্ট নম্বর লিখুন।`,
            `Please enter the ${ordEn} attendant's passport number.`
          )
        );
        return;
      }
      if (!att.address.trim() || att.address.trim().length < 3) {
        setErrorMsg(
          t(
            `অনুগ্রহ করে ${ordBn} অ্যাটেনডেন্টের পূর্ণ ঠিকানা লিখুন।`,
            `Please enter the ${ordEn} attendant's full address.`
          )
        );
        return;
      }
    }

    setIsSubmitting(true);

    // Save basic profile locally
    try {
      localStorage.setItem(
        'processinghub_user_profile',
        JSON.stringify({ name: cleanName, phone: cleanPhone })
      );
    } catch {
      // ignore storage errors
    }

    // Collect renamed attachments for Chatbot & Telegram
    const handoffAttachments: HandoffAttachment[] = [];
    const telegramAttachments: Array<{
      roleLabel: string;
      fileName: string;
      mimeType: string;
      base64Data: string;
    }> = [];

    if (patientPassportFile) {
      handoffAttachments.push({
        id: `att-patient-${Date.now()}`,
        name: patientPassportFile.renamedFileName,
        mimeType: patientPassportFile.mimeType,
        size: patientPassportFile.size,
        data: patientPassportFile.base64Data,
        previewUrl: patientPassportFile.previewUrl,
      });
      telegramAttachments.push({
        roleLabel: `রোগীর পাসপোর্ট (${cleanName})`,
        fileName: patientPassportFile.renamedFileName,
        mimeType: patientPassportFile.mimeType,
        base64Data: patientPassportFile.base64Data,
      });
    }

    attendants.forEach((att, idx) => {
      if (att.passportFile) {
        handoffAttachments.push({
          id: `att-attendant-${idx + 1}-${Date.now()}`,
          name: att.passportFile.renamedFileName,
          mimeType: att.passportFile.mimeType,
          size: att.passportFile.size,
          data: att.passportFile.base64Data,
          previewUrl: att.passportFile.previewUrl,
        });
        telegramAttachments.push({
          roleLabel: `অ্যাটেনডেন্ট #${idx + 1} পাসপোর্ট (${att.fullName.trim()})`,
          fileName: att.passportFile.renamedFileName,
          mimeType: att.passportFile.mimeType,
          base64Data: att.passportFile.base64Data,
        });
      }
    });

    // Build structured message to paste into the Live Agent Chatbot
    const attendantsChatBlock =
      attendants.length === 0
        ? isBn
          ? `\n- **অ্যাটেনডেন্ট:** নেই (রোগী একা)`
          : `\n- **Attendants:** None (Single Patient)`
        : attendants
            .map((att, idx) => {
              const ordBn = ['১ম', '২য়', '৩য়', '৪র্থ'][idx];
              const ordEn = ['1st', '2nd', '3rd', '4th'][idx];
              const fileLabel = att.passportFile
                ? att.passportFile.renamedFileName
                : isBn
                  ? 'সংযুক্ত করা হয়নি'
                  : 'Not attached';
              return isBn
                ? `\n**${ordBn} অ্যাটেনডেন্ট (${ordEn} Attendant):**\n- নাম: **${att.fullName.trim()}**\n- লিঙ্গ: ${att.gender}\n- পাসপোর্ট নং: **${att.passportNumber.trim().toUpperCase()}**\n- ঠিকানা: ${att.address.trim()}\n- পাসপোর্ট ফাইল: \`${fileLabel}\``
                : `\n**${ordEn} Attendant:**\n- Name: **${att.fullName.trim()}**\n- Gender: ${att.gender}\n- Passport No: **${att.passportNumber.trim().toUpperCase()}**\n- Address: ${att.address.trim()}\n- Passport Copy: \`${fileLabel}\``;
            })
            .join('\n');

    const patientFileLabel = patientPassportFile
      ? patientPassportFile.renamedFileName
      : isBn
        ? 'সংযুক্ত করা হয়নি (পরবর্তীতে প্রদান করা হবে)'
        : 'Not attached (will provide later)';

    const formattedChatMessage = isBn
      ? `**আর্জেন্ট মেডিকেল ভিসা ইনভাইটেশন ও অ্যাপয়েন্টমেন্ট অনুরোধ**\n\n- **হাসপাতাল:** ${cleanHospital}\n- **শাখা / ব্রাঞ্চ:** ${cleanBranch}\n- **রোগের বিভাগ (Department):** ${cleanDept}\n\n**রোগীর বিবরণ (Patient Details):**\n- পূর্ণ নাম: **${cleanName}**\n- লিঙ্গ (Gender): ${cleanGender}\n- পাসপোর্ট নম্বর: **${cleanPassport}**\n- মোবাইল নম্বর: **${cleanPhone}**\n- হোয়াটসঅ্যাপ নম্বর: **${cleanWhatsapp}**\n- পূর্ণ ঠিকানা: ${cleanAddress}\n- পাসপোর্ট ফাইল: \`${patientFileLabel}\`\n${attendantsChatBlock}`
      : `**Urgent Medical Visa Invitation & Appointment Request**\n\n- **Hospital:** ${cleanHospital}\n- **Branch / Location:** ${cleanBranch}\n- **Medical Department:** ${cleanDept}\n\n**Patient Details:**\n- Full Name: **${cleanName}**\n- Gender: ${cleanGender}\n- Passport Number: **${cleanPassport}**\n- Mobile Number: **${cleanPhone}**\n- WhatsApp Number: **${cleanWhatsapp}**\n- Full Address: ${cleanAddress}\n- Passport Copy: \`${patientFileLabel}\`\n${attendantsChatBlock}`;

    const instantConfirmationReply = isBn
      ? `আসসালামু আলাইকুম! আপনার **${cleanHospital} (${cleanBranch})**-এর মেডিকেল ভিসা ইনভাইটেশন লেটারের অনুরোধ ও সকল তথ্য আমরা পেয়েছি।\n\nআপনার এই ইনভাইটেশনের জন্য অতি শীঘ্রই আমাদের এজেন্ট আপনার মোবাইল (**${cleanPhone}**) বা হোয়াটসঅ্যাপ (**${cleanWhatsapp}**) নম্বরে যোগাযোগ করে কনফার্মেশন জানাবেন।${
          !patientPassportFile
            ? ' যেহেতু পাসপোর্ট কপি এখনো সংযুক্ত করা হয়নি, আপনি চাইলে এই চ্যাটেই পাসপোর্টের ছবি বা PDF পাঠিয়ে রাখতে পারেন।'
            : ''
        }`
      : `Assalamu Alaikum! We have received your Medical Visa Invitation Letter request and details for **${cleanHospital} (${cleanBranch})**.\n\nOur agent will contact you very shortly on your mobile (**${cleanPhone}**) or WhatsApp (**${cleanWhatsapp}**) number to confirm your invitation letter.${
          !patientPassportFile
            ? ' Since a passport copy was not attached yet, feel free to upload your passport image or PDF right here in the chat.'
            : ''
        }`;

    // Dispatch high-priority URGENT MEDICAL VISA INVITATION to Telegram Bot + renamed passport attachments
    fetch('/api/telegram/medical-invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        patient: {
          fullName: cleanName,
          gender: cleanGender,
          passportNumber: cleanPassport,
          phone: cleanPhone,
          whatsappPhone: cleanWhatsapp,
          address: cleanAddress,
          department: cleanDept,
          hospitalName: cleanHospital,
          branchName: cleanBranch,
          hasPassportFile: Boolean(patientPassportFile),
        },
        attendants: attendants.map((att, idx) => ({
          index: idx + 1,
          fullName: att.fullName.trim(),
          gender: att.gender,
          passportNumber: att.passportNumber.trim().toUpperCase(),
          address: att.address.trim(),
          hasPassportFile: Boolean(att.passportFile),
        })),
        attachments: telegramAttachments,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.serialNumber) {
          try {
            localStorage.setItem('processinghub_last_serial', String(data.serialNumber));
          } catch {
            // ignore storage errors
          }
        }
      })
      .catch((err) => console.error('Urgent medical invitation dispatch failed:', err));

    // Close modal and immediately hand off to Live Agent Chatbot with instant confirmation reply
    setIsSubmitting(false);
    onClose();

    triggerAgentHandoff({
      name: cleanName,
      phone: cleanPhone,
      subject: isBn
        ? `মেডিকেল ভিসা ইনভাইটেশন লেটার — ${cleanHospital}`
        : `Medical Visa Invitation Letter — ${cleanHospital}`,
      sectionName: isBn ? 'মেডিকেল ইনভাইটেশন ডেস্ক' : 'Medical Invitation Desk',
      serviceTitle: isBn ? 'মেডিকেল ও অ্যাটেনডেন্ট ভিসা' : 'Medical & Attendant Visa',
      formattedMessage: formattedChatMessage,
      attachments: handoffAttachments,
      instantAgentReply: instantConfirmationReply,
      skipAutoTelegramSummary: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="service-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="medical-invitation-modal-title"
    >
      <div
        className="service-modal-card max-w-2xl bg-white border border-[#C6D2C4] shadow-[0_24px_60px_rgba(18,32,20,0.24)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-[#143D1B] via-[#1B5125] to-[#1E3B52] text-white flex items-start justify-between gap-3">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/15 text-[#D8F5DC] px-2.5 py-0.5 rounded-[5px] border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-[#86EFAC]" />
              <span>
                {t(
                  'আর্জেন্ট মেডিকেল ভিসা ও ডাক্তার ইনভাইটেশন ডেস্ক',
                  'Urgent Medical Visa & Doctor Invitation Desk'
                )}
              </span>
            </div>
            <h3
              id="medical-invitation-modal-title"
              className="text-base sm:text-lg font-bold tracking-tight text-white leading-snug"
            >
              {t(
                'অফিশিয়াল হাসপাতাল ইনভাইটেশন লেটার ও অ্যাপয়েন্টমেন্ট ফর্ম',
                'Official Hospital Invitation Letter & Appointment Form'
              )}
            </h3>
            <p className="text-[11.5px] text-white/85 leading-relaxed">
              {t(
                'রোগীর তথ্য, হাসপাতাল ও শাখা এবং প্রয়োজনে ৪ জন পর্যন্ত অ্যাটেনডেন্টের তথ্য পূরণ করে সরাসরি এজেন্টের কাছে পাঠান।',
                'Fill in patient details, hospital & branch, and up to 4 attendants if needed, then send directly to our live agent.'
              )}
            </p>
          </div>

          <button
            type="button"
            id="medical-invitation-top-close-btn"
            onClick={onClose}
            aria-label={t('বন্ধ করুন', 'Close')}
            className="btn-3d-red-glass w-7 h-7 rounded-[5px] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmitToAgent} className="flex flex-col flex-1 overflow-hidden">
          <div className="service-modal-body p-4 sm:p-5 space-y-5 overflow-y-auto">
            {errorMsg && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ================================================================= */}
            {/* PART 1: PATIENT DETAILS & HOSPITAL / BRANCH / DEPARTMENT          */}
            {/* ================================================================= */}
            <div className="rounded-xl bg-[#FAF9F5] border border-[#DFDBD0] p-3.5 sm:p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#E6E2D6] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-[5px] bg-[#1E5624] text-white text-xs font-bold flex items-center justify-center">
                    {num(1)}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#143D1B]">
                    {t('রোগীর বিবরণ (Patient Details)', 'Patient Details')}
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-[#4E5C46]">
                  {t('* চিহ্নিত ঘরগুলো আবশ্যক', '* Required fields')}
                </span>
              </div>

              {/* Row 1: Patient Full Name + Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 space-y-1 text-left">
                  <label htmlFor="med-patient-name" className="text-xs font-bold text-[#1E2519] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#1E5624]" />
                    <span>{t('রোগীর পূর্ণ নাম (পাসপোর্ট অনুযায়ী)', 'Patient Full Name (As in Passport)')}</span>
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="med-patient-name"
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={t('রোগীর পূর্ণ নাম লিখুন', 'Enter patient full name')}
                    className="w-full px-3 py-2 rounded-lg border border-[#D4CFC2] bg-white text-xs sm:text-[13px] text-[#1E2519] font-medium placeholder:text-[#8E9887] focus:outline-none focus:border-[#1E5624] focus:ring-2 focus:ring-[#1E5624]/15"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1 text-left">
                  <label htmlFor="med-patient-gender" className="text-xs font-bold text-[#1E2519] flex items-center gap-1">
                    <span>{t('লিঙ্গ (Gender)', 'Gender')}</span>
                    <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="med-patient-gender"
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#D4CFC2] bg-white text-xs sm:text-[13px] text-[#1E2519] font-medium focus:outline-none focus:border-[#1E5624]"
                  >
                    <option value="">{t('নির্বাচন করুন', 'Select Gender')}</option>
                    {genderOptions.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Passport Number + Mobile Number + WhatsApp Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 text-left">
                  <label htmlFor="med-patient-passport" className="text-xs font-bold text-[#1E2519] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#1E5624]" />
                    <span>{t('পাসপোর্ট নম্বর', 'Passport Number')}</span>
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="med-patient-passport"
                    type="text"
                    value={patientPassportNo}
                    onChange={(e) => setPatientPassportNo(e.target.value.toUpperCase())}
                    placeholder={t('যেমন: A01234567', 'e.g. A01234567')}
                    className="w-full px-3 py-2 rounded-lg border border-[#D4CFC2] bg-white text-xs sm:text-[13px] text-[#1E2519] font-semibold uppercase placeholder:normal-case placeholder:text-[#8E9887] focus:outline-none focus:border-[#1E5624]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label htmlFor="med-patient-phone" className="text-xs font-bold text-[#1E2519] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#1E5624]" />
                    <span>{t('মোবাইল নম্বর', 'Mobile Number')}</span>
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="med-patient-phone"
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder={t('017XXXXXXXX', '017XXXXXXXX')}
                    className="w-full px-3 py-2 rounded-lg border border-[#D4CFC2] bg-white text-xs sm:text-[13px] text-[#1E2519] font-medium placeholder:text-[#8E9887] focus:outline-none focus:border-[#1E5624]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between gap-1">
                    <label htmlFor="med-patient-whatsapp" className="text-xs font-bold text-[#1E2519] flex items-center gap-1">
                      <span>{t('হোয়াটসঅ্যাপ নম্বর', 'WhatsApp No.')}</span>
                      <span className="text-rose-600">*</span>
                    </label>
                    <label className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#1E5624] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sameAsMobile}
                        onChange={(e) => setSameAsMobile(e.target.checked)}
                        className="rounded border-[#C2D4C4] text-[#1E5624]"
                      />
                      <span>{t('একই নম্বর', 'Same')}</span>
                    </label>
                  </div>
                  <input
                    id="med-patient-whatsapp"
                    type="tel"
                    value={sameAsMobile ? patientPhone : patientWhatsapp}
                    onChange={(e) => {
                      setSameAsMobile(false);
                      setPatientWhatsapp(e.target.value);
                    }}
                    placeholder={t('হোয়াটসঅ্যাপ নম্বর', 'WhatsApp Number')}
                    className="w-full px-3 py-2 rounded-lg border border-[#D4CFC2] bg-white text-xs sm:text-[13px] text-[#1E2519] font-medium placeholder:text-[#8E9887] focus:outline-none focus:border-[#1E5624]"
                  />
                </div>
              </div>

              {/* Row 3: Patient Full Address */}
              <div className="space-y-1 text-left">
                <label htmlFor="med-patient-address" className="text-xs font-bold text-[#1E2519] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1E5624]" />
                  <span>{t('রোগীর পূর্ণ ঠিকানা (Full Address)', 'Patient Full Address')}</span>
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  id="med-patient-address"
                  type="text"
                  value={patientAddress}
                  onChange={(e) => setPatientAddress(e.target.value)}
                  placeholder={t(
                    'গ্রাম/বাসা, থানা/উপজেলা, জেলা ও পোস্ট কোড লিখুন',
                    'House/Village, Police Station/Upazila, District & Postcode'
                  )}
                  className="w-full px-3 py-2 rounded-lg border border-[#D4CFC2] bg-white text-xs sm:text-[13px] text-[#1E2519] font-medium placeholder:text-[#8E9887] focus:outline-none focus:border-[#1E5624]"
                />
              </div>

              {/* Row 4: Disease / Medical Department (Searchable Dropdown + Manual Input) */}
              <SearchableCombobox
                id="med-department-combobox"
                label={t('রোগের বিভাগ / ডিপার্টমেন্ট (তালিকা থেকে বা লিখে দিন)', 'Medical Department / Disease (Select or Type)')}
                value={selectedDepartment}
                onChange={(val) => setSelectedDepartment(val)}
                options={departmentOptions}
                placeholder={t(
                  'যেমন: ইউরোলজি, গ্যাস্ট্রোএন্টারোলজি, কার্ডিওলজি, অনকোলজি...',
                  'e.g. Urology, Gastroenterology, Cardiology, Oncology...'
                )}
                helperText={t(
                  'ড্রপডাউন থেকে সিলেক্ট করুন অথবা তালিকায় না থাকলে সরাসরি টাইপ করে লিখে দিন।',
                  'Pick from the dropdown list or type any condition/department manually.'
                )}
                icon={<Stethoscope className="w-3.5 h-3.5 text-[#1E5624]" />}
                required
              />

              {/* Row 5: Hospital & Branch Selection (Searchable Dropdown + Manual Input) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchableCombobox
                  id="med-hospital-combobox"
                  label={t('হাসপাতাল নির্বাচন করুন (বা লিখে দিন)', 'Select Hospital (or Type Manually)')}
                  value={selectedHospitalName}
                  onChange={(val, matchedId) => {
                    setSelectedHospitalName(val);
                    if (matchedId) {
                      setSelectedHospitalId(matchedId);
                      const grp = VERIFIED_HOSPITAL_BRANCHES.find((h) => h.id === matchedId);
                      if (grp && grp.branches.length > 0) {
                        setSelectedBranchName(isBn ? grp.branches[0].bn : grp.branches[0].en);
                      }
                    } else {
                      setSelectedHospitalId('');
                    }
                  }}
                  options={hospitalOptions}
                  placeholder={t(
                    'হাসপাতালের নাম খুঁজুন বা লিখুন...',
                    'Search or type hospital name...'
                  )}
                  icon={<Building2 className="w-3.5 h-3.5 text-[#1E5624]" />}
                  required
                />

                <SearchableCombobox
                  id="med-branch-combobox"
                  label={t('শাখা বা ব্রাঞ্চ (Branch / Location)', 'Hospital Branch / Location')}
                  value={selectedBranchName}
                  onChange={(val) => setSelectedBranchName(val)}
                  options={branchOptions}
                  placeholder={t(
                    'কোন শাখায় দেখাতে চান নির্বাচন করুন বা লিখুন...',
                    'Select or type hospital branch/city...'
                  )}
                  icon={<MapPin className="w-3.5 h-3.5 text-[#1E5624]" />}
                  required
                />
              </div>

              {/* Row 6: Optional Patient Passport Attachment (Auto-renamed to Patient_Passport) */}
              <div className="pt-1 border-t border-[#E6E2D6] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="text-left">
                  <div className="text-xs font-bold text-[#1E2519] flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#1E5624]" />
                    <span>
                      {t('রোগীর পাসপোর্টের কপি যুক্ত করুন (ঐচ্ছিক)', 'Attach Patient Passport Copy (Optional)')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64705E]">
                    {t(
                      'সংযুক্ত করলে ফাইলটি স্বয়ংক্রিয়ভাবে "Patient_Passport" নামে এজেন্টের কাছে যাবে।',
                      'If attached, the file will be automatically renamed to "Patient_Passport".'
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {patientPassportFile ? (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] bg-[#E8F5E9] border border-[#A5D6A7] text-xs font-bold text-[#14471E]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1E743B] shrink-0" />
                      <span className="truncate max-w-[160px]">{patientPassportFile.renamedFileName}</span>
                      <button
                        type="button"
                        onClick={() => setPatientPassportFile(null)}
                        className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
                        title={t('মুছে ফেলুন', 'Remove file')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="btn-3d-matte-secondary w-fit px-2.5 py-1.5 leading-tight rounded-[5px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('পাসপোর্ট যুক্ত করুন', 'Attach Passport')}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handlePassportUpload(e, 'patient')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* PART 2: PROGRESSIVE ATTENDANT BLOCKS (UP TO 4 ATTENDANTS)         */}
            {/* ================================================================= */}
            {attendants.length > 0 && (
              <div className="space-y-3.5">
                {attendants.map((att, idx) => (
                  <div
                    key={att.id}
                    className="rounded-xl bg-[#F4F7FC] border border-[#C9D5F2] p-3.5 sm:p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#DCE4F7] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-[5px] bg-[#263375] text-white text-xs font-bold flex items-center justify-center">
                          {num(idx + 1)}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#1E2A63]">
                          {getAttendantHeading(idx)}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendant(idx)}
                        className="w-fit px-2 py-1 rounded-[5px] text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{t('বাদ দিন', 'Remove')}</span>
                      </button>
                    </div>

                    {/* Attendant Name + Gender + Passport Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-5 space-y-1 text-left">
                        <label className="text-xs font-bold text-[#1E2519] block">
                          {t('অ্যাটেনডেন্টের পূর্ণ নাম', 'Attendant Full Name')} <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={att.fullName}
                          onChange={(e) => handleUpdateAttendant(idx, 'fullName', e.target.value)}
                          placeholder={t('পাসপোর্ট অনুযায়ী নাম', 'Name as in passport')}
                          className="w-full px-3 py-2 rounded-lg border border-[#C6D0EE] bg-white text-xs text-[#1E2519] font-medium focus:outline-none focus:border-[#263375]"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1 text-left">
                        <label className="text-xs font-bold text-[#1E2519] block">
                          {t('লিঙ্গ (Gender)', 'Gender')} <span className="text-rose-600">*</span>
                        </label>
                        <select
                          value={att.gender}
                          onChange={(e) => handleUpdateAttendant(idx, 'gender', e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-[#C6D0EE] bg-white text-xs text-[#1E2519] font-medium focus:outline-none focus:border-[#263375]"
                        >
                          <option value="">{t('নির্বাচন', 'Select')}</option>
                          {genderOptions.map((g) => (
                            <option key={g.value} value={g.value}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4 space-y-1 text-left">
                        <label className="text-xs font-bold text-[#1E2519] block">
                          {t('পাসপোর্ট নম্বর', 'Passport Number')} <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={att.passportNumber}
                          onChange={(e) =>
                            handleUpdateAttendant(idx, 'passportNumber', e.target.value.toUpperCase())
                          }
                          placeholder={t('যেমন: A01234567', 'e.g. A01234567')}
                          className="w-full px-3 py-2 rounded-lg border border-[#C6D0EE] bg-white text-xs text-[#1E2519] font-semibold uppercase placeholder:normal-case focus:outline-none focus:border-[#263375]"
                        />
                      </div>
                    </div>

                    {/* Attendant Full Address */}
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-bold text-[#1E2519] block">
                        {t('অ্যাটেনডেন্টের পূর্ণ ঠিকানা (Full Address)', 'Attendant Full Address')}{' '}
                        <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={att.address}
                        onChange={(e) => handleUpdateAttendant(idx, 'address', e.target.value)}
                        placeholder={t('পূর্ণ ঠিকানা লিখুন', 'Enter full address')}
                        className="w-full px-3 py-2 rounded-lg border border-[#C6D0EE] bg-white text-xs text-[#1E2519] font-medium focus:outline-none focus:border-[#263375]"
                      />
                    </div>

                    {/* Optional Attendant Passport Upload (Auto-renamed to Attendant_X_Passport) */}
                    <div className="pt-1 border-t border-[#DCE4F7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-left">
                        <span className="text-xs font-bold text-[#1E2A63] block">
                          {t(
                            'অ্যাটেনডেন্টের পাসপোর্ট কপি যুক্ত করুন (ঐচ্ছিক)',
                            'Attach Attendant Passport Copy (Optional)'
                          )}
                        </span>
                        <span className="text-[10.5px] text-[#53607E]">
                          {isBn
                            ? `স্বয়ংক্রিয়ভাবে "Attendant_${idx + 1}_Passport" নামে রিনেম হবে`
                            : `Automatically renamed to "Attendant_${idx + 1}_Passport"`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {att.passportFile ? (
                          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] bg-[#E8F5E9] border border-[#A5D6A7] text-xs font-bold text-[#14471E]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#1E743B] shrink-0" />
                            <span className="truncate max-w-[170px]">{att.passportFile.renamedFileName}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setAttendants((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, passportFile: null } : item))
                                )
                              }
                              className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="btn-3d-matte-secondary w-fit px-2.5 py-1.5 leading-tight rounded-[5px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{t('পাসপোর্ট যুক্ত করুন', 'Attach Passport')}</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handlePassportUpload(e, idx)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Progressive Add Attendant Button (1st -> 2nd -> 3rd -> 4th) */}
            {canShowAddAttendantBtn && (
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#F4F8F4] border border-dashed border-[#9EC5A3]">
                <div className="text-left">
                  <div className="text-xs font-bold text-[#1A4B21]">
                    {attendants.length === 0
                      ? t('রোগীর সাথে কি কোনো অ্যাটেনডেন্ট যাবেন?', 'Will an attendant accompany the patient?')
                      : t(
                          `আরও অ্যাটেনডেন্ট যুক্ত করতে চান? (${num(attendants.length)}/৪ জন যুক্ত হয়েছে)`,
                          `Add another attendant? (${attendants.length}/4 added)`
                        )}
                  </div>
                  <p className="text-[11px] text-[#4E6351]">
                    {t(
                      'সর্বোচ্চ ৪ জন পর্যন্ত অ্যাটেনডেন্ট যুক্ত করা যাবে। একা গেলে ক্লিক করার প্রয়োজন নেই।',
                      'Up to 4 attendants can be added progressively. Skip if patient is traveling alone.'
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  id="add-medical-attendant-btn"
                  onClick={handleAddAttendant}
                  className="btn-3d-matte-secondary w-fit px-3 py-1.5 leading-tight rounded-[5px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{addAttendantButtonLabel}</span>
                </button>
              </div>
            )}

            {attendants.length > 0 && attendants.length < 4 && !canShowAddAttendantBtn && (
              <p className="text-[11px] text-[#5C6957] italic text-left px-1">
                {t(
                  '* বর্তমান অ্যাটেনডেন্টের নাম ও পাসপোর্ট নম্বর পূরণ করলে পরবর্তী অ্যাটেনডেন্ট যুক্ত করার অপশন আসবে।',
                  '* Fill in the current attendant’s name and passport number to unlock the next attendant button.'
                )}
              </p>
            )}
          </div>

          {/* Modal Footer — ONLY Cancel and Send to Agent (NO WhatsApp button) */}
          <div className="service-modal-footer px-4 py-3 sm:px-5 bg-[#F8F7F2] border-t border-[#E3DFD3] flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold text-[#485743] hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1E743B] shrink-0" />
              <span>
                {t(
                  'তথ্যগুলো সরাসরি লাইভ এজেন্ট চ্যাটবট ও আর্জেন্ট ডেস্কে পাঠানো হবে',
                  'Details will be sent directly to our Live Agent & Urgent Medical Desk'
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 justify-end ml-auto">
              <button
                type="button"
                id="medical-invitation-cancel-btn"
                onClick={onClose}
                className="btn-3d-red-glass w-fit px-2.5 py-1.5 leading-tight rounded-[5px] text-xs font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('বাতিল', 'Cancel')}</span>
              </button>

              <button
                type="submit"
                id="medical-invitation-send-agent-btn"
                disabled={isSubmitting || isProcessingFile}
                className="btn-3d-matte-green w-fit px-3 py-1.5 leading-tight rounded-[5px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? t('পাঠানো হচ্ছে...', 'Sending...')
                    : t('এজেন্টের কাছে পাঠান (Send to Agent)', 'Send to Agent')}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
