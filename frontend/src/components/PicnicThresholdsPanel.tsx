import React from "react";
import {
  TemperatureUnit,
  WindUnit,
  PrecipitationUnit,
  convertTemperature,
  convertWindSpeed,
  convertPrecipitation,
} from "../utils/temperature";
import { useLocalStorageSync } from "../hooks/useLocalStorageSync";
import { saveSimplePreferences } from "../utils/preferences";
import { DEFAULT_SIMPLE_PREFERENCES, SimplePicnicPreferences } from "../utils/preferences";
import { clearCache } from "../utils/cache";

type Props = {
  onSave: () => void;
  temperatureUnit: TemperatureUnit;
  windUnit: WindUnit;
  precipitationUnit: PrecipitationUnit;
  onToggleTemperature: (unit: TemperatureUnit) => void;
  onToggleWind: (unit: WindUnit) => void;
  onTogglePrecipitation: (unit: PrecipitationUnit) => void;
};

const TEMPERATURE_OPTIONS = [
  { value: "C", label: "°C" },
  { value: "F", label: "°F" },
];
const WIND_OPTIONS = [
  { value: "kmh", label: "km/h" },
  { value: "mph", label: "mph" },
];
const PRECIPITATION_OPTIONS = [
  { value: "mm", label: "mm" },
  { value: "in", label: "in" },
];

/**
 * PicnicThresholdsPanel allows setting comfort ranges (temperature, wind, rain, humidity),
 * unit toggling, saving preferences, reset, and cache clearance.
 */
