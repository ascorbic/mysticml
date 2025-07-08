import { assertEquals, assertExists, assertThrows } from "jsr:@std/assert";
import {
  calculateEphemeris,
  validateCoordinates,
  parseDateTime,
  getFilteredBodies,
  ALL_BODIES,
  type CelestialBody,
  type EphemerisParams,
} from "../netlify/edge-functions/lib/ephemeris-core.ts";

Deno.test("ALL_BODIES contains expected celestial bodies", () => {
  const expectedBodies: CelestialBody[] = [
    "sun",
    "moon",
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
    "chiron",
    "sirius",
  ];

  assertEquals(ALL_BODIES.length, 13);
  expectedBodies.forEach((body) => {
    assertEquals(
      ALL_BODIES.includes(body),
      true,
      `${body} should be in ALL_BODIES`
    );
  });
});

Deno.test("validateCoordinates - valid coordinates", () => {
  const validCases = [
    { lat: 0, lon: 0 },
    { lat: 40.7128, lon: -74.006 }, // New York
    { lat: -33.8688, lon: 151.2093 }, // Sydney
    { lat: 90, lon: 180 },
    { lat: -90, lon: -180 },
  ];

  validCases.forEach(({ lat, lon }) => {
    const result = validateCoordinates(lat, lon);
    assertEquals(
      result.isValid,
      true,
      `Coordinates ${lat}, ${lon} should be valid`
    );
    assertEquals(result.error, undefined);
  });
});

Deno.test("validateCoordinates - invalid coordinates", () => {
  const invalidCases = [
    { lat: 91, lon: 0, expectedError: "Latitude must be between -90 and 90" },
    { lat: -91, lon: 0, expectedError: "Latitude must be between -90 and 90" },
    {
      lat: 0,
      lon: 181,
      expectedError: "Longitude must be between -180 and 180",
    },
    {
      lat: 0,
      lon: -181,
      expectedError: "Longitude must be between -180 and 180",
    },
    { lat: NaN, lon: 0, expectedError: "Invalid latitude or longitude" },
    { lat: 0, lon: NaN, expectedError: "Invalid latitude or longitude" },
  ];

  invalidCases.forEach(({ lat, lon, expectedError }) => {
    const result = validateCoordinates(lat, lon);
    assertEquals(
      result.isValid,
      false,
      `Coordinates ${lat}, ${lon} should be invalid`
    );
    assertEquals(result.error, expectedError);
  });
});

Deno.test("parseDateTime - with valid datetime string", () => {
  const testDateString = "2024-01-01T12:00:00.000Z";
  const result = parseDateTime(testDateString);

  assertExists(result);
  assertEquals(result instanceof Date, true);
  assertEquals(result.toISOString(), testDateString);
});

Deno.test("parseDateTime - without datetime string", () => {
  const before = Date.now();
  const result = parseDateTime();
  const after = Date.now();

  assertExists(result);
  assertEquals(result instanceof Date, true);
  // Should be current time (within a reasonable range)
  assertEquals(result.getTime() >= before && result.getTime() <= after, true);
});

Deno.test("parseDateTime - with undefined", () => {
  const before = Date.now();
  const result = parseDateTime(undefined);
  const after = Date.now();

  assertExists(result);
  assertEquals(result instanceof Date, true);
  assertEquals(result.getTime() >= before && result.getTime() <= after, true);
});

Deno.test("getFilteredBodies - planets", () => {
  const planets = getFilteredBodies("planets");
  const expectedPlanets: CelestialBody[] = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
  ];

  assertEquals(planets.length, 9);
  expectedPlanets.forEach((planet) => {
    assertEquals(
      planets.includes(planet),
      true,
      `${planet} should be in planets`
    );
  });

  // Should not include sun, moon, stars, or asteroids
  assertEquals(planets.includes("sun"), false);
  assertEquals(planets.includes("moon"), false);
  assertEquals(planets.includes("sirius"), false);
  assertEquals(planets.includes("chiron"), false);
});

Deno.test("getFilteredBodies - luminaries", () => {
  const luminaries = getFilteredBodies("luminaries");
  const expectedLuminaries: CelestialBody[] = ["sun", "moon"];

  assertEquals(luminaries.length, 2);
  assertEquals(luminaries, expectedLuminaries);
});

Deno.test("getFilteredBodies - stars", () => {
  const stars = getFilteredBodies("stars");
  const expectedStars: CelestialBody[] = ["sirius"];

  assertEquals(stars.length, 1);
  assertEquals(stars, expectedStars);
});

