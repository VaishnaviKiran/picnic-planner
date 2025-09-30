export type TemperatureUnit = 'C' | 'F' | 'K';
export type WindUnit = 'kmh' | 'mph' | 'ms' | 'knots';
export type PrecipitationUnit = 'mm' | 'in' | 'cm';


export const convertCelsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

export const convertFahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9;
};

export const convertCelsiusToKelvin = (celsius: number): number => {
  return celsius + 273.15;
};

export const convertKelvinToCelsius = (kelvin: number): number => {
  return kelvin - 273.15;
};

export const convertFahrenheitToKelvin = (fahrenheit: number): number => {
  return convertCelsiusToKelvin(convertFahrenheitToCelsius(fahrenheit));
};

export const convertKelvinToFahrenheit = (kelvin: number): number => {
  return convertCelsiusToFahrenheit(convertKelvinToCelsius(kelvin));
};

// ================================
// WIND SPEED CONVERSIONS
// ================================

export const convertKmhToMph = (kmh: number): number => {
  return kmh * 0.621371;
};

export const convertMphToKmh = (mph: number): number => {
  return mph / 0.621371;
};

export const convertKmhToMs = (kmh: number): number => {
  return kmh / 3.6;
};

export const convertMsToKmh = (ms: number): number => {
  return ms * 3.6;
};

export const convertKmhToKnots = (kmh: number): number => {
  return kmh / 1.852;
};

export const convertKnotsToKmh = (knots: number): number => {
  return knots * 1.852;
};

export const convertMphToMs = (mph: number): number => {
  return convertKmhToMs(convertMphToKmh(mph));
};

export const convertMsToMph = (ms: number): number => {
  return convertKmhToMph(convertMsToKmh(ms));
};

export const convertMphToKnots = (mph: number): number => {
  return convertKmhToKnots(convertMphToKmh(mph));
};

export const convertKnotsToMph = (knots: number): number => {
  return convertKmhToMph(convertKnotsToKmh(knots));
};

export const convertMsToKnots = (ms: number): number => {
  return convertKmhToKnots(convertMsToKmh(ms));
};

export const convertKnotsToMs = (knots: number): number => {
  return convertKmhToMs(convertKnotsToKmh(knots));
};

// ================================
// PRECIPITATION CONVERSIONS
// ================================

export const convertMmToInches = (mm: number): number => {
  return mm * 0.0393701;
};

export const convertInchesToMm = (inches: number): number => {
  return inches / 0.0393701;
};

export const convertMmToCm = (mm: number): number => {
  return mm / 10;
};

export const convertCmToMm = (cm: number): number => {
  return cm * 10;
};

export const convertInchesToCm = (inches: number): number => {
  return convertMmToCm(convertInchesToMm(inches));
};

export const convertCmToInches = (cm: number): number => {
  return convertMmToInches(convertCmToMm(cm));
};

// ================================
// FORMATTING FUNCTIONS
// ================================

/**
 * Format temperature with unit conversion and display
 * @param temp Temperature in Celsius (from API)
 * @param unit Desired display unit ('C', 'F', or 'K')
 * @returns Formatted temperature string (e.g., "72°F", "22°C", "295°K")
 */
export const formatTemperature = (temp: number | undefined | null, unit: TemperatureUnit): string => {
  if (temp == null) return "—";
  
  let displayTemp = temp; // temp is in Celsius from API
  
  switch (unit) {
    case 'F':
      displayTemp = convertCelsiusToFahrenheit(temp);
      break;
    case 'K':
      displayTemp = convertCelsiusToKelvin(temp);
      break;
    case 'C':
    default:
      displayTemp = temp;
      break;
  }
  
  return `${Math.round(displayTemp)}°${unit}`;
};

/**
 * Format wind speed with unit conversion and display
 * @param speed Wind speed in km/h (from API)
 * @param unit Desired display unit ('kmh', 'mph', 'ms', or 'knots')
 * @returns Formatted wind speed string (e.g., "15 mph", "24 kmh", "6.7 m/s", "13 knots")
 */
export const formatWindSpeed = (speed: number | undefined | null, unit: WindUnit): string => {
  if (speed == null) return "—";
  
  let displaySpeed = speed; // speed is in km/h from API
  
  switch (unit) {
    case 'mph':
      displaySpeed = convertKmhToMph(speed);
      break;
    case 'ms':
      displaySpeed = convertKmhToMs(speed);
      return `${displaySpeed.toFixed(1)} m/s`;
    case 'knots':
      displaySpeed = convertKmhToKnots(speed);
      break;
    case 'kmh':
    default:
      displaySpeed = speed;
      break;
  }
  
  return `${Math.round(displaySpeed)} ${unit}`;
};

/**
 * Format precipitation with unit conversion and display
 * @param precip Precipitation in mm (from API)
 * @param unit Desired display unit ('mm', 'in', or 'cm')
 * @returns Formatted precipitation string (e.g., "0.25 in", "6.4 mm", "0.6 cm")
 */
export const formatPrecipitation = (precip: number | undefined | null, unit: PrecipitationUnit): string => {
  if (precip == null) return "—";
  
  let displayPrecip = precip; // precip is in mm from API
  
  switch (unit) {
    case 'in':
      displayPrecip = convertMmToInches(precip);
      return `${displayPrecip.toFixed(2)} in`;
    case 'cm':
      displayPrecip = convertMmToCm(precip);
      return `${displayPrecip.toFixed(1)} cm`;
    case 'mm':
    default:
      return `${displayPrecip.toFixed(1)} mm`;
  }
};

