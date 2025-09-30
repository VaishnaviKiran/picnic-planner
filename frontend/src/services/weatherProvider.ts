export interface DailyRow {
  date: string;
  tMax: number;
  tMin: number;
  precipSum: number;
  windMax: number;
  humidity: number;
}

export interface HistoricalAverages {
  tMax: number | null;
  tMin: number | null;
  precipSum: number | null;
  windMax: number | null;
  humidity: number | null;
}

export interface HistoricalRecord {
  year: number;
  tMax: number | null;
  tMin: number | null;
  precipSum: number | null;
  windMax: number | null;
  humidity: number | null;
}

export interface HistoricalData {
  averages: HistoricalAverages;
  records: HistoricalRecord[];
}

export interface WeatherProvider {
  fetchForecast(args: {
    lat: number;
    lon: number;
    start: string;
    end: string;
    timezone?: string;
  }): Promise<DailyRow[]>;

  fetchHistorical(
    lat: number,
    lon: number,
    date: string
  ): Promise<HistoricalData>;
}
