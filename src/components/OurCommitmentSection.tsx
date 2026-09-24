import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const OurCommitmentSection: React.FC = () => {
  return (
    <section id="our-commitment" className="relative !pt-6 !pb-6 sm:!pt-10 sm:!pb-10 md:!pt-12 md:!pb-12">
      <div className="w-full max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-[#E3DFC8]/80 shadow-xs text-center"
        >
          {/* Top Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#EBF7EE] text-[#1E743B] border border-[#CDE5D5] px-3 py-1 rounded-full text-xs sm:text-[13px] font-semibold tracking-wide mb-2.5 sm:mb-3 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1FA855]" />
            <span>আমাদের অঙ্গীকার ও সেবা নীতি</span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1E2519] tracking-tight leading-snug mb-2.5 sm:mb-3">
            স্বচ্ছতা, পেশাদারিত্ব ও শতভাগ নির্ভরযোগ্য ভিসা সেবা
          </h2>

          {/* 3-4 Lines Formal Natural Paragraph */}
          <p className="text-sm sm:text-base md:text-[16.5px] text-[#4E5C46] leading-relaxed md:leading-[1.75] font-normal text-center w-full max-w-4xl mx-auto">
            আমরা কোনো প্রকার অতিরঞ্জিত বা অবাস্তব প্রতিশ্রুতি দিই না। ভারতীয় ভিসা আবেদনের প্রতিটি ধাপে প্রতিটি ডকুমেন্ট পুঙ্খানুপুঙ্খ যাচাই করে নির্ভুল তথ্য উপস্থাপন করাই আমাদের মূল দায়িত্ব। আমাদের লক্ষ্য কোনো ফাঁকা আশ্বাস দেওয়া নয়, বরং সঠিক ও পূর্ণাঙ্গ ফাইল প্রসেসিংয়ের মাধ্যমে আপনার ভিসা প্রাপ্তির সর্বোচ্চ নিশ্চয়তা তৈরি করা।
          </p>
        </motion.div>
      </div>
    </section>
  );
};
