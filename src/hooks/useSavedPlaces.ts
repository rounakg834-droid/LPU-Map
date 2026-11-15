import { useState, useCallback, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { CAMPUS_LOCATIONS } from '../data/locations';
import { CampusLocation } from '../types/location';

export function useSavedPlaces() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(storageService.getSavedPlaceIds());
  }, []);

  const toggleSave = useCallback((locationId: string) => {
    storageService.toggleSavedPlace(locationId);
    setSavedIds(storageService.getSavedPlaceIds());
  }, []);

  const isSaved = useCallback(
    (locationId: string) => savedIds.includes(locationId),
    [savedIds]
  );

  const savedLocations: CampusLocation[] = CAMPUS_LOCATIONS.filter((loc) =>
    savedIds.includes(loc.id)
  );

  return {
    savedIds,
    savedLocations,
    toggleSave,
    isSaved,
  };
}
