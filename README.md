# Nawabs Biryani (నవాబ్స్ బిర్యాని) — Royal 3D Dum Kitchen Website

An interactive 3D single-page restaurant website for **Nawabs Biryani** (`NH 16 Service Rd, Srinivasa Nagar, Madhurawada, Visakhapatnam, Andhra Pradesh 530048`).

## Highlights
- **3D Culinary Experience (`Three.js` + Studio PBR)**:
  - Multi-part hammered copper & antique brass Dum Handi with dough-luted seal, rising golden steam plumes, 200+ instanced Basmati rice kernels, and orbiting whole Deccan spices (Kashmiri saffron strands, cardamom pods, star anise, bay leaves).
  - **Scroll-Driven Camera Choreography (`GSAP ScrollTrigger` + `Lenis`)**: Smoothly glides across 4 scenes (`01. Handi` → `02. Whole Spices` → `03. Plated Dastarkhwan` → `04. Madhurawada Beacon`) with cursor/gyroscope parallax and a collapsible bottom 3D camera dock (`H` shortcut).
  - Automatic software-WebGL frame pacing and graceful static/reduced-motion fallbacks.
- **Server-Side Google Places API (New) Route Handler (`server.ts`)**:
  - `GET /api/place` fetches live listing details, hours, rating, reviews, coordinates, and Place Photos server-side so `GOOGLE_MAPS_API_KEY` is never exposed to the browser.
  - 6-hour (`21600s`) ISR-style server cache (`Cache-Control: public, s-maxage=21600, stale-while-revalidate=43200`) + verified Madhurawada listing fallback.
  - `GET /api/place/photo` proxies Place Photos without leaking API keys.
- **Direct Takeaway, Delivery & Table Reservations**:
  - 3D-tilt Signature Dish cards, 360° Plate Inspector modal, filtered menu, WhatsApp instant order builder (`+91 99666 22218`), and direct `/api/orders` + `/api/reservations` confirmation flows.

## Folder Structure
```text
├── index.html                                    # SEO meta, OpenGraph, Fonts & JSON-LD Schema
├── server.ts                                     # Express + Vite server & /api/place Places API (New)
├── .env.example                                  # Environment variable template
├── src/
│   ├── App.tsx                                   # Lenis + GSAP ScrollTrigger + Cart & Place state
│   ├── index.css                                 # Brand theme tokens & compositor animations
│   ├── types/restaurant.ts                       # TypeScript interfaces
│   ├── data/menuData.ts                          # Nawabs Biryani menu & curated photography
│   └── components/
│       ├── layout/Navbar.tsx                     # Hide/reveal 3-zone navigation header
│       ├── three/
│       │   ├── BiryaniStage.tsx                  # WebGL renderer, lighting, camera & HUD dock
│       │   └── proceduralModels.ts               # Procedural copper handi, spices, rice & steam
│       ├── sections/
│       │   ├── HeroAndStory.tsx                  # Hero, marquee & Dum Pukht craftsmanship story
│       │   ├── SignatureAndMenu.tsx              # 3D-tilt dish cards, plate modal & full menu
│       │   ├── ReviewsAndGallery.tsx             # Live Google reviews ticker & photo lightbox
│       │   └── LocationAndOrderDrawer.tsx        # Dark brand map, live IST hours & order drawer
│       └── ui/
│           ├── CustomCursorAndPreloader.tsx      # Royal steam preloader, magnetic buttons & cursor
│           └── ResilientImage.tsx                # Zero-broken-image fallback wrapper
```

## Quick Start & Installation
```bash
# 1. Install dependencies
npm install

# 2. Copy environment configuration
cp .env.example .env.local

# 3. Start full-stack development server on http://localhost:3000
npm run dev

# 4. Production build & run
npm run build
npm start
```

## Optional: Using a Custom Draco-Compressed `.glb` Handi Model
Out of the box, `src/components/three/proceduralModels.ts` generates a zero-dependency multi-part PBR Copper & Brass Dum Handi (`< 50 KB` code footprint, zero network 404s).
If you wish to load a custom photogrammetry `.glb` model (`< 3 MB`):
1. Place your Draco-compressed file at `public/models/biryani-handi.glb`.
2. Load it in `BiryaniStage.tsx` using `GLTFLoader` + `DRACOLoader` from `three/addons/loaders/GLTFLoader.js` and `three/addons/loaders/DRACOLoader.js` (`dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')`) and attach the loaded `gltf.scene` to `rig.handiGroup`.

## Getting & Restricting Your Google Places API (New) Key
1. Open the **Google Cloud Console** → **APIs & Services → Library** and enable **Places API (New)**.
2. Go to **APIs & Services → Credentials → Create Credentials → API Key**.
3. Under **API Restrictions**, select **Restrict key** and allow **Places API (New)** only.
4. Under **Application Restrictions**, choose **IP addresses** (for your server/host egress IP) so the key can only be invoked by `server.ts`.
5. Look up the **Place ID** for *Nawabs biryani, NH 16 Service Rd, Srinivasa Nagar, Madhurawada, Andhra Pradesh 530048* using Google's Place ID Finder and paste both into `.env.local`:
   ```env
   GOOGLE_MAPS_API_KEY="AIzaSy..."
   PLACE_ID="ChIJ..."
   ```
