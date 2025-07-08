import { z } from "zod";
import type { Context } from "@netlify/edge-functions";
import {
  getEphemerisData,
  getSingleBodyPosition,
  getCurrentSky,
  getPlanetaryPositions,
  getLuminaries,
  calculateAspects,
  getMoonPhase,
  getDailyEvents,
  getZodiacSign,
  comparePositions,
  getEarthPosition,
  type CelestialBody,
} from "./lib/ephemeris-core.ts";

import {
  GetEphemerisDataArgsSchema,
  GetSingleBodyPositionArgsSchema,
  GetCurrentSkyArgsSchema,
  GetPlanetaryPositionsArgsSchema,
  GetLuminariesArgsSchema,
  CalculateAspectsArgsSchema,
  GetMoonPhaseArgsSchema,
  GetDailyEventsArgsSchema,
  GetZodiacSignArgsSchema,
  ComparePositionsArgsSchema,
  GetEarthPositionArgsSchema,
} from "./lib/schema.ts";

export default async function handler(_: Request, ctx: Context) {
  try {
    const toolName = ctx.params.tool;
    console.info("Tool name:", toolName);
    const args: Record<string, string | number | string[]> = {};
    ctx.url.searchParams.forEach((value, key) => {
      try {
        args[key] = JSON.parse(value);
      } catch {
        args[key] = value;
      }
    });

    // Special handling for 'bodies' parameter which can be a comma-separated string
    if (args.bodies && typeof args.bodies === "string") {
      args.bodies = (args.bodies as string).split(",") as CelestialBody[];
    }

    let result: unknown;

    try {
      switch (toolName) {
        case "get_ephemeris_data": {
          const ephemerisArgs = GetEphemerisDataArgsSchema.parse(args);
          result = await getEphemerisData(ephemerisArgs);
          break;
        }
        case "get_single_body_position": {
          const singleBodyArgs = GetSingleBodyPositionArgsSchema.parse(args);
          result = await getSingleBodyPosition(singleBodyArgs);
          break;
        }
        case "get_current_sky": {
          const currentSkyArgs = GetCurrentSkyArgsSchema.parse(args);
          result = await getCurrentSky(currentSkyArgs);
          break;
        }
        case "get_planetary_positions": {
          const planetaryArgs = GetPlanetaryPositionsArgsSchema.parse(args);
          result = await getPlanetaryPositions(planetaryArgs);
          break;
        }
        case "get_luminaries": {
          const luminariesArgs = GetLuminariesArgsSchema.parse(args);
          result = await getLuminaries(luminariesArgs);
          break;
        }
        case "calculate_aspects": {
          const aspectsArgs = CalculateAspectsArgsSchema.parse(args);
          result = await calculateAspects(aspectsArgs);
          break;
        }
        case "get_moon_phase": {
          const moonPhaseArgs = GetMoonPhaseArgsSchema.parse(args);
          result = await getMoonPhase(moonPhaseArgs);
          break;
        }
        case "get_daily_events": {
          const dailyEventsArgs = GetDailyEventsArgsSchema.parse(args);
          result = await getDailyEvents(dailyEventsArgs);
          break;
        }
        case "get_zodiac_sign": {
          const zodiacSignArgs = GetZodiacSignArgsSchema.parse(args);
          result = await getZodiacSign(zodiacSignArgs);
          break;
        }
        case "compare_positions": {
          const comparePositionsArgs = ComparePositionsArgsSchema.parse(args);
          result = await comparePositions(comparePositionsArgs);
          break;
        }
        case "get_earth_position": {
          const earthPositionArgs = GetEarthPositionArgsSchema.parse(args);
          result = await getEarthPosition(earthPositionArgs);
          break;
        }
        default:
          return new Response("Tool not found", { status: 404 });
      }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorDetails = validationError.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        console.error("Validation Error:", errorDetails);
        return new Response(`Validation Error: ${errorDetails}`, {
          status: 400,
        });
      }
      throw validationError;
    }

    return Response.json(result);
  } catch (error) {
    console.error("Error in ephemeris handler:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(message, { status: 500 });
  }
}

export const config = {
  path: "/ephemeris/:tool",
};
