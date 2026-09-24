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
        <p>সঠিক ডকুমেন্টেশন ও অভিজ্ঞ ভিসা কনসালট্যান্টদের সহায়তায় দ্রুততম সময়ে ভারতীয় ভিসা প্রাপ্তি নিশ্চিত করুন। কোনো প্রকার ঝামেলা ছাড়াই নিশ্চিন্তে আবেদন করুন।</p>
        <a 
          id="hero-reserve-btn"
          className="btn-primary" 
          href={`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent('Hello Processing Hub, I would like to get a free consultation for Indian Visa Processing.')}`}
          target="_blank" 
          rel="noopener noreferrer"
        >
          ফ্রি ভিসা পরামর্শ নিন
        </a>
      </div>
    </section>
  );
};
