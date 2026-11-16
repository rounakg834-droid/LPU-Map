import { CAMPUS_LOCATIONS } from '../data/locations';
import { searchClassrooms, resolveClassroom } from '../data/classrooms';
import { CampusLocation, LocationCategory } from '../types/location';
import { ClassroomInfo } from '../types/classroom';
import { locationCorrectionService } from './locationCorrectionService';
import { GooglePlaceResult } from '../types/googleMaps';
import { GeoapifyPlaceResult } from '../types/geoapify';

export interface SearchFilters {
  category?: LocationCategory | 'all';
  verifiedOnly?: boolean;
}

export class SearchService {
  private locations: CampusLocation[];

  constructor(locations: CampusLocation[] = CAMPUS_LOCATIONS) {
    this.locations = locationCorrectionService.applyCorrectionsToLocations(locations);
  }

  public setLocations(locations: CampusLocation[]) {
    this.locations = locations;
  }

  /**
   * Converts a ClassroomInfo object into a CampusLocation wrapper
   * with coordinates pointing to the parent building entrance.
   */
  public classroomToCampusLocation(
    classroom: ClassroomInfo,
    parentLocation?: CampusLocation
  ): CampusLocation {
    const parent =
      parentLocation ||
      this.locations.find((l) => l.id === classroom.blockId || l.blockNumber === classroom.blockNumber) ||
      this.locations.find((l) => l.id === 'block-34')!;

    return {
      id: `room-${classroom.id}`,
      name: `Room ${classroom.id} (${classroom.roomTypeName})`,
      shortName: `Room ${classroom.id}`,
      category: 'academic',
      blockNumber: classroom.blockNumber,
      coordinates: classroom.entranceCoordinates || parent.coordinates,
      verificationStatus: parent.verificationStatus,
      isVerified: parent.isVerified,
      description: `${classroom.roomTypeName} located on ${classroom.floorName} of ${classroom.blockName}. ${classroom.indoorGuideNote}`,
      features: classroom.features || parent.features,
      source: `Classroom Directory & ${parent.source}`,
      imageUrl: parent.imageUrl,
      imageAttribution: parent.imageAttribution,
      imageMetadata: parent.imageMetadata,
      tags: [
        classroom.id.toLowerCase(),
        `room ${classroom.id.toLowerCase()}`,
        classroom.roomNumber.toLowerCase(),
        `floor ${classroom.floorLevel}`,
        classroom.department?.toLowerCase() || '',
        parent.name.toLowerCase(),
      ],
      gateAccess: parent.gateAccess,
      accessibilityNotes: parent.accessibilityNotes,
      totalFloors: parent.totalFloors,
      hasElevator: classroom.hasElevatorAccess ?? parent.hasElevator,
      hasRestrooms: parent.hasRestrooms,
      hasWaterDispenser: parent.hasWaterDispenser,
      departments: classroom.department ? [classroom.department] : parent.departments,
      selectedClassroom: classroom,
    };
  }

