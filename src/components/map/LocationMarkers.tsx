import React, { useState, useEffect, useMemo } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CampusLocation, LocationCategory } from '../../types/location';
import { CAMPUS_LOCATIONS } from '../../data/locations';

interface LocationMarkersProps {
  locations?: CampusLocation[];
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
  if (loc.id === 'shanti-devi-auditorium') return 'SDM';
  if (loc.id === 'unihospital') return 'HOSP';
  if (loc.id === 'sports-complex') return 'GYM';
  if (loc.id === 'cricket-stadium') return 'STAD';
  if (loc.id === 'main-gate-parking') return 'PKG';
  if (loc.id === 'unimall-parking') return 'PKG';
  if (loc.id === 'unimall-food-court') return 'FOOD';
  if (loc.id === 'block-34-kiosk-cluster') return 'FOOD';
  if (loc.id === 'block-30-admin') return 'ADM';
  if (loc.id === 'building-41') return 'B41';
  if (loc.id === 'baldevraj-mittal-auditorium') return 'BMA';

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

  // Public 2D Foundation:
  // 1. Permanently display verified candidates: LPU Main Gate and Sh. Baldevraj Mittal Auditorium.
  // 2. Hide ALL old custom building number markers (34, 36, 38, BH-1, etc.) and unverified custom gate markers from public map.
  // 3. Only display an additional focused marker when the user explicitly selects a verified destination via search.
  // 4. Building 41 entrance coordinate is preserved in database, but public marker is hidden until approved.
  const visibleLocations = useMemo(() => {
    const list: CampusLocation[] = [];

    // Include user-confirmed candidates: LPU Main Gate and Sh. Baldevraj Mittal Auditorium
    const sourceList = locations && locations.length > 0 ? locations : CAMPUS_LOCATIONS;
    const mainGate = sourceList.find((l) => l.id === 'lpu-main-gate');
    if (mainGate && mainGate.coordinates) {
      list.push(mainGate);
    }

    const auditorium = sourceList.find((l) => l.id === 'baldevraj-mittal-auditorium');
    if (auditorium && auditorium.coordinates) {
      list.push(auditorium);
    }

    // Include user-selected location if active and not already added
    if (selectedLocation && selectedLocation.coordinates) {
      if (
        selectedLocation.id !== 'lpu-main-gate' &&
        selectedLocation.id !== 'baldevraj-mittal-auditorium'
      ) {
        // Preserve Building 41 in DB, but hide public marker until approved
        if (selectedLocation.id !== 'building-41' || selectedLocation.isEntranceConfirmed) {
          list.push(selectedLocation);
        }
      }
    }

    return list;
  }, [locations, selectedLocation]);

  // Create custom marker icons scaled smoothly by zoom
  const createCustomIcon = (loc: CampusLocation, isSelected: boolean) => {
    // Specialized prominent badge marker for LPU Main Gate candidate
    if (loc.id === 'lpu-main-gate') {
      const html = `
        <div class="relative group cursor-pointer flex flex-col items-center justify-center transition-transform duration-200">
          ${isSelected ? `<div class="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping"></div>` : ''}
          <div style="background-color: #059669;" 
               class="px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(5,150,105,0.45)] border-[1.5px] border-white flex items-center gap-1.5 text-white font-bold transition-all duration-150 transform group-hover:scale-105 ${
                 isSelected ? 'scale-110 ring-4 ring-emerald-400/50 shadow-emerald-600/50' : ''
               }">
            <svg class="w-3.5 h-3.5 text-white flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 21h18"/>
              <path d="M3 7v14"/>
              <path d="M21 7v14"/>
              <path d="M6 3h12a2 2 0 0 1 2 2v2H4V5a2 2 0 0 1 2-2z"/>
              <path d="M9 11v6"/>
              <path d="M15 11v6"/>
            </svg>
            <span class="text-[11px] font-sans font-bold tracking-tight whitespace-nowrap leading-none">Main Gate</span>
          </div>
          <div style="border-top-color: #059669;" class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] -mt-[0.5px]"></div>
        </div>
      `;

      return L.divIcon({
        html,
        className: 'main-gate-candidate-marker',
        iconSize: [96, 32],
        iconAnchor: [48, 31],
        tooltipAnchor: [0, -30],
      });
    }

    // Specialized prominent badge marker for Sh. Baldevraj Mittal Auditorium
    if (loc.id === 'baldevraj-mittal-auditorium') {
      const html = `
        <div class="relative group cursor-pointer flex flex-col items-center justify-center transition-transform duration-200">
          ${isSelected ? `<div class="absolute -inset-2 rounded-full bg-purple-500/35 animate-ping"></div>` : ''}
          <div style="background-color: #8b5cf6;" 
               class="px-2.5 py-1 rounded-full shadow-[0_4px_14px_rgba(139,92,246,0.5)] border-[1.5px] border-white flex items-center gap-1.5 text-white font-bold transition-all duration-150 transform group-hover:scale-105 ${
                 isSelected ? 'scale-110 ring-4 ring-purple-400/50 shadow-purple-600/50' : ''
               }">
            <svg class="w-3.5 h-3.5 text-white flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 10s3-3 3-8"/>
              <path d="M22 10s-3-3-3-8"/>
              <path d="M4 22h16"/>
              <path d="M4 18h16"/>
              <path d="m9 14 3-3 3 3"/>
              <path d="M12 11v7"/>
            </svg>
            <span class="text-[11px] font-sans font-bold tracking-tight whitespace-nowrap leading-none">Mittal Auditorium</span>
          </div>
          <div style="border-top-color: #8b5cf6;" class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] -mt-[0.5px]"></div>
        </div>
      `;

      return L.divIcon({
        html,
        className: 'auditorium-candidate-marker',
        iconSize: [142, 32],
        iconAnchor: [71, 31],
        tooltipAnchor: [0, -30],
      });
    }

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

  return (
    <>
      {visibleLocations.map((loc) => {
        if (!loc.coordinates) return null;
        const isSelected = selectedLocation?.id === loc.id;
        const icon = createCustomIcon(loc, isSelected);

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
                offset={
                  loc.id === 'lpu-main-gate' || loc.id === 'baldevraj-mittal-auditorium'
                    ? [0, -28]
                    : [0, -20]
                }
                opacity={0.96}
                className="custom-map-tooltip"
              >
                <div className="px-1.5 py-0.5 text-center font-sans">
                  <span className="font-semibold text-xs text-slate-800 block leading-tight">
                    {loc.shortName || loc.name}
                  </span>
                  <span className={`text-[10px] font-semibold capitalize ${
                    loc.verificationStatus === 'user_confirmed_candidate'
                      ? loc.category === 'auditorium_events' ? 'text-purple-600' : 'text-emerald-600'
                      : 'text-slate-500'
                  }`}>
                    {loc.verificationStatus === 'user_confirmed_candidate'
                      ? 'User-Confirmed Candidate'
                      : loc.category.replace('_', ' ')}
                  </span>
                </div>
              </Tooltip>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
};
