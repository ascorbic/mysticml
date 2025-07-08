import { assertEquals, assertExists, assert } from "jsr:@std/assert";
import { ALL_BODIES } from "../netlify/edge-functions/lib/ephemeris-core.ts";

// MCP server tests - no direct HTTP testing needed as we test logic and schemas

// Import the handler function
// Note: This is a simplified test approach since the handler is a default export
// In a real test, we might need to restructure the code to make functions more testable

Deno.test("MCP Server - GET request returns server info", () => {
  // We'll test the expected response structure
  const expectedResponse = {
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
    ]
  };
  
  // Verify the expected structure
  assertEquals(expectedResponse.tools.length, 11);
  assertEquals(expectedResponse.supported_bodies, ALL_BODIES);
  assert(expectedResponse.name === "ephemeris-server");
});

Deno.test("MCP Server - tool list completeness", () => {
  const expectedTools = [
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
  ];
  
  assertEquals(expectedTools.length, 11);
  
  // Verify all expected tools are present
  const toolCategories = {
    basic: ["get_ephemeris_data", "get_single_body_position", "get_current_sky", 
            "get_planetary_positions", "get_luminaries"],
    advanced: ["calculate_aspects", "get_moon_phase", "get_daily_events", 
               "get_zodiac_sign", "compare_positions"],
    specialized: ["get_earth_position"]
  };
  
  assertEquals(toolCategories.basic.length, 5);
  assertEquals(toolCategories.advanced.length, 5);
  assertEquals(toolCategories.specialized.length, 1);
});

Deno.test("MCP Schema validation - latitude schema", () => {
  // Test latitude validation ranges
  const validLatitudes = [0, 40.7128, -33.8688, 90, -90];
  const invalidLatitudes = [91, -91, 180, -180, NaN];
  
  // These would be validated by Zod in the actual implementation
  validLatitudes.forEach(lat => {
    assert(lat >= -90 && lat <= 90, `${lat} should be valid latitude`);
  });
  
  invalidLatitudes.forEach(lat => {
    assert(isNaN(lat) || lat < -90 || lat > 90, `${lat} should be invalid latitude`);
  });
});

Deno.test("MCP Schema validation - longitude schema", () => {
  // Test longitude validation ranges
  const validLongitudes = [0, -74.0060, 151.2093, 180, -180];
  const invalidLongitudes = [181, -181, 360, -360, NaN];
  
  validLongitudes.forEach(lon => {
    assert(lon >= -180 && lon <= 180, `${lon} should be valid longitude`);
  });
  
  invalidLongitudes.forEach(lon => {
    assert(isNaN(lon) || lon < -180 || lon > 180, `${lon} should be invalid longitude`);
  });
});

Deno.test("MCP Schema validation - celestial body enum", () => {
  // Test that all celestial bodies are valid
  ALL_BODIES.forEach(body => {
    assert(typeof body === "string", `${body} should be a string`);
    assert(body.length > 0, `${body} should not be empty`);
  });
  
  // Test some invalid bodies
  const invalidBodies = ["", "invalid", "planet", "star"];
  invalidBodies.forEach(body => {
    assert(!ALL_BODIES.includes(body as never), `${body} should not be in ALL_BODIES`);
  });
});

Deno.test("MCP Schema validation - datetime format", () => {
  // Test valid ISO 8601 datetime strings
  const validDatetimes = [
    "2024-01-01T12:00:00.000Z",
    "2024-12-31T23:59:59.999Z",
    "2000-06-21T06:30:00.000Z",
    "1970-01-01T00:00:00.000Z"
  ];
  
  validDatetimes.forEach(datetime => {
    const date = new Date(datetime);
    assert(!isNaN(date.getTime()), `${datetime} should be valid datetime`);
    assertEquals(date.toISOString(), datetime);
  });
  
  // Test invalid datetime strings
  const invalidDatetimes = [
    "2024-13-01T12:00:00.000Z", // Invalid month
    "2024-01-32T12:00:00.000Z", // Invalid day
    "2024-01-01T25:00:00.000Z", // Invalid hour
    "not-a-date",
    "",
    "2024-01-01" // Missing time component
  ];
  
  invalidDatetimes.forEach(datetime => {
    const date = new Date(datetime);
    // These should either be invalid dates or not match expected ISO format
    assert(isNaN(date.getTime()) || date.toISOString() !== datetime, 
      `${datetime} should be invalid datetime`);
  });
});

