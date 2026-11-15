/**
 * Road Closures & Maintenance Management Service (Phase 5)
 * Controls dynamic campus pathway blockages, route avoidances, and administrative notices.
 * Dual-Mode: Firebase Firestore + BroadcastChannel/LocalStorage fallback.
 */

import {
  RoadClosure,
  CreateRoadClosureInput,
  StudentClosureReportInput
} from '../types/roadClosure';
import { db, isFirebaseConfigured } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';

const CLOSURES_COLLECTION = 'road_closures';
const CLOSURES_STORAGE_KEY = 'lpu_cached_road_closures';
const SYNC_CHANNEL_NAME = 'lpu_road_closures_sync';

// Default initial closure for demonstration/campus alert
const DEFAULT_INITIAL_CLOSURES: RoadClosure[] = [
  {
    id: 'closure_unipolis_stage_prep',
    title: 'Baldev Raj Mittal UniPolis Stage Setup',
    reason: 'Temporary pavilion and barricading for university youth convention.',
    edgeId: 'e_polis_concourse',
    nodeA: 'n_unipolis_concourse',
    nodeB: 'n_boulevard_2',
    segmentDescription: 'Unipolis Grand Concourse (East Wing)',
    startTime: new Date(Date.now() - 3600000).toISOString(), // Started 1h ago
    endTime: new Date(Date.now() + 86400000 * 2).toISOString(), // Ends in 2 days
    status: 'active',
    approvedByAdmin: true,
    reportedBy: 'Campus Proctorial Office',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

class RoadClosureService {
  private syncChannel: BroadcastChannel | null = null;
  private memoryClosures: RoadClosure[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      } catch (e) {
        console.warn('BroadcastChannel not available for road closures:', e);
      }
    }
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(CLOSURES_STORAGE_KEY);
      if (raw) {
        this.memoryClosures = JSON.parse(raw);
      } else {
        this.memoryClosures = [...DEFAULT_INITIAL_CLOSURES];
        localStorage.setItem(CLOSURES_STORAGE_KEY, JSON.stringify(this.memoryClosures));
      }
    } catch {
      this.memoryClosures = [...DEFAULT_INITIAL_CLOSURES];
    }
  }

  private saveToStorage(closures: RoadClosure[]) {
    this.memoryClosures = closures;
    try {
      localStorage.setItem(CLOSURES_STORAGE_KEY, JSON.stringify(closures));
    } catch (e) {
      console.warn('Failed to save road closures to local storage:', e);
    }
    if (this.syncChannel) {
      this.syncChannel.postMessage({ type: 'CLOSURES_UPDATED', closures });
    }
  }

  /**
   * Returns all active approved road closures that affect navigation routing
   */
  getActiveClosures(): RoadClosure[] {
    const now = Date.now();
    return this.memoryClosures.filter((c) => {
      if (!c.approvedByAdmin) return false;
      const start = new Date(c.startTime).getTime();
      const end = new Date(c.endTime).getTime();
      return now >= start && now <= end;
    });
  }

  /**
   * Returns all closures including pending reports (for admin view)
   */
  getAllClosures(): RoadClosure[] {
    return [...this.memoryClosures];
  }

  /**
   * Real-time subscription to road closures
   */
  subscribeToClosures(callback: (closures: RoadClosure[]) => void): () => void {
    callback(this.getAllClosures());

    let firestoreUnsub: Unsubscribe | null = null;

    // Listen to local BroadcastChannel
    const channelHandler = (event: MessageEvent) => {
      if (event.data?.type === 'CLOSURES_UPDATED' && event.data.closures) {
        this.memoryClosures = event.data.closures;
        callback(this.memoryClosures);
      }
    };

    if (this.syncChannel) {
      this.syncChannel.addEventListener('message', channelHandler);
    }

    // Connect to Firestore if configured
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, CLOSURES_COLLECTION);
        firestoreUnsub = onSnapshot(
          colRef,
          (snapshot) => {
            const firestoreClosures: RoadClosure[] = [];
            snapshot.forEach((d) => {
              firestoreClosures.push({ ...(d.data() as RoadClosure), id: d.id });
            });
            if (firestoreClosures.length > 0) {
              this.saveToStorage(firestoreClosures);
              callback(firestoreClosures);
            }
          },
          (err) => {
            console.warn('Firestore road closures subscription error:', err);
          }
        );
      } catch (e) {
        console.warn('Could not attach Firestore road closures listener:', e);
      }
    }

    return () => {
      if (this.syncChannel) {
        this.syncChannel.removeEventListener('message', channelHandler);
      }
      if (firestoreUnsub) {
        firestoreUnsub();
      }
    };
  }

  /**
   * Creates an official road closure (Admin only)
   */
  async createClosure(input: CreateRoadClosureInput, creatorName = 'LPU Administrator'): Promise<RoadClosure> {
    const id = `closure_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const startTime = new Date(input.startTime).getTime();
    const endTime = new Date(input.endTime).getTime();
    const curTime = now.getTime();

    let status: RoadClosure['status'] = 'active';
    if (curTime < startTime) status = 'scheduled';
    if (curTime > endTime) status = 'expired';

    const newClosure: RoadClosure = {
      id,
      title: input.title.trim(),
      reason: input.reason.trim(),
      edgeId: input.edgeId?.trim() || undefined,
      nodeA: input.nodeA.trim(),
      nodeB: input.nodeB.trim(),
      segmentDescription: input.segmentDescription.trim(),
      startTime: input.startTime,
      endTime: input.endTime,
      status,
      approvedByAdmin: true,
      reportedBy: creatorName,
      createdAt: now.toISOString()
    };

    const updated = [newClosure, ...this.memoryClosures.filter((c) => c.id !== id)];
    this.saveToStorage(updated);

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, CLOSURES_COLLECTION, id);
        await setDoc(docRef, newClosure);
      } catch (err) {
        console.warn('Failed to save closure to Firestore:', err);
      }
    }

    return newClosure;
  }

  /**
   * Submits a student report of a blocked campus path (Pending review)
   */
  async submitStudentReport(input: StudentClosureReportInput, reporterName = 'Student'): Promise<void> {
    const id = `report_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const report: RoadClosure = {
      id,
      title: `Blockage Report: ${input.segmentDescription}`,
      reason: input.reason,
      nodeA: input.nodeA || 'n_unknown',
      nodeB: input.nodeB || 'n_unknown',
      segmentDescription: input.segmentDescription,
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + 86400000).toISOString(), // 24h default
      status: 'active',
      approvedByAdmin: false, // Must be approved by admin!
      reportedBy: reporterName,
      createdAt: now.toISOString()
    };

    const updated = [report, ...this.memoryClosures];
    this.saveToStorage(updated);

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, CLOSURES_COLLECTION, id);
        await setDoc(docRef, report);
      } catch (err) {
        console.warn('Failed to save student closure report to Firestore:', err);
      }
    }
  }

  /**
   * Approves a student closure report into an active routing restriction (Admin only)
   */
  async approveClosure(id: string): Promise<void> {
    const target = this.memoryClosures.find((c) => c.id === id);
    if (!target) return;

    target.approvedByAdmin = true;
    this.saveToStorage([...this.memoryClosures]);

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, CLOSURES_COLLECTION, id);
        await updateDoc(docRef, { approvedByAdmin: true });
      } catch (err) {
        console.warn('Failed to approve closure in Firestore:', err);
      }
    }
  }

  /**
   * Deletes a road closure or dismisses a report (Admin only)
   */
  async deleteClosure(id: string): Promise<void> {
    const updated = this.memoryClosures.filter((c) => c.id !== id);
    this.saveToStorage(updated);

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, CLOSURES_COLLECTION, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('Failed to delete closure from Firestore:', err);
      }
    }
  }
}

export const roadClosureService = new RoadClosureService();
