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
            <span>আমাদের প্রাতিষ্ঠানিক লক্ষ্য ও অঙ্গীকার</span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1E2519] tracking-tight leading-snug mb-2.5 sm:mb-3">
            আমাদের লক্ষ্য ও সেবার মূলনীতি
          </h2>

          {/* 3-4 Lines Formal Natural Paragraph */}
          <p className="text-sm sm:text-base md:text-[16.5px] text-[#4E5C46] leading-relaxed md:leading-[1.75] font-normal text-center w-full max-w-4xl mx-auto">
            আমাদের লক্ষ্য প্রতিটি আবেদনকারীর জন্য ভিসা প্রসেসিং প্রক্রিয়াকে সহজ, স্বচ্ছ ও সম্পূর্ণ নিয়মতান্ত্রিক করে তোলা। ভারতীয় হাইকমিশন ও আইভ্যাক (IVAC)-এর সর্বশেষ অফিশিয়াল নীতিমালা অনুযায়ী আমরা প্রতিটি ফাইল সতর্কতার সাথে প্রস্তুত ও যাচাই করি। তথ্যের গোপনীয়তা ও পেশাদারিত্ব বজায় রেখে গ্রাহককে সঠিক দিকনির্দেশনা প্রদান করাই আমাদের প্রধান অঙ্গীকার।
          </p>
        </motion.div>
      </div>
    </section>
  );
};
