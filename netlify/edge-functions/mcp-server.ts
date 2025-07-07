import { 
  calculateEphemeris, 
  getFilteredBodies, 
  ALL_BODIES 
} from "./lib/ephemeris-core.ts";

// MCP Tool Definitions
const MCP_TOOLS = [
  {
    name: "get_ephemeris_data",
    description: "Get ephemeris data for celestial bodies at a specific location and time",
    inputSchema: {
      type: "object",
      properties: {
        latitude: { type: "number", description: "Latitude in degrees (-90 to 90)" },
        longitude: { type: "number", description: "Longitude in degrees (-180 to 180)" },
        datetime: { type: "string", description: "ISO 8601 datetime string (optional, defaults to current time)" },
        bodies: { 
          type: "array", 
          items: { type: "string" },
          description: "Array of celestial bodies to calculate (optional, defaults to all bodies)"
        }
      },
      required: ["latitude", "longitude"]
    }
  },
  {
    name: "get_single_body_position",
    description: "Get position data for a single celestial body",
    inputSchema: {
      type: "object",
      properties: {
        body: { 
          type: "string", 
          enum: [...ALL_BODIES],
          description: "Name of the celestial body"
        },
        latitude: { type: "number", description: "Latitude in degrees (-90 to 90)" },
        longitude: { type: "number", description: "Longitude in degrees (-180 to 180)" },
        datetime: { type: "string", description: "ISO 8601 datetime string (optional, defaults to current time)" }
      },
      required: ["body", "latitude", "longitude"]
    }
  },
  {
    name: "get_current_sky",
    description: "Get all celestial body positions for current time at a location",
    inputSchema: {
      type: "object",
      properties: {
        latitude: { type: "number", description: "Latitude in degrees (-90 to 90)" },
        longitude: { type: "number", description: "Longitude in degrees (-180 to 180)" }
      },
      required: ["latitude", "longitude"]
    }
  },
  {
    name: "get_planetary_positions",
    description: "Get positions for planets only (excluding sun and moon)",
    inputSchema: {
      type: "object",
      properties: {
        latitude: { type: "number", description: "Latitude in degrees (-90 to 90)" },
        longitude: { type: "number", description: "Longitude in degrees (-180 to 180)" },
        datetime: { type: "string", description: "ISO 8601 datetime string (optional, defaults to current time)" }
      },
      required: ["latitude", "longitude"]
    }
  },
  {
    name: "get_luminaries",
    description: "Get positions for sun and moon only",
    inputSchema: {
      type: "object",
      properties: {
        latitude: { type: "number", description: "Latitude in degrees (-90 to 90)" },
        longitude: { type: "number", description: "Longitude in degrees (-180 to 180)" },
        datetime: { type: "string", description: "ISO 8601 datetime string (optional, defaults to current time)" }
      },
      required: ["latitude", "longitude"]
    }
  }
];

// Handle MCP Tool Calls
async function handleToolCall(name: string, args: any) {
  try {
    switch (name) {
      case "get_ephemeris_data":
        const result = calculateEphemeris({
          latitude: args.latitude,
          longitude: args.longitude,
          datetime: args.datetime,
          bodies: args.bodies
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
        
      case "get_single_body_position":
        const singleResult = calculateEphemeris({
          latitude: args.latitude,
          longitude: args.longitude,
          datetime: args.datetime,
          bodies: [args.body]
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(singleResult, null, 2)
          }]
        };
        
      case "get_current_sky":
        const currentResult = calculateEphemeris({
          latitude: args.latitude,
          longitude: args.longitude,
          bodies: ALL_BODIES
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(currentResult, null, 2)
          }]
        };
        
      case "get_planetary_positions":
        const planetaryBodies = getFilteredBodies('planets');
        const planetaryResult = calculateEphemeris({
          latitude: args.latitude,
          longitude: args.longitude,
          datetime: args.datetime,
          bodies: planetaryBodies
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(planetaryResult, null, 2)
          }]
        };
        
      case "get_luminaries":
        const luminaries = getFilteredBodies('luminaries');
        const luminariesResult = calculateEphemeris({
          latitude: args.latitude,
          longitude: args.longitude,
          datetime: args.datetime,
          bodies: luminaries
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(luminariesResult, null, 2)
          }]
        };
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}

// Netlify Edge Function Handler
export default async function handler(req: Request) {
  try {
    // Handle MCP protocol over HTTP
    if (req.method === "POST") {
      const body = await req.json();
      
      // Handle tools/list request
      if (body.method === "tools/list") {
        return Response.json({
          tools: MCP_TOOLS
        });
      }
      
      // Handle tools/call request
      if (body.method === "tools/call") {
        const { name, arguments: args } = body.params;
        const response = await handleToolCall(name, args);
        return Response.json(response);
      }
      
      // Handle initialize request
      if (body.method === "initialize") {
        return Response.json({
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "ephemeris-server",
            version: "1.0.0"
          }
        });
      }
    }
    
    // Handle GET requests - return server info
    if (req.method === "GET") {
      return Response.json({
        name: "ephemeris-server",
        version: "1.0.0",
        description: "MCP server for ephemeris calculations",
        tools: MCP_TOOLS.map(tool => tool.name)
      });
    }
    
    return new Response("Method not allowed", { status: 405 });
    
  } catch (error) {
    console.error("MCP Server Error:", error);
    return new Response(`Server Error: ${error.message}`, { status: 500 });
  }
}

export const config = {
  path: "/mcp"
};