import React, { useState, useEffect ,useMemo} from "react";
import axios from "axios";
import "./App.css";

const API_KEY = "ae6817879f3a17a2dc9b6698ad2f1eaa"; // your OpenWeather key

function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  const fetchWeather = async (cityName) => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      setWeather(res.data);
    } catch (err) {
      alert("City not found!");
    }
  };

  const fetchForecast = async (cityName) => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const daily = res.data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );
      setForecast(daily);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = () => {
    if (!city) return;
    fetchWeather(city);
    fetchForecast(city);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          setWeather(res.data);
          setCity(res.data.name);
          fetchForecast(res.data.name);
        } catch (err) {
          console.error(err);
        }
      },
      (err) => console.warn("Location access denied", err)
    );
  }, []);

  const getCardClass = () => {
    if (!weather) return "default-card";
    const condition = weather.weather[0].main.toLowerCase();

    if (condition.includes("clear")) return "sunny-card";
    if (condition.includes("cloud")) return "cloudy-card";
    if (condition.includes("rain")) return "rainy-card";
    if (condition.includes("snow")) return "snowy-card";
    if (condition.includes("storm")) return "storm-card";
    if (condition.includes("mist") || condition.includes("fog"))
      return "foggy-card";
    return "default-card";
  };


  return (
    <div className="app">
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {weather && (
        <div className={`weather-card ${getCardClass()}`}>
          <div className="card-top">
            <h2>{weather.name}</h2>
            <p>
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="card-middle">
            <p className="temp">{Math.round(weather.main.temp)}°C</p>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
          </div>
          <div className="card-bottom">
            <p>{weather.weather[0].description}</p>
            <p>Humidity: {weather.main.humidity}%</p>
          </div>
        </div>
      )}

     
      {forecast.length > 0 && (
        <div className="forecast-container">
          {forecast.map((day, index) => (
            <div className="forecast-card" key={index}>
              <p>
                {new Date(day.dt_txt).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </p>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                alt={day.weather[0].description}
              />
              <p>{Math.round(day.main.temp)}°C</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WeatherApp;
