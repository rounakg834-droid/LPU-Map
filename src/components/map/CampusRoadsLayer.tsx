import React, { useMemo } from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import highwaysData from '../../data/osm_highways.geojson.json';

interface CampusRoadsLayerProps {
  isVisible?: boolean;
}

const VEHICULAR_HIGHWAYS = new Set([
  'tertiary',
  'unclassified',
  'residential',
  'service',
  'trunk',
  'living_street',
]);

export const CampusRoadsLayer: React.FC<CampusRoadsLayerProps> = ({ isVisible = true }) => {
  const roadFeatures = useMemo(() => {
    return (highwaysData.features as any[])
      .filter((f) => VEHICULAR_HIGHWAYS.has(f.properties?.highway))
      .map((f, idx) => ({
        id: f.properties?.osmId || `road-${idx}`,
        name: f.properties?.name || 'Internal Campus Road',
        highway: f.properties?.highway,
        surface: f.properties?.surface || 'asphalt',
        // GeoJSON [lng, lat] -> Leaflet [lat, lng]
        coordinates: (f.geometry.coordinates as number[][]).map(([lng, lat]) => [lat, lng] as [number, number]),
      }));
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {roadFeatures.map((road) => (
        <React.Fragment key={road.id}>
          {/* Subtle outline casing */}
          <Polyline
            positions={road.coordinates}
            pathOptions={{
              color: '#334155',
              weight: 4,
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          >
            <Tooltip direction="top" opacity={0.92} className="custom-map-tooltip">
              <div className="px-1.5 py-0.5 text-center font-sans">
                <span className="font-semibold text-xs text-slate-800 block">
                  {road.name}
                </span>
                <span className="text-[10px] text-slate-500 capitalize block">
                  {road.highway} road · Verified OSM
                </span>
              </div>
            </Tooltip>
          </Polyline>
          {/* Core road fill */}
          <Polyline
            positions={road.coordinates}
            pathOptions={{
              color: '#94a3b8',
              weight: 2.5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </React.Fragment>
      ))}
    </>
  );
};
