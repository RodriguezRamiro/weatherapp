document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();

    // Automatically fetch weather for current location
    getWeatherForCurrentLocation();
});

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('themeToggle').checked = true;
    }
}

function getWeatherForCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            error => {
                console.warn("Geolocation denied or unavailable, fallback to manual search.");
            }
        );
    } else {
        console.warn("Geolocation not supported, fallback to manual search.");
    }
}

async function fetchWeatherByCoords(lat, lon) {
    const apiKey = '25a5978df372e91f66094ac754b3eceb';  // Replace with your actual API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    showSpinner(true);
    clearWeatherDisplay();

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch weather for your location");
        }

        const data = await response.json();
        displayWeather(data);
        updateBackground(data.weather[0].main);
        fetchLocalTime(lat, lon);
    } catch (error) {
        document.getElementById('weatherDisplay').innerHTML = `<p class="error">${error.message}</p>`;
    } finally {
        showSpinner(false);
    }
}

async function getWeather() {
    const city = document.getElementById('cityInput').value;
    const apiKey = '25a5978df372e91f66094ac754b3eceb';  // Replace with your actual key

    if (!city) {
        alert("Please enter a city name");
        return;
    }

    showSpinner(true);
    clearWeatherDisplay();

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();
        displayWeather(data);
        updateBackground(data.weather[0].main);
        fetchLocalTime(data.coord.lat, data.coord.lon);
    } catch (error) {
        document.getElementById('weatherDisplay').innerHTML = `<p class="error">${error.message || 'Failed to fetch weather data'}</p>`;
    } finally {
        showSpinner(false);
    }
}

function displayWeather(data) {
    const weatherDisplay = document.getElementById('weatherDisplay');

    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    weatherDisplay.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img class="weather-icon" src="${iconUrl}" alt="${data.weather[0].description}">
        <p>${data.weather[0].main} - ${data.weather[0].description}</p>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
        <p id="localTime">Loading local time...</p>
    `;
}

async function fetchLocalTime(lat, lon) {
    const apiKey = '25a5978df372e91f66094ac754b3eceb';  // Same API key
    const timezoneUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
        const response = await fetch(timezoneUrl);
        if (!response.ok) {
            throw new Error("Could not fetch local time");
        }

        const data = await response.json();
        const timezoneOffset = data.timezone_offset;

        const localTime = new Date(Date.now() + timezoneOffset * 1000);
        const formattedTime = localTime.toLocaleTimeString();

        document.getElementById('localTime').innerText = `Local Time: ${formattedTime}`;
    } catch (error) {
        document.getElementById('localTime').innerText = "Local Time: Unavailable";
    }
}

function updateBackground(weatherCondition) {
    let background = '';

    switch (weatherCondition.toLowerCase()) {
        case 'clear':
            background = 'linear-gradient(to bottom, #87CEFA, #f7b733)';
            break;
        case 'clouds':
            background = 'linear-gradient(to bottom, #B0C4DE, #778899)';
            break;
        case 'rain':
            background = 'linear-gradient(to bottom, #5f9ea0, #4682b4)';
            break;
        case 'thunderstorm':
            background = 'linear-gradient(to bottom, #4b0082, #000000)';
            break;
        case 'snow':
            background = 'linear-gradient(to bottom, #E0FFFF, #FFFFFF)';
            break;
        case 'mist':
        case 'haze':
            background = 'linear-gradient(to bottom, #C0C0C0, #696969)';
            break;
        default:
            background = 'linear-gradient(to bottom, #87CEEB, #FFFFFF)';
    }

    document.body.style.background = background;
}

function showSpinner(visible) {
    document.getElementById('spinner').style.display = visible ? 'block' : 'none';
}

function clearWeatherDisplay() {
    document.getElementById('weatherDisplay').innerHTML = '';
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}
