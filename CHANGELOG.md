# Changelog

All notable changes to the **LPU Smart Campus Navigator** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [7.0.0] - Phase 7: Real-Time Location Sharing & Meet My Friend - 2026-11-15

### Added
- **Production Dual-Mode Live Location Sharing Backend (`locationSharingService.ts` & `vite.config.ts`)**:
  - Implemented multi-device Server-Sent Events (SSE) & REST synchronization (`/api/shares`, `/api/shares/coords`, `/api/shares/revoke`) combined with Firebase Firestore (`location_shares/{token}`).
  - Enables instant cross-device and cross-browser live tracking across Android, iOS, Windows, Mac on campus Wi-Fi (`http://172.28.9.119:5173/`).
- **Cryptographic Capability Tokens**:
  - Unguessable 24-character random entropy tokens (`lpu_loc_...` with 62^24 combinations) ensuring zero public collection snooping or unauthorized tracking without the link.
- **Battery-Optimized Dynamic GPS Throttling**:
  - Built-in rate limiter ensuring high-frequency GPS jitter is smoothed, capping remote coordinate updates to at most once per 2.5 seconds or on significant movement (> 2.5 meters), drastically saving mobile battery.
- **3D WebGL "Meet My Friend" Integration (`Campus3DMap.tsx`)**:
  - Custom 3D MapLibre friend marker featuring an animated emerald radar pulse, avatar initials circle, and friend name badge.
  - Tapping the friend marker in 3D opens the compact `FriendDetailsSheet` with live distance, last updated seconds ago, and directions button.
  - Complete parity between 2D Leaflet and 3D WebGL modes.
- **Dynamic Friend Movement Navigation & Detour Routing**:
  - Automatic destination waypoint adjustment as the friend moves across campus.
  - Multi-mode routing across Walking, Bike, Car, and Wheelchair.
  - Instant navigation termination if friend stops sharing or link auto-expires.
- **Automated Test Suite (`scripts/testLocationSharing.cjs`)**:
  - 6 end-to-end automated tests verifying token cryptography, expiration math (15m, 1h, 8h), WhatsApp URL generation, battery throttling, instant revocation, and database persistence.

---

## [6.0.0] - Phase 6: 3D Campus Explore Mode with WebGL Extrusions - 2026-11-15

### Added
- **Interactive 3D WebGL Campus Explorer (`Campus3DMap.tsx`)**:
  - Integrated **MapLibre GL JS** for GPU-accelerated 3D WebGL rendering, enabling smooth pitch (0° to 75°), continuous bearing rotation (0° to 360°), and dynamic camera flight animations (`flyTo`, `easeTo`).
  - OpenStreetMap raster basemap combined with directional ambient lighting and vertical wall gradients.
  - Floating 3D building labels with category color pins for rapid building identification in 3D perspective.
  - Live GPS avatar marker and heading directional cone rendered in 3D.
  - Active route polyline rendered in 3D with glowing halo (`#60a5fa`) and crisp core (`#1d4ed8`).
  - Live campus event pins and road closure warning barriers rendered at campus locations in 3D.
- **Curated 3D Building Footprints Dataset (`campus3DFootprints.ts`)**:
  - Modeled 24+ campus facilities with metric-accurate dimensions, realistic floor heights, and category color palettes.
  - Academic blocks (Blocks 34, 36, 38, 25-28, 30, 13, 55-56), Hostels (BH-1 to BH-6, GH-1 to GH-4), Central Library, UniMall, Baldev Raj Mittal Unipolis (16-sided dome polygon), Sports Complex, Cricket Stadium pavilion, UniHospital, and Main Gates 1, 2, 3.
  - Transparent data audit: Every footprint explicitly tracks `isApproximate: boolean` and `geometrySource` (`verified_osm` vs `approximate_osm`).
