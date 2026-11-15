import { ClassroomInfo, ParsedClassroomQuery } from '../types/classroom';
import { CampusLocation } from '../types/location';

/**
 * Verified registry of key laboratories, lecture halls, examination centers,
 * and academic facilities across LPU campus blocks.
 */
export const VERIFIED_CLASSROOMS: ClassroomInfo[] = [
  // --- BLOCK 34 (School of Computer Science & Engineering) ---
  {
    id: '34-101',
    roomNumber: '101',
    blockId: 'block-34',
    blockNumber: '34',
    blockName: 'Block 34 (School of Computer Science & Engineering)',
    floorLevel: 1,
    floorName: '1st Floor',
    department: 'School of Computer Science & Engineering',
    roomType: 'computer_lab',
    roomTypeName: 'Computing Fundamentals & Programming Lab',
    entranceCoordinates: { lat: 31.25475, lng: 75.70375 },
    entranceNodeId: 'n_block34_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Enter through Block 34 Ground Main Entrance. Proceed up central stairs or elevator to 1st Floor; Lab 101 is situated in the south corridor.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Linux Workstations', 'Dual Projectors', 'Gigabit Ethernet', 'Air Conditioned'],
  },
  {
    id: '34-106',
    roomNumber: '106',
    blockId: 'block-34',
    blockNumber: '34',
    blockName: 'Block 34 (School of Computer Science & Engineering)',
    floorLevel: 1,
    floorName: '1st Floor',
    department: 'School of Computer Science & Engineering',
    roomType: 'computer_lab',
    roomTypeName: 'Software Engineering & Database Systems Lab',
    entranceCoordinates: { lat: 31.25475, lng: 75.70375 },
    entranceNodeId: 'n_block34_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'From 1st Floor central landing, turn right down the east wing to Room 106.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Oracle & PostgreSQL Workstations', 'Smart Board', 'Air Conditioned'],
  },
  {
    id: '34-201',
    roomNumber: '201',
    blockId: 'block-34',
    blockNumber: '34',
    blockName: 'Block 34 (School of Computer Science & Engineering)',
    floorLevel: 2,
    floorName: '2nd Floor',
    department: 'School of Computer Science & Engineering',
    roomType: 'computer_lab',
    roomTypeName: 'High Performance Computing (HPC) & AI Lab',
    entranceCoordinates: { lat: 31.25475, lng: 75.70375 },
    entranceNodeId: 'n_block34_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Take central elevator to 2nd Floor. HPC Research Lab 201 is immediately opposite the elevator vestibule.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['NVIDIA GPU Clusters', 'TensorFlow/PyTorch Server Access', 'Fiber Uplink'],
  },
  {
    id: '34-205',
    roomNumber: '205',
    blockId: 'block-34',
    blockNumber: '34',
    blockName: 'Block 34 (School of Computer Science & Engineering)',
    floorLevel: 2,
    floorName: '2nd Floor',
    department: 'School of Computer Science & Engineering',
    roomType: 'lecture_hall',
    roomTypeName: 'Cloud Computing & Cyber Security Lecture Hall',
    entranceCoordinates: { lat: 31.25475, lng: 75.70375 },
    entranceNodeId: 'n_block34_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'From 2nd floor elevator lobby, proceed along northern gallery towards Hall 205.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Tiered Seating (120 Seats)', 'Acoustic Sound System', 'Digital Podium'],
  },
  {
    id: '34-301',
    roomNumber: '301',
    blockId: 'block-34',
    blockNumber: '34',
    blockName: 'Block 34 (School of Computer Science & Engineering)',
    floorLevel: 3,
    floorName: '3rd Floor',
    department: 'School of Computer Science & Engineering',
    roomType: 'computer_lab',
    roomTypeName: 'Big Data & Data Science Lab',
    entranceCoordinates: { lat: 31.25475, lng: 75.70375 },
    entranceNodeId: 'n_block34_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Take elevator to Level 3. Lab 301 is located directly along the main corridor.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Hadoop & Spark Clusters', 'Dual Display Systems', 'High-Speed Wi-Fi'],
  },
  {
    id: '34-308',
    roomNumber: '308',
    blockId: 'block-34',
    blockNumber: '34',
    blockName: 'Block 34 (School of Computer Science & Engineering)',
    floorLevel: 3,
    floorName: '3rd Floor',
    department: 'School of Computer Science & Engineering',
    roomType: 'computer_lab',
    roomTypeName: 'Computer Networks & IoT Lab',
    entranceCoordinates: { lat: 31.25475, lng: 75.70375 },
    entranceNodeId: 'n_block34_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      '3rd Floor eastern corridor, third door on the right.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Cisco Networking Racks', 'IoT Sensor Kits', 'Spectrum Analyzers'],
  },
  {
    id: '34-401',
    roomNumber: '401',
    blockId: 'block-34',
    blockNumber: '34',
    blockName: 'Block 34 (School of Computer Science & Engineering)',
    floorLevel: 4,
    floorName: '4th Floor',
    department: 'School of Computer Science & Engineering',
    roomType: 'lecture_hall',
    roomTypeName: 'Advanced Algorithms Lecture Theatre',
    entranceCoordinates: { lat: 31.25475, lng: 75.70375 },
    entranceNodeId: 'n_block34_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Take elevator to 4th Floor. Lecture Theatre 401 is facing the central stairwell.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Tiered Seating (150 Capacity)', 'Smart Projector', 'Mic Audio System'],
  },
  {
    id: '34-405',
    roomNumber: '405',
    blockId: 'block-34',
    blockNumber: '34',
    blockName: 'Block 34 (School of Computer Science & Engineering)',
    floorLevel: 4,
    floorName: '4th Floor',
    department: 'School of Computer Science & Engineering',
    roomType: 'lecture_hall',
    roomTypeName: 'CSE Smart Interactive Classroom',
    entranceCoordinates: { lat: 31.25475, lng: 75.70375 },
    entranceNodeId: 'n_block34_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Enter Block 34 main ground entrance. Take the central elevator to the 4th Floor. Exit elevator, turn right down the academic corridor; Room 405 is on the left-hand side.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Interactive Touch Panel', 'Smart Classroom Setup', 'Air Conditioned', 'Power Sockets at Desks'],
  },
  {
    id: '34-412',
    roomNumber: '412',
    blockId: 'block-34',
    blockNumber: '34',
    blockName: 'Block 34 (School of Computer Science & Engineering)',
    floorLevel: 4,
    floorName: '4th Floor',
    department: 'School of Computer Science & Engineering',
    roomType: 'faculty_office',
    roomTypeName: 'CSE Department HOD & Senior Faculty Cabins',
    entranceCoordinates: { lat: 31.25475, lng: 75.70375 },
    entranceNodeId: 'n_block34_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Level 4 north executive suite. Visitor reception is at Room 412 entry desk.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['HOD Office', 'Faculty Meeting Suite', 'Visitor Consultation'],
  },

  // --- BLOCK 36 (Academic & Examination Complex) ---
  {
    id: '36-101',
    roomNumber: '101',
    blockId: 'block-36',
    blockNumber: '36',
    blockName: 'Block 36 (Academic & Examination Complex)',
    floorLevel: 1,
    floorName: '1st Floor',
    department: 'Division of Examination',
    roomType: 'examination_hall',
    roomTypeName: 'Central Examination Control Room & Helpdesk',
    entranceCoordinates: { lat: 31.25565, lng: 75.70415 },
    entranceNodeId: 'n_block36_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Ground entrance of Block 36, immediate left foyer near student inquiry counter.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Admit Card Helpdesk', 'Grievance Counter', 'CCTV Monitoring Room'],
  },
  {
    id: '36-201',
    roomNumber: '201',
    blockId: 'block-36',
    blockNumber: '36',
    blockName: 'Block 36 (Academic & Examination Complex)',
    floorLevel: 2,
    floorName: '2nd Floor',
    department: 'Division of Examination',
    roomType: 'examination_hall',
    roomTypeName: 'Major Examination Hall A',
    entranceCoordinates: { lat: 31.25565, lng: 75.70415 },
    entranceNodeId: 'n_block36_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Take elevator or wide staircase to Level 2. Examination Hall 201 occupies the central hall.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['250+ Exam Seating Capacity', 'Biometric Verification Gates', 'CCTV Proctored'],
  },
  {
    id: '36-205',
    roomNumber: '205',
    blockId: 'block-36',
    blockNumber: '36',
    blockName: 'Block 36 (Academic & Examination Complex)',
    floorLevel: 2,
    floorName: '2nd Floor',
    department: 'School of Humanities & Social Sciences',
    roomType: 'lecture_hall',
    roomTypeName: 'Lecture Theatre Complex 205',
    entranceCoordinates: { lat: 31.25565, lng: 75.70415 },
    entranceNodeId: 'n_block36_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Proceed to 2nd Floor west corridor. Lecture Theatre 205 is the second amphitheatre on the left.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Step Tiered Seating', 'Dual Projectors', 'Wireless Lapel Microphones'],
  },
  {
    id: '36-301',
    roomNumber: '301',
    blockId: 'block-36',
    blockNumber: '36',
    blockName: 'Block 36 (Academic & Examination Complex)',
    floorLevel: 3,
    floorName: '3rd Floor',
    department: 'Division of Examination',
    roomType: 'examination_hall',
    roomTypeName: 'Major Examination Hall B',
    entranceCoordinates: { lat: 31.25565, lng: 75.70415 },
    entranceNodeId: 'n_block36_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Level 3 central concourse. Examination Hall 301 is entered from the center doors.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['300 Capacity Hall', 'Acoustic Ceiling', 'High-Speed Wi-Fi Jamming Zone'],
  },

  // --- BLOCK 38 (Electronics & Mechanical Engineering) ---
  {
    id: '38-101',
    roomNumber: '101',
    blockId: 'block-38',
    blockNumber: '38',
    blockName: 'Block 38 (School of Electronics & Mechanical Engineering)',
    floorLevel: 1,
    floorName: '1st Floor / Ground',
    department: 'School of Mechanical Engineering',
    roomType: 'workshop',
    roomTypeName: 'Advanced Mechatronics & CNC Machine Workshop',
    entranceCoordinates: { lat: 31.25655, lng: 75.70455 },
    entranceNodeId: 'n_block38_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Enter Block 38 ground level heavy engineering bay; follow safety walkway straight to Workshop 101.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['5-Axis CNC Mills', 'Hydraulic Presses', 'Industrial Safety Gear'],
  },
  {
    id: '38-201',
    roomNumber: '201',
    blockId: 'block-38',
    blockNumber: '38',
    blockName: 'Block 38 (School of Electronics & Mechanical Engineering)',
    floorLevel: 2,
    floorName: '2nd Floor',
    department: 'School of Electronics & Electrical Engineering',
    roomType: 'engineering_lab',
    roomTypeName: 'VLSI Design & Embedded Systems Laboratory',
    entranceCoordinates: { lat: 31.25655, lng: 75.70455 },
    entranceNodeId: 'n_block38_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Take stairs or lift to 2nd Floor, Room 201 is located on the south corridor.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['FPGA Development Boards', 'Oscilloscopes', 'Cadence EDA Tools'],
  },
  {
    id: '38-301',
    roomNumber: '301',
    blockId: 'block-38',
    blockNumber: '38',
    blockName: 'Block 38 (School of Electronics & Mechanical Engineering)',
    floorLevel: 3,
    floorName: '3rd Floor',
    department: 'School of Electronics & Electrical Engineering',
    roomType: 'engineering_lab',
    roomTypeName: 'Robotics, Drones & Autonomous Systems Lab',
    entranceCoordinates: { lat: 31.25655, lng: 75.70455 },
    entranceNodeId: 'n_block38_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Level 3 central wing, Room 301 features an indoor netted flight testing cage.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['ROS2 Robot Workstations', 'Netted Drone Cage', 'Lidar Sensors'],
  },

  // --- MITTAL SCHOOL OF BUSINESS (Block 25-28) ---
  {
    id: '25-101',
    roomNumber: '101',
    blockId: 'block-25-28',
    blockNumber: '25',
    blockName: 'Block 25-28 (Mittal School of Business)',
    floorLevel: 1,
    floorName: '1st Floor',
    department: 'Mittal School of Business',
    roomType: 'seminar_hall',
    roomTypeName: 'NSE Financial Trading & Stock Simulation Lab',
    entranceCoordinates: { lat: 31.25350, lng: 75.70250 },
    entranceNodeId: 'n_sdm_hall',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Enter Block 25 main glass portal. Trading Lab 101 is located directly past the central atrium.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Live Bloomberg & NSE Ticker', '32 Dual-Monitor Terminals', 'Air Conditioned'],
  },
  {
    id: '25-201',
    roomNumber: '201',
    blockId: 'block-25-28',
    blockNumber: '25',
    blockName: 'Block 25-28 (Mittal School of Business)',
    floorLevel: 2,
    floorName: '2nd Floor',
    department: 'Mittal School of Business',
    roomType: 'lecture_hall',
    roomTypeName: 'Executive MBA Case Study Seminar Hall',
    entranceCoordinates: { lat: 31.25350, lng: 75.70250 },
    entranceNodeId: 'n_sdm_hall',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Take central atrium stairs to Level 2. Seminar Hall 201 is on the left.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Horseshoe Executive Layout', 'Individual Microphone Consoles', 'Dual Displays'],
  },

  // --- CENTRAL LIBRARY ---
  {
    id: 'LIB-G01',
    roomNumber: 'G01',
    blockId: 'central-library',
    blockNumber: 'LIB',
    blockName: 'Central Library (LPU Central Reference & Digital Library)',
    floorLevel: 0,
    floorName: 'Ground Floor',
    department: 'University Library Division',
    roomType: 'library_section',
    roomTypeName: 'Circulation Desk, Helpdesk & OPAC Terminal Hub',
    entranceCoordinates: { lat: 31.25410, lng: 75.70360 },
    entranceNodeId: 'n_library_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Enter Central Library through security turnstiles; main circulation desk is straight ahead.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Book Issue/Return RFID Kiosks', 'Reference Desk', 'Locker Bay'],
  },
  {
    id: 'LIB-101',
    roomNumber: '101',
    blockId: 'central-library',
    blockNumber: 'LIB',
    blockName: 'Central Library (LPU Central Reference & Digital Library)',
    floorLevel: 1,
    floorName: '1st Floor',
    department: 'University Library Division',
    roomType: 'library_section',
    roomTypeName: 'Engineering, Science & Technology Book Stacks',
    entranceCoordinates: { lat: 31.25410, lng: 75.70360 },
    entranceNodeId: 'n_library_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Take spiral staircase or library lift to 1st Floor. Stacks 101 hold Computer Science & Engineering references.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['Open Book Stacks', 'Individual Study Carrels', 'Silent Study Policy'],
  },
  {
    id: 'LIB-201',
    roomNumber: '201',
    blockId: 'central-library',
    blockNumber: 'LIB',
    blockName: 'Central Library (LPU Central Reference & Digital Library)',
    floorLevel: 2,
    floorName: '2nd Floor',
    department: 'University Library Division',
    roomType: 'library_section',
    roomTypeName: 'Digital Resource Centre & E-Journal Database Lounge',
    entranceCoordinates: { lat: 31.25410, lng: 75.70360 },
    entranceNodeId: 'n_library_entry',
    indoorDirectionsAvailable: false,
    indoorGuideNote:
      'Take library lift to 2nd Floor. Digital Resource Centre is through the glass double doors.',
    hasElevatorAccess: true,
    hasWheelchairRampToBuilding: true,
    isVerified: true,
    features: ['120 Desktop Terminals', 'IEEE/Springer/ScienceDirect Access', 'Air Conditioned'],
  },
];

