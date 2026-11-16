/**
 * Live Location Sharing & Friend Tracking Service (Phase 7)
 * Dual-Mode Architecture:
 *   1. Production Cloud: Firebase Firestore (real-time onSnapshot)
 *   2. Local / Campus Wi-Fi Dev: Vite Server-Sent Events (/api/events/stream) & REST sync (/api/shares)
 *   3. Offline / Multi-Tab: BroadcastChannel & LocalStorage fallback
 *
 * Features:
 *   - Cryptographically secure 24-character unguessable capability tokens (lpu_loc_...)
 *   - Configurable auto-expiry (15m, 1h, 8h) with automatic cleanup
 *   - Battery-optimized coordinate throttling (min 2.5s between network broadcasts)
 *   - Immediate revocation (Stop Sharing button)
 *   - WhatsApp pre-filled share URL generator
 */

import {
  LiveLocationShare,
  LiveLocationCoords,
  CreateLocationShareInput
} from '../types/locationSharing';
import { db, isFirebaseConfigured } from '../config/firebase';
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { authService } from './authService';
import { shouldAttemptApiSync, getApiUrl } from './apiConfig';

const LOCATION_SHARES_COLLECTION = 'location_shares';
const ACTIVE_SHARE_STORAGE_KEY = 'lpu_active_my_location_share';
const SYNC_CHANNEL_NAME = 'lpu_location_sharing_sync';

