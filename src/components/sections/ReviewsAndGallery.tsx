import React, { useState } from 'react';
import { ExternalLink, Star, X, ZoomIn } from 'lucide-react';
import { FALLBACK_GALLERY_PHOTOS } from '../../data/menuData';
import type { PlaceData, PlacePhotoItem } from '../../types/restaurant';
import { ResilientImage } from '../ui/ResilientImage';

interface ReviewsAndGalleryProps {
  place: PlaceData | null;
  loadingPlace: boolean;
}

export const ReviewsAndGallery: React.FC<ReviewsAndGalleryProps> = ({
  place,
  loadingPlace,
}) => {
  const [lightboxPhoto, setLightboxPhoto] = useState<PlacePhotoItem | null>(
    null
  );

  const galleryPhotos: PlacePhotoItem[] =
    place && place.photos && place.photos.length >= 3
      ? place.photos
      : FALLBACK_GALLERY_PHOTOS;

  const reviews = place?.reviews || [];
  const marqueeReviews =
    reviews.length > 0 ? [...reviews, ...reviews] : [];

  return (
    <>
      {/* LIVE GOOGLE RATING & AUTO-SCROLLING REVIEWS SECTION */}
      <section
        id="reviews"
        className="relative z-10 py-24 px-5 sm:px-8 border-t border-[#FFF4E0]/10"
      >
        <div className="max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#181413]/95 border border-[#FFF4E0]/10 rounded-2xl p-6 sm:p-10">
            {/* Left Rating Summary */}
            <div className="lg:col-span-5">
              <p className="text-xs font-medium text-[#F4A300] mb-2">
                Guest Voices · Google Maps Summary
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FFF4E0] mb-4">
                Rated by Highway Travelers & Local Madhurawada Diners
              </h2>

              {loadingPlace ? (
                <div className="animate-pulse space-y-3 py-2">
                  <div className="h-10 w-36 bg-[#261F1D] rounded" />
                  <div className="h-4 w-52 bg-[#261F1D] rounded" />
                </div>
              ) : (
                <div className="flex items-baseline gap-4 tabular-nums mb-4">
                  <span className="font-display text-5xl font-bold text-[#FFF4E0]">
                    {(place?.rating ?? 3.4).toFixed(1)}
                  </span>
                  <div>
                    <div
                      className="flex items-center gap-1"
                      aria-label={`Rated ${place?.rating ?? 3.4} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const filled = star <= Math.round(place?.rating ?? 3.4);
                        return (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              filled
                                ? 'text-[#F4A300] fill-[#F4A300]'
                                : 'text-[#FFF4E0]/20'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-[#C9BBA6] mt-1">
                      Based on {place?.userRatingCount ?? 38} Google reviews
                    </p>
                  </div>
                </div>
              )}

              {/* Required Google Attribution */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#FFF4E0]/10 text-xs text-[#C9BBA6]">
                <span>Powered by Google Maps Places Data</span>
                <span aria-hidden="true">·</span>
                <a
                  href={
                    place?.googleMapsUri ||
                    'https://www.google.com/maps/search/?api=1&query=Nawabs+biryani+Madhurawada'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#F4A300] hover:underline font-medium whitespace-nowrap shrink-0"
                >
                  <span>View on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right Star Distribution Bars */}
            <div className="lg:col-span-7 space-y-2.5 tabular-nums">
              {(
                place?.ratingBreakdown || [
                  { stars: 5, percentage: 47 },
                  { stars: 4, percentage: 18 },
                  { stars: 3, percentage: 11 },
                  { stars: 2, percentage: 8 },
                  { stars: 1, percentage: 16 },
                ]
              ).map((row) => (
                <div key={row.stars} className="flex items-center gap-3 text-xs">
                  <span className="w-4 text-[#FFF4E0] font-medium text-right">
                    {row.stars}
                  </span>
                  <Star className="w-3.5 h-3.5 text-[#F4A300] fill-[#F4A300] shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-[#261F1D] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#F4A300]"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[#C9BBA6]">
                    {row.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-Scrolling Testimonial Cards */}
        {loadingPlace ? (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl bg-[#1A1615] border border-[#FFF4E0]/10 p-6 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden py-2">
            <div className="animate-reviews-marquee flex gap-6 px-4">
              {marqueeReviews.map((rev, idx) => (
                <blockquote
                  key={`${rev.id}-${idx}`}
                  className="w-[330px] sm:w-[390px] shrink-0 bg-[#1A1615] border border-[#FFF4E0]/10 rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? 'text-[#F4A300] fill-[#F4A300]'
                                : 'text-[#FFF4E0]/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#C9BBA6]">
                        {rev.relativeTimeDescription}
                      </span>
                    </div>

                    <p className="text-sm text-[#FFF4E0]/90 leading-relaxed mb-5">
                      “{rev.text}”
                    </p>
                  </div>

                  <footer className="pt-3 border-t border-[#FFF4E0]/8 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#FFF4E0]">
                        {rev.authorName}
                      </p>
                      <p className="text-[#C9BBA6] mt-0.5">{rev.authorMeta}</p>
                    </div>
                    <span className="text-[11px] text-[#C9BBA6]">Google</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* VISUAL GALLERY SECTION */}
      <section
        id="gallery"
        className="relative z-10 py-24 px-5 sm:px-8 border-t border-[#FFF4E0]/10 bg-[#141110]/90"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-medium text-[#F4A300] mb-2">
                Inside Nawabs Biryani · Food & Atmosphere
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#FFF4E0]">
                From Hammered Copper to Table
              </h2>
            </div>
            <p className="text-sm text-[#C9BBA6] max-w-md">
              Select any photograph to view high-resolution details of our
              Madhurawada dining room, whole masala craft, and freshly unsealed
              biryanis.
            </p>
          </div>

          {/* Asymmetric Bento Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {galleryPhotos.slice(0, 5).map((photo, index) => {
              const spanClass =
                index === 0
                  ? 'md:col-span-8 aspect-[16/9]'
                  : index === 1
                    ? 'md:col-span-4 aspect-[4/3] md:aspect-auto'
                    : 'md:col-span-4 aspect-[4/3]';

              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxPhoto(photo)}
                  className={`group relative rounded-2xl overflow-hidden border border-[#FFF4E0]/10 bg-[#1A1615] text-left cursor-pointer ${spanClass}`}
                >
                  <ResilientImage
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute bottom-4 inset-x-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#FFF4E0] leading-snug">
                        {photo.caption}
                      </p>
                      <p className="text-[11px] text-[#C9BBA6] mt-0.5">
                        {photo.credit}
                      </p>
                    </div>
                    <span className="p-2 rounded-lg bg-[#121212]/80 text-[#FFF4E0] group-hover:text-[#F4A300] shrink-0">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY LIGHTBOX MODAL */}
      {lightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxPhoto.caption}
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#1A1615] border border-[#FFF4E0]/15 rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              aria-label="Close photo"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#121212]/85 text-[#FFF4E0] hover:text-[#F4A300] border border-[#FFF4E0]/15 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="aspect-[16/10] w-full bg-[#121212]">
              <ResilientImage
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-[#FFF4E0]">
                {lightboxPhoto.caption}
              </p>
              <span className="text-xs text-[#C9BBA6] shrink-0">
                {lightboxPhoto.credit}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
