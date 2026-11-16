import React from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import { LPU_CAMPUS_BOUNDARY_LATLNG } from '../../data/campusBoundary';

interface CampusBoundaryLayerProps {
  isVisible?: boolean;
}

/**
 * Verified boundary polygon of Lovely Professional University (LPU), Phagwara, Punjab.
 * Extracted directly from OpenStreetMap authoritative multipolygon (OSM Relation 21599790).
 */
export const CampusBoundaryLayer: React.FC<CampusBoundaryLayerProps> = ({ isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <Polygon
      positions={LPU_CAMPUS_BOUNDARY_LATLNG}
      pathOptions={{
        color: '#059669', // Emerald Jade boundary stroke
        weight: 2.5,
        dashArray: '8, 8',
        fillColor: '#10b981',
        fillOpacity: 0.04,
      }}
    >
      <Tooltip sticky direction="top" opacity={0.95} className="custom-map-tooltip">
        <div className="px-2 py-1 text-center font-sans">
          <span className="font-bold text-xs text-emerald-900 block leading-tight">
            Lovely Professional University
          </span>
          <span className="text-[10px] text-emerald-700 font-medium block">
            Verified Campus Perimeter (OSM Relation 21599790)
          </span>
          <span className="text-[9px] text-slate-400 font-mono block">
            Official 600+ Acre Campus Boundary
          </span>
        </div>
      </Tooltip>
    </Polygon>
  );
};