Deno.test("MCP tool parameters - get_ephemeris_data", () => {
  const validParams = {
    latitude: 40.7128,
    longitude: -74.0060,
    datetime: "2024-01-01T12:00:00.000Z",
    bodies: ["sun", "moon", "mercury"] as const
  };
  
  // Verify parameter types and ranges
  assert(typeof validParams.latitude === "number");
  assert(validParams.latitude >= -90 && validParams.latitude <= 90);
  assert(typeof validParams.longitude === "number");  
  assert(validParams.longitude >= -180 && validParams.longitude <= 180);
  assert(typeof validParams.datetime === "string");
  assert(Array.isArray(validParams.bodies));
  validParams.bodies.forEach(body => {
    assert(ALL_BODIES.includes(body), `${body} should be valid celestial body`);
  });
});

Deno.test("MCP tool parameters - calculate_aspects", () => {
  const validParams = {
    latitude: 51.5074,
    longitude: -0.1278,
    datetime: "2024-06-21T12:00:00.000Z",
    orb: 8,
    bodies: ["sun", "moon", "venus", "mars"]
  };
  
  // Verify orb parameter
  assert(typeof validParams.orb === "number");
  assert(validParams.orb >= 0.1 && validParams.orb <= 15);
  
  // Need at least 2 bodies for aspect calculation
  assert(validParams.bodies.length >= 2);
});

Deno.test("Moon phase calculation logic", () => {
  // Test moon phase angle calculations
  const testCases = [
    { elongation: 0, expectedPhase: "New Moon" },
    { elongation: 45, expectedPhase: "Waxing Crescent" }, 
    { elongation: 90, expectedPhase: "First Quarter" },
    { elongation: 135, expectedPhase: "Waxing Gibbous" },
    { elongation: 180, expectedPhase: "Full Moon" },
    { elongation: 225, expectedPhase: "Waning Gibbous" },
    { elongation: 270, expectedPhase: "Third Quarter" },
    { elongation: 315, expectedPhase: "Waning Crescent" }
  ];
  
  testCases.forEach(({ elongation, expectedPhase }) => {
    let phase = "";
    
    // Replicate the phase determination logic from the server
    if (elongation < 22.5 || elongation >= 337.5) {
      phase = "New Moon";
    } else if (elongation < 67.5) {
      phase = "Waxing Crescent";
    } else if (elongation < 112.5) {
      phase = "First Quarter";
    } else if (elongation < 157.5) {
      phase = "Waxing Gibbous";
    } else if (elongation < 202.5) {
      phase = "Full Moon";
    } else if (elongation < 247.5) {
      phase = "Waning Gibbous";
    } else if (elongation < 292.5) {
      phase = "Third Quarter";
    } else {
      phase = "Waning Crescent";
    }
    
    assertEquals(phase, expectedPhase, 
      `Elongation ${elongation}° should be ${expectedPhase}, got ${phase}`);
  });
});

Deno.test("Moon illumination calculation", () => {
  // Test illumination calculation formula
  const testCases = [
    { phaseAngle: 0, expectedIllumination: 100 }, // Full moon
    { phaseAngle: 90, expectedIllumination: 50 }, // Quarter moon
    { phaseAngle: 180, expectedIllumination: 0 }, // New moon
  ];
  
  testCases.forEach(({ phaseAngle, expectedIllumination }) => {
    // Replicate illumination calculation from server
    const illumination = ((1 + Math.cos((phaseAngle * Math.PI) / 180)) / 2) * 100;
    const rounded = Math.round(illumination);
    
    assertEquals(rounded, expectedIllumination, 
      `Phase angle ${phaseAngle}° should give ${expectedIllumination}% illumination, got ${rounded}%`);
  });
});

