// utils/preferences.ts

/**
 * Old interface for detailed picnic weather preferences.
 * Kept for backward compatibility.
 */
export interface PicnicPreferences {
  precipPoorThreshold: number;
  precipFairThreshold: number;
  tMaxIdealMin: number;
  tMaxIdealMax: number;
  tMaxFairMin: number;
  tMaxFairMax: number;
  windMaxPoor: number;
  windMaxFair: number;
  humidityMaxPoor: number;
  humidityMaxFair: number;
}

/**
 * New simplified interface for picnic weather preferences.
 */
export interface SimplePicnicPreferences {
  tempMin: number;
  tempMax: number;
  windMin: number;
  windMax: number;
  rainMin: number;
  rainMax: number;
  humidityMin: number;
  humidityMax: number;
}

/**
 * Default values for SimplePicnicPreferences.
 */
export const DEFAULT_SIMPLE_PREFERENCES: SimplePicnicPreferences = {
  tempMin: 64,        // °F
  tempMax: 82,        // °F
  windMin: 0,         // mph
  windMax: 12,        // mph
  rainMin: 0,         // in
  rainMax: 0.1,       // in (~2 mm)
  humidityMin: 30,    // %
  humidityMax: 70,    // %
};

/**
 * Loads simple picnic preferences from localStorage.
 * Returns defaults if none stored or on parse failure.
 */
export function loadSimplePreferences(): SimplePicnicPreferences {
  try {
    const stored = localStorage.getItem("simple_picnic_preferences");
    if (!stored) {
      return { ...DEFAULT_SIMPLE_PREFERENCES };
    }
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_SIMPLE_PREFERENCES,
      ...parsed,
    };
  } catch (error) {
    console.error("Error loading simple preferences:", error);
    return { ...DEFAULT_SIMPLE_PREFERENCES };
  }
}

/**
 * Saves simple picnic preferences to localStorage and dispatches update event.
 */
export function saveSimplePreferences(preferences: SimplePicnicPreferences): void {
  try {
    const json = JSON.stringify(preferences);
    localStorage.setItem("simple_picnic_preferences", json);
    window.dispatchEvent(new CustomEvent("simple-preferences-updated", { detail: preferences }));
  } catch (error) {
    console.error("Error saving simple preferences:", error);
  }
}

/**
 * Default values for old PicnicPreferences interface.
 */
export const DEFAULT_PREFERENCES: PicnicPreferences = {
  precipPoorThreshold: 2.0,
  precipFairThreshold: 0.5,
  tMaxIdealMin: 20,
  tMaxIdealMax: 28,
  tMaxFairMin: 15,
  tMaxFairMax: 32,
  windMaxPoor: 30,
  windMaxFair: 20,
  humidityMaxPoor: 80,
  humidityMaxFair: 85,
};

/**
 * Loads old picnic preferences from localStorage.
 * Returns defaults if none stored or on parse failure.
 */
export function loadPreferences(): PicnicPreferences {
  try {
    const stored = localStorage.getItem("picnic_preferences");
    if (!stored) {
      return { ...DEFAULT_PREFERENCES };
    }
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    };
  } catch (error) {
    console.error("Error loading preferences:", error);
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Saves old picnic preferences to localStorage.
 */
export function savePreferences(preferences: PicnicPreferences): void {
  try {
    const json = JSON.stringify(preferences);
    localStorage.setItem("picnic_preferences", json);
  } catch (error) {
    console.error("Error saving preferences:", error);
  }
}
