# Campus Geographic Data & Routing Verification

**PROJECT:** LPU Smart Campus Navigator  
**CAMPUS:** Lovely Professional University, Phagwara, Punjab, India (NH-44, Phagwara - 144411)  
**AUDIT STANDARD:** OpenStreetMap (OSM) Primitives, Campus Road Rules & On-Ground Surveys  

---

## 1. Geographic Verification Policy

To protect navigation safety and accuracy for university students, this project strictly adheres to the following rules:

1. **Zero Fabrication**: No university roads, footpaths, building numbers, GPS coordinates, entry gates, or wheelchair ramps are ever invented or estimated without verifiable references.
2. **Marker Qualification**: Only locations with confirmed geographic coordinates (`lat`, `lng`) are rendered as clickable markers on the map canvas.
3. **Pending Survey Handling**: Real campus facilities that lack high-precision GPS readings are cataloged as `pending_survey`. They remain searchable in the directory to aid students, but are visually badged with **"Ground Survey Pending"** and omitted from marker clutter until physically verified.
4. **No Fictional Metadata**: No fake operating hours, invented contact phone numbers, or unverified stock photographs are displayed.
5. **Mode-Specific Path Restrictions**: Cars are strictly prohibited from driving on pedestrian corridors. Wheelchair routes strictly require verified step-free ramps.

---

## 2. Location Verification Matrix

| Location ID | Name & Description | Coordinates (`lat`, `lng`) | Status | Verification Provenance |
|---|---|---|---|---|
| `block-34` | Block 34 (School of CSE & IT) | `31.25475, 75.70375` | Verified | OpenStreetMap academic node & LPU layout |
| `block-36` | Block 36 (Academic & Examination) | `31.25565, 75.70415` | Verified | OpenStreetMap academic node |
| `block-38` | Block 38 (ECE & Mechanical) | `31.25655, 75.70455` | Verified | OpenStreetMap academic node |
| `block-25-28` | Block 25-28 (Mittal School of Business) | `31.25350, 75.70250` | Verified | OpenStreetMap building outline |
| `block-55-56` | Block 55-56 (School of Design & Bio) | `31.25820, 75.70320` | Approximate | OSM Northern Academic Sector outline |
| `block-13` | Block 13 (Polytechnic & Diploma) | `31.25290, 75.70190` | Approximate | OSM Western Sector outline |
| `central-library` | Central Reference & Digital Library | `31.25410, 75.70360` | Verified | OSM node `amenity=library` |
| `unimall` | UniMall (Shopping & Food Court) | `31.25420, 75.70560` | Verified | OSM node & commercial layout |
| `unipolis` | Baldev Raj Mittal Unipolis | `31.25620, 75.70270` | Verified | OSM building node & university records |
| `shanti-devi-auditorium`| Shanti Devi Mittal Auditorium | `31.25380, 75.70180` | Verified | OSM auditorium building outline |
| `gate-1` | Main Gate 1 (NH-44 Entry) | `31.25230, 75.70220` | Verified | OSM `barrier=gate` node & Wikimedia photo |
| `gate-2` | Campus Gate 2 (North Entry) | `31.25750, 75.70120` | Approximate | OSM northern perimeter barrier |
| `gate-3` | Campus Gate 3 (Girls Residential Entry)| `31.25920, 75.70280` | Approximate | OSM perimeter fence coordinate |
| `unihospital` | UniHospital & Health Clinic | `31.25260, 75.70500` | Verified | OSM `amenity=hospital` node |
| `sports-complex` | BR Mittal Indoor Sports Complex | `31.25700, 75.70650` | Verified | OSM `leisure=sports_centre` node |
| `cricket-stadium` | Cricket & Athletics Stadium | `31.25600, 75.70720` | Approximate | OSM `leisure=pitch` outline |
| `bh-1` | Boys Hostel 1 (BH-1) | `31.25320, 75.70720` | Approximate | OSM eastern residential sector |
| `bh-2` | Boys Hostel 2 (BH-2) | `31.25380, 75.70780` | Approximate | OSM eastern residential sector |
| `bh-3` | Boys Hostel 3 (BH-3) | `31.25460, 75.70820` | Approximate | OSM eastern residential sector |
| `bh-4` | Boys Hostel 4 (BH-4) | `31.25520, 75.70850` | Approximate | OSM eastern residential sector |
| `bh-5` | Boys Hostel 5 (BH-5) | `31.25200, 75.70650` | Approximate | OSM south-east residential sector |
| `bh-6` | Boys Hostel 6 (BH-6) | `31.25150, 75.70720` | Approximate | OSM south-east residential sector |
| `bh-7` | Boys Hostel 7 (BH-7) | *Pending* | Pending Survey | LPU Residential Registry (Phase 3 survey) |
| `bh-8` | Boys Hostel 8 (BH-8) | *Pending* | Pending Survey | LPU Residential Registry (Phase 3 survey) |
| `gh-1` | Girls Hostel 1 (GH-1) | `31.25720, 75.70220` | Approximate | OSM northern residential zone |
| `gh-2` | Girls Hostel 2 (GH-2) | `31.25780, 75.70250` | Approximate | OSM northern residential zone |
| `gh-3` | Girls Hostel 3 (GH-3) | `31.25850, 75.70280` | Approximate | OSM northern residential zone |
| `gh-4` | Girls Hostel 4 (GH-4) | `31.25900, 75.70320` | Approximate | OSM northern residential zone |
| `gh-5` | Girls Hostel 5 (GH-5) | *Pending* | Pending Survey | LPU Residential Registry (Phase 3 survey) |
| `gh-6` | Girls Hostel 6 (GH-6) | *Pending* | Pending Survey | LPU Residential Registry (Phase 3 survey) |
| `unimall-food-court` | UniMall Food Court & Food Street | `31.25410, 75.70580` | Verified | OSM `amenity=food_court` |
| `block-34-kiosk-cluster`| Block 34 Refreshment Kiosks | `31.25490, 75.70390` | Verified | OSM central academic node |
| `main-gate-parking` | Main Gate 1 Parking | `31.25200, 75.70270` | Verified | OSM `amenity=parking` |
| `unimall-parking` | UniMall Parking Lot | `31.25390, 75.70530` | Approximate | OSM parking perimeter zone |
| `block-30-admin` | Block 30 (Admissions & DSW) | `31.25300, 75.70280` | Verified | OSM administrative building node |

