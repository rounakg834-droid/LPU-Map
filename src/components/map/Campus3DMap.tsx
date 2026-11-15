import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import { setWorkerUrl, Map as MapLibreMap, Marker, LngLatBounds, MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Crucial: Route MapLibre Web Worker to the static worker bundle with base path support
// This ensures WebGL geometry tessellation runs properly on both local dev and GitHub Pages (/LPU-Map/).
if (typeof window !== 'undefined') {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  setWorkerUrl(`${cleanBase}/maplibre-gl-worker.mjs`);
}

import {
  Compass,
  Plus,
  Minus,
  RotateCcw,
  Crosshair,
  Sparkles,
  Share2,
  ShieldAlert,
} from 'lucide-react';
import { LPU_CAMPUS_CENTER, LPU_CAMPUS_BOUNDS } from '../../data/campusBounds';
import { CAMPUS_3D_FOOTPRINTS } from '../../data/campus3DFootprints';
import { campusRouteGraph } from '../../data/campusRouteGraph';
import { CampusLocation, LocationCategory } from '../../types/location';
import { GeoPosition, RoutePlan } from '../../types/navigation';
import { PublicCampusEvent } from '../../types/events';
import { RoadClosure } from '../../types/roadClosure';
import { LiveLocationShare } from '../../types/locationSharing';

interface Campus3DMapProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation) => void;
  userPosition: GeoPosition | null;
  heading: number | null;
  selectedCategory?: LocationCategory | 'all';
  activeRoute?: RoutePlan | null;
  isNavigating?: boolean;
  isFollowing?: boolean;
  onSetIsFollowing?: (following: boolean) => void;
  snappedCoords?: { lat: number; lng: number } | null;
  roadBearing?: number;
  traveledCoords?: { lat: number; lng: number }[];
  remainingCoords?: { lat: number; lng: number }[];
  isNorthUp?: boolean;
  onToggleNorthUp?: () => void;
  events?: PublicCampusEvent[];
  selectedEvent?: PublicCampusEvent | null;
  onSelectEvent?: (event: PublicCampusEvent) => void;
  roadClosures?: RoadClosure[];
  onRecenterGps?: () => void;
  friendShare?: LiveLocationShare | null;
  onSelectFriend?: () => void;
  onOpenShareModal?: () => void;
  onOpenEmergencyModal?: () => void;
  onOpenEventsModal?: () => void;
}

