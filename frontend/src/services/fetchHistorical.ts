import { cacheKey, saveCache, loadCache } from "../utils/cache";

export type HistoricalData = {
  averages: {
    tMax: number;
    tMin: number;
    precipSum: number;
    windMax: number;
    humidity: number;
  };
  records: {
    year: number;
    tMax: number | null;
    tMin: number | null;
    precipSum: number | null;
    windMax: number | null;
    humidity: number | null;
  }[];
};

export async function fetchHistoricalData(
  lat: number,
  lon: number,
  date: string // full date YYYY-MM-DD
): Promise<HistoricalData> {
  // ✅ Make cache key specific to lat/lon/date
  const key = `historical:${lat},${lon}:${date}`;
  const cached = loadCache<HistoricalData>(key);
  if (cached) {
    console.log("✅ Historical cache hit", key);
    return cached;
  }

  const target = new Date(date);
  const month = target.getMonth() + 1;
  const day = target.getDate();

  // Last 10 years
  const years = Array.from(
    { length: 10 },
    (_, i) => target.getFullYear() - (i + 1)
  );

  // Parallel requests
  const requests = years.map(async (y) => {
    const start = `${y}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${start}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,relative_humidity_2m_mean&timezone=auto`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const daily = data.daily;
      if (daily?.time?.length) {
        return {
          year: y,
          tMax: daily.temperature_2m_max?.[0] ?? null,
          tMin: daily.temperature_2m_min?.[0] ?? null,
          precipSum: daily.precipitation_sum?.[0] ?? null,
          windMax: daily.windspeed_10m_max?.[0] ?? null,
          humidity: daily.relative_humidity_2m_mean?.[0] ?? null,
        };
      }
    } catch (err) {
      console.error(`Historical fetch failed for year ${y}:`, err);
    }
    return {
      year: y,
      tMax: null,
      tMin: null,
      precipSum: null,
      windMax: null,
      humidity: null,
    };
  });

  const records = await Promise.all(requests);

  // Helpers
  const valid = (vals: (number | null)[]) =>
    vals.filter((v) => v != null) as number[];
  const avg = (vals: number[]) =>
    vals.length
      ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
      : 0;

  const result: HistoricalData = {
    averages: {
      tMax: avg(valid(records.map((r) => r.tMax))),
      tMin: avg(valid(records.map((r) => r.tMin))),
      precipSum: avg(valid(records.map((r) => r.precipSum))),
      windMax: avg(valid(records.map((r) => r.windMax))),
      humidity: avg(valid(records.map((r) => r.humidity))),
    },
    records,
  };

  // ✅ Save to cache (12h expiry is enforced by loadCache)
  saveCache(key, result);

  return result;
}