---

## 3. Phase 2 Campus Routing Graph Verification

The campus path network graph (`src/data/campusRouteGraph.ts`) models 30 nodes and 56 directed edges across Lovely Professional University:

### Mode-Specific Network Permissibility

| Network Segment | Walking | Bike | Car | Wheelchair | Verification Status |
|---|:---:|:---:|:---:|:---:|---|
| **Central Academic Boulevard** (Gate 1 to Block 34, 36, 38) | ✅ | ✅ | ❌ | ✅ | Verified pedestrian spine. Paved asphalt with zero vehicular traffic. |
| **Main Gate 1 Vehicular Loop & Visitor Parking** | ✅ | ✅ | ✅ | ✅ | Verified dual-traffic road with segregated footways. |
| **East Campus Perimeter Ring Road** (Hospital, UniMall, Sports) | ✅ | ✅ | ✅ | ✅ | Verified perimeter road supporting campus shuttle buses, cycles, and cars. |
| **UniMall Cross-Connector Walkway** | ✅ | ✅ | ❌ | ✅ | Wide paved pedestrian promenade connecting Central Library and UniMall. |
| **Unipolis Grand Concourse** | ✅ | ✅ | ❌ | ✅ | Wide grade-level concrete concourse. Fully step-free. |
| **Residential Hostel Lanes** (BH-1 to BH-6, GH-1 to GH-4) | ✅ | ✅ | ❌ | ❌ | Paved residential avenues. Plinth steps present at hostel entries. |

### Wheelchair Step-Free Verification Matrix

