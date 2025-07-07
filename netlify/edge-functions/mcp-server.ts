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
  .enum([...ALL_BODIES], {
    errorMap: () => ({ message: `Must be one of: ${ALL_BODIES.join(", ")}` }),
  })
  .describe("Name of the celestial body");

const bodiesArraySchema = z
  .array(
    z.enum([...ALL_BODIES] as [string, ...string[]], {
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
      tools: [
        "get_ephemeris_data",
        "get_single_body_position",
        "get_current_sky",
        "get_planetary_positions",
        "get_luminaries",
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
