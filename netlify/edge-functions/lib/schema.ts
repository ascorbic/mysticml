import { z } from "zod";
import { ALL_BODIES } from "./ephemeris-core.ts";

export const latitudeSchema = z
  .number()
  .min(-90, "Latitude must be >= -90 degrees")
  .max(90, "Latitude must be <= 90 degrees")
  .describe("Latitude in degrees (-90 to 90)");

export const longitudeSchema = z
  .number()
  .min(-180, "Longitude must be >= -180 degrees")
  .max(180, "Longitude must be <= 180 degrees")
  .describe("Longitude in degrees (-180 to 180)");

export const datetimeSchema = z
  .string()
  .datetime("Must be a valid ISO 8601 datetime string")
  .optional()
  .describe("ISO 8601 datetime string (optional, defaults to current time)");

export const celestialBodySchema = z
  .enum(ALL_BODIES, {
    errorMap: () => ({ message: `Must be one of: ${ALL_BODIES.join(", ")}` }),
  })
  .describe("Name of the celestial body");

export const bodiesArraySchema = z
  .array(
    z.enum(ALL_BODIES, {
      errorMap: () => ({
        message: `Each body must be one of: ${ALL_BODIES.join(", ")}`,
      }),
    })
  )
  .min(1, "Must specify at least one celestial body")
  .max(
    ALL_BODIES.length,
    `Cannot specify more than ${ALL_BODIES.length} bodies`
  )
  .optional()
  .describe(
    "Array of celestial bodies to calculate (optional, defaults to all bodies)"
  );

export const aspectOrbSchema = z
  .number()
  .min(0.1, "Orb must be >= 0.1 degrees")
  .max(15, "Orb must be <= 15 degrees")
  .default(8)
  .describe("Orb tolerance in degrees (default: 8)");

// Combined schemas for each tool's arguments
export const GetEphemerisDataArgsSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  datetime: datetimeSchema,
  bodies: bodiesArraySchema.optional(),
});

export const GetSingleBodyPositionArgsSchema = z.object({
  body: celestialBodySchema,
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  datetime: datetimeSchema,
});

export const GetCurrentSkyArgsSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
});

export const GetPlanetaryPositionsArgsSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  datetime: datetimeSchema,
});

export const GetLuminariesArgsSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  datetime: datetimeSchema,
});

export const CalculateAspectsArgsSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  datetime: datetimeSchema,
  orb: aspectOrbSchema,
  bodies: bodiesArraySchema,
});

export const GetMoonPhaseArgsSchema = z.object({
  datetime: datetimeSchema,
});

export const GetDailyEventsArgsSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  datetime: datetimeSchema,
  body: celestialBodySchema,
});

export const GetZodiacSignArgsSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  datetime: datetimeSchema,
  body: celestialBodySchema,
});

export const ComparePositionsArgsSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  date1: z.string().datetime().describe("First date to compare"),
  date2: z.string().datetime().describe("Second date to compare"),
  bodies: bodiesArraySchema,
});

export const GetEarthPositionArgsSchema = z.object({
  datetime: datetimeSchema,
});
