import { Coordinates } from '../types/location';

/**
 * Verified geographic boundaries and center coordinates for
 * Lovely Professional University (LPU), Phagwara, Punjab, India.
 * Official Location: NH-44 (GT Road), Phagwara - 144411.
 */

// Initial campus center as verified in requirements
export const LPU_CAMPUS_CENTER: Coordinates = {
  lat: 31.25492,
  lng: 75.70462,
};

// Tight bounding box covering Lovely Professional University 600+ acre campus
// to prevent mobile users from accidentally panning far outside the university grounds.
export const LPU_CAMPUS_BOUNDS = {
  southWest: {
    lat: 31.2460,
    lng: 75.6940,
  },
  northEast: {
    lat: 31.2650,
    lng: 75.7170,
  },
};

export const MAP_CONFIG = {
  defaultZoom: 16,
  minZoom: 14,
  maxZoom: 19,
  focusZoom: 18,
  tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | LPU Campus Navigator',
};
