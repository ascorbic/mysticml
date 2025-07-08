import Ephemeris from "https://esm.sh/gh/0xStarcat/Moshier-Ephemeris-JS/src/Ephemeris.js";

const PLANETARY_BODIES_CONST = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

export const PLANETARY_BODIES = [...PLANETARY_BODIES_CONST];

const LUMINARIES_CONST = ["sun", "moon"] as const;

export const LUMINARIES = [...LUMINARIES_CONST];

const STARS_CONST = ["sirius"] as const;

export const STARS = [...STARS_CONST];

const ASTEROIDS_CONST = ["chiron"] as const;

export const ASTEROIDS = [...ASTEROIDS_CONST];

export const ALL_BODIES = [
  ...PLANETARY_BODIES_CONST,
  ...LUMINARIES_CONST,
  ...STARS_CONST,
  ...ASTEROIDS_CONST,
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

export function getEphemerisData(args: {
  latitude: number;
  longitude: number;
  datetime?: string;
  bodies?: CelestialBody[];
}) {
  return calculateEphemeris(args);
}

export function getSingleBodyPosition(args: {
  body: CelestialBody;
  latitude: number;
  longitude: number;
  datetime?: string;
}) {
  return calculateEphemeris({ ...args, bodies: [args.body] });
}

export function getCurrentSky(args: { latitude: number; longitude: number }) {
  return calculateEphemeris({ ...args, bodies: [...ALL_BODIES] });
}

export function getPlanetaryPositions(args: {
  latitude: number;
  longitude: number;
  datetime?: string;
}) {
  return calculateEphemeris({
    ...args,
    bodies: PLANETARY_BODIES as CelestialBody[],
  });
}

export function getLuminaries(args: {
  latitude: number;
  longitude: number;
  datetime?: string;
}) {
  return calculateEphemeris({ ...args, bodies: LUMINARIES as CelestialBody[] });
}

export function calculateAspects(args: {
  latitude: number;
  longitude: number;
  datetime?: string;
  orb?: number;
  bodies?: CelestialBody[];
}) {
  const result = calculateEphemeris({
    latitude: args.latitude,
    longitude: args.longitude,
    datetime: args.datetime,
    bodies: args.bodies,
  });

  const positions: Record<string, number> = {};
  for (const [body, data] of Object.entries(result)) {
    if (data && typeof data === "object") {
      const longitude = data.apparentLongitude ?? data.longitude;
      if (typeof longitude === "number" && !isNaN(longitude)) {
        positions[body] = longitude;
      }
    }
  }

  if (Object.keys(positions).length < 2) {
    throw new Error(
      "Need at least 2 bodies with valid positions to calculate aspects"
    );
  }

  const aspects = [];
  const bodyNames = Object.keys(positions);
  const majorAspects = [
    { name: "conjunction", angle: 0 },
    { name: "sextile", angle: 60 },
    { name: "square", angle: 90 },
    { name: "trine", angle: 120 },
    { name: "opposition", angle: 180 },
  ];

  for (let i = 0; i < bodyNames.length; i++) {
    for (let j = i + 1; j < bodyNames.length; j++) {
      const body1 = bodyNames[i];
      const body2 = bodyNames[j];
      const angle = Math.abs(positions[body1] - positions[body2]);
      const normalizedAngle = angle > 180 ? 360 - angle : angle;

      for (const aspect of majorAspects) {
        const orb = Math.abs(normalizedAngle - aspect.angle);
        if (orb <= (args.orb || 8)) {
          aspects.push({
            body1,
            body2,
            aspect: aspect.name,
            angle: normalizedAngle,
            orb,
            exact: orb < 1,
          });
        }
      }
    }
  }
  return { aspects, orb_used: args.orb || 8 };
}

export function getMoonPhase(args: { datetime?: string }) {
  const result = calculateEphemeris({
    latitude: 0,
    longitude: 0,
    datetime: args.datetime,
    bodies: ["sun", "moon"],
  });

  if (!result.sun?.apparentLongitude || !result.moon?.apparentLongitude) {
    throw new Error("Failed to calculate sun or moon position");
  }

  const sunLon = result.sun.apparentLongitude;
  const moonLon = result.moon.apparentLongitude;

  const elongation = (moonLon - sunLon + 360) % 360;
  const phaseAngle = Math.abs(180 - elongation);
  const illumination = ((1 + Math.cos((phaseAngle * Math.PI) / 180)) / 2) * 100;

  let phase = "";
  if (elongation < 22.5 || elongation >= 337.5) {
    phase = "New Moon";
  } else if (elongation < 67.5) {
    phase = "Waxing Crescent";
  } else if (elongation < 112.5) {
    phase = "First Quarter";
  } else if (elongation < 157.5) {
    phase = "Waxing Gibbous";
  } else if (elongation < 202.5) {
    phase = "Full Moon";
  } else if (elongation < 247.5) {
    phase = "Waning Gibbous";
  } else if (elongation < 292.5) {
    phase = "Third Quarter";
  } else {
    phase = "Waning Crescent";
  }

  return {
    phase,
    illumination: Math.round(illumination * 100) / 100,
    elongation: Math.round(elongation * 100) / 100,
    phase_angle: Math.round(phaseAngle * 100) / 100,
    sun_longitude: Math.round(sunLon * 100) / 100,
    moon_longitude: Math.round(moonLon * 100) / 100,
  };
}

export function getDailyEvents(args: {
  latitude: number;
  longitude: number;
  datetime?: string;
  body: CelestialBody;
}) {
  const date = args.datetime ? new Date(args.datetime) : new Date();
  const events = [];
  let previousAltitude = null;
  let maxAltitude = -90;
  let maxAltitudeTime = null;

  for (let hour = 0; hour < 24; hour += 0.25) {
    const testDate = new Date(date);
    testDate.setUTCHours(Math.floor(hour), (hour % 1) * 60, 0, 0);

    const result = calculateEphemeris({
      latitude: args.latitude,
      longitude: args.longitude,
      datetime: testDate.toISOString(),
      bodies: [args.body],
    });

    const bodyData = result[args.body];
    if (!bodyData?.altaz) continue;

    const altitude = bodyData.altaz.topocentric?.altitude;
    const azimuth = bodyData.altaz.topocentric?.azimuth;

    if (typeof altitude !== "number" || typeof azimuth !== "number") continue;

    if (altitude > maxAltitude) {
      maxAltitude = altitude;
      maxAltitudeTime = testDate.toISOString();
    }

    if (previousAltitude !== null) {
      if (previousAltitude < 0 && altitude > 0) {
        events.push({
          event: "rising",
          time: testDate.toISOString(),
          altitude: Math.round(altitude * 100) / 100,
          azimuth: Math.round(azimuth * 100) / 100,
        });
      } else if (previousAltitude > 0 && altitude < 0) {
        events.push({
          event: "setting",
          time: testDate.toISOString(),
          altitude: Math.round(altitude * 100) / 100,
          azimuth: Math.round(azimuth * 100) / 100,
        });
      }
    }
    previousAltitude = altitude;
  }

  if (maxAltitudeTime && maxAltitude > 0) {
    events.push({
      event: "culmination",
      time: maxAltitudeTime,
      altitude: Math.round(maxAltitude * 100) / 100,
      azimuth: 180,
    });
  }

  events.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  return {
    body: args.body,
    date: date.toISOString().split("T")[0],
    events: events.slice(0, 6),
  };
}

export function getZodiacSign(args: {
  latitude: number;
  longitude: number;
  datetime?: string;
  body: CelestialBody;
}) {
  const result = calculateEphemeris({
    ...args,
    bodies: [args.body],
  });

  const bodyData = result[args.body];
  if (!bodyData) {
    throw new Error(`No data available for ${args.body}`);
  }
  let longitude = bodyData.apparentLongitude;
  longitude = ((longitude % 360) + 360) % 360;

  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];

  const signIndex = Math.floor(longitude / 30);
  const degree = longitude % 30;
  const sign = signs[Math.min(signIndex, signs.length - 1)];

  return {
    body: args.body,
    longitude: Math.round(longitude * 1000) / 1000,
    sign,
    degree: Math.round(degree * 1000) / 1000,
    position: `${Math.floor(degree)}° ${sign}`,
  };
}

