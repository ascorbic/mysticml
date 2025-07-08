import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { toReqRes, toFetchResponse } from "fetch-to-node";

import {
  ALL_BODIES,
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
    GetEphemerisDataArgsSchema.shape,
    (args) => {
      const result = getEphemerisData(args);
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
    GetSingleBodyPositionArgsSchema.shape,
    (args) => {
      const result = getSingleBodyPosition(args);
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
    GetCurrentSkyArgsSchema.shape,
    (args) => {
      const result = getCurrentSky(args);
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
    GetPlanetaryPositionsArgsSchema.shape,
    (args) => {
      const result = getPlanetaryPositions(args);
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
    GetLuminariesArgsSchema.shape,
    (args) => {
      const result = getLuminaries(args);
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

  // Tool: Calculate aspects between celestial bodies
  server.tool(
    "calculate_aspects",
    "Calculate astrological aspects between celestial bodies at a location and time",
    CalculateAspectsArgsSchema.shape,
    (args) => {
      const result = calculateAspects(args);
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

  // Tool: Get moon phase information
  server.tool(
    "get_moon_phase",
    "Calculate moon phase and illumination percentage for a given date",
    GetMoonPhaseArgsSchema.shape,
    (args) => {
      const result = getMoonPhase(args);
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

  // Tool: Find times when body crosses angles (rising, culmination, setting)
  server.tool(
    "get_daily_events",
    "Get rising, culmination, and setting times for celestial bodies on a given date",
    GetDailyEventsArgsSchema.shape,
    (args) => {
      const result = getDailyEvents(args);
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

  // Tool: Get zodiac sign for a longitude
  server.tool(
    "get_zodiac_sign",
    "Get zodiac sign and degree for celestial body positions",
    GetZodiacSignArgsSchema.shape,
    (args) => {
      const result = getZodiacSign(args);
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

  // Tool: Compare positions between two dates
  server.tool(
    "compare_positions",
    "Compare celestial body positions between two different dates",
    ComparePositionsArgsSchema.shape,
    (args) => {
      const result = comparePositions(args);
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

  // Tool: Get Earth position (useful for heliocentric calculations)
  server.tool(
    "get_earth_position",
    "Get Earth's position in space (heliocentric coordinates)",
    GetEarthPositionArgsSchema.shape,
    (args) => {
      const result = getEarthPosition(args);
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
        transport.close();
        server.close();
      });

      // Convert Node.js ServerResponse back to Web API Response
      return toFetchResponse(nodeRes);
    } catch (error) {
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
