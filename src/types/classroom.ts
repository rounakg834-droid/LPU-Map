import { Coordinates } from './location';

export type RoomType =
  | 'lecture_hall'
  | 'computer_lab'
  | 'engineering_lab'
  | 'workshop'
  | 'seminar_hall'
  | 'faculty_office'
  | 'examination_hall'
  | 'library_section'
  | 'utility';

export interface ClassroomInfo {
  id: string; // e.g. "34-405"
  roomNumber: string; // e.g. "405" or "G05"
  blockId: string; // e.g. "block-34"
  blockNumber: string; // e.g. "34"
  blockName: string; // "Block 34 (School of Computer Science & Engineering)"
  floorLevel: number; // 4 (0 = Ground Floor)
  floorName: string; // "4th Floor" or "Ground Floor"
  department?: string; // "School of Computer Science & Engineering"
  roomType: RoomType;
  roomTypeName: string; // "Smart Classroom / Lecture Hall"
  entranceCoordinates?: Coordinates; // Building entrance coordinates
  entranceNodeId?: string; // e.g. "n_block34_entry"
  indoorDirectionsAvailable: boolean; // false until Phase 4 indoor LiDAR survey
  indoorGuideNote: string; // Factual guidance: e.g. "Take central elevator or staircase from Ground Floor to Level 4. Classroom is along the north wing."
  hasElevatorAccess?: boolean;
  hasWheelchairRampToBuilding?: boolean;
  isVerified: boolean;
  features?: string[];
}

export interface ParsedClassroomQuery {
  rawQuery: string;
  blockNumber: string;
  roomNumber: string;
  floorLevel: number;
  floorName: string;
  isValidSyntax: boolean;
}
