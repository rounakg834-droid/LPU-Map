import React, { useRef, useState, useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';
import { setWorkerUrl, Map as MapLibreMap, Marker, MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Crucial: Route MapLibre Web Worker to static worker bundle with base path support
if (typeof window !== 'undefined') {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  setWorkerUrl(`${cleanBase}/maplibre-gl-worker.mjs`);
}

import {
  Compass,
  Plus,
  Minus,
  Crosshair,
} from 'lucide-react';
import { LPU_CAMPUS_CENTER, LPU_CAMPUS_BOUNDS } from '../../data/campusBounds';
import { campusRouteGraph } from '../../data/campusRouteGraph';
import { CampusLocation, LocationCategory } from '../../types/location';
import { GeoPosition, RoutePlan } from '../../types/navigation';
import { PublicCampusEvent } from '../../types/events';
import { RoadClosure } from '../../types/roadClosure';
import { LiveLocationShare } from '../../types/locationSharing';
import { authService } from '../../services/authService';
import { osmBuildingsService } from '../../services/osmBuildingsService';

// OpenFreeMap Liberty Vector Style URL
export const OPENFREEMAP_LIBERTY_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

// Resilient Fallback Raster Style if remote vector stylesheet is temporarily unreachable
const FALLBACK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'osm-raster': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors | LPU Smart Campus',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-raster-base',
      type: 'raster',
      source: 'osm-raster',
      minzoom: 0,
      paint: {
        'raster-saturation': -0.1,
        'raster-contrast': 0.05,
      },
    },
  ],
};

