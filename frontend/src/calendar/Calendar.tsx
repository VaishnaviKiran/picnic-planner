// Imports: Libraries, utilities, components
import React from "react";
import * as Sentry from "@sentry/react";
import { addDays, format, isSameDay, getDay } from "date-fns";

import { cacheKey, saveCache, loadCache } from "../utils/cache";
import { rateDay, type Suitability, SimplePicnicPreferences } from "../utils/rating";
import { loadSimplePreferences } from "../utils/preferences";
import { TemperatureUnit, WindUnit, PrecipitationUnit } from "../utils/temperature";
import { fetchForecast, fetchHistorical } from "../services/weatherService";
import { geocodeCity } from "../services/geocode";

import Cell from "./Cell";
import PicnicThresholdsPanel from "../components/PicnicThresholdsPanel";
import DayWeatherDetails from "../components/DayWeatherDetails";

// Constants
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const CACHE_VERSION = "v3";

const DEFAULT_COORDS = {
  lat: 40.4406,
  lon: -79.9959,
  tz: "America/New_York",
  name: "Pittsburgh",
};

// Types
type Props = {
  value?: Date;
  onChange: (date: Date) => void;
  onCityChange?: (city: string) => void;
};

type DayWithStatus = {
  date: string;
  tMax?: number;
  tMin?: number;
  precipSum?: number;
  windMax?: number;
  humidity?: number;
  status: Suitability;
};

type CoordsType = {
  lat: number;
  lon: number;
  tz?: string;
  name?: string;
};

// Helper for background gradient based on suitability
function getBackgroundStyle(status: Suitability | undefined): string {
  switch (status) {
    case "ideal":
      return "linear-gradient(180deg, #87ceeb 0%, #fef9c3 100%)";
    case "fair":
      return "linear-gradient(180deg, #cbd5e1 0%, #f1f5f9 100%)";
    case "poor":
      return "linear-gradient(180deg, #4f8fc9 0%, #1e3a8a 100%)";
    default:
      return "linear-gradient(180deg, #87ceeb 0%, #ffffff 100%)";
  }
}

// CSS class for calendar cell by suitability status
function getStatusClass(status?: Suitability): string {
  switch (status) {
    case "ideal":
      return "bg-green-400 text-white";
    case "fair":
      return "bg-yellow-300";
    case "poor":
      return "bg-red-400 text-white";
    default:
      return "";
  }
}

