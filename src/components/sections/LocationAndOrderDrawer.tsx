import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Minus,
  Navigation,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { MENU_ITEMS } from '../../data/menuData';
import type {
  CameraSceneId,
  CartItem,
  DishPortion,
  MenuItem,
  PlaceData,
} from '../../types/restaurant';

interface LocationAndOrderDrawerProps {
  place: PlaceData | null;
  cart: CartItem[];
  drawerOpen: boolean;
  drawerTab: 'order' | 'reserve';
  onCloseDrawer: () => void;
  onOpenDrawer: (tab: 'order' | 'reserve') => void;
  onSwitchTab: (tab: 'order' | 'reserve') => void;
  onUpdateQty: (cartKey: string, delta: number) => void;
  onClearCart: () => void;
  onQuickAddDefault: (dish: MenuItem, portion: DishPortion) => void;
  onFocusScene: (scene: CameraSceneId | null) => void;
}

export const LocationAndOrderDrawer: React.FC<LocationAndOrderDrawerProps> = ({
  place,
  cart,
  drawerOpen,
  drawerTab,
  onCloseDrawer,
  onOpenDrawer,
  onSwitchTab,
  onUpdateQty,
  onClearCart,
  onQuickAddDefault,
  onFocusScene,
}) => {
  const [mapMode, setMapMode] = useState<'brand' | 'embed'>('brand');
  const [mapZoom, setMapZoom] = useState<number>(1);

  // Order Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderMode, setOrderMode] = useState<'takeaway' | 'delivery'>(
    'takeaway'
  );
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderReceipt, setOrderReceipt] = useState<{
    orderNumber: string;
    estimatedMinutes: number;
    subtotal: number;
    mode: string;
  } | null>(null);

  // Reservation Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestsCount, setGuestsCount] = useState('4');
  const [resDate, setResDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [resTime, setResTime] = useState('19:30');
  const [specialRequest, setSpecialRequest] = useState('');
  const [resSubmitting, setResSubmitting] = useState(false);
  const [resError, setResError] = useState('');
  const [resConfirmation, setResConfirmation] = useState<{
    reservationCode: string;
    date: string;
    timeSlot: string;
    guests: number;
  } | null>(null);

  const address =
    place?.formattedAddress ||
    'NH 16 Service Rd, Srinivasa Nagar, Madhurawada, Visakhapatnam, Andhra Pradesh 530048';
  const phoneDisplay = place?.phone || '099666 22218';
  const rawPhoneDigits = '919966622218';
  const lat = place?.location?.lat ?? 17.8241;
  const lng = place?.location?.lng ?? 83.3567;
  const directionsHref =
    place?.directionsUri ||
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const todayName = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const buildWhatsAppHref = () => {
    const lines =
      cart.length > 0
        ? cart
            .map(
              (item) =>
                `• ${item.quantity}x ${item.name} (${item.portionLabel}) - ₹${item.price * item.quantity}`
            )
            .join('\n')
        : '• Hi Nawabs Biryani! I would like to place a fresh Dum Biryani order.';
    const message = `Namaste Nawabs Biryani (Madhurawada),\n\n${lines}${
      cart.length > 0 ? `\n\nEstimated Subtotal: ₹${subtotal}` : ''
    }`;
    return `https://wa.me/${rawPhoneDigits}?text=${encodeURIComponent(message)}`;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    if (!customerName.trim() || customerPhone.trim().length < 10) {
      setOrderError('Please enter your name and a valid 10-digit phone number.');
      return;
    }
    if (orderMode === 'delivery' && !deliveryAddress.trim()) {
      setOrderError('Please enter your Madhurawada / Visakhapatnam delivery address.');
      return;
    }
    if (cart.length === 0) {
      setOrderError('Please add at least one dish to your order.');
      return;
    }

    setOrderSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone: customerPhone,
          mode: orderMode,
          address: deliveryAddress,
          notes: orderNotes,
          items: cart,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error || 'Could not submit order.');
      } else {
        setOrderReceipt(data.order);
        onClearCart();
      }
    } catch {
      setOrderError('Network error while confirming order. Please try again.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResError('');
    if (!guestName.trim() || guestPhone.trim().length < 10) {
      setResError('Please enter your full name and 10-digit mobile number.');
      return;
    }

    setResSubmitting(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          phone: guestPhone,
          guests: Number(guestsCount),
          date: resDate,
          timeSlot: resTime,
          specialRequest,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResError(data.error || 'Unable to confirm table.');
      } else {
        setResConfirmation(data.reservation);
      }
    } catch {
      setResError('Network error while reserving table. Please try again.');
    } finally {
      setResSubmitting(false);
    }
  };

  return (
    <>
      {/* LOCATION MAP + LIVE HOURS + RESERVE CTA (Scene 04 Beacon) */}
      <section
        id="location"
        onMouseEnter={() => onFocusScene('location')}
        onMouseLeave={() => onFocusScene(null)}
        className="relative z-10 py-24 px-5 sm:px-8 border-t border-[#FFF4E0]/10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-medium text-[#F4A300] mb-2">
                Find Our Kitchen · R9F4+JM Madhuravada
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#FFF4E0]">
                Visit Us on NH 16 Service Road
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-[#F4A300] hover:bg-[#FFB92E] text-[#121212] transition-colors whitespace-nowrap shrink-0"
              >
                <Navigation className="w-4 h-4 shrink-0" />
                <span>Get Directions</span>
              </a>
              <a
                href="tel:+919966622218"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-[#1A1615] hover:bg-[#251E1C] text-[#FFF4E0] border border-[#FFF4E0]/15 transition-colors whitespace-nowrap shrink-0 tabular-nums"
              >
                <Phone className="w-4 h-4 text-[#F4A300] shrink-0" />
                <span>Call {phoneDisplay}</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Dark Brand-Styled Interactive Map Container */}
            <div className="lg:col-span-7 bg-[#181413] border border-[#FFF4E0]/12 rounded-2xl overflow-hidden flex flex-col justify-between min-h-[420px]">
              {/* Map Header Switcher */}
              <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-[#FFF4E0]/10 bg-[#141110]">
                <div className="flex items-center gap-2 text-xs text-[#C9BBA6] font-mono tabular-nums">
                  <MapPin className="w-3.5 h-3.5 text-[#F4A300] shrink-0" />
                  <span>
                    {lat.toFixed(4)}° N, {lng.toFixed(4)}° E · Srinivasa Nagar
                  </span>
                </div>

                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#1E1917] border border-[#FFF4E0]/10">
                  <button
                    type="button"
                    onClick={() => setMapMode('brand')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      mapMode === 'brand'
                        ? 'bg-[#F4A300] text-[#121212]'
                        : 'text-[#C9BBA6] hover:text-[#FFF4E0]'
                    }`}
                  >
                    Royal Corridor Map
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode('embed')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      mapMode === 'embed'
                        ? 'bg-[#F4A300] text-[#121212]'
                        : 'text-[#C9BBA6] hover:text-[#FFF4E0]'
                    }`}
                  >
                    Google Interactive
                  </button>
                </div>
              </div>

              {/* Map Viewport */}
              <div className="relative flex-1 min-h-[340px] bg-[#110E0D] overflow-hidden">
                {mapMode === 'embed' ? (
                  <iframe
                    title="Nawabs Biryani Madhurawada Google Map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      'Nawabs biryani, NH 16 Service Rd, Srinivasa Nagar, Madhurawada, Andhra Pradesh 530048'
                    )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full min-h-[340px] border-0 invert-[90%] hue-rotate-180 contrast-95"
                  />
                ) : (
                  <div className="relative w-full h-full min-h-[340px] flex items-center justify-center overflow-hidden">
                    <svg
                      viewBox="0 0 680 380"
                      className="w-full h-full object-cover transition-transform duration-300"
                      style={{ transform: `scale(${mapZoom})` }}
                      role="img"
                      aria-label="Custom dark brand map of NH 16 Service Rd, Srinivasa Nagar, Madhurawada"
                    >
                      <rect width="680" height="380" fill="#120F0E" />
                      {/* Subtle Urban Blocks & Grid */}
                      <g stroke="#241D1B" strokeWidth="1">
                        <line x1="0" y1="80" x2="680" y2="80" />
                        <line x1="0" y1="160" x2="680" y2="160" />
                        <line x1="0" y1="240" x2="680" y2="240" />
                        <line x1="0" y1="320" x2="680" y2="320" />
                        <line x1="120" y1="0" x2="120" y2="380" />
                        <line x1="260" y1="0" x2="260" y2="380" />
                        <line x1="410" y1="0" x2="410" y2="380" />
                        <line x1="550" y1="0" x2="550" y2="380" />
                      </g>

                      {/* Secondary Neighbourhood Roads (Srinivasa Nagar & Rushikonda Link) */}
                      <path
                        d="M 90 360 Q 250 250 355 190 T 630 95"
                        fill="none"
                        stroke="#2D2320"
                        strokeWidth="12"
                      />
                      <path
                        d="M 210 30 L 355 190 L 520 350"
                        fill="none"
                        stroke="#2A201E"
                        strokeWidth="8"
                      />

                      {/* NH-16 Arterial Highway & Service Road */}
                      <path
                        d="M 40 330 C 190 265, 340 195, 640 55"
                        fill="none"
                        stroke="#5A0F1B"
                        strokeWidth="18"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 40 330 C 190 265, 340 195, 640 55"
                        fill="none"
                        stroke="#F4A300"
                        strokeOpacity="0.45"
                        strokeWidth="2"
                        strokeDasharray="8 8"
                      />

                      {/* NH 16 Service Rd Parallel Lane */}
                      <path
                        d="M 55 346 C 205 281, 355 211, 652 71"
                        fill="none"
                        stroke="#8A5A36"
                        strokeWidth="5"
                      />

                      {/* Neighbouring Landmarks */}
                      <g fill="#9A8C7A" fontSize="11" fontFamily="Plus Jakarta Sans, sans-serif">
                        <text x="82" y="290">Kommadi Junction (1.8 km)</text>
                        <text x="455" y="102">IT Hills SEZ (2.1 km)</text>
                        <text x="475" y="325">Towards Rushikonda Beach →</text>
                        <text x="150" y="115">Srinivasa Nagar</text>
                      </g>

                      {/* Concentric Location Rings */}
                      <circle
                        cx="355"
                        cy="196"
                        r="44"
                        fill="#F4A300"
                        fillOpacity="0.08"
                        stroke="#F4A300"
                        strokeOpacity="0.3"
                      />
                      <circle
                        cx="355"
                        cy="196"
                        r="22"
                        fill="#F4A300"
                        fillOpacity="0.18"
                      />
                      <circle
                        cx="355"
                        cy="196"
                        r="8"
                        fill="#F4A300"
                        stroke="#121212"
                        strokeWidth="2.5"
                      />

                      {/* Pin Callout Card */}
                      <g transform="translate(245, 118)">
                        <rect
                          width="220"
                          height="54"
                          rx="10"
                          fill="#1A1615"
                          stroke="#F4A300"
                          strokeWidth="1.2"
                        />
                        <text
                          x="16"
                          y="23"
                          fill="#FFF4E0"
                          fontSize="13"
                          fontWeight="700"
                          fontFamily="Cormorant Garamond, serif"
                        >
                          Nawabs Biryani · నవాబ్స్ బిర్యాని
                        </text>
                        <text
                          x="16"
                          y="40"
                          fill="#C9BBA6"
                          fontSize="10.5"
                          fontFamily="Plus Jakarta Sans, sans-serif"
                        >
                          NH 16 Service Rd, Madhurawada
                        </text>
                      </g>
                    </svg>

                    {/* Map Zoom Controls */}
                    <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
                      <button
                        type="button"
                        aria-label="Zoom in map"
                        onClick={() =>
                          setMapZoom((z) => Math.min(1.6, Number((z + 0.2).toFixed(1))))
                        }
                        className="w-8 h-8 rounded-lg bg-[#1A1615] border border-[#FFF4E0]/15 text-[#FFF4E0] hover:border-[#F4A300] flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Zoom out map"
                        onClick={() =>
                          setMapZoom((z) => Math.max(1.0, Number((z - 0.2).toFixed(1))))
                        }
                        className="w-8 h-8 rounded-lg bg-[#1A1615] border border-[#FFF4E0]/15 text-[#FFF4E0] hover:border-[#F4A300] flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-[#141110] border-t border-[#FFF4E0]/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#C9BBA6]">
                <span>{address}</span>
                <span className="font-mono text-[#FFF4E0]">
                  Plus Code: {place?.plusCode || 'R9F4+JM'}
                </span>
              </div>
            </div>

            {/* Opening Hours & Direct Reserve / Order Card */}
            <div className="lg:col-span-5 bg-[#181413]/95 border border-[#FFF4E0]/12 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#FFF4E0]/10 mb-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#FFF4E0]">
                    <Clock className="w-4 h-4 text-[#F4A300]" />
                    <span>Dining & Takeaway Hours</span>
                  </div>
                  <span className="text-xs font-medium text-[#F4A300]">
                    {place?.openNow !== false ? 'Open Today' : 'Opens 11:30 AM'}
                  </span>
                </div>

                <dl className="space-y-2.5 text-sm tabular-nums">
                  {(
                    place?.weekdayDescriptions || [
                      { day: 'Monday', hours: '11:30 AM – 11:00 PM' },
                      { day: 'Tuesday', hours: '11:30 AM – 11:00 PM' },
                      { day: 'Wednesday', hours: '11:30 AM – 11:00 PM' },
                      { day: 'Thursday', hours: '11:30 AM – 11:00 PM' },
                      { day: 'Friday', hours: '11:30 AM – 11:30 PM' },
                      { day: 'Saturday', hours: '11:30 AM – 11:30 PM' },
                      { day: 'Sunday', hours: '11:30 AM – 11:30 PM' },
                    ]
                  ).map((row) => {
                    const isToday =
                      row.day.toLowerCase() === todayName.toLowerCase();
                    return (
                      <div
                        key={row.day}
                        className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg ${
                          isToday
                            ? 'bg-[#261E1C] text-[#FFF4E0] font-semibold'
                            : 'text-[#C9BBA6]'
                        }`}
                      >
                        <dt>
                          {row.day}
                          {isToday ? ' (Today)' : ''}
                        </dt>
                        <dd>{row.hours}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              <div className="pt-6 mt-6 border-t border-[#FFF4E0]/10 space-y-3">
                <p className="text-xs text-[#C9BBA6] leading-relaxed">
                  Planning a family dinner or highway group takeaway? Reserve
                  your table ahead or pre-book a freshly sealed Family Pack
                  Handi.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenDrawer('order')}
                    className="w-full py-3 px-4 rounded-lg bg-[#F4A300] hover:bg-[#FFB92E] text-[#121212] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Order Takeaway / Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDrawer('reserve')}
                    className="w-full py-3 px-4 rounded-lg bg-[#241E1C] hover:bg-[#2F2724] text-[#FFF4E0] border border-[#FFF4E0]/15 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Reserve a Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUIET EDITORIAL FOOTER */}
      <footer className="relative z-10 border-t border-[#FFF4E0]/10 bg-[#100D0C] py-14 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="font-display text-2xl font-bold text-[#FFF4E0]">
              Nawabs Biryani{' '}
              <span className="text-base font-normal text-[#F4A300] ml-1.5">
                నవాబ్స్ బిర్యాని
              </span>
            </p>
            <p className="text-xs text-[#C9BBA6] mt-1.5 max-w-md">
              NH 16 Service Rd, Srinivasa Nagar, Madhurawada, Visakhapatnam,
              Andhra Pradesh 530048 · Tel: 099666 22218
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#C9BBA6]">
            <a href="#story" className="hover:text-[#FFF4E0] transition-colors">
              Story
            </a>
            <a
              href="#signatures"
              className="hover:text-[#FFF4E0] transition-colors"
            >
              Signature Dishes
            </a>
            <a href="#menu" className="hover:text-[#FFF4E0] transition-colors">
              Full Menu
            </a>
            <a
              href="#reviews"
              className="hover:text-[#FFF4E0] transition-colors"
            >
              Google Reviews
            </a>
            <a
              href="#location"
              className="hover:text-[#FFF4E0] transition-colors"
            >
              Directions
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#FFF4E0]/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#C9BBA6]/75">
          <p>
            © {new Date().getFullYear()} Nawabs Biryani, Madhurawada. All rights
            reserved.
          </p>
          <p>Dine-in · Takeaway · Local Delivery · ₹400–600 per person</p>
        </div>
      </footer>

      {/* COMPACT FLOATING WHATSAPP / CALL / ORDER ACTION BAR (<= 44px height on mobile) */}
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
        <a
          href={buildWhatsAppHref()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Order or chat on WhatsApp"
          className="inline-flex items-center gap-1.5 h-11 px-3.5 rounded-full bg-[#1F1A18] hover:bg-[#2A2320] text-[#FFF4E0] border border-[#FFF4E0]/15 shadow-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>

        <a
          href="tel:+919966622218"
          aria-label="Call Nawabs Biryani"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#1F1A18] hover:bg-[#2A2320] text-[#FFF4E0] border border-[#FFF4E0]/15 shadow-xl transition-colors shrink-0 sm:hidden"
        >
          <Phone className="w-4 h-4 text-[#F4A300]" />
        </a>

        <button
          type="button"
          onClick={() => onOpenDrawer('order')}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-full bg-[#F4A300] hover:bg-[#FFB92E] text-[#121212] shadow-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 tabular-nums cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 shrink-0" />
          <span>{totalCount > 0 ? `Handi (${totalCount})` : 'Order Now'}</span>
        </button>
      </div>

      {/* SLIDE-OVER ORDER & RESERVATION DRAWER */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Order Online or Reserve Table"
          className="fixed inset-0 z-50 flex justify-end bg-black/75"
          onClick={onCloseDrawer}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#181413] border-l border-[#FFF4E0]/12 h-full flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Drawer Header */}
              <div className="sticky top-0 z-10 bg-[#181413] px-6 py-5 border-b border-[#FFF4E0]/10 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#FFF4E0]">
                    Nawabs Royal Kitchen
                  </h2>
                  <p className="text-xs text-[#C9BBA6]">
                    Madhurawada · Direct Kitchen Dispatch
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onCloseDrawer}
                  aria-label="Close drawer"
                  className="p-2 rounded-lg text-[#C9BBA6] hover:text-[#FFF4E0] hover:bg-[#241E1C] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Switch Tabs */}
              <div className="px-6 pt-4">
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#120F0E] border border-[#FFF4E0]/10">
                  <button
                    type="button"
                    onClick={() => onSwitchTab('order')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      drawerTab === 'order'
                        ? 'bg-[#F4A300] text-[#121212]'
                        : 'text-[#C9BBA6] hover:text-[#FFF4E0]'
                    }`}
                  >
                    Takeaway / Delivery ({totalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => onSwitchTab('reserve')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      drawerTab === 'reserve'
                        ? 'bg-[#F4A300] text-[#121212]'
                        : 'text-[#C9BBA6] hover:text-[#FFF4E0]'
                    }`}
                  >
                    Reserve Dine-In Table
                  </button>
                </div>
              </div>

              {drawerTab === 'order' ? (
                <div className="p-6 space-y-6">
                  {orderReceipt ? (
                    <div className="p-5 rounded-2xl bg-[#211B19] border border-emerald-500/40 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>Order #{orderReceipt.orderNumber} Confirmed</span>
                      </div>
                      <p className="text-xs text-[#C9BBA6] leading-relaxed">
                        Our Madhurawada dum kitchen is preparing your fresh
                        handi for{' '}
                        <strong className="text-[#FFF4E0]">
                          {orderReceipt.mode}
                        </strong>
                        . Estimated readiness:{' '}
                        <strong className="text-[#FFF4E0]">
                          {orderReceipt.estimatedMinutes} mins
                        </strong>
                        .
                      </p>
                      <p className="text-sm font-bold text-[#FFF4E0] tabular-nums">
                        Total Payable (Pay on Pickup/Delivery): ₹
                        {orderReceipt.subtotal}
                      </p>
                      <button
                        type="button"
                        onClick={() => setOrderReceipt(null)}
                        className="mt-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#F4A300] text-[#121212] cursor-pointer"
                      >
                        Place Another Order
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Cart Items */}
                      {cart.length === 0 ? (
                        <div className="p-5 rounded-2xl bg-[#1E1917] border border-[#FFF4E0]/8 text-center space-y-3">
                          <p className="font-display text-xl text-[#FFF4E0]">
                            Your Royal Handi Bag is Empty
                          </p>
                          <p className="text-xs text-[#C9BBA6]">
                            Add a freshly sealed biryani or starter to begin.
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              onQuickAddDefault(
                                MENU_ITEMS[0],
                                MENU_ITEMS[0].portions[1]
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#F4A300] text-[#121212] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>
                              Quick Add Mutton Dum Full Handi (₹620)
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {cart.map((item) => (
                            <div
                              key={item.cartKey}
                              className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1E1917] border border-[#FFF4E0]/8"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#FFF4E0] truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-[#C9BBA6] tabular-nums">
                                  {item.portionLabel} · ₹{item.price}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 tabular-nums">
                                <button
                                  type="button"
                                  aria-label={`Decrease quantity of ${item.name}`}
                                  onClick={() => onUpdateQty(item.cartKey, -1)}
                                  className="w-7 h-7 rounded bg-[#120F0E] text-[#FFF4E0] flex items-center justify-center hover:text-[#F4A300] cursor-pointer"
                                >
                                  {item.quantity === 1 ? (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  ) : (
                                    <Minus className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <span className="w-5 text-center text-xs font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Increase quantity of ${item.name}`}
                                  onClick={() => onUpdateQty(item.cartKey, 1)}
                                  className="w-7 h-7 rounded bg-[#120F0E] text-[#FFF4E0] flex items-center justify-center hover:text-[#F4A300] cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}

                          <div className="flex items-center justify-between pt-3 border-t border-[#FFF4E0]/10 text-sm font-bold text-[#FFF4E0] tabular-nums">
                            <span>Subtotal (Incl. Salan & Raita)</span>
                            <span>₹{subtotal}</span>
                          </div>
                        </div>
                      )}

                      {/* Direct Order Form */}
                      <form onSubmit={handlePlaceOrder} className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setOrderMode('takeaway')}
                            className={`py-2 text-xs font-medium rounded-lg border cursor-pointer ${
                              orderMode === 'takeaway'
                                ? 'border-[#F4A300] bg-[#261E1C] text-[#FFF4E0]'
                                : 'border-[#FFF4E0]/10 text-[#C9BBA6]'
                            }`}
                          >
                            Self Takeaway (22m)
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderMode('delivery')}
                            className={`py-2 text-xs font-medium rounded-lg border cursor-pointer ${
                              orderMode === 'delivery'
                                ? 'border-[#F4A300] bg-[#261E1C] text-[#FFF4E0]'
                                : 'border-[#FFF4E0]/10 text-[#C9BBA6]'
                            }`}
                          >
                            Local Delivery (38m)
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs text-[#C9BBA6] mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g., Gowri Shankar"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-[#120F0E] border border-[#FFF4E0]/15 text-sm text-[#FFF4E0] focus:outline-none focus:border-[#F4A300]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-[#C9BBA6] mb-1">
                            Mobile Number (10 digits)
                          </label>
                          <input
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="099666 22218"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-[#120F0E] border border-[#FFF4E0]/15 text-sm text-[#FFF4E0] focus:outline-none focus:border-[#F4A300]"
                          />
                        </div>

                        {orderMode === 'delivery' && (
                          <div>
                            <label className="block text-xs text-[#C9BBA6] mb-1">
                              Delivery Address (Madhurawada / Kommadi / Rushikonda)
                            </label>
                            <textarea
                              rows={2}
                              required
                              value={deliveryAddress}
                              onChange={(e) =>
                                setDeliveryAddress(e.target.value)
                              }
                              placeholder="Flat / Street, Srinivasa Nagar, Madhurawada"
                              className="w-full px-3.5 py-2 rounded-lg bg-[#120F0E] border border-[#FFF4E0]/15 text-sm text-[#FFF4E0] focus:outline-none focus:border-[#F4A300]"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-xs text-[#C9BBA6] mb-1">
                            Spice Preference / Kitchen Note (Optional)
                          </label>
                          <input
                            type="text"
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            placeholder="Extra double masala, extra birista onions..."
                            className="w-full px-3.5 py-2 rounded-lg bg-[#120F0E] border border-[#FFF4E0]/15 text-sm text-[#FFF4E0] focus:outline-none focus:border-[#F4A300]"
                          />
                        </div>

                        {orderError && (
                          <p className="text-xs text-rose-400">{orderError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={orderSubmitting}
                          className="w-full py-3 rounded-lg bg-[#F4A300] hover:bg-[#FFB92E] text-[#121212] text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {orderSubmitting
                            ? 'Confirming with Kitchen...'
                            : `Confirm Order${subtotal > 0 ? ` · ₹${subtotal}` : ''}`}
                        </button>

                        <a
                          href={buildWhatsAppHref()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 rounded-lg bg-[#221C1A] hover:bg-[#2B2320] text-[#FFF4E0] border border-[#FFF4E0]/12 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                          <span>Send Order Directly via WhatsApp</span>
                        </a>
                      </form>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-6 space-y-5">
                  {resConfirmation ? (
                    <div className="p-5 rounded-2xl bg-[#211B19] border border-emerald-500/40 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>
                          Table Reserved · #{resConfirmation.reservationCode}
                        </span>
                      </div>
                      <p className="text-xs text-[#C9BBA6] leading-relaxed">
                        We look forward to hosting{' '}
                        <strong className="text-[#FFF4E0]">
                          {resConfirmation.guests} guests
                        </strong>{' '}
                        on{' '}
                        <strong className="text-[#FFF4E0]">
                          {resConfirmation.date}
                        </strong>{' '}
                        at{' '}
                        <strong className="text-[#FFF4E0]">
                          {resConfirmation.timeSlot}
                        </strong>{' '}
                        at NH 16 Service Rd, Srinivasa Nagar, Madhurawada.
                      </p>
                      <button
                        type="button"
                        onClick={() => setResConfirmation(null)}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#F4A300] text-[#121212] cursor-pointer"
                      >
                        Modify or Book Another Table
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleReserveSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs text-[#C9BBA6] mb-1">
                          Guest Name
                        </label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#120F0E] border border-[#FFF4E0]/15 text-sm text-[#FFF4E0] focus:outline-none focus:border-[#F4A300]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-[#C9BBA6] mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="099666 22218"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#120F0E] border border-[#FFF4E0]/15 text-sm text-[#FFF4E0] focus:outline-none focus:border-[#F4A300]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-[#C9BBA6] mb-1">
                            Party Size
                          </label>
                          <select
                            value={guestsCount}
                            onChange={(e) => setGuestsCount(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-[#120F0E] border border-[#FFF4E0]/15 text-sm text-[#FFF4E0] focus:outline-none focus:border-[#F4A300]"
                          >
                            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                              <option key={n} value={n}>
                                {n} {n === 1 ? 'Guest' : 'Guests'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-[#C9BBA6] mb-1">
                            Time Slot
                          </label>
                          <select
                            value={resTime}
                            onChange={(e) => setResTime(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-[#120F0E] border border-[#FFF4E0]/15 text-sm text-[#FFF4E0] focus:outline-none focus:border-[#F4A300]"
                          >
                            <option value="12:30 PM">12:30 PM (Lunch Dum)</option>
                            <option value="1:30 PM">1:30 PM (Lunch Dum)</option>
                            <option value="7:30 PM">7:30 PM (Evening Dum)</option>
                            <option value="8:30 PM">8:30 PM (Royal Dinner)</option>
                            <option value="9:30 PM">9:30 PM (Late Dinner)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-[#C9BBA6] mb-1">
                          Preferred Date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            required
                            value={resDate}
                            onChange={(e) => setResDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-[#120F0E] border border-[#FFF4E0]/15 text-sm text-[#FFF4E0] focus:outline-none focus:border-[#F4A300]"
                          />
                          <Calendar className="w-4 h-4 text-[#C9BBA6] pointer-events-none absolute right-3.5 top-3" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-[#C9BBA6] mb-1">
                          Special Requests (Optional)
                        </label>
                        <input
                          type="text"
                          value={specialRequest}
                          onChange={(e) => setSpecialRequest(e.target.value)}
                          placeholder="Pre-seal Family Mutton Handi, birthday seating..."
                          className="w-full px-3.5 py-2 rounded-lg bg-[#120F0E] border border-[#FFF4E0]/15 text-sm text-[#FFF4E0] focus:outline-none focus:border-[#F4A300]"
                        />
                      </div>

                      {resError && (
                        <p className="text-xs text-rose-400">{resError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={resSubmitting}
                        className="w-full py-3 rounded-lg bg-[#F4A300] hover:bg-[#FFB92E] text-[#121212] text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {resSubmitting
                          ? 'Reserving Table...'
                          : 'Confirm Dine-In Reservation'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#FFF4E0]/10 text-[11px] text-[#C9BBA6] flex items-center justify-between">
              <span>Pay via UPI / Card / Cash at Restaurant</span>
              <span>Tel: 099666 22218</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
