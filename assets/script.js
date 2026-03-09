const apiKey = '1e9cbae69e5062a0d8f5e832145475fa';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=';

const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const weatherInfoDiv = document.getElementById('weatherInfo');
const forecastDiv = document.getElementById('five-day-forecast');
const buttonContainer = document.getElementById('buttonContainer');
const searchErrorDiv = document.getElementById('search-error');
const clearStorageButton = document.getElementById('clear-storage');

function getStoredCities() {
  const storedCities = localStorage.getItem('storedData');
  return storedCities ? JSON.parse(storedCities) : [];
}

function saveStoredCities(cities) {
  localStorage.setItem('storedData', JSON.stringify(cities));
}

function addCityToStorage(city) {
  const storedCities = getStoredCities();
  const normalizedCity = city.toLowerCase();

  const alreadyExists = storedCities.some(
    (storedCity) => storedCity.toLowerCase() === normalizedCity
  );

  if (!alreadyExists) {
    storedCities.unshift(city);

    if (storedCities.length > 8) {
      storedCities.pop();
    }

    saveStoredCities(storedCities);
  }
}

function renderCityButtons() {
  const storedCities = getStoredCities();
  buttonContainer.innerHTML = '';

  storedCities.forEach((city) => {
    const button = document.createElement('button');
    button.textContent = city;
    button.type = 'button';
    button.className = 'history-btn';
    button.addEventListener('click', function () {
      fetchWeather(city, false);
    });

    buttonContainer.appendChild(button);
  });
}

function showError(message) {
  searchErrorDiv.textContent = message;
}

function clearError() {
  searchErrorDiv.textContent = '';
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function createWeatherIcon(iconCode, description) {
  const icon = document.createElement('img');
  icon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  icon.alt = description;
  return icon;
}

function renderCurrentWeather(data) {
  const cityName = data.city.name;
  const current = data.list[0];
  const temp = Math.round(current.main.temp - 273.15);
  const windSpeed = current.wind.speed;
  const humidity = current.main.humidity;
  const description = current.weather[0].description;
  const iconCode = current.weather[0].icon;

  weatherInfoDiv.innerHTML = '';

  const currentCard = document.createElement('div');
  currentCard.className = 'current-weather-card';

  const heading = document.createElement('div');
  heading.className = 'current-weather-heading';

  const title = document.createElement('h2');
  title.textContent = `${cityName} (${formatDate(current.dt_txt)})`;

  const icon = createWeatherIcon(iconCode, description);

  heading.appendChild(title);
  heading.appendChild(icon);

  const details = document.createElement('div');
  details.innerHTML = `
    <p><strong>Temperature:</strong> ${temp}°C</p>
    <p><strong>Wind:</strong> ${windSpeed} MPH</p>
    <p><strong>Humidity:</strong> ${humidity}%</p>
    <p><strong>Conditions:</strong> ${description}</p>
  `;

  currentCard.appendChild(heading);
  currentCard.appendChild(details);
  weatherInfoDiv.appendChild(currentCard);
}

function renderForecast(data) {
  forecastDiv.innerHTML = '';

  const dailyForecasts = data.list.filter((forecast) =>
    forecast.dt_txt.includes('12:00:00')
  );

  dailyForecasts.forEach((forecast) => {
    const card = document.createElement('div');
    card.className = 'forecast-card';

    const date = formatDate(forecast.dt_txt);
    const temp = Math.round(forecast.main.temp - 273.15);
    const windSpeed = forecast.wind.speed;
    const humidity = forecast.main.humidity;
    const description = forecast.weather[0].description;
    const iconCode = forecast.weather[0].icon;

    const title = document.createElement('h3');
    title.textContent = date;

    const icon = createWeatherIcon(iconCode, description);

    const details = document.createElement('div');
    details.innerHTML = `
      <p><strong>Temp:</strong> ${temp}°C</p>
      <p><strong>Wind:</strong> ${windSpeed} MPH</p>
      <p><strong>Humidity:</strong> ${humidity}%</p>
      <p><strong>Conditions:</strong> ${description}</p>
    `;

    card.appendChild(title);
    card.appendChild(icon);
    card.appendChild(details);
    forecastDiv.appendChild(card);
  });
}

function fetchWeather(city, saveToHistory = true) {
  clearError();

  fetch(`${forecastApiUrl}${encodeURIComponent(city)}&appid=${apiKey}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('City not found. Please try again.');
      }
      return response.json();
    })
    .then((data) => {
      renderCurrentWeather(data);
      renderForecast(data);

      if (saveToHistory) {
        addCityToStorage(data.city.name);
        renderCityButtons();
      }

      cityInput.value = '';
    })
    .catch((error) => {
      weatherInfoDiv.innerHTML = '';
      forecastDiv.innerHTML = '';
      showError(error.message);
    });
}

function handleSearch(event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showError('Please enter a city name.');
    return;
  }

  fetchWeather(city, true);
}

function clearHistory() {
  localStorage.removeItem('storedData');
  buttonContainer.innerHTML = '';
}

searchButton.addEventListener('click', handleSearch);

if (clearStorageButton) {
  clearStorageButton.textContent = 'Clear History';
  clearStorageButton.addEventListener('click', function (event) {
    event.preventDefault();
    clearHistory();
  });
}

renderCityButtons();