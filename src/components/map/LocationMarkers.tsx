import React, { useState, useEffect, useMemo } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CampusLocation, LocationCategory } from '../../types/location';

interface LocationMarkersProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation) => void;
  selectedCategory?: LocationCategory | 'all';
}

const CATEGORY_COLORS: Record<LocationCategory, string> = {
  academic: '#007AFF', // Apple Blue
  hostel_boys: '#0284c7', // Sky
  hostel_girls: '#e11d48', // Rose
  library: '#6366f1', // Indigo
  commercial: '#d97706', // Warm Amber
  auditorium_events: '#8b5cf6', // Violet
  cafeteria: '#ea580c', // Orange
  medical: '#ef4444', // Red
  sports: '#10b981', // Emerald
  parking: '#64748b', // Slate
  gate: '#059669', // Jade
  administration: '#0d9488', // Teal
};

// Clean, unambiguous marker pin labels
function getPinLabel(loc: CampusLocation): string {
  if (loc.id === 'gate-1') return 'G1';
  if (loc.id === 'gate-2') return 'G2';
  if (loc.id === 'gate-3') return 'G3';
  if (loc.id === 'central-library') return 'LIB';
  if (loc.id === 'unimall') return 'MALL';
  if (loc.id === 'unipolis') return 'POLIS';
  if (loc.id === 'unihospital') return 'HOSP';
  if (loc.id === 'sports-complex') return 'GYM';
  if (loc.id === 'cricket-stadium') return 'STAD';
  if (loc.id === 'main-gate-parking') return 'PKG';

  if (loc.blockNumber) {
    // BH-1 -> B1, GH-2 -> G2, Block 34 -> 34
    if (loc.blockNumber.startsWith('BH-')) return `B${loc.blockNumber.replace('BH-', '')}`;
    if (loc.blockNumber.startsWith('GH-')) return `G${loc.blockNumber.replace('GH-', '')}`;
    return loc.blockNumber.replace(/[^0-9]/g, '') || loc.blockNumber;
  }

  return loc.name.substring(0, 3).toUpperCase();
}

