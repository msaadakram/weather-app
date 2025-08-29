import React, { useEffect, useState } from "react";
import WeatherCard from "./components/WeatherCard";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Lahore");
  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState(() => localStorage.getItem("unit") || "C");
  const [recent, setRecent] = useState(() => {
    try {
      const value = localStorage.getItem("recentCities");
      return value ? JSON.parse(value) : ["Lahore", "Karachi", "Islamabad"];
    } catch {
      return ["Lahore", "Karachi", "Islamabad"];
    }
  });
  const [favorites, setFavorites] = useState(() => {
    try {
      const value = localStorage.getItem("favoriteCities");
      return value ? JSON.parse(value) : ["Lahore"];
    } catch {
      return ["Lahore"];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dailyForecast, setDailyForecast] = useState([]);

  useEffect(() => {
    localStorage.setItem("unit", unit);
  }, [unit]);

  useEffect(() => {
    async function fetchWeather(target) {
      try {
        setLoading(true);
        setError("");
        const endpoint = `https://wttr.in/${encodeURIComponent(target)}?format=j1`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed fetching weather");
        const data = await res.json();

        setWeather(data);

        // wttr.in already provides daily forecast
        const list = (data?.weather || []).map((day) => ({
          date: day.date,
          min: unit === "F" ? day.mintempF : day.mintempC,
          max: unit === "F" ? day.maxtempF : day.maxtempC,
        })).slice(0, 7);
        setDailyForecast(list);

      } catch (err) {
        setError("Could not fetch weather. Try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather(city);
  }, [city, unit]);

  function submitSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setCity(query.trim());
    const next = [query.trim(), ...recent.filter((r) => r.toLowerCase() !== query.trim().toLowerCase())].slice(0, 6);
    setRecent(next);
    localStorage.setItem("recentCities", JSON.stringify(next));
  }

  function clearQuery() {
    setQuery("");
  }

  function useGeolocation() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coord = `${latitude},${longitude}`;
        setCity(coord);
        setQuery("");
      },
      () => {
        setError("Could not get your location.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function toggleFavorite(targetCity) {
    const name = typeof targetCity === "string" ? targetCity : city;
    const exists = favorites.some((c) => c.toLowerCase() === String(name).toLowerCase());
    const next = exists
      ? favorites.filter((c) => c.toLowerCase() !== String(name).toLowerCase())
      : [String(name), ...favorites];
    setFavorites(next);
    localStorage.setItem("favoriteCities", JSON.stringify(next));
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="title">🌦 Weather App</div>
          <div className="header-actions">
            <button className="btn secondary small" onClick={() => setUnit(unit === "C" ? "F" : "C")}>
              {unit === "C" ? "°F" : "°C"}
            </button>
            <button className="btn small" onClick={useGeolocation}>Use my location</button>
            <div className="favorite-wrap">
              <button className="btn small" onClick={() => toggleFavorite(city)}>
                {favorites.some((c) => c.toLowerCase() === String(city).toLowerCase()) ? "★ Favorited" : "☆ Favorite"}
              </button>
            </div>
          </div>
        </header>

        <form className="search-form" onSubmit={submitSearch}>
          <div className="search-wrapper card">
            <span className="search-icon"></span>
            <input
              className="search-input"
              type="text"
              placeholder="SEARCH THE WHOLE WEATHER"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="search-actions">
              {query && (
                <button type="button" className="clear-btn" onClick={clearQuery} aria-label="Clear">✕</button>
              )}
              <button className="btn small" type="submit">Search</button>
            </div>
          </div>
        </form>

        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">LOADING</div>}

        {!loading && weather && (
          <div className="grid">
            <section className="current">
              <div className="card">
                <div className="card-title">Current Weather</div>
                <div className="current-layout">
                  <WeatherCard city={city} weather={weather} unit={unit} />
                </div>
              </div>

              <div className="stats">
                <div className="stat-card">
                  <div className="stat-label">Visibility</div>
                  <div className="stat-value">{weather.current_condition?.[0]?.visibility || "N/A"} km</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Pressure</div>
                  <div className="stat-value">{weather.current_condition?.[0]?.pressure || "N/A"} mb</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">UV Index</div>
                  <div className="stat-value">{weather.current_condition?.[0]?.uvIndex || "N/A"}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Precipitation</div>
                  <div className="stat-value">{weather.current_condition?.[0]?.precipMM || "0"} mm</div>
                </div>
              </div>

              {weather.current_condition?.[0] && (
                <div className="card">
                  <div className="card-title">Weather Details</div>
                  <div className="details-grid">
                    <div className="detail-card">
                      <div className="detail-label">Wind Direction</div>
                      <div className="detail-value">{weather.current_condition[0].winddir16Point || "N/A"}</div>
                    </div>
                    <div className="detail-card">
                      <div className="detail-label">Cloud Cover</div>
                      <div className="detail-value">{weather.current_condition[0].cloudcover || "N/A"}%</div>
                    </div>
                    <div className="detail-card">
                      <div className="detail-label">Observation Time</div>
                      <div className="detail-value">{weather.current_condition[0].observation_time || "N/A"}</div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <aside className="forecast">
              <div className="card">
                <div className="card-title">3-Day Forecast</div>
                <div className="forecast-list">
                  {dailyForecast.map((d) => (
                    <div key={d.date} className="forecast-item">
                      <div>
                        <div className="forecast-day">{new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}</div>
                        <div className="forecast-date">{new Date(d.date).toLocaleDateString()}</div>
                      </div>
                      <div className="forecast-temp">
                        {unit === "C"
                          ? `${d.min}°C / ${d.max}°C`
                          : `${d.min}°F / ${d.max}°F`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!!favorites.length && (
                <div className="card">
                  <div className="card-title">Favorites</div>
                  <div className="recent">
                    {favorites.map((f) => (
                      <button key={f} type="button" className="chip" onClick={() => { setCity(f); setQuery(""); }}>{f}</button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        <footer className="footer">.......... ANALYSIS BY M.SAAD AKRAM WEATHER APP ...........</footer>
      </div>
    </div>
  );
}

export default App;
