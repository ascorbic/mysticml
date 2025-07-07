import Ephemeris from "https://esm.sh/gh/0xStarcat/Moshier-Ephemeris-JS/src/Ephemeris.js";

export const ALL_BODIES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "chiron",
  "sirius",
] as const;

export type CelestialBody = (typeof ALL_BODIES)[number];

export interface EphemerisParams {
  bodies?: CelestialBody[];
  datetime?: string;
  latitude: number;
  longitude: number;
}

// Coordinate system interfaces
export interface ApparentGeocentricCoords {
  longitude: number;
  latitude: number;
  distance: number;
}

export interface AltazData {
  altitude: number;
  azimuth: number;
  atmosphericRefraction?: number;
  diurnalAberation?: number;
  diurnalParallax?: number;
  topocentric?: unknown;
  transit?: unknown;
}

export interface ApproxVisual {
  magnitude: number;
  phase: number;
}

// Main position data interface
export interface CelestialBodyPosition {
  // Primary coordinate properties
  longitude: number;
  latitude: number;
  apparentLongitude: number;
  apparentLongitudeString: string;
  apparentLongitude30String: string;

  // Distance and positioning
  geocentricDistance: number;
  trueGeocentricDistance: number;
  equatorialDiameter: number;

  // Coordinate systems
  apparentGeocentric: ApparentGeocentricCoords;
  astrometricB1950: unknown;
  astrometricJ2000: unknown;
  polar: number[];
  rect: number[];

  // Local observation data
  altaz: AltazData;
  altitude: number; // Direct access to altitude
  azimuth: number; // Direct access to azimuth

  // Additional properties
  constellation: string;
  approxVisual: ApproxVisual;
}

// Alternatively, we could use a type alias for the mapped type
export type EphemerisResult = {
  [K in CelestialBody]?: CelestialBodyPosition;
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateCoordinates(
  latitude: number,
  longitude: number
): ValidationResult {
  if (isNaN(latitude) || isNaN(longitude)) {
    return { isValid: false, error: "Invalid latitude or longitude" };
  }

  if (latitude < -90 || latitude > 90) {
    return { isValid: false, error: "Latitude must be between -90 and 90" };
  }

  if (longitude < -180 || longitude > 180) {
    return { isValid: false, error: "Longitude must be between -180 and 180" };
  }

  return { isValid: true };
}

export function parseDateTime(datetimeString?: string): Date {
  return datetimeString ? new Date(datetimeString) : new Date();
}

export function calculateEphemeris(params: EphemerisParams): EphemerisResult {
  const { bodies, datetime, latitude, longitude } = params;

  const validation = validateCoordinates(latitude, longitude);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const parsedDateTime = parseDateTime(datetime);
  const year = parsedDateTime.getUTCFullYear();
  const month = parsedDateTime.getUTCMonth();
  const day = parsedDateTime.getUTCDate();
  const hours = parsedDateTime.getUTCHours();
  const minutes = parsedDateTime.getUTCMinutes();

  const celestialBodies = bodies && bodies.length > 0 ? bodies : ALL_BODIES;

  const ephemeris = new Ephemeris({
    year,
    month,
    day,
    hours,
    minutes,
    latitude,
    longitude,
    calculateShadows: false,
  }) as unknown as Record<CelestialBody, { position: CelestialBodyPosition }>;

  const results: EphemerisResult = {};
  for (const body of celestialBodies) {
    if (ephemeris[body]?.position) {
      results[body] = ephemeris[body].position;
    } else {
      results[body] = undefined; // Handle cases where body data is not available
    }
  }

  return results;
}

export function getFilteredBodies(
  filter: "planets" | "luminaries" | "stars" | "asteroids" | "all"
): CelestialBody[] {
  switch (filter) {
    case "planets":
      return [
        "mercury",
        "venus",
        "earth",
        "mars",
        "jupiter",
        "saturn",
        "uranus",
        "neptune",
        "pluto",
      ];
    case "luminaries":
      return ["sun", "moon"];
    case "stars":
      return ["sirius"];
    case "asteroids":
      return ["chiron"];
    case "all":
    default:
      return [...ALL_BODIES];
  }
}
