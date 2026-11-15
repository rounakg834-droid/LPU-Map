import { Coordinates } from './location';

/**
 * Event categories specified in Phase 4 requirements
 */
export type EventCategory =
  | 'concert'
  | 'party'
  | 'cultural'
  | 'workshop'
  | 'sports'
  | 'activity'
  | 'other';

export interface EventCategoryMetadata {
  id: EventCategory;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
  badgeBg: string;
  borderColor: string;
}

export const EVENT_CATEGORIES: EventCategoryMetadata[] = [
  {
    id: 'concert',
    label: 'Concert & Music',
    iconName: 'Music',
    color: '#9333ea',
    bgColor: '#faf5ff',
    badgeBg: '#f3e8ff',
    borderColor: '#d8b4fe',
  },
  {
    id: 'party',
    label: 'Party & Social',
    iconName: 'Sparkles',
    color: '#db2777',
    bgColor: '#fdf2f8',
    badgeBg: '#fce7f3',
    borderColor: '#f472b6',
  },
  {
    id: 'cultural',
    label: 'Cultural Festival',
    iconName: 'Theater',
    color: '#ea580c',
    bgColor: '#fff7ed',
    badgeBg: '#ffedd5',
    borderColor: '#fdba74',
  },
  {
    id: 'workshop',
    label: 'Workshop & Tech',
    iconName: 'Laptop',
    color: '#2563eb',
    bgColor: '#eff6ff',
    badgeBg: '#dbeafe',
    borderColor: '#93c5fd',
  },
  {
    id: 'sports',
    label: 'Sports Tournament',
    iconName: 'Trophy',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    badgeBg: '#dcfce7',
    borderColor: '#86efac',
  },
  {
    id: 'activity',
    label: 'Student Activity',
    iconName: 'Users',
    color: '#0891b2',
    bgColor: '#ecfeff',
    badgeBg: '#cffafe',
    borderColor: '#67e8f9',
  },
  {
    id: 'other',
    label: 'Campus Event',
    iconName: 'Calendar',
    color: '#4f46e5',
    bgColor: '#eef2ff',
    badgeBg: '#e0e7ff',
    borderColor: '#a5b4fc',
  },
];

/**
 * Event lifecycle status
 */
export type EventStatus =
  | 'upcoming' // Scheduled for future
  | 'live'     // Currently active (startTime <= now <= endTime)
  | 'ended'    // Reached endTime
  | 'cancelled'// Cancelled by creator
  | 'removed'  // Deprecated removed
  | 'removed_by_admin'; // Authoritative soft-deleted by university administrator

/**
 * Public Campus Event - EXPOSED to all students.
 * Privacy Rule: Contains ONLY creator's display name.
 * Course, Year of Study, and Account IDs are strictly excluded.
 */
export interface PublicCampusEvent {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  locationId: string;
  locationName: string;
  coordinates: Coordinates;
  startTime: string; // ISO 8601 string (IST / Asia/Kolkata)
  endTime: string;   // ISO 8601 string (must be <= startTime + 6 hours)
  creatorName: string; // Public display name ONLY (e.g. "Rahul")
  creatorUid: string;  // Internal ID for author permission verification
  imageUrl?: string;
  status: EventStatus;
  reportCount: number;
  moderationReason?: string;
  removedAt?: string;
  removedBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Protected Student Metadata - ADMIN & CREATOR ONLY.
 * Stored in secure Firestore collection `/event_private_metadata/{eventId}`.
 * NEVER exposed in public client event feeds or map overlays.
 */
export interface ProtectedStudentMetadata {
  eventId: string;
  creatorUid: string;
  fullName: string;      // Required student legal name
  course: string;        // Required: e.g. "B.Tech CSE", "MBA", "B.Pharm"
  yearOfStudy: string;   // Required: e.g. "1st Year", "2nd Year", "3rd Year", "4th Year"
  accountIdentifier: string; // Authenticated account email or UID
  submittedAt: string;
}

/**
 * Student authenticated profile in local state / Firebase Auth
 */
export interface StudentAuthProfile {
  uid: string;
  email?: string;
  displayName: string;
  fullName: string;
  course: string;
  yearOfStudy: string;
  isAdmin: boolean;
  isBlocked?: boolean;
}

/**
 * Event report submitted by students
 */
export interface EventReport {
  id: string;
  eventId: string;
  eventTitle: string;
  reporterUid?: string;
  reason: 'fake_event' | 'inappropriate' | 'wrong_location' | 'expired' | 'spam';
  details?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

/**
 * Event creation submission payload
 */
export interface CreateEventInput {
  title: string;
  category: EventCategory;
  description: string;
  locationId: string;
  locationName: string;
  coordinates: Coordinates;
  startTime: string; // ISO string
  endTime: string;   // ISO string (max 6h from start)
  imageUrl?: string;
  // Student Private Identity
  studentFullName: string;
  studentCourse: string;
  studentYear: string;
}
