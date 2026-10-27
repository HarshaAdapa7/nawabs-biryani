import React, { useEffect, useRef, useState } from 'react';

export const CinematicPreloader: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setDismissed(true);
      setRemoved(true);
      return;
    }

    const fadeTimer = window.setTimeout(() => {
      setDismissed(true);
    }, 750);

    const removeTimer = window.setTimeout(() => {
      setRemoved(true);
    }, 1150);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (removed) return null;

  return (
    <div
      onClick={() => {
        setDismissed(true);
        window.setTimeout(() => setRemoved(true), 220);
      }}
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#121212] transition-opacity duration-300 ${
        dismissed ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Rising Golden Steam SVG Wisps */}
      <div className="relative flex items-end justify-center h-14 mb-3">
        <svg
          width="64"
          height="56"
          viewBox="0 0 64 56"
          fill="none"
          className="overflow-visible"
        >
          <path
            d="M20 48C16 38 24 28 20 14"
            stroke="#F4A300"
            strokeWidth="2"
            strokeLinecap="round"
            className="steam-wisp-1"
          />
          <path
            d="M32 50C28 36 37 25 32 8"
            stroke="#FFF4E0"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="steam-wisp-2"
          />
          <path
            d="M44 48C40 38 48 28 44 14"
            stroke="#F4A300"
            strokeWidth="2"
            strokeLinecap="round"
            className="steam-wisp-3"
          />
        </svg>
      </div>

      {/* Handi Rim Crest */}
      <div className="w-16 h-2 rounded-full bg-gradient-to-r from-[#5A0F1B] via-[#F4A300] to-[#5A0F1B] mb-5" />

      <p className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-[#FFF4E0]">
        Nawabs Biryani
      </p>
      <p className="text-xs text-[#C9BBA6] mt-2 tracking-wide">
        నవాబ్స్ బిర్యాని · Madhurawada
      </p>
    </div>
  );
};

export const CustomCursor: React.FC = () => {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [hoveredInteractive, setHoveredInteractive] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (!finePointer || reduced) return;

    setEnabled(true);

    let rafId = 0;
    const target = { x: -100, y: -100 };
    const current = { x: -100, y: -100 };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        el?.closest('a, button, input, select, textarea, [data-magnetic]')
      );
      setHoveredInteractive(isInteractive);
    };

    const loop = () => {
      current.x += (target.x - current.x) * 0.24;
      current.y += (target.y - current.y) * 0.24;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-50 pointer-events-none -ml-4 -mt-4 hidden lg:block"
    >
      <div
        className={`w-8 h-8 rounded-full border transition-transform duration-150 ${
          hoveredInteractive
            ? 'scale-150 border-[#F4A300] bg-[#F4A300]/10'
            : 'scale-100 border-[#FFF4E0]/35'
        }`}
      />
    </div>
  );
};

interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.18;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.18;
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  };

  const handlePointerLeave = () => {
    if (btnRef.current) {
      btnRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
  };

  return (
    <button
      ref={btnRef}
      data-magnetic="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`transition-transform duration-150 ease-out cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
