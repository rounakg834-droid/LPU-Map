import React, { useMemo } from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import highwaysData from '../../data/osm_highways.geojson.json';

interface CampusWalkwaysLayerProps {
  isVisible?: boolean;
}

const PEDESTRIAN_HIGHWAYS = new Set([
  'footway',
  'pedestrian',
  'path',
  'steps',
]);

export const CampusWalkwaysLayer: React.FC<CampusWalkwaysLayerProps> = ({ isVisible = true }) => {
  const walkwayFeatures = useMemo(() => {
    return (highwaysData.features as any[])
      .filter((f) => PEDESTRIAN_HIGHWAYS.has(f.properties?.highway))
      .map((f, idx) => ({
        id: f.properties?.osmId || `walkway-${idx}`,
        name: f.properties?.name || 'Pedestrian Campus Walkway',
        highway: f.properties?.highway,
        surface: f.properties?.surface || 'paving_stones',
        // GeoJSON [lng, lat] -> Leaflet [lat, lng]
        coordinates: (f.geometry.coordinates as number[][]).map(([lng, lat]) => [lat, lng] as [number, number]),
      }));
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {walkwayFeatures.map((walkway) => (
        <Polyline
          key={walkway.id}
          positions={walkway.coordinates}
          pathOptions={{
            color: '#0284c7', // Sky / Azure pedestrian line
            weight: 2,
            opacity: 0.85,
            dashArray: '3, 4',
            lineCap: 'round',
            lineJoin: 'round',
          }}
        >
          <Tooltip direction="top" opacity={0.92} className="custom-map-tooltip">
            <div className="px-1.5 py-0.5 text-center font-sans">
              <span className="font-semibold text-xs text-sky-900 block">
                {walkway.name}
              </span>
              <span className="text-[10px] text-sky-600 capitalize block">
                Pedestrian Path · Verified OSM
              </span>
            </div>
          </Tooltip>
        </Polyline>
      ))}
    </>
  );
};
