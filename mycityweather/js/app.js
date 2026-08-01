
class WeatherApp {
  constructor() {
    this.apiKey = "a9a99539035529c845931aa9324b5949";
    this.baseUrl = "https://api.openweathermap.org/data/2.5";
    this.units = "metric";
    
    this.elements = {
      cityInput: document.getElementById("cityInput"),
      searchForm: document.getElementById("searchForm"),
      searchBtn: document.getElementById("searchBtn"),
      loader: document.getElementById("loader"),
      errorMsg: document.getElementById("errorMsg"),
      weatherInfo: document.getElementById("weatherInfo"),
      forecastContainer: document.getElementById("forecastContainer"),
      themeToggle: document.getElementById("themeToggle"),
      toastContainer: document.getElementById("toast-container"),
      recentSearches: document.getElementById("recentSearches"),
      recentList: document.getElementById("recentList"),
      lastUpdate: document.getElementById("lastUpdate")
    };

    
    this.state = {
      currentCity: null,
      recentCities: this.getRecentCities(),
      isLoading: false
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadDefaultCity();
    this.renderRecentSearches();
  }

  setupEventListeners() {
    this.elements.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const city = this.elements.cityInput.value.trim();
      if (city) this.searchCity(city);
    });

    this.elements.themeToggle.addEventListener("click", () => {
      this.toggleTheme();
    });

    // Click recent search
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("recent-item")) {
        this.searchCity(e.target.textContent.trim());
      }
    });
  }

  async searchCity(city) {
    if (this.state.isLoading) return;

    this.state.isLoading = true;
    this.showLoader();

    try {
      const weatherData = await this.fetchWeatherData(city);
      const forecastData = await this.fetchForecastData(city);

      this.updateUI(weatherData, forecastData);
      this.addRecentCity(city);
      this.showToast(`Weather loaded for ${weatherData.name}`, "success");
      
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.state.isLoading = false;
      this.hideLoader();
    }
  }

  async fetchWeatherData(city) {
    const response = await fetch(
      `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=${this.units}`
    );

    if (!response.ok) {
      throw new Error("City not found. Please try again.");
    }

    return await response.json();
  }

  async fetchForecastData(city) {
    const response = await fetch(
      `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=${this.units}`
    );

    return await response.json();
  }

  updateUI(weatherData, forecastData) {
    this.updateWeather(weatherData);
    this.updateForecast(forecastData);
    this.elements.weatherInfo.removeAttribute("hidden");
    this.elements.forecastContainer.removeAttribute("hidden");
  }

  updateWeather(data) {
    const {
      name,
      sys,
      main,
      weather,
      wind,
      clouds,
      visibility
    } = data;

    document.getElementById("cityName").textContent = 
      `${name}, ${sys.country}`;
    
    document.getElementById("dateTime").textContent = 
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    
    document.getElementById("temperature").textContent = 
      `${Math.round(main.temp)}°C`;
    
    document.getElementById("weatherDesc").textContent = 
      weather[0].description;
    
    document.getElementById("humidity").textContent = `${main.humidity}%`;
    document.getElementById("wind").textContent = `${wind.speed} km/h`;
    document.getElementById("feelsLike").textContent = `${Math.round(main.feels_like)}°C`;
    document.getElementById("visibility").textContent = `${(visibility / 1000).toFixed(1)} km`;
    document.getElementById("pressure").textContent = `${main.pressure} hPa`;
    document.getElementById("cloudiness").textContent = `${clouds.all}%`;
    
    const iconCode = weather[0].icon;
    document.getElementById("weatherIcon").src = 
      `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("weatherIcon").alt = weather[0].description;

    this.elements.lastUpdate.textContent = new Date().toLocaleTimeString();
  }

  updateForecast(forecastData) {
    const forecastCards = document.getElementById("forecastCards");
    forecastCards.innerHTML = "";

    const dailyData = forecastData.list.filter(item => 
      item.dt_txt.includes("12:00:00")
    );

    dailyData.forEach((day, index) => {
      const date = new Date(day.dt * 1000);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const icon = day.weather[0].icon;
      const temp = Math.round(day.main.temp);

      const card = document.createElement("div");
      card.className = "forecast-card";
      card.role = "listitem";
      card.innerHTML = `
        <div class="forecast-day">${dayName}</div>
        <img 
          src="https://openweathermap.org/img/wn/${icon}.png" 
          alt="${day.weather[0].description}"
          class="forecast-icon"
        >
        <div class="forecast-temp">${temp}°C</div>
      `;
      forecastCards.appendChild(card);
    });
  }

  showLoader() {
    this.elements.loader.removeAttribute("hidden");
    this.elements.errorMsg.setAttribute("hidden", "");
  }

  hideLoader() {
    this.elements.loader.setAttribute("hidden", "");
  }

  showError(message) {
    this.elements.errorMsg.removeAttribute("hidden");
    this.elements.errorMsg.textContent = `⚠️ ${message}`;
    this.elements.weatherInfo.setAttribute("hidden", "");
    this.elements.forecastContainer.setAttribute("hidden", "");
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    this.elements.themeToggle.setAttribute(
      "aria-pressed",
      newTheme === "light"
    );
  }

  addRecentCity(city) {
    this.state.recentCities = this.state.recentCities.filter(
      c => c.toLowerCase() !== city.toLowerCase()
    );

    this.state.recentCities.unshift(city);

    this.state.recentCities = this.state.recentCities.slice(0, 5);

    localStorage.setItem("recentCities", JSON.stringify(this.state.recentCities));

    this.renderRecentSearches();
  }

  getRecentCities() {
    const stored = localStorage.getItem("recentCities");
    return stored ? JSON.parse(stored) : [];
  }

  renderRecentSearches() {
    const list = this.elements.recentList;
    list.innerHTML = "";

    if (this.state.recentCities.length === 0) {
      this.elements.recentSearches.setAttribute("hidden", "");
      return;
    }

    this.elements.recentSearches.removeAttribute("hidden");

    this.state.recentCities.forEach(city => {
      const li = document.createElement("li");
      li.className = "recent-item";
      li.textContent = city;
      li.role = "button";
      li.tabIndex = 0;
      list.appendChild(li);
    });
  }

  loadDefaultCity() {
    const lastCity = localStorage.getItem("lastCity") || "London";
    this.searchCity(lastCity);
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.setAttribute("role", "status");

    this.elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideInRight 0.3s ease-out reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp();
});