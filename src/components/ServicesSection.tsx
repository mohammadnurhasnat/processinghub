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
    <section id="services">
      <div className="section-head">
        <span>Our Services</span>
        <h2>ইন্ডিয়ান ভিসা ক্যাটাগরি ও সার্ভিস</h2>
        <p>সঠিক ডকুমেন্টস চেকলিস্ট ও আইভ্যাক (IVAC) নিয়মানুযায়ী আপনার ভিসা ফাইল প্রস্তুত করতে আমাদের দক্ষ টিমের সহায়তা নিন।</p>
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
