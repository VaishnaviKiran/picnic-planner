import { WeatherProvider } from "./weatherProvider";
import { openMeteoProvider } from "./openMeteo";

let currentProvider: WeatherProvider = openMeteoProvider;

export function setWeatherProvider(provider: WeatherProvider) {
  currentProvider = provider;
}

export function fetchForecast(args: Parameters<WeatherProvider["fetchForecast"]>[0]) {
  return currentProvider.fetchForecast(args);
}

export function fetchHistorical(lat: number, lon: number, date: string) {
  return currentProvider.fetchHistorical(lat, lon, date);
}
