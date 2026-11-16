import React from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { ROAD_VERIFICATION_POINT } from '../../data/roadVerification';

interface RoadVerificationPointMarkerProps {
  isVisible: boolean;
  onSelect?: () => void;
}

export const RoadVerificationPointMarker: React.FC<RoadVerificationPointMarkerProps> = ({
  isVisible,
  onSelect,
}) => {
  if (!isVisible) return null;

  const { coordinates, nearestOsmSegment, nearestJunction, sectorSummary } = ROAD_VERIFICATION_POINT;

  const html = `
    <div class="relative group cursor-pointer flex flex-col items-center justify-center transition-transform duration-200">
      <div class="absolute -inset-2.5 rounded-full bg-amber-500/35 animate-ping"></div>
      <div style="background-color: #d97706;" 
           class="px-2.5 py-1 rounded-full shadow-[0_4px_14px_rgba(217,119,6,0.5)] border-[1.5px] border-white flex items-center gap-1.5 text-white font-bold transition-all duration-150 transform group-hover:scale-105 ring-4 ring-amber-400/40">
        <svg class="w-3.5 h-3.5 text-white flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="22" y1="12" x2="18" y2="12"/>
          <line x1="6" y1="12" x2="2" y2="12"/>
          <line x1="12" y1="6" x2="12" y2="2"/>
          <line x1="12" y1="22" x2="12" y2="18"/>
        </svg>
        <span class="text-[11px] font-sans font-bold tracking-tight whitespace-nowrap leading-none">Road Verification Point</span>
      </div>
      <div style="border-top-color: #d97706;" class="w-0 h-0 border-l-[4.5px] border-l-transparent border-r-[4.5px] border-r-transparent border-t-[5.5px] -mt-[0.5px]"></div>
    </div>
  `;

  const icon = L.divIcon({
    html,
    className: 'admin-road-verification-marker',
    iconSize: [168, 32],
    iconAnchor: [84, 31],
    popupAnchor: [0, -32],
    tooltipAnchor: [0, -30],
  });

  return (
    <Marker
      position={[coordinates.lat, coordinates.lng]}
      icon={icon}
      zIndexOffset={2000}
      eventHandlers={{
        click: () => onSelect?.(),
      }}
    >
      <Tooltip direction="top" offset={[0, -28]} opacity={0.96} className="custom-map-tooltip">
        <div className="px-1.5 py-0.5 text-center font-sans">
          <span className="font-bold text-xs text-amber-900 block leading-tight">
            Road Verification Point (Admin)
          </span>
          <span className="text-[10px] text-amber-700 font-semibold block">
            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </span>
          <span className="text-[9px] text-slate-500 block">
            2.2m from Way {nearestOsmSegment.wayId} · Unconnected
          </span>
        </div>
      </Tooltip>

      <Popup className="admin-verification-popup">
        <div className="p-3 max-w-xs font-sans space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
            <span className="font-bold text-amber-900 text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Admin Road Verification Point
            </span>
            <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
              Temporary
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Latitude:</span>
              <span className="font-bold text-slate-800">{coordinates.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Longitude:</span>
              <span className="font-bold text-slate-800">{coordinates.lng.toFixed(6)}</span>
            </div>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-[11px]">
            <div className="font-semibold text-slate-800">Nearby OSM Road Connections:</div>
            <div className="text-slate-600">
              • <strong>{nearestOsmSegment.name}</strong> (Way {nearestOsmSegment.wayId}):{' '}
              <span className="font-bold text-emerald-700">{nearestOsmSegment.distanceMeters}m away</span>
            </div>
            <div className="text-slate-600">
              • <strong>Junction Node {nearestJunction.nodeId}</strong> (6-way intersection):{' '}
              <span className="font-bold text-emerald-700">{nearestJunction.distanceMeters}m away</span>
            </div>
            <div className="text-slate-600">
              • Main Gate Candidate:{' '}
              <span className="font-medium">{sectorSummary.distanceToMainGateMeters}m NW</span>
            </div>
          </div>

          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 leading-snug">
            <strong>Zero-Fake-Connection Policy:</strong> Access access point is currently unverified. No road connection will be simulated until ground survey confirms gate alignment and curb transitions.
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
