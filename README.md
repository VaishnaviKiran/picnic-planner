<<<<<<< HEAD
# ☀️ Weather Picnic Planner

Welcome to the Weather Picnic Planner code exercise! Your goal is to create a robust, intuitive application that helps users choose the best day for a picnic based on weather forecasts and historical trends. You will use the [Open-Meteo API](https://open-meteo.com/) as your primary weather data source.

## 🎯 Main Features and Requirements

### 1. Interactive Two Week Forecast Calendar

**Description:**

- Display a calendar showing the next two weeks from today's date (inclusive of today).
- Dates should be color coded according to picnic suitability:
  - **Green:** Ideal picnic conditions (comfortable temperatures, low chance of rain).
  - **Yellow:** Fair conditions (moderate temperatures, slight chance of rain).
  - **Red:** Poor conditions (extreme temperatures, high chance of rain).

**Architecture Considerations:**

- Define clear criteria for "ideal," "fair," and "poor" conditions.
- Implement efficient data fetching and caching.

### 2. Detailed Weather View for Each Day

**Description:**

- Clicking a date on the calendar should display:
  - Forecasted temperature, precipitation, humidity, and wind details.
  - Historical weather statistics for that date from the past 10 years (average temperatures, precipitation patterns, etc.).

**Architecture Considerations:**

- Aggregate and clearly visualize historical data.
- Handle multiple concurrent data requests efficiently.

### 3. Local Storage and Data Caching

**Description:**

- Cache weather data locally to minimize unnecessary API calls and improve app performance.
- Clearly document caching strategy including refresh intervals and cache invalidation.

**Architecture Considerations:**

- Choose appropriate local storage (e.g., localStorage, IndexedDB, SQLite).
- Clearly document cache management strategies.

### 4. API Abstraction and Extensibility

**Description:**

- Implement a clear abstraction layer around the Open-Meteo API.
- Ensure your architecture allows easy substitution or addition of alternative weather data sources.

**Architecture Considerations:**

- Craft a clear interface design.

## 📌 Bonus Features (Optional Stretch Goals)

Consider implementing one or more of the following to showcase advanced architectural thinking:

- **Location Selection:** Allow users to dynamically select or update their picnic location.
- **User Preferences:** Enable users to customize weather criteria (e.g., temperature thresholds).

## 🔨 Technical Expectations

Clearly demonstrate the following in your submission:

- Separation of concerns and modular design
- Clear, maintainable, and well documented code
- Performance considerations and optimizations
- Handling of edge cases and errors
- Thoughtful user experience (while not looking for UI perfection, we do want an easily useable interface)

## 🛠 Deliverables

- Working source code in a publicly accessible repository
  - Fork this repo and submit a PR with from your repo to alert us that you are ready for us to review
- Instructions on how to run, build, and test the application
- Documentation (or README) explaining architecture decisions and trade-offs

## 🎖 Evaluation Criteria

Your submission will be evaluated based on:

- **Architecture Quality** (modularity, maintainability, scalability)
- **Code Clarity and Readability**
- **Implementation of Core Features**

---

Good luck, have fun, and happy coding! 🌤
=======
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
>>>>>>> e35a9e2 (Initial commit for Weather Picnic Planner project)
