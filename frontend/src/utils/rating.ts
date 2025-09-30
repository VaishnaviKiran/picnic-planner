import {
  convertTemperature,
  convertWindSpeed,
  convertPrecipitation,
} from "../utils/temperature";

export type Suitability = "ideal" | "fair" | "poor";

export interface SimplePicnicPreferences {
  tempMin: number;
  tempMax: number;
  windMin: number;
  windMax: number;
  rainMin: number;
  rainMax: number;
  humidityMin: number;
  humidityMax: number;
}

type DayConditions = {
  tMax?: number;        // Temp in °C (from API)
  precipSum?: number;   // Rain in mm (from API)
  windMax?: number;     // Wind in km/h (from API)
  humidity?: number;    // % (already same)
};

function isInRange(value: number | undefined, min: number, max: number): boolean {
  if (value == null) return false;
  return value >= min && value <= max;
}

export function rateDay(
  conditions: DayConditions,
  prefs: SimplePicnicPreferences
): Suitability {
  // 🔥 Convert API base units → Imperial
  const tMaxF = conditions.tMax !== undefined
    ? convertTemperature(conditions.tMax, "C", "F")
    : undefined;

  const windMph = conditions.windMax !== undefined
    ? convertWindSpeed(conditions.windMax, "kmh", "mph")
    : undefined;

  const rainIn = conditions.precipSum !== undefined
    ? convertPrecipitation(conditions.precipSum, "mm", "in")
    : undefined;

  // Now compare in same units as prefs (°F, mph, in, %)
  const tempOk = isInRange(tMaxF, prefs.tempMin, prefs.tempMax);
  const windOk = isInRange(windMph, prefs.windMin, prefs.windMax);
  const rainOk = isInRange(rainIn, prefs.rainMin, prefs.rainMax);
  const humidityOk = isInRange(conditions.humidity, prefs.humidityMin, prefs.humidityMax);

  const acceptableCount = [tempOk, windOk, rainOk, humidityOk].filter(Boolean).length;

  if (acceptableCount === 4) return "ideal";
  if (acceptableCount === 3) return "fair";
  return "poor";
}
