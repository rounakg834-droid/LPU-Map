import React from 'react';
import { Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { RoadClosure } from '../../types/roadClosure';
import { campusRouteGraph } from '../../data/campusRouteGraph';

interface RoadClosureMarkersProps {
  closures: RoadClosure[];
  onSelectClosure?: (closure: RoadClosure) => void;
}

export const RoadClosureMarkers: React.FC<RoadClosureMarkersProps> = ({
  closures,
  onSelectClosure
}) => {
  const nodes = campusRouteGraph.nodes;

  const barrierIcon = L.divIcon({
    className: 'road-closure-barrier-icon',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background-color: #ef4444;
        border: 2px solid #ffffff;
        border-radius: 9999px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  return (
    <>
      {closures.map((closure) => {
        const nodeA = nodes[closure.nodeA];
        const nodeB = nodes[closure.nodeB];
        if (!nodeA || !nodeB) return null;

        const positions: [number, number][] = [
          [nodeA.coords.lat, nodeA.coords.lng],
          [nodeB.coords.lat, nodeB.coords.lng]
        ];

        const midpoint: [number, number] = [
          (nodeA.coords.lat + nodeB.coords.lat) / 2,
          (nodeA.coords.lng + nodeB.coords.lng) / 2
        ];

        return (
          <React.Fragment key={closure.id}>
            {/* Casing red polyline */}
            <Polyline
              positions={positions}
              pathOptions={{
                color: '#ef4444',
                weight: 7,
                opacity: 0.85,
                lineCap: 'round'
              }}
            />
            {/* Yellow striped dashed overlay */}
            <Polyline
              positions={positions}
              pathOptions={{
                color: '#fef08a',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.95,
                lineCap: 'round'
              }}
            />
            {/* Midpoint Barrier Marker */}
            <Marker
              position={midpoint}
              icon={barrierIcon}
              eventHandlers={{
                click: () => onSelectClosure && onSelectClosure(closure)
              }}
            >
              <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
                <div className="text-center font-sans max-w-[200px]">
                  <div className="font-bold text-rose-700 text-xs">⚠️ Campus Path Closed</div>
                  <div className="font-semibold text-slate-800 text-[11px]">{closure.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{closure.reason}</div>
                </div>
              </Tooltip>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
};