export const Campus3DMap: React.FC<Campus3DMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  userPosition,
  heading,
  selectedCategory = 'all',
  activeRoute = null,
  isNavigating = false,
  isFollowing = true,
  onSetIsFollowing,
  snappedCoords = null,
  roadBearing = 0,
  traveledCoords = [],
  remainingCoords = [],
  isNorthUp = false,
  events = [],
  selectedEvent = null,
  onSelectEvent,
  roadClosures = [],
  onRecenterGps,
  friendShare = null,
  onSelectFriend,
  onOpenShareModal,
  onOpenEmergencyModal,
  onOpenEventsModal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const userMarkerElementRef = useRef<HTMLDivElement | null>(null);
  const destinationMarkerRef = useRef<Marker | null>(null);
  const friendMarkerRef = useRef<Marker | null>(null);
  const eventMarkersRef = useRef<Marker[]>([]);
  const buildingMarkersRef = useRef<Marker[]>([]);
  const entranceMarkersRef = useRef<Marker[]>([]);
  const closureMarkersRef = useRef<Marker[]>([]);

  const [bearing, setBearing] = useState<number>(-20);
  const [pitch, setPitch] = useState<number>(55);
  const [zoom, setZoom] = useState<number>(16.5);
  const [hoveredBuildingName, setHoveredBuildingName] = useState<string | null>(null);
  const selectedFeatureIdRef = useRef<string | null>(null);

  // 1. Initialize MapLibre GL 3D Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter: [number, number] = selectedLocation?.coordinates
      ? [selectedLocation.coordinates.lng, selectedLocation.coordinates.lat]
      : [LPU_CAMPUS_CENTER.lng, LPU_CAMPUS_CENTER.lat];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors | LPU 3D Campus',
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: 'osm-base-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            paint: {
              'raster-saturation': -0.15,
              'raster-contrast': 0.05,
              'raster-brightness-max': 0.96,
            },
          },
        ],
        light: {
          anchor: 'map',
          position: [1.5, 210, 32],
          color: '#ffffff',
          intensity: 0.75,
        },
      },
      center: initialCenter,
      zoom: selectedLocation ? 17.6 : 16.8,
      pitch: 60,
      bearing: -20,
      maxPitch: 80,
      minZoom: 14,
      maxZoom: 20,
      maxBounds: [
        [LPU_CAMPUS_BOUNDS.southWest.lng - 0.01, LPU_CAMPUS_BOUNDS.southWest.lat - 0.01],
        [LPU_CAMPUS_BOUNDS.northEast.lng + 0.01, LPU_CAMPUS_BOUNDS.northEast.lat + 0.01],
      ],
      attributionControl: false,
    });

    mapRef.current = map;

    // Track camera parameters for UI controls
    map.on('rotate', () => setBearing(Math.round(map.getBearing())));
    map.on('pitch', () => setPitch(Math.round(map.getPitch())));
    map.on('zoom', () => setZoom(Number(map.getZoom().toFixed(1))));

    // Detect manual user map pan/drag during navigation to allow free route exploration
    const handleUserDrag = () => {
      if (onSetIsFollowing) {
        onSetIsFollowing(false);
      }
    };
    map.on('dragstart', handleUserDrag);
    map.on('rotatestart', handleUserDrag);
    map.on('pitchstart', handleUserDrag);

    map.on('load', () => {
      // Add 3D Building Footprints GeoJSON Source
      map.addSource('campus-footprints', {
        type: 'geojson',
        data: CAMPUS_3D_FOOTPRINTS as any,
        promoteId: 'id',
      });

      // 1. Crisp ground foundation outline
      map.addLayer({
        id: 'campus-3d-buildings-base',
        type: 'line',
        source: 'campus-footprints',
        paint: {
          'line-color': 'rgba(15, 23, 42, 0.25)',
          'line-width': 1.5,
        },
      });

      // 2. Real volumetric 3D building fill-extrusions
      map.addLayer({
        id: 'campus-3d-buildings',
        type: 'fill-extrusion',
        source: 'campus-footprints',
        paint: {
          'fill-extrusion-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#007AFF', // High-contrast Apple Blue when selected
            ['boolean', ['feature-state', 'hovered'], false],
            '#38bdf8', // Luminous Sky Blue on hover
            ['get', 'color'],
          ],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'baseHeight'],
          'fill-extrusion-opacity': 0.98,
          'fill-extrusion-vertical-gradient': true,
        },
      });

      // Add Active Route GeoJSON Source with multi-segment styling
      map.addSource('active-route-3d', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Layer 1: White protective casing under route polyline (Google Maps style)
      map.addLayer({
        id: 'route-line-casing',
        type: 'line',
        source: 'active-route-3d',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 9,
          'line-opacity': 0.95,
        },
      });

      // Layer 2: Traveled route (dimmed gray-slate behind current user position)
      map.addLayer({
        id: 'route-line-traveled',
        type: 'line',
        source: 'active-route-3d',
        filter: ['==', ['get', 'segment'], 'traveled'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#94A3B8',
          'line-width': 5,
          'line-opacity': 0.8,
        },
      });

      // Layer 3: Remaining active route (vibrant Google Maps Blue #1A73E8)
      map.addLayer({
        id: 'route-line-remaining',
        type: 'line',
        source: 'active-route-3d',
        filter: ['!=', ['get', 'segment'], 'traveled'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#1A73E8',
          'line-width': 6,
          'line-opacity': 1.0,
        },
      });

      // Handle Building Click in 3D
      map.on('click', 'campus-3d-buildings', (e: MapLayerMouseEvent) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const buildingId = feature.properties?.id;

        if (buildingId) {
          const match = locations.find((l) => l.id === buildingId);
          if (match) {
            onSelectLocation(match);
          }
        }
      });

      // Handle Building Hover (Cursor & Floating Tooltip)
      let currentHoveredId: string | number | null = null;

      map.on('mousemove', 'campus-3d-buildings', (e: MapLayerMouseEvent) => {
        if (!e.features || e.features.length === 0) return;
        map.getCanvas().style.cursor = 'pointer';

        const feature = e.features[0];
        const featureId = feature.id ?? feature.properties?.id;
        const name = feature.properties?.name || feature.properties?.shortName;

        if (currentHoveredId !== featureId) {
          if (currentHoveredId !== null) {
            map.setFeatureState(
              { source: 'campus-footprints', id: currentHoveredId },
              { hovered: false }
            );
          }
          currentHoveredId = featureId;
          map.setFeatureState(
            { source: 'campus-footprints', id: featureId },
            { hovered: true }
          );
        }
        setHoveredBuildingName(name || null);
      });

      map.on('mouseleave', 'campus-3d-buildings', () => {
        map.getCanvas().style.cursor = '';
        if (currentHoveredId !== null) {
          map.setFeatureState(
            { source: 'campus-footprints', id: currentHoveredId },
            { hovered: false }
          );
          currentHoveredId = null;
        }
        setHoveredBuildingName(null);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Render Floating 3D Building Labels
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    buildingMarkersRef.current.forEach((m) => m.remove());
    buildingMarkersRef.current = [];

    const MAJOR_ANCHOR_IDS = new Set([
      'central-library',
      'unipolis',
      'unimall',
      'block-34',
      'block-36',
      'unihospital',
      'sports-complex',
      'gate-1',
    ]);

    const features = CAMPUS_3D_FOOTPRINTS.features.filter((f) => {
      if (selectedLocation?.id === f.properties.id) return true;
      if (selectedCategory !== 'all') return f.properties.category === selectedCategory;
      return MAJOR_ANCHOR_IDS.has(f.properties.id) || zoom >= 16.6;
    });

    features.forEach((f) => {
      const isSelected = selectedLocation?.id === f.properties.id;
      const el = document.createElement('div');
      el.className = 'group pointer-events-auto cursor-pointer transition-transform hover:scale-105';
      el.innerHTML = `
        <div class="px-2.5 py-1 rounded-full ${
          isSelected
            ? 'bg-slate-900 text-white shadow-md ring-2 ring-blue-500/50'
            : 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 backdrop-blur-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-black/[0.06] dark:border-white/[0.08]'
        } flex items-center space-x-1.5 text-[11px] font-medium whitespace-nowrap">
          <span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-slate-500'}"></span>
          <span>${f.properties.shortName}</span>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const match = locations.find((l) => l.id === f.properties.id);
        if (match) {
          onSelectLocation(match);
        }
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat(f.properties.center)
        .addTo(map);

      buildingMarkersRef.current.push(marker);
    });

    // 2b. Render Distinct Pedestrian Entrance Gate Markers
    entranceMarkersRef.current.forEach((m) => m.remove());
    entranceMarkersRef.current = [];

    locations.forEach((loc) => {
      const entrance =
        loc.entranceCoordinates ||
        (loc.proposedEntrance ? { lat: loc.proposedEntrance.lat, lng: loc.proposedEntrance.lng } : null);
      if (!entrance) return;

      const isConfirmed = Boolean(loc.isEntranceConfirmed);
      const isSelected = selectedLocation?.id === loc.id;

      const el = document.createElement('div');
      el.className = `group pointer-events-auto cursor-pointer transition-transform hover:scale-110 ${
        isSelected ? 'scale-125 z-30' : ''
      }`;
      el.innerHTML = `
        <div class="px-2.5 py-1 rounded-full ${
          isConfirmed
            ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/60'
            : 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-400/60'
        } ${
        isSelected ? 'ring-4 ring-white shadow-emerald-600/50' : ''
      } flex items-center space-x-1.5 text-[10px] font-bold whitespace-nowrap">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
          </svg>
          <span>${loc.blockNumber ? `B-${loc.blockNumber}` : ''} Gate</span>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectLocation(loc);
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat([entrance.lng, entrance.lat])
        .addTo(map);

      entranceMarkersRef.current.push(marker);
    });
  }, [selectedCategory, locations, onSelectLocation, selectedLocation]);

  // 3. Highlight Selected Building & Smooth 3D Camera Flight (Non-navigating mode)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || isNavigating) return;

    if (selectedFeatureIdRef.current) {
      try {
        map.setFeatureState(
          { source: 'campus-footprints', id: selectedFeatureIdRef.current },
          { selected: false }
        );
      } catch {}
      selectedFeatureIdRef.current = null;
    }

    if (!selectedLocation || !selectedLocation.coordinates) return;

    const matchedFeature = CAMPUS_3D_FOOTPRINTS.features.find(
      (f) => f.properties.id === selectedLocation.id
    );

    const targetCoords: [number, number] =
      selectedLocation.entranceCoordinates && matchedFeature
        ? [
            (selectedLocation.entranceCoordinates.lng + matchedFeature.properties.center[0]) / 2,
            (selectedLocation.entranceCoordinates.lat + matchedFeature.properties.center[1]) / 2,
          ]
        : selectedLocation.entranceCoordinates
        ? [selectedLocation.entranceCoordinates.lng, selectedLocation.entranceCoordinates.lat]
        : matchedFeature
        ? matchedFeature.properties.center
        : [selectedLocation.coordinates.lng, selectedLocation.coordinates.lat];

    if (matchedFeature) {
      selectedFeatureIdRef.current = matchedFeature.id;
      try {
        map.setFeatureState(
          { source: 'campus-footprints', id: matchedFeature.id },
          { selected: true }
        );
      } catch {}
    }

    map.flyTo({
      center: targetCoords,
      zoom: 18.2,
      pitch: 62,
      bearing: map.getBearing() || -15,
      speed: 1.2,
      curve: 1.4,
      essential: true,
    });
  }, [selectedLocation, isNavigating]);

  // 4. Synchronize Active Route Polyline (Traveled vs Remaining) and Destination Entrance Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource('active-route-3d') as maplibregl.GeoJSONSource;
    if (!source) return;

    if (!activeRoute || activeRoute.pathCoordinates.length < 2) {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      });
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
        destinationMarkerRef.current = null;
      }
      return;
    }

    const features: any[] = [];

    // Traveled segment (behind user)
    if (traveledCoords && traveledCoords.length > 1) {
      features.push({
        type: 'Feature',
        properties: { segment: 'traveled' },
        geometry: {
          type: 'LineString',
          coordinates: traveledCoords.map((c) => [c.lng, c.lat]),
        },
      });
    }

    // Remaining segment (ahead of user)
    if (remainingCoords && remainingCoords.length > 1) {
      features.push({
        type: 'Feature',
        properties: { segment: 'remaining' },
        geometry: {
          type: 'LineString',
          coordinates: remainingCoords.map((c) => [c.lng, c.lat]),
        },
      });
    } else {
      features.push({
        type: 'Feature',
        properties: { segment: 'remaining' },
        geometry: {
          type: 'LineString',
          coordinates: activeRoute.pathCoordinates.map((c) => [c.lng, c.lat]),
        },
      });
    }

    source.setData({
      type: 'FeatureCollection',
      features,
    });

    // Destination Entrance Pin in 3D
    const destEntrance =
      activeRoute.destination.entranceCoordinates || activeRoute.destination.coordinates;
    if (destEntrance) {
      if (!destinationMarkerRef.current) {
        const destEl = document.createElement('div');
        destEl.className = 'flex flex-col items-center pointer-events-none select-none z-30 animate-bounce';
        destEl.innerHTML = `
          <div class="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] shadow-2xl flex items-center gap-1 border-2 border-white">
            <span>🏁</span>
            <span>${activeRoute.destination.shortName || activeRoute.destination.name}</span>
          </div>
          <div class="w-1 h-3 bg-emerald-600 shadow-sm"></div>
        `;
        destinationMarkerRef.current = new maplibregl.Marker({
          element: destEl,
          anchor: 'bottom',
        })
          .setLngLat([destEntrance.lng, destEntrance.lat])
          .addTo(map);
      } else {
        destinationMarkerRef.current.setLngLat([destEntrance.lng, destEntrance.lat]);
      }
    }

    // On initial navigation launch, frame route preview
    if (!isNavigating && activeRoute.pathCoordinates.length > 1) {
      const bounds = activeRoute.pathCoordinates.reduce(
        (b, coord) => b.extend([coord.lng, coord.lat]),
        new LngLatBounds(
          [activeRoute.pathCoordinates[0].lng, activeRoute.pathCoordinates[0].lat],
          [activeRoute.pathCoordinates[0].lng, activeRoute.pathCoordinates[0].lat]
        )
      );

      map.fitBounds(bounds, {
        padding: { top: 100, bottom: 200, left: 60, right: 60 },
        pitch: 45,
        maxZoom: 18,
        duration: 1000,
      });
    }
  }, [activeRoute, traveledCoords, remainingCoords, isNavigating]);

  // 5. Google Maps Navigation Directional Arrow / Chevron Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userPosition) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
        userMarkerElementRef.current = null;
      }
      return;
    }

    const { latitude, longitude, speed, heading: gpsHeading } = userPosition.coords;
    const effectiveCoords = snappedCoords || { lat: latitude, lng: longitude };
    const userLngLat: [number, number] = [effectiveCoords.lng, effectiveCoords.lat];

    // Calculate reliable movement heading vs stationary stabilization
    let reliableBearing = 0;
    const isMovingAtSpeed = speed !== null && speed !== undefined && speed >= 0.8 && gpsHeading !== null && !isNaN(gpsHeading);

    if (isMovingAtSpeed) {
      reliableBearing = gpsHeading!;
    } else if (roadBearing !== undefined && !isNaN(roadBearing)) {
      reliableBearing = roadBearing;
    } else if (heading !== null && !isNaN(heading)) {
      reliableBearing = heading;
    }

    if (isNavigating) {
      // Navigation Mode: 3D Directional Blue Chevron with White Casing & Shadow
      if (!userMarkerRef.current || !userMarkerElementRef.current?.classList.contains('nav-arrow-marker')) {
        if (userMarkerRef.current) userMarkerRef.current.remove();

        const el = document.createElement('div');
        el.className = 'nav-arrow-marker relative flex items-center justify-center pointer-events-none select-none';
        el.innerHTML = `
          <!-- Accuracy Halo ring -->
          <div class="absolute w-14 h-14 rounded-full bg-blue-500/15 border border-blue-400/30 animate-pulse"></div>
          <!-- 3D Directional Navigation Chevron -->
          <div class="relative w-10 h-10 flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform duration-200">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <!-- Crisp White Outer Casing -->
              <path d="M20 3L35 34L20 27L5 34L20 3Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>
              <!-- Vibrant Google Maps Blue Chevron Left Wing -->
              <path d="M20 5.5L32.5 32L20 26L7.5 32L20 5.5Z" fill="#1A73E8"/>
              <!-- Shaded Right Wing for authentic 3D lighting -->
              <path d="M20 5.5L32.5 32L20 26V5.5Z" fill="#1557B0" opacity="0.4"/>
              <!-- Central core point -->
              <circle cx="20" cy="20" r="2.5" fill="#FFFFFF" opacity="0.9"/>
            </svg>
          </div>
        `;

        userMarkerElementRef.current = el;
        userMarkerRef.current = new maplibregl.Marker({
          element: el,
          anchor: 'center',
          rotationAlignment: 'map', // Rotates natively in geographic coordinates
        })
          .setLngLat(userLngLat)
          .setRotation(reliableBearing)
          .addTo(map);
      } else {
        userMarkerRef.current.setLngLat(userLngLat);
        userMarkerRef.current.setRotation(reliableBearing);
      }
    } else {
      // Normal Browse Mode: Clean Apple Maps Pulsing Blue Location Dot
      if (!userMarkerRef.current || userMarkerElementRef.current?.classList.contains('nav-arrow-marker')) {
        if (userMarkerRef.current) userMarkerRef.current.remove();

        const el = document.createElement('div');
        el.className = 'browse-dot-marker relative flex items-center justify-center';
        el.innerHTML = `
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        `;

        userMarkerElementRef.current = el;
        userMarkerRef.current = new maplibregl.Marker({
          element: el,
          anchor: 'center',
          rotationAlignment: 'viewport',
        })
          .setLngLat(userLngLat)
          .addTo(map);
      } else {
        userMarkerRef.current.setLngLat(userLngLat);
      }
    }
  }, [userPosition, heading, snappedCoords, roadBearing, isNavigating]);

  // 6. Navigation Camera: Forward-Facing 3D Perspective Following (Google Maps Style)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isNavigating || !isFollowing) return;

    const currentCoords = snappedCoords || (userPosition ? {
      lat: userPosition.coords.latitude,
      lng: userPosition.coords.longitude,
    } : null);

    if (!currentCoords) return;

    // Determine reliable camera bearing:
    // If North-Up mode, keep bearing = 0.
    // If Heading-Up mode, rotate with reliable movement heading or road segment bearing.
    let navBearing = 0;
    if (!isNorthUp) {
      const speed = userPosition?.coords.speed;
      const gpsHeading = userPosition?.coords.heading;
      if (speed !== null && speed !== undefined && speed >= 0.8 && gpsHeading !== null && gpsHeading !== undefined && !isNaN(gpsHeading)) {
        navBearing = gpsHeading;
      } else if (roadBearing !== undefined && !isNaN(roadBearing)) {
        navBearing = roadBearing;
      } else if (heading !== null && !isNaN(heading)) {
        navBearing = heading;
      }
    }

    // Offset camera padding so user is placed in lower-third of screen (~30% from bottom),
    // presenting an expansive forward-facing view of the route ahead with 3D buildings.
    map.easeTo({
      center: [currentCoords.lng, currentCoords.lat],
      pitch: isNorthUp ? 0 : 58,
      bearing: isNorthUp ? 0 : navBearing,
      zoom: 18.2,
      padding: isNorthUp
        ? { top: 0, bottom: 0, left: 0, right: 0 }
        : { top: 60, bottom: 220, left: 20, right: 20 },
      duration: 500,
      easing: (t) => t,
    });
  }, [
    isNavigating,
    isFollowing,
    snappedCoords,
    userPosition,
    roadBearing,
    heading,
    isNorthUp,
  ]);

  // 7. Live Friend Marker in 3D (Meet My Friend)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!friendShare || friendShare.revoked || new Date(friendShare.expiresAt).getTime() <= Date.now()) {
      if (friendMarkerRef.current) {
        friendMarkerRef.current.remove();
        friendMarkerRef.current = null;
      }
      return;
    }

    const { lat, lng } = friendShare.coords;
    const friendLngLat: [number, number] = [lng, lat];

    if (!friendMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'cursor-pointer transform hover:scale-125 transition-transform flex flex-col items-center';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 rounded-full bg-emerald-500/40 animate-ping"></div>
          <div class="relative w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 border-2 border-white shadow-xl flex items-center justify-center text-white font-extrabold text-xs">
            ${friendShare.creatorDisplayName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div class="mt-1 px-2 py-0.5 rounded-full bg-slate-900/90 text-white font-bold text-[10px] shadow-md border border-slate-700/60 whitespace-nowrap">
          ${friendShare.creatorDisplayName} (Friend)
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onSelectFriend) onSelectFriend();
      });

      friendMarkerRef.current = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(friendLngLat)
        .addTo(map);
    } else {
      friendMarkerRef.current.setLngLat(friendLngLat);
    }
  }, [friendShare, onSelectFriend]);

  // 8. Live Campus Events Markers in 3D
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    eventMarkersRef.current.forEach((m) => m.remove());
    eventMarkersRef.current = [];

    events.forEach((ev) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer transform hover:scale-125 transition-transform';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-6 h-6 rounded-full bg-purple-500/40 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 border border-white shadow-md flex items-center justify-center text-white text-[9px] font-bold">
            ★
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onSelectEvent) onSelectEvent(ev);
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([ev.coordinates.lng, ev.coordinates.lat])
        .addTo(map);

      eventMarkersRef.current.push(marker);
    });
  }, [events, onSelectEvent]);

  // 9. Focus Camera on Selected Event in 3D
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedEvent || !selectedEvent.coordinates || isNavigating) return;
    map.flyTo({
      center: [selectedEvent.coordinates.lng, selectedEvent.coordinates.lat],
      zoom: 17.5,
      pitch: 55,
      duration: 1000,
    });
  }, [selectedEvent, isNavigating]);

  // 10. Render Road Closures & Obstacles in 3D
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    closureMarkersRef.current.forEach((m) => m.remove());
    closureMarkersRef.current = [];

    roadClosures.forEach((closure) => {
      const nodeA = campusRouteGraph.nodes[closure.nodeA];
      const nodeB = campusRouteGraph.nodes[closure.nodeB];
      if (!nodeA || !nodeB) return;
      const midLng = (nodeA.coords.lng + nodeB.coords.lng) / 2;
      const midLat = (nodeA.coords.lat + nodeB.coords.lat) / 2;

      const el = document.createElement('div');
      el.className = 'cursor-pointer transform hover:scale-110 transition-transform';
      el.innerHTML = `
        <div class="px-2 py-0.5 rounded-full bg-red-600/90 text-white font-bold text-[10px] shadow-md flex items-center space-x-1 border border-white">
          <span>⚠️</span>
          <span>Road Closed</span>
        </div>
      `;
      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([midLng, midLat])
        .addTo(map);

      closureMarkersRef.current.push(marker);
    });
  }, [roadClosures]);

  // Tactical Controls Handlers
  const handleResetNorth = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      bearing: 0,
      pitch: isNavigating ? 0 : 60,
      duration: 600,
    });
  }, [isNavigating]);

  const handleTogglePitch = useCallback(() => {
    if (!mapRef.current) return;
    const newPitch = pitch > 30 ? 0 : 62;
    mapRef.current.easeTo({
      pitch: newPitch,
      duration: 600,
    });
  }, [pitch]);

  const handleZoomIn = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.zoomIn({ duration: 300 });
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.zoomOut({ duration: 300 });
  }, []);

  const handleRecenterCampus = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [LPU_CAMPUS_CENTER.lng, LPU_CAMPUS_CENTER.lat],
      zoom: 16.8,
      pitch: 60,
      bearing: -20,
      duration: 1000,
    });
  }, []);

  const handleRecenterGpsPosition = useCallback(() => {
    if (userPosition && mapRef.current) {
      const coords = snappedCoords || {
        lat: userPosition.coords.latitude,
        lng: userPosition.coords.longitude,
      };
      mapRef.current.flyTo({
        center: [coords.lng, coords.lat],
        zoom: 18.2,
        pitch: isNavigating && !isNorthUp ? 58 : 60,
        bearing: isNavigating && !isNorthUp ? (roadBearing || 0) : 0,
        padding: isNavigating && !isNorthUp
          ? { top: 60, bottom: 220, left: 20, right: 20 }
          : { top: 0, bottom: 0, left: 0, right: 0 },
        duration: 800,
      });
    }
    if (onSetIsFollowing) onSetIsFollowing(true);
    if (onRecenterGps) onRecenterGps();
  }, [userPosition, snappedCoords, isNavigating, isNorthUp, roadBearing, onSetIsFollowing, onRecenterGps]);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Building Hover Pill */}
      {hoveredBuildingName && !isNavigating && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900/85 text-white backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-slate-700/50 flex items-center space-x-1.5 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{hoveredBuildingName}</span>
          </div>
        </div>
      )}

      {/* 1. Apple Maps Top Utility Capsule (Events, SOS, Share) - Hidden during Navigation */}
      {!isNavigating && (
        <div className="fixed top-28 right-3 sm:right-6 z-20 pointer-events-auto flex items-center gap-1.5 animate-in fade-in duration-300">
          <div className="inline-flex items-center p-1 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-full border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            {/* Emergency Assistance SOS */}
            {onOpenEmergencyModal && (
              <button
                onClick={onOpenEmergencyModal}
                aria-label="Emergency SOS"
                title="Campus Emergency Assistance & SOS"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-bold tracking-tight">SOS</span>
              </button>
            )}

            {/* Campus Events */}
            {onOpenEventsModal && (
              <button
                onClick={onOpenEventsModal}
                aria-label="Campus Events"
                title="Campus Events & Fests"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Events</span>
              </button>
            )}

            {/* Share Live Location */}
            {onOpenShareModal && (
              <button
                onClick={onOpenShareModal}
                aria-label="Share Location"
                title="Share Live Location via WhatsApp"
                className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 active:scale-95 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Apple Maps Unified Vertical 3D Navigation Capsule - Minimized when Navigating */}
      <div
        className={`fixed right-3 sm:right-6 ${
          isNavigating ? 'bottom-28' : 'bottom-20 md:bottom-8'
        } z-30 pointer-events-auto transition-all duration-300 ease-out`}
      >
        <div className="w-10 sm:w-11 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col items-center overflow-hidden py-1">
          {/* Compass with needle */}
          <button
            onClick={handleResetNorth}
            className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 active:scale-95 transition-all focus:outline-none"
            title={`Compass: ${bearing}° (Reset North)`}
          >
            <Compass
              className="w-5 h-5 text-red-500 transition-transform duration-200"
              style={{ transform: `rotate(${-bearing}deg)` }}
            />
          </button>

          {!isNavigating && (
            <>
              <div className="w-6 h-px bg-black/[0.05] dark:bg-white/[0.08] my-0.5" />

              {/* 3D Tilt / Pitch Perspective */}
              <button
                onClick={handleTogglePitch}
                className={`w-10 h-8 flex items-center justify-center text-xs font-semibold transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/60 active:scale-95 ${
                  pitch > 30 ? 'text-[#007AFF] font-bold' : 'text-slate-600 dark:text-slate-300'
                }`}
                title={`Perspective: ${pitch}° (Toggle 3D / 2D perspective)`}
              >
                <span>{pitch > 30 ? '3D' : '2D'}</span>
              </button>
            </>
          )}

          {/* Recenter User GPS */}
          {userPosition && (
            <>
              <div className="w-6 h-px bg-black/[0.05] dark:bg-white/[0.08] my-0.5" />
              <button
                onClick={handleRecenterGpsPosition}
                className="w-10 h-10 flex items-center justify-center text-[#007AFF] hover:bg-slate-100/60 dark:hover:bg-slate-800/60 active:scale-95 transition-all focus:outline-none"
                title="Recenter My Location"
              >
                <Crosshair className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </>
          )}

          {!isNavigating && (
            <>
              <div className="w-6 h-px bg-black/[0.05] dark:bg-white/[0.08] my-0.5" />

              {/* Recenter Campus Overview */}
              <button
                onClick={handleRecenterCampus}
                className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 active:scale-95 transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/60 focus:outline-none"
                title="Recenter LPU Campus"
              >
                <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </>
          )}

          <div className="w-6 h-px bg-black/[0.05] dark:bg-white/[0.08] my-0.5" />

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="w-10 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 active:scale-95 transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/60 focus:outline-none"
            title="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>

          <div className="w-6 h-px bg-black/[0.05] dark:bg-white/[0.08] my-0.5" />

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="w-10 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 active:scale-95 transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/60 focus:outline-none"
            title="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Mode Visual Badge / Footprint Attribution (Hidden during Navigation) */}
      {!isNavigating && (
        <div className="absolute bottom-20 left-3 z-20 pointer-events-none hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.08] text-slate-500 dark:text-slate-400 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>3D WebGL • Pitch {pitch}° • Bearing {bearing}° • Zoom {zoom}</span>
        </div>
      )}
    </div>
  );
};