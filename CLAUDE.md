# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **ephemeris.fyi** project - a remote Model Context Protocol (MCP) server that provides ephemeris data for celestial bodies. The project is built as a static site with Netlify Edge Functions powering both REST API endpoints and MCP server functionality.

## Architecture

- **Static Site**: The main application is a static HTML site served from the `static/` directory
- **Edge Functions**: API functionality is implemented using Netlify Edge Functions in `netlify/edge-functions/`
- **MCP Server**: Remote MCP server implementation using StreamableHTTP transport
- **Deployment**: Configured for Netlify hosting with `netlify.toml`

### Key Components

- `static/index.html` - Main landing page explaining how to use the MCP server and REST API
- `netlify/edge-functions/mcp-server.ts` - Remote MCP server implementation
- `netlify/edge-functions/ephemeris.ts` - REST API endpoint for direct HTTP access
- `netlify/edge-functions/lib/ephemeris-core.ts` - Shared ephemeris calculation logic
- `static/openapi.yml` - API documentation for the REST endpoints
- `static/privacy.html` - Privacy policy page

## MCP Server

### What is MCP?

The Model Context Protocol (MCP) is an open standard that connects AI models to tools and data sources efficiently. Think of MCP like a USB-C port for AI applications - it provides a standardized way to connect AI models to different data sources and tools.

### Remote MCP Server at `/mcp`

This project provides a **remote MCP server** accessible via StreamableHTTP transport. Remote MCP servers offer several advantages over local servers:
- Accessible from anywhere on the internet
- No need to install or run locally
- Can be shared across multiple AI applications
- Easier deployment and maintenance

**Available MCP Tools:**
- `get_ephemeris_data` - Complete ephemeris data for specified bodies
- `get_single_body_position` - Position for one celestial body
- `get_current_sky` - All bodies for current time/location
- `get_planetary_positions` - Planets only (excluding sun/moon)
- `get_luminaries` - Sun and moon positions only
- `calculate_aspects` - Calculate astrological aspects between bodies
- `get_moon_phase` - Moon phase and illumination information
- `get_daily_events` - Rising, culmination, and setting times
- `get_zodiac_sign` - Zodiac sign and degree for positions
- `compare_positions` - Compare positions between two dates
- `get_earth_position` - Earth's heliocentric coordinates

**MCP Protocol Support:**
- `POST /mcp` with JSON-RPC 2.0 messages for tool calls
- `GET /mcp` - Server information and available tools
- Uses StreamableHTTP transport for stateless communication

## REST API

### REST Endpoints at `/ephemeris/:tool`

For direct HTTP access without MCP, the same functionality is available via REST endpoints:
- `/ephemeris/get_ephemeris_data?bodies=sun,moon&latitude=40.7128&longitude=-74.0060&datetime=2025-01-01T00:00:00Z`
- `/ephemeris/get_single_body_position?body=sun&latitude=40.7128&longitude=-74.0060&datetime=2025-01-01T00:00:00Z`
- All other MCP tools are available as REST endpoints with the same parameters

**Supported Bodies:**
mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, sun, moon, chiron

**Parameters:**
- `bodies` - Comma-separated celestial bodies (for multi-body endpoints)
- `body` - Single celestial body (for single-body endpoints)
- `datetime` - ISO 8601 datetime string
- `latitude` - Latitude in degrees (-90 to 90)
- `longitude` - Longitude in degrees (-180 to 180)

## Development

Since this is a static site with edge functions, there is no traditional build process. The site is deployed directly to Netlify.

### Common Commands
- `netlify dev` - Start local development server with edge functions
- `deno run --allow-net --allow-read netlify/edge-functions/ephemeris.ts` - Test individual edge function
- `netlify build` - Build for production
- `netlify deploy --prod` - Deploy to production

### File Structure
```
├── deno.json            # Deno configuration and dependencies
├── netlify.toml         # Netlify configuration
├── netlify/
│   └── edge-functions/
│       ├── ephemeris.ts     # HTTP API endpoint
│       ├── mcp-server.ts    # MCP server endpoint
│       └── lib/
│           └── ephemeris-core.ts  # Shared ephemeris logic
└── static/              # Static site files
    ├── index.html       # Landing page
    ├── openapi.yml      # API documentation
    └── privacy.html     # Privacy policy
```

### Shared Libraries
- `netlify/edge-functions/lib/ephemeris-core.ts` - Core ephemeris calculation logic shared between HTTP API and MCP server
- Contains utilities for coordinate validation, date parsing, and celestial body calculations
- Exports `calculateEphemeris()`, `validateCoordinates()`, `getFilteredBodies()`, and celestial body constants

## Deployment

The project is configured for Netlify deployment with:
- Build command: None (static site)
- Publish directory: `static`
- Edge functions automatically deployed from `netlify/edge-functions/`