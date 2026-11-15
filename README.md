# LPU Smart Campus Navigator 🗺️🎓

**A mobile-first, native navigation experience tailored exclusively for the students, faculty, and visitors of Lovely Professional University (LPU), Phagwara, Punjab, India.**

Inspired by Google Maps' mobile interface, the LPU Smart Campus Navigator delivers a dedicated, lightweight, responsive campus mapping interface without unnecessary headers, footers, blank spaces, or desktop bloat.

---

## 🌟 Vision & Key Highlights (Phases 1–7 Complete)

- **Real-Time Location Sharing & "Meet My Friend" (Phase 7 - Production Ready)**:
  - Generate secure, unguessable cryptographic tracking capability URLs (`?share=lpu_loc_...` with 62^24 entropy).
  - Choose auto-expiry duration: **15 minutes**, **1 hour**, or **8 hours**.
  - Dual-Mode live synchronization: Firebase Firestore (`location_shares/{token}`) + Server-Sent Events (SSE `/api/events/stream`) & REST backend for seamless cross-browser, cross-device campus Wi-Fi tracking (`http://172.28.9.119:5173/`).
  - Battery-optimized coordinate throttling (capped to 2.5s intervals unless moving > 2.5m).
  - 1-tap WhatsApp deep link (`wa.me`) and native Web Share API.
  - Active broadcasting banner with real-time countdown ticker and instant **"Stop Sharing"** button.
  - **Meet My Friend in 2D and 3D**:
    - Moving friend avatar marker with pulsating green radar ring, accuracy halo, and "Last updated Xs ago" indicator in both 2D Leaflet and 3D MapLibre WebGL modes.
    - **Dynamic Moving Target Navigation**: Automatically recalculates destination waypoints and optimal Dijkstra routes as the friend moves across campus.
    - Available across all 4 modes (**Walking**, **Bike**, **Car**, **Wheelchair**).
    - Instant navigation termination if friend revokes sharing or link auto-expires.
- **3D Campus Explore Mode with WebGL Extrusions (Phase 6)**:
  - GPU-accelerated 3D WebGL mapping engine powered by **MapLibre GL JS**.
  - Pitch (0° to 75°), continuous bearing rotation (0° to 360°), and smooth camera flight animations (`flyTo`, `easeTo`).
  - 3D building extrusions for academic blocks, library, UniMall, UniPolis dome, hostels, sports arena, and campus gates.
  - Category-based architectural color palettes with vertical wall gradients and ambient lighting.
  - Seamless 2D / 3D segmented toggle preserving selected place details and navigation state.
  - Full-featured 3D tactical controls: Rotating interactive Compass, Perspective Tilt toggle, Zoom In/Out, Recenter Campus, and Recenter GPS.
  - 3D route polyline rendering with glowing halo and live GPS avatar in 3D.
  - Graceful WebGL capability check falling back to 2D Leaflet mode on unsupported devices.
