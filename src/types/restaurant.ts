export type CameraSceneId = 'handi' | 'ingredients' | 'plated' | 'location';

export interface PlaceReview {
  id: string;
  authorName: string;
  authorMeta: string;
  rating: number;
  relativeTimeDescription: string;
  text: string;
  googleMapsAuthorUri?: string;
}

export interface PlaceHourDay {
  day: string;
  hours: string;
}

export interface PlacePhotoItem {
  id: string;
  url: string;
  caption: string;
  credit: string;
}

export interface PlaceData {
  placeId: string;
  name: string;
  nativeName: string;
  category: string;
  formattedAddress: string;
  plusCode: string;
  phone: string;
  internationalPhone: string;
  websiteUri: string | null;
  priceRangeText: string;
  serviceOptions: string[];
  rating: number;
  userRatingCount: number;
  ratingBreakdown: { stars: number; percentage: number }[];
  openNow: boolean;
  statusBadgeText: string;
  weekdayDescriptions: PlaceHourDay[];
  location: {
    lat: number;
    lng: number;
  };
  googleMapsUri: string;
  directionsUri: string;
  photos: PlacePhotoItem[];
  reviews: PlaceReview[];
  source: 'google_places_live' | 'verified_listing_cache';
  cachedAt: string;
  revalidateSeconds: number;
}

export type MenuCategory =
  | 'all'
  | 'dum-biryani'
  | 'starters'
  | 'soups-curries'
  | 'desserts-chai';

export interface DishPortion {
  label: string;
  serves: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  teluguName: string;
  category: Exclude<MenuCategory, 'all'>;
  categoryLabel: string;
  description: string;
  spiceLevel: 'Mild Zafrani' | 'Medium Deccan' | 'Fiery Andhra';
  prepTime: string;
  dietary: 'Non-Veg' | 'Veg';
  price: number;
  portions: DishPortion[];
  image: string;
  signature?: boolean;
  plateAccentHex: string;
  keyNotes: string[];
}

export interface CartItem {
  cartKey: string;
  dishId: string;
  name: string;
  portionLabel: string;
  price: number;
  quantity: number;
  image: string;
}
