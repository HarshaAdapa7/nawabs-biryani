import React, { useEffect, useRef, useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenDrawer: (tab: 'order' | 'reserve') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenDrawer }) => {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastYRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 28);
      if (y > 140 && y > lastYRef.current + 6) {
        setHidden(true);
      } else if (y < lastYRef.current - 6 || y <= 80) {
        setHidden(false);
      }
      lastYRef.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-transform duration-200 ease-out ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        scrolled
          ? 'bg-[#151211]/95 border-b border-[#FFF4E0]/10 shadow-lg'
          : 'bg-gradient-to-b from-[#121212]/90 to-transparent'
      }`}
    >
      {/* Strict 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-5 sm:px-8 py-4">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-2xl font-bold tracking-tight text-[#FFF4E0] hover:text-[#F4A300] transition-colors whitespace-nowrap shrink-0"
        >
          Nawabs Biryani
        </a>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#C9BBA6]"
        >
          <a
            href="#story"
            className="hover:text-[#FFF4E0] underline-offset-8 hover:underline decoration-[#F4A300] transition-colors whitespace-nowrap shrink-0"
          >
            Story
          </a>
          <a
            href="#signatures"
            className="hover:text-[#FFF4E0] underline-offset-8 hover:underline decoration-[#F4A300] transition-colors whitespace-nowrap shrink-0"
          >
            Signatures
          </a>
          <a
            href="#menu"
            className="hover:text-[#FFF4E0] underline-offset-8 hover:underline decoration-[#F4A300] transition-colors whitespace-nowrap shrink-0"
          >
            Menu
          </a>
          <a
            href="#reviews"
            className="hover:text-[#FFF4E0] underline-offset-8 hover:underline decoration-[#F4A300] transition-colors whitespace-nowrap shrink-0"
          >
            Reviews
          </a>
          <a
            href="#location"
            className="hover:text-[#FFF4E0] underline-offset-8 hover:underline decoration-[#F4A300] transition-colors whitespace-nowrap shrink-0"
          >
            Visit
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onOpenDrawer('order')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-[#121212] bg-[#F4A300] hover:bg-[#FFB92E] rounded-lg transition-colors whitespace-nowrap shrink-0 tabular-nums cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A300]"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>
              {cartCount > 0 ? `Order Handi (${cartCount})` : 'Order Online'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
