/**
 * Safe local storage service for bookmarks and offline preferences.
 * Gracefully degrades if cookies or storage access is restricted.
 */

const STORAGE_KEYS = {
  SAVED_PLACES: 'lpu_nav_saved_places_v1',
  RECENT_SEARCHES: 'lpu_nav_recent_searches_v1',
  PREFERRED_NAV_MODE: 'lpu_nav_preferred_mode_v1',
};

export class StorageService {
  private isStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const test = '__storage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  public getSavedPlaceIds(): string[] {
    if (!this.isStorageAvailable()) return [];
    try {
      const data = window.localStorage.getItem(STORAGE_KEYS.SAVED_PLACES);
      return data ? (JSON.parse(data) as string[]) : [];
    } catch {
      return [];
    }
  }

  public toggleSavedPlace(locationId: string): boolean {
    if (!this.isStorageAvailable()) return false;
    try {
      const current = this.getSavedPlaceIds();
      const exists = current.includes(locationId);
      const updated = exists
        ? current.filter((id) => id !== locationId)
        : [...current, locationId];
      window.localStorage.setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(updated));
      return !exists;
    } catch {
      return false;
    }
  }

  public isPlaceSaved(locationId: string): boolean {
    return this.getSavedPlaceIds().includes(locationId);
  }

  public getRecentSearches(): string[] {
    if (!this.isStorageAvailable()) return [];
    try {
      const data = window.localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return data ? (JSON.parse(data) as string[]) : [];
    } catch {
      return [];
    }
  }

  public addRecentSearch(query: string): void {
    if (!this.isStorageAvailable() || !query.trim()) return;
    try {
      const current = this.getRecentSearches().filter(
        (q) => q.toLowerCase() !== query.trim().toLowerCase()
      );
      const updated = [query.trim(), ...current].slice(0, 8);
      window.localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
    } catch {
      // Ignored
    }
  }

  public clearRecentSearches(): void {
    if (!this.isStorageAvailable()) return;
    try {
      window.localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    } catch {
      // Ignored
    }
  }
}

export const storageService = new StorageService();
