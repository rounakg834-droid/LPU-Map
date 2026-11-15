import React from 'react';
import { Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import { GeoPosition } from '../../types/navigation';

interface UserLocationMarkerProps {
  position: GeoPosition | null;
  heading?: number | null;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
  position,
  heading,
}) => {
  if (!position) return null;

  const { latitude, longitude, accuracy } = position.coords;

  // Blue current-location dot with pulsing beacon and heading cone
  const createLocationIcon = () => {
    const hasHeading = heading !== null && heading !== undefined;
    const rotation = hasHeading ? heading : 0;

    const html = `
      <div class="relative flex items-center justify-center">
        <!-- Pulsing halo circle -->
        <div class="absolute -inset-2.5 rounded-full bg-blue-500/25 animate-ping"></div>
        
        <!-- Directional heading beam/cone if supported -->
        ${
          hasHeading
            ? `
          <div style="transform: rotate(${rotation}deg); transform-origin: center center;" class="absolute -top-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-blue-600"></div>
          `
            : ''
        }
        
        <!-- Inner core blue GPS dot -->
        <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md shadow-blue-500/50 relative z-10"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'user-location-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <>
      {/* Accuracy circle in meters */}
      {accuracy && accuracy > 0 && (
        <Circle
          center={[latitude, longitude]}
          radius={accuracy}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#60a5fa',
            fillOpacity: 0.15,
            weight: 1.5,
          }}
        />
      )}

      {/* Blue position marker */}
      <Marker
        position={[latitude, longitude]}
        icon={createLocationIcon()}
        zIndexOffset={2000}
      >
        <Popup closeButton={false} offset={[0, -10]}>
          <div className="p-1 text-center font-sans">
            <div className="font-bold text-xs text-blue-700">Your Current Position</div>
            <div className="text-[10px] text-slate-500">
              Accuracy: ±{Math.round(accuracy || 0)}m
            </div>
            {position.coords.speed !== null && position.coords.speed > 0 && (
              <div className="text-[10px] text-slate-500">
                Speed: {((position.coords.speed * 3600) / 1000).toFixed(1)} km/h
              </div>
            )}
          </div>
        </Popup>
      </Marker>
    </>
  );
};
