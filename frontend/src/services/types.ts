// services/types.ts

export type Suitability = "ideal" | "fair" | "poor";

export interface DayWithStatus {
  date: string;
  tMax?: number;
  tMin?: number;
  precipSum?: number;
  windMax?: number;
  humidity?: number;
  status: Suitability;
}

export interface CoordsType {
  lat: number;
  lon: number;
  tz?: string;
  name?: string;
}

export type HistoricalRecord = {
  year: number;
  tMax: number | null;
  tMin: number | null;
  precipSum: number | null;
  windMax: number | null;
  humidity: number | null;
};

export interface HistoricalData {
  averages: {
    tMax: number;
    tMin: number;
    precipSum: number;
    windMax: number;
    humidity: number;
  };
  records: HistoricalRecord[];
}