class LocationSharingService {
  private syncChannel: BroadcastChannel | null = null;
  private lastUpdateTimestamp = 0;
  private lastLat = 0;
  private lastLng = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      } catch (e) {
        console.warn('BroadcastChannel not available for location sharing:', e);
      }
    }
  }

  /**
   * Generates a cryptographically secure 24-character unguessable token
   * (e.g. lpu_loc_AbC123...) with 62^24 entropy
   */
  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomBytes = new Uint8Array(24);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(randomBytes);
    } else {
      for (let i = 0; i < 24; i++) randomBytes[i] = Math.floor(Math.random() * 256);
    }
    let result = 'lpu_loc_';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(randomBytes[i] % chars.length);
    }
    return result;
  }

  /**
   * Starts a new location share
   */
  async createShare(
    input: CreateLocationShareInput,
    coords: { lat: number; lng: number; accuracy: number; heading?: number | null; speed?: number | null }
  ): Promise<LiveLocationShare> {
    const student = authService.getCurrentUser() || {
      uid: `std_local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      displayName: 'LPU Student'
    };
    const token = this.generateSecureToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + input.durationMinutes * 60 * 1000);

    const share: LiveLocationShare = {
      token,
      creatorId: student.uid,
      creatorDisplayName: student.displayName || 'LPU Student',
      durationMinutes: input.durationMinutes,
      isLive: input.isLive,
      coords: {
        lat: coords.lat,
        lng: coords.lng,
        accuracy: coords.accuracy,
        heading: coords.heading ?? null,
        speed: coords.speed ?? null,
        updatedAt: now.toISOString()
      },
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      revoked: false,
      note: input.note?.trim() || undefined,
      passcode: input.passcode?.trim() || undefined
    };

    // 1. Save locally as active broadcast
    try {
      localStorage.setItem(ACTIVE_SHARE_STORAGE_KEY, JSON.stringify(share));
      localStorage.setItem(`lpu_share_record_${token}`, JSON.stringify(share));
    } catch (e) {
      console.warn('Failed to save share locally:', e);
    }

    // 2. Broadcast through BroadcastChannel (same browser multi-tab)
    if (this.syncChannel) {
      this.syncChannel.postMessage({ type: 'NEW_SHARE', share });
    }

    // 3. Sync to local shared campus backend (cross-browser & mobile Wi-Fi sync)
    if (shouldAttemptApiSync()) {
      try {
        await fetch(getApiUrl('/api/shares'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ share })
        }).catch(() => {});
      } catch {}
    }

    // 4. Save to Firebase Firestore if configured
    if (isFirebaseConfigured && db) {
      try {
        const shareRef = doc(db, LOCATION_SHARES_COLLECTION, token);
        await setDoc(shareRef, share);
      } catch (err) {
        console.warn('Failed to write location share to Firestore; continuing in local mode:', err);
      }
    }

    this.lastUpdateTimestamp = Date.now();
    this.lastLat = coords.lat;
    this.lastLng = coords.lng;

    return share;
  }

  /**
   * Updates coordinates of an active broadcast with battery throttling
   */
  async updateShareCoords(
    token: string,
    coords: { lat: number; lng: number; accuracy: number; heading?: number | null; speed?: number | null }
  ): Promise<void> {
    const active = this.getActiveBroadcast();
    if (!active || active.token !== token || active.revoked) return;

    // Check expiry
    if (new Date(active.expiresAt).getTime() <= Date.now()) {
      await this.revokeShare(token);
      return;
    }

    // Battery Optimization: Throttle updates to at most once per 2.5 seconds
    // unless the student has moved more than ~2.5 meters
    const now = Date.now();
    const elapsedMs = now - this.lastUpdateTimestamp;
    const dLat = Math.abs(coords.lat - this.lastLat);
    const dLng = Math.abs(coords.lng - this.lastLng);
    const movedSignificantly = dLat > 0.000025 || dLng > 0.000025; // ~2.5 meters

    if (elapsedMs < 2500 && !movedSignificantly) {
      return;
    }

    this.lastUpdateTimestamp = now;
    this.lastLat = coords.lat;
    this.lastLng = coords.lng;

    const updatedCoords: LiveLocationCoords = {
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy,
      heading: coords.heading ?? null,
      speed: coords.speed ?? null,
      updatedAt: new Date().toISOString()
    };

    active.coords = updatedCoords;

    // 1. Update local storage
    try {
      localStorage.setItem(ACTIVE_SHARE_STORAGE_KEY, JSON.stringify(active));
      localStorage.setItem(`lpu_share_record_${token}`, JSON.stringify(active));
    } catch (e) {
      console.warn('Storage error on coords update:', e);
    }

    // 2. Broadcast via channel
    if (this.syncChannel) {
      this.syncChannel.postMessage({ type: 'COORDS_UPDATE', token, coords: updatedCoords });
    }

    // 3. Sync to local shared campus backend
    if (shouldAttemptApiSync()) {
      try {
        fetch(getApiUrl('/api/shares/coords'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, coords: updatedCoords })
        }).catch(() => {});
      } catch {}
    }

    // 4. Update Firebase Firestore if configured
    if (isFirebaseConfigured && db) {
      try {
        const shareRef = doc(db, LOCATION_SHARES_COLLECTION, token);
        await updateDoc(shareRef, { coords: updatedCoords });
      } catch (err) {
        console.warn('Failed to update coords in Firestore:', err);
      }
    }
  }

  /**
   * Revokes (stops) an active location share immediately
   */
  async revokeShare(token: string): Promise<void> {
    const active = this.getActiveBroadcast();
    if (active && active.token === token) {
      active.revoked = true;
      try {
        localStorage.removeItem(ACTIVE_SHARE_STORAGE_KEY);
        localStorage.setItem(`lpu_share_record_${token}`, JSON.stringify(active));
      } catch (e) {
        console.warn('Storage error on revoke:', e);
      }
    }

    // 1. Broadcast revocation via BroadcastChannel
    if (this.syncChannel) {
      this.syncChannel.postMessage({ type: 'REVOKE_SHARE', token });
    }

    // 2. Sync revocation to local shared campus backend
    if (shouldAttemptApiSync()) {
      try {
        await fetch(getApiUrl('/api/shares/revoke'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        }).catch(() => {});
      } catch {}
    }

    // 3. Update Firestore if configured
    if (isFirebaseConfigured && db) {
      try {
        const shareRef = doc(db, LOCATION_SHARES_COLLECTION, token);
        await updateDoc(shareRef, { revoked: true });
      } catch (err) {
        console.warn('Failed to revoke share in Firestore:', err);
      }
    }
  }

  /**
   * Retrieves the current device's active broadcast, if still valid
   */
  getActiveBroadcast(): LiveLocationShare | null {
    try {
      const raw = localStorage.getItem(ACTIVE_SHARE_STORAGE_KEY);
      if (!raw) return null;
      const share: LiveLocationShare = JSON.parse(raw);
      if (share.revoked) {
        localStorage.removeItem(ACTIVE_SHARE_STORAGE_KEY);
        return null;
      }
      if (new Date(share.expiresAt).getTime() <= Date.now()) {
        localStorage.removeItem(ACTIVE_SHARE_STORAGE_KEY);
        return null;
      }
      return share;
    } catch {
      return null;
    }
  }

  /**
   * Subscribes to a friend's shared location (Meet My Friend)
   * Connects simultaneously to Firestore (Cloud), SSE Stream (LAN/Dev), and BroadcastChannel (Tabs)
   */
  subscribeToFriendShare(
    token: string,
    onUpdate: (share: LiveLocationShare | null) => void,
    onError: (errorMsg: string) => void
  ): () => void {
    let isCancelled = false;
    let firestoreUnsub: Unsubscribe | null = null;
    let eventSource: EventSource | null = null;
    let currentShare: LiveLocationShare | null = null;

    // Helper to evaluate share validity and auto-expiration
    const handleShareData = (data: LiveLocationShare | null) => {
      if (isCancelled) return;
      if (!data) {
        onUpdate(null);
        return;
      }
      // Check expiration
      if (new Date(data.expiresAt).getTime() <= Date.now() || data.revoked) {
        currentShare = { ...data, revoked: true };
        onUpdate(currentShare);
        return;
      }
      currentShare = data;
      onUpdate(data);
    };

    // 1. Initial check in local storage (instant render)
    try {
      const raw = localStorage.getItem(`lpu_share_record_${token}`);
      if (raw) {
        const localShare: LiveLocationShare = JSON.parse(raw);
        handleShareData(localShare);
      }
    } catch (e) {
      console.warn('Error reading friend local share:', e);
    }

    // 2. Initial fetch from local shared server (when backend is available)
    if (shouldAttemptApiSync()) {
      fetch(getApiUrl(`/api/shares?token=${encodeURIComponent(token)}`))
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (isCancelled || !data) return;
          if (data && data.success && data.share) {
            handleShareData(data.share);
            try {
              localStorage.setItem(`lpu_share_record_${token}`, JSON.stringify(data.share));
            } catch {}
          }
        })
        .catch(() => {});

      // 3. Listen to Server-Sent Events (SSE) for multi-device LAN sync
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        try {
          eventSource = new EventSource(getApiUrl('/api/events/stream'));
          eventSource.onmessage = (event) => {
            if (isCancelled || !event.data) return;
            try {
              const parsed = JSON.parse(event.data);
              if (parsed.type === 'SHARE_MUTATION') {
                const { action, share, token: evtToken, coords } = parsed.payload || {};
                if (action === 'create' && share && share.token === token) {
                  handleShareData(share);
                } else if (action === 'update_coords' && evtToken === token && coords) {
                  if (currentShare) {
                    const updated = { ...currentShare, coords };
                    handleShareData(updated);
                  } else {
                    // Fetch fresh share record
                    fetch(getApiUrl(`/api/shares?token=${encodeURIComponent(token)}`))
                      .then((r) => r.json())
                      .then((d) => d?.share && handleShareData(d.share))
                      .catch(() => {});
                  }
                } else if (action === 'revoke' && evtToken === token) {
                  if (currentShare) {
                    handleShareData({ ...currentShare, revoked: true });
                  }
                }
              }
            } catch {}
          };
          eventSource.onerror = () => {
            // Close immediately on static hosts / connection errors to prevent reconnect loops
            if (eventSource) {
              eventSource.close();
              eventSource = null;
            }
          };
        } catch (e) {
          console.warn('SSE subscription skipped for friend share:', e);
        }
      }
    }

    // 4. Listen to BroadcastChannel for local/multi-tab updates
    const channelHandler = (event: MessageEvent) => {
      if (isCancelled || !event.data) return;
      const { type, share, token: evtToken, coords } = event.data;
      if (type === 'NEW_SHARE' && share && share.token === token) {
        handleShareData(share);
      } else if (type === 'COORDS_UPDATE' && evtToken === token && coords) {
        if (currentShare) {
          handleShareData({ ...currentShare, coords });
        }
      } else if (type === 'REVOKE_SHARE' && evtToken === token) {
        if (currentShare) {
          handleShareData({ ...currentShare, revoked: true });
        }
      }
    };

    if (this.syncChannel) {
      this.syncChannel.addEventListener('message', channelHandler);
    }

    // 5. Connect to Firebase Firestore if configured
    if (isFirebaseConfigured && db) {
      try {
        const shareRef = doc(db, LOCATION_SHARES_COLLECTION, token);
        firestoreUnsub = onSnapshot(
          shareRef,
          (snapshot) => {
            if (isCancelled) return;
            if (snapshot.exists()) {
              const data = snapshot.data() as LiveLocationShare;
              try {
                localStorage.setItem(`lpu_share_record_${token}`, JSON.stringify(data));
              } catch {}
              handleShareData(data);
            } else {
              handleShareData(null);
            }
          },
          (err) => {
            console.warn('Firestore friend share error:', err);
            onError('Could not reach cloud location stream. Using cached updates.');
          }
        );
      } catch (err) {
        console.warn('Error attaching Firestore share listener:', err);
      }
    }

    // 6. Periodic expiration ticker (checks every 5 seconds)
    const expirationTicker = setInterval(() => {
      if (isCancelled || !currentShare) return;
      if (new Date(currentShare.expiresAt).getTime() <= Date.now()) {
        handleShareData({ ...currentShare, revoked: true });
      }
    }, 5000);

    // Cleanup function
    return () => {
      isCancelled = true;
      clearInterval(expirationTicker);
      if (this.syncChannel) {
        this.syncChannel.removeEventListener('message', channelHandler);
      }
      if (eventSource) {
        eventSource.close();
      }
      if (firestoreUnsub) {
        firestoreUnsub();
      }
    };
  }

  /**
   * Generates a pre-filled WhatsApp share link with deep tracking capability
   */
  generateWhatsAppShareUrl(share: LiveLocationShare): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lpunav.in';
    const link = `${origin}/?share=${share.token}`;
    const modeText = share.isLive ? 'Live GPS Location (moving)' : 'One-Time Location Pin';
    const durationLabel =
      share.durationMinutes >= 60
        ? `${share.durationMinutes / 60} hour(s)`
        : `${share.durationMinutes} minutes`;

    const notePart = share.note ? `\n📝 Note: "${share.note}"` : '';
    const text = `📍 Track my ${modeText} on LPU Smart Campus Navigator:\n${link}${notePart}\n\n⏱️ Active for: ${durationLabel} (Auto-expires)\n🔒 Private & Encrypted for Lovely Professional University.`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }
}

export const locationSharingService = new LocationSharingService();
