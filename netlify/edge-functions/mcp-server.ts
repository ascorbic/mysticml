// import { McpServer } from "npm:@modelcontextprotocol/sdk/server/mcp.js";
// import { StreamableHTTPServerTransport } from "npm:@modelcontextprotocol/sdk/server/streamableHttp.js";
// import { toReqRes, toFetchResponse } from "npm:fetch-to-node";
// import { z } from "npm:zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { toReqRes, toFetchResponse } from "fetch-to-node";
import { z } from "zod";
import {
  calculateEphemeris,
  getFilteredBodies,
  ALL_BODIES,
} from "./lib/ephemeris-core.ts";

// Zod schema definitions with strict validation
const latitudeSchema = z
  .number()
  .min(-90, "Latitude must be >= -90 degrees")
  .max(90, "Latitude must be <= 90 degrees")
  .describe("Latitude in degrees (-90 to 90)");

const longitudeSchema = z
  .number()
  .min(-180, "Longitude must be >= -180 degrees")
  .max(180, "Longitude must be <= 180 degrees")
  .describe("Longitude in degrees (-180 to 180)");

const datetimeSchema = z
  .string()
  .datetime("Must be a valid ISO 8601 datetime string")
  .optional()
  .describe("ISO 8601 datetime string (optional, defaults to current time)");

const celestialBodySchema = z
  .enum(ALL_BODIES, {
    errorMap: () => ({ message: `Must be one of: ${ALL_BODIES.join(", ")}` }),
  })
  .describe("Name of the celestial body");

const bodiesArraySchema = z
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

