import { LocationCategory } from '../types/location';

export type FootprintGeometrySource = 'verified_osm' | 'approximate_osm' | 'curated_survey';

export interface Campus3DFeatureProperties {
  id: string;
  osmId?: string;
  name: string;
  shortName: string;
  category: LocationCategory;
  blockNumber?: string;
  height: number;
  baseHeight: number;
  floors: number;
  color: string;
  accentColor: string;
  isApproximate: boolean;
  geometrySource: FootprintGeometrySource;
  center: [number, number];
  description?: string;
  isVerifiedCampusFacility?: boolean;
  isUnverified?: boolean;
}

export interface Campus3DFeature {
  type: 'Feature';
  id: string;
  properties: Campus3DFeatureProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface Campus3DFeatureCollection {
  type: 'FeatureCollection';
  features: Campus3DFeature[];
}

export const CAMPUS_3D_FOOTPRINTS: Campus3DFeatureCollection = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "gate-1",
      "properties": {
        "id": "gate-1",
        "osmId": "1550425052",
        "name": "Main Gate 1",
        "shortName": "Gate 1",
        "category": "gate",
        "height": 12,
        "baseHeight": 0,
        "floors": 2,
        "color": "#94a3b8",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7018508,
          31.252283
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 1550425052). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7020872,
              31.2521834
            ],
            [
              75.7019778,
              31.25218
            ],
            [
              75.7019705,
              31.2523707
            ],
            [
              75.7016344,
              31.2523698
            ],
            [
              75.7016319,
              31.2523273
            ],
            [
              75.7018807,
              31.2523239
            ],
            [
              75.7018925,
              31.252133
            ],
            [
              75.7015615,
              31.252129
            ],
            [
              75.7015565,
              31.2524522
            ],
            [
              75.7020784,
              31.2524603
            ],
            [
              75.7020872,
              31.2521834
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "building-41",
      "properties": {
        "id": "building-41",
        "osmId": "422437895",
        "name": "Building 41 (Boys Apartment)",
        "shortName": "Boys Apartment (41)",
        "category": "hostel_boys",
        "height": 24,
        "baseHeight": 0,
        "floors": 7,
        "color": "#bae6fd",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7019745,
          31.2518959
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422437895) with user-confirmed entrance gate at 31.251697, 75.701877.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7018918,
              31.2520603
            ],
            [
              75.7020807,
              31.2520624
            ],
            [
              75.7021031,
              31.2516484
            ],
            [
              75.701905,
              31.2516483
            ],
            [
              75.7018918,
              31.2520603
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "block-30-admin",
      "properties": {
        "id": "block-30-admin",
        "osmId": "422823421",
        "name": "Block 30 (Admissions)",
        "shortName": "Block 30",
        "category": "administration",
        "height": 18,
        "baseHeight": 0,
        "floors": 5,
        "color": "#cbd5e1",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7032932,
          31.2526252
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422823421). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7023591,
              31.2526378
            ],
            [
              75.7026639,
              31.2523904
            ],
            [
              75.702664,
              31.252541
            ],
            [
              75.7027572,
              31.252538
            ],
            [
              75.7027557,
              31.2523877
            ],
            [
              75.7030538,
              31.2523821
            ],
            [
              75.7030566,
              31.2525242
            ],
            [
              75.7031651,
              31.2525268
            ],
            [
              75.7031622,
              31.2523802
            ],
            [
              75.7034609,
              31.2523756
            ],
            [
              75.7034623,
              31.2525144
            ],
            [
              75.703588,
              31.2525171
            ],
            [
              75.7035879,
              31.2523754
            ],
            [
              75.7038714,
              31.2523747
            ],
            [
              75.7038701,
              31.252514
            ],
            [
              75.7039938,
              31.2525143
            ],
            [
              75.7039938,
              31.2523726
            ],
            [
              75.7041915,
              31.2523564
            ],
            [
              75.7044071,
              31.2528512
            ],
            [
              75.7039854,
              31.2528548
            ],
            [
              75.7039908,
              31.2527016
            ],
            [
              75.7038848,
              31.2527026
            ],
            [
              75.7038881,
              31.2528569
            ],
            [
              75.7035774,
              31.2528562
            ],
            [
              75.7035751,
              31.2527008
            ],
            [
              75.7034706,
              31.252699
            ],
            [
              75.7034736,
              31.2528584
            ],
            [
              75.703162,
              31.2528601
            ],
            [
              75.7031606,
              31.2527083
            ],
            [
              75.7030605,
              31.2527063
            ],
            [
              75.7030665,
              31.2528673
            ],
            [
              75.7027368,
              31.2528693
            ],
            [
              75.7027343,
              31.2527141
            ],
            [
              75.7026495,
              31.2527165
            ],
            [
              75.7026516,
              31.252872
            ],
            [
              75.702359,
              31.2528747
            ],
            [
              75.7023591,
              31.2526378
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "block-13",
      "properties": {
        "id": "block-13",
        "osmId": "422548310",
        "name": "Block 13 (Polytechnic)",
        "shortName": "Block 13",
        "category": "academic",
        "height": 16,
        "baseHeight": 0,
        "floors": 4,
        "color": "#cbd5e1",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7013215,
          31.2534165
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422548310). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7012993,
              31.2534751
            ],
            [
              75.7012976,
              31.2534137
            ],
            [
              75.7012972,
              31.2533953
            ],
            [
              75.7012958,
              31.2533422
            ],
            [
              75.701379,
              31.2533406
            ],
            [
              75.7013825,
              31.2534735
            ],
            [
              75.7012993,
              31.2534751
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "block-25-28",
      "properties": {
        "id": "block-25-28",
        "osmId": "422548309",
        "name": "Block 25-28 (Business School)",
        "shortName": "Block 25",
        "category": "academic",
        "height": 18,
        "baseHeight": 0,
        "floors": 5,
        "color": "#cbd5e1",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.701321,
          31.2536501
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422548309). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7012968,
              31.2537044
            ],
            [
              75.7012957,
              31.2536498
            ],
            [
              75.7012953,
              31.2536314
            ],
            [
              75.7012943,
              31.2535794
            ],
            [
              75.7013828,
              31.2535781
            ],
            [
              75.7013853,
              31.2537031
            ],
            [
              75.7012968,
              31.2537044
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "central-library",
      "properties": {
        "id": "central-library",
        "osmId": "425699179",
        "name": "Central Library",
        "shortName": "Library",
        "category": "library",
        "height": 20,
        "baseHeight": 0,
        "floors": 5,
        "color": "#e0e7ff",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7040369,
          31.2552337
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 425699179). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7039977,
              31.2553722
            ],
            [
              75.7040997,
              31.2553676
            ],
            [
              75.7040943,
              31.2550283
            ],
            [
              75.7039951,
              31.2550283
            ],
            [
              75.7039977,
              31.2553722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "block-34",
      "properties": {
        "id": "block-34",
        "osmId": "422437890",
        "name": "Block 34 (School of CSE)",
        "shortName": "Block 34 (CSE)",
        "category": "academic",
        "height": 22,
        "baseHeight": 0,
        "floors": 6,
        "color": "#cbd5e1",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7033124,
          31.2552684
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422437890). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7030198,
              31.2553572
            ],
            [
              75.703067,
              31.2553568
            ],
            [
              75.7031166,
              31.2553564
            ],
            [
              75.7031845,
              31.2553559
            ],
            [
              75.7031842,
              31.255328
            ],
            [
              75.7033185,
              31.2553269
            ],
            [
              75.703319,
              31.2553746
            ],
            [
              75.7033887,
              31.2553741
            ],
            [
              75.7033881,
              31.2553255
            ],
            [
              75.7035036,
              31.2553245
            ],
            [
              75.703504,
              31.2553678
            ],
            [
              75.7036986,
              31.2553662
            ],
            [
              75.7036958,
              31.2551164
            ],
            [
              75.7035075,
              31.255118
            ],
            [
              75.7035085,
              31.2552107
            ],
            [
              75.7034374,
              31.2552113
            ],
            [
              75.7034363,
              31.255116
            ],
            [
              75.7032652,
              31.2551174
            ],
            [
              75.7032664,
              31.2552169
            ],
            [
              75.70317,
              31.2552177
            ],
            [
              75.7031691,
              31.2551379
            ],
            [
              75.7030173,
              31.2551392
            ],
            [
              75.7030198,
              31.2553572
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "block-36",
      "properties": {
        "id": "block-36",
        "osmId": "422437899",
        "name": "Block 36 (Academic & Exam)",
        "shortName": "Block 36",
        "category": "academic",
        "height": 22,
        "baseHeight": 0,
        "floors": 6,
        "color": "#cbd5e1",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7039336,
          31.2560662
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422437899). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7037174,
              31.2560829
            ],
            [
              75.7037201,
              31.2559866
            ],
            [
              75.7041922,
              31.256021
            ],
            [
              75.7041922,
              31.2561008
            ],
            [
              75.7040094,
              31.2561033
            ],
            [
              75.7039776,
              31.2560783
            ],
            [
              75.7039427,
              31.2560737
            ],
            [
              75.7037174,
              31.2560829
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "block-38",
      "properties": {
        "id": "block-38",
        "osmId": "422437901",
        "name": "Block 38 (ECE & Mech)",
        "shortName": "Block 38",
        "category": "academic",
        "height": 20,
        "baseHeight": 0,
        "floors": 5,
        "color": "#cbd5e1",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7046444,
          31.256633
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422437901). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7044329,
              31.25673
            ],
            [
              75.7044307,
              31.256484
            ],
            [
              75.7046014,
              31.2564828
            ],
            [
              75.7046033,
              31.256699
            ],
            [
              75.7047242,
              31.2566982
            ],
            [
              75.7047222,
              31.2564788
            ],
            [
              75.7049053,
              31.2564776
            ],
            [
              75.7049075,
              31.2567265
            ],
            [
              75.7047313,
              31.2567276
            ],
            [
              75.7045972,
              31.256729
            ],
            [
              75.7044329,
              31.25673
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "unimall",
      "properties": {
        "id": "unimall",
        "osmId": "422437888",
        "name": "UniMall",
        "shortName": "UniMall",
        "category": "commercial",
        "height": 16,
        "baseHeight": 0,
        "floors": 4,
        "color": "#fef08a",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.705696,
          31.2542496
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422437888). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7055654,
              31.2543045
            ],
            [
              75.7055679,
              31.254163
            ],
            [
              75.7058919,
              31.2541672
            ],
            [
              75.7058894,
              31.2543088
            ],
            [
              75.7055654,
              31.2543045
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "unihospital",
      "properties": {
        "id": "unihospital",
        "osmId": "422823425",
        "name": "UniHospital & Clinic",
        "shortName": "UniHospital",
        "category": "medical",
        "height": 15,
        "baseHeight": 0,
        "floors": 4,
        "color": "#fecaca",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7049934,
          31.2526805
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422823425). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7049723,
              31.252878
            ],
            [
              75.7049719,
              31.252787
            ],
            [
              75.7049722,
              31.2527228
            ],
            [
              75.7049759,
              31.2526334
            ],
            [
              75.7049746,
              31.2525313
            ],
            [
              75.704974,
              31.2524875
            ],
            [
              75.705042,
              31.2524825
            ],
            [
              75.7050424,
              31.2525283
            ],
            [
              75.7050359,
              31.2528761
            ],
            [
              75.7049723,
              31.252878
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "unipolis",
      "properties": {
        "id": "unipolis",
        "osmId": "675395630",
        "name": "Baldev Raj Mittal Unipolis",
        "shortName": "Unipolis",
        "category": "auditorium_events",
        "height": 18,
        "baseHeight": 0,
        "floors": 3,
        "color": "#f3e8ff",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7033124,
          31.2552684
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 675395630). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7030198,
              31.2553572
            ],
            [
              75.703067,
              31.2553568
            ],
            [
              75.7031166,
              31.2553564
            ],
            [
              75.7031845,
              31.2553559
            ],
            [
              75.7031842,
              31.255328
            ],
            [
              75.7033185,
              31.2553269
            ],
            [
              75.703319,
              31.2553746
            ],
            [
              75.7033887,
              31.2553741
            ],
            [
              75.7033881,
              31.2553255
            ],
            [
              75.7035036,
              31.2553245
            ],
            [
              75.703504,
              31.2553678
            ],
            [
              75.7036986,
              31.2553662
            ],
            [
              75.7036958,
              31.2551164
            ],
            [
              75.7035075,
              31.255118
            ],
            [
              75.7035085,
              31.2552107
            ],
            [
              75.7034374,
              31.2552113
            ],
            [
              75.7034363,
              31.255116
            ],
            [
              75.7032652,
              31.2551174
            ],
            [
              75.7032664,
              31.2552169
            ],
            [
              75.70317,
              31.2552177
            ],
            [
              75.7031691,
              31.2551379
            ],
            [
              75.7030173,
              31.2551392
            ],
            [
              75.7030198,
              31.2553572
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "sports-complex",
      "properties": {
        "id": "sports-complex",
        "osmId": "425716259",
        "name": "Indoor Sports Complex",
        "shortName": "Sports Complex",
        "category": "sports",
        "height": 18,
        "baseHeight": 0,
        "floors": 3,
        "color": "#bbf7d0",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7057669,
          31.2569665
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 425716259). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7057624,
              31.2569947
            ],
            [
              75.705755,
              31.2569239
            ],
            [
              75.705772,
              31.2569086
            ],
            [
              75.7057829,
              31.2570106
            ],
            [
              75.7057624,
              31.2569947
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "bh-1",
      "properties": {
        "id": "bh-1",
        "osmId": "422437887",
        "name": "Boys Hostel 1 (BH-1)",
        "shortName": "BH-1",
        "category": "hostel_boys",
        "height": 24,
        "baseHeight": 0,
        "floors": 8,
        "color": "#bae6fd",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7056392,
          31.2544728
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422437887). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7054065,
              31.254307
            ],
            [
              75.7056801,
              31.2548045
            ],
            [
              75.7058871,
              31.2548049
            ],
            [
              75.7058894,
              31.2543088
            ],
            [
              75.7055654,
              31.2543045
            ],
            [
              75.7054065,
              31.254307
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "bh-2",
      "properties": {
        "id": "bh-2",
        "osmId": "425717558",
        "name": "Boys Hostel 2 (BH-2)",
        "shortName": "BH-2",
        "category": "hostel_boys",
        "height": 24,
        "baseHeight": 0,
        "floors": 8,
        "color": "#bae6fd",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7070043,
          31.2562131
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 425717558). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7069805,
              31.2562271
            ],
            [
              75.7069805,
              31.2562441
            ],
            [
              75.7070516,
              31.2562443
            ],
            [
              75.7070519,
              31.2561681
            ],
            [
              75.7069808,
              31.2561679
            ],
            [
              75.7069805,
              31.2562271
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "bh-3",
      "properties": {
        "id": "bh-3",
        "osmId": "425717556",
        "name": "Boys Hostel 3 (BH-3)",
        "shortName": "BH-3",
        "category": "hostel_boys",
        "height": 24,
        "baseHeight": 0,
        "floors": 8,
        "color": "#bae6fd",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7068527,
          31.2561927
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 425717556). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.706767,
              31.2561695
            ],
            [
              75.7069808,
              31.2561679
            ],
            [
              75.7069805,
              31.2562271
            ],
            [
              75.706768,
              31.2562297
            ],
            [
              75.706767,
              31.2561695
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "bh-4",
      "properties": {
        "id": "bh-4",
        "osmId": "422738980",
        "name": "Boys Hostel 4 (BH-4)",
        "shortName": "BH-4",
        "category": "hostel_boys",
        "height": 24,
        "baseHeight": 0,
        "floors": 8,
        "color": "#bae6fd",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.707885,
          31.2574214
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422738980). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7078386,
              31.2574986
            ],
            [
              75.7078351,
              31.2573072
            ],
            [
              75.7079545,
              31.2573056
            ],
            [
              75.707958,
              31.257497
            ],
            [
              75.7078386,
              31.2574986
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "bh-5",
      "properties": {
        "id": "bh-5",
        "osmId": "422823430",
        "name": "Boys Hostel 5 (BH-5)",
        "shortName": "BH-5",
        "category": "hostel_boys",
        "height": 24,
        "baseHeight": 0,
        "floors": 8,
        "color": "#bae6fd",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7056193,
          31.2510943
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422823430). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7053087,
              31.2513139
            ],
            [
              75.7053042,
              31.2507726
            ],
            [
              75.706082,
              31.2507638
            ],
            [
              75.7060931,
              31.2513074
            ],
            [
              75.7053087,
              31.2513139
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "bh-6",
      "properties": {
        "id": "bh-6",
        "osmId": "422823420",
        "name": "Boys Hostel 6 (BH-6)",
        "shortName": "BH-6",
        "category": "hostel_boys",
        "height": 24,
        "baseHeight": 0,
        "floors": 8,
        "color": "#bae6fd",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.704787,
          31.2518565
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422823420). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7047045,
              31.2513725
            ],
            [
              75.7046982,
              31.2511953
            ],
            [
              75.7049247,
              31.2511888
            ],
            [
              75.7049225,
              31.2513668
            ],
            [
              75.7050117,
              31.2513645
            ],
            [
              75.7050296,
              31.2515995
            ],
            [
              75.704863,
              31.2516
            ],
            [
              75.7048654,
              31.2516931
            ],
            [
              75.7050371,
              31.2516865
            ],
            [
              75.705036,
              31.2519267
            ],
            [
              75.704872,
              31.2519171
            ],
            [
              75.704875,
              31.2520333
            ],
            [
              75.7050402,
              31.2520368
            ],
            [
              75.705042,
              31.2524825
            ],
            [
              75.704974,
              31.2524875
            ],
            [
              75.7048584,
              31.2524884
            ],
            [
              75.7048032,
              31.2524904
            ],
            [
              75.7048029,
              31.2523748
            ],
            [
              75.7047434,
              31.252376
            ],
            [
              75.7047405,
              31.2522813
            ],
            [
              75.7045131,
              31.25229
            ],
            [
              75.7045069,
              31.2520476
            ],
            [
              75.7046982,
              31.252044
            ],
            [
              75.7046952,
              31.2519277
            ],
            [
              75.7045223,
              31.251931
            ],
            [
              75.7045161,
              31.2516885
            ],
            [
              75.704697,
              31.2516851
            ],
            [
              75.7046951,
              31.2516116
            ],
            [
              75.7045059,
              31.2516152
            ],
            [
              75.7044998,
              31.2513763
            ],
            [
              75.7047045,
              31.2513725
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "gh-1",
      "properties": {
        "id": "gh-1",
        "osmId": "422738894",
        "name": "Girls Hostel 1 (GH-1)",
        "shortName": "GH-1",
        "category": "hostel_girls",
        "height": 24,
        "baseHeight": 0,
        "floors": 8,
        "color": "#fbcfe8",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7008035,
          31.2555617
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422738894). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7007824,
              31.2556017
            ],
            [
              75.7007842,
              31.2555009
            ],
            [
              75.7008351,
              31.2555016
            ],
            [
              75.7008332,
              31.2556024
            ],
            [
              75.7007824,
              31.2556017
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "gh-2",
      "properties": {
        "id": "gh-2",
        "osmId": "422437900",
        "name": "Girls Hostel 2 (GH-2)",
        "shortName": "GH-2",
        "category": "hostel_girls",
        "height": 24,
        "baseHeight": 0,
        "floors": 8,
        "color": "#fbcfe8",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7047192,
          31.2568647
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422437900). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7045972,
              31.256729
            ],
            [
              75.7046025,
              31.2569519
            ],
            [
              75.7047393,
              31.2569473
            ],
            [
              75.7047313,
              31.2567276
            ],
            [
              75.7049075,
              31.2567265
            ],
            [
              75.704903,
              31.2569381
            ],
            [
              75.7049807,
              31.2569427
            ],
            [
              75.7049834,
              31.2570436
            ],
            [
              75.7044362,
              31.2570459
            ],
            [
              75.7044329,
              31.25673
            ],
            [
              75.7045972,
              31.256729
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "gh-3",
      "properties": {
        "id": "gh-3",
        "osmId": "422437898",
        "name": "Girls Hostel 3 (GH-3)",
        "shortName": "GH-3",
        "category": "hostel_girls",
        "height": 24,
        "baseHeight": 0,
        "floors": 8,
        "color": "#fbcfe8",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7046659,
          31.2562882
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 422437898). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7040155,
              31.2564311
            ],
            [
              75.7040094,
              31.2561033
            ],
            [
              75.7041922,
              31.2561008
            ],
            [
              75.7044836,
              31.2560969
            ],
            [
              75.7044864,
              31.256251
            ],
            [
              75.7045804,
              31.2562497
            ],
            [
              75.7045781,
              31.256124
            ],
            [
              75.7047745,
              31.2561213
            ],
            [
              75.7047767,
              31.2562387
            ],
            [
              75.7048608,
              31.2562375
            ],
            [
              75.7048601,
              31.2562005
            ],
            [
              75.7050473,
              31.2561978
            ],
            [
              75.7050482,
              31.2562459
            ],
            [
              75.7053476,
              31.2562416
            ],
            [
              75.7053511,
              31.2564201
            ],
            [
              75.7051652,
              31.2564227
            ],
            [
              75.7051622,
              31.2562671
            ],
            [
              75.7050477,
              31.2562687
            ],
            [
              75.7050505,
              31.2564158
            ],
            [
              75.7048833,
              31.2564181
            ],
            [
              75.7048803,
              31.2562648
            ],
            [
              75.704758,
              31.2562665
            ],
            [
              75.7047609,
              31.2564204
            ],
            [
              75.704599,
              31.2564227
            ],
            [
              75.7045961,
              31.2562716
            ],
            [
              75.7044816,
              31.2562731
            ],
            [
              75.7044844,
              31.2564199
            ],
            [
              75.7043071,
              31.2564223
            ],
            [
              75.7043044,
              31.2562734
            ],
            [
              75.7041993,
              31.2562749
            ],
            [
              75.7042022,
              31.2564285
            ],
            [
              75.7040155,
              31.2564311
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "gh-4",
      "properties": {
        "id": "gh-4",
        "osmId": "425716258",
        "name": "Girls Hostel 4 (GH-4)",
        "shortName": "GH-4",
        "category": "hostel_girls",
        "height": 24,
        "baseHeight": 0,
        "floors": 8,
        "color": "#fbcfe8",
        "accentColor": "#64748b",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.705587,
          31.2570994
        ],
        "description": "Verified OpenStreetMap building footprint (OSM Way 425716258). Height estimated for 3D visualization only.",
        "isVerifiedCampusFacility": true,
        "isUnverified": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7055469,
              31.2570933
            ],
            [
              75.7056482,
              31.2570935
            ],
            [
              75.705665,
              31.2571078
            ],
            [
              75.7055279,
              31.2571091
            ],
            [
              75.7055469,
              31.2570933
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_354743583",
      "properties": {
        "id": "osm_354743583",
        "osmId": "354743583",
        "name": "Lovely Institute Of Management",
        "shortName": "Lovely Institute Of Management",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7088599,
          31.2586021
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7085428,
              31.2586157
            ],
            [
              75.7086325,
              31.2586888
            ],
            [
              75.7087295,
              31.2586057
            ],
            [
              75.7087481,
              31.2586338
            ],
            [
              75.7087387,
              31.258794
            ],
            [
              75.7088704,
              31.2587996
            ],
            [
              75.7088655,
              31.2588834
            ],
            [
              75.7089471,
              31.2588869
            ],
            [
              75.7089498,
              31.2588408
            ],
            [
              75.7090669,
              31.2588458
            ],
            [
              75.7090763,
              31.2586853
            ],
            [
              75.7089476,
              31.2586798
            ],
            [
              75.7089504,
              31.2586326
            ],
            [
              75.7089855,
              31.258604
            ],
            [
              75.7090203,
              31.2586353
            ],
            [
              75.7090995,
              31.2585709
            ],
            [
              75.7090401,
              31.2585175
            ],
            [
              75.7090962,
              31.2584719
            ],
            [
              75.709006,
              31.2583908
            ],
            [
              75.7089514,
              31.2584352
            ],
            [
              75.7089036,
              31.2583923
            ],
            [
              75.7088459,
              31.2584393
            ],
            [
              75.7087965,
              31.2583949
            ],
            [
              75.7087279,
              31.2584507
            ],
            [
              75.708678,
              31.2584058
            ],
            [
              75.7086302,
              31.2584447
            ],
            [
              75.7086886,
              31.2584972
            ],
            [
              75.7085428,
              31.2586157
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_354755644",
      "properties": {
        "id": "osm_354755644",
        "osmId": "354755644",
        "name": "Lovely Institute of Technology",
        "shortName": "Lovely Institute of Technology",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7068854,
          31.2578922
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7068406,
              31.2578303
            ],
            [
              75.706805,
              31.2578308
            ],
            [
              75.7067245,
              31.2578318
            ],
            [
              75.7067294,
              31.2581364
            ],
            [
              75.7068812,
              31.2581345
            ],
            [
              75.7068782,
              31.2579487
            ],
            [
              75.7069625,
              31.2579477
            ],
            [
              75.7069655,
              31.2581316
            ],
            [
              75.7071617,
              31.2581296
            ],
            [
              75.7071581,
              31.2577641
            ],
            [
              75.7069277,
              31.2577677
            ],
            [
              75.7069266,
              31.2576996
            ],
            [
              75.7067618,
              31.2577016
            ],
            [
              75.7067633,
              31.2577961
            ],
            [
              75.7068401,
              31.2577951
            ],
            [
              75.7068406,
              31.2578303
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_354830243",
      "properties": {
        "id": "osm_354830243",
        "osmId": "354830243",
        "name": "Lovely Institute of Pharmacy",
        "shortName": "Lovely Institute of Pharmacy",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7072683,
          31.2576196
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7075066,
              31.2574198
            ],
            [
              75.7075934,
              31.2574979
            ],
            [
              75.707538,
              31.257551
            ],
            [
              75.7076122,
              31.2576106
            ],
            [
              75.70755,
              31.257659
            ],
            [
              75.7075063,
              31.2576229
            ],
            [
              75.7074533,
              31.2576669
            ],
            [
              75.7074031,
              31.2576195
            ],
            [
              75.7073506,
              31.2576619
            ],
            [
              75.7073067,
              31.2576271
            ],
            [
              75.7072415,
              31.2576749
            ],
            [
              75.7071944,
              31.2576268
            ],
            [
              75.7070803,
              31.2577265
            ],
            [
              75.7069996,
              31.2576473
            ],
            [
              75.7069811,
              31.2576768
            ],
            [
              75.7069998,
              31.2577039
            ],
            [
              75.7070016,
              31.2577312
            ],
            [
              75.7069535,
              31.2577384
            ],
            [
              75.7069448,
              31.2576835
            ],
            [
              75.706959,
              31.2576493
            ],
            [
              75.7071077,
              31.2575179
            ],
            [
              75.7073802,
              31.2575187
            ],
            [
              75.7075066,
              31.2574198
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422323508",
      "properties": {
        "id": "osm_422323508",
        "osmId": "422323508",
        "name": "Building 422323508",
        "shortName": "Building 422323508",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7032054,
          31.2486705
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.70313,
              31.2489551
            ],
            [
              75.7031595,
              31.2488955
            ],
            [
              75.7031353,
              31.2488725
            ],
            [
              75.7031622,
              31.2488129
            ],
            [
              75.7031353,
              31.2487969
            ],
            [
              75.7031648,
              31.2487281
            ],
            [
              75.703138,
              31.2487166
            ],
            [
              75.7031702,
              31.2486478
            ],
            [
              75.7031997,
              31.2486593
            ],
            [
              75.7032158,
              31.2486341
            ],
            [
              75.7031514,
              31.2486065
            ],
            [
              75.7031729,
              31.2485332
            ],
            [
              75.7031461,
              31.2485194
            ],
            [
              75.7031756,
              31.2484598
            ],
            [
              75.7031487,
              31.2484483
            ],
            [
              75.7031863,
              31.2483818
            ],
            [
              75.7032909,
              31.2484116
            ],
            [
              75.7033794,
              31.2484093
            ],
            [
              75.7033768,
              31.2484905
            ],
            [
              75.7033761,
              31.2485112
            ],
            [
              75.7033606,
              31.2489895
            ],
            [
              75.7032185,
              31.2489872
            ],
            [
              75.70313,
              31.2489551
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422437885",
      "properties": {
        "id": "osm_422437885",
        "osmId": "422437885",
        "name": "Building 422437885",
        "shortName": "Building 422437885",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7049979,
          31.2557162
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7041937,
              31.2555946
            ],
            [
              75.7055524,
              31.2556051
            ],
            [
              75.7056056,
              31.2556056
            ],
            [
              75.7056366,
              31.2556271
            ],
            [
              75.7057229,
              31.2558008
            ],
            [
              75.705743,
              31.2558703
            ],
            [
              75.7057164,
              31.255909
            ],
            [
              75.705668,
              31.2559189
            ],
            [
              75.7042688,
              31.2557184
            ],
            [
              75.7042446,
              31.2557138
            ],
            [
              75.7042205,
              31.2556932
            ],
            [
              75.7042071,
              31.2556588
            ],
            [
              75.7041937,
              31.2555946
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422437894",
      "properties": {
        "id": "osm_422437894",
        "osmId": "422437894",
        "name": "Building 422437894",
        "shortName": "Building 422437894",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7025067,
          31.2514703
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7023992,
              31.2516283
            ],
            [
              75.702658,
              31.2516363
            ],
            [
              75.7026674,
              31.2512328
            ],
            [
              75.7024099,
              31.2512259
            ],
            [
              75.7023992,
              31.2516283
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422437896",
      "properties": {
        "id": "osm_422437896",
        "osmId": "422437896",
        "name": "Building 422437896",
        "shortName": "Building 422437896",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7016802,
          31.2518916
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7015956,
              31.2520538
            ],
            [
              75.7017919,
              31.2520552
            ],
            [
              75.7018073,
              31.2516457
            ],
            [
              75.7016108,
              31.2516494
            ],
            [
              75.7015956,
              31.2520538
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422437897",
      "properties": {
        "id": "osm_422437897",
        "osmId": "422437897",
        "name": "Building 422437897",
        "shortName": "Building 422437897",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7012022,
          31.2518476
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.70115,
              31.2518293
            ],
            [
              75.7011392,
              31.252005
            ],
            [
              75.7009368,
              31.2519913
            ],
            [
              75.7009339,
              31.2516083
            ],
            [
              75.7011526,
              31.2516019
            ],
            [
              75.7011462,
              31.2517605
            ],
            [
              75.7012803,
              31.2517723
            ],
            [
              75.7012865,
              31.2516281
            ],
            [
              75.7014726,
              31.2516316
            ],
            [
              75.701463,
              31.2522713
            ],
            [
              75.7012564,
              31.2522593
            ],
            [
              75.7012614,
              31.251831
            ],
            [
              75.70115,
              31.2518293
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422437902",
      "properties": {
        "id": "osm_422437902",
        "osmId": "422437902",
        "name": "Building 422437902",
        "shortName": "Building 422437902",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7056536,
          31.2565249
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7054469,
              31.2567139
            ],
            [
              75.7054377,
              31.2563154
            ],
            [
              75.7056189,
              31.2563124
            ],
            [
              75.7056207,
              31.2563888
            ],
            [
              75.7059298,
              31.2563836
            ],
            [
              75.7059374,
              31.2567079
            ],
            [
              75.7057427,
              31.2567112
            ],
            [
              75.7057356,
              31.2564075
            ],
            [
              75.7056331,
              31.2564092
            ],
            [
              75.7056401,
              31.2567106
            ],
            [
              75.7054469,
              31.2567139
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422437904",
      "properties": {
        "id": "osm_422437904",
        "osmId": "422437904",
        "name": "Building 422437904",
        "shortName": "Building 422437904",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7054314,
          31.2569219
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.70513,
              31.2568629
            ],
            [
              75.7054848,
              31.2571451
            ],
            [
              75.7055279,
              31.2571091
            ],
            [
              75.7055469,
              31.2570933
            ],
            [
              75.705598,
              31.2570506
            ],
            [
              75.7054754,
              31.2569611
            ],
            [
              75.7055946,
              31.2568599
            ],
            [
              75.7055404,
              31.2568203
            ],
            [
              75.7055141,
              31.2568012
            ],
            [
              75.7054742,
              31.256772
            ],
            [
              75.7053618,
              31.2568753
            ],
            [
              75.7052303,
              31.2567707
            ],
            [
              75.70513,
              31.2568629
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422437906",
      "properties": {
        "id": "osm_422437906",
        "osmId": "422437906",
        "name": "Building 422437906",
        "shortName": "Building 422437906",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7057004,
          31.2570505
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.705598,
              31.2570506
            ],
            [
              75.7056482,
              31.2570935
            ],
            [
              75.705665,
              31.2571078
            ],
            [
              75.7057077,
              31.2571443
            ],
            [
              75.7058254,
              31.2570436
            ],
            [
              75.7057829,
              31.2570106
            ],
            [
              75.7057624,
              31.2569947
            ],
            [
              75.7057161,
              31.2569588
            ],
            [
              75.705598,
              31.2570506
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422437908",
      "properties": {
        "id": "osm_422437908",
        "osmId": "422437908",
        "name": "Building 422437908",
        "shortName": "Building 422437908",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7056932,
          31.2568638
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7055946,
              31.2568599
            ],
            [
              75.7057161,
              31.2569588
            ],
            [
              75.705755,
              31.2569239
            ],
            [
              75.705772,
              31.2569086
            ],
            [
              75.7058158,
              31.2568693
            ],
            [
              75.7056942,
              31.2567704
            ],
            [
              75.7056574,
              31.2568035
            ],
            [
              75.705639,
              31.25682
            ],
            [
              75.7055946,
              31.2568599
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422439516",
      "properties": {
        "id": "osm_422439516",
        "osmId": "422439516",
        "name": "Building 422439516",
        "shortName": "Building 422439516",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7074927,
          31.2599905
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7076162,
              31.2601976
            ],
            [
              75.7076007,
              31.2599662
            ],
            [
              75.7074796,
              31.2599721
            ],
            [
              75.7074788,
              31.2599602
            ],
            [
              75.7076012,
              31.2599542
            ],
            [
              75.7075947,
              31.2598779
            ],
            [
              75.7075932,
              31.2598335
            ],
            [
              75.7073409,
              31.2598457
            ],
            [
              75.707348,
              31.2599533
            ],
            [
              75.7073664,
              31.2599525
            ],
            [
              75.7073681,
              31.2599775
            ],
            [
              75.7073761,
              31.2599867
            ],
            [
              75.7073989,
              31.2599913
            ],
            [
              75.7075449,
              31.2599838
            ],
            [
              75.7075598,
              31.2601976
            ],
            [
              75.7076162,
              31.2601976
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422439519",
      "properties": {
        "id": "osm_422439519",
        "osmId": "422439519",
        "name": "Building 422439519",
        "shortName": "Building 422439519",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7077333,
          31.2600853
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7076907,
              31.2602381
            ],
            [
              75.7077403,
              31.2602289
            ],
            [
              75.7077215,
              31.2601143
            ],
            [
              75.7078234,
              31.2601074
            ],
            [
              75.7078207,
              31.2599183
            ],
            [
              75.7077101,
              31.2599192
            ],
            [
              75.7076692,
              31.2599184
            ],
            [
              75.7076907,
              31.2602381
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422439521",
      "properties": {
        "id": "osm_422439521",
        "osmId": "422439521",
        "name": "Building 422439521",
        "shortName": "Building 422439521",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7077737,
          31.2599344
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7076237,
              31.2599351
            ],
            [
              75.7076646,
              31.2599359
            ],
            [
              75.7076654,
              31.2599042
            ],
            [
              75.707821,
              31.2599071
            ],
            [
              75.7078193,
              31.2599774
            ],
            [
              75.7078957,
              31.2599788
            ],
            [
              75.7078952,
              31.2599951
            ],
            [
              75.7079367,
              31.2599959
            ],
            [
              75.7079401,
              31.2598597
            ],
            [
              75.7076257,
              31.2598539
            ],
            [
              75.7076237,
              31.2599351
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422547035",
      "properties": {
        "id": "osm_422547035",
        "osmId": "422547035",
        "name": "Building 422547035",
        "shortName": "Building 422547035",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.707869,
          31.2590922
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7078034,
              31.2592439
            ],
            [
              75.707882,
              31.2592378
            ],
            [
              75.7079008,
              31.2592745
            ],
            [
              75.7079855,
              31.2592714
            ],
            [
              75.7079805,
              31.2591727
            ],
            [
              75.7078525,
              31.2591782
            ],
            [
              75.7078659,
              31.2591232
            ],
            [
              75.7079963,
              31.2591132
            ],
            [
              75.7079817,
              31.2589737
            ],
            [
              75.707906,
              31.2589796
            ],
            [
              75.7078998,
              31.2589205
            ],
            [
              75.7078095,
              31.2589275
            ],
            [
              75.7078133,
              31.2589638
            ],
            [
              75.7078482,
              31.2589612
            ],
            [
              75.7078534,
              31.2590106
            ],
            [
              75.7078093,
              31.259014
            ],
            [
              75.7078122,
              31.2590413
            ],
            [
              75.7077822,
              31.2590436
            ],
            [
              75.7077934,
              31.2591494
            ],
            [
              75.7078034,
              31.2592439
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422547443",
      "properties": {
        "id": "osm_422547443",
        "osmId": "422547443",
        "name": "Building 422547443",
        "shortName": "Building 422547443",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7036029,
          31.2483477
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7034876,
              31.2489915
            ],
            [
              75.7036968,
              31.2489938
            ],
            [
              75.7037078,
              31.248518
            ],
            [
              75.7037082,
              31.2484985
            ],
            [
              75.7037175,
              31.2480972
            ],
            [
              75.7037179,
              31.2480778
            ],
            [
              75.703729,
              31.247595
            ],
            [
              75.7035332,
              31.2475928
            ],
            [
              75.7035222,
              31.2480695
            ],
            [
              75.7035222,
              31.2480891
            ],
            [
              75.7035039,
              31.2484917
            ],
            [
              75.7035032,
              31.2485135
            ],
            [
              75.7034876,
              31.2489915
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422547444",
      "properties": {
        "id": "osm_422547444",
        "osmId": "422547444",
        "name": "Building 422547444",
        "shortName": "Building 422547444",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.703837,
          31.2486022
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7037078,
              31.248518
            ],
            [
              75.7038363,
              31.2485215
            ],
            [
              75.7038256,
              31.2489973
            ],
            [
              75.7040321,
              31.2490042
            ],
            [
              75.7040428,
              31.2484343
            ],
            [
              75.703839,
              31.2484263
            ],
            [
              75.7038336,
              31.248502
            ],
            [
              75.7037082,
              31.2484985
            ],
            [
              75.7037078,
              31.248518
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422547445",
      "properties": {
        "id": "osm_422547445",
        "osmId": "422547445",
        "name": "Building 422547445",
        "shortName": "Building 422547445",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7034272,
          31.2485036
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7033761,
              31.2485112
            ],
            [
              75.7035032,
              31.2485135
            ],
            [
              75.7035039,
              31.2484917
            ],
            [
              75.7033768,
              31.2484905
            ],
            [
              75.7033761,
              31.2485112
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422547446",
      "properties": {
        "id": "osm_422547446",
        "osmId": "422547446",
        "name": "Building 422547446",
        "shortName": "Building 422547446",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7038542,
          31.2479995
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7037175,
              31.2480972
            ],
            [
              75.7038475,
              31.248099
            ],
            [
              75.703846,
              31.248175
            ],
            [
              75.7040581,
              31.248178
            ],
            [
              75.7040694,
              31.2475976
            ],
            [
              75.7038655,
              31.2475947
            ],
            [
              75.703848,
              31.2480787
            ],
            [
              75.7037179,
              31.2480778
            ],
            [
              75.7037175,
              31.2480972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422547447",
      "properties": {
        "id": "osm_422547447",
        "osmId": "422547447",
        "name": "Building 422547447",
        "shortName": "Building 422547447",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7032784,
          31.2479349
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7035222,
              31.2480891
            ],
            [
              75.7033965,
              31.2480868
            ],
            [
              75.7033965,
              31.2481648
            ],
            [
              75.7033307,
              31.2481648
            ],
            [
              75.7033307,
              31.2481511
            ],
            [
              75.7032945,
              31.2481511
            ],
            [
              75.7032905,
              31.2481637
            ],
            [
              75.7032516,
              31.2481649
            ],
            [
              75.7031605,
              31.2481325
            ],
            [
              75.7031927,
              31.2480663
            ],
            [
              75.7031602,
              31.2480547
            ],
            [
              75.703194,
              31.247985
            ],
            [
              75.7031685,
              31.2479759
            ],
            [
              75.7032005,
              31.2479102
            ],
            [
              75.703226,
              31.2479193
            ],
            [
              75.703248,
              31.2478743
            ],
            [
              75.7031835,
              31.2478512
            ],
            [
              75.7032148,
              31.2477871
            ],
            [
              75.7031862,
              31.2477768
            ],
            [
              75.7032186,
              31.2477106
            ],
            [
              75.7031809,
              31.247697
            ],
            [
              75.7032073,
              31.2476432
            ],
            [
              75.7031703,
              31.24763
            ],
            [
              75.703207,
              31.247555
            ],
            [
              75.7033025,
              31.2475893
            ],
            [
              75.7033964,
              31.2475893
            ],
            [
              75.7033967,
              31.2480684
            ],
            [
              75.7035222,
              31.2480695
            ],
            [
              75.7035222,
              31.2480891
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548297",
      "properties": {
        "id": "osm_422548297",
        "osmId": "422548297",
        "name": "Building 422548297",
        "shortName": "Building 422548297",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7002384,
          31.249654
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6992729,
              31.249677
            ],
            [
              75.6992735,
              31.2496513
            ],
            [
              75.6991815,
              31.2496495
            ],
            [
              75.6991902,
              31.249324
            ],
            [
              75.6993915,
              31.2493279
            ],
            [
              75.6993827,
              31.2496609
            ],
            [
              75.6995328,
              31.2496639
            ],
            [
              75.6995388,
              31.2494418
            ],
            [
              75.6997259,
              31.2494454
            ],
            [
              75.6997199,
              31.2496682
            ],
            [
              75.6998606,
              31.249671
            ],
            [
              75.6998668,
              31.2494398
            ],
            [
              75.7000663,
              31.2494438
            ],
            [
              75.7000603,
              31.2496665
            ],
            [
              75.7001995,
              31.2496692
            ],
            [
              75.7002053,
              31.2494542
            ],
            [
              75.7003981,
              31.2494579
            ],
            [
              75.7003922,
              31.2496763
            ],
            [
              75.7005301,
              31.249679
            ],
            [
              75.7005357,
              31.2494707
            ],
            [
              75.700743,
              31.2494748
            ],
            [
              75.7007373,
              31.2496883
            ],
            [
              75.700871,
              31.2496909
            ],
            [
              75.700877,
              31.2494688
            ],
            [
              75.7010861,
              31.2494729
            ],
            [
              75.7010842,
              31.2495456
            ],
            [
              75.7011602,
              31.2495471
            ],
            [
              75.7011563,
              31.2496939
            ],
            [
              75.701071,
              31.2496922
            ],
            [
              75.7010646,
              31.2499366
            ],
            [
              75.7008596,
              31.2499326
            ],
            [
              75.7008652,
              31.2497212
            ],
            [
              75.7007399,
              31.2497188
            ],
            [
              75.7007343,
              31.2499339
            ],
            [
              75.7005167,
              31.2499297
            ],
            [
              75.7005222,
              31.2497203
            ],
            [
              75.7004063,
              31.2497181
            ],
            [
              75.700401,
              31.2499221
            ],
            [
              75.7001924,
              31.2499181
            ],
            [
              75.7001983,
              31.2496931
            ],
            [
              75.7000607,
              31.2496905
            ],
            [
              75.7000549,
              31.2499101
            ],
            [
              75.6998603,
              31.2499064
            ],
            [
              75.699866,
              31.2496884
            ],
            [
              75.6992729,
              31.249677
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548298",
      "properties": {
        "id": "osm_422548298",
        "osmId": "422548298",
        "name": "Building 422548298",
        "shortName": "Building 422548298",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6994567,
          31.2486939
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6987111,
              31.248758
            ],
            [
              75.6989083,
              31.2487763
            ],
            [
              75.6989271,
              31.2486289
            ],
            [
              75.6990683,
              31.2486421
            ],
            [
              75.6990498,
              31.2487882
            ],
            [
              75.6992616,
              31.2488079
            ],
            [
              75.6992694,
              31.2487468
            ],
            [
              75.6993906,
              31.248758
            ],
            [
              75.6993817,
              31.248828
            ],
            [
              75.6995355,
              31.2488423
            ],
            [
              75.6995456,
              31.2487637
            ],
            [
              75.6996701,
              31.2487753
            ],
            [
              75.6996607,
              31.2488493
            ],
            [
              75.6998798,
              31.2488697
            ],
            [
              75.6998975,
              31.2487312
            ],
            [
              75.7000077,
              31.2487414
            ],
            [
              75.6999877,
              31.2488976
            ],
            [
              75.7002224,
              31.2489195
            ],
            [
              75.7002652,
              31.2485849
            ],
            [
              75.7000387,
              31.2485638
            ],
            [
              75.7000199,
              31.248711
            ],
            [
              75.6998934,
              31.2486992
            ],
            [
              75.6999113,
              31.2485595
            ],
            [
              75.6997091,
              31.2485406
            ],
            [
              75.6996806,
              31.248764
            ],
            [
              75.6995307,
              31.2487501
            ],
            [
              75.6995585,
              31.2485316
            ],
            [
              75.6994371,
              31.2485203
            ],
            [
              75.6994101,
              31.2487319
            ],
            [
              75.6992641,
              31.2487183
            ],
            [
              75.6992916,
              31.2485023
            ],
            [
              75.6990891,
              31.2484834
            ],
            [
              75.6990722,
              31.2486161
            ],
            [
              75.6989365,
              31.2486035
            ],
            [
              75.6989542,
              31.2484646
            ],
            [
              75.6987508,
              31.2484457
            ],
            [
              75.6987111,
              31.248758
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548299",
      "properties": {
        "id": "osm_422548299",
        "osmId": "422548299",
        "name": "Building 422548299",
        "shortName": "Building 422548299",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6983496,
          31.2494969
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6980648,
              31.2495469
            ],
            [
              75.6980982,
              31.2493152
            ],
            [
              75.6984779,
              31.2493552
            ],
            [
              75.6984662,
              31.249436
            ],
            [
              75.6984999,
              31.2494396
            ],
            [
              75.6984913,
              31.2494997
            ],
            [
              75.6984589,
              31.2494963
            ],
            [
              75.6984473,
              31.2495767
            ],
            [
              75.6984112,
              31.2495729
            ],
            [
              75.6984138,
              31.2495544
            ],
            [
              75.6983274,
              31.2495453
            ],
            [
              75.6983232,
              31.2495741
            ],
            [
              75.6980648,
              31.2495469
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548300",
      "properties": {
        "id": "osm_422548300",
        "osmId": "422548300",
        "name": "Building 422548300",
        "shortName": "Building 422548300",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.699993,
          31.2513692
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6995713,
              31.2515451
            ],
            [
              75.6995925,
              31.2509805
            ],
            [
              75.699785,
              31.2509858
            ],
            [
              75.699767,
              31.2514641
            ],
            [
              75.6999129,
              31.2514681
            ],
            [
              75.6999309,
              31.2509876
            ],
            [
              75.7001313,
              31.2509931
            ],
            [
              75.7001141,
              31.2514509
            ],
            [
              75.7002362,
              31.2514543
            ],
            [
              75.7002539,
              31.2509829
            ],
            [
              75.7004774,
              31.250989
            ],
            [
              75.7004554,
              31.2515764
            ],
            [
              75.7002335,
              31.2515703
            ],
            [
              75.7002362,
              31.2514969
            ],
            [
              75.7001094,
              31.2514934
            ],
            [
              75.7001041,
              31.2516333
            ],
            [
              75.6999142,
              31.2516281
            ],
            [
              75.6999197,
              31.2514814
            ],
            [
              75.6997693,
              31.2514773
            ],
            [
              75.6997666,
              31.2515504
            ],
            [
              75.6995713,
              31.2515451
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548301",
      "properties": {
        "id": "osm_422548301",
        "osmId": "422548301",
        "name": "Building 422548301",
        "shortName": "Building 422548301",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7006301,
          31.2536687
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7005726,
              31.2539496
            ],
            [
              75.7005713,
              31.2539031
            ],
            [
              75.7005707,
              31.2538825
            ],
            [
              75.7005644,
              31.2536612
            ],
            [
              75.700564,
              31.2536452
            ],
            [
              75.7005577,
              31.2534227
            ],
            [
              75.7005572,
              31.2534056
            ],
            [
              75.7005552,
              31.2533351
            ],
            [
              75.7007187,
              31.2533317
            ],
            [
              75.7007208,
              31.2534068
            ],
            [
              75.7007212,
              31.2534205
            ],
            [
              75.7007342,
              31.2538767
            ],
            [
              75.7007347,
              31.253894
            ],
            [
              75.7007362,
              31.2539462
            ],
            [
              75.7005726,
              31.2539496
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548302",
      "properties": {
        "id": "osm_422548302",
        "osmId": "422548302",
        "name": "Building 422548302",
        "shortName": "Building 422548302",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7008818,
          31.25388
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7008046,
              31.2539714
            ],
            [
              75.7008018,
              31.2538929
            ],
            [
              75.7008012,
              31.2538756
            ],
            [
              75.7007966,
              31.2537434
            ],
            [
              75.7009776,
              31.2537387
            ],
            [
              75.7009822,
              31.2538721
            ],
            [
              75.7009824,
              31.2538875
            ],
            [
              75.7009856,
              31.2539668
            ],
            [
              75.7008046,
              31.2539714
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548303",
      "properties": {
        "id": "osm_422548303",
        "osmId": "422548303",
        "name": "Building 422548303",
        "shortName": "Building 422548303",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7008643,
          31.253357
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7008085,
              31.2534843
            ],
            [
              75.7008079,
              31.2534194
            ],
            [
              75.7008078,
              31.2534068
            ],
            [
              75.7008067,
              31.2532864
            ],
            [
              75.7003147,
              31.2532897
            ],
            [
              75.700314,
              31.2532091
            ],
            [
              75.7013828,
              31.2532019
            ],
            [
              75.7013834,
              31.2532749
            ],
            [
              75.7009492,
              31.2532778
            ],
            [
              75.7009503,
              31.2534033
            ],
            [
              75.7009505,
              31.2534194
            ],
            [
              75.7009511,
              31.2534834
            ],
            [
              75.7008085,
              31.2534843
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548304",
      "properties": {
        "id": "osm_422548304",
        "osmId": "422548304",
        "name": "Building 422548304",
        "shortName": "Building 422548304",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7011562,
          31.2536598
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7010745,
              31.2539471
            ],
            [
              75.7010726,
              31.2538867
            ],
            [
              75.7010725,
              31.2538713
            ],
            [
              75.7010616,
              31.2534182
            ],
            [
              75.7010611,
              31.2533998
            ],
            [
              75.7010592,
              31.2533212
            ],
            [
              75.7012255,
              31.2533182
            ],
            [
              75.7012275,
              31.2533987
            ],
            [
              75.7012279,
              31.2534148
            ],
            [
              75.7012332,
              31.2536326
            ],
            [
              75.7012336,
              31.2536498
            ],
            [
              75.7012389,
              31.2538665
            ],
            [
              75.7012393,
              31.2538814
            ],
            [
              75.7012408,
              31.2539442
            ],
            [
              75.7010745,
              31.2539471
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548305",
      "properties": {
        "id": "osm_422548305",
        "osmId": "422548305",
        "name": "Building 422548305",
        "shortName": "Building 422548305",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7004258,
          31.2538995
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7003339,
              31.2539543
            ],
            [
              75.70033,
              31.253826
            ],
            [
              75.7004936,
              31.2538224
            ],
            [
              75.7004955,
              31.2538848
            ],
            [
              75.7004961,
              31.2539043
            ],
            [
              75.7004975,
              31.2539507
            ],
            [
              75.7003339,
              31.2539543
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548306",
      "properties": {
        "id": "osm_422548306",
        "osmId": "422548306",
        "name": "Building 422548306",
        "shortName": "Building 422548306",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7004233,
          31.2536664
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.70033,
              31.2537261
            ],
            [
              75.7003261,
              31.2535931
            ],
            [
              75.7004924,
              31.2535896
            ],
            [
              75.700494,
              31.2536464
            ],
            [
              75.7004945,
              31.2536613
            ],
            [
              75.7004963,
              31.2537225
            ],
            [
              75.70033,
              31.2537261
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548307",
      "properties": {
        "id": "osm_422548307",
        "osmId": "422548307",
        "name": "Building 422548307",
        "shortName": "Building 422548307",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7004153,
          31.2534247
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7003256,
              31.2534844
            ],
            [
              75.7003222,
              31.2533468
            ],
            [
              75.7004818,
              31.2533439
            ],
            [
              75.7004833,
              31.2534079
            ],
            [
              75.7004837,
              31.253424
            ],
            [
              75.7004851,
              31.2534816
            ],
            [
              75.7003256,
              31.2534844
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548308",
      "properties": {
        "id": "osm_422548308",
        "osmId": "422548308",
        "name": "Building 422548308",
        "shortName": "Building 422548308",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7013302,
          31.2538847
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7013063,
              31.2539392
            ],
            [
              75.7013043,
              31.2538802
            ],
            [
              75.7013038,
              31.2538642
            ],
            [
              75.7013022,
              31.2538177
            ],
            [
              75.7013921,
              31.2538155
            ],
            [
              75.7013962,
              31.253937
            ],
            [
              75.7013063,
              31.2539392
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548311",
      "properties": {
        "id": "osm_422548311",
        "osmId": "422548311",
        "name": "Building 422548311",
        "shortName": "Building 422548311",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7005223,
          31.2536551
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7004945,
              31.2536613
            ],
            [
              75.7005644,
              31.2536612
            ],
            [
              75.700564,
              31.2536452
            ],
            [
              75.700494,
              31.2536464
            ],
            [
              75.7004945,
              31.2536613
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548312",
      "properties": {
        "id": "osm_422548312",
        "osmId": "422548312",
        "name": "Building 422548312",
        "shortName": "Building 422548312",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7005259,
          31.2538958
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7004961,
              31.2539043
            ],
            [
              75.7005713,
              31.2539031
            ],
            [
              75.7005707,
              31.2538825
            ],
            [
              75.7004955,
              31.2538848
            ],
            [
              75.7004961,
              31.2539043
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548313",
      "properties": {
        "id": "osm_422548313",
        "osmId": "422548313",
        "name": "Building 422548313",
        "shortName": "Building 422548313",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7007613,
          31.2538866
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7007347,
              31.253894
            ],
            [
              75.7008018,
              31.2538929
            ],
            [
              75.7008012,
              31.2538756
            ],
            [
              75.7007342,
              31.2538767
            ],
            [
              75.7007347,
              31.253894
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548314",
      "properties": {
        "id": "osm_422548314",
        "osmId": "422548314",
        "name": "Building 422548314",
        "shortName": "Building 422548314",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7005131,
          31.2534168
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7004837,
              31.253424
            ],
            [
              75.7005577,
              31.2534227
            ],
            [
              75.7005572,
              31.2534056
            ],
            [
              75.7004833,
              31.2534079
            ],
            [
              75.7004837,
              31.253424
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548315",
      "properties": {
        "id": "osm_422548315",
        "osmId": "422548315",
        "name": "Building 422548315",
        "shortName": "Building 422548315",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7007558,
          31.2534148
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7007212,
              31.2534205
            ],
            [
              75.7008079,
              31.2534194
            ],
            [
              75.7008078,
              31.2534068
            ],
            [
              75.7007208,
              31.2534068
            ],
            [
              75.7007212,
              31.2534205
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548316",
      "properties": {
        "id": "osm_422548316",
        "osmId": "422548316",
        "name": "Building 422548316",
        "shortName": "Building 422548316",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7009948,
          31.253412
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7009505,
              31.2534194
            ],
            [
              75.7010616,
              31.2534182
            ],
            [
              75.7010611,
              31.2533998
            ],
            [
              75.7009503,
              31.2534033
            ],
            [
              75.7009505,
              31.2534194
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548317",
      "properties": {
        "id": "osm_422548317",
        "osmId": "422548317",
        "name": "Building 422548317",
        "shortName": "Building 422548317",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7012556,
          31.2534075
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7012279,
              31.2534148
            ],
            [
              75.7012976,
              31.2534137
            ],
            [
              75.7012972,
              31.2533953
            ],
            [
              75.7012275,
              31.2533987
            ],
            [
              75.7012279,
              31.2534148
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548318",
      "properties": {
        "id": "osm_422548318",
        "osmId": "422548318",
        "name": "Building 422548318",
        "shortName": "Building 422548318",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7010184,
          31.253881
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7009824,
              31.2538875
            ],
            [
              75.7010726,
              31.2538867
            ],
            [
              75.7010725,
              31.2538713
            ],
            [
              75.7009822,
              31.2538721
            ],
            [
              75.7009824,
              31.2538875
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548319",
      "properties": {
        "id": "osm_422548319",
        "osmId": "422548319",
        "name": "Building 422548319",
        "shortName": "Building 422548319",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7012651,
          31.2538747
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7012393,
              31.2538814
            ],
            [
              75.7013043,
              31.2538802
            ],
            [
              75.7013038,
              31.2538642
            ],
            [
              75.7012389,
              31.2538665
            ],
            [
              75.7012393,
              31.2538814
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548320",
      "properties": {
        "id": "osm_422548320",
        "osmId": "422548320",
        "name": "Building 422548320",
        "shortName": "Building 422548320",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7012583,
          31.2536427
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7012336,
              31.2536498
            ],
            [
              75.7012957,
              31.2536498
            ],
            [
              75.7012953,
              31.2536314
            ],
            [
              75.7012332,
              31.2536326
            ],
            [
              75.7012336,
              31.2536498
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548856",
      "properties": {
        "id": "osm_422548856",
        "osmId": "422548856",
        "name": "Building 422548856",
        "shortName": "Building 422548856",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7009906,
          31.2546928
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7007827,
              31.2547755
            ],
            [
              75.7007834,
              31.2546409
            ],
            [
              75.7008613,
              31.2546412
            ],
            [
              75.7008615,
              31.2545888
            ],
            [
              75.7010249,
              31.2545894
            ],
            [
              75.7010246,
              31.2546582
            ],
            [
              75.701107,
              31.2546534
            ],
            [
              75.7011069,
              31.2545872
            ],
            [
              75.7012224,
              31.2545876
            ],
            [
              75.7012218,
              31.2547248
            ],
            [
              75.7011411,
              31.2547245
            ],
            [
              75.7011409,
              31.254777
            ],
            [
              75.7009775,
              31.2547764
            ],
            [
              75.7009777,
              31.2547511
            ],
            [
              75.7009118,
              31.2547509
            ],
            [
              75.7009117,
              31.2547759
            ],
            [
              75.7007827,
              31.2547755
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548857",
      "properties": {
        "id": "osm_422548857",
        "osmId": "422548857",
        "name": "Building 422548857",
        "shortName": "Building 422548857",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7014568,
          31.2550446
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7013348,
              31.2552345
            ],
            [
              75.7014869,
              31.2552311
            ],
            [
              75.7014848,
              31.2551607
            ],
            [
              75.7015634,
              31.255159
            ],
            [
              75.7015591,
              31.255015
            ],
            [
              75.7014876,
              31.2550165
            ],
            [
              75.701486,
              31.2549642
            ],
            [
              75.7015592,
              31.2549626
            ],
            [
              75.7015563,
              31.2548665
            ],
            [
              75.7013788,
              31.2548704
            ],
            [
              75.7013807,
              31.2549315
            ],
            [
              75.7013258,
              31.2549327
            ],
            [
              75.7013348,
              31.2552345
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422548858",
      "properties": {
        "id": "osm_422548858",
        "osmId": "422548858",
        "name": "Building 422548858",
        "shortName": "Building 422548858",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7013674,
          31.2547385
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7012218,
              31.2547248
            ],
            [
              75.701252,
              31.2547321
            ],
            [
              75.7012922,
              31.2547436
            ],
            [
              75.7013271,
              31.2547711
            ],
            [
              75.7013593,
              31.2548032
            ],
            [
              75.7013754,
              31.2548353
            ],
            [
              75.7013788,
              31.2548704
            ],
            [
              75.7015563,
              31.2548665
            ],
            [
              75.7015336,
              31.2548078
            ],
            [
              75.7015122,
              31.2547688
            ],
            [
              75.7014934,
              31.2547413
            ],
            [
              75.7014532,
              31.2546977
            ],
            [
              75.7014076,
              31.2546541
            ],
            [
              75.7013485,
              31.2546243
            ],
            [
              75.7012895,
              31.2546014
            ],
            [
              75.7012224,
              31.2545876
            ],
            [
              75.7012218,
              31.2547248
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422556249",
      "properties": {
        "id": "osm_422556249",
        "osmId": "422556249",
        "name": "Building 422556249",
        "shortName": "Building 422556249",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7038698,
          31.2519593
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7027576,
              31.2522731
            ],
            [
              75.7038235,
              31.2522604
            ],
            [
              75.7038267,
              31.2522265
            ],
            [
              75.7038385,
              31.2521837
            ],
            [
              75.70386,
              31.2521424
            ],
            [
              75.703869,
              31.2521285
            ],
            [
              75.7038895,
              31.2520966
            ],
            [
              75.7039163,
              31.2520576
            ],
            [
              75.7039539,
              31.2520163
            ],
            [
              75.7039995,
              31.2519796
            ],
            [
              75.7040477,
              31.2519498
            ],
            [
              75.7040987,
              31.2519269
            ],
            [
              75.7041577,
              31.2519085
            ],
            [
              75.7042052,
              31.2518984
            ],
            [
              75.7042221,
              31.2518948
            ],
            [
              75.7042864,
              31.2518879
            ],
            [
              75.7043284,
              31.2518874
            ],
            [
              75.7043723,
              31.2518879
            ],
            [
              75.7043669,
              31.2513078
            ],
            [
              75.7039485,
              31.2515371
            ],
            [
              75.7040611,
              31.2517755
            ],
            [
              75.7039351,
              31.2518237
            ],
            [
              75.7038305,
              31.2516013
            ],
            [
              75.7033343,
              31.2518627
            ],
            [
              75.7037473,
              31.2520094
            ],
            [
              75.7036856,
              31.2521103
            ],
            [
              75.703235,
              31.2519521
            ],
            [
              75.7027576,
              31.2522731
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422556250",
      "properties": {
        "id": "osm_422556250",
        "osmId": "422556250",
        "name": "Building 422556250",
        "shortName": "Building 422556250",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7040969,
          31.2520576
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7040844,
              31.2522207
            ],
            [
              75.7040839,
              31.2521986
            ],
            [
              75.7040906,
              31.2521734
            ],
            [
              75.7041041,
              31.2521493
            ],
            [
              75.7041161,
              31.2521287
            ],
            [
              75.7041376,
              31.2521034
            ],
            [
              75.7041631,
              31.2520782
            ],
            [
              75.7041979,
              31.2520587
            ],
            [
              75.7042382,
              31.2520381
            ],
            [
              75.7042797,
              31.252022
            ],
            [
              75.7043052,
              31.2520165
            ],
            [
              75.7043293,
              31.2520202
            ],
            [
              75.7043284,
              31.2518874
            ],
            [
              75.7042864,
              31.2518879
            ],
            [
              75.7042221,
              31.2518948
            ],
            [
              75.7042052,
              31.2518984
            ],
            [
              75.7041577,
              31.2519085
            ],
            [
              75.7040987,
              31.2519269
            ],
            [
              75.7040477,
              31.2519498
            ],
            [
              75.7039995,
              31.2519796
            ],
            [
              75.7039539,
              31.2520163
            ],
            [
              75.7039163,
              31.2520576
            ],
            [
              75.7038895,
              31.2520966
            ],
            [
              75.703869,
              31.2521285
            ],
            [
              75.70386,
              31.2521424
            ],
            [
              75.7038385,
              31.2521837
            ],
            [
              75.7038267,
              31.2522265
            ],
            [
              75.7040844,
              31.2522207
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422556253",
      "properties": {
        "id": "osm_422556253",
        "osmId": "422556253",
        "name": "Building 422556253",
        "shortName": "Building 422556253",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7042643,
          31.2521756
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7042095,
              31.2522172
            ],
            [
              75.7043269,
              31.2522133
            ],
            [
              75.7043277,
              31.2521365
            ],
            [
              75.704313,
              31.2521342
            ],
            [
              75.7042945,
              31.2521381
            ],
            [
              75.7042677,
              31.2521507
            ],
            [
              75.7042491,
              31.2521658
            ],
            [
              75.7042288,
              31.2521828
            ],
            [
              75.7042167,
              31.2522
            ],
            [
              75.7042095,
              31.2522172
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422732974",
      "properties": {
        "id": "osm_422732974",
        "osmId": "422732974",
        "name": "Building 422732974",
        "shortName": "Building 422732974",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.708099,
          31.2584703
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7081253,
              31.2584055
            ],
            [
              75.7081002,
              31.2584021
            ],
            [
              75.7080724,
              31.2584045
            ],
            [
              75.7080486,
              31.258415
            ],
            [
              75.7080302,
              31.2584316
            ],
            [
              75.7080191,
              31.2584525
            ],
            [
              75.7080167,
              31.2584753
            ],
            [
              75.7080231,
              31.2584976
            ],
            [
              75.7080377,
              31.2585168
            ],
            [
              75.708047,
              31.2585229
            ],
            [
              75.7080589,
              31.2585308
            ],
            [
              75.7080843,
              31.2585382
            ],
            [
              75.708108,
              31.2585384
            ],
            [
              75.7081307,
              31.2585328
            ],
            [
              75.7081505,
              31.2585218
            ],
            [
              75.7081644,
              31.2585084
            ],
            [
              75.7081751,
              31.2584877
            ],
            [
              75.7081777,
              31.2584676
            ],
            [
              75.7081734,
              31.2584477
            ],
            [
              75.7081625,
              31.2584297
            ],
            [
              75.708146,
              31.2584152
            ],
            [
              75.7081253,
              31.2584055
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422737297",
      "properties": {
        "id": "osm_422737297",
        "osmId": "422737297",
        "name": "Building 422737297",
        "shortName": "Building 422737297",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7013535,
          31.2508716
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7008421,
              31.2511754
            ],
            [
              75.7008738,
              31.2503982
            ],
            [
              75.7021138,
              31.2504216
            ],
            [
              75.7020956,
              31.2511873
            ],
            [
              75.7008421,
              31.2511754
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422738863",
      "properties": {
        "id": "osm_422738863",
        "osmId": "422738863",
        "name": "Building 422738863",
        "shortName": "Building 422738863",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7004983,
          31.2487487
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7004581,
              31.2486813
            ],
            [
              75.7005815,
              31.2486928
            ],
            [
              75.70056,
              31.248851
            ],
            [
              75.700434,
              31.2488372
            ],
            [
              75.7004581,
              31.2486813
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422738883",
      "properties": {
        "id": "osm_422738883",
        "osmId": "422738883",
        "name": "Building 422738883",
        "shortName": "Building 422738883",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7013053,
          31.2540958
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7012474,
              31.2542
            ],
            [
              75.7012408,
              31.2539442
            ],
            [
              75.7013962,
              31.253937
            ],
            [
              75.7013949,
              31.2541977
            ],
            [
              75.7012474,
              31.2542
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422738888",
      "properties": {
        "id": "osm_422738888",
        "osmId": "422738888",
        "name": "Building 422738888",
        "shortName": "Building 422738888",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7001679,
          31.2547441
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7002104,
              31.2547846
            ],
            [
              75.7001836,
              31.2546698
            ],
            [
              75.7001041,
              31.2546834
            ],
            [
              75.700131,
              31.2547982
            ],
            [
              75.7002104,
              31.2547846
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422738889",
      "properties": {
        "id": "osm_422738889",
        "osmId": "422738889",
        "name": "Building 422738889",
        "shortName": "Building 422738889",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7005114,
          31.2550821
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7004844,
              31.2551273
            ],
            [
              75.7004818,
              31.2550154
            ],
            [
              75.700552,
              31.2550142
            ],
            [
              75.7005546,
              31.2551261
            ],
            [
              75.7004844,
              31.2551273
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422738890",
      "properties": {
        "id": "osm_422738890",
        "osmId": "422738890",
        "name": "Building 422738890",
        "shortName": "Building 422738890",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.700716,
          31.2553511
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.700699,
              31.2553884
            ],
            [
              75.7006971,
              31.2552957
            ],
            [
              75.7007415,
              31.2552951
            ],
            [
              75.7007434,
              31.2553877
            ],
            [
              75.700699,
              31.2553884
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422738891",
      "properties": {
        "id": "osm_422738891",
        "osmId": "422738891",
        "name": "Building 422738891",
        "shortName": "Building 422738891",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7008661,
          31.2553722
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7008236,
              31.2553857
            ],
            [
              75.7008226,
              31.2553546
            ],
            [
              75.7009297,
              31.2553521
            ],
            [
              75.7009308,
              31.2553831
            ],
            [
              75.7008236,
              31.2553857
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422738892",
      "properties": {
        "id": "osm_422738892",
        "osmId": "422738892",
        "name": "Building 422738892",
        "shortName": "Building 422738892",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7006663,
          31.2555509
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7006146,
              31.2555778
            ],
            [
              75.7007444,
              31.255577
            ],
            [
              75.7007439,
              31.2555107
            ],
            [
              75.7006141,
              31.2555114
            ],
            [
              75.7006146,
              31.2555778
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422738893",
      "properties": {
        "id": "osm_422738893",
        "osmId": "422738893",
        "name": "Building 422738893",
        "shortName": "Building 422738893",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7007648,
          31.2550821
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7007337,
              31.2551275
            ],
            [
              75.7008142,
              31.2551275
            ],
            [
              75.7008115,
              31.2550152
            ],
            [
              75.700731,
              31.2550129
            ],
            [
              75.7007337,
              31.2551275
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422820537",
      "properties": {
        "id": "osm_422820537",
        "osmId": "422820537",
        "name": "Building 422820537",
        "shortName": "Building 422820537",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7002347,
          31.2504513
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7000367,
              31.2504646
            ],
            [
              75.7005316,
              31.2504715
            ],
            [
              75.7005329,
              31.2504337
            ],
            [
              75.7000354,
              31.2504222
            ],
            [
              75.7000367,
              31.2504646
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422820538",
      "properties": {
        "id": "osm_422820538",
        "osmId": "422820538",
        "name": "Building 422820538",
        "shortName": "Building 422820538",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7005469,
          31.2506348
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7005249,
              31.2507157
            ],
            [
              75.7005329,
              31.2505117
            ],
            [
              75.7005812,
              31.2505128
            ],
            [
              75.7005705,
              31.250718
            ],
            [
              75.7005249,
              31.2507157
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422820545",
      "properties": {
        "id": "osm_422820545",
        "osmId": "422820545",
        "name": "Building 422820545",
        "shortName": "Building 422820545",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7037718,
          31.249371
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7035372,
              31.2494658
            ],
            [
              75.7035395,
              31.249319
            ],
            [
              75.7036237,
              31.24932
            ],
            [
              75.7036247,
              31.2492565
            ],
            [
              75.7041029,
              31.2492619
            ],
            [
              75.7041009,
              31.2493909
            ],
            [
              75.7039406,
              31.249389
            ],
            [
              75.7039393,
              31.2494704
            ],
            [
              75.7035372,
              31.2494658
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422823418",
      "properties": {
        "id": "osm_422823418",
        "osmId": "422823418",
        "name": "Building 422823418",
        "shortName": "Building 422823418",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7047406,
          31.2510204
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.704579,
              31.2510471
            ],
            [
              75.7045786,
              31.2510146
            ],
            [
              75.7046423,
              31.2510141
            ],
            [
              75.7046417,
              31.2509654
            ],
            [
              75.7049921,
              31.2509622
            ],
            [
              75.7049931,
              31.2510433
            ],
            [
              75.7049611,
              31.2510436
            ],
            [
              75.7046983,
              31.251046
            ],
            [
              75.704579,
              31.2510471
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422823419",
      "properties": {
        "id": "osm_422823419",
        "osmId": "422823419",
        "name": "Building 422823419",
        "shortName": "Building 422823419",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.704804,
          31.2510579
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7046983,
              31.251046
            ],
            [
              75.7047011,
              31.251078
            ],
            [
              75.7049613,
              31.2510757
            ],
            [
              75.7049611,
              31.2510436
            ],
            [
              75.7046983,
              31.251046
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422823423",
      "properties": {
        "id": "osm_422823423",
        "osmId": "422823423",
        "name": "Building 422823423",
        "shortName": "Building 422823423",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7046626,
          31.25253
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7043734,
              31.2523824
            ],
            [
              75.7045974,
              31.2528481
            ],
            [
              75.7048036,
              31.2528499
            ],
            [
              75.7048034,
              31.2525364
            ],
            [
              75.7048032,
              31.2524904
            ],
            [
              75.7048029,
              31.2523748
            ],
            [
              75.7047434,
              31.252376
            ],
            [
              75.7043734,
              31.2523824
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422823424",
      "properties": {
        "id": "osm_422823424",
        "osmId": "422823424",
        "name": "Building 422823424",
        "shortName": "Building 422823424",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7048382,
          31.2527005
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7048578,
              31.2528855
            ],
            [
              75.7048585,
              31.2527878
            ],
            [
              75.7048574,
              31.2527245
            ],
            [
              75.7048577,
              31.2526356
            ],
            [
              75.7048582,
              31.252535
            ],
            [
              75.7048584,
              31.2524884
            ],
            [
              75.7048032,
              31.2524904
            ],
            [
              75.7048034,
              31.2525364
            ],
            [
              75.7048036,
              31.2528499
            ],
            [
              75.7048037,
              31.252887
            ],
            [
              75.7048578,
              31.2528855
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422823426",
      "properties": {
        "id": "osm_422823426",
        "osmId": "422823426",
        "name": "Building 422823426",
        "shortName": "Building 422823426",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7049094,
          31.2526728
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7048585,
              31.2527878
            ],
            [
              75.7049719,
              31.252787
            ],
            [
              75.7049722,
              31.2527228
            ],
            [
              75.7049759,
              31.2526334
            ],
            [
              75.704974,
              31.2524875
            ],
            [
              75.7048584,
              31.2524884
            ],
            [
              75.7048577,
              31.2526356
            ],
            [
              75.7048574,
              31.2527245
            ],
            [
              75.7048585,
              31.2527878
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422823427",
      "properties": {
        "id": "osm_422823427",
        "osmId": "422823427",
        "name": "Building 422823427",
        "shortName": "Building 422823427",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7049076,
          31.252631
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7048574,
              31.2527245
            ],
            [
              75.7049722,
              31.2527228
            ],
            [
              75.7049759,
              31.2526334
            ],
            [
              75.704974,
              31.2524875
            ],
            [
              75.7048584,
              31.2524884
            ],
            [
              75.7048577,
              31.2526356
            ],
            [
              75.7048574,
              31.2527245
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422823428",
      "properties": {
        "id": "osm_422823428",
        "osmId": "422823428",
        "name": "Building 422823428",
        "shortName": "Building 422823428",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7049048,
          31.2525942
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7048577,
              31.2526356
            ],
            [
              75.7049759,
              31.2526334
            ],
            [
              75.7049746,
              31.2525313
            ],
            [
              75.7048582,
              31.252535
            ],
            [
              75.7048577,
              31.2526356
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422823431",
      "properties": {
        "id": "osm_422823431",
        "osmId": "422823431",
        "name": "Building 422823431",
        "shortName": "Building 422823431",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7047046,
          31.2551026
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7041875,
              31.2555725
            ],
            [
              75.70418,
              31.2544427
            ],
            [
              75.7049159,
              31.254458
            ],
            [
              75.7053925,
              31.2550042
            ],
            [
              75.7053642,
              31.2555656
            ],
            [
              75.7041875,
              31.2555725
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422823980",
      "properties": {
        "id": "osm_422823980",
        "osmId": "422823980",
        "name": "Building 422823980",
        "shortName": "Building 422823980",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7077749,
          31.2593094
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7075612,
              31.2593772
            ],
            [
              75.7075907,
              31.2592121
            ],
            [
              75.7077791,
              31.2592044
            ],
            [
              75.7077891,
              31.2592989
            ],
            [
              75.7078677,
              31.2592928
            ],
            [
              75.7078847,
              31.2593234
            ],
            [
              75.7079712,
              31.2593264
            ],
            [
              75.7079689,
              31.2593726
            ],
            [
              75.7075612,
              31.2593772
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422823981",
      "properties": {
        "id": "osm_422823981",
        "osmId": "422823981",
        "name": "Building 422823981",
        "shortName": "Building 422823981",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.708933,
          31.2593564
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7088853,
              31.259469
            ],
            [
              75.7088451,
              31.25943
            ],
            [
              75.7089255,
              31.2593612
            ],
            [
              75.7089497,
              31.2593291
            ],
            [
              75.7088719,
              31.2592901
            ],
            [
              75.7089228,
              31.2592007
            ],
            [
              75.7090596,
              31.2592626
            ],
            [
              75.7090382,
              31.2593154
            ],
            [
              75.708947,
              31.2594369
            ],
            [
              75.7088853,
              31.259469
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422886524",
      "properties": {
        "id": "osm_422886524",
        "osmId": "422886524",
        "name": "Building 422886524",
        "shortName": "Building 422886524",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7028183,
          31.251316
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.702922,
              31.2512944
            ],
            [
              75.702925,
              31.2513233
            ],
            [
              75.702917,
              31.2513533
            ],
            [
              75.7028979,
              31.2513795
            ],
            [
              75.7028699,
              31.2513988
            ],
            [
              75.702836,
              31.2514093
            ],
            [
              75.7027999,
              31.2514098
            ],
            [
              75.7027657,
              31.2514001
            ],
            [
              75.7027371,
              31.2513814
            ],
            [
              75.7027171,
              31.2513558
            ],
            [
              75.7027081,
              31.2513263
            ],
            [
              75.7027107,
              31.251296
            ],
            [
              75.7027246,
              31.2512679
            ],
            [
              75.7027484,
              31.2512453
            ],
            [
              75.7027794,
              31.2512304
            ],
            [
              75.7028145,
              31.2512249
            ],
            [
              75.7028497,
              31.2512293
            ],
            [
              75.7028813,
              31.2512432
            ],
            [
              75.7029061,
              31.2512651
            ],
            [
              75.7029302,
              31.2512629
            ],
            [
              75.7029043,
              31.2512353
            ],
            [
              75.7028697,
              31.251216
            ],
            [
              75.7028297,
              31.251207
            ],
            [
              75.7027885,
              31.251209
            ],
            [
              75.70275,
              31.2512219
            ],
            [
              75.7027182,
              31.2512445
            ],
            [
              75.7026962,
              31.2512744
            ],
            [
              75.7026862,
              31.2513087
            ],
            [
              75.7026892,
              31.2513439
            ],
            [
              75.7027049,
              31.2513766
            ],
            [
              75.7027347,
              31.2514055
            ],
            [
              75.7027741,
              31.2514241
            ],
            [
              75.7028185,
              31.2514301
            ],
            [
              75.7028627,
              31.2514229
            ],
            [
              75.7029015,
              31.2514034
            ],
            [
              75.7029302,
              31.2513737
            ],
            [
              75.7029454,
              31.2513375
            ],
            [
              75.7029454,
              31.2512991
            ],
            [
              75.702922,
              31.2512944
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422886525",
      "properties": {
        "id": "osm_422886525",
        "osmId": "422886525",
        "name": "Building 422886525",
        "shortName": "Building 422886525",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7028456,
          31.251306
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7029147,
              31.2512809
            ],
            [
              75.7028383,
              31.2513011
            ],
            [
              75.7028326,
              31.2512973
            ],
            [
              75.7028257,
              31.2512952
            ],
            [
              75.7028185,
              31.2512951
            ],
            [
              75.7028115,
              31.2512969
            ],
            [
              75.7028056,
              31.2513005
            ],
            [
              75.7028013,
              31.2513055
            ],
            [
              75.702799,
              31.2513114
            ],
            [
              75.702799,
              31.2513176
            ],
            [
              75.7028014,
              31.2513235
            ],
            [
              75.7028057,
              31.2513285
            ],
            [
              75.7028122,
              31.2513322
            ],
            [
              75.7028197,
              31.2513339
            ],
            [
              75.7028275,
              31.2513333
            ],
            [
              75.7028346,
              31.2513305
            ],
            [
              75.7028401,
              31.2513258
            ],
            [
              75.7028435,
              31.2513198
            ],
            [
              75.7028444,
              31.2513132
            ],
            [
              75.702922,
              31.2512944
            ],
            [
              75.7029454,
              31.2512991
            ],
            [
              75.7029302,
              31.2512629
            ],
            [
              75.7029061,
              31.2512651
            ],
            [
              75.7029147,
              31.2512809
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422886528",
      "properties": {
        "id": "osm_422886528",
        "osmId": "422886528",
        "name": "Building 422886528",
        "shortName": "Building 422886528",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7028093,
          31.2515194
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7028809,
              31.251528
            ],
            [
              75.7028736,
              31.2515469
            ],
            [
              75.7028595,
              31.2515628
            ],
            [
              75.7028402,
              31.2515739
            ],
            [
              75.7028178,
              31.2515792
            ],
            [
              75.7027945,
              31.251578
            ],
            [
              75.7027729,
              31.2515705
            ],
            [
              75.7027553,
              31.2515574
            ],
            [
              75.7027436,
              31.2515402
            ],
            [
              75.7027396,
              31.2515232
            ],
            [
              75.7027389,
              31.2515203
            ],
            [
              75.7027408,
              31.2515085
            ],
            [
              75.7027422,
              31.2515001
            ],
            [
              75.7027529,
              31.251482
            ],
            [
              75.7027701,
              31.251468
            ],
            [
              75.7027917,
              31.2514595
            ],
            [
              75.7028153,
              31.2514575
            ],
            [
              75.7028362,
              31.2514618
            ],
            [
              75.7028584,
              31.2514732
            ],
            [
              75.7028731,
              31.2514892
            ],
            [
              75.7028808,
              31.251508
            ],
            [
              75.7028998,
              31.2515155
            ],
            [
              75.7028939,
              31.2514916
            ],
            [
              75.7028786,
              31.2514696
            ],
            [
              75.7028557,
              31.2514532
            ],
            [
              75.7028277,
              31.2514442
            ],
            [
              75.7027978,
              31.2514437
            ],
            [
              75.7027693,
              31.2514517
            ],
            [
              75.7027456,
              31.2514673
            ],
            [
              75.7027293,
              31.2514888
            ],
            [
              75.7027223,
              31.2515136
            ],
            [
              75.7027253,
              31.2515391
            ],
            [
              75.702738,
              31.2515622
            ],
            [
              75.7027578,
              31.2515798
            ],
            [
              75.7027831,
              31.251591
            ],
            [
              75.7028113,
              31.2515948
            ],
            [
              75.7028394,
              31.2515908
            ],
            [
              75.7028646,
              31.2515794
            ],
            [
              75.7028843,
              31.2515618
            ],
            [
              75.7028964,
              31.2515397
            ],
            [
              75.7028809,
              31.251528
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422886529",
      "properties": {
        "id": "osm_422886529",
        "osmId": "422886529",
        "name": "Building 422886529",
        "shortName": "Building 422886529",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7028866,
          31.2515238
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7028809,
              31.251528
            ],
            [
              75.7028809,
              31.2515233
            ],
            [
              75.7028808,
              31.251508
            ],
            [
              75.7028998,
              31.2515155
            ],
            [
              75.7028964,
              31.2515397
            ],
            [
              75.7028809,
              31.251528
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422886530",
      "properties": {
        "id": "osm_422886530",
        "osmId": "422886530",
        "name": "Building 422886530",
        "shortName": "Building 422886530",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7027868,
          31.2515178
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7027396,
              31.2515232
            ],
            [
              75.7028809,
              31.2515233
            ],
            [
              75.7028808,
              31.251508
            ],
            [
              75.7027408,
              31.2515085
            ],
            [
              75.7027389,
              31.2515203
            ],
            [
              75.7027396,
              31.2515232
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422886532",
      "properties": {
        "id": "osm_422886532",
        "osmId": "422886532",
        "name": "Building 422886532",
        "shortName": "Building 422886532",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7030068,
          31.2513898
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7029461,
              31.251376
            ],
            [
              75.7029573,
              31.2513758
            ],
            [
              75.702957,
              31.2514045
            ],
            [
              75.7029761,
              31.2514047
            ],
            [
              75.702976,
              31.2513754
            ],
            [
              75.7029874,
              31.2513752
            ],
            [
              75.7029874,
              31.2514046
            ],
            [
              75.7030031,
              31.2514048
            ],
            [
              75.7030025,
              31.251375
            ],
            [
              75.7030159,
              31.251375
            ],
            [
              75.703016,
              31.2514042
            ],
            [
              75.7030332,
              31.2514044
            ],
            [
              75.7030334,
              31.2513746
            ],
            [
              75.7030478,
              31.2513742
            ],
            [
              75.7030476,
              31.2514036
            ],
            [
              75.7030602,
              31.2514037
            ],
            [
              75.7030602,
              31.251374
            ],
            [
              75.7030718,
              31.2513737
            ],
            [
              75.7030717,
              31.2514136
            ],
            [
              75.7029456,
              31.2514123
            ],
            [
              75.7029461,
              31.251376
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422886533",
      "properties": {
        "id": "osm_422886533",
        "osmId": "422886533",
        "name": "Building 422886533",
        "shortName": "Building 422886533",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7030048,
          31.2513734
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7029461,
              31.251376
            ],
            [
              75.7029459,
              31.2513656
            ],
            [
              75.7030716,
              31.2513633
            ],
            [
              75.7030718,
              31.2513737
            ],
            [
              75.7030602,
              31.251374
            ],
            [
              75.7030478,
              31.2513742
            ],
            [
              75.7030334,
              31.2513746
            ],
            [
              75.7030159,
              31.251375
            ],
            [
              75.7030025,
              31.251375
            ],
            [
              75.7029874,
              31.2513752
            ],
            [
              75.702976,
              31.2513754
            ],
            [
              75.7029573,
              31.2513758
            ],
            [
              75.7029461,
              31.251376
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422886546",
      "properties": {
        "id": "osm_422886546",
        "osmId": "422886546",
        "name": "Building 422886546",
        "shortName": "Building 422886546",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7032533,
          31.2514016
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7031876,
              31.2513873
            ],
            [
              75.7031954,
              31.2513874
            ],
            [
              75.7031951,
              31.2514156
            ],
            [
              75.7032295,
              31.2514158
            ],
            [
              75.7032299,
              31.2513873
            ],
            [
              75.7032398,
              31.2513874
            ],
            [
              75.7032394,
              31.2514155
            ],
            [
              75.7032744,
              31.2514158
            ],
            [
              75.7032747,
              31.2513874
            ],
            [
              75.7032839,
              31.2513874
            ],
            [
              75.7032836,
              31.2514162
            ],
            [
              75.7033202,
              31.2514165
            ],
            [
              75.7033206,
              31.2513876
            ],
            [
              75.7033288,
              31.2513876
            ],
            [
              75.7033284,
              31.2514233
            ],
            [
              75.7031872,
              31.2514221
            ],
            [
              75.7031876,
              31.2513873
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_422886547",
      "properties": {
        "id": "osm_422886547",
        "osmId": "422886547",
        "name": "Building 422886547",
        "shortName": "Building 422886547",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7032513,
          31.2513863
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7031876,
              31.2513873
            ],
            [
              75.7031954,
              31.2513874
            ],
            [
              75.7032299,
              31.2513873
            ],
            [
              75.7032398,
              31.2513874
            ],
            [
              75.7032747,
              31.2513874
            ],
            [
              75.7032839,
              31.2513874
            ],
            [
              75.7033206,
              31.2513876
            ],
            [
              75.7033288,
              31.2513876
            ],
            [
              75.7033288,
              31.2513815
            ],
            [
              75.7031876,
              31.2513811
            ],
            [
              75.7031876,
              31.2513873
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_425716257",
      "properties": {
        "id": "osm_425716257",
        "osmId": "425716257",
        "name": "Building 425716257",
        "shortName": "Building 425716257",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.705573,
          31.2568092
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7055141,
              31.2568012
            ],
            [
              75.7056574,
              31.2568035
            ],
            [
              75.705639,
              31.25682
            ],
            [
              75.7055404,
              31.2568203
            ],
            [
              75.7055141,
              31.2568012
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_426283204",
      "properties": {
        "id": "osm_426283204",
        "osmId": "426283204",
        "name": "Building 426283204",
        "shortName": "Building 426283204",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7069162,
          31.258075
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7068782,
              31.2579487
            ],
            [
              75.7068812,
              31.2581345
            ],
            [
              75.7068819,
              31.2582072
            ],
            [
              75.7069662,
              31.2582066
            ],
            [
              75.7069655,
              31.2581316
            ],
            [
              75.7069625,
              31.2579477
            ],
            [
              75.7068782,
              31.2579487
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_426284154",
      "properties": {
        "id": "osm_426284154",
        "osmId": "426284154",
        "name": "Building 426284154",
        "shortName": "Building 426284154",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7049066,
          31.2525078
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7048032,
              31.2524904
            ],
            [
              75.7048034,
              31.2525364
            ],
            [
              75.7048582,
              31.252535
            ],
            [
              75.7049746,
              31.2525313
            ],
            [
              75.7050424,
              31.2525283
            ],
            [
              75.705042,
              31.2524825
            ],
            [
              75.704974,
              31.2524875
            ],
            [
              75.7048584,
              31.2524884
            ],
            [
              75.7048032,
              31.2524904
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_427330237",
      "properties": {
        "id": "osm_427330237",
        "osmId": "427330237",
        "name": "Building 427330237",
        "shortName": "Building 427330237",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7079007,
          31.2581946
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7077279,
              31.2579414
            ],
            [
              75.7077158,
              31.2579632
            ],
            [
              75.7077051,
              31.2579907
            ],
            [
              75.707697,
              31.2580239
            ],
            [
              75.707693,
              31.2580595
            ],
            [
              75.7076917,
              31.2581156
            ],
            [
              75.7076925,
              31.2581586
            ],
            [
              75.7078023,
              31.2581537
            ],
            [
              75.7080672,
              31.2583736
            ],
            [
              75.70809,
              31.2583965
            ],
            [
              75.7081262,
              31.2583965
            ],
            [
              75.708145,
              31.2584103
            ],
            [
              75.7082804,
              31.2585261
            ],
            [
              75.7083488,
              31.2584676
            ],
            [
              75.7077279,
              31.2579414
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_427330238",
      "properties": {
        "id": "osm_427330238",
        "osmId": "427330238",
        "name": "Building 427330238",
        "shortName": "Building 427330238",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7079039,
          31.2584032
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7077033,
              31.2582915
            ],
            [
              75.7077242,
              31.2583263
            ],
            [
              75.7077618,
              31.2583756
            ],
            [
              75.7078074,
              31.2584203
            ],
            [
              75.7078583,
              31.258465
            ],
            [
              75.707912,
              31.258496
            ],
            [
              75.7080032,
              31.2585224
            ],
            [
              75.708047,
              31.2585229
            ],
            [
              75.7080377,
              31.2585168
            ],
            [
              75.7080231,
              31.2584976
            ],
            [
              75.7080167,
              31.2584753
            ],
            [
              75.7080191,
              31.2584525
            ],
            [
              75.7080302,
              31.2584316
            ],
            [
              75.7080486,
              31.258415
            ],
            [
              75.7080724,
              31.2584045
            ],
            [
              75.7078067,
              31.2581821
            ],
            [
              75.707813,
              31.2582866
            ],
            [
              75.7077859,
              31.2582878
            ],
            [
              75.7077033,
              31.2582915
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_427333650",
      "properties": {
        "id": "osm_427333650",
        "osmId": "427333650",
        "name": "Building 427333650",
        "shortName": "Building 427333650",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7049121,
          31.2530686
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7049029,
              31.2530754
            ],
            [
              75.7049032,
              31.2530582
            ],
            [
              75.704926,
              31.2530585
            ],
            [
              75.7049257,
              31.2530757
            ],
            [
              75.7049029,
              31.2530754
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1299137613",
      "properties": {
        "id": "osm_1299137613",
        "osmId": "1299137613",
        "name": "Elem apartment",
        "shortName": "Elem apartment",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6988524,
          31.2520381
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6988809,
              31.2520765
            ],
            [
              75.6987813,
              31.2520693
            ],
            [
              75.6987942,
              31.2519827
            ],
            [
              75.6988898,
              31.2519921
            ],
            [
              75.6988871,
              31.2520316
            ],
            [
              75.6988809,
              31.2520765
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1299447331",
      "properties": {
        "id": "osm_1299447331",
        "osmId": "1299447331",
        "name": "prime apartment 2",
        "shortName": "prime apartment 2",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6986001,
          31.2521779
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6985454,
              31.2522
            ],
            [
              75.6986801,
              31.2521965
            ],
            [
              75.6986814,
              31.2521458
            ],
            [
              75.6985482,
              31.2521472
            ],
            [
              75.6985454,
              31.2522
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1299447332",
      "properties": {
        "id": "osm_1299447332",
        "osmId": "1299447332",
        "name": "Diya apartment",
        "shortName": "Diya apartment",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6985936,
          31.2522841
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6985348,
              31.2523322
            ],
            [
              75.6986719,
              31.2523411
            ],
            [
              75.6986769,
              31.2522054
            ],
            [
              75.6985498,
              31.2522097
            ],
            [
              75.6985348,
              31.2523322
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1299813019",
      "properties": {
        "id": "osm_1299813019",
        "osmId": "1299813019",
        "name": "desi &amp; delicious",
        "shortName": "desi &amp; delicious",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6985133,
          31.254882
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.698439,
              31.2549981
            ],
            [
              75.6986687,
              31.254875
            ],
            [
              75.6985067,
              31.2546567
            ],
            [
              75.698439,
              31.2549981
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687852",
      "properties": {
        "id": "osm_1300687852",
        "osmId": "1300687852",
        "name": "Dimple Apartment",
        "shortName": "Dimple Apartment",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6990181,
          31.252234
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6989885,
              31.2522644
            ],
            [
              75.6990435,
              31.2522713
            ],
            [
              75.6990658,
              31.2521894
            ],
            [
              75.699004,
              31.2521805
            ],
            [
              75.6989885,
              31.2522644
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687853",
      "properties": {
        "id": "osm_1300687853",
        "osmId": "1300687853",
        "name": "Avjot PG",
        "shortName": "Avjot PG",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6989043,
          31.2522228
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6988729,
              31.2522614
            ],
            [
              75.698937,
              31.2522653
            ],
            [
              75.6989555,
              31.252164
            ],
            [
              75.6988833,
              31.2521619
            ],
            [
              75.6988729,
              31.2522614
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687854",
      "properties": {
        "id": "osm_1300687854",
        "osmId": "1300687854",
        "name": "Building 1300687854",
        "shortName": "Building 1300687854",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6987753,
          31.2522697
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6987567,
              31.2523072
            ],
            [
              75.6988285,
              31.2523121
            ],
            [
              75.6988422,
              31.2522503
            ],
            [
              75.6987758,
              31.2522444
            ],
            [
              75.6987743,
              31.2522277
            ],
            [
              75.698745,
              31.2522262
            ],
            [
              75.6987395,
              31.2522746
            ],
            [
              75.6987588,
              31.2522775
            ],
            [
              75.6987567,
              31.2523072
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687855",
      "properties": {
        "id": "osm_1300687855",
        "osmId": "1300687855",
        "name": "Building 1300687855",
        "shortName": "Building 1300687855",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6986115,
          31.2520812
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6985536,
              31.252103
            ],
            [
              75.6986963,
              31.2521023
            ],
            [
              75.6986974,
              31.2520496
            ],
            [
              75.6985565,
              31.2520482
            ],
            [
              75.6985536,
              31.252103
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687856",
      "properties": {
        "id": "osm_1300687856",
        "osmId": "1300687856",
        "name": "Building 1300687856",
        "shortName": "Building 1300687856",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6989104,
          31.2520447
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6988809,
              31.2520765
            ],
            [
              75.6989457,
              31.2520799
            ],
            [
              75.6989545,
              31.2519985
            ],
            [
              75.6988898,
              31.2519921
            ],
            [
              75.6988809,
              31.2520765
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687857",
      "properties": {
        "id": "osm_1300687857",
        "osmId": "1300687857",
        "name": "Building 1300687857",
        "shortName": "Building 1300687857",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6990482,
          31.2520703
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6990008,
              31.2520972
            ],
            [
              75.6990039,
              31.2520216
            ],
            [
              75.6991207,
              31.252031
            ],
            [
              75.6991147,
              31.2521047
            ],
            [
              75.6990008,
              31.2520972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687858",
      "properties": {
        "id": "osm_1300687858",
        "osmId": "1300687858",
        "name": "Building 1300687858",
        "shortName": "Building 1300687858",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.699145,
          31.2522202
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6991189,
              31.2522445
            ],
            [
              75.6991249,
              31.2521805
            ],
            [
              75.6991834,
              31.2521835
            ],
            [
              75.6991787,
              31.252248
            ],
            [
              75.6991189,
              31.2522445
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687859",
      "properties": {
        "id": "osm_1300687859",
        "osmId": "1300687859",
        "name": "Building 1300687859",
        "shortName": "Building 1300687859",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6992017,
          31.2522243
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6991787,
              31.252248
            ],
            [
              75.6992297,
              31.252253
            ],
            [
              75.6992378,
              31.2521891
            ],
            [
              75.6991834,
              31.2521835
            ],
            [
              75.6991787,
              31.252248
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687860",
      "properties": {
        "id": "osm_1300687860",
        "osmId": "1300687860",
        "name": "karan pg 1",
        "shortName": "karan pg 1",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6992544,
          31.2522297
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6992297,
              31.252253
            ],
            [
              75.6992828,
              31.252258
            ],
            [
              75.6992918,
              31.2521954
            ],
            [
              75.6992378,
              31.2521891
            ],
            [
              75.6992297,
              31.252253
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687861",
      "properties": {
        "id": "osm_1300687861",
        "osmId": "1300687861",
        "name": "the grand castle",
        "shortName": "the grand castle",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6996137,
          31.2521131
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6995756,
              31.2521497
            ],
            [
              75.6996541,
              31.2521551
            ],
            [
              75.6996738,
              31.25206
            ],
            [
              75.6995893,
              31.2520509
            ],
            [
              75.6995756,
              31.2521497
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687862",
      "properties": {
        "id": "osm_1300687862",
        "osmId": "1300687862",
        "name": "pheonix apartment",
        "shortName": "pheonix apartment",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6995024,
          31.2521021
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6994448,
              31.2521356
            ],
            [
              75.6995756,
              31.2521497
            ],
            [
              75.6995893,
              31.2520509
            ],
            [
              75.6994576,
              31.2520385
            ],
            [
              75.6994448,
              31.2521356
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687863",
      "properties": {
        "id": "osm_1300687863",
        "osmId": "1300687863",
        "name": "Building 1300687863",
        "shortName": "Building 1300687863",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6991454,
          31.2520769
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6991147,
              31.2521047
            ],
            [
              75.6991834,
              31.2521071
            ],
            [
              75.6991937,
              31.252037
            ],
            [
              75.6991207,
              31.252031
            ],
            [
              75.6991147,
              31.2521047
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687864",
      "properties": {
        "id": "osm_1300687864",
        "osmId": "1300687864",
        "name": "victoria apartment",
        "shortName": "victoria apartment",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6992057,
          31.25208
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6991834,
              31.2521071
            ],
            [
              75.6992297,
              31.2521083
            ],
            [
              75.6992384,
              31.2520407
            ],
            [
              75.6991937,
              31.252037
            ],
            [
              75.6991834,
              31.2521071
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687865",
      "properties": {
        "id": "osm_1300687865",
        "osmId": "1300687865",
        "name": "Sanamdeep Apartments",
        "shortName": "Sanamdeep Apartments",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6993157,
          31.2520913
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6992928,
              31.2521146
            ],
            [
              75.6993014,
              31.2520486
            ],
            [
              75.6993512,
              31.2520577
            ],
            [
              75.6993402,
              31.2521211
            ],
            [
              75.6992928,
              31.2521146
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687866",
      "properties": {
        "id": "osm_1300687866",
        "osmId": "1300687866",
        "name": "Sanamdeep apartment",
        "shortName": "Sanamdeep apartment",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6992584,
          31.2520841
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6992297,
              31.2521083
            ],
            [
              75.6992928,
              31.2521146
            ],
            [
              75.6993014,
              31.2520486
            ],
            [
              75.6992384,
              31.2520407
            ],
            [
              75.6992297,
              31.2521083
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687868",
      "properties": {
        "id": "osm_1300687868",
        "osmId": "1300687868",
        "name": "Building 1300687868",
        "shortName": "Building 1300687868",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6996482,
          31.2523946
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6996052,
              31.2524255
            ],
            [
              75.6996256,
              31.2523358
            ],
            [
              75.6997111,
              31.2523464
            ],
            [
              75.699694,
              31.2524399
            ],
            [
              75.6996052,
              31.2524255
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687869",
      "properties": {
        "id": "osm_1300687869",
        "osmId": "1300687869",
        "name": "Building 1300687869",
        "shortName": "Building 1300687869",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6995613,
          31.2523828
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6995187,
              31.2524137
            ],
            [
              75.6995385,
              31.2523251
            ],
            [
              75.6996256,
              31.2523358
            ],
            [
              75.6996052,
              31.2524255
            ],
            [
              75.6995187,
              31.2524137
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687870",
      "properties": {
        "id": "osm_1300687870",
        "osmId": "1300687870",
        "name": "Building 1300687870",
        "shortName": "Building 1300687870",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6994746,
          31.2523714
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6994335,
              31.2524024
            ],
            [
              75.6994487,
              31.2523136
            ],
            [
              75.6995385,
              31.2523251
            ],
            [
              75.6995187,
              31.2524137
            ],
            [
              75.6994335,
              31.2524024
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687871",
      "properties": {
        "id": "osm_1300687871",
        "osmId": "1300687871",
        "name": "karan pg 2",
        "shortName": "karan pg 2",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6992707,
          31.2522427
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6992828,
              31.252258
            ],
            [
              75.6992431,
              31.2522812
            ],
            [
              75.699253,
              31.2522208
            ],
            [
              75.6992918,
              31.2521954
            ],
            [
              75.6992828,
              31.252258
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687872",
      "properties": {
        "id": "osm_1300687872",
        "osmId": "1300687872",
        "name": "Building 1300687872",
        "shortName": "Building 1300687872",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6993189,
          31.2522495
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6992431,
              31.2522812
            ],
            [
              75.6994209,
              31.252261
            ],
            [
              75.6994342,
              31.2522034
            ],
            [
              75.699253,
              31.2522208
            ],
            [
              75.6992431,
              31.2522812
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687873",
      "properties": {
        "id": "osm_1300687873",
        "osmId": "1300687873",
        "name": "Building 1300687873",
        "shortName": "Building 1300687873",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6991827,
          31.2523411
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6991535,
              31.2523775
            ],
            [
              75.6991605,
              31.252281
            ],
            [
              75.6992262,
              31.2522874
            ],
            [
              75.6992196,
              31.2523822
            ],
            [
              75.6991535,
              31.2523775
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687874",
      "properties": {
        "id": "osm_1300687874",
        "osmId": "1300687874",
        "name": "Building 1300687874",
        "shortName": "Building 1300687874",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6992979,
          31.2523548
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6992662,
              31.2523944
            ],
            [
              75.6992824,
              31.2522905
            ],
            [
              75.6993464,
              31.2522945
            ],
            [
              75.6993284,
              31.2524002
            ],
            [
              75.6992662,
              31.2523944
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687875",
      "properties": {
        "id": "osm_1300687875",
        "osmId": "1300687875",
        "name": "Building 1300687875",
        "shortName": "Building 1300687875",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6985216,
          31.2524018
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6984099,
              31.2524454
            ],
            [
              75.6986701,
              31.2524669
            ],
            [
              75.698681,
              31.2523503
            ],
            [
              75.698533,
              31.2523394
            ],
            [
              75.6985315,
              31.2523858
            ],
            [
              75.698416,
              31.2523794
            ],
            [
              75.6984099,
              31.2524454
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687876",
      "properties": {
        "id": "osm_1300687876",
        "osmId": "1300687876",
        "name": "Building 1300687876",
        "shortName": "Building 1300687876",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6987802,
          31.2527649
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6987182,
              31.2527932
            ],
            [
              75.6987407,
              31.2527061
            ],
            [
              75.6988725,
              31.2527156
            ],
            [
              75.6988513,
              31.2528162
            ],
            [
              75.6987182,
              31.2527932
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687877",
      "properties": {
        "id": "osm_1300687877",
        "osmId": "1300687877",
        "name": "Building 1300687877",
        "shortName": "Building 1300687877",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6992078,
          31.2525233
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6991588,
              31.2525498
            ],
            [
              75.6991653,
              31.2524775
            ],
            [
              75.6992852,
              31.2524824
            ],
            [
              75.6992711,
              31.2525569
            ],
            [
              75.6991588,
              31.2525498
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687879",
      "properties": {
        "id": "osm_1300687879",
        "osmId": "1300687879",
        "name": "Building 1300687879",
        "shortName": "Building 1300687879",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6980229,
          31.2518125
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6979692,
              31.2517666
            ],
            [
              75.6981561,
              31.2517794
            ],
            [
              75.6981474,
              31.2518368
            ],
            [
              75.6981423,
              31.2518703
            ],
            [
              75.69792,
              31.2518698
            ],
            [
              75.6979175,
              31.2518072
            ],
            [
              75.6979613,
              31.2518034
            ],
            [
              75.6979692,
              31.2517666
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687880",
      "properties": {
        "id": "osm_1300687880",
        "osmId": "1300687880",
        "name": "Building 1300687880",
        "shortName": "Building 1300687880",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6981773,
          31.2518615
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.69814,
              31.251894
            ],
            [
              75.69817,
              31.2517996
            ],
            [
              75.6982328,
              31.251819
            ],
            [
              75.6982036,
              31.2519009
            ],
            [
              75.69814,
              31.251894
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687925",
      "properties": {
        "id": "osm_1300687925",
        "osmId": "1300687925",
        "name": "Ssj Complex",
        "shortName": "Ssj Complex",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.69903,
          31.2536582
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6989095,
              31.2536754
            ],
            [
              75.6989233,
              31.253584
            ],
            [
              75.6992055,
              31.2536281
            ],
            [
              75.6992022,
              31.2537281
            ],
            [
              75.6989095,
              31.2536754
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687926",
      "properties": {
        "id": "osm_1300687926",
        "osmId": "1300687926",
        "name": "dogra dhaba",
        "shortName": "dogra dhaba",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6997397,
          31.2541135
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6997411,
              31.2541693
            ],
            [
              75.699676,
              31.2540604
            ],
            [
              75.6997381,
              31.2540309
            ],
            [
              75.6998023,
              31.2541376
            ],
            [
              75.6997411,
              31.2541693
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687927",
      "properties": {
        "id": "osm_1300687927",
        "osmId": "1300687927",
        "name": "Lally apartment",
        "shortName": "Lally apartment",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6993604,
          31.2539211
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6993428,
              31.2539603
            ],
            [
              75.6994258,
              31.2539163
            ],
            [
              75.6993848,
              31.2538596
            ],
            [
              75.6993056,
              31.2539091
            ],
            [
              75.6993428,
              31.2539603
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687928",
      "properties": {
        "id": "osm_1300687928",
        "osmId": "1300687928",
        "name": "Building 1300687928",
        "shortName": "Building 1300687928",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6994181,
          31.2539985
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6993707,
              31.2539962
            ],
            [
              75.6994535,
              31.2539535
            ],
            [
              75.6994872,
              31.254
            ],
            [
              75.6994082,
              31.2540467
            ],
            [
              75.6993707,
              31.2539962
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687929",
      "properties": {
        "id": "osm_1300687929",
        "osmId": "1300687929",
        "name": "Building 1300687929",
        "shortName": "Building 1300687929",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6992913,
          31.2540384
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6992965,
              31.2540845
            ],
            [
              75.6992315,
              31.2539994
            ],
            [
              75.6992811,
              31.2539822
            ],
            [
              75.6993031,
              31.2540138
            ],
            [
              75.6993392,
              31.2540658
            ],
            [
              75.6992965,
              31.2540845
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687930",
      "properties": {
        "id": "osm_1300687930",
        "osmId": "1300687930",
        "name": "Building 1300687930",
        "shortName": "Building 1300687930",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.699347,
          31.2540348
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6993392,
              31.2540658
            ],
            [
              75.6993031,
              31.2540138
            ],
            [
              75.6993589,
              31.2539892
            ],
            [
              75.6993946,
              31.2540393
            ],
            [
              75.6993392,
              31.2540658
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687931",
      "properties": {
        "id": "osm_1300687931",
        "osmId": "1300687931",
        "name": "Ten2Nine",
        "shortName": "Ten2Nine",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6995047,
          31.2543695
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6995193,
              31.2544315
            ],
            [
              75.699433,
              31.2543019
            ],
            [
              75.6994827,
              31.2542739
            ],
            [
              75.6995691,
              31.2544085
            ],
            [
              75.6995193,
              31.2544315
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300687932",
      "properties": {
        "id": "osm_1300687932",
        "osmId": "1300687932",
        "name": "Building 1300687932",
        "shortName": "Building 1300687932",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.699204,
          31.2545164
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6992039,
              31.2545847
            ],
            [
              75.6991185,
              31.2544569
            ],
            [
              75.6992031,
              31.2544109
            ],
            [
              75.6992908,
              31.2545446
            ],
            [
              75.6992039,
              31.2545847
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700284",
      "properties": {
        "id": "osm_1300700284",
        "osmId": "1300700284",
        "name": "Building 1300700284",
        "shortName": "Building 1300700284",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.698034,
          31.2531416
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6979823,
              31.2531514
            ],
            [
              75.6981034,
              31.2531712
            ],
            [
              75.6981114,
              31.2531247
            ],
            [
              75.6979907,
              31.2531095
            ],
            [
              75.6979823,
              31.2531514
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700285",
      "properties": {
        "id": "osm_1300700285",
        "osmId": "1300700285",
        "name": "Building 1300700285",
        "shortName": "Building 1300700285",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6980193,
          31.2532937
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6979676,
              31.2533208
            ],
            [
              75.6980889,
              31.2533315
            ],
            [
              75.6980965,
              31.253253
            ],
            [
              75.6979759,
              31.2532422
            ],
            [
              75.6979676,
              31.2533208
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700286",
      "properties": {
        "id": "osm_1300700286",
        "osmId": "1300700286",
        "name": "Building 1300700286",
        "shortName": "Building 1300700286",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6980219,
          31.2533714
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6980753,
              31.2533501
            ],
            [
              75.6980724,
              31.2534091
            ],
            [
              75.69794,
              31.2534047
            ],
            [
              75.6979467,
              31.2533429
            ],
            [
              75.6980753,
              31.2533501
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700296",
      "properties": {
        "id": "osm_1300700296",
        "osmId": "1300700296",
        "name": "Building 1300700296",
        "shortName": "Building 1300700296",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6992121,
          31.253944
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6992269,
              31.2539863
            ],
            [
              75.6992041,
              31.2539593
            ],
            [
              75.6991723,
              31.253974
            ],
            [
              75.699126,
              31.2539086
            ],
            [
              75.6992332,
              31.2538491
            ],
            [
              75.6992954,
              31.2539443
            ],
            [
              75.6992269,
              31.2539863
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700297",
      "properties": {
        "id": "osm_1300700297",
        "osmId": "1300700297",
        "name": "Building 1300700297",
        "shortName": "Building 1300700297",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6990829,
          31.2540108
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6990495,
              31.2540343
            ],
            [
              75.6990034,
              31.2539737
            ],
            [
              75.6990762,
              31.2539294
            ],
            [
              75.6991315,
              31.2540004
            ],
            [
              75.6991218,
              31.2540077
            ],
            [
              75.699142,
              31.254037
            ],
            [
              75.699104,
              31.25406
            ],
            [
              75.6990678,
              31.2540202
            ],
            [
              75.6990495,
              31.2540343
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700298",
      "properties": {
        "id": "osm_1300700298",
        "osmId": "1300700298",
        "name": "Building 1300700298",
        "shortName": "Building 1300700298",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6991519,
          31.2541211
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.699159,
              31.2541701
            ],
            [
              75.6990953,
              31.2540678
            ],
            [
              75.6991397,
              31.2540489
            ],
            [
              75.6992065,
              31.2541488
            ],
            [
              75.699159,
              31.2541701
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700299",
      "properties": {
        "id": "osm_1300700299",
        "osmId": "1300700299",
        "name": "Building 1300700299",
        "shortName": "Building 1300700299",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6990482,
          31.2541434
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6990649,
              31.2542072
            ],
            [
              75.698975,
              31.2540727
            ],
            [
              75.699023,
              31.2540486
            ],
            [
              75.699113,
              31.2541815
            ],
            [
              75.6990649,
              31.2542072
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700300",
      "properties": {
        "id": "osm_1300700300",
        "osmId": "1300700300",
        "name": "Building 1300700300",
        "shortName": "Building 1300700300",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6988897,
          31.2542203
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6988891,
              31.2542904
            ],
            [
              75.6988056,
              31.2541571
            ],
            [
              75.6988852,
              31.254115
            ],
            [
              75.6989794,
              31.2542486
            ],
            [
              75.6988891,
              31.2542904
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700301",
      "properties": {
        "id": "osm_1300700301",
        "osmId": "1300700301",
        "name": "Simar Land Promoters",
        "shortName": "Simar Land Promoters",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6996061,
          31.2542665
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6995935,
              31.2543066
            ],
            [
              75.6995517,
              31.2542344
            ],
            [
              75.6996233,
              31.254208
            ],
            [
              75.6996685,
              31.2542768
            ],
            [
              75.6995935,
              31.2543066
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700302",
      "properties": {
        "id": "osm_1300700302",
        "osmId": "1300700302",
        "name": "Kulhad Masti",
        "shortName": "Kulhad Masti",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6995336,
          31.2542932
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6995265,
              31.2543231
            ],
            [
              75.6994938,
              31.2542696
            ],
            [
              75.6995409,
              31.2542463
            ],
            [
              75.6995805,
              31.2543039
            ],
            [
              75.6995265,
              31.2543231
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700303",
      "properties": {
        "id": "osm_1300700303",
        "osmId": "1300700303",
        "name": "Ghost Shooter",
        "shortName": "Ghost Shooter",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6994197,
          31.2544139
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6994396,
              31.2544836
            ],
            [
              75.6993359,
              31.25434
            ],
            [
              75.6993913,
              31.2543134
            ],
            [
              75.699492,
              31.2544487
            ],
            [
              75.6994396,
              31.2544836
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700304",
      "properties": {
        "id": "osm_1300700304",
        "osmId": "1300700304",
        "name": "Building 1300700304",
        "shortName": "Building 1300700304",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.69933,
          31.2544614
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6993341,
              31.2545245
            ],
            [
              75.6992474,
              31.2544003
            ],
            [
              75.699325,
              31.2543649
            ],
            [
              75.6994094,
              31.254493
            ],
            [
              75.6993341,
              31.2545245
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700305",
      "properties": {
        "id": "osm_1300700305",
        "osmId": "1300700305",
        "name": "Building 1300700305",
        "shortName": "Building 1300700305",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.699095,
          31.2545741
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6991113,
              31.2546404
            ],
            [
              75.6990085,
              31.2545046
            ],
            [
              75.6990735,
              31.254475
            ],
            [
              75.6991703,
              31.2546101
            ],
            [
              75.6991113,
              31.2546404
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700306",
      "properties": {
        "id": "osm_1300700306",
        "osmId": "1300700306",
        "name": "Majlis Restaurant",
        "shortName": "Majlis Restaurant",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6989893,
          31.2546265
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6990008,
              31.2546888
            ],
            [
              75.6989025,
              31.2545699
            ],
            [
              75.6989708,
              31.2545328
            ],
            [
              75.6990715,
              31.2546522
            ],
            [
              75.6990008,
              31.2546888
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700307",
      "properties": {
        "id": "osm_1300700307",
        "osmId": "1300700307",
        "name": "Building 1300700307",
        "shortName": "Building 1300700307",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6980861,
          31.254672
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6980425,
              31.2547252
            ],
            [
              75.6980595,
              31.2545845
            ],
            [
              75.6981526,
              31.2545934
            ],
            [
              75.6981335,
              31.2547315
            ],
            [
              75.6980425,
              31.2547252
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700308",
      "properties": {
        "id": "osm_1300700308",
        "osmId": "1300700308",
        "name": "Building 1300700308",
        "shortName": "Building 1300700308",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6982069,
          31.2546686
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.698155,
              31.2547298
            ],
            [
              75.6981705,
              31.2545991
            ],
            [
              75.6982603,
              31.2546032
            ],
            [
              75.6982595,
              31.2546113
            ],
            [
              75.6982412,
              31.2547381
            ],
            [
              75.698155,
              31.2547298
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700309",
      "properties": {
        "id": "osm_1300700309",
        "osmId": "1300700309",
        "name": "Building 1300700309",
        "shortName": "Building 1300700309",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6982812,
          31.2547417
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6982666,
              31.2546098
            ],
            [
              75.6983599,
              31.2546163
            ],
            [
              75.698304,
              31.2549371
            ],
            [
              75.6982089,
              31.2549353
            ],
            [
              75.6982666,
              31.2546098
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700310",
      "properties": {
        "id": "osm_1300700310",
        "osmId": "1300700310",
        "name": "Building 1300700310",
        "shortName": "Building 1300700310",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6981106,
          31.2547863
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6980304,
              31.2548147
            ],
            [
              75.6982213,
              31.2548217
            ],
            [
              75.6982322,
              31.2547443
            ],
            [
              75.6980388,
              31.254736
            ],
            [
              75.6980304,
              31.2548147
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700311",
      "properties": {
        "id": "osm_1300700311",
        "osmId": "1300700311",
        "name": "Building 1300700311",
        "shortName": "Building 1300700311",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6986425,
          31.2540441
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6985973,
              31.2540864
            ],
            [
              75.6986125,
              31.2539726
            ],
            [
              75.698709,
              31.2539771
            ],
            [
              75.6986962,
              31.2540979
            ],
            [
              75.6985973,
              31.2540864
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700312",
      "properties": {
        "id": "osm_1300700312",
        "osmId": "1300700312",
        "name": "Building 1300700312",
        "shortName": "Building 1300700312",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6985739,
          31.2539994
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6985593,
              31.2540163
            ],
            [
              75.6985638,
              31.2539755
            ],
            [
              75.698597,
              31.2539781
            ],
            [
              75.69859,
              31.254011
            ],
            [
              75.6985593,
              31.2540163
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700313",
      "properties": {
        "id": "osm_1300700313",
        "osmId": "1300700313",
        "name": "Building 1300700313",
        "shortName": "Building 1300700313",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6987039,
          31.2542847
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6986244,
              31.2542579
            ],
            [
              75.6987231,
              31.2541956
            ],
            [
              75.6988281,
              31.2543297
            ],
            [
              75.6987194,
              31.2543824
            ],
            [
              75.6986244,
              31.2542579
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700314",
      "properties": {
        "id": "osm_1300700314",
        "osmId": "1300700314",
        "name": "Building 1300700314",
        "shortName": "Building 1300700314",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6986115,
          31.2543589
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6986188,
              31.2544098
            ],
            [
              75.6985552,
              31.2543055
            ],
            [
              75.6985973,
              31.2542788
            ],
            [
              75.6986675,
              31.2543904
            ],
            [
              75.6986188,
              31.2544098
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700315",
      "properties": {
        "id": "osm_1300700315",
        "osmId": "1300700315",
        "name": "Building 1300700315",
        "shortName": "Building 1300700315",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6982902,
          31.2543418
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6982403,
              31.2543785
            ],
            [
              75.6982511,
              31.2542783
            ],
            [
              75.6983682,
              31.2542909
            ],
            [
              75.698351,
              31.2543826
            ],
            [
              75.6982403,
              31.2543785
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700316",
      "properties": {
        "id": "osm_1300700316",
        "osmId": "1300700316",
        "name": "Building 1300700316",
        "shortName": "Building 1300700316",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6983156,
          31.2541515
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6982647,
              31.254173
            ],
            [
              75.6982828,
              31.2541027
            ],
            [
              75.6983909,
              31.2541153
            ],
            [
              75.6983747,
              31.2541936
            ],
            [
              75.6982647,
              31.254173
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700317",
      "properties": {
        "id": "osm_1300700317",
        "osmId": "1300700317",
        "name": "Building 1300700317",
        "shortName": "Building 1300700317",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6980992,
          31.253935
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6981705,
              31.2539614
            ],
            [
              75.6980701,
              31.2539565
            ],
            [
              75.6979976,
              31.2539529
            ],
            [
              75.698005,
              31.2538842
            ],
            [
              75.6981815,
              31.2538933
            ],
            [
              75.6981705,
              31.2539614
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700318",
      "properties": {
        "id": "osm_1300700318",
        "osmId": "1300700318",
        "name": "Building 1300700318",
        "shortName": "Building 1300700318",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6981055,
          31.2540165
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6980651,
              31.2540521
            ],
            [
              75.6980701,
              31.2539565
            ],
            [
              75.6981705,
              31.2539614
            ],
            [
              75.6981568,
              31.2540605
            ],
            [
              75.6980651,
              31.2540521
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700324",
      "properties": {
        "id": "osm_1300700324",
        "osmId": "1300700324",
        "name": "Building 1300700324",
        "shortName": "Building 1300700324",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.69802,
          31.2544037
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6979721,
              31.2544499
            ],
            [
              75.6979948,
              31.2543255
            ],
            [
              75.6980923,
              31.2543374
            ],
            [
              75.6980689,
              31.2544557
            ],
            [
              75.6979721,
              31.2544499
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300700325",
      "properties": {
        "id": "osm_1300700325",
        "osmId": "1300700325",
        "name": "Building 1300700325",
        "shortName": "Building 1300700325",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6978506,
          31.2539826
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.69772,
              31.2539919
            ],
            [
              75.6980369,
              31.254027
            ],
            [
              75.6980464,
              31.253975
            ],
            [
              75.6977299,
              31.253927
            ],
            [
              75.69772,
              31.2539919
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300762561",
      "properties": {
        "id": "osm_1300762561",
        "osmId": "1300762561",
        "name": "Building 1300762561",
        "shortName": "Building 1300762561",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6980419,
          31.2481429
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6979429,
              31.2481625
            ],
            [
              75.6979506,
              31.2480885
            ],
            [
              75.6981924,
              31.2481119
            ],
            [
              75.6981805,
              31.2481889
            ],
            [
              75.6979429,
              31.2481625
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300762562",
      "properties": {
        "id": "osm_1300762562",
        "osmId": "1300762562",
        "name": "Building 1300762562",
        "shortName": "Building 1300762562",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6982899,
          31.2480793
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.698213,
              31.2481086
            ],
            [
              75.6982237,
              31.2480197
            ],
            [
              75.698401,
              31.248029
            ],
            [
              75.6983989,
              31.2481306
            ],
            [
              75.698213,
              31.2481086
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1300762564",
      "properties": {
        "id": "osm_1300762564",
        "osmId": "1300762564",
        "name": "Building 1300762564",
        "shortName": "Building 1300762564",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6980109,
          31.2483543
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6979205,
              31.2483963
            ],
            [
              75.6979243,
              31.2482679
            ],
            [
              75.6981613,
              31.2482977
            ],
            [
              75.6981277,
              31.2484135
            ],
            [
              75.6979205,
              31.2483963
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1303020182",
      "properties": {
        "id": "osm_1303020182",
        "osmId": "1303020182",
        "name": "Building 1303020182",
        "shortName": "Building 1303020182",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.6982646,
          31.2537423
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.6982307,
              31.2537859
            ],
            [
              75.698304,
              31.2537821
            ],
            [
              75.6983129,
              31.2536787
            ],
            [
              75.6982449,
              31.2536791
            ],
            [
              75.6982307,
              31.2537859
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1566888543",
      "properties": {
        "id": "osm_1566888543",
        "osmId": "1566888543",
        "name": "Building 1566888543",
        "shortName": "Building 1566888543",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7042058,
          31.2521311
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7040844,
              31.2522207
            ],
            [
              75.7042095,
              31.2522172
            ],
            [
              75.7042167,
              31.2522
            ],
            [
              75.7042288,
              31.2521828
            ],
            [
              75.7042491,
              31.2521658
            ],
            [
              75.7042677,
              31.2521507
            ],
            [
              75.7042945,
              31.2521381
            ],
            [
              75.704313,
              31.2521342
            ],
            [
              75.7043277,
              31.2521365
            ],
            [
              75.7043293,
              31.2520202
            ],
            [
              75.7043052,
              31.2520165
            ],
            [
              75.7042797,
              31.252022
            ],
            [
              75.7042382,
              31.2520381
            ],
            [
              75.7041979,
              31.2520587
            ],
            [
              75.7041631,
              31.2520782
            ],
            [
              75.7041376,
              31.2521034
            ],
            [
              75.7041161,
              31.2521287
            ],
            [
              75.7041041,
              31.2521493
            ],
            [
              75.7040906,
              31.2521734
            ],
            [
              75.7040839,
              31.2521986
            ],
            [
              75.7040844,
              31.2522207
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1566888545",
      "properties": {
        "id": "osm_1566888545",
        "osmId": "1566888545",
        "name": "Building 1566888545",
        "shortName": "Building 1566888545",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7029748,
          31.2515145
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7029276,
              31.2515199
            ],
            [
              75.7030689,
              31.25152
            ],
            [
              75.7030688,
              31.2515047
            ],
            [
              75.7029288,
              31.2515052
            ],
            [
              75.7029269,
              31.251517
            ],
            [
              75.7029276,
              31.2515199
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1566888547",
      "properties": {
        "id": "osm_1566888547",
        "osmId": "1566888547",
        "name": "Building 1566888547",
        "shortName": "Building 1566888547",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7029973,
          31.2515161
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7030689,
              31.2515247
            ],
            [
              75.7030616,
              31.2515436
            ],
            [
              75.7030475,
              31.2515595
            ],
            [
              75.7030282,
              31.2515706
            ],
            [
              75.7030058,
              31.2515759
            ],
            [
              75.7029825,
              31.2515747
            ],
            [
              75.7029609,
              31.2515672
            ],
            [
              75.7029433,
              31.2515541
            ],
            [
              75.7029316,
              31.2515369
            ],
            [
              75.7029276,
              31.2515199
            ],
            [
              75.7029269,
              31.251517
            ],
            [
              75.7029288,
              31.2515052
            ],
            [
              75.7029302,
              31.2514968
            ],
            [
              75.7029409,
              31.2514787
            ],
            [
              75.7029581,
              31.2514647
            ],
            [
              75.7029797,
              31.2514562
            ],
            [
              75.7030033,
              31.2514542
            ],
            [
              75.7030242,
              31.2514585
            ],
            [
              75.7030464,
              31.2514699
            ],
            [
              75.7030611,
              31.2514859
            ],
            [
              75.7030688,
              31.2515047
            ],
            [
              75.7030878,
              31.2515122
            ],
            [
              75.7030819,
              31.2514883
            ],
            [
              75.7030666,
              31.2514663
            ],
            [
              75.7030437,
              31.2514499
            ],
            [
              75.7030157,
              31.2514409
            ],
            [
              75.7029858,
              31.2514404
            ],
            [
              75.7029573,
              31.2514484
            ],
            [
              75.7029336,
              31.251464
            ],
            [
              75.7029173,
              31.2514855
            ],
            [
              75.7029103,
              31.2515103
            ],
            [
              75.7029133,
              31.2515358
            ],
            [
              75.702926,
              31.2515589
            ],
            [
              75.7029458,
              31.2515765
            ],
            [
              75.7029711,
              31.2515877
            ],
            [
              75.7029993,
              31.2515915
            ],
            [
              75.7030274,
              31.2515875
            ],
            [
              75.7030526,
              31.2515761
            ],
            [
              75.7030723,
              31.2515585
            ],
            [
              75.7030844,
              31.2515364
            ],
            [
              75.7030689,
              31.2515247
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1566888548",
      "properties": {
        "id": "osm_1566888548",
        "osmId": "1566888548",
        "name": "Building 1566888548",
        "shortName": "Building 1566888548",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7030746,
          31.2515205
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7030689,
              31.2515247
            ],
            [
              75.7030689,
              31.25152
            ],
            [
              75.7030688,
              31.2515047
            ],
            [
              75.7030878,
              31.2515122
            ],
            [
              75.7030844,
              31.2515364
            ],
            [
              75.7030689,
              31.2515247
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "osm_1566888553",
      "properties": {
        "id": "osm_1566888553",
        "osmId": "1566888553",
        "name": "Building 1566888553",
        "shortName": "Building 1566888553",
        "category": "academic",
        "height": 14,
        "baseHeight": 0,
        "floors": 3,
        "color": "#e2e8f0",
        "accentColor": "#94a3b8",
        "isApproximate": true,
        "geometrySource": "verified_osm",
        "center": [
          75.7030329,
          31.2512943
        ],
        "description": "OpenStreetMap verified building footprint.",
        "isVerifiedCampusFacility": false,
        "isUnverified": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.7029503,
              31.2513591
            ],
            [
              75.7029491,
              31.2511963
            ],
            [
              75.7031572,
              31.251201
            ],
            [
              75.7031578,
              31.2513559
            ],
            [
              75.7029503,
              31.2513591
            ]
          ]
        ]
      }
    }
  ]
};
