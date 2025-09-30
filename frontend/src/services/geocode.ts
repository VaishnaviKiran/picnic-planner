// src/services/geocode.ts
export type GeoHit = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;   // ← add this
};

export async function geocodeCity(name: string): Promise<GeoHit[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`geocoding ${r.status}`);
  const data = await r.json();
  const results = (data?.results ?? []) as any[];
  return results.map((g) => ({
    name: g.name,
    latitude: g.latitude,
    longitude: g.longitude,
    country: g.country,
    admin1: g.admin1,
    timezone: g.timezone,   // ← keep the city’s tz
  }));
}