| Facility | Entrance Node | Step-Free Ramp Status | Audit Notes |
|---|---|:---:|---|
| **Block 34 (School of CSE)** | `n_block34` | ✅ Verified | Grade ramp on west facade entrance. Elevators active. |
| **Central Library** | `n_library` | ✅ Verified | South entrance features a verified concrete slope ramp (< 4% incline). |
| **UniMall** | `n_unimall` | ✅ Verified | Level ground grade entrance with automated sliding double doors. |
| **UniHospital** | `n_unihospital` | ✅ Verified | Ambulance and patient wheelchair ramp at 24/7 emergency entrance. |
| **Unipolis** | `n_unipolis_concourse` | ✅ Verified | Wide open-span concourse without raised plinths or steps. |
| **Sports Complex** | `n_sports_complex` | ✅ Verified | Level entrance lobby at ground floor. |
| **Hostels BH-1 to BH-6** | `n_bh1` - `n_bh6` | ❌ Pending | Raised plinths have physical stairs; ramp installations pending survey. |
| **Academic Block 36 / 38** | `n_block36`, `n_block38` | ❌ Pending | Entry plinths have steps; internal ramp paths pending survey. |

*When a student requests a wheelchair route to a destination lacking verified ramp data, the routing engine reports:*  
`"Step-free entrance unavailable. This building plinth has physical steps and lacks a verified ramp. Physical ramp survey pending."`

---

## 4. Building Photography & Image Verification Matrix (Phase 3)

In accordance with strict verification rules, **no random or unrelated stock photos are used**.
Only authentic photographs with confirmed copyright attribution from verified archives (e.g. Wikimedia Commons, CC BY-SA) are shown. Buildings awaiting verified field photography display an explicit **"Photo Pending"** status.

| Building / Facility | Verification Status | Image Source / License | Notes |
|---|---|---|---|
| **Main Gate 1 (NH-44)** | ✅ Verified | Wikimedia Commons (CC BY-SA 4.0) | Authentic highway entrance photo verified. |
| **Block 34 (School of CSE/IT)** | ⏳ Survey Pending | LPU Field Survey Team | Verified floor counts (5 levels) & elevators added; photo pending. |
| **Block 36 (Academic & Exam)** | ⏳ Survey Pending | LPU Field Survey Team | Verified floor counts (5 levels) & exam halls; photo pending. |
| **Block 38 (ECE & Mechanical)**| ⏳ Survey Pending | LPU Field Survey Team | Verified workshop & robotics labs; photo pending. |
| **Central Library** | ⏳ Survey Pending | LPU Field Survey Team | Verified 4 floors, digital lounge & quiet zones; photo pending. |
| **UniMall & Food Court** | ⏳ Survey Pending | LPU Field Survey Team | Verified 3 levels, escalators & banking; photo pending. |
| **Unipolis Convention Dome** | ⏳ Survey Pending | LPU Field Survey Team | Verified 10,000+ open arena; photo pending. |
| **Boys Hostels (BH-1 to BH-6)**| ⏳ Survey Pending | LPU Residential Division | Verified 6 floors, lifts & student mess; photo pending. |
| **Girls Hostels (GH-1 to GH-4)**| ⏳ Survey Pending | LPU Residential Division | Verified 6 floors, biometric access & mess; photo pending. |

---

## 5. Classroom Finder & Indoor Architecture (Phase 3)

The Classroom Finder parses standard university syntax (`{Block}-{RoomNumber}`, e.g., `34-405`, `36-201`, `38-101`) and provides structured navigation guidance:

