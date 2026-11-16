import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { LPU_CAMPUS_CENTER, MAP_CONFIG } from '../../data/campusBounds';
import { CampusLocation, LocationCategory } from '../../types/location';
import { GeoPosition, RoutePlan } from '../../types/navigation';
import { LocationMarkers } from './LocationMarkers';
import { UserLocationMarker } from './UserLocationMarker';
import { EventMarkers } from './EventMarkers';
import { FriendMarker } from './FriendMarker';
import { RoadClosureMarkers } from './RoadClosureMarkers';
import { CampusBoundaryLayer } from './CampusBoundaryLayer';
import { CampusRoadsLayer } from './CampusRoadsLayer';
import { CampusWalkwaysLayer } from './CampusWalkwaysLayer';
import { CampusEntrancesLayer } from './CampusEntrancesLayer';
import { CampusLayerControl, ActiveLayersState } from './CampusLayerControl';
import { MapController } from './MapController';
import { MapControls } from './MapControls';
import { PublicCampusEvent } from '../../types/events';
import { LiveLocationShare } from '../../types/locationSharing';
import { RoadClosure } from '../../types/roadClosure';

interface CampusMapProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation) => void;
  userPosition: GeoPosition | null;
  isFollowing: boolean;
  onUserInteracted: () => void;
  onRecenterGps: () => void;
  heading: number | null;
  onRequestOrientationPermission: () => void;
  selectedCategory?: LocationCategory | 'all';
  activeRoute?: RoutePlan | null;
  isNavigating?: boolean;
  events?: PublicCampusEvent[];
  selectedEvent?: PublicCampusEvent | null;
  onSelectEvent?: (event: PublicCampusEvent) => void;
  showEvents?: boolean;
  onOpenEventsModal?: () => void;
  onOpenAdminModal?: () => void;
  friendShare?: LiveLocationShare | null;
  onSelectFriend?: () => void;
  roadClosures?: RoadClosure[];
  onSelectClosure?: (closure: RoadClosure) => void;
  onOpenShareModal?: () => void;
  onOpenEmergencyModal?: () => void;
  onOpenReportClosureModal?: () => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  userPosition,
  isFollowing,
  onUserInteracted,
  onRecenterGps,
  heading,
  onRequestOrientationPermission,
  selectedCategory = 'all',
  activeRoute = null,
  isNavigating = false,
  events = [],
  selectedEvent = null,
  onSelectEvent,
  showEvents = true,
  onOpenEventsModal,
  onOpenAdminModal,
  friendShare = null,
  onSelectFriend,
  roadClosures = [],
  onSelectClosure,
  onOpenShareModal,
  onOpenEmergencyModal,
  onOpenReportClosureModal,
}) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const [resetNorthSignal, setResetNorthSignal] = useState<number>(0);
  const [recenterCampusSignal, setRecenterCampusSignal] = useState<number>(0);
  const [activeLayers, setActiveLayers] = useState<ActiveLayersState>({
    boundary: true,
    roads: true,
    walkingPaths: true,
    buildings: true,
    entrances: true,
  });

  const handleToggleLayer = (layerKey: keyof ActiveLayersState) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn(1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut(1);
    }
  };

  const handleResetNorth = () => {
    setResetNorthSignal((prev) => prev + 1);
  };

  const handleRecenterCampus = () => {
    setRecenterCampusSignal((prev) => prev + 1);
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden select-none touch-pan-x touch-pan-y">
      <MapContainer
        center={[LPU_CAMPUS_CENTER.lat, LPU_CAMPUS_CENTER.lng]}
        zoom={MAP_CONFIG.defaultZoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        zoomControl={false}
        attributionControl={true}
        className="w-full h-full z-0"
        ref={mapRef}
      >
        {/* OpenStreetMap Real Tile Layer */}
        <TileLayer
          url={MAP_CONFIG.tileLayerUrl}
          attribution={MAP_CONFIG.attribution}
          maxZoom={MAP_CONFIG.maxZoom}
        />

        {/* Real Campus Route Polyline (when navigation or directions active) */}
        {activeRoute && activeRoute.pathCoordinates.length >= 2 && (
          <>
            {/* Outline casing for contrast */}
            <Polyline
              positions={activeRoute.pathCoordinates.map((c) => [c.lat, c.lng])}
              pathOptions={{
                color: '#1d4ed8',
                weight: 8,
                opacity: 0.45,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Core vibrant navigation line */}
            <Polyline
              positions={activeRoute.pathCoordinates.map((c) => [c.lat, c.lng])}
              pathOptions={{
                color: '#2563eb',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Route Start Point */}
            <CircleMarker
              center={[activeRoute.pathCoordinates[0].lat, activeRoute.pathCoordinates[0].lng]}
              radius={6}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#16a34a',
                fillOpacity: 1,
                weight: 2,
              }}
            />
            {/* Route Destination Point */}
            <CircleMarker
              center={[
                activeRoute.pathCoordinates[activeRoute.pathCoordinates.length - 1].lat,
                activeRoute.pathCoordinates[activeRoute.pathCoordinates.length - 1].lng,
              ]}
              radius={7}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#dc2626',
                fillOpacity: 1,
                weight: 2,
              }}
            />
          </>
        )}

        {/* Layer 1: Verified Campus Boundary (OSM Relation 21599790) */}
        <CampusBoundaryLayer isVisible={activeLayers.boundary} />

        {/* Layer 2: Licensed Internal Vehicular Roads */}
        <CampusRoadsLayer isVisible={activeLayers.roads} />

        {/* Layer 3: Licensed Pedestrian Walkways & Paths */}
        <CampusWalkwaysLayer isVisible={activeLayers.walkingPaths} />

        {/* Layer 4: Pedestrian Entrance Gates (featuring Building 41 & campus security gates) */}
        <CampusEntrancesLayer
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={onSelectLocation}
          isVisible={activeLayers.entrances}
        />

        {/* Layer 5: Dynamic Campus Location Pins with Zoom-level LOD (hidden during turn-by-turn navigation for clarity) */}
        {!isNavigating && activeLayers.buildings && (
          <LocationMarkers
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation}
            selectedCategory={selectedCategory}
          />
        )}

        {/* Live Campus Event Markers */}
        {!isNavigating && onSelectEvent && (
          <EventMarkers
            events={events}
            selectedEvent={selectedEvent}
            onSelectEvent={onSelectEvent}
            isVisible={showEvents}
          />
        )}

        {/* Active Campus Road Closures & Maintenance Polylines */}
        <RoadClosureMarkers
          closures={roadClosures}
          onSelectClosure={onSelectClosure}
        />

        {/* Live Shared Friend Marker (Meet My Friend) */}
        {friendShare && onSelectFriend && (
          <FriendMarker
            share={friendShare}
            onSelect={onSelectFriend}
          />
        )}

        {/* Live GPS Dot & Accuracy Halo */}
        <UserLocationMarker position={userPosition} heading={heading} />

        {/* Programmatic pan/zoom listener */}
        <MapController
          selectedLocation={selectedLocation}
          userPosition={userPosition}
          isFollowing={isFollowing}
          onUserInteracted={onUserInteracted}
          resetNorthSignal={resetNorthSignal}
          recenterCampusSignal={recenterCampusSignal}
          activeRoute={activeRoute}
          isNavigating={isNavigating}
        />
      </MapContainer>

      {/* Floating Tactical Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenterGps={onRecenterGps}
        onRecenterCampus={handleRecenterCampus}
        onResetNorth={handleResetNorth}
        onRequestOrientationPermission={onRequestOrientationPermission}
        isFollowing={isFollowing}
        hasGpsFix={userPosition !== null}
        heading={heading}
        isPlaceDetailsOpen={
          selectedLocation !== null ||
          selectedEvent !== null ||
          friendShare !== null ||
          isNavigating
        }
        onOpenEventsModal={onOpenEventsModal}
        onOpenAdminModal={onOpenAdminModal}
        onOpenShareModal={onOpenShareModal}
        onOpenEmergencyModal={onOpenEmergencyModal}
        onOpenReportClosureModal={onOpenReportClosureModal}
        liveEventsCount={events.filter((e) => e.status === 'live').length}
      />

      {/* Floating 2D Base Map Layer Controller */}
      {!isNavigating && (
        <div className="fixed top-28 right-3 sm:right-6 z-20 pointer-events-auto">
          <CampusLayerControl
            layers={activeLayers}
            onToggleLayer={handleToggleLayer}
          />
        </div>
      )}
    </div>
  );
};