export const LocationMarkers: React.FC<LocationMarkersProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  selectedCategory = 'all',
}) => {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState<number>(map.getZoom());

  useEffect(() => {
    const handleZoomEnd = () => {
      setCurrentZoom(map.getZoom());
    };
    map.on('zoomend', handleZoomEnd);
    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map]);

  // Filter only locations with verified coordinates
  const validLocations = useMemo(() => {
    return locations.filter((loc) => loc.coordinates !== undefined);
  }, [locations]);

  // Level-of-Detail (LOD) & Overlap Prevention:
  // Dynamically filter markers by zoom tier, but always preserve selected place or filtered category
  const visibleLocations = useMemo(() => {
    return validLocations.filter((loc) => {
      // 1. Currently selected place is ALWAYS visible
      if (selectedLocation?.id === loc.id) return true;

      // 2. Active specific category filter ALWAYS displays all its items
      if (selectedCategory !== 'all' && loc.category === selectedCategory) return true;

      // 3. Zoom-dependent visibility tier:
      // Tier 1 (Campus Anchors): visible at zoom >= 14
      // Tier 2 (Academic Blocks & Main Zones): visible at zoom >= 16
      // Tier 3 (Individual Hostels & Kiosks): visible at zoom >= 17
      const requiredZoom = loc.minZoom || 17;
      return currentZoom >= requiredZoom;
    });
  }, [validLocations, selectedLocation, selectedCategory, currentZoom]);

  // Create custom marker icons scaled smoothly by zoom
  const createCustomIcon = (loc: CampusLocation, isSelected: boolean) => {
    const color = CATEGORY_COLORS[loc.category] || '#2563eb';
    const label = getPinLabel(loc);

    // Zoom-scaled Apple squircle marker sizes
    let size = 30;
    if (isSelected) {
      size = 38;
    } else if (currentZoom < 16) {
      size = 26;
    } else if (currentZoom === 16) {
      size = 30;
    } else {
      size = 34;
    }

    const anchorY = size;

    const html = `
      <div class="relative group cursor-pointer flex flex-col items-center justify-center transition-transform duration-200">
        ${
          isSelected
            ? `<div class="absolute -inset-2 rounded-2xl bg-blue-500/25 animate-ping"></div>`
            : ''
        }
        <div style="background-color: ${isSelected ? '#007AFF' : color}; width: ${size}px; height: ${size}px;" 
             class="rounded-[11px] shadow-[0_3px_10px_rgba(0,0,0,0.16)] border-[1.5px] border-white flex items-center justify-center text-white font-semibold transition-all duration-150 transform group-hover:scale-105 ${
               isSelected ? 'scale-110 ring-4 ring-blue-500/30 shadow-blue-500/40' : ''
             }">
          <span class="tracking-tight ${size < 28 ? 'text-[9px]' : size < 34 ? 'text-[10px]' : 'text-[11px]'} leading-none font-sans font-semibold">
            ${label}
          </span>
        </div>
        <div style="border-top-color: ${isSelected ? '#007AFF' : color};" class="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4px] -mt-[0.5px]"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-pin-marker',
      iconSize: [size, size + 4],
      iconAnchor: [size / 2, anchorY + 3],
      tooltipAnchor: [0, -anchorY - 2],
    });
  };

  // Distinct icon for pedestrian entrance gates (separate geographic object from building footprint)
  const createEntranceIcon = (isConfirmed: boolean) => {
    const color = isConfirmed ? '#059669' : '#d97706';
    const html = `
      <div class="relative group cursor-pointer flex flex-col items-center justify-center">
        <div style="background-color: ${color}; width: 28px; height: 28px;"
             class="rounded-[9px] shadow-[0_3px_10px_rgba(0,0,0,0.25)] border-[1.5px] border-white flex items-center justify-center text-white font-bold transition-all duration-150 transform group-hover:scale-110">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
          </svg>
        </div>
        <div style="border-top-color: ${color};" class="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4px] -mt-[0.5px]"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-entrance-marker',
      iconSize: [28, 32],
      iconAnchor: [14, 31],
      tooltipAnchor: [0, -29],
    });
  };

  return (
    <>
      {visibleLocations.map((loc) => {
        if (!loc.coordinates) return null;
        const isSelected = selectedLocation?.id === loc.id;
        const icon = createCustomIcon(loc, isSelected);

        const entranceCoord = loc.entranceCoordinates || (loc.proposedEntrance ? { lat: loc.proposedEntrance.lat, lng: loc.proposedEntrance.lng } : null);
        const isEntranceDistinct = entranceCoord && (
          Math.abs(entranceCoord.lat - loc.coordinates.lat) > 0.00005 ||
          Math.abs(entranceCoord.lng - loc.coordinates.lng) > 0.00005
        );

        return (
          <React.Fragment key={loc.id}>
            {/* Building Footprint / Centroid Pin */}
            <Marker
              position={[loc.coordinates.lat, loc.coordinates.lng]}
              icon={icon}
              zIndexOffset={isSelected ? 1000 : loc.minZoom === 14 ? 50 : 10}
              eventHandlers={{
                click: () => onSelectLocation(loc),
              }}
            >
              {/* Clean, non-colliding Tooltip with unambiguous concise info */}
              <Tooltip
                direction="top"
                offset={[0, -20]}
                opacity={0.96}
                className="custom-map-tooltip"
              >
                <div className="px-1.5 py-0.5 text-center font-sans">
                  <span className="font-semibold text-xs text-slate-800 block leading-tight">
                    {loc.shortName || loc.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium capitalize">
                    {loc.category.replace('_', ' ')} (Building Structure)
                  </span>
                </div>
              </Tooltip>
            </Marker>

            {/* Separate Pedestrian Entrance Gate Marker */}
            {isEntranceDistinct && entranceCoord && (isSelected || currentZoom >= 16 || loc.id === 'building-41') && (
              <Marker
                position={[entranceCoord.lat, entranceCoord.lng]}
                icon={createEntranceIcon(Boolean(loc.isEntranceConfirmed))}
                zIndexOffset={isSelected ? 1100 : 120}
                eventHandlers={{
                  click: () => onSelectLocation(loc),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -20]}
                  opacity={0.96}
                  className="custom-map-tooltip"
                >
                  <div className="px-1.5 py-0.5 text-center font-sans">
                    <span className="font-bold text-xs text-slate-800 block leading-tight">
                      {loc.shortName || loc.name} Entrance Gate
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium block">
                      {loc.isEntranceConfirmed ? 'Confirmed Pedestrian Gate' : 'Proposed Entrance (Pending Confirmation)'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      {entranceCoord.lat.toFixed(6)}, {entranceCoord.lng.toFixed(6)}
                    </span>
                  </div>
                </Tooltip>
              </Marker>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
