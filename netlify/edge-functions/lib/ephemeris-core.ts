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

// Time-based coordinate structures
export interface TimeCoords {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds?: number;
}

export interface DegreeCoords {
  degree: number;
  minutes: number;
  seconds: number;
}

// Coordinate data structures
export interface RaDecCoords {
  ra: TimeCoords;
  dec: DegreeCoords;
}

export interface DiurnalAberration {
  ra: number;
  dec: number;
  dRA: number;
  dDec: number;
}

export interface DiurnalParallax {
  ra: number;
  dec: number;
  dRA: number;
  dDec: number;
}

export interface AtmosphericRefraction {
  deg: number;
  dRA: number;
  dDec: number;
}

export interface TransitData {
  approxLocalMeridian: TimeCoords;
  UTdate: number;
  dApproxRiseUT: number;
  dApproxSetUT: number;
  approxRiseUT: TimeCoords;
  approxSetUT: TimeCoords;
}

// Topocentric coordinates (as seen from observer's location)
export interface TopocentricCoords {
  altitude: number;
  azimuth: number;
  ra: number;
  dec: number;
  dRA: TimeCoords;
  dDec: DegreeCoords;
}

// Coordinate system interfaces
export interface ApparentGeocentricCoords {
  longitude?: number;
  latitude?: number;
  distance?: number;
}

export interface AltazData {
  dLocalApparentSiderialTime: number;
  localApparentSiderialTime: TimeCoords;
  diurnalAberation: DiurnalAberration;
  transit: TransitData;
  diurnalParallax: DiurnalParallax;
  atmosphericRefraction: AtmosphericRefraction;
  topocentric: TopocentricCoords;
}

export interface ApproxVisual {
  magnitude?: number;
  phase?: number;
}

// Geometric coordinates
export interface GeometricCoords {
  longitude: number;
  latitude: number;
  distance: number;
}

// Apparent coordinates with additional data
export interface ApparentCoords {
  dRA: number;
  dDec: number;
  ra: TimeCoords;
  dec: DegreeCoords;
}

// Moon-specific phase data
export interface MoonPhaseData {
  phaseDecimal: number;
  phaseQuarter: number;
  phaseQuarterString: string;
  phaseDaysBefore: number;
  phaseDaysPast: number;
  phaseDaysDistance: number;
  illuminatedFraction: number;
  shapeString: string;
  shapeDirectionString: string;
  withinQuarterApproximation: boolean;
  quarterApproximationString?: string;
  quarterApproximationDirectionString?: string;
  sunElongation: number;
  dHorizontalParallax: number;
  horizontalParallax: DegreeCoords;
  dSemidiameter: number;
  Semidiameter: DegreeCoords;
}

// Nutation data
export interface NutationData {
  dRA: number;
  dDec: number;
}

// Annual aberration data
export interface AnnualAberrationData {
  dRA: number;
  dDec: number;
}

// Aberration/deflection data (same structure)
export interface AberrationData {
  dRA: number;
  dDec: number;
}

// Type alias for clarity
export type DeflectionData = AberrationData;

// Equinox ecliptic longitude/latitude with additional coordinate data
export interface EquinoxEclipticData {
  "0": number; // longitude in radians
  "1": number; // latitude in radians  
  "2": number; // distance
  "3": DegreeCoords; // longitude in degrees/minutes/seconds
  "4": DegreeCoords; // latitude in degrees/minutes/seconds
}

// Main celestial body position interface - compatible with all body types
export interface CelestialBodyPosition {
  // Core coordinate properties (present in all bodies)
  apparentLongitude: number;
  apparentLongitudeString: string;
  apparentLongitude30String: string;
  geocentricDistance: number;
  altaz: AltazData;
  apparent: ApparentCoords;
  constellation?: string;

  // Sun-specific properties
  equinoxEclipticLonLat?: EquinoxEclipticData;
  lightTime?: number;

  // Moon-specific properties
  polar?: number[];
  rect?: number[];
  nutation?: NutationData;
  geometric?: GeometricCoords;
  annualAberration?: AnnualAberrationData;
  // Moon phase properties (from MoonPhaseData)
  phaseDecimal?: number;
  phaseQuarter?: number;
  phaseQuarterString?: string;
  phaseDaysBefore?: number;
  phaseDaysPast?: number;
  phaseDaysDistance?: number;
  illuminatedFraction?: number;
  shapeString?: string;
  shapeDirectionString?: string;
  withinQuarterApproximation?: boolean;
  quarterApproximationString?: string;
  quarterApproximationDirectionString?: string;
  sunElongation?: number;
  dHorizontalParallax?: number;
  horizontalParallax?: DegreeCoords;
  dSemidiameter?: number;
  Semidiameter?: DegreeCoords;

  // Planet-specific properties
  trueGeocentricDistance?: number;
  equatorialDiameter?: number;
  approxVisual?: ApproxVisual;
  astrometricJ2000?: ApparentCoords;
  astrometricB1950?: ApparentCoords;
  deflection?: DeflectionData;

  // Star-specific properties
  approxVisualMagnitude?: number;
  astrimetricJ2000?: ApparentCoords;
  astrimetricB1950?: ApparentCoords;
  astrimetricDate?: ApparentCoords;

  // Common aberration data
  aberration: AberrationData;

  // Apparent geocentric coordinates (with optional extended data for Moon)
  apparentGeocentric?: ApparentGeocentricCoords & {
    dLongitude?: number;
    dLatitude?: number;
  };

  // Allow for additional unknown properties from the library
  [key: string]: unknown;
}

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
