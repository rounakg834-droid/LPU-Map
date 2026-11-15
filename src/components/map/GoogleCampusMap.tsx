import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Compass,
  Navigation2,
  Plus,
  Minus,
  Settings,
  AlertTriangle,
  CheckCircle,
  Box,
  Layers,
} from 'lucide-react';
import { CampusLocation, LocationCategory } from '../../types/location';
import { GeoPosition, RoutePlan } from '../../types/navigation';
import { PublicCampusEvent } from '../../types/events';
import { LiveLocationShare } from '../../types/locationSharing';
import { RoadClosure } from '../../types/roadClosure';
import { googleMapsService } from '../../services/googleMapsService';
import { LPU_CAMPUS_BOUNDS, LPU_CAMPUS_CENTER } from '../../data/campusBounds';
import { campusRouteGraph } from '../../data/campusRouteGraph';

interface GoogleCampusMapProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (location: CampusLocation) => void;
  userPosition: GeoPosition | null;
  heading: number | null;
  selectedCategory: LocationCategory | 'all';
  activeRoute: RoutePlan | null;
  isNavigating: boolean;
  isFollowing: boolean;
  onSetIsFollowing?: (following: boolean) => void;
  isNorthUp?: boolean;
  onToggleNorthUp?: () => void;
  events?: PublicCampusEvent[];
  selectedEvent?: PublicCampusEvent | null;
  onSelectEvent?: (event: PublicCampusEvent) => void;
  friendShare?: LiveLocationShare | null;
  onSelectFriend?: () => void;
  roadClosures?: RoadClosure[];
  onOpenConfigModal: () => void;
}

