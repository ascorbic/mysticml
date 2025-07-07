# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **MysticML** project - a spiritual/astrology web application that provides ephemeris data for celestial bodies. The project is built as a static site with Netlify Edge Functions for dynamic API endpoints.

## Architecture

- **Static Site**: The main application is a static HTML site served from the `static/` directory
- **Edge Functions**: API functionality is implemented using Netlify Edge Functions in `netlify/edge-functions/`
- **Deployment**: Configured for Netlify hosting with `netlify.toml`

### Key Components

- `static/index.html` - Main landing page for "Stellar Guide" 
- `netlify/edge-functions/ephemeris.ts` - API endpoint that calculates celestial body positions using the Moshier Ephemeris library
- `static/openapi.yml` - API documentation for the ephemeris endpoint
- `static/privacy.html` - Privacy policy page

## API Functionality

### HTTP API Endpoint: `/ephemeris`
- Accepts query parameters: `bodies` (comma-separated celestial bodies), `datetime` (ISO 8601), `latitude`, `longitude`
- Returns position data for celestial bodies (mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, sun, moon, chiron)
- Uses the Moshier Ephemeris JS library for astronomical calculations

### MCP Server Endpoint: `/mcp`
The project includes a Model Context Protocol (MCP) server that exposes ephemeris functionality as AI tools:

**Available MCP Tools:**
- `get_ephemeris_data` - Complete ephemeris data for specified bodies
- `get_single_body_position` - Position for one celestial body
- `get_current_sky` - All bodies for current time/location
- `get_planetary_positions` - Planets only (excluding sun/moon)
- `get_luminaries` - Sun and moon positions only

**MCP Protocol Support:**
- `POST /mcp` with `{"method": "tools/list"}` - List available tools
- `POST /mcp` with `{"method": "tools/call", "params": {...}}` - Execute tool calls
- `GET /mcp` - Server information and available tools

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