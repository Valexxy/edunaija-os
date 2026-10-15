import { NextResponse } from "next/server";
import { getLiveNigerianWeather, findClosestNigerianState } from "@/lib/weather/engine";
import { getCurrentUser, getLearnerProfile } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let state = searchParams.get("state");
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");

  // If GPS coordinates provided, map directly to exact Nigerian state
  if (!state && latStr && lonStr) {
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    if (!isNaN(lat) && !isNaN(lon)) {
      state = findClosestNigerianState(lat, lon);
    }
  }

  if (!state) {
    const user = await getCurrentUser();
    const profile = user ? await getLearnerProfile(user.id) : null;
    state = profile?.state_name || "Anambra";
  }

  const weather = await getLiveNigerianWeather(state);
  return NextResponse.json({
    success: true,
    state: weather.state,
    weather,
    timestamp: new Date().toISOString()
  });
}

