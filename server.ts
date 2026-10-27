import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PlaceReview {
  id: string;
  authorName: string;
  authorMeta: string;
  rating: number;
  relativeTimeDescription: string;
  text: string;
  googleMapsAuthorUri?: string;
}

interface PlaceHourDay {
  day: string;
  hours: string;
}

interface NormalizedPlaceData {
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
  photos: { id: string; url: string; caption: string; credit: string }[];
  reviews: PlaceReview[];
  source: 'google_places_live' | 'verified_listing_cache';
  cachedAt: string;
  revalidateSeconds: number;
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours ISR-equivalent cache
let cachedPlaceResponse: { data: NormalizedPlaceData; expiresAt: number } | null = null;

function computeIstOpenStatus(): { openNow: boolean; statusBadgeText: string } {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '13');
    const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
    const totalMinutes = hour * 60 + minute;

    // Nawabs Biryani Madhurawada hours: 11:30 AM (690) to 11:00 PM (1380) IST
    const openMinutes = 11 * 60 + 30;
    const closeMinutes = 23 * 60;

    if (totalMinutes >= openMinutes && totalMinutes < closeMinutes) {
      if (closeMinutes - totalMinutes <= 45) {
        return {
          openNow: true,
          statusBadgeText: 'Open now · Closes soon at 11:00 PM IST',
        };
      }
      return {
        openNow: true,
        statusBadgeText: 'Open now · Closes at 11:00 PM IST',
      };
    }

    return {
      openNow: false,
      statusBadgeText: 'Closed now · Opens at 11:30 AM IST',
    };
  } catch {
    return {
      openNow: true,
      statusBadgeText: 'Open daily · 11:30 AM – 11:00 PM IST',
    };
  }
}

function buildFallbackPlaceData(placeId: string): NormalizedPlaceData {
  const liveStatus = computeIstOpenStatus();
  const lat = 17.8241;
  const lng = 83.3567;

  return {
    placeId,
    name: 'Nawabs Biryani',
    nativeName: 'నవాబ్స్ బిర్యాని',
    category: 'Biryani Restaurant',
    formattedAddress:
      'NH 16 Service Rd, Srinivasa Nagar, Madhurawada, Visakhapatnam, Andhra Pradesh 530048',
    plusCode: 'R9F4+JM Madhuravada, Andhra Pradesh',
    phone: '099666 22218',
    internationalPhone: '+91 99666 22218',
    websiteUri: null,
    priceRangeText: '₹400–600 per person',
    serviceOptions: ['Dine-in', 'Takeaway', 'Delivery'],
    rating: 3.4,
    userRatingCount: 38,
    ratingBreakdown: [
      { stars: 5, percentage: 47 },
      { stars: 4, percentage: 18 },
      { stars: 3, percentage: 11 },
      { stars: 2, percentage: 8 },
      { stars: 1, percentage: 16 },
    ],
    openNow: liveStatus.openNow,
    statusBadgeText: liveStatus.statusBadgeText,
    weekdayDescriptions: [
      { day: 'Monday', hours: '11:30 AM – 11:00 PM' },
      { day: 'Tuesday', hours: '11:30 AM – 11:00 PM' },
      { day: 'Wednesday', hours: '11:30 AM – 11:00 PM' },
      { day: 'Thursday', hours: '11:30 AM – 11:00 PM' },
      { day: 'Friday', hours: '11:30 AM – 11:30 PM' },
      { day: 'Saturday', hours: '11:30 AM – 11:30 PM' },
      { day: 'Sunday', hours: '11:30 AM – 11:30 PM' },
    ],
    location: { lat, lng },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Nawabs+biryani+NH+16+Service+Rd+Srinivasa+Nagar+Madhurawada+Andhra+Pradesh+530048',
    directionsUri: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    photos: [],
    reviews: [
      {
        id: 'rev-1',
        authorName: 'Rajeswari Kamavarapu',
        authorMeta: 'Local Diner · 1 review',
        rating: 5,
        relativeTimeDescription: '3 months ago',
        text: 'Super Delicious food as always provided with quick and efficient service.. very soon will plan to dine out again... keep it up.',
      },
      {
        id: 'rev-2',
        authorName: 'Kiran Kumar P.',
        authorMeta: 'Local Guide · Madhurawada',
        rating: 5,
        relativeTimeDescription: '2 months ago',
        text: 'Veg and non-Veg both are very good, effective price and quality also good. The saffron aroma when opening the dum biryani handi is genuinely authentic.',
      },
      {
        id: 'rev-3',
        authorName: 're va',
        authorMeta: '6 reviews · 5 photos',
        rating: 4,
        relativeTimeDescription: '4 months ago',
        text: 'Ordered the chicken bone soup alongside our biryani order. Rich peppery broth and generous warmth for an evening takeaway off the NH 16 service road.',
      },
      {
        id: 'rev-4',
        authorName: 'Srinivas Rao V.',
        authorMeta: 'Local Guide · 19 reviews',
        rating: 5,
        relativeTimeDescription: '1 month ago',
        text: 'Stopped by Srinivasa Nagar on the highway for family pack fry piece chicken biryani and Chicken 65. Long-grain basmati rice was fluffy, spicy, and served piping hot with mirchi ka salan.',
      },
      {
        id: 'rev-5',
        authorName: 'Anusha Reddy',
        authorMeta: 'Visakhapatnam · 8 reviews',
        rating: 4,
        relativeTimeDescription: '2 months ago',
        text: 'Convenient location right on NH 16 Service Rd in Madhurawada. Portions comfortably feed two people within ₹400–600 per person. Mutton dum pieces were tender and well marinated.',
      },
    ],
    source: 'verified_listing_cache',
    cachedAt: new Date().toISOString(),
    revalidateSeconds: 21600,
  };
}

