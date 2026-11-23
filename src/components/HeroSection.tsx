import React, { useEffect, useState } from 'react';
import { CalendarClock, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import { HERO_SLIDES } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../utils/currency';

interface HeroSectionProps {
  onExplorePaySmallSmall: () => void;
  onExploreCatalog: () => void;
  onExploreSubscriptions: () => void;
}

export function HeroSection({
  onExplorePaySmallSmall,
  onExploreSubscriptions,
}: HeroSectionProps) {
  const { market, currency, settings } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (HERO_SLIDES.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const freeThreshold =
    market === 'NG' ? settings.ngFreeDeliveryThreshold : settings.auFreeDeliveryThreshold;

  return (
    <>
      <section className="relative overflow-hidden bg-slate-900 min-h-[290px] sm:min-h-[340px] lg:min-h-[370px] flex items-center">
        {/* Background Photographic Slideshow */}
        <div className="absolute inset-0">
          {HERO_SLIDES.map((slide, idx) => (
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                idx === activeSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          {/* Subtle Dark Overlay for High Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/65 to-slate-950/45" />
        </div>

        {/* Compact Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
          <div className="max-w-xl">
            <h1 className="font-display text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.12] mb-2.5">
              Stock Your Kitchen.{' '}
              <span className="text-[#FF4D52]">Pay Small Small.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-100/95 leading-snug mb-5">
              Quality Nigerian foodstuffs delivered across Nigeria and Australia.
            </p>

            {/* Balanced Side-by-Side Primary Actions */}
            <div className="flex flex-row flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onExplorePaySmallSmall}
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 bg-[#D61A1E] hover:bg-[#B51418] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Shop Pay Small Small
              </button>
              <button
                type="button"
                onClick={onExploreSubscriptions}
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 bg-[#0B2D71] hover:bg-[#082257] text-white border border-white/25 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Browse Subscriptions
              </button>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex items-center justify-between gap-4 mt-6">
            <p className="text-[11px] font-medium text-white/80">
              {HERO_SLIDES[activeSlide]?.caption}
            </p>
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Hero slideshow">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`View slide ${idx + 1}: ${slide.caption}`}
                  aria-selected={idx === activeSlide}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeSlide ? 'w-6 bg-[#D61A1E]' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Slim Key Proposition Bar */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-[#D61A1E] shrink-0" />
            <span className="truncate font-medium">
              {settings.pssDefaultDepositPercent}% deposit + weekly/monthly split
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#0B2D71] shrink-0" />
            <span className="truncate font-medium">
              Free delivery over {formatMoney(freeThreshold, currency)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0B2D71] shrink-0" />
            <span className="truncate font-medium">
              Releases at {settings.pssReleaseThresholdPercent}% completion
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#D61A1E] shrink-0" />
            <span className="truncate font-medium">
              Save {settings.subscriptionDiscountPercent}% on subscriptions
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
