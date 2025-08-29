import React from "react";
import "./WeatherCard.css";

function WeatherCard({ city, weather, unit = "C" }) {
  const current = weather.current_condition?.[0] || {};
  const temp = unit === "C" ? `${current.temp_C}°C` : `${current.temp_F}°F`;
  const condition = current.weatherDesc?.[0]?.value || "-";
  const wind = `${current.windspeedKmph} km/h`;
  const humidity = current.humidity || "-";
  const feelsLike = unit === "C" ? `${current.FeelsLikeC}°C` : `${current.FeelsLikeF}°F`;

  const getWeatherIcon = (cond) => {
    const lower = (cond || "").toLowerCase();
    if (lower.includes("sun") || lower.includes("clear")) return "☀️";
    if (lower.includes("cloud") || lower.includes("overcast")) return "☁️";
    if (lower.includes("rain") || lower.includes("drizzle")) return "🌧️";
    if (lower.includes("snow")) return "❄️";
    if (lower.includes("thunder") || lower.includes("storm")) return "⛈️";
    if (lower.includes("fog") || lower.includes("mist")) return "🌫️";
    return "🌤️";
  };

  return (
    <div className="weather-card">
      <div className="weather-main">
        <div style={{ flex: 1 }}>
          <h2 className="weather-title">
            {typeof city === "string" && city.includes(",") ? "Your location" : city}
          </h2>

          <div className="weather-temp">{temp}</div>

          <div className="weather-condition">
            <span className="weather-condition-icon">{getWeatherIcon(condition)}</span>
            <span style={{ fontWeight: 500 }}>{condition}</span>
          </div>
        </div>

        <div className="weather-side">
          <div className="info-pill info-pill--blue">
            <div className="info-pill-label">Feels like</div>
            <div className="info-pill-value">{feelsLike}</div>
          </div>
{/*hello*/}
          <div className="info-pill info-pill--purple">
            <div className="info-pill-label">Humidity</div>
            <div className="info-pill-value">{humidity}%</div>
          </div>
        </div>
      </div>

      <div className="wind-card">
        <div className="wind-icon">💨</div>
        <div style={{ flex: 1 }}>
          <div className="wind-title">Wind Speed</div>
          <div className="wind-value">{wind}</div>
        </div>
        <div className="decorative-bubble" />
      </div>
    </div>
  );
}

export default WeatherCard;