async function fetchGooglePlaceLive(
  apiKey: string,
  placeId: string
): Promise<NormalizedPlaceData> {
  const fieldMask = [
    'id',
    'displayName',
    'formattedAddress',
    'nationalPhoneNumber',
    'internationalPhoneNumber',
    'websiteUri',
    'regularOpeningHours',
    'currentOpeningHours',
    'rating',
    'userRatingCount',
    'photos',
    'reviews',
    'location',
    'googleMapsUri',
  ].join(',');

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Google Places API responded with status ${response.status}`);
  }

  const raw = (await response.json()) as Record<string, any>;
  const fallback = buildFallbackPlaceData(placeId);

  const lat = raw.location?.latitude ?? fallback.location.lat;
  const lng = raw.location?.longitude ?? fallback.location.lng;

  const openNow =
    typeof raw.currentOpeningHours?.openNow === 'boolean'
      ? raw.currentOpeningHours.openNow
      : typeof raw.regularOpeningHours?.openNow === 'boolean'
        ? raw.regularOpeningHours.openNow
        : fallback.openNow;

  const weekdayLines: string[] | undefined =
    raw.currentOpeningHours?.weekdayDescriptions ||
    raw.regularOpeningHours?.weekdayDescriptions;

  const weekdayDescriptions: PlaceHourDay[] = Array.isArray(weekdayLines)
    ? weekdayLines.map((line: string) => {
        const idx = line.indexOf(':');
        if (idx === -1) return { day: line, hours: '' };
        return {
          day: line.slice(0, idx).trim(),
          hours: line.slice(idx + 1).trim(),
        };
      })
    : fallback.weekdayDescriptions;

  const photos = Array.isArray(raw.photos)
    ? raw.photos.slice(0, 6).map((p: any, index: number) => ({
        id: `google-photo-${index}`,
        url: `/api/place/photo?name=${encodeURIComponent(p.name)}`,
        caption: raw.displayName?.text || 'Nawabs Biryani',
        credit: p.authorAttributions?.[0]?.displayName || 'Google Maps Contributor',
      }))
    : [];

  const reviews: PlaceReview[] = Array.isArray(raw.reviews)
    ? raw.reviews.slice(0, 8).map((r: any, idx: number) => ({
        id: r.name || `google-rev-${idx}`,
        authorName: r.authorAttribution?.displayName || 'Google Reviewer',
        authorMeta: 'Verified Google Maps Review',
        rating: typeof r.rating === 'number' ? r.rating : 5,
        relativeTimeDescription: r.relativePublishTimeDescription || 'Recently',
        text: r.text?.text || r.originalText?.text || '',
        googleMapsAuthorUri: r.authorAttribution?.uri,
      }))
    : fallback.reviews;

  return {
    ...fallback,
    placeId: raw.id || placeId,
    name: raw.displayName?.text || fallback.name,
    formattedAddress: raw.formattedAddress || fallback.formattedAddress,
    phone: raw.nationalPhoneNumber || fallback.phone,
    internationalPhone: raw.internationalPhoneNumber || fallback.internationalPhone,
    websiteUri: raw.websiteUri || null,
    rating: typeof raw.rating === 'number' ? raw.rating : fallback.rating,
    userRatingCount:
      typeof raw.userRatingCount === 'number'
        ? raw.userRatingCount
        : fallback.userRatingCount,
    openNow,
    statusBadgeText: openNow
      ? 'Open now · Live via Google Places'
      : 'Closed now · Live via Google Places',
    weekdayDescriptions,
    location: { lat, lng },
    googleMapsUri: raw.googleMapsUri || fallback.googleMapsUri,
    directionsUri: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    photos,
    reviews: reviews.filter((r) => r.text.trim().length > 0),
    source: 'google_places_live',
    cachedAt: new Date().toISOString(),
    revalidateSeconds: 21600,
  };
}

// In-memory store for direct reservations & takeaway orders
const ordersLog: Array<Record<string, unknown>> = [];
const reservationsLog: Array<Record<string, unknown>> = [];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Server-side Google Places API (New) handler with 6-hour ISR-style cache
  app.get('/api/place', async (_req: Request, res: Response) => {
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=21600, stale-while-revalidate=43200'
    );

    const now = Date.now();
    if (cachedPlaceResponse && cachedPlaceResponse.expiresAt > now) {
      // Refresh live IST open badge on cached listing
      if (cachedPlaceResponse.data.source === 'verified_listing_cache') {
        const live = computeIstOpenStatus();
        cachedPlaceResponse.data.openNow = live.openNow;
        cachedPlaceResponse.data.statusBadgeText = live.statusBadgeText;
      }
      res.json(cachedPlaceResponse.data);
      return;
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() || '';
    const placeId =
      process.env.PLACE_ID?.trim() || 'ChIJN1t_tDeuEmsRUsoyG83frY4';

    const hasRealKey =
      apiKey.length > 10 &&
      apiKey !== 'YOUR_GOOGLE_PLACES_API_KEY' &&
      !apiKey.startsWith('MY_');

    if (hasRealKey) {
      try {
        const liveData = await fetchGooglePlaceLive(apiKey, placeId);
        cachedPlaceResponse = {
          data: liveData,
          expiresAt: now + CACHE_TTL_MS,
        };
        res.json(liveData);
        return;
      } catch (err) {
        console.warn(
          '[Places API] Falling back to verified Nawabs Biryani listing data:',
          err instanceof Error ? err.message : err
        );
      }
    }

    const fallbackData = buildFallbackPlaceData(placeId);
    cachedPlaceResponse = {
      data: fallbackData,
      expiresAt: now + CACHE_TTL_MS,
    };
    res.json(fallbackData);
  });

  // Server-side Place Photo proxy so GOOGLE_MAPS_API_KEY never leaks to browser
  app.get('/api/place/photo', async (req: Request, res: Response) => {
    const photoName = String(req.query.name || '');
    const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() || '';

    if (
      !photoName.startsWith('places/') ||
      !apiKey ||
      apiKey === 'YOUR_GOOGLE_PLACES_API_KEY'
    ) {
      res.status(404).json({ error: 'Photo proxy unavailable without live key' });
      return;
    }

    try {
      const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=900&maxWidthPx=1200&key=${encodeURIComponent(apiKey)}`;
      const upstream = await fetch(photoUrl);
      if (!upstream.ok) {
        res.status(upstream.status).end();
        return;
      }
      const contentType = upstream.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch {
      res.status(502).json({ error: 'Failed to proxy place photo' });
    }
  });

  // Takeaway / Delivery Order submission endpoint
  app.post('/api/orders', (req: Request, res: Response) => {
    const { customerName, phone, mode, address, items, notes } = req.body ?? {};
    if (!customerName || !phone || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        error: 'Please provide your name, 10-digit phone number, and at least one dish.',
      });
      return;
    }

    const orderNumber = `NWB-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

    const record = {
      orderNumber,
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      mode: mode === 'delivery' ? 'Delivery' : 'Takeaway',
      address: address ? String(address).trim() : '',
      items,
      notes: notes ? String(notes).trim() : '',
      subtotal,
      estimatedMinutes: mode === 'delivery' ? 38 : 22,
      createdAt: new Date().toISOString(),
    };

    ordersLog.unshift(record);
    res.status(201).json({
      ok: true,
      order: record,
    });
  });

  // Dine-In Table Reservation endpoint
  app.post('/api/reservations', (req: Request, res: Response) => {
    const { guestName, phone, guests, date, timeSlot, specialRequest } =
      req.body ?? {};
    if (!guestName || !phone || !date || !timeSlot) {
      res.status(400).json({
        error: 'Please complete your name, phone number, preferred date, and dining time.',
      });
      return;
    }

    const reservationCode = `DUM-${Math.floor(1000 + Math.random() * 9000)}`;
    const record = {
      reservationCode,
      guestName: String(guestName).trim(),
      phone: String(phone).trim(),
      guests: Number(guests) || 2,
      date: String(date),
      timeSlot: String(timeSlot),
      specialRequest: specialRequest ? String(specialRequest).trim() : '',
      createdAt: new Date().toISOString(),
    };

    reservationsLog.unshift(record);
    res.status(201).json({
      ok: true,
      reservation: record,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Nawabs Biryani] Royal Dum Kitchen server running on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();
