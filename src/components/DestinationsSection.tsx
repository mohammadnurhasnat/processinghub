import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DESTINATIONS } from '../data/visaData';
import { CONFIG } from '../config';

export const DestinationsSection: React.FC = () => {
  const destScrollRef = useRef<HTMLDivElement>(null);

  const scrollDest = (direction: 'left' | 'right') => {
    if (destScrollRef.current) {
      destScrollRef.current.scrollBy({
        left: direction === 'left' ? -280 : 280,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="destinations">
      <div className="section-head">
        <span>Popular Routes</span>
        <h2>জনপ্রিয় ভ্রমণ ও চিকিৎসা গন্তব্য</h2>
        <p>ভ্রমণ, পড়াশোনা বা চিকিৎসার জন্য বাংলাদেশিদের শীর্ষ পছন্দের ভারতীয় গন্তব্যসমূহ।</p>
      </div>

      <div 
        className="dest-scroll" 
        id="destinations-scroll"
        ref={destScrollRef}
      >
        {DESTINATIONS.map((dest, index) => (
          <div 
            key={index} 
            id={`destination-polaroid-${index}`}
            className="polaroid" 
            style={{ transform: `rotate(${dest.rotate})` }}
          >
            <img 
              src={dest.image} 
              alt={dest.name} 
              loading="lazy" 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = CONFIG.fallbackImage;
              }}
            />
            <p>{dest.name}</p>
          </div>
        ))}
      </div>

      {/* Navigation Arrows centered below the photo cards for both mobile & desktop */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 mt-4 sm:mt-6">
        <button
          type="button"
          id="dest-prev-btn"
          onClick={() => scrollDest('left')}
          className="dest-nav-btn"
          aria-label="পূর্ববর্তী গন্তব্য"
          title="পূর্ববর্তী"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          id="dest-next-btn"
          onClick={() => scrollDest('right')}
          className="dest-nav-btn"
          aria-label="পরবর্তী গন্তব্য"
          title="পরবর্তী"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
