import React from 'react';
import { Marker, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { LiveLocationShare } from '../../types/locationSharing';

interface FriendMarkerProps {
  share: LiveLocationShare | null;
  onSelect: () => void;
}

export const FriendMarker: React.FC<FriendMarkerProps> = ({ share, onSelect }) => {
  if (!share || share.revoked) return null;

  const { lat, lng, accuracy } = share.coords;
  const isExpired = new Date(share.expiresAt).getTime() <= Date.now();
  if (isExpired) return null;

  // Custom DivIcon for the friend
  const friendIcon = L.divIcon({
    className: 'friend-location-marker-container',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <!-- Pulsing radar ring -->
        <div style="
          position: absolute;
          width: 38px;
          height: 38px;
          top: -3px;
          border-radius: 9999px;
          background-color: rgba(16, 185, 129, 0.35);
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <!-- Inner avatar circle -->
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 13px;
        ">
          ${escapeHtml(share.creatorDisplayName.charAt(0).toUpperCase())}
        </div>
        <!-- Label pill -->
        <div style="
          margin-top: 4px;
          background-color: #0f172a;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 9999px;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.2);
        ">
          ${escapeHtml(share.creatorDisplayName)} (Friend)
        </div>
      </div>
    `,
    iconSize: [36, 56],
    iconAnchor: [18, 16],
    popupAnchor: [0, -18]
  });

  return (
    <>
      {/* Accuracy halo */}
      <Circle
        center={[lat, lng]}
        radius={Math.min(Math.max(accuracy, 8), 100)}
        pathOptions={{
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '3, 4'
        }}
      />
      {/* Marker */}
      <Marker
        position={[lat, lng]}
        icon={friendIcon}
        eventHandlers={{
          click: () => onSelect()
        }}
      >
        <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
          <div className="text-center font-sans text-xs">
            <div className="font-bold text-slate-800">{share.creatorDisplayName}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">
              {share.isLive ? '● Live Location' : 'Fixed Pin'}
            </div>
          </div>
        </Tooltip>
      </Marker>
    </>
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