// ================================
// GENERIC CONVERSION FUNCTIONS
// ================================

/**
 * Generic temperature conversion function
 * @param temp Temperature value
 * @param from Source unit
 * @param to Target unit
 * @returns Converted temperature
 */
export const convertTemperature = (temp: number, from: TemperatureUnit, to: TemperatureUnit): number => {
  if (from === to) return temp;
  
  // Convert to Celsius first (common base)
  let celsius = temp;
  if (from === 'F') {
    celsius = convertFahrenheitToCelsius(temp);
  } else if (from === 'K') {
    celsius = convertKelvinToCelsius(temp);
  }
  
  // Convert from Celsius to target unit
  switch (to) {
    case 'F':
      return convertCelsiusToFahrenheit(celsius);
    case 'K':
      return convertCelsiusToKelvin(celsius);
    case 'C':
    default:
      return celsius;
  }
};

/**
 * Generic wind speed conversion function
 * @param speed Wind speed value
 * @param from Source unit
 * @param to Target unit
 * @returns Converted wind speed
 */
export const convertWindSpeed = (speed: number, from: WindUnit, to: WindUnit): number => {
  if (from === to) return speed;
  
  // Convert to km/h first (common base)
  let kmh = speed;
  switch (from) {
    case 'mph':
      kmh = convertMphToKmh(speed);
      break;
    case 'ms':
      kmh = convertMsToKmh(speed);
      break;
    case 'knots':
      kmh = convertKnotsToKmh(speed);
      break;
    case 'kmh':
    default:
      kmh = speed;
      break;
  }
  
  // Convert from km/h to target unit
  switch (to) {
    case 'mph':
      return convertKmhToMph(kmh);
    case 'ms':
      return convertKmhToMs(kmh);
    case 'knots':
      return convertKmhToKnots(kmh);
    case 'kmh':
    default:
      return kmh;
  }
};

/**
 * Generic precipitation conversion function
 * @param precip Precipitation value
 * @param from Source unit
 * @param to Target unit
 * @returns Converted precipitation
 */
export const convertPrecipitation = (precip: number, from: PrecipitationUnit, to: PrecipitationUnit): number => {
  if (from === to) return precip;
  
  // Convert to mm first (common base)
  let mm = precip;
  switch (from) {
    case 'in':
      mm = convertInchesToMm(precip);
      break;
    case 'cm':
      mm = convertCmToMm(precip);
      break;
    case 'mm':
    default:
      mm = precip;
      break;
  }
  
  // Convert from mm to target unit
  switch (to) {
    case 'in':
      return convertMmToInches(mm);
    case 'cm':
      return convertMmToCm(mm);
    case 'mm':
    default:
      return mm;
  }
};

// ================================
// UNIT INFORMATION & OPTIONS
// ================================

export const TEMPERATURE_UNITS = {
  C: { label: '°C', name: 'Celsius', type: 'metric' },
  F: { label: '°F', name: 'Fahrenheit', type: 'imperial' },
  K: { label: '°K', name: 'Kelvin', type: 'scientific' }
} as const;

export const WIND_UNITS = {
  kmh: { label: 'km/h', name: 'Kilometers per hour', type: 'metric' },
  mph: { label: 'mph', name: 'Miles per hour', type: 'imperial' },
  ms: { label: 'm/s', name: 'Meters per second', type: 'scientific' },
  knots: { label: 'knots', name: 'Nautical miles per hour', type: 'nautical' }
} as const;

export const PRECIPITATION_UNITS = {
  mm: { label: 'mm', name: 'Millimeters', type: 'metric' },
  in: { label: 'in', name: 'Inches', type: 'imperial' },
  cm: { label: 'cm', name: 'Centimeters', type: 'metric' }
} as const;

// ================================
// CONSTANTS FOR REFERENCE
// ================================

export const CONVERSION_FACTORS = {
  temperature: {
    celsiusToFahrenheit: { multiply: 9/5, add: 32 },
    fahrenheitToCelsius: { subtract: 32, multiply: 5/9 },
    celsiusToKelvin: { add: 273.15 },
    kelvinToCelsius: { subtract: 273.15 }
  },
  wind: {
    kmhToMph: 0.621371,
    mphToKmh: 1.60934,
    kmhToMs: 1/3.6,
    msToKmh: 3.6,
    kmhToKnots: 1/1.852,
    knotsToKmh: 1.852
  },
  precipitation: {
    mmToInches: 0.0393701,
    inchesToMm: 25.4,
    mmToCm: 0.1,
    cmToMm: 10
  }
} as const;

// ================================
// VALIDATION FUNCTIONS
// ================================

export const isValidTemperatureUnit = (unit: string): unit is TemperatureUnit => {
  return ['C', 'F', 'K'].includes(unit);
};

export const isValidWindUnit = (unit: string): unit is WindUnit => {
  return ['kmh', 'mph', 'ms', 'knots'].includes(unit);
};

export const isValidPrecipitationUnit = (unit: string): unit is PrecipitationUnit => {
  return ['mm', 'in', 'cm'].includes(unit);
};