/**
 * Helper to compute ordinal text (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Intelligent parser for classroom search queries.
 * Handles patterns such as:
 * - "34-405", "34 405", "34_405", "34/405"
 * - "block 34 room 405", "b34-405"
 * - "36-201", "38-101", "25-101", "34-G02"
 */
export function parseClassroomQuery(raw: string): ParsedClassroomQuery | null {
  const cleaned = raw.trim().toLowerCase();
  if (!cleaned) return null;

  // Pattern 1: Hyphenated / separated notation: e.g. "34-405", "b34-405", "34 405", "block 34 room 405"
  const match = cleaned.match(/(?:(?:block|b)\s*)?([0-9]{1,2}(?:-[0-9]{1,2})?)\s*[-/_\s]+\s*(?:room\s*)?([a-z]?[0-9]{2,4})/i);

  if (match) {
    const blockNumber = match[1].toUpperCase();
    const roomNumber = match[2].toUpperCase();

    // Floor calculation
    let floorLevel = 0;
    let floorName = 'Ground Floor';

    if (roomNumber.startsWith('G') || roomNumber.startsWith('0')) {
      floorLevel = 0;
      floorName = 'Ground Floor';
    } else if (roomNumber.startsWith('B') || roomNumber.startsWith('LG')) {
      floorLevel = -1;
      floorName = 'Basement / Lower Ground';
    } else {
      const firstDigit = parseInt(roomNumber.charAt(0), 10);
      if (!isNaN(firstDigit) && firstDigit > 0) {
        floorLevel = firstDigit;
        floorName = `${firstDigit}${getOrdinal(firstDigit)} Floor`;
      }
    }

    return {
      rawQuery: raw,
      blockNumber,
      roomNumber,
      floorLevel,
      floorName,
      isValidSyntax: true,
    };
  }

  // Pattern 2: Direct query like "34-405" without prefix
  const directMatch = cleaned.match(/^([0-9]{2})-([a-z]?[0-9]{2,4})$/i);
  if (directMatch) {
    const blockNumber = directMatch[1];
    const roomNumber = directMatch[2].toUpperCase();

    let floorLevel = 0;
    let floorName = 'Ground Floor';
    const firstDigit = parseInt(roomNumber.replace(/^[A-Z]/, '').charAt(0), 10);
    if (!isNaN(firstDigit) && firstDigit > 0) {
      floorLevel = firstDigit;
      floorName = `${firstDigit}${getOrdinal(firstDigit)} Floor`;
    }

    return {
      rawQuery: raw,
      blockNumber,
      roomNumber,
      floorLevel,
      floorName,
      isValidSyntax: true,
    };
  }

  return null;
}

