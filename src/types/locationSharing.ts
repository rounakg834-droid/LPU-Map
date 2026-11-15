/**
 * Types for Live Location Sharing & "Meet My Friend" (Phase 5)
 */

export type ShareDurationMinutes = 15 | 60 | 480;

export interface LiveLocationCoords {
  lat: number;
  lng: number;
  accuracy: number;
  heading?: number | null;
  speed?: number | null;
  updatedAt: string; // ISO string
}

export interface LiveLocationShare {
  token: string; // Secure unguessable token, e.g. lpu_loc_...
  creatorId: string; // Student UID
  creatorDisplayName: string; // "Rahul"
  durationMinutes: ShareDurationMinutes;
  isLive: boolean; // true = moving live GPS, false = static one-time pin
  coords: LiveLocationCoords;
  createdAt: string; // ISO string
  expiresAt: string; // ISO string
  revoked: boolean;
  note?: string;
  passcode?: string; // Optional PIN for recipient verification
}

export interface CreateLocationShareInput {
  durationMinutes: ShareDurationMinutes;
  isLive: boolean;
  note?: string;
  passcode?: string;
}

export interface FriendLocationState {
  share: LiveLocationShare | null;
  isLoading: boolean;
  error: string | null;
  isExpired: boolean;
  isRevoked: boolean;
  lastUpdatedSecondsAgo: number;
}