const Calendar: React.FC<Props> = ({ value = new Date(), onChange, onCityChange }) => {
  // State hooks
  const [coords, setCoords] = React.useState<CoordsType>(DEFAULT_COORDS);
  const [days, setDays] = React.useState<DayWithStatus[]>([]);
  const [prefs, setPrefs] = React.useState<SimplePicnicPreferences>(loadSimplePreferences());

  const [temperatureUnit, setTemperatureUnit] = React.useState<TemperatureUnit>("F");
  const [windUnit, setWindUnit] = React.useState<WindUnit>("mph");
  const [precipitationUnit, setPrecipitationUnit] = React.useState<PrecipitationUnit>("in");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedDate, setSelectedDate] = React.useState<string | null>(format(value, "yyyy-MM-dd"));

  const [q, setQ] = React.useState("");
  const [geoResults, setGeoResults] = React.useState<any[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [geoErr, setGeoErr] = React.useState<string | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  const [historical, setHistorical] = React.useState<any | null>(null);
  const [historicalLoading, setHistoricalLoading] = React.useState(false);

  const [weatherCondition, setWeatherCondition] = React.useState<string>("Clear");

  // Load unit preferences from localStorage on mount
  React.useEffect(() => {
    const validTempUnits = ["C", "F", "K"];
    const validWindUnits = ["kmh", "mph", "ms", "knots"];
    const validPrecipUnits = ["mm", "in", "cm"];

    const savedTempUnit = localStorage.getItem("temperature_unit") as TemperatureUnit;
    const savedWindUnit = localStorage.getItem("wind_unit") as WindUnit;
    const savedPrecipUnit = localStorage.getItem("precipitation_unit") as PrecipitationUnit;

    if (savedTempUnit && validTempUnits.includes(savedTempUnit)) setTemperatureUnit(savedTempUnit);
    if (savedWindUnit && validWindUnits.includes(savedWindUnit)) setWindUnit(savedWindUnit);
    if (savedPrecipUnit && validPrecipUnits.includes(savedPrecipUnit)) setPrecipitationUnit(savedPrecipUnit);
  }, []);

  // Save unit preferences to localStorage on change
  React.useEffect(() => {
    localStorage.setItem("temperature_unit", temperatureUnit);
    localStorage.setItem("wind_unit", windUnit);
    localStorage.setItem("precipitation_unit", precipitationUnit);
  }, [temperatureUnit, windUnit, precipitationUnit]);

  // Listen for external preference updates
  React.useEffect(() => {
    const handler = (event: CustomEvent) => {
      setPrefs(event.detail);
    };
    window.addEventListener("simple-preferences-updated", handler as EventListener);
    return () => window.removeEventListener("simple-preferences-updated", handler as EventListener);
  }, []);

  // Update body background gradient based on selected day's suitability
  React.useEffect(() => {
    document.body.style.background = getBackgroundStyle(days.find((d) => d.date === selectedDate)?.status);
    return () => { document.body.style.background = ""; };
  }, [selectedDate, days]);

  // Sync selection with incoming value prop
  React.useEffect(() => {
    if (value) setSelectedDate(format(value, "yyyy-MM-dd"));
  }, [value]);

  // Notify parent on coords name (city) change
  React.useEffect(() => {
    if (onCityChange) onCityChange(coords.name || "Unknown Location");
  }, [coords.name, onCityChange]);

  // Remove old cache on mount
  React.useEffect(() => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("wx:") && !key.startsWith(`wx:${CACHE_VERSION}:`))
      .forEach((key) => localStorage.removeItem(key));
  }, []);

  // Load forecast data on coords or preferences change
  React.useEffect(() => {
    if (coords.lat == null || coords.lon == null) {
      setDays([]);
      return;
    }
    const lat = coords.lat;
    const lon = coords.lon;
    const tz = coords.tz || "auto";
    const today = new Date();
    const start = format(today, "yyyy-MM-dd");
    const end = format(addDays(today, 13), "yyyy-MM-dd");
    const key = cacheKey(lat, lon, start, end, tz);

    setLoading(true);
    setError(null);

    const fetchForecastData = async () => {
      try {
        const cached = loadCache<DayWithStatus[]>(key);
        if (cached) {
          // Re-rate cached days with latest preferences
          const updatedDays = cached.map((day) => ({
            ...day,
            status: rateDay(
              { tMax: day.tMax, windMax: day.windMax, humidity: day.humidity, precipSum: day.precipSum },
              prefs
            ),
          }));
          setDays(updatedDays);
          setLoading(false);
          return;
        }
        // Fetch fresh forecast
        const forecastRows = await fetchForecast({ lat, lon, start, end, timezone: tz });
        const ratedDays = forecastRows.map((r) => ({
          date: r.date,
          tMax: r.tMax,
          tMin: r.tMin,
          precipSum: r.precipSum,
          windMax: r.windMax,
          humidity: r.humidity,
          status: rateDay(
            { tMax: r.tMax, windMax: r.windMax, humidity: r.humidity, precipSum: r.precipSum },
            prefs
          ),
        }));
        setDays(ratedDays);
        saveCache(key, ratedDays);
      } catch (error) {
        setDays([]);
        setError((error as Error)?.message || "Failed to load forecast");
        Sentry.captureException(error);
      } finally {
        setLoading(false);
      }
    };
    fetchForecastData();
  }, [coords.lat, coords.lon, coords.tz, prefs]);

  // Load historical data for selected date, using caching
  const loadHistoricalData = React.useCallback(
    (dateString: string) => {
      if (!coords.lat || !coords.lon || !dateString) return;

      setHistorical(null);
      setHistoricalLoading(true);

      const histKey = cacheKey(coords.lat, coords.lon, dateString, dateString, "historical");
      const cachedHist = loadCache<any>(histKey);
      if (cachedHist) {
        setHistorical(cachedHist);
        setHistoricalLoading(false);
        return;
      }

      fetchHistorical(coords.lat, coords.lon, dateString)
        .then((data) => {
          saveCache(histKey, data);
          setHistorical(data);
        })
        .catch((e) => console.error("Historical fetch failed:", e))
        .finally(() => setHistoricalLoading(false));
    },
    [coords.lat, coords.lon]
  );

  // Handle date selection changes
  function handleDateClick(dateObj: Date) {
    const dateString = format(dateObj, "yyyy-MM-dd");
    setSelectedDate(dateString);
    onChange(dateObj);
    loadHistoricalData(dateString);

    const day = days.find((d) => d.date === dateString);
    if (!day || day.status === "poor") setWeatherCondition("Rain");
    else if (day.status === "ideal") setWeatherCondition("Clear");
    else if (day.status === "fair") setWeatherCondition("Clouds");
    else setWeatherCondition("Clear");
  }

  // Update historical data & weather icon when selectedDate or forecast days change
  React.useEffect(() => {
    if (days.length && selectedDate) {
      loadHistoricalData(selectedDate);
      const day = days.find((d) => d.date === selectedDate);
      if (!day || day.status === "poor") setWeatherCondition("Rain");
      else if (day.status === "ideal") setWeatherCondition("Clear");
      else if (day.status === "fair") setWeatherCondition("Clouds");
      else setWeatherCondition("Clear");
    }
  }, [selectedDate, days, loadHistoricalData]);

  // Calendar date range and padding for the two-week forecast
  const today = new Date();
  const daysRange = Array.from({ length: 14 }, (_, i) => addDays(today, i));
  const startOffset = getDay(daysRange[0]);

  // Prepare calendar cells: empty padding + day cells
  const calendarCells = [
    ...Array(startOffset).fill(null).map((_, i) => (
      <Cell key={`empty-${i}`} className="border border-gray-200 bg-gray-50" />
    )),
    ...daysRange.map((dateObj) => {
      const dateString = format(dateObj, "yyyy-MM-dd");
      const isSelected = selectedDate === dateString;
      const dayStatus = days.find((d) => d.date === dateString)?.status;
      const dayClass = `${getStatusClass(dayStatus)}${isSelected ? " ring-2 ring-blue-400" : ""}`;

      return (
        <Cell
          key={dateString}
          isActive={!!value && isSameDay(dateObj, value)}
          onClick={() => handleDateClick(dateObj)}
          className={`border border-gray-200 ${dayClass} cursor-pointer transition-all duration-150`}
        >
          {dateObj.getDate()}
        </Cell>
      );
    }),
  ];

  // Determine if city search error should be shown
  const showError = hasSearched && geoResults.length === 0 && !searching && !geoErr;

  // Selected day object for detail display
  const selected = selectedDate ? days.find((d) => d.date === selectedDate) : undefined;

  // Unit change handlers
  const handleTemperatureUnitChange = (unit: TemperatureUnit) => setTemperatureUnit(unit);
  const handleWindUnitChange = (unit: WindUnit) => setWindUnit(unit);
  const handlePrecipitationUnitChange = (unit: PrecipitationUnit) => setPrecipitationUnit(unit);

  // JSX render
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: getBackgroundStyle(selected?.status), transition: "background 0.3s" }}
    >
      {/* Header */}
      <header className="flex justify-center py-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <span role="img" aria-label="sun">🌞</span>
          Weather Picnic Planner
        </h1>
      </header>

      {/* Main content container */}
      <main className="flex flex-1 justify-center items-start gap-8 px-6 pb-12 max-w-7xl mx-auto">

        {/* Preferences Panel */}
        <aside className="w-[350px] bg-white rounded-2xl shadow-md border border-gray-200 p-5 max-h-[80vh] overflow-y-auto">
          <PicnicThresholdsPanel
            onSave={() => setPrefs(loadSimplePreferences())}
            temperatureUnit={temperatureUnit}
            windUnit={windUnit}
            precipitationUnit={precipitationUnit}
            onToggleTemperature={handleTemperatureUnitChange}
            onToggleWind={handleWindUnitChange}
            onTogglePrecipitation={handlePrecipitationUnitChange}
          />
        </aside>

        {/* Calendar Section */}
        <section className="bg-white rounded-2xl shadow-md border border-gray-200 min-w-[370px] py-5 px-6 flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-lg font-bold">Two Week Forecast Calendar</div>
          </div>

          {/* City Search Input and Button */}
          <div className="flex items-center gap-2 mb-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search city (e.g., London)"
              className="px-3 py-2 border border-gray-400 rounded focus:ring-2 focus:ring-blue-400 transition w-60"
            />
            <button
              disabled={!q}
              onClick={async () => {
                try {
                  setSearching(true);
                  setGeoErr(null);
                  setHasSearched(true);
                  const hits = await geocodeCity(q);
                  setGeoResults(hits);
                } catch (e: any) {
                  setGeoErr(e?.message ?? "Search failed");
                } finally {
                  setSearching(false);
                }
              }}
              className="px-3 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Search Results List */}
          {geoResults.length > 0 && (
            <ul className="max-w-md border rounded divide-y mt-1 mb-2">
              {geoResults.map((g, i) => (
                <li
                  key={i}
                  className="p-2 cursor-pointer hover:bg-slate-50"
                  title="Use this location"
                  onClick={() => {
                    setCoords({
                      lat: g.latitude,
                      lon: g.longitude,
                      tz: g.timezone,
                      name: g.name,
                    });
                    setGeoResults([]);
                    setQ("");
                    setHasSearched(false);
                    if (onCityChange) onCityChange(g.name);
                  }}
                >
                  <div className="font-medium">{g.name}</div>
                  <div className="text-xs text-slate-600">
                    {g.admin1 ? `${g.admin1}, ` : ""}
                    {g.country} • {g.latitude.toFixed(3)}, {g.longitude.toFixed(3)}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Error Messages */}
          {showError && (
            <div className="mb-2 p-2 border border-red-400 rounded bg-red-50 text-red-700 text-center font-bold">
              Please enter a valid city.
            </div>
          )}
          {geoErr && <div className="text-sm text-red-600 -mt-1">{`Error: ${geoErr}`}</div>}

          {/* City Info */}
          {!showError && (
            <>
              <span className="font-medium text-base text-slate-800 mb-1">
                {coords.name || "Default Location"}
              </span>
              <span className="text-sm text-slate-600 mb-2">
                {`lat: ${coords.lat.toFixed(3)}, lon: ${coords.lon.toFixed(3)} • ${coords.tz}`}
              </span>
            </>
          )}

          {/* Calendar Grid */}
          <div>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border border-gray-200 rounded-t-lg overflow-hidden mb-1 bg-gray-50">
              {WEEKDAYS.map((week) => (
                <Cell
                  key={week}
                  className="text-xs font-bold uppercase text-slate-600 py-2 border-b border-gray-200 bg-gray-50"
                >
                  {week}
                </Cell>
              ))}
            </div>

            {/* Date Cells */}
            <div className="grid grid-cols-7 border-x border-b border-gray-200 rounded-b-lg overflow-hidden bg-white">
              {calendarCells}
            </div>

            {/* Legend */}
            <div className="flex gap-4 pt-6 pb-1 justify-center">
              <span className="flex items-center gap-1 text-sm">
                <span className="w-4 h-4 rounded bg-green-400 inline-block"></span>
                <span>Ideal</span>
              </span>
              <span className="flex items-center gap-1 text-sm">
                <span className="w-4 h-4 rounded bg-yellow-300 inline-block"></span>
                <span>Fair</span>
              </span>
              <span className="flex items-center gap-1 text-sm">
                <span className="w-4 h-4 rounded bg-red-400 inline-block"></span>
                <span>Poor</span>
              </span>
            </div>
          </div>
        </section>

        {/* Day Details and Historical */}
        <DayWeatherDetails
          selectedDate={selectedDate}
          selected={selected}
          historical={historical}
          historicalLoading={historicalLoading}
          weatherCondition={weatherCondition}
          temperatureUnit={temperatureUnit}
          windUnit={windUnit}
          precipitationUnit={precipitationUnit}
          showError={showError}
        />
      </main>
    </div>
  );
};

export default Calendar;
