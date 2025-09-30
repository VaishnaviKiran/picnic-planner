import { WeatherProvider, DailyRow, HistoricalData } from "./weatherProvider";
import { fetchHistoricalData } from "./fetchHistorical";

class OpenMeteoProvider implements WeatherProvider {
  async fetchForecast(args: {
    lat: number;
    lon: number;
    start: string;
    end: string;
    timezone?: string;
  }): Promise<DailyRow[]> {
    const { lat, lon, start, end, timezone } = args;

    const apiBase = "https://api.open-meteo.com/v1/forecast";
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      start_date: start,
      end_date: end,
      daily:
        "temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,relative_humidity_2m_max",
      timezone: timezone ?? "auto",
    });

    const url = `${apiBase}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch forecast: ${response.statusText}`);
    }

    const data = await response.json();
    const dates = data.daily.time ?? [];

    return dates.map((d: string, i: number) => ({
      date: d,
      tMax: data.daily.temperature_2m_max?.[i] ?? 0,
      tMin: data.daily.temperature_2m_min?.[i] ?? 0,
      precipSum: data.daily.precipitation_sum?.[i] ?? 0,
      windMax: data.daily.windspeed_10m_max?.[i] ?? 0,
      humidity: data.daily.relative_humidity_2m_max?.[i] ?? 0,
    }));
  }

  // ✅ Add missing method
  async fetchHistorical(
    lat: number,
    lon: number,
    date: string
  ): Promise<HistoricalData> {
    return fetchHistoricalData(lat, lon, date);
  }
}

export const openMeteoProvider: WeatherProvider = new OpenMeteoProvider();
