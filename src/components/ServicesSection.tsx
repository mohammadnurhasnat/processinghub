import React from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { VisaService } from '../types';
import { getVisaServices } from '../data/visaData';
import { CONFIG } from '../config';
import { useLanguage } from '../context/LanguageContext';

interface ServicesSectionProps {
  onOpenModal: (service: VisaService) => void;
  previewLimit?: number;
  onViewAllServices?: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenModal,
  previewLimit,
  onViewAllServices,
}) => {
  const { language, t } = useLanguage();
  const allServices = getVisaServices(language);
  const services = previewLimit ? allServices.slice(0, previewLimit) : allServices;

  return (
    <section id="services" className="relative !pt-5 !pb-10 md:!py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7 md:mb-10">
        <div className="section-head max-w-2xl !mb-0">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E743B] bg-[#EBF7EE] px-3 py-1 rounded-full border border-[#CDE5D5]">
            {t('ভিসা ক্যাটাগরি ও সার্ভিস', 'Visa Categories & Services')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E2519] tracking-tight mt-3">
            {previewLimit
              ? t('জনপ্রিয় ভিসা ও স্লট সেবাসমূহ', 'Featured Visa & Slot Services')
              : t('আপনার প্রয়োজনীয় ভিসা বেছে নিন', 'Choose Your Required Visa Service')}
          </h2>
          <p className="text-[#4E5C46] text-sm sm:text-base leading-relaxed mt-2">
            {t(
              'ট্যুরিস্ট, মেডিকেল ও অ্যাটেনডেন্ট, ডাবল এন্ট্রি (X-3), বিজনেস, স্টুডেন্ট, ট্রানজিট, এন্ট্রি (X-Misc) কিংবা স্পাউস (X-1)—প্রতিটি ভিসার জন্য রয়েছে আমাদের ডেডিকেটেড টিম ও সহজ প্রসেসিং ব্যবস্থা।',
              'Tourist, Medical & Attendant, Double Entry (X-3), Business, Student, Transit, Entry (X-Misc), or Spouse (X-1)—our dedicated team ensures fast and accurate processing for every visa category.'
            )}
          </p>
        </div>

        {previewLimit && onViewAllServices && (
          <div className="shrink-0">
            <button
              type="button"
              id="home-view-all-services-top-btn"
              onClick={onViewAllServices}
              className="btn-3d-matte-secondary px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{t('সকল ১৩টি সেবা দেখুন', 'View All 13 Services')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="gear-grid">
        {services.map((service, index) => (
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
                    referrerPolicy="no-referrer"
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
                  <span className="lbl text-left">
                    {service.isSlotBooking
                      ? t('শুধু স্লট ফি (শুরু)', 'Slot Fee (Starting)')
                      : service.id === 'ticket-booking'
                        ? t('অতিরিক্ত সার্ভিস ফি', 'Extra Service Charge')
                        : ['mofa-notary-translation', 'medical-cost-airport-pickup', 'hotel-rail-bus-package'].includes(service.id)
                          ? t('সার্ভিস চার্জ', 'Service Charge')
                          : t('মোট ফি (আইভ্যাক ফিসহ)', 'Total Fee (Incl. IVAC Fee)')}
                  </span>
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
                  <span>{t('প্রসেস শুরু করুন', 'Start Processing')}</span>
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {previewLimit && onViewAllServices && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            id="home-view-all-services-bottom-btn"
            onClick={onViewAllServices}
            className="btn-3d-matte-primary px-7 py-3.5 rounded-full text-sm sm:text-base font-bold inline-flex items-center gap-2.5 cursor-pointer"
          >
            <span>{t('সকল সেবা ও প্যাকেজ দেখুন', 'View All Visa Services & Packages')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};
