import { calculateEphemeris, type CelestialBody } from "./lib/ephemeris-core.ts";

export default function handler(req: Request) {
	try {
		// Parse query parameters
		const url = new URL(req.url);
		const celestialBodies = url.searchParams.get("bodies")?.split(",") as CelestialBody[] | undefined;
		const datetimeString = url.searchParams.get("datetime");
		const latitude = parseFloat(url.searchParams.get("latitude")!);
		const longitude = parseFloat(url.searchParams.get("longitude")!);

		const result = calculateEphemeris({
			bodies: celestialBodies,
			datetime: datetimeString ?? undefined,
			latitude,
			longitude
		});

		return Response.json(result);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return new Response(message, { status: 400 });
	}
}

export const config = {
	path: "/ephemeris",
};