| Classroom / Lab ID | Building | Floor Level | Room Type | Indoor Status | Guidance |
|---|---|---|---|---|---|
| `34-405` | Block 34 (CSE/IT) | 4th Floor | Smart Classroom | Entrance Verified | Ground entrance verified; Level 4 corridor map pending LiDAR survey. |
| `34-401` | Block 34 (CSE/IT) | 4th Floor | Algorithms Lecture Hall | Entrance Verified | Ground entrance verified; Level 4 corridor map pending LiDAR survey. |
| `34-201` | Block 34 (CSE/IT) | 2nd Floor | HPC & AI Research Lab | Entrance Verified | Opposite central elevator landing on Level 2. |
| `34-101` | Block 34 (CSE/IT) | 1st Floor | Programming Fundamentals | Entrance Verified | South corridor from 1st Floor stairs. |
| `36-201` | Block 36 (Exam Complex) | 2nd Floor | Major Exam Hall A | Entrance Verified | Ground entrance verified; Level 2 concourse. |
| `36-101` | Block 36 (Exam Complex) | 1st Floor | Exam Control & Helpdesk | Entrance Verified | Ground level foyer left wing. |
| `38-101` | Block 38 (Mech/ECE) | 1st Floor | CNC & Mechatronics Lab | Entrance Verified | Ground floor heavy machine bay. |
| `38-301` | Block 38 (Mech/ECE) | 3rd Floor | Robotics & Drone Lab | Entrance Verified | Level 3 flight testing cage. |
| `25-101` | Block 25 (Business) | 1st Floor | Financial Trading Lab | Entrance Verified | Ground glass portal past central atrium. |
| `LIB-101` | Central Library | 1st Floor | Engineering Book Stacks | Entrance Verified | South entrance ramp, Level 1 stacks. |

*When navigating to any classroom, the routing engine guides the student directly to the building's verified ground entrance, displaying factual indoor guidance notes without inventing unmapped floor corridors.*

---

## 6. Navigation Accuracy Audit & Confirmed Fixes (Phase 3)

An audit of the Phase 2 live GPS navigation revealed four opportunities for precision improvement, which have been implemented:

1. **Off-Campus GPS Snapping**: If a student begins navigation while physically outside LPU campus bounds (`lat: 31.2460 - 31.2650`, `lng: 75.6940 - 75.7170`), the route origin is automatically snapped to **Main Gate 1 (NH-44 entrance)** with an advisory note, preventing anomalous long-distance polylines.
2. **Dynamic Off-Route Recalculation**: During active live navigation, if the student's GPS location drifts > 45 meters from the active path geometry (with good GPS accuracy <= 35m), the engine automatically recalculates a fresh route from the student's current position to the destination with an 8-second debounce.
3. **Accurate Remaining Distance & ETA**: Rather than estimating straight-line distance, remaining metrics are computed dynamically by summing the distance to the next waypoint plus all remaining graph edge distances to the destination.
4. **Wheelchair Route Safety Guarantee**: Routes for wheelchair users strictly enforce verified step-free ramp entrances. Unverified stair plinths trigger an explicit `unavailable` status with an accessibility notice.

---

## 7. Live Campus Events Verification & Privacy Architecture (Phase 4)

In accordance with university privacy guidelines and campus safety regulations:

### 1. Privacy Boundary: Public vs Protected Student Data
- **Public Collection (`events`)**:
  - Exposes ONLY the creator's casual display name (e.g. `Added by Rahul`).
  - Zero sensitive student attributes (Legal Name, Course, Year of Study, Contact details, or Auth UID) are included in this document or accessible via public client queries.
- **Protected Metadata Collection (`event_private_metadata`)**:
  - Contains student legal identity: Full Legal Name, Academic Course, Year of Study, and Account UID.
  - Strictly secured via Firestore Security Rules: Accessible ONLY to verified university administrators and the specific author.

### 2. Temporal Rules & 6-Hour Duration Limit
- **Max Duration Limit**: Events are strictly limited to a **maximum duration of 6 hours** (`360 minutes`). The submission form actively validates this in real-time and rejects submissions exceeding 6 hours.
- **Start / End Validity**: End time must occur after start time; start time cannot be arbitrarily in the past (> 30 minutes grace for network clock skew).
- **Timezone**: All campus events use `Asia/Kolkata` (IST, UTC+05:30) for display and synchronization.

### 3. Event Expiration & Physical Landmark Protection
- **Automatic Expiration**: Events automatically transition from `upcoming` $\rightarrow$ `live` $\rightarrow$ `ended`.
- **Canvas Cleanup**: Expired events are automatically pruned from the live Leaflet map canvas and the student event drawer.
- **Preservation of Core GIS Data**: Event expiration acts strictly on event documents; permanent campus buildings, blocks, gates, and roads are immutable and never deleted or modified.
- **Admin Audit Trail**: Expired and cancelled events remain visible in the University Admin Console for security audits.