// Create and configure MCP Server
function getServer(): McpServer {
  const server = new McpServer(
    {
      name: "ephemeris-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        logging: {},
      },
    }
  );

  // Register get_ephemeris_data tool
  server.tool(
    "get_ephemeris_data",
    "Get ephemeris data for celestial bodies at a specific location and time",
    {
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      datetime: datetimeSchema,
      bodies: bodiesArraySchema.optional(),
    },
    (args) => {
      const result = calculateEphemeris({
        latitude: args.latitude,
        longitude: args.longitude,
        datetime: args.datetime,
        bodies: args.bodies,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Register get_single_body_position tool
  server.tool(
    "get_single_body_position",
    "Get position data for a single celestial body",
    {
      body: celestialBodySchema,
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      datetime: datetimeSchema,
    },
    (args) => {
      const result = calculateEphemeris({
        latitude: args.latitude,
        longitude: args.longitude,
        datetime: args.datetime,
        bodies: [args.body],
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_current_sky",
    "Get all celestial body positions for current time at a location",
    {
      latitude: latitudeSchema,
      longitude: longitudeSchema,
    },
    (args) => {
      const result = calculateEphemeris({
        latitude: args.latitude,
        longitude: args.longitude,
        bodies: [...ALL_BODIES],
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_planetary_positions",
    "Get positions for planets only (excluding sun and moon)",
    {
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      datetime: datetimeSchema,
    },
    (args) => {
      const planetaryBodies = getFilteredBodies("planets");
      const result = calculateEphemeris({
        latitude: args.latitude,
        longitude: args.longitude,
        datetime: args.datetime,
        bodies: planetaryBodies,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_luminaries",
    "Get positions for sun and moon only",
    {
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      datetime: datetimeSchema,
    },
    (args) => {
      const luminaries = getFilteredBodies("luminaries");
      const result = calculateEphemeris({
        latitude: args.latitude,
        longitude: args.longitude,
        datetime: args.datetime,
        bodies: luminaries,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  const aspectOrbSchema = z
    .number()
    .min(0.1, "Orb must be >= 0.1 degrees")
    .max(15, "Orb must be <= 15 degrees")
    .default(8)
    .describe("Orb tolerance in degrees (default: 8)");

  // Tool: Calculate aspects between celestial bodies
  server.tool(
    "calculate_aspects",
    "Calculate astrological aspects between celestial bodies at a location and time",
    {
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      datetime: datetimeSchema,
      orb: aspectOrbSchema,
      bodies: bodiesArraySchema,
    },
    (args) => {
      const result = calculateEphemeris({
        latitude: args.latitude,
        longitude: args.longitude,
        datetime: args.datetime,
        bodies: args.bodies,
      });

      const positions: Record<string, number> = {};
      for (const [body, data] of Object.entries(result)) {
        if (data?.longitude !== undefined) {
          positions[body] = data.longitude;
        }
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

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ aspects, orb_used: args.orb || 8 }, null, 2),
          },
        ],
      };
    }
  );

  // Tool: Get moon phase information
  server.tool(
    "get_moon_phase",
    "Calculate moon phase and illumination percentage for a given date",
    {
      datetime: datetimeSchema,
    },
    (args) => {
      const result = calculateEphemeris({
        latitude: 0, // Moon phase is the same globally
        longitude: 0,
        datetime: args.datetime,
        bodies: ["sun", "moon"],
      });
      const sunLon = result.sun?.longitude ?? 0;
      const moonLon = result.moon?.longitude ?? 0;
      const angle = (moonLon - sunLon + 360) % 360;

      let phase = "";
      let illumination = 0;

      if (angle < 45 || angle >= 315) {
        phase = "New Moon";
        illumination = (Math.abs(angle - (angle > 180 ? 360 : 0)) / 45) * 50;
      } else if (angle < 135) {
        phase = "Waxing";
        illumination = 50 + ((angle - 45) / 90) * 50;
      } else if (angle < 225) {
        phase = "Full Moon";
        illumination = 100 - (Math.abs(angle - 180) / 45) * 50;
      } else {
        phase = "Waning";
        illumination = 50 - ((angle - 225) / 90) * 50;
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                phase,
                illumination: Math.round(illumination * 100) / 100,
                angle: Math.round(angle * 100) / 100,
                sun_longitude: Math.round(sunLon * 100) / 100,
                moon_longitude: Math.round(moonLon * 100) / 100,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool: Find times when body crosses angles (rising, culmination, setting)
  server.tool(
    "get_daily_events",
    "Get rising, culmination, and setting times for celestial bodies on a given date",
    {
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      datetime: z
        .string()
        .datetime()
        .describe("Date to calculate events for (time component ignored)"),
      body: celestialBodySchema,
    },
    (args) => {
      const date = new Date(args.datetime);
      const events = [];

      // Calculate positions at different times throughout the day
      for (let hour = 0; hour < 24; hour += 0.5) {
        const testDate = new Date(date);
        testDate.setUTCHours(hour, 0, 0, 0);

        const result = calculateEphemeris({
          latitude: args.latitude,
          longitude: args.longitude,
          datetime: testDate.toISOString(),
          bodies: [args.body],
        });

        const bodyData = result[args.body];
        const altitude = bodyData?.altitude || 0;
        const azimuth = bodyData?.azimuth || 0;

        // Approximate events based on altitude
        if (Math.abs(altitude) < 1 && azimuth < 180) {
          events.push({
            event: "rising",
            time: testDate.toISOString(),
            altitude,
            azimuth,
          });
        } else if (altitude > 85) {
          events.push({
            event: "culmination",
            time: testDate.toISOString(),
            altitude,
            azimuth,
          });
        } else if (Math.abs(altitude) < 1 && azimuth > 180) {
          events.push({
            event: "setting",
            time: testDate.toISOString(),
            altitude,
            azimuth,
          });
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                body: args.body,
                date: date.toISOString().split("T")[0],
                events: events.slice(0, 10), // Limit results
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool: Get zodiac sign for a longitude
  server.tool(
    "get_zodiac_sign",
    "Get zodiac sign and degree for celestial body positions",
    {
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      datetime: datetimeSchema,
      body: celestialBodySchema,
    },
    (args) => {
      const result = calculateEphemeris({
        latitude: args.latitude,
        longitude: args.longitude,
        datetime: args.datetime,
        bodies: [args.body],
      });

      const longitude = result[args.body]?.longitude ?? 0;

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
      const sign = signs[signIndex] || signs[0];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                body: args.body,
                longitude: Math.round(longitude * 1000) / 1000,
                sign,
                degree: Math.round(degree * 1000) / 1000,
                position: `${Math.floor(degree)}° ${sign}`,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool: Compare positions between two dates
  server.tool(
    "compare_positions",
    "Compare celestial body positions between two different dates",
    {
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      date1: z.string().datetime().describe("First date to compare"),
      date2: z.string().datetime().describe("Second date to compare"),
      bodies: bodiesArraySchema,
    },
    (args) => {
      const result1 = calculateEphemeris({
        latitude: args.latitude,
        longitude: args.longitude,
        datetime: args.date1,
        bodies: args.bodies,
      });

      const result2 = calculateEphemeris({
        latitude: args.latitude,
        longitude: args.longitude,
        datetime: args.date2,
        bodies: args.bodies,
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
        const pos1 = result1[body]?.longitude ?? 0;
        const pos2 = result2[body]?.longitude ?? 0;
        const movement = ((pos2 - pos1 + 540) % 360) - 180; // Handle wraparound

        comparison[body] = {
          date1_position: Math.round(pos1 * 1000) / 1000,
          date2_position: Math.round(pos2 * 1000) / 1000,
          movement: Math.round(movement * 1000) / 1000,
          direction: movement > 0 ? "forward" : "retrograde",
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                date1: args.date1,
                date2: args.date2,
                comparison,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool: Get Earth position (useful for heliocentric calculations)
  server.tool(
    "get_earth_position",
    "Get Earth's position in space (heliocentric coordinates)",
    {
      datetime: datetimeSchema,
    },
    (args) => {
      const result = calculateEphemeris({
        latitude: 0,
        longitude: 0,
        datetime: args.datetime,
        bodies: ["earth"],
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  return server;
}

// Netlify Edge Function Handler
export default async function handler(req: Request) {
  if (req.method === "POST") {
    try {
      const { req: nodeReq, res: nodeRes } = toReqRes(req);
      const server = getServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode
      });
      await server.connect(transport);

      // Parse request body as JSON
      const body = await req.json();

      // Handle the request through the transport
      await transport.handleRequest(nodeReq, nodeRes, body);

      // Handle response closing
      nodeRes.on("close", () => {
        console.log("Request closed");
        transport.close();
        server.close();
      });

      // Convert Node.js ServerResponse back to Web API Response
      return toFetchResponse(nodeRes);
    } catch (error) {
      console.error("MCP Server Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return new Response(`Server Error: ${errorMessage}`, { status: 500 });
    }
  }

  // Handle GET requests - return server info
  return new Response(
    JSON.stringify({
      name: "ephemeris-server",
      version: "1.0.0",
      description: "MCP server for ephemeris calculations",
      supported_bodies: ALL_BODIES,
      tools: [
        "get_ephemeris_data",
        "get_single_body_position",
        "get_current_sky",
        "get_planetary_positions",
        "get_luminaries",
        "calculate_aspects",
        "get_moon_phase",
        "get_daily_events",
        "get_zodiac_sign",
        "compare_positions",
        "get_earth_position",
      ],
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}

export const config = {
  path: "/mcp",
};