const PicnicThresholdsPanel: React.FC<Props> = ({
  onSave,
  temperatureUnit,
  windUnit,
  precipitationUnit,
  onToggleTemperature,
  onToggleWind,
  onTogglePrecipitation,
}) => {
  // Local synced preferences state with validation
  const [localPrefs, setLocalPrefs] = useLocalStorageSync(
    "simple_picnic_preferences",
    DEFAULT_SIMPLE_PREFERENCES
  );
  const [isSaved, setIsSaved] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = React.useState<"temp" | "wind" | "precip" | null>(null);

  // Convert stored base unit values to displayed units for inputs
  const getDisplayValue = React.useCallback(
    (key: keyof SimplePicnicPreferences): number => {
      const baseValue = localPrefs[key];
      if (key.includes("temp")) {
        return convertTemperature(baseValue, "F", temperatureUnit);
      }
      if (key.includes("wind")) {
        return convertWindSpeed(baseValue, "mph", windUnit);
      }
      if (key.includes("rain")) {
        return convertPrecipitation(baseValue, "in", precipitationUnit);
      }
      return baseValue;
    },
    [localPrefs, temperatureUnit, windUnit, precipitationUnit]
  );

  // Update localPrefs state on input change with conversions and validation
  const handleChange = (key: keyof SimplePicnicPreferences, displayValue: number) => {
    setIsSaved(false);
    let actualValue = displayValue;

    if (key.includes("temp")) {
      actualValue = convertTemperature(displayValue, temperatureUnit, "F");
    } else if (key.includes("wind")) {
      actualValue = convertWindSpeed(displayValue, windUnit, "mph");
    } else if (key.includes("rain")) {
      actualValue = convertPrecipitation(displayValue, precipitationUnit, "in");
    }

    setLocalPrefs((prev) => {
      const newPrefs = { ...prev, [key]: actualValue };
      // Validate min/max ranges and collect errors
      const newErrors: Record<string, string> = {};
      if (newPrefs.tempMin > newPrefs.tempMax) newErrors.tempMin = "Min cannot exceed Max";
      if (newPrefs.windMin > newPrefs.windMax) newErrors.windMin = "Min cannot exceed Max";
      if (newPrefs.rainMin > newPrefs.rainMax) newErrors.rainMin = "Min cannot exceed Max";
      if (newPrefs.humidityMin > newPrefs.humidityMax) newErrors.humidityMin = "Min cannot exceed Max";
      setErrors(newErrors);
      return newPrefs;
    });
  };

  // Save preferences if no validation errors
  const handleSave = () => {
    if (Object.values(errors).some((msg) => msg)) {
      alert("Please fix validation errors before saving.");
      return;
    }
    saveSimplePreferences(localPrefs);
    onSave();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Reset preferences to defaults
  const handleReset = () => {
    setLocalPrefs(DEFAULT_SIMPLE_PREFERENCES);
    saveSimplePreferences(DEFAULT_SIMPLE_PREFERENCES);
    onSave();
    setIsSaved(false);
    setErrors({});
  };

  // Toggle the dropdown for unit selection menus
  const toggleDropdown = (dropdown: "temp" | "wind" | "precip") =>
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="text-center pb-2">
        <h2 className="text-lg font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-gray-500">Set your comfort ranges</p>
      </div>

      {/* Temperature Range */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-100">
        <RangeSetting
          label="🌡️ Temperature Range"
          valueMin={Math.round(getDisplayValue("tempMin"))}
          valueMax={Math.round(getDisplayValue("tempMax"))}
          unit={temperatureUnit}
          options={TEMPERATURE_OPTIONS}
          openDropdown={openDropdown}
          dropdownKey="temp"
          onToggleDropdown={toggleDropdown}
          onSelectUnit={(unit) => {
            onToggleTemperature(unit as TemperatureUnit);
            setOpenDropdown(null);
          }}
          onChangeMin={(val) => handleChange("tempMin", val)}
          onChangeMax={(val) => handleChange("tempMax", val)}
          errorMin={errors.tempMin}
        />
      </div>

      {/* Wind Range */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
        <RangeSetting
          label="💨 Wind Range"
          valueMin={Math.round(getDisplayValue("windMin"))}
          valueMax={Math.round(getDisplayValue("windMax"))}
          unit={windUnit}
          options={WIND_OPTIONS}
          openDropdown={openDropdown}
          dropdownKey="wind"
          onToggleDropdown={toggleDropdown}
          onSelectUnit={(unit) => {
            onToggleWind(unit as WindUnit);
            setOpenDropdown(null);
          }}
          onChangeMin={(val) => handleChange("windMin", val)}
          onChangeMax={(val) => handleChange("windMax", val)}
          errorMin={errors.windMin}
        />
      </div>

      {/* Rain Range */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
        <RangeSetting
          label="🌧️ Rain Range"
          valueMin={getDisplayValue("rainMin")}
          valueMax={getDisplayValue("rainMax")}
          unit={precipitationUnit}
          options={PRECIPITATION_OPTIONS}
          openDropdown={openDropdown}
          dropdownKey="precip"
          onToggleDropdown={toggleDropdown}
          onSelectUnit={(unit) => {
            onTogglePrecipitation(unit as PrecipitationUnit);
            setOpenDropdown(null);
          }}
          onChangeMin={(val) => handleChange("rainMin", val)}
          onChangeMax={(val) => handleChange("rainMax", val)}
          errorMin={errors.rainMin}
          step={0.1}
        />
      </div>

      {/* Humidity Range */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
        <h3 className="text-sm font-semibold text-gray-700">💧 Humidity Range (%)</h3>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <input
            type="number"
            value={Math.round(getDisplayValue("humidityMin"))}
            onChange={(e) => handleChange("humidityMin", parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-white"
          />
          <input
            type="number"
            value={Math.round(getDisplayValue("humidityMax"))}
            onChange={(e) => handleChange("humidityMax", parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-white"
          />
        </div>
        {errors.humidityMin && (
          <p className="text-red-600 text-xs mt-1">{errors.humidityMin}</p>
        )}
      </div>

      {/* Reset and Save Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 rounded-md font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors"
        >
          🔄 Reset
        </button>
        <button
          onClick={handleSave}
          className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            isSaved ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isSaved ? "✅ Saved!" : "💾 Save"}
        </button>
      </div>

      {/* Cache Controls */}
      <div className="pt-2">
        <button
          onClick={() => {
            if (confirm("Clear cached weather data?")) {
              clearCache("wx:");
              onSave();
            }
          }}
          className="w-full px-4 py-2 rounded-md font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors"
        >
          🧹 Clear Cache
        </button>
      </div>
    </div>
  );
};

export default PicnicThresholdsPanel;

/**
 * RangeSetting component - reusable subcomponent for a labeled input range with unit dropdown & validation
 */
type RangeSettingProps = {
  label: string;
  valueMin: number;
  valueMax: number;
  unit: string;
  options: { value: string; label: string }[];
  openDropdown: "temp" | "wind" | "precip" | null;
  dropdownKey: "temp" | "wind" | "precip";
  onToggleDropdown: (dropdown: "temp" | "wind" | "precip") => void;
  onSelectUnit: (unit: string) => void;
  onChangeMin: (val: number) => void;
  onChangeMax: (val: number) => void;
  errorMin?: string;
  step?: number;
};

const RangeSetting: React.FC<RangeSettingProps> = ({
  label,
  valueMin,
  valueMax,
  unit,
  options,
  openDropdown,
  dropdownKey,
  onToggleDropdown,
  onSelectUnit,
  onChangeMin,
  onChangeMax,
  errorMin,
  step = 1,
}) => (
  <>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleDropdown(dropdownKey);
          }}
          className="px-2 py-1 rounded text-xs font-medium bg-gray-100 border border-gray-300"
        >
          {unit}
        </button>
        {openDropdown === dropdownKey && (
          <div className="absolute right-0 mt-1 bg-white border rounded shadow-md z-10">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectUnit(option.value);
                }}
                className={`block w-full px-3 py-2 text-xs ${
                  unit === option.value ? "bg-blue-50 text-blue-700" : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <input
        type="number"
        step={step}
        value={valueMin}
        onChange={(e) => onChangeMin(parseFloat(e.target.value) || 0)}
        className={`w-full px-3 py-2 border rounded-md text-sm bg-white ${
          errorMin ? "border-red-600" : ""
        }`}
      />
      <input
        type="number"
        step={step}
        value={valueMax}
        onChange={(e) => onChangeMax(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2 border rounded-md text-sm bg-white"
      />
    </div>
    {errorMin && <p className="text-red-600 text-xs mt-1">{errorMin}</p>}
  </>
);
