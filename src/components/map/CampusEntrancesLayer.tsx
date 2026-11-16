import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { CampusLocation } from '../../types/location';

interface CampusEntrancesLayerProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation) => void;
  isVisible?: boolean;
}

export const CampusEntrancesLayer: React.FC<CampusEntrancesLayerProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  isVisible = true,
}) => {
  if (!isVisible) return null;

  // Filter locations with distinct entrance coordinates
  const entranceLocations = locations.filter((loc) => {
    return Boolean(
      loc.entranceCoordinates ||
      (loc.proposedEntrance && loc.proposedEntrance.lat && loc.proposedEntrance.lng) ||
      loc.category === 'gate'
    );
  });

  const createEntranceIcon = (loc: CampusLocation, isSelected: boolean) => {
    const isB41 = loc.id === 'building-41';
    const isGate = loc.category === 'gate';
    const color = isB41 ? '#059669' : isGate ? '#0f766e' : '#2563eb';

    const label = isB41
      ? 'Gate 41'
      : isGate
      ? loc.shortName || 'Gate'
      : `${loc.blockNumber ? `B-${loc.blockNumber}` : ''} Gate`;

    const html = `
      <div class="relative group cursor-pointer flex flex-col items-center justify-center transition-transform ${isSelected ? 'scale-115' : 'hover:scale-105'}">
        <div style="background-color: ${color};"
             class="px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] border-[1.5px] border-white flex items-center space-x-1 text-white font-bold text-[10px] whitespace-nowrap">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
          </svg>
          <span>${label}</span>
        </div>
        <div style="border-top-color: ${color};" class="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4px] -mt-[0.5px]"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-entrance-gate-marker',
      iconSize: [80, 24],
      iconAnchor: [40, 24],
      tooltipAnchor: [0, -22],
    });
  };

  return (
    <>
      {entranceLocations.map((loc) => {
        const coords =
          loc.entranceCoordinates ||
          (loc.proposedEntrance ? { lat: loc.proposedEntrance.lat, lng: loc.proposedEntrance.lng } : null) ||
          loc.coordinates;

        if (!coords) return null;

        const isSelected = selectedLocation?.id === loc.id;
        const icon = createEntranceIcon(loc, isSelected);

        return (
          <Marker
            key={`entrance-${loc.id}`}
            position={[coords.lat, coords.lng]}
            icon={icon}
            zIndexOffset={isSelected ? 1200 : 150}
            eventHandlers={{
              click: () => onSelectLocation(loc),
            }}
          >
            <Tooltip direction="top" opacity={0.96} className="custom-map-tooltip">
              <div className="px-1.5 py-0.5 text-center font-sans">
                <span className="font-bold text-xs text-slate-800 block leading-tight">
                  {loc.id === 'building-41' ? 'Building 41 Entrance Gate' : `${loc.shortName || loc.name} Entrance Gate`}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium block">
                  {loc.id === 'building-41'
                    ? 'User-Provided Verified Entrance (Google Maps Ref)'
                    : 'Verified Pedestrian Navigation Target'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono block">
                  {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </span>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
};
