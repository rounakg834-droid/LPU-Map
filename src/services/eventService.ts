import { db, isFirebaseConfigured } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import {
  PublicCampusEvent,
  ProtectedStudentMetadata,
  CreateEventInput,
  EventStatus,
  EventReport,
} from '../types/events';
import { authService } from './authService';

const STORAGE_KEY_EVENTS = 'lpu_campus_events_v4';
const STORAGE_KEY_PRIVATE_META = 'lpu_events_private_metadata_v4';
const STORAGE_KEY_REPORTS = 'lpu_event_reports_v4';
const STORAGE_KEY_TOMBSTONES = 'lpu_tombstone_removed_events_v4';

// BroadcastChannel for instant cross-tab synchronization in the same browser
const broadcast = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('lpu_live_events_sync')
  : null;

class EventService {
  private activeEvents: PublicCampusEvent[] = [];
  private allEventsCache: PublicCampusEvent[] = [];
  private eventListeners: Set<(events: PublicCampusEvent[]) => void> = new Set();
  private allEventListeners: Set<(events: PublicCampusEvent[]) => void> = new Set();
  private tickerInterval: number | null = null;
  private firestoreUnsubscribe: (() => void) | null = null;
  private sseSource: EventSource | null = null;

  constructor() {
    this.initRealtimeSync();
    this.startLifecycleTicker();
  }

