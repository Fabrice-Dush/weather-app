import React from "react";

import { getWeatherIcon, convertToFlag, formatDay } from "./helpers";

class App extends React.Component {
  state = {
    location: "",
    isLoading: false,
    error: "",
    displayLocation: "",
    weather: {},
  };

  fetchWeatherData = async () => {
    try {
      if (this.state.location.trim().length < 2) {
        return this.setState({ weather: {}, isLoading: false, error: "" });
      }

      this.setState({ isLoading: true, error: "" });

      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();
      console.log(geoData);

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);
      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      console.log(weatherData.daily);
      this.setState({ weather: weatherData.daily });
    } catch (err) {
      console.error(err);
      this.setState({ error: err.message });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  setLocation = (e) => this.setState({ location: e.target.value });

  //? useEffect(function() {}, [])
  componentDidMount() {
    this.setState({ location: localStorage.getItem("location") || "" });
  }

  //? useEffect(function(){}, [location])
  componentDidUpdate(prevProp, prevState) {
    if (this.state.location !== prevState.location) {
      this.fetchWeatherData();
      localStorage.setItem("location", this.state.location);
    }
  }

  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>
        <Input
          location={this.state.location}
          onChangeLocation={this.setLocation}
        />
        {this.state.error && <p className="error">{this.state.error}</p>}
        {this.state.isLoading && <p className="loader">Loading...</p>}
        {this.state.weather?.time &&
          !this.state.isLoading &&
          !this.state.error &&
          this.state.location && (
            <Weather
              displayLocation={this.state.displayLocation}
              weather={this.state.weather}
            />
          )}
      </div>
    );
  }
}

class Weather extends React.Component {
  //? similar to the clean up function in useEffect
  componentWillUnmount() {
    console.log("Component unmounted sir");
  }

  render() {
    const { weathercode, temperature_2m_min, temperature_2m_max, time } =
      this.props.weather;

    const { displayLocation } = this.props;

    return (
      <>
        <h2>Weather {displayLocation}</h2>
        <ul className="weather">
          {time.map((time, idx) => {
            return (
              <Day
                isToday={idx === 0}
                code={weathercode.at(idx)}
                min={temperature_2m_min.at(idx)}
                max={temperature_2m_max.at(idx)}
                time={time}
                key={idx}
              />
            );
          })}
        </ul>
      </>
    );
  }
}

class Day extends React.Component {
  render() {
    const { time: date, code, min, max, isToday } = this.props;
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
}

class Input extends React.Component {
  render() {
    return (
      <input
        type="text"
        placeholder="Enter some location..."
        value={this.props.location}
        onChange={this.props.onChangeLocation}
      />
    );
  }
}

export default App;
