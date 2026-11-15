/**
 * Offline Campus Map & Network Connectivity Service (Phase 5)
 * Tracks browser online/offline status, informs student of offline capabilities,
 * and maintains local caching compliance according to OpenStreetMap policies.
 */

export interface OfflineStatus {
  isOnline: boolean;
  hasCachedGraph: boolean;
  hasCachedLocations: boolean;
  hasCachedClassrooms: boolean;
  tilePolicyNotice: string;
}

class OfflineService {
  private online: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleStatusChange(true));
      window.addEventListener('offline', () => this.handleStatusChange(false));
    }
  }

  private handleStatusChange(isOnline: boolean) {
    this.online = isOnline;
    this.listeners.forEach((cb) => cb(isOnline));
  }

  public isCurrentlyOnline(): boolean {
    return this.online;
  }

  public subscribe(callback: (isOnline: boolean) => void): () => void {
    callback(this.online);
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getOfflineStatus(): OfflineStatus {
    return {
      isOnline: this.online,
      hasCachedGraph: true, // Graph is compiled client-side
      hasCachedLocations: true, // 28+ locations bundled client-side
      hasCachedClassrooms: true, // Classrooms bundled client-side
      tilePolicyNotice:
        'OpenStreetMap tiles are streamed per OSM Tile Usage Policy. Offline routing, search, and device GPS work 100% locally. Full offline vector tiles require self-hosted PMTiles/MBTiles.'
    };
  }
}

export const offlineService = new OfflineService();