export function comparePositions(args: {
  latitude: number;
  longitude: number;
  date1: string;
  date2: string;
  bodies?: CelestialBody[];
}) {
  const result1 = calculateEphemeris({
    ...args,
    datetime: args.date1,
  });
  const result2 = calculateEphemeris({
    ...args,
    datetime: args.date2,
  });

  const comparison: Record<
    string,
    {
      date1_position: number;
      date2_position: number;
      movement: number;
      direction: string;
    }
  > = {};

  for (const body of args.bodies || ALL_BODIES) {
    const data1 = result1[body];
    const data2 = result2[body];
    if (!data1 || !data2) continue;
    const pos1 = data1.apparentLongitude;
    const pos2 = data2.apparentLongitude;
    const movement = ((pos2 - pos1 + 540) % 360) - 180;

    comparison[body] = {
      date1_position: Math.round(pos1 * 1000) / 1000,
      date2_position: Math.round(pos2 * 1000) / 1000,
      movement: Math.round(movement * 1000) / 1000,
      direction: movement > 0 ? "forward" : "retrograde",
    };
  }
  return {
    date1: args.date1,
    date2: args.date2,
    comparison,
  };
}

export function getEarthPosition(args: { datetime?: string }) {
  return calculateEphemeris({
    latitude: 0,
    longitude: 0,
    datetime: args.datetime,
    bodies: ["earth"],
  });
}
