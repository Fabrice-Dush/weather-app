import { useEffect, useState } from "react";
import { getWeatherIcon, convertToFlag, formatDay } from "./helpers";

function useLocalStorageState(initialState) {
  const [location, setLocation] = useState(function () {
    return localStorage.getItem("location") || initialState;
  });

  useEffect(
    function () {
      localStorage.setItem("location", location);
    },
    [location]
  );

  return [location, setLocation];
}

async function fetchData(url, signal) {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok)
      throw new Error(
        `Something went wrong while fetching data (${res.status})`
      );

    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

function App() {
  const [location, setLocation] = useLocalStorageState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [weather, setWeather] = useState({});
  const [displayLocation, setDisplayLocation] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchWeatherData() {
        try {
          setIsLoading(true);
          setError("");

          // 1) Getting location (geocoding)
          const geoData = await fetchData(
            `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
            controller.signal
          );

          if (!geoData.results) throw new Error("Location not found");
          console.log(geoData);

          const { latitude, longitude, timezone, name, country_code } =
            geoData.results.at(0);
          console.log(latitude, longitude, timezone);

          setDisplayLocation(`${name} ${convertToFlag(country_code)}`);

          // 2) Getting actual weather
          const weatherData = await fetchData(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`,
            controller.signal
          );
          console.log(weatherData.daily);

          setWeather(weatherData.daily);
          setIsLoading(false);
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
            setIsLoading(false);
          }
        }
      }

      if (location.trim().length < 2) {
        setWeather({});
        setIsLoading(false);
        setError("");
        setDisplayLocation("");
        return;
      }

      fetchWeatherData();

      //? clean up function
      return () => controller.abort();
    },
    [location]
  );

  return (
    <div className="app">
      <h1>Classy Weather</h1>
      <Input location={location} setLocation={setLocation} />

      {error && <p className="error">{error}</p>}
      {isLoading && <p className="loader">Loading...</p>}
      {weather?.time && !isLoading && !error && (
        <>
          <h2>Weather in {displayLocation}</h2>
          <Weather weather={weather} />
        </>
      )}
    </div>
  );
}

function Weather({ weather }) {
  const {
    temperature_2m_min: min,
    temperature_2m_max: max,
    weathercode,
    time,
  } = weather;

  return (
    <ul className="weather">
      {time.map((date, idx) => (
        <Day
          isToday={idx === 0}
          min={min.at(idx)}
          max={max.at(idx)}
          code={weathercode.at(idx)}
          date={date}
          key={idx}
        />
      ))}
    </ul>
  );
}

function Day({ min, max, code, date, isToday }) {
  return (
    <li className="day">
      <span>{getWeatherIcon(code)}</span>
      <p>{isToday ? "Today" : formatDay(date)}</p>
      <p>
        {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}</strong>&deg;
      </p>
    </li>
  );
}

function Input({ location, setLocation }) {
  return (
    <>
      <input
        type="text"
        placeholder="Enter some location..."
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
    </>
  );
}

export default App;
