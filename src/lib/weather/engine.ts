// 100% Free Open Weather & Geo-Location Engine for LearnNaija OS
// Powered by Open-Meteo (Zero API key needed, 100% free for educational platforms)

export interface StateGeoInfo {
  state: string;
  capital: string;
  latitude: number;
  longitude: number;
  zone: "South East" | "South South" | "South West" | "North Central" | "North West" | "North East";
  nativeGreeting: {
    morning: string;
    afternoon: string;
    evening: string;
  };
}

export const NIGERIAN_STATE_COORDINATES: Record<string, StateGeoInfo> = {
  "Abia": { state: "Abia", capital: "Umuahia", latitude: 5.526, longitude: 7.489, zone: "South East", nativeGreeting: { morning: "Ututu oma! (Good morning)", afternoon: "Ehihie oma! (Good afternoon)", evening: "Mgbede oma! (Good evening)" } },
  "Adamawa": { state: "Adamawa", capital: "Yola", latitude: 9.209, longitude: 12.481, zone: "North East", nativeGreeting: { morning: "Ina kwana! (Good morning)", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Akwa Ibom": { state: "Akwa Ibom", capital: "Uyo", latitude: 5.038, longitude: 7.912, zone: "South South", nativeGreeting: { morning: "Emesiere! (Good morning)", afternoon: "Ekom do!", evening: "Emesiere o!" } },
  "Anambra": { state: "Anambra", capital: "Awka", latitude: 6.220, longitude: 7.072, zone: "South East", nativeGreeting: { morning: "Ututu oma, nnoo!", afternoon: "Ehihie oma, ndewo!", evening: "Mgbede oma, daalu!" } },
  "Bauchi": { state: "Bauchi", capital: "Bauchi", latitude: 10.315, longitude: 9.844, zone: "North East", nativeGreeting: { morning: "Ina kwana!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Bayelsa": { state: "Bayelsa", capital: "Yenagoa", latitude: 4.926, longitude: 6.267, zone: "South South", nativeGreeting: { morning: "Erite-o! (Good morning)", afternoon: "How far now!", evening: "Good evening!" } },
  "Benue": { state: "Benue", capital: "Makurdi", latitude: 7.730, longitude: 8.536, zone: "North Central", nativeGreeting: { morning: "Nder nguhar! (Good morning)", afternoon: "Msugh!", evening: "Msugh u ter!" } },
  "Borno": { state: "Borno", capital: "Maiduguri", latitude: 11.833, longitude: 13.151, zone: "North East", nativeGreeting: { morning: "Ina kwana!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Cross River": { state: "Cross River", capital: "Calabar", latitude: 4.975, longitude: 8.341, zone: "South South", nativeGreeting: { morning: "Emesiere!", afternoon: "Ekom do!", evening: "Mfoniso!" } },
  "Delta": { state: "Delta", capital: "Asaba", latitude: 6.198, longitude: 6.732, zone: "South South", nativeGreeting: { morning: "Ututu oma! / Kpoko!", afternoon: "How body!", evening: "Mgbede oma!" } },
  "Ebonyi": { state: "Ebonyi", capital: "Abakaliki", latitude: 6.324, longitude: 8.113, zone: "South East", nativeGreeting: { morning: "Ututu oma!", afternoon: "Ehihie oma!", evening: "Mgbede oma!" } },
  "Edo": { state: "Edo", capital: "Benin City", latitude: 6.335, longitude: 5.603, zone: "South South", nativeGreeting: { morning: "Ob'okhian! (Welcome)", afternoon: "Koyo!", evening: "Ob'ota!" } },
  "Ekiti": { state: "Ekiti", capital: "Ado-Ekiti", latitude: 7.621, longitude: 5.221, zone: "South West", nativeGreeting: { morning: "E kaaro o! (Good morning)", afternoon: "E kaasan!", evening: "E kaale!" } },
  "Enugu": { state: "Enugu", capital: "Enugu", latitude: 6.458, longitude: 7.546, zone: "South East", nativeGreeting: { morning: "Ututu oma, Coal City Scholar!", afternoon: "Ehihie oma!", evening: "Mgbede oma!" } },
  "FCT Abuja": { state: "FCT Abuja", capital: "Abuja", latitude: 9.076, longitude: 7.398, zone: "North Central", nativeGreeting: { morning: "Good morning, Federal Capital Scholar!", afternoon: "Good afternoon!", evening: "Good evening!" } },
  "Gombe": { state: "Gombe", capital: "Gombe", latitude: 10.289, longitude: 11.167, zone: "North East", nativeGreeting: { morning: "Ina kwana!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Imo": { state: "Imo", capital: "Owerri", latitude: 5.485, longitude: 7.035, zone: "South East", nativeGreeting: { morning: "Ututu oma, Heartland Champion!", afternoon: "Ehihie oma!", evening: "Mgbede oma!" } },
  "Jigawa": { state: "Jigawa", capital: "Dutse", latitude: 11.756, longitude: 9.338, zone: "North West", nativeGreeting: { morning: "Ina kwana!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Kaduna": { state: "Kaduna", capital: "Kaduna", latitude: 10.510, longitude: 7.416, zone: "North West", nativeGreeting: { morning: "Ina kwana, Centre of Learning!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Kano": { state: "Kano", capital: "Kano", latitude: 12.002, longitude: 8.592, zone: "North West", nativeGreeting: { morning: "Ina kwana, Kano Scholar!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Katsina": { state: "Katsina", capital: "Katsina", latitude: 12.988, longitude: 7.600, zone: "North West", nativeGreeting: { morning: "Ina kwana!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Kebbi": { state: "Kebbi", capital: "Birnin Kebbi", latitude: 12.453, longitude: 4.197, zone: "North West", nativeGreeting: { morning: "Ina kwana!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Kogi": { state: "Kogi", capital: "Lokoja", latitude: 7.802, longitude: 6.743, zone: "North Central", nativeGreeting: { morning: "Good morning / E kaaro!", afternoon: "Good afternoon!", evening: "Good evening!" } },
  "Kwara": { state: "Kwara", capital: "Ilorin", latitude: 8.496, longitude: 4.542, zone: "North Central", nativeGreeting: { morning: "E kaaro o, State of Harmony!", afternoon: "E kaasan!", evening: "E kaale!" } },
  "Lagos": { state: "Lagos", capital: "Ikeja", latitude: 6.524, longitude: 3.379, zone: "South West", nativeGreeting: { morning: "E kaaro, Centre of Excellence!", afternoon: "E kaasan!", evening: "E kaale, Lagos Scholar!" } },
  "Nasarawa": { state: "Nasarawa", capital: "Lafia", latitude: 8.493, longitude: 8.515, zone: "North Central", nativeGreeting: { morning: "Ina kwana!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Niger": { state: "Niger", capital: "Minna", latitude: 9.613, longitude: 6.556, zone: "North Central", nativeGreeting: { morning: "Ina kwana!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Ogun": { state: "Ogun", capital: "Abeokuta", latitude: 7.155, longitude: 3.345, zone: "South West", nativeGreeting: { morning: "E kaaro, Gateway State Scholar!", afternoon: "E kaasan!", evening: "E kaale!" } },
  "Ondo": { state: "Ondo", capital: "Akure", latitude: 7.257, longitude: 5.205, zone: "South West", nativeGreeting: { morning: "E kaaro o, Sunshine State!", afternoon: "E kaasan!", evening: "E kaale!" } },
  "Osun": { state: "Osun", capital: "Osogbo", latitude: 7.782, longitude: 4.541, zone: "South West", nativeGreeting: { morning: "E kaaro, State of the Living Spring!", afternoon: "E kaasan!", evening: "E kaale!" } },
  "Oyo": { state: "Oyo", capital: "Ibadan", latitude: 7.377, longitude: 3.947, zone: "South West", nativeGreeting: { morning: "E kaaro, Pace Setter Scholar!", afternoon: "E kaasan!", evening: "E kaale!" } },
  "Plateau": { state: "Plateau", capital: "Jos", latitude: 9.896, longitude: 8.858, zone: "North Central", nativeGreeting: { morning: "Barka da safiya, Home of Peace!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Rivers": { state: "Rivers", capital: "Port Harcourt", latitude: 4.815, longitude: 7.049, zone: "South South", nativeGreeting: { morning: "Good morning, Treasure Base Scholar!", afternoon: "How far! Good afternoon!", evening: "Good evening!" } },
  "Sokoto": { state: "Sokoto", capital: "Sokoto", latitude: 13.060, longitude: 5.233, zone: "North West", nativeGreeting: { morning: "Ina kwana, Seat of the Caliphate!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Taraba": { state: "Taraba", capital: "Jalingo", latitude: 8.893, longitude: 11.359, zone: "North East", nativeGreeting: { morning: "Ina kwana!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Yobe": { state: "Yobe", capital: "Damaturu", latitude: 11.747, longitude: 11.960, zone: "North East", nativeGreeting: { morning: "Ina kwana!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } },
  "Zamfara": { state: "Zamfara", capital: "Gusau", latitude: 12.162, longitude: 6.661, zone: "North West", nativeGreeting: { morning: "Ina kwana!", afternoon: "Barka da rana!", evening: "Barka da yamma!" } }
};

export interface WeatherReport {
  state: string;
  capital: string;
  temperatureC: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeedKmH: number;
  isHarmattan: boolean;
  studyTip: string;
  greetingText: string;
  nativeGreeting: string;
}

// Convert WMO weather interpretation codes to Nigerian relatable descriptions
function interpretWmoCode(code: number): { condition: string; icon: string; isHarmattan: boolean } {
  if (code === 0) return { condition: "Clear Skies & Sunny", icon: "☀️", isHarmattan: false };
  if (code >= 1 && code <= 3) return { condition: "Partly Cloudy & Pleasant", icon: "⛅", isHarmattan: false };
  if (code === 45 || code === 48) return { condition: "Harmattan Haze & Dry Breeze", icon: "🌫️", isHarmattan: true };
  if (code >= 51 && code <= 55) return { condition: "Light Tropical Drizzle", icon: "🌦️", isHarmattan: false };
  if (code >= 61 && code <= 65) return { condition: "Heavy Rain Showers", icon: "🌧️", isHarmattan: false };
  if (code >= 80 && code <= 82) return { condition: "Passing Rain Showers", icon: "🌦️", isHarmattan: false };
  if (code >= 95) return { condition: "Thunderstorm & Lightning", icon: "⛈️", isHarmattan: false };
  return { condition: "Warm Tropical Breeze", icon: "🌤️", isHarmattan: false };
}

interface CachedWeather {
  data: WeatherReport;
  expiresAt: number;
}
const weatherCache = new Map<string, CachedWeather>();

/**
 * Fetches real-time Nigerian weather using Open-Meteo (100% Free, No API Key Required)
 * Enhanced with 15-minute in-memory edge caching and 2.5s timeout for instant responses.
 */
export async function getLiveNigerianWeather(stateName: string = "Anambra"): Promise<WeatherReport> {
  const geo = NIGERIAN_STATE_COORDINATES[stateName] || NIGERIAN_STATE_COORDINATES["Anambra"];
  const now = Date.now();

  // Instant in-memory cache check (0ms response time)
  const cached = weatherCache.get(geo.state);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }
  
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Africa%2FLagos`;
    
    // 2.5s timeout to prevent satellite network lag
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error("Weather service unreachable");
    const data = await res.json();
    const current = data.current;

    const { condition, icon, isHarmattan } = interpretWmoCode(current.weather_code || 0);
    const temp = Math.round(current.temperature_2m || 29);
    const humidity = Math.round(current.relative_humidity_2m || 65);
    const wind = Math.round(current.wind_speed_10m || 10);

    // Dynamic hour and greetings strictly calibrated to West Africa Time (WAT)
    const lagosHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" })).getHours();
    let timeOfDay: "morning" | "afternoon" | "evening" = "afternoon";
    let greetingText = "Good afternoon, Scholar!";
    if (lagosHour >= 5 && lagosHour < 12) {
      timeOfDay = "morning";
      greetingText = "Good morning, Scholar!";
    } else if (lagosHour >= 17 || lagosHour < 5) {
      timeOfDay = "evening";
      greetingText = "Good evening, Scholar!";
    }

    const native = geo.nativeGreeting[timeOfDay];

    // Study advice tailored to weather
    let studyTip = "Great weather for sharp academic concentration!";
    if (temp >= 33) {
      studyTip = "Stay hydrated in the afternoon heat while tackling CBT equations!";
    } else if (isHarmattan) {
      studyTip = "Cool harmattan breeze outside — perfect atmosphere for deep reading and revision!";
    } else if (condition.includes("Rain")) {
      studyTip = "Cozy rainy day — sit back and master a new topic on AI Tutor!";
    }

    const report: WeatherReport = {
      state: geo.state,
      capital: geo.capital,
      temperatureC: temp,
      condition,
      icon,
      humidity,
      windSpeedKmH: wind,
      isHarmattan,
      studyTip,
      greetingText,
      nativeGreeting: native
    };

    // Cache valid report for 15 minutes
    weatherCache.set(geo.state, { data: report, expiresAt: now + 15 * 60 * 1000 });
    return report;
  } catch {
    // Ultra-resilient local fallback
    const lagosHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" })).getHours();
    const timeOfDay = lagosHour >= 5 && lagosHour < 12 ? "morning" : lagosHour >= 17 || lagosHour < 5 ? "evening" : "afternoon";
    const fallbackReport: WeatherReport = {
      state: geo.state,
      capital: geo.capital,
      temperatureC: 29,
      condition: "Warm Tropical Breeze",
      icon: "🌤️",
      humidity: 70,
      windSpeedKmH: 12,
      isHarmattan: false,
      studyTip: "Stay focused on your exam goals today!",
      greetingText: timeOfDay === "morning" ? "Good morning, Scholar!" : timeOfDay === "afternoon" ? "Good afternoon, Scholar!" : "Good evening, Scholar!",
      nativeGreeting: geo.nativeGreeting[timeOfDay]
    };
    weatherCache.set(geo.state, { data: fallbackReport, expiresAt: now + 5 * 60 * 1000 });
    return fallbackReport;
  }
}

/**
 * Given GPS coordinates (latitude, longitude), find the closest Nigerian state capital
 */
export function findClosestNigerianState(lat: number, lon: number): string {
  let closestState = "Anambra";
  let minDistance = Infinity;

  for (const [state, info] of Object.entries(NIGERIAN_STATE_COORDINATES)) {
    const dLat = info.latitude - lat;
    const dLon = info.longitude - lon;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < minDistance) {
      minDistance = distSq;
      closestState = state;
    }
  }

  return closestState;
}
