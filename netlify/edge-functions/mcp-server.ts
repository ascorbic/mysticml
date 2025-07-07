import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { toReqRes, toFetchResponse } from "fetch-to-node";
import {
  calculateEphemeris,
  getFilteredBodies,
  ALL_BODIES,
} from "./lib/ephemeris-core.ts";

// Create and configure MCP Server
function getServer(): McpServer {
  const server = new McpServer(
    {
      name: "ephemeris-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register get_ephemeris_data tool
  server.tool(
    "get_ephemeris_data",
    "Get ephemeris data for celestial bodies at a specific location and time",
    {
      type: "object",
      properties: {
        latitude: {
          type: "number",
          description: "Latitude in degrees (-90 to 90)",
        },
        longitude: {
          type: "number",
          description: "Longitude in degrees (-180 to 180)",
        },
        datetime: {
          type: "string",
          description:
            "ISO 8601 datetime string (optional, defaults to current time)",
        },
        bodies: {
          type: "array",
          items: { type: "string" },
          description:
            "Array of celestial bodies to calculate (optional, defaults to all bodies)",
        },
      },
      required: ["latitude", "longitude"],
    },
    (args) => {
      const result = calculateEphemeris({
        latitude: args.latitude as number,
        longitude: args.longitude as number,
        datetime: args.datetime as string | undefined,
        bodies: args.bodies as string[] | undefined,
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
      type: "object",
      properties: {
        body: {
          type: "string",
          enum: [...ALL_BODIES],
          description: "Name of the celestial body",
        },
        latitude: {
          type: "number",
          description: "Latitude in degrees (-90 to 90)",
        },
        longitude: {
          type: "number",
          description: "Longitude in degrees (-180 to 180)",
        },
        datetime: {
          type: "string",
          description:
            "ISO 8601 datetime string (optional, defaults to current time)",
        },
      },
      required: ["body", "latitude", "longitude"],
    },
    (args) => {
      const result = calculateEphemeris({
        latitude: args.latitude as number,
        longitude: args.longitude as number,
        datetime: args.datetime as string | undefined,
        bodies: [args.body as string],
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

  // Register get_current_sky tool
  server.tool(
    "get_current_sky",
    "Get all celestial body positions for current time at a location",
    {
      type: "object",
      properties: {
        latitude: {
          type: "number",
          description: "Latitude in degrees (-90 to 90)",
        },
        longitude: {
          type: "number",
          description: "Longitude in degrees (-180 to 180)",
        },
      },
      required: ["latitude", "longitude"],
    },
    (args) => {
      const result = calculateEphemeris({
        latitude: args.latitude as number,
        longitude: args.longitude as number,
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

  // Register get_planetary_positions tool
  server.tool(
    "get_planetary_positions",
    "Get positions for planets only (excluding sun and moon)",
    {
      type: "object",
      properties: {
        latitude: {
          type: "number",
          description: "Latitude in degrees (-90 to 90)",
        },
        longitude: {
          type: "number",
          description: "Longitude in degrees (-180 to 180)",
        },
        datetime: {
          type: "string",
          description:
            "ISO 8601 datetime string (optional, defaults to current time)",
        },
      },
      required: ["latitude", "longitude"],
    },
    (args) => {
      const planetaryBodies = getFilteredBodies("planets");
      const result = calculateEphemeris({
        latitude: args.latitude as number,
        longitude: args.longitude as number,
        datetime: args.datetime as string | undefined,
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

  // Register get_luminaries tool
  server.tool(
    "get_luminaries",
    "Get positions for sun and moon only",
    {
      type: "object",
      properties: {
        latitude: {
          type: "number",
          description: "Latitude in degrees (-90 to 90)",
        },
        longitude: {
          type: "number",
          description: "Longitude in degrees (-180 to 180)",
        },
        datetime: {
          type: "string",
          description:
            "ISO 8601 datetime string (optional, defaults to current time)",
        },
      },
      required: ["latitude", "longitude"],
    },
    (args) => {
      const luminaries = getFilteredBodies("luminaries");
      const result = calculateEphemeris({
        latitude: args.latitude as number,
        longitude: args.longitude as number,
        datetime: args.datetime as string | undefined,
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
      const server = getServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
        enableJsonResponse: true, // Use JSON responses instead of SSE for simplicity
      });
      await server.connect(transport);

      // Parse the request body
      const body = await req.text();
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }

      // Convert Web API Request/Response to Node.js style using fetch-to-node
      const { req: nodeReq, res: nodeRes } = toReqRes(req);

      // Handle the request through the transport
      await transport.handleRequest(nodeReq, nodeRes, parsedBody);

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