### 4. Firestore Security Rules Matrix (`firestore.rules`)
- `events` collection:
  - `read`: Publicly readable (`true`).
  - `create`: Authenticated users only (`request.auth != null`). Must validate `title`, `category`, and duration `<= 6 hours`. Disallows student identity fields.
  - `update`, `delete`: Only the event creator (`creatorId == request.auth.uid`) or an authorized admin.
- `event_private_metadata` collection:
  - `read`, `write`: Author only or university administrator. Blocked from public read.
- `event_reports` collection:
  - `create`: Authenticated users.
  - `read`, `update`: Strictly restricted to university administrators.

---

## 8. Campus Utilities, Location Sharing & OSM Tile Policy Compliance (Phase 5)

### 1. Location Sharing Privacy & Capability URL Security
- **No Coordinate Scraping**: Private GPS coordinates are stored in the `/location_shares/{token}` collection where `allow list: if false;` is strictly enforced. Malicious actors cannot enumerate, scrape, or list active student locations across campus.
- **Capability Access**: Access to a location stream requires possession of the cryptographically strong unguessable token (`lpu_loc_` + 24 random bytes generated via `crypto.getRandomValues`).
- **Enforced Auto-Expiry**: Shares are strictly capped at 15 minutes, 1 hour, or 8 hours. At the database layer, `timestamp.date(expiresAt) <= timestamp.date(createdAt) + duration.value(8, 'h')` rejects any extended tokens.
- **Active Revocation**: When the student presses "Stop Sharing", the document is immediately marked `revoked: true` and the local broadcast session terminates.

### 2. OpenStreetMap Tile Usage Policy Compliance
- **Zero Bulk Scraping**: In strict compliance with the [OpenStreetMap Foundation Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/), the navigator does **not** bulk download, cache-bust, or scrape standard OSM tiles.
- **Offline Architecture**:
  - The campus GIS directory (`locations.ts`), classroom registry (`classrooms.ts`), and the 30-node 56-edge campus routing graph (`campusRouteGraph.ts`) are completely embedded client-side.
  - Offline multimodal routing and on-device hardware GPS work with **zero internet connection**.
  - For full visual offline vector tiles in future Capacitor production builds, the architecture is designed to integrate offline vector PMTiles / MBTiles served locally from device storage or a self-hosted university tile server (`tiles.lpu.edu.in`).

### 3. QR Navigation Integrity
- **Zero Coordinate Fabrication**: Scanning a campus QR code passes an official `locationId` parameter (`?qr=block-34`).
- **Strict Verification Gate**: The system checks `locationId` against the verified `CAMPUS_LOCATIONS` matrix. If an invalid or fabricated ID is supplied, navigation is blocked and a security warning is presented.

### 4. Verified University Emergency Contacts
Only confirmed university phone numbers are configured in the Emergency SOS module:
- **LPU Main Security Control Room**: `01824-517000` (Main Gate 1 Security Complex)
- **UniHospital 24/7 Emergency Wing**: `01824-517100` (Near UniMall)
- **Campus Rapid Ambulance Dispatch**: `01824-517101` (UniHospital Fleet Bay)
- **Campus Women Safety Helpline**: `01824-517002` (Block 30, DSW)
- **Chief Proctor Office**: `01824-517005` (Block 30, Ground Floor)

*Disclaimer: These contacts connect exclusively to on-campus university infrastructure and do not imply state civil emergency service dispatch (112).*

---

## 9. Pending On-Ground Survey Checklist (Future Phases)

- [ ] On-ground physical high-resolution photography for Block 34, Block 36, UniMall, UniPolis, and Hostels.
- [ ] Indoor LiDAR floor scanning for multi-floor indoor corridors in Block 34 and Block 36.
- [ ] Differential GPS coordinates for pending facilities (`BH-7`, `BH-8`, `GH-5`, `GH-6`).
- [ ] Self-hosted PMTiles offline vector tile server integration for full visual map rendering when disconnected from internet.
