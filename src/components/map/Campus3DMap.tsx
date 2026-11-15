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
  ShieldAlert
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
  const friendMarkerRef = useRef<Marker | null>(null);
  const eventMarkersRef = useRef<Marker[]>([]);
  const buildingMarkersRef = useRef<Marker[]>([]);
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
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
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
          anchor: 'map', // Fixed geographic coordinate lighting creates real dynamic wall shadows as camera orbits
          position: [1.5, 210, 32], // Sun at 210° azimuth, 32° polar elevation
          color: '#ffffff',
          intensity: 0.75,
        },
      },
      center: initialCenter,
      zoom: selectedLocation ? 17.6 : 16.8,
      pitch: 60, // 60° pitch for prominent 3D architectural perspective
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

    map.on('load', () => {
      // Add 3D Building Footprints GeoJSON Source
      map.addSource('campus-footprints', {
        type: 'geojson',
        data: CAMPUS_3D_FOOTPRINTS as any,
        promoteId: 'id', // Uses feature ID directly for feature-state selection & hover
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

      // Add Active Route GeoJSON Source and Layer
      map.addSource('active-route-3d', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Outer glowing halo for 3D route
      map.addLayer({
        id: 'route-line-halo',
        type: 'line',
        source: 'active-route-3d',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#60a5fa',
          'line-width': 9,
          'line-opacity': 0.6,
        },
      });

      // Core crisp polyline for 3D route
      map.addLayer({
        id: 'route-line-core',
        type: 'line',
        source: 'active-route-3d',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#1d4ed8',
          'line-width': 5,
          'line-opacity': 0.95,
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
  }, [selectedCategory, locations, onSelectLocation]);

  // 3. Highlight Selected Building & Smooth 3D Camera Flight
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

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

    const targetCoords: [number, number] = matchedFeature
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
  }, [selectedLocation]);

  // 4. Synchronize Active Route Polyline in 3D
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
      return;
    }

    const routeCoords: [number, number][] = activeRoute.pathCoordinates.map((c: { lng: number; lat: number }) => [c.lng, c.lat]);

    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoords,
          },
        },
      ],
    });

    if (isNavigating && routeCoords.length > 1) {
      const bounds = routeCoords.reduce(
        (b, coord) => b.extend(coord),
        new LngLatBounds(routeCoords[0], routeCoords[0])
      );

      map.fitBounds(bounds, {
        padding: { top: 120, bottom: 220, left: 60, right: 60 },
        pitch: 50,
        maxZoom: 18,
        duration: 1000,
      });
    }
  }, [activeRoute, isNavigating]);

  // 5. Live GPS Marker with Heading Cone in 3D
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userPosition) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    const { latitude, longitude } = userPosition.coords;
    const userLngLat: [number, number] = [longitude, latitude];

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center';
      el.innerHTML = `
        <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
        <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
      `;

      userMarkerRef.current = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(userLngLat)
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat(userLngLat);
    }
  }, [userPosition, heading]);

  // 6. Live Friend Marker in 3D (Meet My Friend - Phase 7)
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

  // 7. Live Campus Events Markers in 3D
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

  // 8. Focus Camera on Selected Event in 3D
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedEvent || !selectedEvent.coordinates) return;
    map.flyTo({
      center: [selectedEvent.coordinates.lng, selectedEvent.coordinates.lat],
      zoom: 17.5,
      pitch: 55,
      duration: 1000,
    });
  }, [selectedEvent]);

  // 9. Render Road Closures & Obstacles in 3D
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

  // 10. Tactical Controls Handlers
  const handleResetNorth = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      bearing: 0,
      pitch: 60,
      duration: 800,
    });
  }, []);

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
      mapRef.current.flyTo({
        center: [userPosition.coords.longitude, userPosition.coords.latitude],
        zoom: 18,
        pitch: 60,
        duration: 1000,
      });
    }
    if (onRecenterGps) onRecenterGps();
  }, [userPosition, onRecenterGps]);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Building Hover Pill */}
      {hoveredBuildingName && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900/85 text-white backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-slate-700/50 flex items-center space-x-1.5 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{hoveredBuildingName}</span>
          </div>
        </div>
      )}

      {/* 1. Apple Maps Top Utility Capsule (Events, SOS, Share) */}
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

      {/* 2. Apple Maps Unified Vertical 3D Navigation Capsule */}
      <div className="fixed right-3 sm:right-6 bottom-20 md:bottom-8 z-30 pointer-events-auto transition-all duration-300 ease-out">
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

          <div className="w-6 h-px bg-black/[0.05] dark:bg-white/[0.08] my-0.5" />

          {/* Recenter User GPS */}
          {userPosition && (
            <>
              <button
                onClick={handleRecenterGpsPosition}
                className="w-10 h-10 flex items-center justify-center text-[#007AFF] hover:bg-slate-100/60 dark:hover:bg-slate-800/60 active:scale-95 transition-all focus:outline-none"
                title="Recenter My Location"
              >
                <Crosshair className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
              <div className="w-6 h-px bg-black/[0.05] dark:bg-white/[0.08] my-0.5" />
            </>
          )}

          {/* Recenter Campus Overview */}
          <button
            onClick={handleRecenterCampus}
            className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 active:scale-95 transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/60 focus:outline-none"
            title="Recenter LPU Campus"
          >
            <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>

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

      {/* 3D Mode Visual Badge / Footprint Attribution */}
      <div className="absolute bottom-20 left-3 z-20 pointer-events-none hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.08] text-slate-500 dark:text-slate-400 text-[10px]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>3D WebGL • Pitch {pitch}° • Bearing {bearing}° • Zoom {zoom}</span>
      </div>
    </div>
  );
};
