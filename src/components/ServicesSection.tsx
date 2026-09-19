import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { VisaService } from '../types';
import { VISA_SERVICES } from '../data/visaData';
import { CONFIG } from '../config';

interface ServicesSectionProps {
  onOpenModal: (service: VisaService) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenModal }) => {
  return (
    <section id="services" className="relative">
      <div className="section-head max-w-2xl mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1E743B] bg-[#EBF7EE] px-3 py-1 rounded-full border border-[#CDE5D5]">
          Our Service Packages
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E2519] tracking-tight mt-3">
          ভিসা ক্যাটাগরি ও সার্ভিসসমূহ
        </h2>
        <p className="text-[#4E5C46] text-sm sm:text-base leading-relaxed mt-2">
          সঠিক ডকুমেন্টস চেকলিস্ট ও আইভ্যাক (IVAC) নিয়মানুযায়ী আপনার প্রয়োজনীয় ভিসা ক্যাটাগরি বেছে নিন এবং সরাসরি কনসালটেন্সি বা বুকিং গ্রহণ করুন।
        </p>
      </div>

      <div className="gear-grid">
        {VISA_SERVICES.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{
              duration: 0.5,
              delay: (index % 3) * 0.09,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className="h-full"
          >
            <div 
              id={`service-card-${service.id}`} 
              className="gear-card flex flex-col justify-between h-full"
            >
              <div>
                <div className="gear-img-wrap">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    loading="lazy" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = CONFIG.fallbackImage;
                    }}
                  />
                </div>
                <div className="gear-body">
                  <div className="mb-2">
                    <span className="inline-block text-[11px] font-semibold text-[#4E5C46] bg-[#ECE8DC] px-2.5 py-0.5 rounded">
                      {service.category}
                    </span>
                  </div>
                  <h3>{service.title}</h3>
                  <p className="desc">{service.description}</p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="gear-footer">
                <div className="gear-price">
                  <span className="lbl">সার্ভিস ফি</span>
                  <div className="flex items-baseline gap-1">
                    <span className="amt">{service.price}</span>
                    <span className="per">{service.per}</span>
                  </div>
                </div>
                <button
                  type="button"
                  id={`book-btn-${service.id}`}
                  onClick={() => onOpenModal(service)}
                  className="gear-book-btn"
                >
                  <span>বুক করুন</span>
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