Deno.test("getFilteredBodies - asteroids", () => {
  const asteroids = getFilteredBodies("asteroids");
  const expectedAsteroids: CelestialBody[] = ["chiron"];

  assertEquals(asteroids.length, 1);
  assertEquals(asteroids, expectedAsteroids);
});

Deno.test("getFilteredBodies - all", () => {
  const all = getFilteredBodies("all");
  assertEquals(all.length, ALL_BODIES.length);
  assertEquals(all, [...ALL_BODIES]);
});

Deno.test("calculateEphemeris - basic functionality", () => {
  const params: EphemerisParams = {
    latitude: 40.7128,
    longitude: -74.006,
    datetime: "2024-01-01T12:00:00.000Z",
    bodies: ["sun", "moon"],
  };

  const result = calculateEphemeris(params);

  assertExists(result);
  assertEquals(typeof result, "object");

  // Should have sun and moon data
  assertExists(result.sun);
  assertExists(result.moon);
});

Deno.test("calculateEphemeris - with invalid coordinates", () => {
  const params: EphemerisParams = {
    latitude: 100, // Invalid
    longitude: -74.006,
    datetime: "2024-01-01T12:00:00.000Z",
    bodies: ["sun"],
  };

  assertThrows(
    () => calculateEphemeris(params),
    Error,
    "Latitude must be between -90 and 90"
  );
});

Deno.test("calculateEphemeris - with all bodies", () => {
  const params: EphemerisParams = {
    latitude: 0,
    longitude: 0,
    datetime: "2024-01-01T12:00:00.000Z",
    // No bodies specified - should default to all
  };

  const result = calculateEphemeris(params);

  assertExists(result);

  // Should have data for all celestial bodies except Earth (no Earth position from Earth's perspective)
  ALL_BODIES.forEach((body) => {
    if (body === "earth") {
      assertEquals(result[body], undefined, "Earth position should not be available from Earth's perspective");
    } else {
      assertExists(result[body], `Should have data for ${body}`);
    }
  });
});

Deno.test("calculateEphemeris - with specific bodies", () => {
  const testBodies: CelestialBody[] = ["mercury", "venus", "mars"];
  const params: EphemerisParams = {
    latitude: 51.5074,
    longitude: -0.1278,
    datetime: "2024-06-21T12:00:00.000Z",
    bodies: testBodies,
  };

  const result = calculateEphemeris(params);

  assertExists(result);

  // Should have data for specified bodies
  testBodies.forEach((body) => {
    assertExists(result[body], `Should have data for ${body}`);
  });

  // Should not have data for unspecified bodies
  const unspecifiedBodies = ALL_BODIES.filter(
    (body) => !testBodies.includes(body)
  );
  unspecifiedBodies.forEach((body) => {
    assertEquals(result[body], undefined, `Should not have data for ${body}`);
  });
});

Deno.test("calculateEphemeris - position data structure", () => {
  const params: EphemerisParams = {
    latitude: 40.7128,
    longitude: -74.006,
    datetime: "2024-01-01T12:00:00.000Z",
    bodies: ["sun"],
  };

  const result = calculateEphemeris(params);
  const sunData = result.sun;

  assertExists(sunData);
  assertEquals(typeof sunData, "object");

  // Should have apparent longitude property
  assertEquals(
    typeof sunData?.apparentLongitude,
    "number",
    "Should have apparentLongitude data"
  );
});

Deno.test(
  "calculateEphemeris - different times produce different results",
  () => {
    const baseParams: EphemerisParams = {
      latitude: 0,
      longitude: 0,
      bodies: ["sun"],
    };

    const result1 = calculateEphemeris({
      ...baseParams,
      datetime: "2024-01-01T12:00:00.000Z",
    });

    const result2 = calculateEphemeris({
      ...baseParams,
      datetime: "2024-07-01T12:00:00.000Z",
    });

    assertExists(result1.sun);
    assertExists(result2.sun);

    // Sun's position should be different at different times of year
    const sun1 = result1.sun;
    const sun2 = result2.sun;

    const lon1 = sun1.apparentLongitude;
    const lon2 = sun2.apparentLongitude;

    // Positions should be significantly different (more than 10 degrees)
    const difference = Math.abs(lon1 - lon2);
    assertEquals(
      difference > 10,
      true,
      `Sun positions should differ significantly: ${lon1} vs ${lon2}`
    );
  }
);
