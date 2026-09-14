import React from 'react';
import { CONFIG } from '../config';
import heroVisaImage from '../assets/images/indian_visa_hero_1789099375163.jpg';

export const Hero: React.FC = () => {
  return (
    <section 
      id="hero-section" 
      className="hero"
      style={{ backgroundImage: `url(${heroVisaImage})` }}
    >
      <div className="hero-content">
        <h1>ভিসা থেকে ভ্রমণ — সম্পূর্ণ সমাধান এক জায়গায়।</h1>
        <p>মেডিকেল, বিজনেস, ডাবল এন্ট্রি ও ট্যুরিস্ট ভিসা — IVAC স্লট বুকিং, ডকুমেন্টেশন, মেডিকেল ইনভাইটেশন লেটার ও ফাইল চেকিং সহ সম্পূর্ণ প্রসেস হবে আমাদের দায়িত্বে। এক্সপার্ট টিম, ঝামেলাহীন প্রসেসিং।</p>
        <a 
          id="hero-reserve-btn"
          className="btn-primary" 
          href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I would like to get a free consultation for Indian Visa Processing.')}`}
          target="_blank" 
          rel="noopener noreferrer"
        >
          ফ্রি কনসালটেশন নিন
        </a>
      </div>
    </section>
  );
};
