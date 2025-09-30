// components/DayWeatherDetails.tsx
import React from "react";
import WeatherIcon from "./WeatherIcon";
import HistoricalChart from "./HistoricalChart";
import {
  TemperatureUnit,
  WindUnit,
  PrecipitationUnit,
  formatTemperature,
  formatWindSpeed,
  formatPrecipitation,
} from "../utils/temperature";
import { Suitability } from "../utils/rating";

type WeatherDetails = {
  tMax?: number;
  tMin?: number;
  precipSum?: number;
  windMax?: number;
  humidity?: number;
  status: Suitability;
};

type Props = {
  selectedDate: string | null;
  selected?: WeatherDetails;
  historical: {
    averages: WeatherDetails;
    records: any[];
  } | null;
  historicalLoading: boolean;
  weatherCondition: string;
  temperatureUnit: TemperatureUnit;
  windUnit: WindUnit;
  precipitationUnit: PrecipitationUnit;
  showError: boolean;
};

/**
 * Displays detailed weather information for a selected day,
 * including current forecast data and historical averages.
 */
const DayWeatherDetails: React.FC<Props> = ({
  selectedDate,
  selected,
  historical,
  historicalLoading,
  weatherCondition,
  temperatureUnit,
  windUnit,
  precipitationUnit,
  showError,
}) => {
  // Render suitability status badge with appropriate colors
  const renderStatusBadge = (status: Suitability) => {
    const bgClass =
      status === "ideal"
        ? "bg-green-400 text-white"
        : status === "fair"
        ? "bg-yellow-300"
        : "bg-red-400 text-white";
    return (
      <span className={`px-2 py-1 rounded text-xs capitalize ${bgClass}`}>
        {status}
      </span>
    );
  };

  // Render a weather detail item with label and formatted value
  const renderDetailItem = (label: string, value: React.ReactNode) => (
    <li className="border rounded p-2">
      <div className="text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </li>
  );

  return (
    <section
      className="w-[350px] shadow-md rounded-2xl border border-gray-200 p-5 flex flex-col items-center"
      style={{ maxHeight: "80vh", overflowY: "auto", background: "white" }}
    >
      <h2 className="text-xl font-bold mb-3 text-center">Day Weather Details</h2>

      {/* Weather icon and date */}
      <div className="flex flex-col items-center justify-center mb-3">
        <WeatherIcon condition={weatherCondition} size={40} />
        <span className="px-3 py-1 mt-2 rounded-full bg-blue-100 text-black-700 font-semibold text-lg">
          {selectedDate ?? "-"}
        </span>
      </div>

      {/* Conditional content based on error and selection */}
      {!showError ? (
        selected ? (
          <div>
            {/* Suitability status */}
            <div>
              Status: {renderStatusBadge(selected.status)}
            </div>

            {/* Forecast details grid */}
            <ul className="grid grid-cols-2 gap-3 text-sm my-2">
              {renderDetailItem(
                "Max Temp",
                formatTemperature(selected.tMax, temperatureUnit)
              )}
              {renderDetailItem(
                "Min Temp",
                formatTemperature(selected.tMin, temperatureUnit)
              )}
              {renderDetailItem(
                "Rain (sum)",
                formatPrecipitation(selected.precipSum, precipitationUnit)
              )}
              {renderDetailItem(
                "Wind (max)",
                formatWindSpeed(selected.windMax, windUnit)
              )}
              {renderDetailItem(
                "Humidity (avg)",
                selected.humidity != null ? `${selected.humidity}%` : "—"
              )}
            </ul>

            {/* Historical data loading status */}
            {historicalLoading && <div>Loading historical data…</div>}

            {/* Historical averages and chart */}
            {historical && (
              <>
                <div className="font-bold mb-2">
                  Historical Averages (last 10 years):
                </div>
                <ul className="grid grid-cols-2 gap-3 text-sm mb-4">
                  {renderDetailItem(
                    "Max Temp (avg)",
                    formatTemperature(historical.averages.tMax, temperatureUnit)
                  )}
                  {renderDetailItem(
                    "Min Temp (avg)",
                    formatTemperature(historical.averages.tMin, temperatureUnit)
                  )}
                  {renderDetailItem(
                    "Rain (avg)",
                    formatPrecipitation(historical.averages.precipSum, precipitationUnit)
                  )}
                  {renderDetailItem(
                    "Wind (avg)",
                    formatWindSpeed(historical.averages.windMax, windUnit)
                  )}
                  {renderDetailItem(
                    "Humidity (avg)",
                    historical.averages.humidity != null
                      ? `${historical.averages.humidity}%`
                      : "—"
                  )}
                </ul>
                <HistoricalChart historicalValues={historical.records} />
              </>
            )}
          </div>
        ) : (
          <div className="text-slate-500 mt-8">
            Please select a date from the calendar.
          </div>
        )
      ) : (
        <div className="text-slate-500 mt-8">
          Please enter a city and select a date.
        </div>
      )}
    </section>
  );
};

export default DayWeatherDetails;
