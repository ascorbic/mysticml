import Ephemeris from "https://esm.sh/gh/0xStarcat/Moshier-Ephemeris-JS/src/Ephemeris.js";

console.log(Ephemeris);
// The edge function handler

const ALL_BODIES = [
	"mercury",
	"venus",
	"mars",
	"jupiter",
	"saturn",
	"uranus",
	"neptune",
	"pluto",
	"sun",
	"moon",
	"chiron",
];

export default async function handler(req: Request) {
	// Parse query parameters
	const url = new URL(req.url);
	let celestialBodies = url.searchParams.get("bodies")?.split(",");
	const datetimeString = url.searchParams.get("datetime");
	const latitude = parseFloat(url.searchParams.get("latitude")!);
	const longitude = parseFloat(url.searchParams.get("longitude")!);

	if (isNaN(latitude) || isNaN(longitude)) {
		return new Response("Invalid parameters", { status: 400 });
	}

	const datetime = datetimeString ? new Date(datetimeString) : new Date();
	const year = datetime.getUTCFullYear();
	const month = datetime.getUTCMonth();
	const day = datetime.getUTCDate();
	const hours = datetime.getUTCHours();
	const minutes = datetime.getUTCMinutes();

	if (!celestialBodies || celestialBodies.length === 0) {
		celestialBodies = ALL_BODIES;
	}

	const ephemeris = new Ephemeris({
		year,
		month,
		day,
		hours,
		minutes,
		latitude,
		longitude,
		calculateShadows: false,
	});

	const results: Record<string, unknown> = {};
	for (const body of celestialBodies) {
		if (ephemeris[body]) {
			results[body] = ephemeris[body].position;
		} else {
			results[body] = "Celestial body not found";
		}
	}

	return Response.json(results);
}

export const config = {
	path: "/ephemeris",
};
