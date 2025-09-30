import { useState } from "react";
import Calendar from "./calendar/Calendar";
import { ErrorBoundary } from "react-error-boundary";

type FallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="p-4 border rounded bg-red-50 text-red-700">
      <p className="font-semibold">Something went wrong:</p>
      <pre className="text-xs mt-2">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-3 px-3 py-1 bg-red-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cityDisplay, setCityDisplay] = useState<string | null>(null);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="main-content">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => setCurrentDate(new Date())}
        >
          <Calendar
            value={currentDate}
            onChange={setCurrentDate}
            onCityChange={(city: string) => setCityDisplay(city)}
          />
          {cityDisplay && (
            <div className="city-display">
              {cityDisplay}
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default App;
