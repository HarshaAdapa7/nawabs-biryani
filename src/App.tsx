import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Navbar } from './components/layout/Navbar';
import { HeroAndStory } from './components/sections/HeroAndStory';
import { LocationAndOrderDrawer } from './components/sections/LocationAndOrderDrawer';
import { ReviewsAndGallery } from './components/sections/ReviewsAndGallery';
import { SignatureAndMenu } from './components/sections/SignatureAndMenu';
import {
  CinematicPreloader,
  CustomCursor,
} from './components/ui/CustomCursorAndPreloader';
import type {
  CameraSceneId,
  CartItem,
  DishPortion,
  MenuItem,
  PlaceData,
} from './types/restaurant';

gsap.registerPlugin(ScrollTrigger);

// Lazy-load 3D WebGL stage for fast First Contentful Paint
const BiryaniStage = lazy(() =>
  import('./components/three/BiryaniStage').then((m) => ({
    default: m.BiryaniStage,
  }))
);

export default function App() {
  const scrollProgressRef = useRef<number>(0);
  const [manualSceneOverride, setManualSceneOverride] =
    useState<CameraSceneId | null>(null);

  const [place, setPlace] = useState<PlaceData | null>(null);
  const [loadingPlace, setLoadingPlace] = useState<boolean>(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<'order' | 'reserve'>('order');

  // Fetch live / cached restaurant data from server-side Google Places API handler
  useEffect(() => {
    let active = true;
    fetch('/api/place')
      .then((res) => {
        if (!res.ok) throw new Error('Place fetch error');
        return res.json() as Promise<PlaceData>;
      })
      .then((data) => {
        if (!active) return;
        setPlace(data);
        setLoadingPlace(false);

        // Dynamically enrich LocalBusiness + Restaurant JSON-LD schema from live Google data
        const schemaScript = document.getElementById('restaurant-jsonld');
        if (schemaScript) {
          const updatedSchema = {
            '@context': 'https://schema.org',
            '@type': 'Restaurant',
            name: data.name,
            alternateName: data.nativeName,
            servesCuisine: [
              'Hyderabadi Biryani',
              'Andhra Cuisine',
              'Mughlai',
              'Indian',
            ],
            priceRange: data.priceRangeText,
            telephone: data.internationalPhone,
            url: window.location.origin + window.location.pathname,
            address: {
              '@type': 'PostalAddress',
              streetAddress:
                'NH 16 Service Rd, Srinivasa Nagar, Madhurawada',
              addressLocality: 'Visakhapatnam',
              addressRegion: 'Andhra Pradesh',
              postalCode: '530048',
              addressCountry: 'IN',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: data.location.lat,
              longitude: data.location.lng,
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: String(data.rating),
              reviewCount: String(data.userRatingCount),
            },
            acceptsReservations: 'True',
          };
          schemaScript.textContent = JSON.stringify(updatedSchema);
        }
      })
      .catch(() => {
        if (active) setLoadingPlace(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Initialize Lenis Smooth Scroll + GSAP ScrollTrigger camera choreography
  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let lenis: Lenis | null = null;
    let rafId = 0;

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
      });

      lenis.on('scroll', ScrollTrigger.update);

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
      },
    });

    const onNativeScroll = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      scrollProgressRef.current = Math.min(
        1,
        Math.max(0, window.scrollY / maxScroll)
      );
    };
    window.addEventListener('scroll', onNativeScroll, { passive: true });

    return () => {
      trigger.kill();
      window.removeEventListener('scroll', onNativeScroll);
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  const handleAddToCart = (dish: MenuItem, portion: DishPortion) => {
    const cartKey = `${dish.id}::${portion.label}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) {
        return prev.map((i) =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          cartKey,
          dishId: dish.id,
          name: dish.name,
          portionLabel: portion.label,
          price: portion.price,
          quantity: 1,
          image: dish.image,
        },
      ];
    });
  };

  const handleUpdateQty = (cartKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleOpenDrawer = (tab: 'order' | 'reserve') => {
    setDrawerTab(tab);
    setDrawerOpen(true);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="relative min-h-screen bg-[#121212] text-[#FFF4E0]">
      <CinematicPreloader />
      <CustomCursor />

      {/* Lazy-Loaded 3D Scroll-Driven Biryani Handi Stage */}
      <Suspense fallback={null}>
        <BiryaniStage
          scrollProgressRef={scrollProgressRef}
          manualSceneOverride={manualSceneOverride}
          onSelectScene={setManualSceneOverride}
        />
      </Suspense>

      {/* Top Navigation */}
      <Navbar cartCount={totalCartItems} onOpenDrawer={handleOpenDrawer} />

      {/* Main Editorial Single-Page Flow */}
      <main>
        <HeroAndStory
          place={place}
          loadingPlace={loadingPlace}
          onOpenDrawer={handleOpenDrawer}
          onFocusScene={setManualSceneOverride}
        />

        <SignatureAndMenu
          onAddToCart={handleAddToCart}
          onFocusScene={setManualSceneOverride}
        />

        <ReviewsAndGallery place={place} loadingPlace={loadingPlace} />

        <LocationAndOrderDrawer
          place={place}
          cart={cart}
          drawerOpen={drawerOpen}
          drawerTab={drawerTab}
          onCloseDrawer={() => setDrawerOpen(false)}
          onOpenDrawer={handleOpenDrawer}
          onSwitchTab={setDrawerTab}
          onUpdateQty={handleUpdateQty}
          onClearCart={() => setCart([])}
          onQuickAddDefault={handleAddToCart}
          onFocusScene={setManualSceneOverride}
        />
      </main>
    </div>
  );
}
