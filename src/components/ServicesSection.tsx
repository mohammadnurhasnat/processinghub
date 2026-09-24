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
          ভিসা ক্যাটাগরি ও সার্ভিস
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E2519] tracking-tight mt-3">
          আপনার প্রয়োজনীয় ভিসা বেছে নিন
        </h2>
        <p className="text-[#4E5C46] text-sm sm:text-base leading-relaxed mt-2">
          ট্যুরিস্ট, মেডিকেল কিংবা বিজনেস—প্রতিটি ভিসার জন্য রয়েছে আমাদের ডেডিকেটেড এক্সপার্ট টিম ও সহজ প্রসেসিং ব্যবস্থা।
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
              className="gear-card flex flex-col justify-between h-full !rounded-[6px] overflow-hidden text-left"
              style={{ borderRadius: '6px' }}
            >
              <div className="w-full text-left">
                <div className="gear-img-wrap !rounded-t-[6px]">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    loading="lazy" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = CONFIG.fallbackImage;
                    }}
                  />
                </div>
                <div className="gear-body text-left">
                  <div className="mb-2 text-left">
                    <span className="inline-block text-[11px] font-semibold text-[#4E5C46] bg-[#ECE8DC] px-2.5 py-0.5 rounded text-left">
                      {service.category}
                    </span>
                  </div>
                  <h3 className="text-left">{service.title}</h3>
                  <p className="desc text-left">{service.description}</p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="gear-footer">
                <div className="gear-price text-left">
                  <span className="lbl text-left">সার্ভিস ফি</span>
                  <div className="flex items-baseline gap-1 justify-start text-left">
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
                  <span>প্রসেস শুরু করুন</span>
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
