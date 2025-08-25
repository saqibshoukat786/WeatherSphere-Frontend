const API_KEY = '445c1efb4b373e782b2d011effc906dd';
const CURRENT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// Get references to all the HTML elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const currentWeatherDiv = document.getElementById('currentWeather');
const defaultStateDiv = document.getElementById('defaultState');
const forecastDiv = document.getElementById('forecast');

// Current Weather elements
const cityNameEl = document.getElementById('cityName');
const currentDateEl = document.getElementById('currentDate');
const weatherIconEl = document.getElementById('weatherIcon');
const currentTempEl = document.getElementById('currentTemp');
const weatherDescEl = document.getElementById('weatherDesc');
const windSpeedEl = document.getElementById('windSpeed');
const humidityEl = document.getElementById('humidity');
const feelsLikeEl = document.getElementById('feelsLike');
const pressureEl = document.getElementById('pressure');

// --- Functions ---

// Function to show/hide sections
function showSection(section) {
    currentWeatherDiv.classList.add('hidden');
    loadingDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    defaultStateDiv.classList.add('hidden');

    if (section === 'weather') {
        currentWeatherDiv.classList.remove('hidden');
    } else if (section === 'loading') {
        loadingDiv.classList.remove('hidden');
    } else if (section === 'error') {
        errorDiv.classList.remove('hidden');
    } else {
        defaultStateDiv.classList.remove('hidden');
    }
}

// Function to fetch weather data for a given city
async function fetchWeather(city) {
    showSection('loading');

    try {
        // Fetch current weather
        const weatherResponse = await fetch(`${CURRENT_WEATHER_API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const weatherData = await weatherResponse.json();

        // Fetch 5-day forecast
        const forecastResponse = await fetch(`${FORECAST_API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();

        if (weatherData.cod === '404' || forecastData.cod === '404') {
            throw new Error('City not found');
        }

        displayCurrentWeather(weatherData);
        displayForecast(forecastData);
        showSection('weather');

        // Smooth scroll to the weather section
        document.getElementById('weather').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error fetching weather data:', error);
        showSection('error');
    }
}

// Function to fetch weather data using geolocation
async function fetchWeatherByLocation(lat, lon) {
    showSection('loading');

    try {
        // Fetch current weather
        const weatherResponse = await fetch(`${CURRENT_WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const weatherData = await weatherResponse.json();

        // Fetch 5-day forecast
        const forecastResponse = await fetch(`${FORECAST_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();

        if (weatherData.cod === '404' || forecastData.cod === '404') {
            throw new Error('Location not found');
        }

        displayCurrentWeather(weatherData);
        displayForecast(forecastData);
        showSection('weather');

        // Smooth scroll to the weather section
        document.getElementById('weather').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error fetching weather data:', error);
        showSection('error');
    }
}

// Function to display current weather data
function displayCurrentWeather(data) {
    cityNameEl.textContent = data.name + ', ' + data.sys.country;
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    currentTempEl.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDescEl.textContent = data.weather[0].description;
    windSpeedEl.textContent = `${Math.round(data.wind.speed)} km/h`;
    humidityEl.textContent = `${data.main.humidity}%`;
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
    pressureEl.textContent = `${data.main.pressure} hPa`;
}

// Function to display 5-day forecast data
function displayForecast(data) {
    forecastDiv.innerHTML = ''; // Clear previous forecast cards

    // Filter to get one forecast per day (around noon)
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const icon = forecast.weather[0].icon;
        const temp = Math.round(forecast.main.temp);

        const card = `
                    <div class="forecast-card text-center p-4 rounded-xl shadow-md flex-shrink-0">
                        <h4 class="font-semibold text-gray-800">${day}</h4>
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Forecast icon" class="w-12 h-12 mx-auto mt-2 mb-2">
                        <p class="text-lg font-bold text-gray-800">${temp}°C</p>
                        <p class="text-sm text-gray-600 capitalize">${forecast.weather[0].description}</p>
                    </div>
                `;
        forecastDiv.innerHTML += card;
    });
}

// --- Event Listeners ---

// Search button click
searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

// Search input 'Enter' key press
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    }
});

// Geolocation button click
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherByLocation(lat, lon);
            },
            (error) => {
                console.error('Geolocation error:', error);
                // Display a user-friendly message for geolocation error
                errorDiv.textContent = 'Geolocation is not supported or was denied. Please enter a city name.';
                showSection('error');
            }
        );
    } else {
        errorDiv.textContent = 'Geolocation is not supported by your browser.';
        showSection('error');
    }
});

// Popular city cards click listeners
document.querySelectorAll('.city-card').forEach(card => {
    card.addEventListener('click', (e) => {
        const city = e.currentTarget.dataset.city;
        fetchWeather(city);
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// NEW: Intersection Observer for animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2 // Trigger when 20% of the element is visible
};

const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Element is in view, add the 'animate' class
            entry.target.classList.add('animate');
            // Stop observing once animated
            observer.unobserve(entry.target);
        }
    });
};

// Create a new observer instance
const observer = new IntersectionObserver(animateOnScroll, observerOptions);

// Target elements for animation
const animatedElements = document.querySelectorAll('.fade-in, .slide-in-up, .pop-in');

animatedElements.forEach(el => {
    observer.observe(el);
});