- **Mobile-First Full Viewport (100dvh)**: Fills the entire screen dynamically with safe-area insets (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`) for modern iPhone notches and Android dynamic islands.
- **Real OpenStreetMap Campus Map**: Interactive Leaflet map centered at LPU (`31.25492, 75.70462`) with strict campus bounding restrictions, smooth touch gestures, pinch-to-zoom, and proper OSM attribution.
- **WhatsApp Live Location Sharing (Phase 5)**:
  - Generate secure, unguessable capability tracking links (`?share=lpu_loc_...`).
  - Choose auto-expiry duration: **15 minutes**, **1 hour**, or **8 hours**.
  - Toggle between **Live Moving GPS** and **One-Time Location Pin**.
  - 1-tap WhatsApp sharing link (`wa.me`) and native Web Share API.
  - Active broadcasting banner with real-time countdown ticker and instant **"Stop Sharing"** button.
  - Honest browser background GPS advisory notice.
- **Meet My Friend (Phase 5)**:
  - Open friend's shared link to track their moving position in real-time.
  - Custom Leaflet friend marker with avatar circle, green radar ping, and accuracy halo.
  - **Dynamic Moving Target Navigation**: Automatically recalculates route and destination waypoints as the friend moves across campus.
  - Available across all 4 modes (**Walking**, **Bike**, **Car**, **Wheelchair**).
- **Offline Campus Map & Tile Policy Compliance (Phase 5)**:
  - 100% offline access to all campus facilities, academic blocks, and classrooms.
  - Campus routing graph and Dijkstra engine run entirely client-side without internet connectivity.
  - Device GPS tracks location offline via hardware satellites on mobile.
  - Real-time online/offline indicator banner.
  - Strict compliance with OpenStreetMap Tile Usage Policy (zero bulk scraping).
- **QR Campus Navigation (Phase 5)**:
  - Physical entrance QR codes (`?qr=<locationId>`) setting origin to the scanned building.
  - Strict security validation rejecting unverified or arbitrary GPS coordinates.
  - Prompt to choose destination and get instant turn-by-turn directions.
  - Admin-only QR Code Generator producing printable SVG badges for all 28+ verified buildings.
- **Road Closure Alerts & Detour Recalculation (Phase 5)**:
  - Synchronized path closures rendered with striped red/amber warning polylines and barrier markers.
  - Dijkstra router automatically bypasses closed segments and plots optimal detours.
  - Admin management console to activate and expire closures.
  - Student blockage reporting modal with administrative moderation queue.
- **Emergency Assistance SOS (Phase 5)**:
  - Floating high-visibility red SOS trigger in tactical map controls.
  - Verified university contacts: Main Security (`01824-517000`), UniHospital (`01824-517100`), Campus Ambulance (`01824-517101`), Women's Helpline (`01824-517002`).
  - 1-tap "Navigate to UniHospital (Emergency)" route calculation.
  - 1-tap Emergency WhatsApp SOS broadcast with exact GPS coordinates and live map link.
- **Live Campus Events & Activities (Phase 4)**:
  - Real-time event broadcasting at LPU locations (UniPolis, UniMall, auditoriums, sports grounds, academic blocks).
  - Floating "Events" map button with live count badge and full-screen event directory modal.
  - 7 custom category markers (`concert`, `party`, `cultural`, `workshop`, `sports`, `activity`, `other`) with animated ping ripples for currently active events.
  - **Strict 6-Hour Duration Limit**: Client & server validation rejecting any event exceeding 6 hours (`maxDurationMinutes: 360`) or past end times.
  - **Student Privacy Separation**: Public cards show *only* the creator's casual display name (`Added by Rahul`). Sensitive academic details (Legal Name, Course, Year) are strictly confined to administrative collections via production Firestore security rules.
  - **Dual-Mode Sync & Authoritative Admin Deletion**: Real-time Firebase Firestore (`onSnapshot`) with automatic fallback to local shared dev server (Server-Sent Events streaming `/api/events/stream` and `.campus_events_db.json`) plus `BroadcastChannel`. Instant soft-deletion (`removed_by_admin`) with cryptographic tombstones preventing deleted event resurrection, immediate removal from public live map/counters, automatic closure of active bottom sheets, and retention in admin audit history.
  - **Event Details Bottom Sheet**: Real-time IST schedule, venue directions, social sharing, and community abuse reporting. Auto-dismisses if an administrator deletes the event while open.
- **University Admin Dashboard (Phase 4 & 5 - Upgraded)**:
  - **Dedicated `/admin` Route**: Full-screen responsive administrative dashboard with desktop sidebar and mobile navigation drawer.
  - **Navigation Menu Drawer**: Integrated Google Maps-style side menu in SearchBar with Admin Dashboard entry, highlighted for verified administrators.
  - **Firebase Role-Based Security**: Custom claims (`{ admin: true }`) and `/admin_users/{uid}` verification. Zero hardcoded passcodes.
  - **Administrator Provisioning Script**: Official Node.js provisioning utility (`scripts/setAdmin.cjs`) for setting initial university administrators.
  - Real-time KPIs (Total Registered Users, Campus Events, Live Now, Upcoming, Expired History, Pending Abuse Reports, Active Road Closures).
  - Complete student privacy separation: Public students see only casual display names; administrators view full academic identity (Legal Name, Course, Year, UID).
  - Road closure activation and student report moderation.
  - Printable QR navigation badge generator.
- **Classroom Finder (Phase 3)**: Search classrooms (e.g., `34-405`, `36-201`, `38-101`, `25-101`) to automatically identify the Block, Floor, Room type, verified ground entrance, and factual indoor guidance notes.
- **Building Photography & Infrastructure (Phase 3)**: Authentic photographs with full attribution metadata (Main Gate 1, Wikimedia Commons CC BY-SA 4.0), polished "Photo Pending" states for facilities awaiting on-ground field photography (no fake stock photos), and verified floor/elevator/restroom infrastructure data.
- **Smart Campus Search**: Supports building numbers, room numbers, hostels, departments (CSE, Mechanical, MBA, etc.), facilities (ATMs, food, gym, hospital), and campus aliases with rich suggestion badges.
- **Verified Campus Path Network Graph (Phase 2)**: 30 intersection/entrance nodes and 56 directed edges mapped strictly from OpenStreetMap pathways and campus ground plans (`src/data/campusRouteGraph.ts`).
- **4 Travel Modes with Route Permissibility (Phase 2)**:
  - **Walking**: Pedestrian boulevards, corridors, plazas, and pathways.
  - **Bike**: Wide paved avenues and peripheral cycle corridors.
  - **Car**: Peripheral roads only; auto-diverts to nearest parking (Gate 1 or UniMall Parking) when heading into pedestrian zones.
  - **Wheelchair**: Strictly verified grade-level ramps and accessible concourses. Unverified stair plinths are flagged unavailable.
- **Live Turn-by-Turn Navigation Interface (Phase 2)**:
  - **Top Turn Card**: Maneuver icon, distance to next turn, street name, and next step preview.
  - **Bottom Navigation Dashboard**: Real-time calculated remaining distance, estimated arrival time (ETA), real GPS speed (km/h), and camera tracking.
  - **Dynamic Route Recalculation**: Automatically updates route if the student drifts > 45 meters off-route.
  - **Off-Campus Origin Snapping**: Automatically snaps route start to Main Gate 1 with an advisory disclaimer when student is physically off-campus.
- **Live GPS Tracking & Hardware Controls**: Real-time Geolocation API `watchPosition` with auto-follow camera, recenter button, weak signal warning (accuracy > 50m), compass heading orientation needle, and clean watcher teardown.
- **Responsive Place Details Card**: Compact Google Maps-style bottom sheet (~30% screen height on mobile, 380px side panel on desktop) with verified building photos, facilities chips, and quick actions.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + Vite + TypeScript 5 |
| **Map Rendering** | Leaflet 1.9 + React-Leaflet 4.2 |
| **Styling** | Tailwind CSS 3.4 (with dynamic viewport height `100dvh` & safe-area insets) |
| **Real-Time Backend** | Firebase v13 (Firestore & Auth) + BroadcastChannel multi-tab sync fallback |
| **Icons** | Lucide React |
| **Geographic Base** | OpenStreetMap (OSM) Standard Tile Provider |
| **Local Persistence** | Typed `localStorage` wrapper with graceful fallbacks |

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 2. Installation
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
The optimized bundle will be generated in `dist/`.

---

## 📱 Mobile & PWA Testing

To test device GPS on a physical phone:
- **Localhost**: Connect your mobile phone via USB debugging and use Chrome port forwarding to `localhost:5173`.
- **HTTPS**: Browsers require a secure context (`https://` or `localhost`) to grant Geolocation API access.

---

## 📂 Project Architecture

```
lpu-map/
├── public/
│   ├── favicon.svg              # Custom LPU navigation pin icon
│   └── manifest.json            # PWA manifest
├── firestore.rules              # Production Firestore security & privacy rules
├── .env.example                 # Firebase environment configuration template
├── src/
│   ├── types/
│   │   ├── location.ts          # CampusLocation, LocationCategory, VerificationStatus
│   │   ├── navigation.ts        # NavigationMode, GeoPosition, RoutePlan
│   │   ├── routing.ts           # IRoutingService, PathNode, PathEdge, CampusRouteGraph
│   │   ├── classroom.ts         # ClassroomRecord, RoomType, parseClassroomQuery
│   │   ├── events.ts            # PublicCampusEvent, ProtectedStudentMetadata, EventReport
│   │   ├── locationSharing.ts   # LiveLocationShare, ShareDurationMinutes, Meet My Friend
│   │   ├── roadClosure.ts       # RoadClosure, ClosureStatus, Student reports
│   │   └── emergency.ts         # EmergencyContact, verified university numbers
│   ├── config/
│   │   └── firebase.ts          # Dual-mode Firebase client & fallback initializer
│   ├── data/
│   │   ├── campusBounds.ts      # LPU geographic bounds, center, zoom configs
│   │   ├── locations.ts         # Verified LPU campus points and pending-survey records
│   │   ├── classrooms.ts        # Verified classroom, laboratory & exam hall registry
│   │   └── campusRouteGraph.ts  # 30-node, 56-edge campus multimodal routing graph
│   ├── pages/
│   │   └── AdminDashboardPage.tsx # Dedicated /admin full-screen responsive administration console
│   ├── router/
│   │   └── Router.tsx           # Zero-dependency HTML5 History SPA router (/ & /admin)
│   ├── utils/
│   │   └── qrGenerator.ts       # Zero-dependency pure TypeScript QR matrix & SVG generator
│   ├── services/
│   │   ├── geolocation.ts       # Geolocation watcher, accuracy, error handling
│   │   ├── searchService.ts     # Multi-keyword fuzzy ranking search service
│   │   ├── storageService.ts    # Student saved places & recent searches
│   │   ├── routingService.ts    # Dijkstra engine, closures avoidance & multimodal routing
│   │   ├── authService.ts       # Student device profile & administrator auth
│   │   ├── eventService.ts      # Real-time event lifecycle, 6h duration validation & privacy sync
│   │   ├── locationSharingService.ts # WhatsApp live location streaming & token management
│   │   ├── roadClosureService.ts# Campus path blockages & dynamic detour coordinator
│   │   └── offlineService.ts    # Online/offline network status & OSM policy compliance
│   ├── hooks/
│   │   ├── useGeolocation.ts    # React hook for GPS tracking & follow state
│   │   ├── useDeviceOrientation.ts # Real device compass orientation
│   │   └── useSavedPlaces.ts    # Saved places and bookmarks hook
│   ├── components/
│   │   ├── map/
│   │   │   ├── CampusMap.tsx        # Leaflet 100dvh container & tile setup
│   │   │   ├── LocationMarkers.tsx  # Custom SVG category pins & LOD tiers
│   │   │   ├── EventMarkers.tsx     # Animated live/upcoming event markers
│   │   │   ├── FriendMarker.tsx     # Moving friend avatar marker with radar ping
│   │   │   ├── RoadClosureMarkers.tsx # Striped barrier warning polylines & markers
│   │   │   ├── UserLocationMarker.tsx # Pulsing blue GPS dot + accuracy halo
│   │   │   ├── MapController.tsx    # Programmatic pan/flyTo & follow handler
│   │   │   └── MapControls.tsx      # SOS, Share, Events, Admin, Compass, GPS, Zoom
│   │   ├── search/
│   │   │   ├── SearchBar.tsx        # Floating Google Maps-style search bar
│   │   │   ├── SearchSuggestions.tsx# Dropdown suggestions & classroom badges
│   │   │   └── CategoryPills.tsx    # Horizontal scrollable category filters
│   │   ├── sheet/
│   │   │   ├── PlaceDetailsSheet.tsx # Native mobile bottom sheet (peek/expanded)
│   │   │   ├── EventDetailsSheet.tsx # Event card with directions, share, cancel, report
│   │   │   ├── FriendDetailsSheet.tsx# Meet My Friend card with dynamic destination tracking
│   │   │   ├── VerificationBadge.tsx # Verified OSM vs pending survey badge
│   │   │   └── SavedPlacesModal.tsx  # Bookmarked places drawer
│   │   ├── sharing/
│   │   │   ├── ShareLocationModal.tsx# Duration selector (15m/1h/8h) & WhatsApp link generator
│   │   │   └── ActiveShareBanner.tsx # Top floating broadcasting pill with stop revocation
│   │   ├── emergency/
│   │   │   └── EmergencyModal.tsx   # Verified security/medical contacts & WhatsApp SOS
│   │   ├── qr/
│   │   │   └── QRScannerModal.tsx   # Verified campus entrance check-in & quick routing
│   │   ├── events/
│   │   │   ├── AddEventModal.tsx    # Student submission modal (Legal name, course, year, timings)
│   │   │   ├── EventsListModal.tsx  # Event directory & filter drawer
│   │   │   └── EventReportModal.tsx # Community violation reporting dialog
│   │   ├── admin/
│   │   │   └── AdminDashboardModal.tsx # Passcode dashboard, closures management & QR generator
│   │   ├── navigation/
│   │   │   ├── ModeSelector.tsx     # Walk, Bike, Car, Accessible mode selector
│   │   │   ├── NavigationTurnCard.tsx # Top turn maneuver card
│   │   │   ├── NavigationBottomBar.tsx# Bottom dashboard (distance, ETA, speed)
│   │   │   ├── NavigationStepsModal.tsx# Step-by-step itinerary view
│   │   │   └── ReportClosureModal.tsx# Student path obstacle reporting modal
│   │   └── common/
│   │       ├── OfflineBanner.tsx    # Status banner when disconnected from internet
│   │       ├── CompassHeading.tsx   # Rotating compass with magnetic needle
│   │       ├── ErrorNotice.tsx      # GPS permission and warning banners
│   │       └── Toast.tsx            # Floating action toasts
│   ├── App.tsx                  # Root layout, real-time sync, modals & state
│   ├── index.css                # Tailwind directives & mobile styles
│   └── main.tsx                 # React DOM root entry
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── REQUIREMENTS.md
├── PROJECT_ROADMAP.md
├── DATA_VERIFICATION.md
└── CHANGELOG.md
```

---

## 🔐 Administrative Access & Security Architecture

The Admin Panel is accessible via multiple official entry points:
1. **Direct Dedicated URL**: Navigate directly to `/admin` in your browser.
2. **Navigation Menu Drawer**: Open the Google Maps-style side menu via the hamburger icon in the search bar and select **Admin Dashboard**.
3. **Map Quick Access**: Click the **Shield icon** located in the floating map controls.

### Security & Role Authorization
- **No Hardcoded Passcodes**: The system does NOT rely on client-side hardcoded passcodes. Access is governed by Firebase Authentication and verified custom claims (`admin: true`) combined with Firestore security checks (`/admin_users/{uid}`).
- **Unauthorized Blocking**: Users navigating to `/admin` without administrative authorization cannot read or write private student records. Unprivileged accounts are rejected with an explicit security alert.
- **Local Simulation Mode**: For testing without active Firebase credentials in `.env`, any valid administrator email (e.g. containing `admin` or ending with `@lpu.co.in`) is accepted for offline evaluation.

### Provisioning the First University Administrator
To grant official administrative claims to a university staff account:
1. Download your Firebase Service Account Private Key from [Firebase Console](https://console.firebase.google.com) (`Project Settings` -> `Service Accounts` -> `Generate new private key`).
2. Save the downloaded file as `serviceAccountKey.json` in the project root directory.
3. Run the automated provisioning script:
   ```bash
   node scripts/setAdmin.cjs your-admin-email@lpu.co.in
   ```
   *(Or pass the user's Firebase UID: `node scripts/setAdmin.cjs <UID>`)*

4. The script automatically assigns the `{ admin: true }` custom claim on Firebase Auth and registers the administrator in `/admin_users/{uid}` in Firestore.
5. The administrator can now log in at `/admin`.

### Admin Capabilities & Moderation
- **KPI Metrics Dashboard**: Registered student organizers, total campus events, live now, upcoming, expired history, pending abuse reports, active road closures, and QR codes.
- **Student Event Submission Audit Log**: Displays full student legal identity (Legal Name, Course, Year of Study, Account UID, Event Name, Event Location, Start/End, Submission Timestamp, Event Status).
- **Public Privacy Wall**: Public users and students see ONLY the creator's casual display name; sensitive student academic details are strictly redacted.
- **Event Approval & Removal**: Instant deletion of violating events from all student devices in real-time.
- **Abuse Reports Moderation**: Review community flags and resolve violations.
- **Road Closures Coordinator**: Activate scheduled or emergency campus path closures and approve student obstacle reports.
- **Printable QR Navigation Generator**: Generate and download printable SVG QR badges for all 28+ verified campus blocks and classrooms.

---

## ⚡ Real-Time Firebase Setup & Dual-Mode Fallback

The application features a **Dual-Mode Sync Architecture**:
1. **Zero Configuration (Default)**: If Firebase credentials are not provided, the application automatically runs in local multi-tab synchronization mode using `BroadcastChannel` and typed `localStorage`. All event features (creating, reporting, directions, admin panel) work out of the box without requiring external cloud setup.
2. **Production Firebase**: To connect to a live Firebase project:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Populate with your Firebase Project credentials:
     ```env
     VITE_FIREBASE_API_KEY="your-api-key"
     VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
     VITE_FIREBASE_PROJECT_ID="your-project-id"
     VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
     VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
     VITE_FIREBASE_APP_ID="your-app-id"
     ```
   - Deploy `firestore.rules` to your Firebase project via the Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```

---

## 🔒 Data Integrity Policy

In strict adherence to project specifications:
- **No Fabricated Data**: No fake roads, coordinates, hours, ramps, or photos have been created.
- **Truthful Status**: Facilities awaiting on-ground survey (such as specific distant hostel blocks) are searchable but labeled **"Pending Ground Survey (Phase 2)"** and omitted from marker clutter until surveyed.
- **Routing Integrity**: Route path networks are strictly marked as pending until verified path graphs are digitized. Straight-line distance is computed mathematically from GPS fixes without inventing fictional roads.