  /**
   * Authoritative Tombstone Registry to prevent deleted events from resurrecting from stale caches
   */
  private getTombstones(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TOMBSTONES);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }

  private addTombstone(eventId: string) {
    try {
      const tombstones = this.getTombstones();
      tombstones.add(eventId);
      localStorage.setItem(STORAGE_KEY_TOMBSTONES, JSON.stringify(Array.from(tombstones)));
    } catch (e) {
      console.warn('Failed to save tombstone:', e);
    }
  }

  private isTombstoned(eventId: string): boolean {
    return this.getTombstones().has(eventId);
  }

  /**
   * Initializes real-time synchronization:
   * 1. Firebase Firestore onSnapshot when configured
   * 2. Local Shared Campus Server (SSE + REST) when in dev / local mode
   * 3. Cross-tab BroadcastChannel & window storage events for instant tab sync
   */
  private initRealtimeSync() {
    // 1. Live Firebase Firestore Sync
    if (isFirebaseConfigured && db) {
      try {
        const eventsCol = collection(db, 'events');
        this.firestoreUnsubscribe = onSnapshot(
          eventsCol,
          (snapshot) => {
            const events: PublicCampusEvent[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as PublicCampusEvent;
              // If tombstoned locally, respect authoritative deletion
              if (this.isTombstoned(data.id)) {
                data.status = 'removed_by_admin';
              }
              events.push(data);
            });

            this.allEventsCache = events;
            this.saveLocalEvents(events, false);

            // Filter active events: strictly 'upcoming' or 'live', never removed or ended
            const active = events.filter((ev) => this.isEventActive(ev));
            this.updateActiveEvents(active);
            this.notifyAllEventListeners(events);
          },
          (error) => {
            console.warn('Firestore onSnapshot listener error, falling back to local sync:', error);
            this.initLocalServerSync();
          }
        );
        return;
      } catch (err) {
        console.warn('Firestore initialization failed:', err);
      }
    }

    // 2. Local Shared Campus Server Mode (Dev Mode / Firebase Unconfigured)
    this.initLocalServerSync();
  }

  /**
   * Local Shared Campus Server Synchronization (SSE + REST API)
   * Connects all browsers and external LAN devices to the shared Vite server
   */
  private initLocalServerSync() {
    // Load local cache first for instant display
    this.loadLocalEvents();

    // Fetch latest shared events from server
    this.fetchSharedServerEvents();

    // Connect to Server-Sent Events (SSE) stream for real-time push from other devices
    if (typeof window !== 'undefined' && typeof EventSource !== 'undefined') {
      try {
        this.sseSource = new EventSource('/api/events/stream');

        this.sseSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === 'EVENT_MUTATION') {
              if (data.payload?.action === 'remove' && data.payload.eventId) {
                this.addTombstone(data.payload.eventId);
              }
              this.fetchSharedServerEvents();
            }
          } catch (err) {
            console.warn('Error parsing SSE event:', err);
          }
        };

        this.sseSource.onerror = () => {
          // Reconnection is handled automatically by browser EventSource
        };
      } catch (err) {
        console.warn('SSE connection initialization skipped:', err);
      }
    }

    // Cross-tab broadcast listener for instant 0ms tab sync
    if (broadcast) {
      broadcast.onmessage = (event) => {
        if (event.data?.type === 'EVENTS_UPDATED') {
          if (event.data.removedEventId) {
            this.addTombstone(event.data.removedEventId);
          }
          this.loadLocalEvents();
        }
      };
    }

    // Storage event for cross-window sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY_EVENTS || e.key === STORAGE_KEY_TOMBSTONES) {
          this.loadLocalEvents();
        }
      });
    }
  }

  /**
   * Fetch authoritative shared events from local server
   */
  private async fetchSharedServerEvents() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        const serverEvents: PublicCampusEvent[] = data.events || [];
        const tombstones = this.getTombstones();

        // Enforce tombstones
        const reconciled = serverEvents.map((ev) => {
          if (tombstones.has(ev.id) || ev.status === 'removed' || ev.status === 'removed_by_admin') {
            return { ...ev, status: 'removed_by_admin' as EventStatus };
          }
          return ev;
        });

        this.allEventsCache = reconciled;
        this.saveLocalEvents(reconciled, false);

        const active = reconciled.filter((ev) => this.isEventActive(ev));
        this.updateActiveEvents(active);
        this.notifyAllEventListeners(reconciled);
      }
    } catch {
      // Offline fallback: rely on local storage
    }
  }

  /**
   * Helper to determine if an event is currently active on the public map
   */
  public isEventActive(event: PublicCampusEvent): boolean {
    if (this.isTombstoned(event.id)) return false;
    if (event.status === 'removed' || event.status === 'removed_by_admin' || event.status === 'cancelled' || event.status === 'ended') {
      return false;
    }
    const now = new Date();
    const end = new Date(event.endTime);
    if (now > end) return false;
    return event.status === 'live' || event.status === 'upcoming';
  }

  /**
   * Loads events from local storage, evaluating their lifecycle state
   */
  private loadLocalEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
      let list: PublicCampusEvent[] = raw ? JSON.parse(raw) : [];
      const tombstones = this.getTombstones();

      const now = new Date();
      list = list.map((ev) => {
        if (tombstones.has(ev.id) || ev.status === 'removed' || ev.status === 'removed_by_admin') {
          return { ...ev, status: 'removed_by_admin' as EventStatus };
        }
        return this.computeCurrentStatus(ev, now);
      });

      this.allEventsCache = list;
      this.saveLocalEvents(list, false);

      const active = list.filter((ev) => this.isEventActive(ev));
      this.updateActiveEvents(active);
      this.notifyAllEventListeners(list);
    } catch (e) {
      console.warn('Failed to parse local events:', e);
      this.updateActiveEvents([]);
    }
  }

  private saveLocalEvents(events: PublicCampusEvent[], shouldBroadcast = true) {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      if (shouldBroadcast && broadcast) {
        broadcast.postMessage({ type: 'EVENTS_UPDATED' });
      }
    } catch (e) {
      console.warn('Failed to save events to local storage:', e);
    }
  }

  private getLocalPrivateMetadata(): ProtectedStudentMetadata[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PRIVATE_META);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLocalPrivateMetadata(metaList: ProtectedStudentMetadata[]) {
    try {
      localStorage.setItem(STORAGE_KEY_PRIVATE_META, JSON.stringify(metaList));
    } catch (e) {
      console.warn('Failed to save private metadata:', e);
    }
  }

  private getLocalReports(): EventReport[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLocalReports(reports: EventReport[]) {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.warn('Failed to save reports:', e);
    }
  }

  /**
   * Computes dynamic status: Upcoming -> Live -> Ended
   */
  public computeCurrentStatus(event: PublicCampusEvent, now: Date = new Date()): PublicCampusEvent {
    if (
      event.status === 'cancelled' ||
      event.status === 'removed' ||
      event.status === 'removed_by_admin' ||
      this.isTombstoned(event.id)
    ) {
      return {
        ...event,
        status: (event.status === 'cancelled' ? 'cancelled' : 'removed_by_admin') as EventStatus,
      };
    }

    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    let newStatus: EventStatus = event.status;

    if (now < start) {
      newStatus = 'upcoming';
    } else if (now >= start && now <= end) {
      newStatus = 'live';
    } else if (now > end) {
      newStatus = 'ended';
    }

    if (newStatus !== event.status) {
      return {
        ...event,
        status: newStatus,
        updatedAt: now.toISOString(),
      };
    }

    return event;
  }

  /**
   * Periodic ticker to transition Upcoming -> Live, and Live -> Ended
   */
  private startLifecycleTicker() {
    if (this.tickerInterval) return;

    this.tickerInterval = window.setInterval(() => {
      const now = new Date();
      let hasChanges = false;

      const updated = this.activeEvents.map((ev) => {
        const checked = this.computeCurrentStatus(ev, now);
        if (checked.status !== ev.status) {
          hasChanges = true;
        }
        return checked;
      });

      if (hasChanges) {
        const stillActive = updated.filter((ev) => this.isEventActive(ev));
        this.updateActiveEvents(stillActive);
      }
    }, 15000); // Check every 15 seconds
  }

  private updateActiveEvents(events: PublicCampusEvent[]) {
    this.activeEvents = events;
    for (const listener of this.eventListeners) {
      try {
        listener(this.activeEvents);
      } catch (err) {
        console.warn('Error in active event listener:', err);
      }
    }
  }

  private notifyAllEventListeners(events: PublicCampusEvent[]) {
    for (const listener of this.allEventListeners) {
      try {
        listener(events);
      } catch (err) {
        console.warn('Error in all events listener:', err);
      }
    }
  }

  /**
   * Subscribe to real-time active events (live and upcoming for public map)
   */
  public subscribeToActiveEvents(callback: (events: PublicCampusEvent[]) => void): () => void {
    this.eventListeners.add(callback);
    callback(this.activeEvents);

    return () => {
      this.eventListeners.delete(callback);
    };
  }

  /**
   * Subscribe to all events (active + history for Admin Dashboard)
   */
  public subscribeToAllEvents(callback: (events: PublicCampusEvent[]) => void): () => void {
    this.allEventListeners.add(callback);
    if (this.allEventsCache.length > 0) {
      callback(this.allEventsCache);
    } else {
      callback(this.getAllStoredEvents());
    }

    return () => {
      this.allEventListeners.delete(callback);
    };
  }

  /**
   * Public Validation: Maximum 6 hours, valid dates, anti-spam
   */
  public validateEventInput(input: CreateEventInput): { isValid: boolean; error?: string } {
    const start = new Date(input.startTime);
    const end = new Date(input.endTime);
    const now = new Date();

    if (!input.title || input.title.trim().length < 3) {
      return { isValid: false, error: 'Event title must be at least 3 characters.' };
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, error: 'Invalid start or end date/time.' };
    }

    // Reject past end times (allow 10m grace for immediate live events)
    if (end.getTime() < now.getTime() - 10 * 60 * 1000) {
      return { isValid: false, error: 'Event end time cannot be in the past.' };
    }

    if (end.getTime() <= start.getTime()) {
      return { isValid: false, error: 'Event end time must be after the start time.' };
    }

    // STRICT CONSTRAINT: MAXIMUM 6 HOURS (360 minutes)
    const durationMs = end.getTime() - start.getTime();
    const maxDurationMs = 6 * 60 * 60 * 1000;

    if (durationMs > maxDurationMs) {
      return {
        isValid: false,
        error: 'Maximum event duration is 6 hours. Events exceeding 6 hours are not permitted.',
      };
    }

    // Validate Student Private Information
    if (!input.studentFullName || input.studentFullName.trim().length < 2) {
      return { isValid: false, error: 'Student full name is required for campus identity.' };
    }

    if (!input.studentCourse || input.studentCourse.trim().length < 2) {
      return { isValid: false, error: 'Student course is required (e.g. B.Tech CSE).' };
    }

    if (!input.studentYear || input.studentYear.trim().length < 1) {
      return { isValid: false, error: 'Year of study is required.' };
    }

    // Anti-spam: Duplicate detection
    const duplicate = this.activeEvents.find(
      (ev) =>
        ev.locationId === input.locationId &&
        ev.title.toLowerCase().trim() === input.title.toLowerCase().trim() &&
        Math.abs(new Date(ev.startTime).getTime() - start.getTime()) < 30 * 60 * 1000
    );

    if (duplicate) {
      return {
        isValid: false,
        error: 'An event with this title at this location is already scheduled during this time window.',
      };
    }

    return { isValid: true };
  }

  /**
   * Publish a new campus event with strict privacy separation
   */
  public async createEvent(input: CreateEventInput): Promise<PublicCampusEvent> {
    const validation = this.validateEventInput(input);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid event input');
    }

    // Ensure student is signed in
    let currentUser = authService.getCurrentUser();
    if (!currentUser) {
      currentUser = await authService.signInStudent({
        fullName: input.studentFullName,
        course: input.studentCourse,
        yearOfStudy: input.studentYear,
      });
    }

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const start = new Date(input.startTime);
    const end = new Date(input.endTime);
    const now = new Date();

    const initialStatus: EventStatus =
      now >= start && now <= end ? 'live' : 'upcoming';

    // 1. PUBLIC EVENT DOCUMENT (Excludes sensitive course/year/account data!)
    const publicEvent: PublicCampusEvent = {
      id: eventId,
      title: input.title.trim(),
      category: input.category,
      description: input.description.trim(),
      locationId: input.locationId,
      locationName: input.locationName,
      coordinates: input.coordinates,
      startTime: input.startTime,
      endTime: input.endTime,
      creatorName: currentUser.displayName,
      creatorUid: currentUser.uid,
      imageUrl: input.imageUrl?.trim() || undefined,
      status: initialStatus,
      reportCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 2. PROTECTED STUDENT METADATA (Admin Only!)
    const privateMeta: ProtectedStudentMetadata = {
      eventId,
      creatorUid: currentUser.uid,
      fullName: input.studentFullName.trim(),
      course: input.studentCourse.trim(),
      yearOfStudy: input.studentYear.trim(),
      accountIdentifier: currentUser.email || currentUser.uid,
      submittedAt: nowIso,
    };

    // 1. Production Mode with Live Firebase Firestore
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'events', eventId), publicEvent);
      await setDoc(doc(db, 'event_private_metadata', eventId), privateMeta);
    } else {
      // 2. Local Shared Campus Server API
      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: publicEvent,
            metadata: privateMeta
          })
        });
      } catch (err) {
        console.warn('Local API create fallback:', err);
      }
    }

    // Maintain in local sync cache
    const allLocal = this.getAllStoredEvents();
    allLocal.unshift(publicEvent);
    this.saveLocalEvents(allLocal);

    const allMeta = this.getLocalPrivateMetadata();
    allMeta.unshift(privateMeta);
    this.saveLocalPrivateMetadata(allMeta);

    // Update active memory immediately
    const active = allLocal.filter((e) => this.isEventActive(e));
    this.updateActiveEvents(active);
    this.notifyAllEventListeners(allLocal);

    return publicEvent;
  }

  /**
   * Cancel an event (Author or Admin only)
   */
  public async cancelEvent(eventId: string, userUid: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    const isAdmin = authService.isAdmin();

    if (!isAdmin && currentUser?.uid !== userUid) {
      throw new Error('You do not have permission to cancel this event.');
    }

    const nowIso = new Date().toISOString();

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'events', eventId), {
        status: 'cancelled',
        updatedAt: nowIso,
      });
    }

    const all = this.getAllStoredEvents();
    const idx = all.findIndex((e) => e.id === eventId);
    if (idx !== -1) {
      all[idx].status = 'cancelled';
      all[idx].updatedAt = nowIso;
      this.saveLocalEvents(all);
    }

    const active = all.filter((e) => this.isEventActive(e));
    this.updateActiveEvents(active);
    this.notifyAllEventListeners(all);
  }

  /**
   * Submit an event moderation report
   */
  public async reportEvent(
    eventId: string,
    reason: EventReport['reason'],
    details?: string
  ): Promise<void> {
    const event = this.getAllStoredEvents().find((e) => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const currentUser = authService.getCurrentUser();
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const report: EventReport = {
      id: reportId,
      eventId,
      eventTitle: event.title,
      reporterUid: currentUser?.uid,
      reason,
      details: details?.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'event_reports', reportId), report);
      await updateDoc(doc(db, 'events', eventId), {
        reportCount: (event.reportCount || 0) + 1,
      });
    } else {
      try {
        await fetch('/api/events/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        });
      } catch (e) {
        console.warn('Local API report fallback:', e);
      }
    }

    // Local report storage
    const reports = this.getLocalReports();
    reports.unshift(report);
    this.saveLocalReports(reports);

    // Increment count on local event
    const all = this.getAllStoredEvents();
    const idx = all.findIndex((e) => e.id === eventId);
    if (idx !== -1) {
      all[idx].reportCount = (all[idx].reportCount || 0) + 1;
      this.saveLocalEvents(all);
    }
  }

  /**
   * Get all stored events (historical + active) for admin dashboard
   */
  public getAllStoredEvents(): PublicCampusEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
      const list: PublicCampusEvent[] = raw ? JSON.parse(raw) : [];
      const tombstones = this.getTombstones();
      return list.map((ev) => {
        if (tombstones.has(ev.id)) {
          return { ...ev, status: 'removed_by_admin' as EventStatus };
        }
        return ev;
      });
    } catch {
      return [];
    }
  }

  /**
   * Admin Dashboard: Retrieve full historical data including protected student metadata
   */
  public async getAdminDashboardData(): Promise<{
    events: PublicCampusEvent[];
    metadata: ProtectedStudentMetadata[];
    reports: EventReport[];
  }> {
    if (!authService.isAdmin()) {
      throw new Error('Unauthorized: Administrative role required.');
    }

    let events: PublicCampusEvent[] = [];
    let metadata: ProtectedStudentMetadata[] = [];
    let reports: EventReport[] = [];

    // 1. Firebase Cloud Mode
    if (isFirebaseConfigured && db) {
      try {
        const eventsSnap = await getDocs(collection(db, 'events'));
        eventsSnap.forEach((d) => events.push(d.data() as PublicCampusEvent));

        const metaSnap = await getDocs(collection(db, 'event_private_metadata'));
        metaSnap.forEach((d) => metadata.push(d.data() as ProtectedStudentMetadata));

        const reportsSnap = await getDocs(collection(db, 'event_reports'));
        reportsSnap.forEach((d) => reports.push(d.data() as EventReport));
      } catch (e) {
        console.warn('Firestore admin read fallback:', e);
      }
    } else {
      // 2. Local Shared Campus Server API
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json();
          events = data.events || [];
          metadata = data.metadata || [];
          reports = data.reports || [];
        }
      } catch (err) {
        console.warn('Local API fetch fallback:', err);
      }
    }

    if (events.length === 0) {
      events = this.getAllStoredEvents();
      metadata = this.getLocalPrivateMetadata();
      reports = this.getLocalReports();
    }

    // Reconcile with tombstones
    const tombstones = this.getTombstones();
    events = events.map((ev) => {
      if (tombstones.has(ev.id) || ev.status === 'removed' || ev.status === 'removed_by_admin') {
        return { ...ev, status: 'removed_by_admin' as EventStatus };
      }
      return ev;
    });

    return { events, metadata, reports };
  }

  /**
   * Admin Action: Authoritative Event Deletion & Immediate Synchronization
   * Persists to authoritative shared database and broadcasts removal to all devices.
   */
  public async adminRemoveEvent(eventId: string, reason: string): Promise<void> {
    if (!authService.isAdmin()) {
      throw new Error('Unauthorized: Administrative role required.');
    }

    const nowIso = new Date().toISOString();
    const adminUser = authService.getCurrentUser();
    const removedBy = adminUser?.email || adminUser?.fullName || 'University Administrator';

    // 1. PERSIST TO AUTHORITATIVE DATABASE FIRST (Must confirm before showing success)
    if (isFirebaseConfigured && db) {
      // Direct Firestore update - DO NOT SWALLOW ERRORS
      await updateDoc(doc(db, 'events', eventId), {
        status: 'removed_by_admin',
        updatedAt: nowIso,
        removedAt: nowIso,
        moderationReason: reason,
        removedBy: removedBy,
      });
    } else {
      // Local Shared Campus Server API
      const res = await fetch('/api/events/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          reason,
          removedBy,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to remove event: Server returned HTTP ${res.status}`);
      }
    }

    // 2. RECORD TOMBSTONE to permanently block stale cache resurrection
    this.addTombstone(eventId);

    // 3. UPDATE LOCAL MEMORY & STORAGE
    const all = this.getAllStoredEvents();
    let eventFound = false;

    const updated = all.map((e) => {
      if (e.id === eventId) {
        eventFound = true;
        return {
          ...e,
          status: 'removed_by_admin' as EventStatus,
          updatedAt: nowIso,
          removedAt: nowIso,
          moderationReason: reason,
          removedBy: removedBy,
        };
      }
      return e;
    });

    if (!eventFound) {
      updated.unshift({
        id: eventId,
        title: 'Removed Event',
        category: 'other',
        description: 'This event was removed by a campus administrator.',
        locationId: 'campus-hub',
        locationName: 'Campus',
        coordinates: { lat: 31.25492, lng: 75.70462 },
        startTime: nowIso,
        endTime: nowIso,
        creatorName: 'Moderator',
        creatorUid: 'admin',
        status: 'removed_by_admin',
        reportCount: 0,
        moderationReason: reason,
        removedAt: nowIso,
        removedBy: removedBy,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }

    this.saveLocalEvents(updated, false);

    // 4. IMMEDIATELY REMOVE FROM ACTIVE EVENTS & NOTIFY SUBSCRIBERS
    const active = updated.filter((e) => this.isEventActive(e));
    this.updateActiveEvents(active);
    this.notifyAllEventListeners(updated);

    // 5. BROADCAST TO OTHER TABS IN SAME BROWSER
    if (broadcast) {
      broadcast.postMessage({ type: 'EVENTS_UPDATED', removedEventId: eventId });
    }
  }

  /**
   * Destroy intervals and listeners
   */
  public destroy() {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
    if (this.firestoreUnsubscribe) {
      this.firestoreUnsubscribe();
      this.firestoreUnsubscribe = null;
    }
    if (this.sseSource) {
      this.sseSource.close();
      this.sseSource = null;
    }
    if (broadcast) {
      broadcast.close();
    }
  }
}

export const eventService = new EventService();