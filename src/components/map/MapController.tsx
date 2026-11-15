import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { CampusLocation } from '../../types/location';
import { GeoPosition, RoutePlan } from '../../types/navigation';
import { LPU_CAMPUS_CENTER, LPU_CAMPUS_BOUNDS } from '../../data/campusBounds';

interface MapControllerProps {
  selectedLocation: CampusLocation | null;
  userPosition: GeoPosition | null;
  isFollowing: boolean;
  onUserInteracted: () => void;
  resetNorthSignal: number;
  recenterCampusSignal: number;
  activeRoute?: RoutePlan | null;
  isNavigating?: boolean;
}

export const MapController: React.FC<MapControllerProps> = ({
  selectedLocation,
  userPosition,
  isFollowing,
  onUserInteracted,
  resetNorthSignal,
  recenterCampusSignal,
  activeRoute,
  isNavigating,
}) => {
  const map = useMap();
  const prevSelectedId = useRef<string | null>(null);
  const prevRouteId = useRef<string | null>(null);

  // Set boundary restrictions on map so users don't get lost
  useEffect(() => {
    const southWest = L.latLng(LPU_CAMPUS_BOUNDS.southWest.lat, LPU_CAMPUS_BOUNDS.southWest.lng);
    const northEast = L.latLng(LPU_CAMPUS_BOUNDS.northEast.lat, LPU_CAMPUS_BOUNDS.northEast.lng);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds.pad(0.3));
  }, [map]);

  // Handle user manual pan/drag to disable auto-following
  useEffect(() => {
    const handleDragStart = () => {
      onUserInteracted();
    };

    map.on('dragstart', handleDragStart);
    return () => {
      map.off('dragstart', handleDragStart);
    };
  }, [map, onUserInteracted]);

  // Smooth flyTo when location is selected (and not in active navigation)
  useEffect(() => {
    if (!isNavigating && selectedLocation?.coordinates && selectedLocation.id !== prevSelectedId.current) {
      prevSelectedId.current = selectedLocation.id;
      map.flyTo(
        [selectedLocation.coordinates.lat, selectedLocation.coordinates.lng],
        18,
        {
          duration: 1.2,
          easeLinearity: 0.25,
        }
      );
    }
  }, [selectedLocation, isNavigating, map]);

  // Auto-fit bounds when a new route is calculated
  useEffect(() => {
    if (activeRoute && activeRoute.pathCoordinates.length >= 2) {
      const routeKey = `${activeRoute.destination.id}_${activeRoute.mode}_${activeRoute.distanceMeters}`;
      if (routeKey !== prevRouteId.current) {
        prevRouteId.current = routeKey;
        const latLngs = activeRoute.pathCoordinates.map((c) => L.latLng(c.lat, c.lng));
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, {
          paddingTopLeft: [40, 40],
          paddingBottomRight: [40, isNavigating ? 140 : 80],
          maxZoom: 18,
          animate: true,
        });
      }
    }
  }, [activeRoute, isNavigating, map]);

  // Follow user position when enabled
  useEffect(() => {
    if (isFollowing && userPosition) {
      const { latitude, longitude } = userPosition.coords;
      const targetZoom = isNavigating ? 18 : map.getZoom();
      map.setView([latitude, longitude], targetZoom, {
        animate: true,
      });
    }
  }, [isFollowing, userPosition, isNavigating, map]);

  // Recenter to full campus view
  useEffect(() => {
    if (recenterCampusSignal > 0) {
      map.flyTo([LPU_CAMPUS_CENTER.lat, LPU_CAMPUS_CENTER.lng], 16, {
        duration: 1.0,
      });
    }
  }, [recenterCampusSignal, map]);

  // Reset rotation/north signal
  useEffect(() => {
    if (resetNorthSignal > 0) {
      map.invalidateSize();
    }
  }, [resetNorthSignal, map]);

  return null;
};
