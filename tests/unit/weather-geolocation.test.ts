import { describe, it, expect } from "vitest";
import {
  getLiveNigerianWeather,
  findClosestNigerianState,
  NIGERIAN_STATE_COORDINATES
} from "@/lib/weather/engine";
import { GET as weatherGetRoute } from "@/app/api/weather/route";
import { POST as profilePostRoute } from "@/app/api/learner/profile/route";

describe("Real-Time Weather, Geolocation & Cultural Greetings Suite", () => {
  it("resolves GPS coordinates in Anambra directly to Anambra state", () => {
    // Awka, Anambra State coordinates
    const state = findClosestNigerianState(6.220, 7.072);
    expect(state).toBe("Anambra");

    // Coordinates near Nnewi / Ekwulobia in Anambra State
    const nnewiState = findClosestNigerianState(6.015, 6.915);
    expect(nnewiState).toBe("Anambra");
  });

  it("resolves major Nigerian state coordinates across geopolitical zones accurately", () => {
    expect(findClosestNigerianState(6.524, 3.379)).toBe("Lagos"); // South West
    expect(findClosestNigerianState(12.002, 8.592)).toBe("Kano"); // North West
    expect(findClosestNigerianState(9.076, 7.398)).toBe("FCT Abuja"); // North Central
    expect(findClosestNigerianState(4.815, 7.049)).toBe("Rivers"); // South South
  });

  it("strictly provides authentic Igbo cultural greetings for Anambra state", async () => {
    const weather = await getLiveNigerianWeather("Anambra");
    expect(weather.state).toBe("Anambra");
    expect(weather.capital).toBe("Awka");
    expect(typeof weather.temperatureC).toBe("number");
    expect(typeof weather.humidity).toBe("number");

    // Must strictly be Igbo greetings, never Hausa ("Ina kwana") or Yoruba ("E kaaro")
    const anambraGreetings = NIGERIAN_STATE_COORDINATES["Anambra"].nativeGreeting;
    expect(anambraGreetings.morning).toContain("Ututu oma");
    expect(anambraGreetings.afternoon).toContain("Ehihie oma");
    expect(anambraGreetings.evening).toContain("Mgbede oma");

    expect(weather.nativeGreeting).not.toContain("Ina kwana");
    expect(weather.nativeGreeting).not.toContain("E kaaro");
    expect(
      weather.nativeGreeting.includes("Ututu oma") ||
      weather.nativeGreeting.includes("Ehihie oma") ||
      weather.nativeGreeting.includes("Mgbede oma")
    ).toBe(true);
  }, 15000);

  it("handles GET /api/weather with lat/lon parameters and resolves state automatically", async () => {
    const req = new Request("http://localhost:3000/api/weather?lat=6.220&lon=7.072");
    const res = await weatherGetRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.state).toBe("Anambra");
    expect(data.weather.capital).toBe("Awka");
    expect(
      data.weather.nativeGreeting.includes("Ututu oma") ||
      data.weather.nativeGreeting.includes("Ehihie oma") ||
      data.weather.nativeGreeting.includes("Mgbede oma")
    ).toBe(true);
  }, 15000);

  it("accepts partial profile updates with state_name without rejecting missing fields", async () => {
    const req = new Request("http://localhost:3000/api/learner/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state_name: "Anambra" })
    });
    const res = await profilePostRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.profile.state_name).toBe("Anambra");
  });
});
