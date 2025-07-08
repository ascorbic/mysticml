# ephemeris.fyi

A free remote Model Context Protocol (MCP) server and REST API providing ephemeris data for celestial bodies.

## What is This?

This is a **remote MCP and API server** that provides astronomical and astrological ephemeris data for celestial bodies. MCP provides a standardized way to connect AI models to different data sources and tools, meaning this service will give these models access to precise celestial calculations. They can then be used for both astronomical research and astrological applications.

The server offers 11 specialized tools for astronomical and astrological calculations, accessible by AI assistants like Claude, ChatGPT, and other MCP-compatible applications.

## Features

### Available Tools

- **get_ephemeris_data** - Complete ephemeris data for multiple bodies
- **get_single_body_position** - Position data for one celestial body
- **get_current_sky** - All celestial bodies for current time/location
- **get_planetary_positions** - Planets only (excluding sun/moon)
- **get_luminaries** - Sun and moon positions only
- **calculate_aspects** - Astrological aspects between bodies
- **get_moon_phase** - Moon phase and illumination data
- **get_daily_events** - Rising, culmination, and setting times
- **get_zodiac_sign** - Zodiac sign and degree for positions
- **compare_positions** - Compare positions between two dates
- **get_earth_position** - Earth's heliocentric coordinates

### Supported Celestial Bodies

mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, sun, moon, chiron

## Usage

### With Claude

1. Go to [Claude.ai](https://claude.ai) Settings > Integrations
2. Click "Add custom integration"
3. Enter the server URL: `https://ephemeris.fyi/mcp`
4. Click "Add" to complete the configuration

**Requirements:** Available for Claude Pro, Max, Team, and Enterprise plans (currently in beta)

### With Cursor IDE

1. Go to Settings > Cursor Settings
2. Enable "MCP servers"
3. Create or edit `.cursor/mcp.json` in your project (or `~/.cursor/mcp.json` for global access)
4. Add the configuration:

```json
{
  "mcpServers": {
    "ephemeris": {
      "url": "https://ephemeris.fyi/mcp"
    }
  }
}
```

Or use the one-click install button at [ephemeris.fyi](https://ephemeris.fyi)

### REST API

All MCP tools are also available as REST endpoints for any HTTP client. The base URL is `https://ephemeris.fyi/ephemeris`.

```bash
# Get sun position
GET /ephemeris/get_single_body_position?body=sun&latitude=40.7128&longitude=-74.0060&datetime=2025-01-01T12:00:00Z

# Get multiple bodies
GET /ephemeris/get_ephemeris_data?bodies=sun,moon,mars&latitude=40.7128&longitude=-74.0060&datetime=2025-01-01T12:00:00Z
```

## Use Cases

- **Astronomical Research:** Precise celestial body positions for scientific calculations
- **Observational Astronomy:** Planning observations with rise/set times and current sky data
- **Astrological Applications:** Birth chart calculations and aspect analysis
- **Educational Tools:** Teaching astronomy and celestial mechanics
- **AI-Powered Analysis:** Letting AI assistants interpret celestial data
- **Mobile & Web Apps:** Integrating ephemeris data into applications

## Architecture

- **Static Site:** Main application served from `static/` directory
- **MCP Server:** Remote MCP server implementation using StreamableHTTP transport
- **REST API:** Direct HTTP access endpoints
- **Deployment:** Netlify Edge Functions

## Development

This project uses Netlify Edge Functions. No traditional build process is required.

### Commands

- `netlify dev` - Start local development server with edge functions
- `netlify build` - Build for production
- `netlify deploy --prod` - Deploy to production

### File Structure

```
├── deno.json                    # Deno configuration and dependencies
├── netlify.toml                 # Netlify configuration
├── netlify/
│   └── edge-functions/
│       ├── mcp-server.ts        # Remote MCP server implementation
│       ├── ephemeris.ts         # REST API endpoint
│       └── lib/
│           ├── ephemeris-core.ts # Shared ephemeris calculation logic
│           └── schema.ts        # Zod schemas for validation
└── static/                      # Static site files
    ├── index.html              # Landing page
    ├── openapi.yml             # API documentation
    └── privacy.html            # Privacy policy
```

## Powered By

This service is powered by the [Moshier Ephemeris JS](https://github.com/0xStarcat/Moshier-Ephemeris-JS) library, which implements Steve L. Moshier's astronomical ephemeris calculations in JavaScript.

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0) to comply with the license of the underlying Moshier Ephemeris JS library. See the [LICENSE](LICENSE) file for details.

## Links

- [Website](https://ephemeris.fyi)
- [OpenAPI Specification](https://ephemeris.fyi/openapi.yml)
- [Model Context Protocol](https://modelcontextprotocol.io/introduction)
- [Moshier Ephemeris JS](https://github.com/0xStarcat/Moshier-Ephemeris-JS)
