import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HistoricalRecord } from "../services/types";

type Props = {
  historicalValues: HistoricalRecord[];
};

/**
 * Formats a number to one decimal place or returns "-" if null/undefined.
 */
const formatNumber = (val: number | null | undefined): string =>
  val !== undefined && val !== null ? val.toFixed(1) : "-";

/**
 * Displays a line chart and data table for 10-year historical weather trends.
 */
const HistoricalChart: React.FC<Props> = ({ historicalValues }) => {
  if (!historicalValues.length) return null;

  return (
    <div style={{ width: "100%", height: 460 }}>
      <h3 className="font-bold mb-2">10-Year Historical Trends</h3>
      <ResponsiveContainer height={300}>
        <LineChart data={historicalValues}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="tMax" stroke="#ef4444" name="Max Temp" />
          <Line type="monotone" dataKey="tMin" stroke="#3b82f6" name="Min Temp" />
          <Line type="monotone" dataKey="precipSum" stroke="#10b981" name="Rain (mm)" />
          <Line type="monotone" dataKey="windMax" stroke="#f59e0b" name="Wind (km/h)" />
          <Line type="monotone" dataKey="humidity" stroke="#6366f1" name="Humidity (%)" />
        </LineChart>
      </ResponsiveContainer>

      <div
        style={{
          maxHeight: 130,
          overflowY: "auto",
          marginTop: 12,
          borderTop: "1px solid #ddd",
          paddingTop: 10,
          fontSize: 13,
          background: "#fafafa",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Year</th>
              <th style={{ color: "#6366f1", textAlign: "right" }}>Humidity (%)</th>
              <th style={{ color: "#ef4444", textAlign: "right" }}>Max Temp</th>
              <th style={{ color: "#3b82f6", textAlign: "right" }}>Min Temp</th>
              <th style={{ color: "#10b981", textAlign: "right" }}>Rain (mm)</th>
              <th style={{ color: "#f59e0b", textAlign: "right" }}>Wind (km/h)</th>
            </tr>
          </thead>
          <tbody>
            {historicalValues.map(({ year, humidity, tMax, tMin, precipSum, windMax }) => (
              <tr key={year} style={{ borderBottom: "1px solid #ddd" }}>
                <td>{year}</td>
                <td style={{ color: "#6366f1", textAlign: "right" }}>{formatNumber(humidity)}</td>
                <td style={{ color: "#ef4444", textAlign: "right" }}>{formatNumber(tMax)}</td>
                <td style={{ color: "#3b82f6", textAlign: "right" }}>{formatNumber(tMin)}</td>
                <td style={{ color: "#10b981", textAlign: "right" }}>{formatNumber(precipSum)}</td>
                <td style={{ color: "#f59e0b", textAlign: "right" }}>{formatNumber(windMax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricalChart;
