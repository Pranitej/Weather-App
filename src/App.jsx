import { useState, useEffect } from "react";
import "./App.css";

const API_KEY = "7fa6e087d9295159441f2757dea937ef";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("metric");
  const [background, setBackground] = useState("default");

  const fetchWeather = async () => {
    setError("");
    setLoading(true);
    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&units=${unit}&appid=${API_KEY}`
      );
      const weatherData = await weatherRes.json();

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city.trim()}&units=${unit}&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();

      if (weatherData.cod === 200 && forecastData.cod === "200") {
        setWeather(weatherData);
        const dailyForecast = forecastData.list.filter((item) =>
          item.dt_txt.includes("12:00:00")
        );
        setForecast(dailyForecast);

        // Set background based on condition
        const main = weatherData.weather[0].main.toLowerCase();
        const description = weatherData.weather[0].description.toLowerCase();

        if (main.includes("clear")) setBackground("sunny");
        else if (main.includes("cloud") || description.includes("cloud"))
          setBackground("cloudy");
        else if (main.includes("rain") || description.includes("rain"))
          setBackground("rainy");
        else if (main.includes("snow") || description.includes("snow"))
          setBackground("snowy");
        else setBackground("default");
      } else {
        setError(weatherData.message || "City not found");
        setWeather(null);
        setForecast([]);
        setBackground("default");
      }
    } catch (err) {
      setError("Error fetching data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) fetchWeather();
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === "metric" ? "imperial" : "metric"));
  };

  useEffect(() => {
    if (weather) {
      fetchWeather();
    }
    // eslint-disable-next-line
  }, [unit]);

  return (
    <div className={`app-container ${background}`}>
      <div className="container text-center py-5">
        <h1 className="mb-4 text-white text-shadow">🌤 Weather App</h1>
        <form
          className="d-flex justify-content-center mb-3"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            className="form-control me-2"
            style={{ width: "400px" }}
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoFocus
          />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>

        <div className="form-check form-switch d-flex justify-content-center mb-4">
          <input
            className="form-check-input me-2"
            type="checkbox"
            id="unitSwitch"
            checked={unit === "imperial"}
            onChange={toggleUnit}
          />
          <label className="form-check-label text-white" htmlFor="unitSwitch">
            {unit === "metric" ? "°C" : "°F"}
          </label>
        </div>

        {error && (
          <div
            className="alert alert-danger py-2 px-3 d-flex align-items-center gap-2"
            role="alert"
            style={{ maxWidth: "480px", margin: "0 auto" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              className="bi bi-exclamation-triangle-fill flex-shrink-0"
              viewBox="0 0 16 16"
              role="img"
              aria-label="Danger:"
            >
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.964 0L.165 13.233c-.457.778.091 1.767.982 1.767h13.707c.89 0 1.438-.99.982-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
            </svg>
            <div className="flex-grow-1">{error}</div>
          </div>
        )}
        {loading && (
          <div className="spinner-border text-light" role="status"></div>
        )}

        {weather && (
          <div
            className="glass-card mx-auto mt-3"
            style={{ maxWidth: "500px" }}
          >
            <div>
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt="weather icon"
                width="100"
              />
            </div>
            <h2>
              {weather.name}, {weather.sys.country}
            </h2>
            <h4>
              {weather.weather[0].main} - {weather.weather[0].description}
            </h4>

            {/* Small Info Cards */}
            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">🌡</div>
                <div>
                  {weather.main.temp}°{unit === "metric" ? "C" : "F"}
                </div>
                <small>Temperature</small>
              </div>

              <div className="info-card">
                <div className="info-icon">💧</div>
                <div>{weather.main.humidity}%</div>
                <small>Humidity</small>
              </div>

              <div className="info-card">
                <div className="info-icon">💨</div>
                <div>
                  {weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}
                </div>
                <small>Wind Speed</small>
              </div>
            </div>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="mt-5">
            <h3 className="text-white text-shadow mb-3">5-Day Forecast</h3>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              {forecast.map((day, index) => (
                <div className="forecast-card" key={index}>
                  <h6>
                    {new Date(day.dt_txt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </h6>
                  <div className="text-center">
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt="icon"
                      width="70"
                    />
                  </div>
                  <p className="mb-1">{day.weather[0].main}</p>
                  <p className="mb-0">
                    🌡 {day.main.temp.toFixed(1)}°{unit === "metric" ? "C" : "F"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