/**
 * Resolves a classroom search query:
 * 1. Checks exact match against verified classroom database.
 * 2. If valid syntax matches a recognized campus building, constructs a structured
 *    ClassroomInfo with verified building entrance coordinates and an explicit
 *    notice that indoor corridor navigation is pending an on-ground LiDAR survey.
 */
export function resolveClassroom(
  query: string,
  locations: CampusLocation[]
): ClassroomInfo | null {
  const cleaned = query.trim().toUpperCase();

  // 1. Direct exact ID match
  const exact = VERIFIED_CLASSROOMS.find(
    (c) => c.id.toUpperCase() === cleaned || `${c.blockNumber}-${c.roomNumber}`.toUpperCase() === cleaned
  );
  if (exact) {
    return exact;
  }

  // 2. Syntax parse
  const parsed = parseClassroomQuery(query);
  if (!parsed) return null;

  // Check verified rooms with parsed components
  const matchedVerified = VERIFIED_CLASSROOMS.find(
    (c) =>
      c.blockNumber.toUpperCase() === parsed.blockNumber.toUpperCase() &&
      c.roomNumber.toUpperCase() === parsed.roomNumber.toUpperCase()
  );
  if (matchedVerified) {
    return matchedVerified;
  }

  // 3. Match against campus building dataset
  const targetLocation = locations.find((loc) => {
    if (!loc.blockNumber) return false;
    const bNum = loc.blockNumber.toUpperCase();
    return bNum === parsed.blockNumber || bNum.includes(parsed.blockNumber);
  });

  if (!targetLocation) {
    return null; // Unknown block number
  }

  // Synthesize room representation attached to verified building entrance
  return {
    id: `${parsed.blockNumber}-${parsed.roomNumber}`,
    roomNumber: parsed.roomNumber,
    blockId: targetLocation.id,
    blockNumber: parsed.blockNumber,
    blockName: targetLocation.name,
    floorLevel: parsed.floorLevel,
    floorName: parsed.floorName,
    department: targetLocation.name,
    roomType: 'lecture_hall',
    roomTypeName: `Classroom / Lecture Hall ${parsed.roomNumber}`,
    entranceCoordinates: targetLocation.coordinates,
    indoorDirectionsAvailable: false,
    indoorGuideNote: `Take stairs or elevator from ${targetLocation.shortName || targetLocation.name} ground lobby to ${parsed.floorName}. Corridor path to Room ${parsed.roomNumber} is pending on-ground indoor survey.`,
    hasElevatorAccess: targetLocation.hasElevator ?? true,
    hasWheelchairRampToBuilding: true,
    isVerified: false, // Classroom is parsed from standard LPU syntax, not individually surveyed
    features: ['Verified Building Entrance', 'Ground Access Verified', 'Indoor Survey Pending'],
  };
}

/**
 * Search all classrooms matching a query token
 */
export function searchClassrooms(
  query: string,
  locations: CampusLocation[]
): ClassroomInfo[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // Check direct parse
  const parsed = resolveClassroom(query, locations);
  const results: ClassroomInfo[] = [];

  if (parsed) {
    results.push(parsed);
  }

  // Also search verified classroom list for substring matches
  for (const c of VERIFIED_CLASSROOMS) {
    if (parsed && c.id === parsed.id) continue;

    const queryLower = trimmed.replace(/[-_\s]/g, '');
    const idLower = c.id.toLowerCase().replace(/[-_\s]/g, '');
    const nameLower = c.roomTypeName.toLowerCase();
    const deptLower = (c.department || '').toLowerCase();

    if (
      idLower.includes(queryLower) ||
      nameLower.includes(trimmed) ||
      deptLower.includes(trimmed)
    ) {
      results.push(c);
    }
  }

  return results.slice(0, 6);
}
