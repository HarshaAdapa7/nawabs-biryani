import React from 'react';
import { Clock, MapPin, Phone, Star, ArrowRight } from 'lucide-react';
import type { CameraSceneId, PlaceData } from '../../types/restaurant';
import { MagneticButton } from '../ui/CustomCursorAndPreloader';
import { MEDIA_ASSETS } from '../../data/menuData';
import { ResilientImage } from '../ui/ResilientImage';

interface HeroAndStoryProps {
  place: PlaceData | null;
  loadingPlace: boolean;
  onOpenDrawer: (tab: 'order' | 'reserve') => void;
  onFocusScene: (scene: CameraSceneId | null) => void;
}

export const HeroAndStory: React.FC<HeroAndStoryProps> = ({
  place,
  loadingPlace,
  onOpenDrawer,
  onFocusScene,
}) => {
  const ratingText = place ? place.rating.toFixed(1) : '3.4';
  const reviewCount = place ? place.userRatingCount : 38;
  const statusText = loadingPlace
    ? 'Checking live Madhurawada kitchen hours...'
    : place?.statusBadgeText || 'Open daily · 11:30 AM – 11:00 PM IST';

  const marqueeItems = [
    'Dum Biryani Sealed in Dough-Luted Copper Handis',
    'Freshly Prepared Daily on NH 16 Service Rd',
    'Stone-Ground Deccan Potli Masala',
    'Aged Extra-Long Basmati & Kashmiri Mongra Saffron',
    'Dine-In · Takeaway · Fast Local Delivery',
  ];

  return (
    <>
      {/* HERO SECTION (Scene 01: Rotating Copper Dum Handi on Right) */}
      <section
        id="top"
        className="relative z-10 min-h-[92vh] flex items-center pt-28 pb-20 px-5 sm:px-8"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 max-w-2xl">
            {/* Unboxed Clean Metadata Kicker (Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-[#C9BBA6] mb-5">
              <span className="text-[#F4A300] font-medium">నవాబ్స్ బిర్యాని</span>
              <span aria-hidden="true">·</span>
              <span>Srinivasa Nagar, Madhurawada</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5 text-[#FFF4E0]">
                <Clock className="w-3.5 h-3.5 text-[#F4A300] shrink-0" />
                <span>{statusText}</span>
              </span>
            </div>

            {/* Editorial Display Headline */}
            <h1 className="font-display text-[clamp(2.5rem,4.6vw,4rem)] leading-[1.06] font-bold tracking-tight text-[#FFF4E0] mb-6">
              Slow-Sealed Royal Dum Biryani, Crafted Over Glowing Embers.
            </h1>

            <p className="text-base sm:text-lg text-[#C9BBA6] leading-relaxed max-w-[60ch] mb-8">
              Along Visakhapatnam’s NH 16 Service Road in Madhurawada, Nawabs
              Biryani pairs twelve-hour marinated meats with saffron-kissed aged
              basmati, roasted Guntur spices, and piping hot copper-handi
              hospitality.
            </p>

            {/* Primary CTA + Quiet Secondary Link */}
            <div className="flex flex-wrap items-center gap-5 mb-10">
              <MagneticButton
                type="button"
                onClick={() => onOpenDrawer('order')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-semibold text-[#121212] bg-[#F4A300] hover:bg-[#FFB92E] rounded-lg shadow-lg whitespace-nowrap shrink-0"
              >
                <span>Order Fresh Handi</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </MagneticButton>

              <button
                type="button"
                onClick={() => onOpenDrawer('reserve')}
                className="px-4 py-3 text-sm sm:text-base font-medium text-[#FFF4E0] hover:text-[#F4A300] underline underline-offset-8 decoration-[#FFF4E0]/30 hover:decoration-[#F4A300] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Reserve Dine-In Table
              </button>
            </div>

            {/* Unboxed Live Proof & Service Strip */}
            <div className="pt-6 border-t border-[#FFF4E0]/12 grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm tabular-nums">
              <div>
                <div className="flex items-center gap-1.5 text-[#FFF4E0] font-semibold">
                  <Star className="w-4 h-4 text-[#F4A300] fill-[#F4A300] shrink-0" />
                  <span>{ratingText} / 5.0</span>
                  <span className="text-[#C9BBA6] font-normal">
                    ({reviewCount})
                  </span>
                </div>
                <p className="text-xs text-[#C9BBA6] mt-1">
                  Google Maps Verified Listing
                </p>
              </div>

              <div>
                <p className="text-[#FFF4E0] font-semibold">
                  {place?.priceRangeText || '₹400–600 per person'}
                </p>
                <p className="text-xs text-[#C9BBA6] mt-1">
                  Dine-in · Takeaway · Delivery
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <a
                  href={`tel:${(place?.internationalPhone || '+919966622218').replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 text-[#FFF4E0] hover:text-[#F4A300] font-semibold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#F4A300] shrink-0" />
                  <span>{place?.phone || '099666 22218'}</span>
                </a>
                <p className="text-xs text-[#C9BBA6] mt-1 inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>R9F4+JM Madhuravada</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Kept open on desktop so the 3D Rotating Handi + Steam occupies center-right unobstructed */}
          <div className="lg:col-span-5 hidden lg:flex flex-col items-end justify-end min-h-[420px] pointer-events-none">
            <div className="pointer-events-auto text-right bg-[#181413]/85 border border-[#FFF4E0]/10 rounded-xl px-4 py-3 max-w-[260px]">
              <p className="font-display text-lg font-semibold text-[#FFF4E0]">
                Interactive 3D Handi
              </p>
              <p className="text-xs text-[#C9BBA6] mt-0.5 leading-relaxed">
                Move cursor to tilt the copper deg, or scroll down to lift the
                lid and inspect our whole Deccan spices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL MARQUEE STRIP */}
      <div className="relative z-10 border-y border-[#FFF4E0]/10 bg-[#171312] py-3.5 overflow-hidden">
        <div className="animate-marquee flex items-center gap-10 text-xs sm:text-sm font-medium tracking-wide text-[#FFF4E0]/90">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="whitespace-nowrap">{item}</span>
              <span aria-hidden="true" className="text-[#F4A300]">
                ✦
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ABOUT / STORY & CRAFTSMANSHIP (Scene 02: Lid Lifts Open, Spices Orbit) */}
      <section
        id="story"
        onMouseEnter={() => onFocusScene('ingredients')}
        onMouseLeave={() => onFocusScene(null)}
        className="relative z-10 py-24 sm:py-28 px-5 sm:px-8"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-7 bg-[#181413]/92 border border-[#FFF4E0]/10 rounded-2xl p-7 sm:p-10">
            <p className="text-xs font-medium text-[#F4A300] mb-3">
              The Craft of Dum Pukht · నవాబ్స్ వారసత్వం
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FFF4E0] mb-5">
              Where Nizam’s Slow-Steam Tradition Meets Andhra’s Bold Spice Craft.
            </h2>
            <p className="text-sm sm:text-base text-[#C9BBA6] leading-relaxed mb-8 max-w-[65ch]">
              Every handi at Nawabs Biryani in Srinivasa Nagar begins hours
              before service. Whole green cardamom from Idukki, star anise,
              cloves, Ceylon cinnamon, and Kashmiri Mongra saffron are infused
              into pure ghee and sealed with wheat dough so not a single wisp of
              aroma escapes until it reaches your table.
            </p>

            {/* Editorial Numbered Craft Pillars (No // mechanical prefixes) */}
            <div className="space-y-6 pt-6 border-t border-[#FFF4E0]/10">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4">
                <span className="sm:col-span-4 font-display text-xl font-semibold text-[#FFF4E0]">
                  01. Twelve-Hour Yakhni
                </span>
                <p className="sm:col-span-8 text-sm text-[#C9BBA6] leading-relaxed">
                  Prime cuts of bone-in mutton and farm chicken rest for 12
                  hours in hung curd, caramelized birista onions, ginger-garlic,
                  and stone-ground Deccan masala.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 pt-5 border-t border-[#FFF4E0]/8">
                <span className="sm:col-span-4 font-display text-xl font-semibold text-[#FFF4E0]">
                  02. Aged Basmati & Zafran
                </span>
                <p className="sm:col-span-8 text-sm text-[#C9BBA6] leading-relaxed">
                  Two-year-aged extra-long basmati parboiled to 70% in whole
                  spice shorba, crowned with warm saffron milk so every grain
                  stays separate and fragrant.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 pt-5 border-t border-[#FFF4E0]/8">
                <span className="sm:col-span-4 font-display text-xl font-semibold text-[#FFF4E0]">
                  03. Atta-Sealed Copper Deg
                </span>
                <p className="sm:col-span-8 text-sm text-[#C9BBA6] leading-relaxed">
                  Hand-luted with fresh wheat dough and rested over glowing
                  charcoal embers for 45 minutes of gentle steam infusion,
                  paired with roasted peanut-sesame Mirchi ka Salan.
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual Proof Card */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#181413]/92 border border-[#FFF4E0]/10 rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <ResilientImage
                src={MEDIA_ASSETS.spicesHandiImg}
                alt="Whole Deccan spices, Kashmiri saffron, and aged basmati beside copper handi"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 sm:p-8">
              <p className="font-display text-2xl font-semibold text-[#FFF4E0]">
                18 Whole Spices, Zero Shortcuts
              </p>
              <p className="text-sm text-[#C9BBA6] mt-2 leading-relaxed">
                Ground in small daily batches at our Madhurawada kitchen—serving
                highway travelers, Rushikonda families, and IT Hills diners
                fresh off the dum from 11:30 AM to 11:00 PM.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