- **2D / 3D Mode Selector (`MapModeToggle.tsx`)**:
  - Glassmorphic segmented pill control for switching between **2D Navigation** (optimal for Dijkstra routing and GPS) and **3D Explore** (optimal for visual understanding and building extrusions).
  - Preserves selected place context: Selecting a building in 2D stays selected and highlighted in 3D, and vice versa.
  - Integrated 2D/3D mode toggling directly inside the navigation drawer menu (`NavigationMenuDrawer.tsx`).
- **Tactical 3D Camera Controls**:
  - Real-time rotating Compass button that resets North on tap.
  - Perspective Tilt toggle button (switching between top-down 0° and cinematic 60° 3D tilt).
  - WebGL Zoom In / Zoom Out controls.
  - Recenter Campus button (centers on LPU core with 55° pitch).
  - Recenter GPS button (centers on user's live coordinates in 3D).
- **Graceful Hardware Fallback (`webglSupport.ts`)**:
  - Automated WebGL context detection to protect low-end devices, with informational fallback to 2D Leaflet mode.

---

## [5.2.0] - Authoritative Admin Event Deletion & Multi-Device Real-Time Sync - 2026-11-15

### Fixed
- **Root Cause: Cross-Browser & Cross-Device Sync Isolation**:
  - Identified that without `.env` configured, the application previously relied strictly on browser-local `localStorage` and `BroadcastChannel`, which are origin/browser-isolated and could not communicate deletions between separate browsers (e.g. Chrome vs Firefox/Incognito) or separate mobile devices on LAN.
  - Implemented an authoritative lightweight development server backend (`campusSyncPlugin` in `vite.config.ts`) supporting persistent storage (`.campus_events_db.json`), atomic REST mutations, and Server-Sent Events (SSE) streaming (`/api/events/stream`) allowing real-time event updates across all connected browsers and physical devices on the campus network.
- **Root Cause: Swallowed Admin Deletion Errors**:
  - Removed silent `try...catch` swallowing in `eventService.adminRemoveEvent`. The system now strictly awaits authoritative server confirmation before updating state or displaying success to the administrator. If the server fails or permissions are rejected, an explicit error toast is displayed.
- **Root Cause: Lingering Public Event Details Bottom Sheet**:
  - Fixed public map state in `App.tsx` where an already-open event details sheet remained visible even after an admin deleted the event. Active event subscriptions now automatically compare `selectedEvent.id` against the authoritative active event list and immediately dismiss the modal if removed.
- **Root Cause: Contradictory Network Connection Status**:
  - Resolved discrepancy where Admin Dashboard indicated "Local Offline Sync" while the public map toasted "Connected to campus cloud". Updated connection indicators in `App.tsx` and `AdminDashboardPage.tsx` to detect whether Firebase is configured and honestly report "Online: Connected to Firebase Campus Cloud" or "Online: Connected to Local Shared Campus Server".
- **Stale Cache Resurrection Prevention (Tombstone Registry)**:
  - Implemented an authoritative tombstone registry (`STORAGE_KEY_TOMBSTONES`) that persists deleted event IDs with `removed_by_admin` status. Any cached event matching a tombstone ID is permanently discarded during startup and sync passes.

### Added
- **Soft-Delete Lifecycle Status (`removed_by_admin`)**:
  - Added `removed_by_admin` to `EventStatus` union type in `src/types/events.ts`.
  - Added audit metadata: `removedAt`, `removedBy`, and `moderationReason`.
  - Removed events disappear immediately from public live campus map and event counts, but remain preserved in the Admin Dashboard under the "Removed / Moderated" filter for administrative accountability and audit trail.
- **Reactive Admin Dashboard Subscriptions**:
  - Admin Dashboard now subscribes via `eventService.subscribeToAllEvents`, automatically updating event metrics, lists, and status badges in real-time when deletions or additions occur.
- **Automated End-to-End Event Lifecycle Verification Test**:
  - Created `scripts/testEventSync.cjs` simulating the complete creation -> live publication -> admin soft-deletion (`removed_by_admin`) -> instant public map exclusion -> admin audit retention lifecycle.

---

## [5.1.0] - Dedicated Admin Panel & Security Routing Upgrade - 2026-11-15

### Added
- **Dedicated `/admin` Route**:
  - Implemented a zero-dependency HTML5 History SPA Router (`src/router/Router.tsx`) supporting direct URL access to `/admin` and public map at `/`.
  - Created a full-screen, responsive Admin Dashboard page (`src/pages/AdminDashboardPage.tsx`) with a desktop sidebar and mobile navigation drawer.
- **Google Maps-Style Navigation Menu Drawer**:
  - Added a hamburger menu icon button on the search bar.
  - Implemented `NavigationMenuDrawer.tsx` with links to Campus Map (`/`), Campus Events, Saved Places, Live Location Sharing, Emergency SOS, Report Road Obstacle, and Admin Dashboard.
  - Displays dynamic administrator badge when an authorized admin session is active.
- **Role-Based Firebase Security & Custom Claims**:
  - Replaced hardcoded client-side passcode validation with real Firebase Authentication verification (`claims.admin === true` and `/admin_users/{uid}` in Firestore).
  - Implemented `signInAdminWithEmail` and `signOut` in `authService.ts`.
  - Blocks unauthorized users attempting to access administrative records even by directly navigating to `/admin`.
- **First Administrator Provisioning Script**:
  - Created `scripts/setAdmin.cjs` using Firebase Admin SDK to safely provision the initial university administrator account via email or UID.
- **Full Student Academic Identity Audit Log**:
  - Stored and displayed student legal identities to authorized administrators: Legal Name, Course, Year of Study, Account UID, Event Title, Event Venue, Start/End, Submission Timestamp, Event Status.
  - Redacted all sensitive academic details from public student views (only casual display name is exposed publicly).
- **Road Closures, Abuse Moderation & QR Badges**:
  - Integrated road closure approval, abuse moderation resolution, and SVG QR badge generation into the dedicated admin page.

### Changed
- Refactored `App.tsx` to mount inside `<Router>`, conditionally rendering `AdminDashboardPage` on `/admin` and `CampusNavigatorView` on `/`.
- Connected the floating Shield button on the map to navigate directly to `/admin`.

---

## [5.0.0] - Phase 5 Smart Location Sharing & Campus Utilities - 2026-11-15

### Added
- **WhatsApp Live Location Sharing**:
  - Secure, unguessable capability URL generation (`?share=lpu_loc_...`) utilizing cryptographic `crypto.getRandomValues`.
  - Configurable auto-expiry durations: **15 minutes**, **1 hour**, or **8 hours**.
  - Toggle between **Live GPS (Moving)** and **One-Time Location Pin**.
  - Direct 1-tap WhatsApp sharing (`https://wa.me/?text=...`) and native Web Share API (`navigator.share`) support.
  - Active broadcasting floating banner with real-time countdown ticker and instant **"Stop Sharing"** revocation.
  - Transparent advisory banner explaining browser background GPS limitations when the screen locks or tab minimizes, preparing architecture for future Capacitor mobile apps.
- **Meet My Friend**:
  - Direct deep-link reception (`?share=<token>`) with live Firestore `onSnapshot` and `BroadcastChannel` multi-tab sync.
  - Distinctive Leaflet avatar marker with green radar ping, accuracy radius halo, and "Last updated Xs ago" indicators.
  - **Dynamic Moving Target Navigation**: Automatically recalculates destination waypoints and active path as the friend moves across campus.
  - Supports all 4 travel modes (**Walking**, **Bike**, **Car**, **Wheelchair**).
  - Graceful notification when sharing expires or is revoked.
- **Offline Campus Map & Tile Policy Compliance**:
  - Full client-side offline operation: 28+ campus facilities, academic blocks, classrooms, and hostels search locally from memory and `localStorage`.
  - Multimodal campus routing graph and Dijkstra pathfinding run 100% locally with zero internet connectivity.
  - Real-time online/offline status detection (`navigator.onLine`) with an amber status banner.
  - Strict compliance with OpenStreetMap Tile Usage Policy: No bulk-downloading or scraping standard OSM tiles; documents architecture for self-hosted PMTiles/MBTiles vector tile solution.
- **QR Campus Navigation**:
  - Scannable physical entrance QR code links (`?qr=<locationId>`).
  - Strict security validation against verified campus facilities (`CAMPUS_LOCATIONS`), rejecting unverified or arbitrary GPS coordinates.
  - On-site welcome modal setting the scanned building as the route origin and offering 1-tap navigation to popular campus hubs.
  - Admin-only QR Code Generator in the Admin Dashboard (`LPU@Admin2026`) generating printable vector SVG badges for all 28+ verified buildings.
- **Road Closure Alerts & Dynamic Route Recalculation**:
  - Real-time road closure synchronization via Firestore and `BroadcastChannel`.
  - Striped red/amber dashed warning polylines and barrier markers rendered on the Leaflet canvas.
  - Dijkstra routing engine integration: dynamically avoids impassable closed edges, recalculating detours automatically.
  - Admin console management tab to activate official path closures with auto-reopening end times.
  - Student path blockage reporting modal (`ReportClosureModal`), audited by administrators before becoming official routing blocks.
- **Campus Emergency Assistance (SOS)**:
  - Floating high-visibility red SOS trigger in tactical map controls.
  - Verified university contacts: LPU Main Security Control (`01824-517000`), UniHospital Trauma Care (`01824-517100`), Campus Ambulance Dispatch (`01824-517101`), and Women's Safety Helpline (`01824-517002`).
  - 1-tap **"Navigate to UniHospital (Emergency)"** immediately routing the student to the 24/7 medical wing.
  - 1-tap **WhatsApp Emergency SOS Alert** generating a pre-filled emergency broadcast with exact GPS coordinates and live map link.
- **Firestore Security Rules Matrix Update**:
  - Disallows `list()` queries on `/location_shares/{token}` to prevent coordinate scraping or enumeration attacks.
  - Grants read access exclusively to holders of the exact unguessable capability token.
  - Restricts modification and revocation strictly to the authenticated creator.
  - Restricts road closure activation strictly to university administrators.

---

## [4.0.0] - Phase 4 Live Campus Events & Admin Panel - 2026-11-15

### Added
- **Real-Time Campus Event Sharing System**:
  - Live broadcast system across LPU venues (UniPolis, UniMall, auditoriums, sports grounds, academic blocks, kiosks).
  - Floating "Events" map button with live count badge and full-screen event directory modal (`EventsListModal`).
  - 7 categorized custom Leaflet DivIcon markers (`concert`, `party`, `cultural`, `workshop`, `sports`, `activity`, `other`) with distinct hex colors and SVG icons.
  - Prominent visual pulsing effect (`animate-ping`) and "LIVE" badge indicators for active ongoing events.
  - Dual-mode synchronization: Live Firebase Firestore (`onSnapshot`) with offline-resilient multi-tab `BroadcastChannel` and `localStorage` fallback.
- **Privacy-Preserving Student Identity Architecture**:
  - **Strict Security Boundary**: Public `events` collection exposes *only* the creator's public display name (e.g. `Added by Rahul`).
  - **Protected Administrative Storage**: Sensitive academic identity details (Legal Full Name, Academic Course, Year of Study, UID) are isolated in a restricted `event_private_metadata` collection.
  - **Production Firestore Security Rules (`firestore.rules`)**:
    - Authenticated create with mandatory 6-hour duration verification.
    - Public read restricted exclusively to public event attributes.
    - Zero leaks: rejects documents containing student registration fields in public collections.
    - Sensitive metadata readable and writable strictly by university administrators and the event creator.
- **Strict 6-Hour Duration Enforcement & IST Timezone**:
  - Asia/Kolkata (`UTC+05:30`) display timezone formatting across all date-time pickers and cards.
  - Validation engine rejects events with durations exceeding 6 hours (`maxDurationMinutes: 360`), past end times, or invalid start/end sequences.
- **Automated Event Lifecycle & Expiration**:
  - Dynamic 15-second client-side ticker transitioning events through `upcoming` $\rightarrow$ `live` $\rightarrow$ `ended`.
  - Automatic removal of expired events from the live map canvas while preserving historical records for admin auditing.
  - Permanent campus facilities and geographic markers are strictly protected and never modified by event expirations.
- **Google Maps-Inspired Event Details Bottom Sheet (`EventDetailsSheet`)**:
  - Draggable bottom sheet on mobile and compact 380px panel on desktop.
  - Displays category badge, live/upcoming status pill, IST schedule, verified venue name, and privacy-safe creator display name.
  - Integrated 1-tap **"Directions"** action seamlessly activating the 4-mode routing engine to the event venue.
  - Social share with Web Share API and clipboard fallback.
  - Community abuse reporting dialog and creator cancellation button.
- **Secure University Admin Console (`AdminDashboardModal`)**:
  - Passcode-protected administrative dashboard (`LPU@Admin2026`).
  - Key Performance Indicators: Total Events, Live Events, Upcoming Events, Expired Events, Pending Abuse Reports.
  - Full creator identity unmasking for authorized admins: Legal Name, Course, Year of Study, and Firebase Account ID.
  - Instant administrative moderation: Single-click event removal and report resolution.
- **Community Abuse Reporting & Anti-Spam**:
  - Dedicated report modal (`EventReportModal`) supporting categories: fake event, inappropriate content, wrong venue, already expired, spam/commercial.
  - Client-side duplicate submission detection.

---

## [3.0.0] - Phase 3 LPU Building Photos & Classroom Finder - 2026-11-15

### Added
- **Building Photography & Metadata Architecture**:
  - Structured `CampusImageMetadata` data model with image URLs, thumbnails, captions, photographic credits, source URLs, licenses, and verification timestamps.
  - Authentic Wikimedia Commons photograph for Main Gate 1 (CC BY-SA 4.0) with attribution overlay.
  - Strict anti-stock policy: Polished "Photo Pending" cards with building block numbers, status pills, and transparent disclaimers for facilities awaiting verified field photography.
- **Classroom Finder**:
  - Implemented `src/data/classrooms.ts` and `src/types/classroom.ts` with a verified registry of laboratories, lecture halls, and examination rooms across LPU blocks.
  - Intelligent classroom query parser supporting `{Block}-{RoomNumber}` syntax (e.g. `34-405`, `36-201`, `38-101`, `25-101`, `LIB-101`, `34-G02`).
  - Automatic floor inference (e.g. Room 405 -> Level 4; G02 -> Level 0 / Ground).
  - Prominent Classroom Information Card in the bottom sheet with block name, floor, room type, verified ground entrance location, and factual indoor guidance notes.
  - Navigation routing directly to the verified ground entrance of the parent building.
- **Smart Campus Search**:
  - Support for multi-category queries: building numbers ("34", "36"), classroom numbers ("34-405"), hostels ("BH-1", "GH-2"), departments ("CSE", "Mechanical", "MBA"), facilities ("ATM", "Gym", "Hospital"), and aliases.
  - Search suggestion grouping with dedicated badges (`Classroom · Floor 4`, `Block 34`, `Hostel`).
- **Building Infrastructure Details**:
  - Added verified floor counts, elevator/lift availability, restrooms, and purified RO drinking water info to `CampusLocation`.
  - Hosted academic departments and schools tags.
- **Navigation Accuracy Improvements**:
  - **Off-Campus Origin Snapping**: If navigation starts while physically outside LPU bounds, the origin automatically snaps to Main Gate 1 with an advisory disclaimer.
  - **Dynamic Off-Route Recalculation**: If a student moves > 45 meters off the active route polyline (with GPS accuracy <= 35m), the engine automatically recalculates a new route from the current position.
  - **Accurate Distance & ETA**: Computes remaining distance dynamically along remaining path geometry rather than straight-line estimates.

---

## [2.0.0] - Phase 2 Real GPS and Campus Navigation - 2026-11-15

### Added
- **Verified Campus Path Network Graph**:
  - Implemented `src/data/campusRouteGraph.ts` modeling 30 intersection/entrance nodes and 56 directed edges across LPU.
  - Sourced strictly from verified OpenStreetMap paths and university layout.
  - Segregated paths by mode permissibility (walking, bike, car, wheelchair).
- **Mode-Specific Routing Engine (`RoutingService`)**:
  - Full Dijkstra shortest-path algorithm with mode filtering.
  - **Walking Mode**: Navigates pedestrian boulevards, corridors, plazas, and pathways.
  - **Bike Mode**: Routes along wide paved avenues and perimeter cycle rings.
  - **Car Mode**: Restricted to peripheral vehicular roads; auto-routes to nearest parking (Gate 1 or UniMall Parking) when destination is in pedestrian core.
  - **Wheelchair Mode**: Strictly checks verified grade-level ramps (< 4% incline) and level concourses; reports unavailable when entrance plinths have physical stairs.
- **Turn-by-Turn Navigation Interface**:
  - **Start / Stop Navigation**: Seamless transition from place card to full-screen GPS navigation view.
  - **Active Route Polyline**: High-contrast blue route with casing, start circle, and destination pin.
  - **Top Turn-by-Turn Maneuver Card (`NavigationTurnCard`)**: Displays next maneuver icon (turns, bearings, arrivals), real distance to next turn, and instruction text.
  - **Bottom Navigation Dashboard (`NavigationBottomBar`)**: Real-time calculated remaining distance, estimated arrival time (ETA), real GPS speed (km/h), and camera recenter controls.
  - **Full Step-by-Step Directions Modal (`NavigationStepsModal`)**: Review entire turn-by-turn route itinerary.
- **Enhanced Live GPS Tracking**:
  - Continuous Geolocation API tracking with `watchPosition` and clean unmount teardown.
  - Weak signal detection (accuracy > 50m) and stale coordinate warning banners.
  - Auto-follow camera tracking during active navigation.
  - Live GPS speed reporting in km/h.
- **Marker Clarity & De-duplication**:
  - Unambiguous pin abbreviations (`34`, `36`, `LIB`, `MALL`, `POLIS`, `HOSP`, `GYM`, `G1`).
  - Removed duplicate labels and redundant text popups.
  - Non-colliding tooltip positioning.

---

## [1.0.1] - Phase 1 UI Corrections - 2026-11-15

### Fixed
- **Responsive Google Maps-Style Bottom Sheet & Desktop Side Panel**:
  - Replaced oversized bottom panel with a responsive sheet defaulting to ~30% viewport height on mobile, expandable via upward swipe/tap to 78%, and collapsible/closable via downward swipe or close button.
  - On desktop screens (`md:`), transformed into a compact 380px wide floating side panel, keeping the interactive map completely visible without blank white space.
  - Dynamically elevated floating map controls (GPS, compass, zoom) above the bottom sheet on mobile so they are never obscured.
- **Place Photo Card**:
  - Added support for verified building photography (e.g. Wikimedia Commons CC BY-SA 4.0 photo for Main Gate 1).
  - Clean architectural fallback card for facilities awaiting physical photography, with transparent disclaimer preventing fabricated images.
- **Map Marker De-cluttering & Overlap Prevention**:
  - Implemented zoom-dependent Level-of-Detail (LOD) tiering (Tier 1 campus anchors at zoom 14+, Tier 2 academic blocks at zoom 16+, Tier 3 hostels & kiosks at zoom 17+).
  - Selected places and active category filters always override LOD to stay permanently visible.
  - Replaced intrusive permanent popups with non-colliding lightweight tooltips.
- **Category Filter Scrolling & Layout**:
  - Enhanced horizontal scrolling for category filter pills with momentum touch panning and clear spacing.
  - Prevented filter pills from overlapping search bar or suggestions dropdown.
- **Navigation Availability Labeling**:
  - Explicitly marked turn-by-turn routing as unavailable until the Phase 2 verified route graph is completed, preventing any misleading indications.

---

## [1.0.0] - Phase 1 Initial Release - 2026-11-15

### Added
- **Core Real Campus Map Integration**:
  - Embedded Leaflet map centered at LPU (`31.25492, 75.70462`) utilizing OpenStreetMap tile provider with strict campus bounding restrictions.
  - Full mobile viewport layout taking `100dvh` with notch and home-bar safe area insets (`env(safe-area-inset-*)`).
  - Smooth mobile touch gestures (pinch-zoom, pan, double-tap zoom).
  - OpenStreetMap attribution compliance.
- **Google Maps-Inspired Mobile Interface**:
  - Top-floating search bar with rounded styling, subtle blur, and drop shadow.
  - Multi-keyword token search engine with rank scoring across names, blocks, tags, and categories.
  - Dynamic category filter pills (`All`, `Academic`, `Boys Hostels`, `Girls Hostels`, `UniMall`, `Libraries`, `Food`, `Hospital`, `Sports`, `Gates`, `Parking`, `Administration`).
  - Search suggestion dropdown with instant results and recent search history tracking.
- **Campus Verified Location Dataset**:
  - Typed geographic dataset (`src/data/locations.ts`) featuring academic blocks, hostels, Central Library, UniMall, Unipolis, auditoriums, canteens, gates, hospital, and sports facilities.
  - Strict verification status taxonomy: `verified_osm`, `approximate_osm`, and `pending_survey`.
  - Filter logic guaranteeing markers are placed only where valid coordinates exist.
- **Native-Style Bottom Sheet & Place Details**:
  - Expandable bottom sheet with drag handle, category badge, block number, and verification status pill.
  - Factual location description, verified facilities chips, campus gate entry notes, and accessibility notices.
  - Quick action controls: **Directions**, **Save (Bookmark)**, **Share** (Web Share API with clipboard fallback), and **GPS Fix**.
  - Direct link to inspect location node on OpenStreetMap.
- **GPS Foundation & Accuracy Tracking**:
  - Geolocation permission flow with continuous watchPosition tracking.
  - High-precision blue user location marker with directional heading beam and accuracy radius circle.
  - Recenter GPS button with active follow mode and auto-release upon manual map pan.
  - Graceful error messaging for denied permission, unavailable GPS, timeout, and insecure HTTP contexts (HTTPS / localhost notice).
- **Multi-Modal Navigation Foundation**:
  - Responsive mode selector for **Walking**, **Bike**, **Car**, and **Wheelchair (Accessible)**.
  - Exact Haversine straight-line distance calculation and mode-based transit pace estimate.
  - Reusable routing service interface (`IRoutingService`) with explicit disclaimers that turn-by-turn routing paths will be activated in Phase 2.
- **Local Storage & Bookmarking**:
  - Client-side storage service managing saved places and recent search history with private-mode fallbacks.
  - "Saved Campus Places" modal drawer.
- **Mobile Hardware Controls**:
  - Compass heading control displaying real device heading (iOS & Android orientation event support) with tap-to-realign North.
  - Clean floating map controls (+/- zoom, full campus overview, GPS recenter).
- **Future Architecture & Contracts**:
  - Routing graph interfaces (`CampusRouteGraph`, `PathNode`, `PathEdge`).
  - Phase 4 live campus events schema enforcing strict **6-hour max duration**, public submitter anonymity, and admin-only registration details.
- **Comprehensive Project Documentation**:
  - `README.md`, `REQUIREMENTS.md`, `PROJECT_ROADMAP.md`, `DATA_VERIFICATION.md`, and `CHANGELOG.md`.

### Security & Privacy
- Zero leakage of student registration numbers or private emails to public feeds in events schema.
- Geolocation API guarded with secure context checks.
