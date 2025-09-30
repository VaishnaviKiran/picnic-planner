// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

// CORS (allow your Vite dev server by default)
const ALLOWED = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: ALLOWED }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// GET /api/weather?lat=..&lon=..&start=YYYY-MM-DD&end=YYYY-MM-DD&tz=America/New_York
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon, start, end, tz = 'auto' } = req.query;
    if (!lat || !lon || !start || !end) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const daily = [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'windspeed_10m_max',
      'relative_humidity_2m_mean',
    ].join(',');

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set('daily', daily);
    url.searchParams.set('start_date', String(start));
    url.searchParams.set('end_date', String(end));
    url.searchParams.set('timezone', String(tz));
    url.searchParams.set('temperature_unit', 'celsius');
    url.searchParams.set('windspeed_unit', 'kmh');
    url.searchParams.set('precipitation_unit', 'mm');

    // Node 18+ has global fetch
    const r = await fetch(url.toString(), { headers: { 'User-Agent': 'picnic-planner/1.0' } });
    if (!r.ok) return res.status(502).json({ error: 'Upstream error', status: r.status });
    const data = await r.json();

    // Normalize to DailyRow[] your frontend expects
    const rows = (data?.daily?.time ?? []).map((d, i) => ({
      date: d,
      tMax: data.daily.temperature_2m_max?.[i],
      tMin: data.daily.temperature_2m_min?.[i],
      precipSum: data.daily.precipitation_sum?.[i],
      windMax: data.daily.windspeed_10m_max?.[i],
      humidity: data.daily.relative_humidity_2m_mean?.[i],
    }));

    // Cache headers (optional, helps browser/CDN)
    res.set('Cache-Control', 'public, max-age=1800'); // 30 minutes
    return res.json({ daily: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`CORS allowed origin: ${ALLOWED}`);
});
