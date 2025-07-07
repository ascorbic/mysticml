import { calculateEphemeris } from "./lib/ephemeris-core.ts";

export default async function handler(req: Request) {
	try {
		// Parse query parameters
		const url = new URL(req.url);
		const celestialBodies = url.searchParams.get("bodies")?.split(",");
		const datetimeString = url.searchParams.get("datetime");
		const latitude = parseFloat(url.searchParams.get("latitude")!);
		const longitude = parseFloat(url.searchParams.get("longitude")!);

		const result = calculateEphemeris({
			bodies: celestialBodies,
			datetime: datetimeString,
			latitude,
			longitude
		});

		return Response.json(result);
	} catch (error) {
		return new Response(error.message, { status: 400 });
	}
}

export const config = {
	path: "/ephemeris",
};
