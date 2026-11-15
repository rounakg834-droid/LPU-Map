import { CAMPUS_LOCATIONS } from '../data/locations';
import { searchClassrooms, resolveClassroom } from '../data/classrooms';
import { CampusLocation, LocationCategory } from '../types/location';
import { ClassroomInfo } from '../types/classroom';
import { locationCorrectionService } from './locationCorrectionService';

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
      gym: ['sports complex'],
      sports: ['sports complex', 'cricket stadium'],
      pool: ['sports complex'],
      swimming: ['sports complex'],
      doctor: ['unihospital'],
      hospital: ['unihospital'],
      clinic: ['unihospital'],
      medicine: ['unihospital', 'pharmacy'],
      atm: ['unimall', 'gate 1'],
      bank: ['unimall'],
      gate: ['gate 1', 'gate 2', 'gate 3'],
      g1: ['gate 1', 'main gate 1'],
      main: ['gate 1'],
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

    return combined;
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