  /**
   * Search campus locations, buildings, classrooms, departments, and facilities.
   */
  public search(query: string, filters?: SearchFilters): CampusLocation[] {
    const trimmed = query.trim().toLowerCase();
    const category = filters?.category;
    const verifiedOnly = filters?.verifiedOnly ?? false;

    let filtered = this.locations;

    if (category && category !== 'all') {
      filtered = filtered.filter((loc) => loc.category === category);
    }

    if (verifiedOnly) {
      filtered = filtered.filter((loc) => loc.isVerified);
    }

    if (!trimmed) {
      return filtered;
    }

    // 1. Check for classroom searches (e.g. "34-405", "36-201", "34 405", "room 34-405")
    const classroomMatches = searchClassrooms(trimmed, this.locations);
    const classroomLocations = classroomMatches.map((c) => this.classroomToCampusLocation(c));

    // Tokenize search query for multi-keyword matching
    const tokens = trimmed.split(/[\s,/-]+/).filter(Boolean);

    // Common campus aliases dictionary
    const aliasMap: Record<string, string[]> = {
      cse: ['block 34', 'computer science', 'it'],
      it: ['block 34', 'information technology'],
      ece: ['block 38', 'electronics'],
      mechanical: ['block 38', 'workshop'],
      robotics: ['block 38'],
      mba: ['block 25-28', 'mittal school of business', 'management'],
      bba: ['block 25-28', 'business'],
      business: ['block 25-28'],
      exam: ['block 36', 'examination'],
      exams: ['block 36'],
      library: ['central library'],
      lib: ['central library'],
      books: ['central library'],
      food: ['unimall', 'food court', 'cafeteria'],
      eating: ['unimall', 'food court'],
      canteen: ['unimall', 'food court'],
      mall: ['unimall'],
      unimall: ['unimall', 'shopping'],
      unipolis: ['unipolis', 'auditorium'],
      sdm: ['shanti devi mittal auditorium'],
      shanti: ['shanti devi mittal auditorium'],
      'sh. baldevraj mittal auditorium': ['baldevraj-mittal-auditorium', 'sh. baldevraj mittal auditorium'],
      'baldevraj mittal auditorium': ['baldevraj-mittal-auditorium', 'baldevraj mittal auditorium'],
      'lpu auditorium': ['baldevraj-mittal-auditorium', 'sh. baldevraj mittal auditorium'],
      baldevraj: ['baldevraj-mittal-auditorium', 'sh. baldevraj mittal auditorium', 'unipolis'],
      auditorium: ['baldevraj-mittal-auditorium', 'sh. baldevraj mittal auditorium', 'shanti devi mittal auditorium', 'unipolis'],
      auditoriums: ['baldevraj-mittal-auditorium', 'sh. baldevraj mittal auditorium', 'shanti devi mittal auditorium', 'unipolis'],
      gym: ['sports complex'],
      sports: ['sports complex', 'cricket stadium'],
      pool: ['sports complex'],
      swimming: ['sports complex'],
      doctor: ['unihospital', 'uni-health-center'],
      hospital: ['unihospital'],
      clinic: ['uni-health-center', 'unihospital'],
      medicine: ['unihospital', 'pharmacy', 'uni-health-center'],
      'uni health center': ['uni-health-center', 'uni health center'],
      'lpu health center': ['uni-health-center', 'lpu health center'],
      'health center': ['uni-health-center', 'health center'],
      health: ['uni-health-center', 'uni health center', 'unihospital'],
      dispensary: ['uni-health-center'],
      'first aid': ['uni-health-center'],
      atm: ['unimall', 'gate 1'],
      bank: ['unimall'],
      gate: ['lpu main gate', 'main gate', 'gate 1', 'gate 2', 'gate 3'],
      'main gate': ['lpu-main-gate', 'lpu main gate', 'main gate'],
      'lpu main gate': ['lpu-main-gate', 'lpu main gate', 'main gate'],
      g1: ['gate 1', 'gate 1 (archived)'],
      main: ['lpu-main-gate', 'lpu main gate', 'main gate'],
      hostel: ['bh-1', 'bh-2', 'bh-3', 'bh-4', 'bh-5', 'bh-6', 'gh-1', 'gh-2', 'gh-3', 'gh-4', 'building-41'],
      bh: ['bh-1', 'bh-2', 'bh-3', 'bh-4', 'bh-5', 'bh-6'],
      gh: ['gh-1', 'gh-2', 'gh-3', 'gh-4'],
      apartment: ['building-41', 'boys apartment', '41'],
      apartments: ['building-41', 'boys apartment', '41'],
      b41: ['building-41', 'boys apartment', '41'],
      '41': ['building-41', 'boys apartment', 'block 41'],
    };

    // Expand search tokens with aliases
    const expandedTokens = [...tokens];
    for (const token of tokens) {
      if (aliasMap[token]) {
        for (const alias of aliasMap[token]) {
          expandedTokens.push(alias);
        }
      }
    }

    // Score and rank location matches
    const scored = filtered
      .map((loc) => {
        let score = 0;
        const nameLower = loc.name.toLowerCase();
        const shortNameLower = (loc.shortName || '').toLowerCase();
        const blockLower = (loc.blockNumber || '').toLowerCase();
        const descLower = loc.description.toLowerCase();
        const tagsLower = loc.tags.map((t) => t.toLowerCase());
        const deptsLower = (loc.departments || []).map((d) => d.toLowerCase());

        // Exact match bonuses
        if (nameLower === trimmed || shortNameLower === trimmed) {
          score += 120;
        } else if (nameLower.startsWith(trimmed) || shortNameLower.startsWith(trimmed)) {
          score += 80;
        }

        // Block number exact/prefix match (e.g. searching "34" or "b34" matches Block 34)
        if (blockLower) {
          if (blockLower === trimmed || trimmed === `block ${blockLower}` || trimmed === `b${blockLower}`) {
            score += 100;
          } else if (trimmed.includes(blockLower)) {
            score += 50;
          }
        }

        // Department matches
        for (const dept of deptsLower) {
          if (dept.includes(trimmed)) score += 40;
          for (const token of tokens) {
            if (dept.includes(token)) score += 20;
          }
        }

        // Token matches
        for (const token of expandedTokens) {
          if (nameLower.includes(token)) score += 25;
          if (shortNameLower.includes(token)) score += 30;
          if (tagsLower.some((tag) => tag.includes(token))) score += 20;
          if (descLower.includes(token)) score += 8;
        }

        // Verified coordinate bonus to prioritize directly navigable items
        if (loc.isVerified && loc.coordinates) {
          score += 5;
        }

        return { location: loc, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.location);

    // Combine results: If user typed an explicit classroom format, place classroom results first!
    const isExplicitClassroomQuery =
      /\d{1,2}[-\s/]\d{2,4}/.test(trimmed) ||
      trimmed.startsWith('room') ||
      trimmed.startsWith('lab') ||
      classroomMatches.length > 0;

    if (isExplicitClassroomQuery) {
      // Deduplicate by id
      const seen = new Set<string>();
      const combined: CampusLocation[] = [];

      for (const loc of classroomLocations) {
        if (!seen.has(loc.id)) {
          seen.add(loc.id);
          combined.push(loc);
        }
      }

      for (const loc of scored) {
        if (!seen.has(loc.id)) {
          seen.add(loc.id);
          combined.push(loc);
        }
      }

      return combined;
    }

    // Otherwise, append matching classrooms after high-scoring building matches
    const seen = new Set<string>();
    const combined: CampusLocation[] = [];

    for (const loc of scored) {
      if (!seen.has(loc.id)) {
        seen.add(loc.id);
        combined.push(loc);
      }
    }

    for (const loc of classroomLocations) {
      if (!seen.has(loc.id)) {
        seen.add(loc.id);
        combined.push(loc);
      }
    }

    // Check for explicit building/block number searches (e.g. "block 45", "building 1300", "b99", "45")
    // If no verified campus location matches this building number, display a structured "Location verification pending" result
    const buildingNumberMatch = trimmed.match(/^(?:block|building|b|bh|gh)?\s*(\d{1,4})$/i);
    if (buildingNumberMatch) {
      const qNum = buildingNumberMatch[1];
      const hasVerifiedMatch = combined.some((l) => {
        const blk = (l.blockNumber || '').replace(/[^0-9]/g, '');
        return blk === qNum && l.isVerified && l.coordinates !== undefined;
      });

      if (!hasVerifiedMatch) {
        const isBoysHostel = /^bh\s*\d+/i.test(trimmed);
        const isGirlsHostel = /^gh\s*\d+/i.test(trimmed);
        const prefix = isBoysHostel
          ? 'Boys Hostel'
          : isGirlsHostel
          ? 'Girls Hostel'
          : 'Building';
        const short = isBoysHostel
          ? `BH-${qNum}`
          : isGirlsHostel
          ? `GH-${qNum}`
          : `Block ${qNum}`;

        const unverifiedLocation: CampusLocation = {
          id: `unverified-building-${qNum}`,
          name: `${prefix} ${qNum} (Location verification pending)`,
          shortName: short,
          category: isBoysHostel ? 'hostel_boys' : isGirlsHostel ? 'hostel_girls' : 'academic',
          blockNumber: qNum,
          coordinates: undefined, // Explicitly no coordinates: prevents navigation to incorrect coordinates!
          verificationStatus: 'pending_survey',
          isVerified: false,
          description: `Physical campus survey is pending for ${short}. Navigation coordinates are withheld to prevent misdirection until on-ground verification is completed.`,
          features: ['Location Verification Pending', 'Field Survey Required'],
          source: 'LPU Campus Registry (Pending Survey)',
          tags: [trimmed, `block ${qNum}`, `building ${qNum}`],
        };

        combined.unshift(unverifiedLocation);
      }
    }

    return combined;
  }

  /**
   * Intelligently merges Google Places results with verified campus directory.
   * STRICT GUARANTEE: Preserves verified entrance coordinates (e.g. Building 41)
   * and prioritizes verified campus records over approximate centroids.
   */
  public mergeGooglePlaces(
    localMatches: CampusLocation[],
    googlePlaces: GooglePlaceResult[]
  ): CampusLocation[] {
    const results = [...localMatches];
    const seenIds = new Set<string>(localMatches.map((m) => m.id));
    const seenNames = new Set<string>(localMatches.map((m) => (m.shortName || m.name).toLowerCase()));

    for (const gPlace of googlePlaces) {
      const gNameLower = gPlace.name.toLowerCase();

      // Check if this Google Place matches an existing campus location
      // e.g. Building 41, Block 34, Central Library, UniMall, UniPolis, BH-1
      const matchedCampus = this.locations.find((loc) => {
        const locName = loc.name.toLowerCase();
        const shortName = (loc.shortName || '').toLowerCase();
        const block = (loc.blockNumber || '').toLowerCase();

        return (
          gNameLower.includes(locName) ||
          locName.includes(gNameLower) ||
          (block && (gNameLower.includes(`block ${block}`) || gNameLower.includes(`building ${block}`))) ||
          (shortName && gNameLower.includes(shortName))
        );
      });

      if (matchedCampus) {
        // If matchedCampus is already in results, enhance it with Google Place photo if available
        if (seenIds.has(matchedCampus.id)) {
          const existing = results.find((r) => r.id === matchedCampus.id);
          if (existing && !existing.imageUrl && gPlace.photoUrl) {
            existing.imageUrl = gPlace.photoUrl;
          }
        } else {
          // Add verified campus location to results, strictly preserving verified entrance coordinates!
          seenIds.add(matchedCampus.id);
          const enriched: CampusLocation = {
            ...matchedCampus,
            imageUrl: matchedCampus.imageUrl || gPlace.photoUrl,
            source: `${matchedCampus.source} (Verified with Google Places ID: ${gPlace.placeId})`,
          };
          results.unshift(enriched); // Prioritize exact campus match
        }
      } else {
        // New Google Place located on LPU campus grounds
        const gId = `gplace-${gPlace.placeId}`;
        if (!seenIds.has(gId) && !seenNames.has(gNameLower)) {
          seenIds.add(gId);
          seenNames.add(gNameLower);

          results.push({
            id: gId,
            name: gPlace.name,
            shortName: gPlace.name,
            category: this.inferCategoryFromGoogleTypes(gPlace.types),
            coordinates: gPlace.coordinates,
            entranceCoordinates: gPlace.coordinates,
            verificationStatus: 'approximate_osm',
            isVerified: false,
            description:
              gPlace.formattedAddress ||
              `Location verified via Google Places Platform (${gPlace.types?.join(', ') || 'Point of Interest'}).`,
            features: gPlace.types || ['Google Places Point of Interest'],
            source: 'Google Places Platform',
            imageUrl: gPlace.photoUrl,
            tags: [gNameLower, ...(gPlace.types || [])],
          });
        }
      }
    }

    return results;
  }

  private inferCategoryFromGoogleTypes(types?: string[]): LocationCategory {
    if (!types || types.length === 0) return 'commercial';
    if (types.some((t) => ['restaurant', 'cafe', 'food', 'bakery', 'meal_takeaway'].includes(t))) {
      return 'cafeteria';
    }
    if (types.some((t) => ['school', 'university', 'secondary_school'].includes(t))) {
      return 'academic';
    }
    if (types.some((t) => ['hospital', 'doctor', 'pharmacy', 'health'].includes(t))) {
      return 'medical';
    }
    if (types.some((t) => ['library', 'book_store'].includes(t))) {
      return 'library';
    }
    if (types.some((t) => ['gym', 'stadium'].includes(t))) {
      return 'sports';
    }
    if (types.some((t) => ['parking'].includes(t))) {
      return 'parking';
    }
    return 'commercial';
  }

  /**
   * Merges secondary external Geoapify place results into local campus results.
   * STRICT INTEGRITY RULES:
   * 1. Never overwrite user-confirmed or campus-verified coordinates.
   * 2. Deduplicate against existing campus locations by matching ID, name, or proximity (< 35m).
   * 3. Flag external results clearly as 'approximate_osm' / external search result awaiting campus verification.
   */
  public mergeGeoapifyPlaces(
    campusResults: CampusLocation[],
    geoapifyPlaces: GeoapifyPlaceResult[]
  ): CampusLocation[] {
    const results = [...campusResults];
    const seenIds = new Set<string>(results.map((r) => r.id));
    const seenNames = new Set<string>(results.map((r) => r.name.toLowerCase()));

    for (const gPlace of geoapifyPlaces) {
      const gNameLower = gPlace.name.toLowerCase().trim();

      // Check if this matches any existing campus location
      const matchedCampus = this.locations.find((loc) => {
        const locName = loc.name.toLowerCase();
        const shortName = (loc.shortName || '').toLowerCase();
        const block = loc.blockNumber?.toLowerCase();

        // Proximity match: within 35 meters
        if (loc.coordinates) {
          const dist = Math.hypot(
            (loc.coordinates.lat - gPlace.coordinates.lat) * 111320,
            (loc.coordinates.lng - gPlace.coordinates.lng) * 111320 * Math.cos(loc.coordinates.lat * (Math.PI / 180))
          );
          if (dist < 35) return true;
        }

        return (
          locName === gNameLower ||
          shortName === gNameLower ||
          gNameLower.includes(locName) ||
          locName.includes(gNameLower) ||
          (block && (gNameLower.includes(`block ${block}`) || gNameLower.includes(`building ${block}`)))
        );
      });

      if (matchedCampus) {
        // If matchedCampus is already in results, we keep the verified coordinates untouched!
        if (!seenIds.has(matchedCampus.id)) {
          seenIds.add(matchedCampus.id);
          results.unshift(matchedCampus); // Prioritize verified campus match!
        }
      } else {
        // New external Geoapify Place located within campus grounds
        const gId = `geoapify-${gPlace.placeId}`;
        if (!seenIds.has(gId) && !seenNames.has(gNameLower)) {
          seenIds.add(gId);
          seenNames.add(gNameLower);

          results.push({
            id: gId,
            name: gPlace.name,
            shortName: gPlace.name,
            category: this.inferCategoryFromGeoapifyCategories(gPlace.categories),
            coordinates: gPlace.coordinates,
            verificationStatus: 'approximate_osm',
            isVerified: false,
            description:
              gPlace.formattedAddress ||
              `External point of interest discovered via Geoapify Places API (${gPlace.categories.join(', ') || 'Facility'}).`,
            features: [
              'Geoapify Places Directory',
              'External Search Result',
              ...(gPlace.categories.slice(0, 3) || []),
            ],
            source: 'Geoapify Places API (External Directory - Awaiting Campus Verification)',
            tags: [gNameLower, ...gPlace.categories],
            roadConnectivityStatus: 'pending_verification',
          });
        }
      }
    }

    return results;
  }

  private inferCategoryFromGeoapifyCategories(categories: string[]): LocationCategory {
    if (!categories || categories.length === 0) return 'commercial';
    const lower = categories.map((c) => c.toLowerCase());
    if (lower.some((c) => c.includes('catering') || c.includes('restaurant') || c.includes('cafe') || c.includes('food'))) {
      return 'cafeteria';
    }
    if (lower.some((c) => c.includes('education') || c.includes('university') || c.includes('school'))) {
      return 'academic';
    }
    if (lower.some((c) => c.includes('healthcare') || c.includes('hospital') || c.includes('pharmacy') || c.includes('medical'))) {
      return 'medical';
    }
    if (lower.some((c) => c.includes('entertainment') || c.includes('auditorium') || c.includes('theatre'))) {
      return 'auditorium_events';
    }
    if (lower.some((c) => c.includes('sport') || c.includes('gym') || c.includes('stadium'))) {
      return 'sports';
    }
    if (lower.some((c) => c.includes('parking'))) {
      return 'parking';
    }
    if (lower.some((c) => c.includes('accommodation') || c.includes('hostel'))) {
      return 'hostel_boys';
    }
    return 'commercial';
  }

  /**
   * Quick filter by category
   */
  public getByCategory(category: LocationCategory): CampusLocation[] {
    return this.locations.filter((loc) => loc.category === category);
  }

  /**
   * Find location by id (supports room IDs as well)
   */
  public getById(id: string): CampusLocation | undefined {
    if (id.startsWith('room-')) {
      const roomId = id.replace('room-', '');
      const classroom = resolveClassroom(roomId, this.locations);
      if (classroom) {
        return this.classroomToCampusLocation(classroom);
      }
    }
    return this.locations.find((loc) => loc.id === id);
  }

  /**
   * Get all verified locations with coordinates (for map markers)
   */
  public getVerifiedNavigable(): CampusLocation[] {
    return this.locations.filter((loc) => loc.isVerified && loc.coordinates !== undefined);
  }
}

export const searchService = new SearchService();

locationCorrectionService.subscribe(() => {
  searchService.setLocations(locationCorrectionService.applyCorrectionsToLocations(CAMPUS_LOCATIONS));
});
