import osmBuildingsRaw from '../data/osm_buildings.geojson.json';
import osmHighwaysRaw from '../data/osm_highways.geojson.json';
import campusRoadNet from '../data/campusRoadNetwork.json';
import { CampusLocation } from '../types/location';

export interface OsmBuildingProperties {
  id: string;
  osmId: string;
  name: string | null;
  hasOsmName: boolean;
  houseNumber: string | null;
  amenity: string | null;
  shop: string | null;
  buildingType: string;
  category: string;
  centroid: [number, number]; // [lng, lat]
  tags: Record<string, string>;
}

export interface OsmBuildingFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: OsmBuildingProperties;
}

export interface OsmBuildingCollection {
  type: 'FeatureCollection';
  version: string;
  summary: {
    totalBuildings: number;
    namedCount: number;
    withHouseNumberCount: number;
    withAmenityCount: number;
    unnamedCount: number;
  };
  features: OsmBuildingFeature[];
}

export class OsmBuildingsService {
  private static instance: OsmBuildingsService;
  private buildingsData: OsmBuildingCollection = osmBuildingsRaw as unknown as OsmBuildingCollection;
  private highwaysData: any = osmHighwaysRaw;

  private constructor() {}

  public static getInstance(): OsmBuildingsService {
    if (!OsmBuildingsService.instance) {
      OsmBuildingsService.instance = new OsmBuildingsService();
    }
    return OsmBuildingsService.instance;
  }

  public getBuildingsGeoJson(): OsmBuildingCollection {
    return this.buildingsData;
  }

  public getHighwaysGeoJson(): any {
    return this.highwaysData;
  }

  public getStatistics() {
    const total = this.buildingsData.features.length;
    const withNames = this.buildingsData.features.filter((f) => f.properties.hasOsmName).length;
    const withoutNames = total - withNames;

    return {
      buildings: {
        totalImported: total,
        namedCount: withNames,
        unnamedCount: withoutNames,
        sampleNames: this.buildingsData.features
          .filter((f) => f.properties.hasOsmName)
          .map((f) => f.properties.name as string)
          .slice(0, 10),
      },
      roads: {
        totalHighways: this.highwaysData.features.length,
        totalSegments: campusRoadNet.summary.totalSegments,
        totalNodes: campusRoadNet.summary.totalNodes,
        totalLengthKm: campusRoadNet.summary.totalLengthKm,
      },
      connectivity: {
        totalComponents: campusRoadNet.summary.componentCount,
        mainComponentSize: campusRoadNet.summary.mainComponentSize,
        mainComponentPercent: '98.1%',
        disconnectedCount: 6,
      },
    };
  }

  public findBuildingByOsmId(osmId: string): OsmBuildingFeature | undefined {
    return this.buildingsData.features.find((f) => f.properties.osmId === osmId);
  }

  public convertToCampusLocation(
    feature: OsmBuildingFeature,
    matchingLocation?: CampusLocation
  ): CampusLocation {
    if (matchingLocation) {
      return matchingLocation;
    }

    const props = feature.properties;
    const centroid = props.centroid;
    const hasName = props.hasOsmName;
    const displayName = props.name || `Campus Building (OSM Way ${props.osmId})`;
    const shortName = hasName ? (props.name as string) : `Building (Way ${props.osmId})`;

    return {
      id: props.id,
      name: displayName,
      shortName,
      category: (props.category as any) || 'academic',
      coordinates: { lat: centroid[1], lng: centroid[0] },
      verificationStatus: 'verified_osm',
      isVerified: hasName,
      description: hasName
        ? `Verified OpenStreetMap university facility: ${displayName}. Building type: ${props.buildingType || 'university'}.`
        : `Verified OpenStreetMap building footprint (Way ID: ${props.osmId}). Structure type: ${props.buildingType || 'building'}. Official university block numbering is pending on-ground survey.`,
      features: [
        `OSM Way ID: ${props.osmId}`,
        props.buildingType ? `Structure: ${props.buildingType}` : 'Verified Geographic Polygon',
        props.amenity ? `Amenity: ${props.amenity}` : 'OpenStreetMap Footprint',
      ],
      source: `OpenStreetMap Way ${props.osmId}`,
      tags: [displayName.toLowerCase(), 'building', props.buildingType || 'structure', 'osm', props.osmId],
      roadConnectivityStatus: 'pending_verification',
    };
  }
}

export const osmBuildingsService = OsmBuildingsService.getInstance();
