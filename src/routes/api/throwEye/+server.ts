import { supabase } from "$lib/supabaseClient";
import { json } from "@sveltejs/kit";
import { getDistance, getRhumbLineBearing } from "geolib";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
    const playerLatitude = Number(url.searchParams.get("latitude"));
    const playerLongitude = Number(url.searchParams.get("longitude"));
    const { data } = await supabase.from("stronghold").select("latitude, longitude").eq("id", 0);
    const strongholdCoords = data[0];

    const bearing = getRhumbLineBearing(
        { latitude: playerLatitude, longitude: playerLongitude },
        { latitude: strongholdCoords.latitude, longitude: strongholdCoords.longitude },
    );
    const distance = getDistance(
        { latitude: playerLatitude, longitude: playerLongitude },
        { latitude: strongholdCoords.latitude, longitude: strongholdCoords.longitude },
    );

    return json({ bearing: bearing, distance: distance });
};
