import React, { useState } from 'react';
import { Flame } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#5A0F1B_0%,#1A1615_75%)] text-[#FFF4E0]/80 p-6 text-center ${className}`}
      >
        <Flame className="w-8 h-8 text-[#F4A300] mb-2 opacity-85" />
        <span className="font-display text-lg font-semibold tracking-wide">
          {fallbackLabel || alt}
        </span>
        <span className="text-xs text-[#C9BBA6] mt-1">
          Nawabs Biryani · Royal Dum Kitchen
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
