# Weather Picnic Planner

A user-friendly app that helps plan picnics by rating days for suitability based on customizable weather thresholds.

## Features
- 14-day weather forecast calendar with "ideal", "fair", "poor" day ratings
- 10-year historical weather averages for selected dates
- Adjustable comfort thresholds (temperature, wind, rain, humidity) with unit conversions
- Location search with geocoding
- Local caching of forecast and historical data for offline use and reduced API calls
- Error boundary for graceful UI failures

## Installation

npm install
npm run dev


## Usage
- Search and select a city
- Browse the forecast calendar with color-coded suitability ratings
- Adjust comfort thresholds in the settings panel
- View detailed daily weather and historical averages
- Clear cache via settings to refresh data manually

## Caching Strategy
- Forecast data cached per city-month for 6 hours
- Historical averages cached per city-month for 30 days
- Cache invalidated on expiration, manual refresh, or preference changes
- Graceful fallback to cached data when offline or on API errors

## Technologies
- React, TypeScript
- Open-Meteo API
- localStorage caching
- react-error-boundary

## Project Structure
- `/src/components`: React UI components like Calendar, Preferences, WeatherDetails
- `/src/components/calendar`: Contains Calendar component and related subcomponents
- `/src/services`: API abstraction and geocoding logic
- `/src/utils`: Utilities for caching, unit conversions, preferences
- `/src/hooks`: Custom React hooks

## Extensibility and Future Enhancements

This app fulfills all core requirements and is architected modularly for easy extension, such as:
- Responsive layout and mobile support using CSS frameworks or media queries
- Additional weather providers can be integrated via the defined provider interface
- Enhanced user preferences and profile management
- Improved offline support with IndexedDB or service workers
- Accessibility and internationalization improvements

## Contributing

Pull requests and issues are welcome! Please fork the repository and submit PRs for bug fixes or new features.

---

Feel free to reach out if you want help with testing, deployment, or adding features.