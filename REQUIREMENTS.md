# Project Requirements Specification

**PROJECT:** LPU Smart Campus Navigator  
**TARGET INSTITUTION:** Lovely Professional University (LPU), Phagwara, Punjab, India (Postal Code: 144411)  
**COORDINATES BASE:** `31.25492, 75.70462`  
**ARCHITECTURE PARADIGM:** Mobile-First, PWA-Ready, Capacitor Hybrid App Architecture  

---

## 1. Core Vision & Objectives

Develop an enterprise-grade mobile navigation web platform inspired by Google Maps, built exclusively for Lovely Professional University. The interface must behave and feel like a native mobile navigation app, prioritizing speed, clean mobile layout, zero desktop clutter, real verified GIS data, and future modular extensibility.

---

## 2. Phase 1 Requirements (Current Implementation)

### 2.1 Interactive Campus Map
- **R1.1:** Render real OpenStreetMap tiles centered on LPU campus (`31.25492, 75.70462`).
- **R1.2:** Viewport must fill 100% of available mobile vertical space (`100dvh`) without header/footer scrolling or horizontal overflow.
- **R1.3:** Handle mobile touch gestures: fluid panning, pinch-to-zoom, double-tap zoom.
- **R1.4:** Enforce campus bounding box to prevent users from accidentally panning across India.
- **R1.5:** Display appropriate OpenStreetMap attribution.
- **R1.6:** Do not fabricate roads, buildings, coordinates, or gates. Use only verifiable data.

### 2.2 Mobile Navigation Interface
- **R2.1:** Floating search bar at the top of the viewport with drop shadow and backdrop blur.
- **R2.2:** Real-time search suggestions with multi-keyword matching.
- **R2.3:** Category filter chips for instant filtering (Academic, Hostels, UniMall, Food, Library, Sports, Hospital, etc.).
- **R2.4:** Current location floating button with active tracking/follow state indicators.
- **R2.5:** Custom mobile-friendly zoom controls (+ and -).
- **R2.6:** Compass button with magnetic needle indicating real device heading; tap resets North.
- **R2.7:** Safe-area handling for top notches (`env(safe-area-inset-top)`) and bottom home indicator bars (`env(safe-area-inset-bottom)`).
- **R2.8:** Light theme with clean Google Maps-style blue navigation accents (`#2563eb`).
- **R2.9:** Zero Google branding or copyrighted logos.

### 2.3 Campus Location Data
- **R3.1:** Separate typed dataset (`src/data/locations.ts`).
- **R3.2:** Support all major campus zones:
  - Academic blocks (Block 34, 36, 38, 25-28, 55-56, 13)
  - Boys Hostels (BH-1 through BH-8)
  - Girls Hostels (GH-1 through GH-6)
  - Central Library & Digital Reference Hub
  - UniMall shopping & services
  - Baldev Raj Mittal UniPolis & Shanti Devi Mittal Auditorium
  - Food courts, student canteens & break kiosks
  - Main Gate 1 (NH-44), Gate 2, Gate 3
  - UniHospital & Campus Health Clinic
  - Baldev Raj Mittal Sports Complex, cricket stadium & gym
  - Parking areas
  - Administrative offices (Block 30 Admissions & DSW)
- **R3.3:** Locations with verified coordinates display map markers.
- **R3.4:** Locations pending on-ground physical GPS survey must be marked `pending_survey` and excluded from marker clutter, yet fully searchable with transparent status.

### 2.4 Place Details Sheet
- **R4.1:** Tapping a marker or search result centers and zooms the map.
- **R4.2:** Opens a draggable, expandable native-style bottom sheet.
- **R4.3:** Displays place name, category, building block number, and verified status badge.
- **R4.4:** Action bar with **Directions**, **Save/Bookmark**, **Share**, and **GPS Fix** buttons.
- **R4.5:** Lists verified facilities, gate access advice, and accessibility notes.
- **R4.6:** Zero fabricated photos, fake opening hours, or invented descriptions.

### 2.5 Geolocation (GPS) Foundation
- **R5.1:** Request browser device location permission upon user trigger.
- **R5.2:** Render pulsating blue current-location dot with direction indicator cone.
- **R5.3:** Display Leaflet accuracy circle representing GPS margin of error in meters.
- **R5.4:** Recenter & follow mode: smoothly pans with user movements.
- **R5.5:** Automatically release follow mode when user manually drags or interacts with map.
- **R5.6:** Clean up `watchPosition` handlers on component unmount.
- **R5.7:** Transparent error messaging for denied permission, unavailable GPS, timeout, and insecure HTTP contexts (HTTPS / localhost notice).

### 2.6 Multi-Modal Navigation Interface
- **R6.1:** Mode selector supporting **Walking**, **Bike**, **Car**, and **Wheelchair (Accessible)**.
- **R6.2:** Display straight-line mathematical distance and estimated transit time based on mode speed.
- **R6.3:** Reusable TypeScript routing contracts and services.
- **R6.4:** Explicit disclaimer that campus path network graph is scheduled for Phase 2. Zero fabricated turn-by-turn steps, fake ramps, or unverified accessible routes.

---

## 3. Preserved Requirements for Future Phases

### Phase 2: Campus Route Graph & Turn-by-Turn Navigation
- Digitize complete pedestrian walkway network, cycle paths, and road network of LPU.
- A* / Dijkstra shortest-path algorithms over campus graph.
- Turn-by-turn visual route polyline on map.
- Dynamic route recalculation when user deviates off path.
- Speedometer and real-time ETA based on live walking/cycling velocity.
- Voice turn-by-turn guidance synthesized via Web Speech API.

### Phase 3: Accessibility & Indoor Navigation
- Comprehensive physical survey of all wheelchair ramps, curb cuts, elevator locations, and step counts.
- Dedicated wheelchair routing mode guaranteeing step-free paths with maximum allowable incline.
- Floor-by-floor indoor navigation for Block 34, 36, 38, Mittal School of Business, and UniMall.
- Indoor classroom locator (e.g., Room 34-301, 36-204).

### Phase 4: Live Campus Events Platform
- Real-time campus events feed with strict **maximum 6-hour duration**.
- Student-submitted event proposals.
- Privacy architecture:
  - Public event cards display **only submitter's chosen display name**.
  - Student registration ID, course, and academic year strictly locked to verified admin dashboard.
- Automatic event expiry immediately upon event end time.
- Event reporting and moderation workflow for offensive or spam content.
- Event location pins linked directly to campus venue coordinates.

### Phase 5: Student Social & Live Meeting
- Temporary peer-to-peer live location sharing (WhatsApp link integration).
- "Meet a Friend" meeting point locator: calculates midpoint between two students on campus.
- Cryptographic session expiry for shared locations.

### Phase 6: Physical Campus Integration (QR & Beacons)
- Physical QR code plates on campus lampposts and block entries for instant GPS calibration.
- AR (Augmented Reality) camera overlay pointing towards target campus buildings using device gyroscope and camera feed.

### Phase 7: Campus Safety & Emergency Navigation
- One-tap Emergency SOS routing to UniHospital or closest Security Post / Gate.
- Campus road closure and construction alert overlays.
- Night-safe lit walkway routing mode.

### Phase 8: PWA & Native Mobile Distribution
- Offline tile caching via Service Worker and CacheStorage.
- Capacitor wrapper for Android APK / Google Play Store release.
- iOS App Store distribution.