export interface CampusMapProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation) => void;
  userPosition: GeoPosition | null;
  isFollowing: boolean;
  onUserInteracted: () => void;
  onRecenterGps: () => void;
  heading: number | null;
  onRequestOrientationPermission: () => void;
  selectedCategory?: LocationCategory | 'all';
  activeRoute?: RoutePlan | null;
  isNavigating?: boolean;
  events?: PublicCampusEvent[];
  selectedEvent?: PublicCampusEvent | null;
  onSelectEvent?: (event: PublicCampusEvent) => void;
  showEvents?: boolean;
  onOpenEventsModal?: () => void;
  onOpenAdminModal?: () => void;
  friendShare?: LiveLocationShare | null;
  onSelectFriend?: () => void;
  roadClosures?: RoadClosure[];
  onSelectClosure?: (closure: RoadClosure) => void;
  onOpenShareModal?: () => void;
  onOpenEmergencyModal?: () => void;
  onOpenReportClosureModal?: () => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  userPosition,
  isFollowing,
  onUserInteracted,
  onRecenterGps,
  heading,
  selectedCategory = 'all',
  activeRoute = null,
  isNavigating = false,
  events = [],
  selectedEvent = null,
  onSelectEvent,
  showEvents = true,
  friendShare = null,
  onSelectFriend,
  roadClosures = [],
  onSelectClosure,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const userMarkerRef = useRef<Marker | null>(null);
  const userMarkerElementRef = useRef<HTMLDivElement | null>(null);
  const destinationMarkerRef = useRef<Marker | null>(null);
  const originMarkerRef = useRef<Marker | null>(null);
  const candidateMarkersRef = useRef<Marker[]>([]);
  const eventMarkersRef = useRef<Marker[]>([]);
  const friendMarkerRef = useRef<Marker | null>(null);
  const closureMarkersRef = useRef<Marker[]>([]);

  const [bearing, setBearing] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(17);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => authService.isAdmin());
  const [showAdminDebugLayer, setShowAdminDebugLayer] = useState<boolean>(false);
  const selectedFeatureIdRef = useRef<string | null>(null);

  useEffect(() => {
    const unsub = authService.subscribe(() => {
      setIsAdmin(authService.isAdmin());
    });
    return unsub;
  }, []);

  // 1. Initialize MapLibre GL 2D Map with OpenFreeMap Liberty Vector Basemap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter: [number, number] = selectedLocation?.coordinates
      ? [selectedLocation.coordinates.lng, selectedLocation.coordinates.lat]
      : [LPU_CAMPUS_CENTER.lng, LPU_CAMPUS_CENTER.lat];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OPENFREEMAP_LIBERTY_STYLE,
      center: initialCenter,
      zoom: selectedLocation ? 17.5 : 17,
      pitch: 0,
      maxPitch: 0, // Strict 2D Mode per requirement
      bearing: 0,
      minZoom: 13.8,
      maxZoom: 20,
      maxBounds: [
        [LPU_CAMPUS_BOUNDS.southWest.lng - 0.015, LPU_CAMPUS_BOUNDS.southWest.lat - 0.015],
        [LPU_CAMPUS_BOUNDS.northEast.lng + 0.015, LPU_CAMPUS_BOUNDS.northEast.lat + 0.015],
      ],
      attributionControl: false,
    });

    mapRef.current = map;

    // Track camera parameters
    map.on('rotate', () => setBearing(Math.round(map.getBearing())));
    map.on('zoom', () => setZoom(Number(map.getZoom().toFixed(1))));

    // Track user drag/pan to break GPS follow mode
    const handleDragStart = () => {
      onUserInteracted();
    };
    map.on('dragstart', handleDragStart);
    map.on('touchmove', handleDragStart);

    let isStyleConfigured = false;

    const setupLayers = () => {
      if (isStyleConfigured) return;
      isStyleConfigured = true;

      // A. OSM Highways Source & Layers
      const highwaysGeoJson = osmBuildingsService.getHighwaysGeoJson();
      if (!map.getSource('campus-osm-highways')) {
        map.addSource('campus-osm-highways', {
          type: 'geojson',
          data: highwaysGeoJson as any,
        });
      }

      // Campus Walkways / Footpaths
      if (!map.getLayer('campus-highways-walkways')) {
        map.addLayer({
          id: 'campus-highways-walkways',
          type: 'line',
          source: 'campus-osm-highways',
          filter: [
            'in',
            'highway',
            'footway',
            'pedestrian',
            'path',
            'living_street',
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#0284c7', // Cyan/Sky blue walkway
            'line-width': ['interpolate', ['linear'], ['zoom'], 14, 1.5, 17, 3, 19, 4.5],
            'line-dasharray': [2, 1.5],
            'line-opacity': 0.85,
          },
        });
      }

      // Campus Vehicular Roads Casing
      if (!map.getLayer('campus-highways-roads-casing')) {
        map.addLayer({
          id: 'campus-highways-roads-casing',
          type: 'line',
          source: 'campus-osm-highways',
          filter: [
            '!in',
            'highway',
            'footway',
            'pedestrian',
            'path',
            'living_street',
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#64748b',
            'line-width': ['interpolate', ['linear'], ['zoom'], 14, 3, 17, 5.5, 19, 8],
            'line-opacity': 0.55,
          },
        });
      }

      // Campus Vehicular Roads Core
      if (!map.getLayer('campus-highways-roads')) {
        map.addLayer({
          id: 'campus-highways-roads',
          type: 'line',
          source: 'campus-osm-highways',
          filter: [
            '!in',
            'highway',
            'footway',
            'pedestrian',
            'path',
            'living_street',
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#f8fafc',
            'line-width': ['interpolate', ['linear'], ['zoom'], 14, 1.8, 17, 3.8, 19, 6],
            'line-opacity': 0.95,
          },
        });
      }

      // B. OSM Building Footprints Source & Layers
      const buildingsGeoJson = osmBuildingsService.getBuildingsGeoJson();
      if (!map.getSource('campus-osm-buildings')) {
        map.addSource('campus-osm-buildings', {
          type: 'geojson',
          data: buildingsGeoJson as any,
          promoteId: 'id',
        });
      }

      // Building Fill Layer
      if (!map.getLayer('campus-buildings-fill')) {
        map.addLayer({
          id: 'campus-buildings-fill',
          type: 'fill',
          source: 'campus-osm-buildings',
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#3b82f6', // Selected building turns radiant blue
              ['boolean', ['feature-state', 'hover'], false],
              '#93c5fd', // Light blue hover
              ['==', ['get', 'hasOsmName'], true],
              '#e0e7ff', // Subtle indigo for named facilities
              '#f1f5f9', // Clean slate for unnamed building footprints
            ],
            'fill-opacity': 0.88,
          },
        });
      }

      // Building Outline Stroke Layer
      if (!map.getLayer('campus-buildings-line')) {
        map.addLayer({
          id: 'campus-buildings-line',
          type: 'line',
          source: 'campus-osm-buildings',
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#1d4ed8',
              ['==', ['get', 'hasOsmName'], true],
              '#818cf8',
              '#94a3b8',
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              2.5,
              1.2,
            ],
          },
        });
      }

      // Building Labels (Filtered exclusively to verified real OSM names!)
      if (!map.getLayer('campus-buildings-labels')) {
        map.addLayer({
          id: 'campus-buildings-labels',
          type: 'symbol',
          source: 'campus-osm-buildings',
          filter: ['==', ['get', 'hasOsmName'], true],
          minzoom: 15.5,
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Noto Sans Regular', 'Open Sans Regular'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 15.5, 10, 17, 11.5, 19, 13],
            'text-anchor': 'center',
            'text-max-width': 9,
            'text-allow-overlap': false,
          },
          paint: {
            'text-color': '#0f172a',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        });
      }

      // C. Active Turn-by-Turn Route Source & Layers
      if (!map.getSource('active-route')) {
        map.addSource('active-route', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        });
      }

      if (!map.getLayer('active-route-casing')) {
        map.addLayer({
          id: 'active-route-casing',
          type: 'line',
          source: 'active-route',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#1d4ed8',
            'line-width': ['interpolate', ['linear'], ['zoom'], 14, 5, 17, 9, 19, 12],
            'line-opacity': 0.6,
          },
        });
      }

      if (!map.getLayer('active-route-line')) {
        map.addLayer({
          id: 'active-route-line',
          type: 'line',
          source: 'active-route',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': ['interpolate', ['linear'], ['zoom'], 14, 3, 17, 6, 19, 8],
            'line-opacity': 0.95,
          },
        });
      }
    };

    map.on('load', setupLayers);

    // Fallback: If OpenFreeMap Liberty style network request fails, fall back to raster style
    map.on('error', (e) => {
      if (!isStyleConfigured && e?.error?.message?.includes('style')) {
        console.warn('OpenFreeMap style network error. Loading local fallback style:', e.error);
        map.setStyle(FALLBACK_STYLE);
        map.once('style.load', setupLayers);
      }
    });

    // Interactive building click handler: Displays location details panel
    map.on('click', 'campus-buildings-fill', (e: MapLayerMouseEvent) => {
      if (!e.features || e.features.length === 0) return;
      const feat = e.features[0];
      const props = feat.properties as any;
      const osmId = props.osmId;

      // Update feature selection state
      if (selectedFeatureIdRef.current) {
        map.setFeatureState(
          { source: 'campus-osm-buildings', id: selectedFeatureIdRef.current },
          { selected: false }
        );
      }
      if (feat.id) {
        selectedFeatureIdRef.current = String(feat.id);
        map.setFeatureState(
          { source: 'campus-osm-buildings', id: selectedFeatureIdRef.current },
          { selected: true }
        );
      }

      // Check if this building matches an existing verified location record
      const match = locations.find(
        (l) => l.id === props.id || l.id === `osm-bld-${osmId}` || (l as any).osmId === osmId
      );

      let centroidLat = e.lngLat.lat;
      let centroidLng = e.lngLat.lng;
      if (props.centroid) {
        try {
          const c = typeof props.centroid === 'string' ? JSON.parse(props.centroid) : props.centroid;
          centroidLng = c[0];
          centroidLat = c[1];
        } catch {}
      }

      const hasRealName = props.hasOsmName === true || props.hasOsmName === 'true';
      const name = props.name || (hasRealName ? props.name : `Campus Building (OSM Way ${osmId})`);
      const shortName = hasRealName ? props.name : `Building (Way ${osmId})`;

      const bldLocation: CampusLocation = match || {
        id: `osm-bld-${osmId}`,
        name,
        shortName,
        category: (props.category as any) || 'academic',
        coordinates: { lat: centroidLat, lng: centroidLng },
        verificationStatus: 'verified_osm',
        isVerified: hasRealName,
        description: hasRealName
          ? `Verified OpenStreetMap university facility: ${name}. Building type: ${props.buildingType || 'university'}.`
          : `Verified OpenStreetMap building footprint (Way ID: ${osmId}). Structure type: ${props.buildingType || 'building'}. Official university block numbering is pending on-ground survey.`,
        features: [
          `OSM Way ID: ${osmId}`,
          props.buildingType ? `Structure: ${props.buildingType}` : 'Verified Geographic Polygon',
          props.amenity ? `Amenity: ${props.amenity}` : 'OpenStreetMap Footprint',
        ],
        source: `OpenStreetMap Way ${osmId}`,
        tags: [name.toLowerCase(), 'building', props.buildingType || 'structure', 'osm', String(osmId)],
        roadConnectivityStatus: 'pending_verification',
      };

      onSelectLocation(bldLocation);
    });

    // Pointer cursor on hovering building footprints
    map.on('mouseenter', 'campus-buildings-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'campus-buildings-fill', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Render Verified Candidate Location Markers (Main Gate, Mittal Auditorium, Uni Health Center, UniMall)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    candidateMarkersRef.current.forEach((m) => m.remove());
    candidateMarkersRef.current = [];

    // Distinct verified candidates to permanently render:
    // 1. LPU Main Gate (31.260692, 75.706754)
    // 2. Sh. Baldevraj Mittal Auditorium (31.258514, 75.707878)
    // 3. Uni Health Center (31.258118, 75.706783)
    // 4. UniMall (31.25360, 75.70380)
    // 5. User-selected location (if not already one of the candidates)
    const candidatesToDisplay: CampusLocation[] = [];

    const mainGate = locations.find((l) => l.id === 'lpu-main-gate');
    if (mainGate && mainGate.coordinates) candidatesToDisplay.push(mainGate);

    const auditorium = locations.find((l) => l.id === 'baldevraj-mittal-auditorium');
    if (auditorium && auditorium.coordinates) candidatesToDisplay.push(auditorium);

    const healthCenter = locations.find((l) => l.id === 'uni-health-center');
    if (healthCenter && healthCenter.coordinates) candidatesToDisplay.push(healthCenter);

    const unimall = locations.find((l) => l.id === 'unimall');
    if (unimall && unimall.coordinates) candidatesToDisplay.push(unimall);

    if (
      selectedLocation &&
      selectedLocation.coordinates &&
      !candidatesToDisplay.some((c) => c.id === selectedLocation.id)
    ) {
      if (selectedLocation.id !== 'building-41' || selectedLocation.isEntranceConfirmed) {
        candidatesToDisplay.push(selectedLocation);
      }
    }

    candidatesToDisplay.forEach((loc) => {
      if (!loc.coordinates) return;
      if (selectedCategory !== 'all' && loc.category !== selectedCategory && selectedLocation?.id !== loc.id) {
        return;
      }

      const isSelected = selectedLocation?.id === loc.id;
      const el = document.createElement('div');
      el.className = 'group pointer-events-auto cursor-pointer transition-transform hover:scale-105';

      let bgColor = '#2563eb';
      let label = loc.shortName || loc.name;
      let iconSvg = `<svg class="w-3.5 h-3.5 text-white flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;

      if (loc.id === 'lpu-main-gate') {
        bgColor = '#059669';
        label = 'Main Gate';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M3 7v14M21 7v14M6 3h12a2 2 0 0 1 2 2v2H4V5a2 2 0 0 1 2-2zM9 11v6M15 11v6"/></svg>`;
      } else if (loc.id === 'baldevraj-mittal-auditorium') {
        bgColor = '#8b5cf6';
        label = 'Mittal Auditorium';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 10s3-3 3-8M22 10s-3-3-3-8M4 22h16M4 18h16m-11-4 3-3 3 3M12 11v7"/></svg>`;
      } else if (loc.id === 'uni-health-center') {
        bgColor = '#dc2626';
        label = 'Uni Health Center';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 6v12M6 12h12"/></svg>`;
      } else if (loc.id === 'unimall') {
        bgColor = '#d97706';
        label = 'UniMall';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>`;
      }

      el.innerHTML = `
        <div class="relative flex flex-col items-center">
          ${isSelected ? `<div class="absolute -inset-2 rounded-full animate-ping opacity-40" style="background-color: ${bgColor};"></div>` : ''}
          <div style="background-color: ${bgColor};" 
               class="px-2.5 py-1 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.35)] border-[1.5px] border-white flex items-center gap-1.5 text-white font-bold transition-all ${
                 isSelected ? 'scale-110 ring-4 ring-blue-400/50' : ''
               }">
            ${iconSvg}
            <span class="text-[11px] font-sans font-bold tracking-tight whitespace-nowrap leading-none">${label}</span>
          </div>
          <div style="border-top-color: ${bgColor};" class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] -mt-[0.5px]"></div>
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
        .setLngLat([loc.coordinates.lng, loc.coordinates.lat])
        .addTo(map);

      candidateMarkersRef.current.push(marker);
    });
  }, [locations, selectedLocation, selectedCategory, onSelectLocation]);

  // 3. User GPS Location Marker with Live Heading Beam
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPosition) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    const userLngLat: [number, number] = [userPosition.coords.longitude, userPosition.coords.latitude];

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center pointer-events-none select-none';
      el.innerHTML = `
        <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
        <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
        ${
          heading !== null
            ? `<div class="absolute -top-3 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-blue-600" style="transform: rotate(${heading}deg);"></div>`
            : ''
        }
      `;
      userMarkerElementRef.current = el;

      userMarkerRef.current = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(userLngLat)
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat(userLngLat);
      if (userMarkerElementRef.current && heading !== null) {
        const arrow = userMarkerElementRef.current.querySelector('.border-b-blue-600') as HTMLElement;
        if (arrow) {
          arrow.style.transform = `rotate(${heading}deg)`;
        }
      }
    }

    // Smoothly pan camera if following GPS
    if (isFollowing) {
      map.easeTo({
        center: userLngLat,
        duration: 800,
      });
    }
  }, [userPosition, heading, isFollowing]);

  // 4. Update Active Turn-by-Turn Route GeoJSON & Destination Pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }

    const routeSource = map.getSource('active-route') as maplibregl.GeoJSONSource;
    if (!routeSource) return;

    if (isNavigating && activeRoute && activeRoute.pathCoordinates.length > 0) {
      const coords = activeRoute.pathCoordinates.map((c) => [c.lng, c.lat]);

      routeSource.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coords,
            },
            properties: {},
          },
        ],
      });

      // Fit map to route bounds
      const bounds = coords.reduce(
        (b, coord) => b.extend(coord as [number, number]),
        new maplibregl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number])
      );
      map.fitBounds(bounds, {
        padding: { top: 120, bottom: 180, left: 40, right: 40 },
        duration: 1000,
        maxZoom: 18.5,
      });

      // Destination Pin
      const destCoords = activeRoute.destination.coordinates;
      if (destCoords) {
        const destEl = document.createElement('div');
        destEl.className = 'relative flex flex-col items-center pointer-events-none';
        destEl.innerHTML = `
          <div class="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-md border border-white">
            Target
          </div>
          <div class="w-0.5 h-2 bg-emerald-600"></div>
        `;
        destinationMarkerRef.current = new maplibregl.Marker({
          element: destEl,
          anchor: 'bottom',
        })
          .setLngLat([destCoords.lng, destCoords.lat])
          .addTo(map);
      }
    } else {
      routeSource.setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  }, [activeRoute, isNavigating]);

  // 5. Live Campus Events Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    eventMarkersRef.current.forEach((m) => m.remove());
    eventMarkersRef.current = [];

    if (!showEvents || events.length === 0) return;

    events.forEach((ev) => {
      if (!ev.coordinates) return;
      const isSelected = selectedEvent?.id === ev.id;
      const el = document.createElement('div');
      el.className = 'group pointer-events-auto cursor-pointer transition-transform hover:scale-110';
      el.innerHTML = `
        <div class="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold shadow-md border border-white flex items-center gap-1 ${
          isSelected ? 'ring-2 ring-purple-300 scale-105' : ''
        }">
          <span>🎪</span>
          <span>${ev.title.slice(0, 14)}</span>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEvent?.(ev);
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([ev.coordinates.lng, ev.coordinates.lat])
        .addTo(map);

      eventMarkersRef.current.push(marker);
    });
  }, [events, selectedEvent, showEvents, onSelectEvent]);

  // 6. Live Friend Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (friendMarkerRef.current) {
      friendMarkerRef.current.remove();
      friendMarkerRef.current = null;
    }

    if (!friendShare || !friendShare.coords) return;

    const el = document.createElement('div');
    el.className = 'group pointer-events-auto cursor-pointer transition-transform hover:scale-110';
    el.innerHTML = `
      <div class="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-md border border-white flex items-center gap-1">
        <span>👤</span>
        <span>${friendShare.creatorDisplayName}</span>
      </div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelectFriend?.();
    });

    friendMarkerRef.current = new maplibregl.Marker({
      element: el,
      anchor: 'center',
    })
      .setLngLat([friendShare.coords.lng, friendShare.coords.lat])
      .addTo(map);
  }, [friendShare, onSelectFriend]);

  // 7. Road Closures Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    closureMarkersRef.current.forEach((m) => m.remove());
    closureMarkersRef.current = [];

    roadClosures.forEach((closure) => {
      const nodeA = campusRouteGraph.nodes[closure.nodeA];
      const nodeB = campusRouteGraph.nodes[closure.nodeB];
      if (!nodeA || !nodeB) return;

      const midLat = (nodeA.coords.lat + nodeB.coords.lat) / 2;
      const midLng = (nodeA.coords.lng + nodeB.coords.lng) / 2;

      const el = document.createElement('div');
      el.className = 'group pointer-events-auto cursor-pointer transition-transform hover:scale-110';
      el.innerHTML = `
        <div class="p-1 rounded-full bg-rose-600 text-white shadow-md border border-white">
          <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3ZM12 9v4M12 17h.01"/></svg>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectClosure?.(closure);
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([midLng, midLat])
        .addTo(map);

      closureMarkersRef.current.push(marker);
    });
  }, [roadClosures, onSelectClosure]);

  // 8. Pan/Focus to Selected Location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLocation || !selectedLocation.coordinates) return;

    map.flyTo({
      center: [selectedLocation.coordinates.lng, selectedLocation.coordinates.lat],
      zoom: 17.8,
      duration: 1000,
    });
  }, [selectedLocation]);

  // 9. Camera Controls (Zoom, Bearing, Recenter)
  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 300 });
  };

  const handleResetBearing = () => {
    mapRef.current?.resetNorth({ duration: 400 });
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden select-none touch-pan-x touch-pan-y">
      {/* MapLibre WebGL Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/*
        Public 2D Candidate Marker Guard:
        {!isNavigating && (
          <LocationMarkers
        )}
      */}

      {/* 2D Mobile-First Tactical Controls */}
      <div className="absolute top-20 right-3 sm:right-6 z-20 pointer-events-auto flex flex-col items-end gap-2">
        {/* Admin Tactical Bar (Visible to authenticated administrators) */}
        {!isNavigating && isAdmin && (
          <button
            type="button"
            onClick={() => setShowAdminDebugLayer((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl border shadow-md transition active:scale-95 flex items-center space-x-1.5 ${
              showAdminDebugLayer
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-black/[0.08]'
            }`}
          >
            <span>OSM Debug</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-black/10">
              {showAdminDebugLayer ? 'ON' : 'OFF'}
            </span>
          </button>
        )}

        {/* Compass / Reset Bearing Button */}
        <button
          type="button"
          onClick={handleResetBearing}
          className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 transition active:scale-90"
          title="Reset North orientation"
        >
          <Compass
            className="w-5 h-5 text-rose-500 transition-transform duration-200"
            style={{ transform: `rotate(${-bearing}deg)` }}
          />
        </button>

        {/* Recenter GPS */}
        <button
          type="button"
          onClick={onRecenterGps}
          className={`w-10 h-10 rounded-full backdrop-blur-xl border shadow-lg flex items-center justify-center transition active:scale-90 ${
            isFollowing
              ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/30'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-black/[0.08] dark:border-white/[0.1]'
          }`}
          title="Recenter map on my GPS location"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full border border-black/[0.08] dark:border-white/[0.1] shadow-lg overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin OSM Debug Diagnostic Overlay */}
      {showAdminDebugLayer && (
        <div className="absolute bottom-24 left-3 right-3 sm:left-6 sm:max-w-md z-20 pointer-events-auto bg-slate-900/95 text-slate-100 p-3.5 rounded-2xl border border-amber-500/40 shadow-2xl backdrop-blur-xl text-xs space-y-1.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-amber-400">OpenFreeMap & OSM Live Engine</span>
            <span className="font-mono text-[10px] text-slate-400">Zoom: {zoom}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-slate-400 block">OSM Buildings:</span>
              <span className="font-semibold text-emerald-400">186 Real Polygons (24 Named)</span>
            </div>
            <div>
              <span className="text-slate-400 block">Basemap Engine:</span>
              <span className="font-semibold text-blue-400">OpenFreeMap Liberty Vector</span>
            </div>
            <div>
              <span className="text-slate-400 block">Highways / Paths:</span>
              <span className="font-semibold text-slate-200">153 Ways (322 Graph Segments)</span>
            </div>
            <div>
              <span className="text-slate-400 block">Map Perspective:</span>
              <span className="font-semibold text-slate-200">Strict 2D Mode (Pitch: 0°)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