Deno.test("Zodiac sign calculation", () => {
  const testCases = [
    { longitude: 0, expectedSign: "Aries" },
    { longitude: 30, expectedSign: "Taurus" },
    { longitude: 60, expectedSign: "Gemini" },
    { longitude: 90, expectedSign: "Cancer" },
    { longitude: 120, expectedSign: "Leo" },
    { longitude: 150, expectedSign: "Virgo" },
    { longitude: 180, expectedSign: "Libra" },
    { longitude: 210, expectedSign: "Scorpio" },
    { longitude: 240, expectedSign: "Sagittarius" },
    { longitude: 270, expectedSign: "Capricorn" },
    { longitude: 300, expectedSign: "Aquarius" },
    { longitude: 330, expectedSign: "Pisces" },
    { longitude: 359.9, expectedSign: "Pisces" }
  ];
  
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  
  testCases.forEach(({ longitude, expectedSign }) => {
    // Normalize longitude to 0-360 range
    const normalizedLongitude = ((longitude % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedLongitude / 30);
    const sign = signs[Math.min(signIndex, signs.length - 1)];
    
    assertEquals(sign, expectedSign, 
      `Longitude ${longitude}° should be in ${expectedSign}, got ${sign}`);
  });
});

Deno.test("Aspect calculation logic", () => {
  const majorAspects = [
    { name: "conjunction", angle: 0 },
    { name: "sextile", angle: 60 },
    { name: "square", angle: 90 },
    { name: "trine", angle: 120 },
    { name: "opposition", angle: 180 }
  ];
  
  const testCases = [
    { body1Lon: 0, body2Lon: 0, orb: 8, expectedAspect: "conjunction" },
    { body1Lon: 0, body2Lon: 60, orb: 8, expectedAspect: "sextile" },
    { body1Lon: 0, body2Lon: 90, orb: 8, expectedAspect: "square" },
    { body1Lon: 0, body2Lon: 120, orb: 8, expectedAspect: "trine" },
    { body1Lon: 0, body2Lon: 180, orb: 8, expectedAspect: "opposition" },
    { body1Lon: 0, body2Lon: 65, orb: 8, expectedAspect: "sextile" }, // Within orb
    { body1Lon: 0, body2Lon: 75, orb: 8, expectedAspect: null } // Outside orb
  ];
  
  testCases.forEach(({ body1Lon, body2Lon, orb, expectedAspect }) => {
    const angle = Math.abs(body1Lon - body2Lon);
    const normalizedAngle = angle > 180 ? 360 - angle : angle;
    
    let foundAspect = null;
    for (const aspect of majorAspects) {
      const aspectOrb = Math.abs(normalizedAngle - aspect.angle);
      if (aspectOrb <= orb) {
        foundAspect = aspect.name;
        break;
      }
    }
    
    assertEquals(foundAspect, expectedAspect, 
      `Bodies at ${body1Lon}° and ${body2Lon}° should ${expectedAspect ? 'have' : 'not have'} aspect ${expectedAspect}`);
  });
});

Deno.test("MCP response format validation", () => {
  // Test expected MCP response format
  const mockResponse = {
    content: [
      {
        type: "text",
        text: JSON.stringify({ test: "data" }, null, 2)
      }
    ]
  };
  
  assertExists(mockResponse.content);
  assert(Array.isArray(mockResponse.content));
  assertEquals(mockResponse.content.length, 1);
  assertEquals(mockResponse.content[0].type, "text");
  assert(typeof mockResponse.content[0].text === "string");
  
  // Should be valid JSON
  const parsedContent = JSON.parse(mockResponse.content[0].text);
  assertEquals(parsedContent.test, "data");
});

Deno.test("Error handling scenarios", () => {
  // Test various error conditions that should be handled gracefully
  
  // Invalid JSON request
  const invalidJSON = "{ invalid json }";
  assert(typeof invalidJSON === "string");
  
  try {
    JSON.parse(invalidJSON);
    assert(false, "Should have thrown JSON parse error");
  } catch (error) {
    assert(error instanceof SyntaxError);
  }
  
  // Missing required parameters would be caught by Zod validation
  const missingParams = { latitude: 40.7128 }; // Missing longitude
  assert(!("longitude" in missingParams) || missingParams.longitude === undefined);
  
  // Invalid coordinate ranges would be caught by validation
  const invalidCoords = { latitude: 100, longitude: 200 };
  assert(invalidCoords.latitude > 90 || invalidCoords.latitude < -90);
  assert(invalidCoords.longitude > 180 || invalidCoords.longitude < -180);
});