import Ephemeris from "https://esm.sh/gh/0xStarcat/Moshier-Ephemeris-JS/src/Ephemeris.js";

export const ALL_BODIES = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "sun",
  "moon",
  "chiron",
] as const;

export type CelestialBody = (typeof ALL_BODIES)[number];

export interface EphemerisParams {
  bodies?: string[];
  datetime?: string;
  latitude: number;
  longitude: number;
}

export interface EphemerisResult {
  [key: string]: unknown;
}

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
  });

  const results: EphemerisResult = {};
  for (const body of celestialBodies) {
    const ephemerisRecord = ephemeris as unknown as Record<
      string,
      { position: unknown }
    >;
    if (ephemerisRecord[body]) {
      results[body] = ephemerisRecord[body].position;
    } else {
      results[body] = "Celestial body not found";
    }
  }

  return results;
}

export function getFilteredBodies(
  filter: "planets" | "luminaries" | "all"
): CelestialBody[] {
  switch (filter) {
    case "planets":
      return [
        "mercury",
        "venus",
        "mars",
        "jupiter",
        "saturn",
        "uranus",
        "neptune",
        "pluto",
      ];
    case "luminaries":
      return ["sun", "moon"];
    case "all":
    default:
      return [...ALL_BODIES];
  }
}
