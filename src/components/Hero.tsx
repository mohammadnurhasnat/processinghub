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
        <h1>সহজ ও নির্ভুল ইন্ডিয়ান ভিসা প্রসেসিং</h1>
        <p>আইভ্যাক (IVAC) স্লট বুকিং, অনলাইন ফরম পূরণ, মেডিকেল ইনভাইটেশন এবং সম্পূর্ণ ফাইল প্রসেসিং সেবা — ঝামেলাহীন ও নির্ভরযোগ্য সাপোর্ট।</p>
        <a 
          id="hero-reserve-btn"
          className="btn-primary" 
          href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I want to apply for an Indian Visa.')}`}
          target="_blank" 
          rel="noopener noreferrer"
        >
          আবেদন শুরু করুন
        </a>
      </div>
    </section>
  );
};