export const GoogleCampusMap: React.FC<GoogleCampusMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  userPosition,
  heading,
  selectedCategory,
  activeRoute,
  isNavigating,
  isFollowing,
  onSetIsFollowing,
  isNorthUp = false,
  onToggleNorthUp,
  events = [],
  selectedEvent,
  onSelectEvent,
  friendShare,
  onSelectFriend,
  roadClosures = [],
  onOpenConfigModal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routePolylineRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const userAccuracyCircleRef = useRef<any>(null);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapTilt, setMapTilt] = useState<number>(0);

  // Check and load Google Maps Script
  useEffect(() => {
    let isMounted = true;

    const checkAndInit = async () => {
      if (!googleMapsService.isConfigured()) {
        if (isMounted) {
          setIsLoaded(false);
          setLoadError('Google Maps API key is unconfigured. Click below to add your API key.');
        }
        return;
      }

      setLoadError(null);
      const ready = await googleMapsService.load();
      if (!isMounted) return;

      if (ready && window.google?.maps) {
        setIsLoaded(true);
      } else {
        setIsLoaded(false);
        setLoadError(googleMapsService.getErrorMessage() || 'Failed to initialize Google Maps Platform.');
      }
    };

    checkAndInit();

    const unsub = googleMapsService.subscribe((status, err) => {
      if (!isMounted) return;
      if (status === 'ready') {
        setIsLoaded(true);
        setLoadError(null);
      } else if (status === 'error') {
        setIsLoaded(false);
        setLoadError(err || 'Google Maps authorization error.');
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Initialize Map Instance
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapInstanceRef.current || !window.google?.maps) {
      return;
    }

    try {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: LPU_CAMPUS_CENTER.lat, lng: LPU_CAMPUS_CENTER.lng },
        zoom: 16,
        minZoom: 14,
        maxZoom: 20,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        clickableIcons: true,
        restriction: {
          latLngBounds: {
            north: LPU_CAMPUS_BOUNDS.northEast.lat,
            south: LPU_CAMPUS_BOUNDS.southWest.lat,
            east: LPU_CAMPUS_BOUNDS.northEast.lng,
            west: LPU_CAMPUS_BOUNDS.southWest.lng,
          },
          strictBounds: false,
        },
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'simplified' }],
          },
          {
            featureType: 'poi.school',
            elementType: 'geometry',
            stylers: [{ color: '#f1f5f9' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ lightness: 5 }],
          },
        ],
      });

      map.addListener('dragstart', () => {
        onSetIsFollowing?.(false);
      });

      mapInstanceRef.current = map;
    } catch (e: any) {
      console.error('Error creating Google Maps instance:', e);
      setLoadError(e?.message || 'Error initializing map canvas.');
    }

    return () => {
      // Cleanup map references
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [isLoaded, onSetIsFollowing]);

  // Handle Location & Event Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Filter campus locations
    const visibleLocations = locations.filter((loc) => {
      if (!loc.coordinates) return false;
      if (selectedCategory !== 'all' && loc.category !== selectedCategory) return false;
      return true;
    });

    visibleLocations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const isBuilding41 = loc.id === 'building-41' || loc.blockNumber === '41';

      // Use verified entrance coordinates where available
      const markerPosition = loc.entranceCoordinates || loc.coordinates!;

      // Custom marker icon based on selection and category
      const fillColor = isBuilding41 ? '#f59e0b' : isSelected ? '#2563eb' : '#0f172a';
      const scale = isSelected ? 9 : isBuilding41 ? 8 : 6;

      const marker = new window.google.maps.Marker({
        position: { lat: markerPosition.lat, lng: markerPosition.lng },
        map,
        title: loc.shortName || loc.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: fillColor,
          fillOpacity: 0.95,
          scale: scale,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: isSelected ? 100 : isBuilding41 ? 90 : 50,
      });

      marker.addListener('click', () => {
        onSelectLocation(loc);
      });

      markersRef.current.push(marker);
    });

    // Event markers
    events.forEach((evt) => {
      if (!evt.coordinates) return;
      const isSelected = selectedEvent?.id === evt.id;

      const evtMarker = new window.google.maps.Marker({
        position: { lat: evt.coordinates.lat, lng: evt.coordinates.lng },
        map,
        title: `Event: ${evt.title}`,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          fillColor: isSelected ? '#dc2626' : '#ea580c',
          fillOpacity: 1,
          scale: 5,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
        },
        zIndex: isSelected ? 120 : 80,
      });

      evtMarker.addListener('click', () => {
        onSelectEvent?.(evt);
      });

      markersRef.current.push(evtMarker);
    });

    // Friend live marker (Phase 5 & 7 "Meet My Friend")
    if (friendShare && friendShare.coords) {
      const friendMarker = new window.google.maps.Marker({
        position: {
          lat: friendShare.coords.lat,
          lng: friendShare.coords.lng,
        },
        map,
        title: `${friendShare.creatorDisplayName}'s Live GPS`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#10b981',
          fillOpacity: 1,
          scale: 9,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
        zIndex: 150,
      });

      friendMarker.addListener('click', () => {
        onSelectFriend?.();
      });

      markersRef.current.push(friendMarker);
    }

    // Road Closures markers
    roadClosures.forEach((closure) => {
      const nodeA = campusRouteGraph.nodes[closure.nodeA];
      const nodeB = campusRouteGraph.nodes[closure.nodeB];
      if (!nodeA || !nodeB) return;

      const midLat = (nodeA.coords.lat + nodeB.coords.lat) / 2;
      const midLng = (nodeA.coords.lng + nodeB.coords.lng) / 2;

      const closureMarker = new window.google.maps.Marker({
        position: { lat: midLat, lng: midLng },
        map,
        title: `Closed: ${closure.title} - ${closure.reason}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#ef4444',
          fillOpacity: 0.9,
          scale: 6,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
        },
        zIndex: 110,
      });
      markersRef.current.push(closureMarker);
    });
  }, [
    isLoaded,
    locations,
    selectedLocation,
    selectedCategory,
    events,
    selectedEvent,
    friendShare,
    roadClosures,
    onSelectLocation,
    onSelectEvent,
    onSelectFriend,
  ]);

  // Handle Active Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    if (!activeRoute || activeRoute.status !== 'available' || activeRoute.pathCoordinates.length < 2) {
      return;
    }

    const path = activeRoute.pathCoordinates.map((pt) => ({
      lat: pt.lat,
      lng: pt.lng,
    }));

    const polyline = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#2563eb',
      strokeOpacity: 0.95,
      strokeWeight: 6,
      map,
      zIndex: 60,
    });

    routePolylineRef.current = polyline;

    // Fit map bounds to route upon creation if user is not currently navigating
    if (!isNavigating && path.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, {
        top: 60,
        bottom: 120,
        left: 40,
        right: 40,
      });
    }
  }, [isLoaded, activeRoute, isNavigating]);

  // Handle User Location Puck & Heading
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps || !userPosition) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      if (userAccuracyCircleRef.current) {
        userAccuracyCircleRef.current.setMap(null);
        userAccuracyCircleRef.current = null;
      }
      return;
    }

    const userCoord = {
      lat: userPosition.coords.latitude,
      lng: userPosition.coords.longitude,
    };

    // User GPS accuracy circle
    if (!userAccuracyCircleRef.current) {
      userAccuracyCircleRef.current = new window.google.maps.Circle({
        strokeColor: '#3b82f6',
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: '#60a5fa',
        fillOpacity: 0.15,
        map,
        center: userCoord,
        radius: userPosition.coords.accuracy || 15,
        zIndex: 40,
      });
    } else {
      userAccuracyCircleRef.current.setCenter(userCoord);
      userAccuracyCircleRef.current.setRadius(userPosition.coords.accuracy || 15);
    }

    // User directional arrow icon
    const rotation = heading !== null && !isNaN(heading) ? heading : 0;
    const arrowSymbol = {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: '#2563eb',
      fillOpacity: 1,
      scale: 5,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      rotation: rotation,
    };

    if (!userMarkerRef.current) {
      userMarkerRef.current = new window.google.maps.Marker({
        position: userCoord,
        map,
        title: 'Your Location',
        icon: arrowSymbol,
        zIndex: 200,
      });
    } else {
      userMarkerRef.current.setPosition(userCoord);
      userMarkerRef.current.setIcon(arrowSymbol);
    }

    // Auto-center camera if isFollowing is active
    if (isFollowing) {
      map.panTo(userCoord);
      if (isNavigating) {
        if (!isNorthUp && heading !== null && typeof map.setHeading === 'function') {
          map.setHeading(heading);
        }
      }
    }
  }, [isLoaded, userPosition, heading, isFollowing, isNavigating, isNorthUp]);

  // Recenter GPS Handler
  const handleRecenter = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    onSetIsFollowing?.(true);

    if (userPosition) {
      map.panTo({
        lat: userPosition.coords.latitude,
        lng: userPosition.coords.longitude,
      });
      map.setZoom(17);
    } else {
      map.panTo({
        lat: LPU_CAMPUS_CENTER.lat,
        lng: LPU_CAMPUS_CENTER.lng,
      });
      map.setZoom(16);
    }
  }, [userPosition, onSetIsFollowing]);

  // Toggle 2D / 3D Tilt in Google Maps
  const handleToggleTilt = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof map.setTilt !== 'function') return;

    if (mapTilt === 0) {
      map.setTilt(45);
      setMapTilt(45);
    } else {
      map.setTilt(0);
      setMapTilt(0);
    }
  }, [mapTilt]);

  // Zoom handlers
  const handleZoomIn = () => {
    const map = mapInstanceRef.current;
    if (map) map.setZoom(map.getZoom() + 1);
  };

  const handleZoomOut = () => {
    const map = mapInstanceRef.current;
    if (map) map.setZoom(map.getZoom() - 1);
  };

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden bg-slate-100">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Fallback Banner when API Key is unconfigured or failed */}
      {(!isLoaded || loadError) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Google Maps Platform Setup Required
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {loadError || 'Add your Google Maps API key to access real Google road networks, building outlines, and Places API.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={onOpenConfigModal}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-2xl shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure API Key</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              You can also switch to the <strong>2D</strong> or <strong>3D</strong> buttons in the top right to use the verified offline-ready campus map engine.
            </p>
          </div>
        </div>
      )}

      {/* On-Map Floating Controls (Apple Maps / Google Maps minimal style) */}
      {isLoaded && (
        <div className="absolute right-4 top-24 z-20 flex flex-col space-y-2 pointer-events-auto">
          {/* 2D / 3D Tilt Toggle */}
          <button
            type="button"
            onClick={handleToggleTilt}
            className={`w-10 h-10 rounded-2xl backdrop-blur-xl border shadow-lg flex items-center justify-center transition active:scale-95 ${
              mapTilt > 0
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-black/[0.06] dark:border-white/[0.08]'
            }`}
            title={mapTilt > 0 ? 'Switch to Flat 2D View' : 'Switch to 3D Tilted View'}
          >
            {mapTilt > 0 ? <Box className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          </button>

          {/* North-Up or Compass Heading */}
          {isNavigating && onToggleNorthUp && (
            <button
              type="button"
              onClick={onToggleNorthUp}
              className={`w-10 h-10 rounded-2xl backdrop-blur-xl border shadow-lg flex items-center justify-center transition active:scale-95 ${
                isNorthUp
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                  : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-black/[0.06] dark:border-white/[0.08]'
              }`}
              title={isNorthUp ? 'Following Movement Bearing' : 'Lock Map North Up'}
            >
              <Compass
                className="w-4 h-4 transition-transform duration-200"
                style={{ transform: `rotate(${-(heading || 0)}deg)` }}
              />
            </button>
          )}

          {/* Recenter GPS */}
          <button
            type="button"
            onClick={handleRecenter}
            className={`w-10 h-10 rounded-2xl backdrop-blur-xl border shadow-lg flex items-center justify-center transition active:scale-95 ${
              isFollowing
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-black/[0.06] dark:border-white/[0.08]'
            }`}
            title="Recenter Camera to My GPS"
          >
            <Navigation2 className="w-4 h-4" />
          </button>

          {/* Zoom In & Out */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-lg flex flex-col divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-10 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-10 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Google Maps Settings Gear */}
          <button
            type="button"
            onClick={onOpenConfigModal}
            className="w-10 h-10 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] text-slate-600 dark:text-slate-300 shadow-lg flex items-center justify-center hover:text-slate-900 dark:hover:text-white transition active:scale-95"
            title="Google Maps Platform Key & Security Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Notice for Building 41 Verified Entrance */}
      {selectedLocation?.id === 'building-41' && (
        <div className="absolute top-20 left-4 right-16 z-20 pointer-events-none">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-amber-500/90 backdrop-blur-md text-white text-xs font-medium shadow-lg">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Field-Verified Entrance: Boys Apartment Gate (31.251697, 75.701877)</span>
          </div>
        </div>
      )}
    </div>
  );
};
