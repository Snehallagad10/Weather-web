const apiKey = "276487c1933a3a06fdff671fda2c9308"; // OpenWeather API Key
const WEATHER_API_ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_API_ENDPOINT = "https://api.openweathermap.org/data/2.5/forecast";
const GEO_API_ENDPOINT = "http://api.openweathermap.org/geo/1.0/direct";

document.addEventListener("DOMContentLoaded", () => {
    const searchBox = document.getElementById("search-box");
    const searchButton = document.querySelector(".search-btn");
    const weatherCardsDiv = document.querySelector(".week-forecast");

    const uvElement = document.querySelector(".uv-index");
    const windSpeedElement = document.querySelector(".wind-speed");
    const humidityElement = document.querySelector(".humidity");
    const visibilityElement = document.querySelector(".visibility");
    const airQualityElement = document.querySelector(".air-quality");

    async function getWeather(city) {
        if (!city) return;
        
        try {
            const weatherResponse = await fetch(`${WEATHER_API_ENDPOINT}?q=${city}&units=metric&appid=${apiKey}`);
            const weatherData = await weatherResponse.json();
            if (weatherData.cod !== 200) return;
            
            document.getElementById("temperature").textContent = `${weatherData.main.temp}°C`;
            document.getElementById("day-time").textContent = new Date().toLocaleString();
            document.getElementById("weather-description").textContent = weatherData.weather[0].description;
            document.getElementById("rain-chance").textContent = `Rain - ${weatherData.clouds.all}%`;
            document.querySelector(".location span").textContent = `${weatherData.name}, ${weatherData.sys.country}`;
            document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

            windSpeedElement.textContent = `${weatherData.wind.speed} km/h`;
            humidityElement.textContent = `${weatherData.main.humidity}%`;
            visibilityElement.textContent = `${(weatherData.visibility / 1000).toFixed(1)} km`;
            getAdditionalWeatherData(weatherData.coord.lat, weatherData.coord.lon);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    }

    async function getAdditionalWeatherData(lat, lon) {
        try {
            const airQualityResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
            const airQualityData = await airQualityResponse.json();
            airQualityElement.textContent = `${airQualityData.list[0].main.aqi} - ${["Good", "Fair", "Moderate", "Poor", "Very Poor"][airQualityData.list[0].main.aqi - 1]}`;
            
            const oneCallResponse = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=metric&appid=${apiKey}`);
            const oneCallData = await oneCallResponse.json();
            uvElement.textContent = oneCallData.current.uvi;
        } catch (error) {
            console.error("Error fetching additional data:", error);
        }
    }

    async function getWeatherDetails(cityName) {
        try {
            const response = await fetch(`${FORECAST_API_ENDPOINT}?q=${cityName}&appid=${apiKey}`);
            const data = await response.json();
            if (data.cod !== "200") return alert("City not found. Please try again.");
            
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                const forecastHour = new Date(forecast.dt_txt).getHours();
                if (!uniqueForecastDays.includes(forecastDate) && forecastHour === 12) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });
            
            weatherCardsDiv.innerHTML = "";
            fiveDaysForecast.forEach(weatherItem => {
                weatherCardsDiv.insertAdjacentHTML("beforeend", `
                    <div class="day-card">
                    
                        <p>${new Date(weatherItem.dt_txt).toLocaleDateString("en-US", { weekday: "long" })}</p>
                        
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather icon">
                        <p>${(weatherItem.main.temp - 273.15).toFixed(2)}°C</p>
                    </div>
                `);
            });
        } catch (error) {
            alert("An error occurred while fetching the weather forecast!");
        }
    }

    searchBox?.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const city = searchBox.value.trim();
            getWeather(city);
            getWeatherDetails(city);  // This line was missing for the "Enter" event
        }
    });
    searchButton?.addEventListener("click", () => {
        const city = searchBox.value.trim();
        if (city) {
            getWeather(city);
            getWeatherDetails(city);
        }
    });
    
    
});