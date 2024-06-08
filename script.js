const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const currentWeatherItemsEl = document.getElementById("current-weather-items");
const timezone = document.getElementById("time-zone");
const countryEl = document.getElementById("country");
const weatherForecastEl = document.getElementById("weather-forecast");
const currentTempEl = document.getElementById("current-temp");
// const searchCity = document.querySelector("#city-input").value;
// searchCity.innerHTML="karachi";

// document.querySelector(".city").innerHTML = searchCity;

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const API_KEY = "49cc8c821cd2aff9af04c9f98c36eb74";
const citySearch = ()=>{
  const city = document.getElementById("city-input").value;
  document.querySelector(".city").innerHTML = city;
  getCoordinates(city);
}
document.getElementById("search-button").addEventListener("click", () => {
  citySearch();
  // const city = document.getElementById("city-input").value;
  // document.querySelector(".city").innerHTML = city;
  // getCoordinates(city);
});

// Get weather for current location by default
getCurrentLocationWeather();

function getCurrentLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Math.round(position.coords.latitude);
        const longitude = Math.round(position.coords.longitude);
        getWeatherData(latitude, longitude);
      },
      (error) => {
        alert(
          "Unable to retrieve your location. Make sure location services are enabled."
        );
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function getCoordinates(city) {
  fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.length === 0) {
        alert("City not found");
        return;
      }
      const lat = data[0].lat;
      const lon = data[0].lon;
      getWeatherData(lat, lon);
    });
}

function getWeatherData(lat, lon) {
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${API_KEY}`
  )
    .then((response) => response.json())
    .then((data) => {
      showWeatherData(data);
    });
}

function showWeatherData(data) {
  let {
    humidity,
    pressure,
    wind_speed,
    temp,
    feels_like,
    visibility,
    uvi,
    dew_point,
  } = data.current;
  console.log(data.current);
  let timezoneOffset = data.timezone_offset;
  let currentCity = data.timezone;

  timezone.innerHTML = currentCity;
  countryEl.innerHTML =
    Math.round(data.lat) + "N " + Math.round(data.lon) + "E";

  const currentTemp = Math.round(data.current.temp);
  const highTemp = Math.round(data.daily[0].temp.max);
  const lowTemp = Math.round(data.daily[0].temp.min);

  document.querySelector("#current-temp-c").innerHTML = `
  <div class="today-weather">current temperature:${currentTemp} &#176;C</div>
  <div class="high-low">High ${highTemp} &#176;C - Low ${lowTemp} &#176;C</div>`;

  currentWeatherItemsEl.innerHTML = `
    <div class="weather-item">
        <div>Humidity</div>
        <div>${Math.round(humidity)}%</div>
    </div>
    <div class="weather-item">
        <div>Pressure</div>
        <div>${Math.round(pressure)} hPa</div>
    </div>
    <div class="weather-item">
        <div>Wind Speed</div>
        <div>${Math.round(wind_speed)} m/s</div>
    </div>
    <div class="weather-item">
        <div>Feels Like</div>
        <div>${Math.round(feels_like)}&#176;C</div>
    </div>
    <div class="weather-item">
        <div>Visibility</div>
        <div>${Math.round(visibility / 1000)} km</div>
    </div>
    <div class="weather-item">
        <div>UV Index</div>
        <div>${Math.round(uvi)}</div>
    </div>
    <div class="weather-item">
        <div>Dew Point</div>
        <div>${Math.round(dew_point)}&#176;C</div>
    </div>`;

  displayHourlyWeather(data.hourly, timezoneOffset);
  displayDailyWeather(data.daily, timezoneOffset);

  // updateTemperature(currentTemp, highTemp, lowTemp);
}

function displayHourlyWeather(hourlyData, timezoneOffset) {
  let hourlyForecast = "";
  hourlyData.slice(0, 24).forEach((hour) => {
    hourlyForecast += `
        <div class="weather-forecast-item">
            <div class="day">${new Date(
              (hour.dt + timezoneOffset) * 1000
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}</div>
            <img src="http://openweathermap.org/img/wn/${
              hour.weather[0].icon
            }@2x.png" alt="weather icon" class="w-icon">
            <div class="h-temp">Temp - ${Math.round(hour.temp)}&#176;C</div>
        </div>`;
  });
  currentTempEl.innerHTML = hourlyForecast;
}

function displayDailyWeather(dailyData, timezoneOffset) {
  let dailyForecast = "";
  dailyData.slice(1, 7).forEach((day, idx) => {
    dailyForecast += `
        <div class="weather-forecast-item" data-day-index="${
          idx + 1
        }" style="display: flex; flex-direction: column; align-items: center;">
            <div class="day">${new Date(
              (day.dt + timezoneOffset) * 1000
            ).toLocaleDateString([], {
              weekday: "short",
              day: "numeric",
            })}</div>
            <img src="http://openweathermap.org/img/wn/${
              day.weather[0].icon
            }@2x.png" alt="weather icon" class="w-icon">
            <div class="temp">Night - ${Math.round(day.temp.night)}&#176;C</div>
            <div class="temp">Day - ${Math.round(day.temp.day)}&#176;C</div>
            <button class="hourly-button">Hourly Info</button>
        </div>`;
  });
  weatherForecastEl.innerHTML = dailyForecast;

  document.querySelectorAll(".hourly-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const dayIndex = event.currentTarget
        .closest(".weather-forecast-item")
        .getAttribute("data-day-index");
      displaySelectedDayWeather(dailyData[dayIndex], timezoneOffset);
    });
  });
}

function displaySelectedDayWeather(dayData, timezoneOffset) {
  const dayTimestamp = dayData.dt;
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    ...dayData,
    dt: dayTimestamp + i * 3600,
  }));

  let hourlyForecast = "";
  hourlyData.forEach((hour) => {
    hourlyForecast += `
        <div class="weather-forecast-item">
            <div class="day">${new Date(
              (hour.dt + timezoneOffset) * 1000
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}</div>
            <img src="http://openweathermap.org/img/wn/${
              hour.weather[0].icon
            }@2x.png" alt="weather icon" class="w-icon">
            <div class="temp">Temp - ${Math.round(hour.temp.day)}&#176;C</div>
        </div>`;
  });

  currentTempEl.innerHTML = hourlyForecast;
}

setInterval(() => {
  const time = new Date();
  const month = time.getMonth();
  const date = time.getDate();
  const day = time.getDay();
  const hour = time.getHours();
  const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
  const minutes = time.getMinutes();
  const ampm = hour >= 12 ? "PM" : "AM";

  timeEl.innerHTML =
    (hoursIn12HrFormat < 10 ? "0" + hoursIn12HrFormat : hoursIn12HrFormat) +
    ":" +
    (minutes < 10 ? "0" + minutes : minutes);
  document.querySelector("#amPm").innerHTML = ampm;
  dateEl.innerHTML = days[day] + ", " + date + " " + months[month];
}, 1000);

document.addEventListener("keyup" , (event) => {
  if (event.key === "Enter") {
    citySearch();
  }
})