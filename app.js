const WRIGLEY = {
  latitude: 41.9484,
  longitude: -87.6553,
  // Bearing from home plate toward center field, in degrees clockwise from true north.
  // Tune this value if you want the visual classification to be more/less sensitive.
  centerFieldBearing: 50
};

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

const weatherCodeText = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  95: "Thunderstorms"
};

const els = {
  refreshButton: document.querySelector("#refreshButton"),
  updatedText: document.querySelector("#updatedText"),
  windLabel: document.querySelector("#windLabel"),
  windDetails: document.querySelector("#windDetails"),
  componentDetails: document.querySelector("#componentDetails"),
  forecastGrid: document.querySelector("#forecastGrid"),
  windArrow: document.querySelector("#windArrow")
};

function apiUrl() {
  const params = new URLSearchParams({
    latitude: WRIGLEY.latitude,
    longitude: WRIGLEY.longitude,
    current: [
      "temperature_2m",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m"
    ].join(","),
    hourly: [
      "temperature_2m",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m"
    ].join(","),
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: "America/Chicago",
    forecast_hours: "12"
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function angleDiff(a, b) {
  return ((a - b + 540) % 360) - 180;
}

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function classifyWind(windFrom, speed) {
  const windTo = (windFrom + 180) % 360;
  const diffFromCenter = angleDiff(windTo, WRIGLEY.centerFieldBearing);
  const outComponent = speed * Math.cos((diffFromCenter * Math.PI) / 180);
  const crossComponent = speed * Math.sin((diffFromCenter * Math.PI) / 180);

  let label;
  let shortLabel;

  if (outComponent >= 2) {
    label = "Out to CF";
    shortLabel = "Out";
  } else if (outComponent <= -2) {
    label = "Blowing In";
    shortLabel = "In";
  } else if (crossComponent > 0) {
    label = "Left to Right";
    shortLabel = "L → R";
  } else {
    label = "Right to Left";
    shortLabel = "R → L";
  }

  return {
    label,
    shortLabel,
    windTo,
    outComponent,
    crossComponent
  };
}

function formatTime(isoString, options = {}) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: options.withMinutes ? "2-digit" : undefined,
    hour12: true,
    timeZone: "America/Chicago"
  }).format(new Date(isoString));
}

function formatUpdated(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Chicago"
  }).format(date);
}

function setArrow(windTo) {
  // SVG arrow points north by default. Rotate to the direction wind is blowing toward.
  els.windArrow.setAttribute("transform", `translate(210 205) rotate(${windTo})`);
}

function renderCurrent(current) {
  const speed = current.wind_speed_10m;
  const gusts = current.wind_gusts_10m;
  const direction = current.wind_direction_10m;
  const temp = Math.round(current.temperature_2m);
  const conditions = weatherCodeText[current.weather_code] || "Current conditions";
  const classification = classifyWind(direction, speed);

  els.windLabel.textContent = classification.label;
  els.windDetails.textContent = `${Math.round(speed)} mph wind, gusts up to ${Math.round(gusts)} mph`;
  els.componentDetails.textContent =
    `${temp}° and ${conditions.toLowerCase()}. ` +
    `Effective out-to-CF component: ${round(classification.outComponent, 1)} mph. ` +
    `Crosswind component: ${round(classification.crossComponent, 1)} mph.`;
  els.updatedText.textContent = `Updated ${formatUpdated()}`;
  setArrow(classification.windTo);
}

function renderForecast(hourly) {
  const cards = hourly.time.slice(0, 12).map((time, index) => {
    const speed = hourly.wind_speed_10m[index];
    const gusts = hourly.wind_gusts_10m[index];
    const direction = hourly.wind_direction_10m[index];
    const temp = hourly.temperature_2m[index];
    const classification = classifyWind(direction, speed);

    return `
      <article class="forecast-card">
        <p class="forecast-time">${formatTime(time)}</p>
        <p class="forecast-label">${classification.label}</p>
        <p class="forecast-speed">${Math.round(speed)} mph</p>
        <p class="forecast-small">Gusts ${Math.round(gusts)} mph · ${Math.round(temp)}°</p>
      </article>
    `;
  }).join("");

  els.forecastGrid.innerHTML = cards;
}

async function loadWeather() {
  els.refreshButton.disabled = true;
  els.refreshButton.textContent = "Refreshing…";

  try {
    const response = await fetch(apiUrl(), { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Weather request failed with status ${response.status}`);
    }

    const data = await response.json();
    renderCurrent(data.current);
    renderForecast(data.hourly);
  } catch (error) {
    console.error(error);
    els.updatedText.textContent = "Unable to load weather";
    els.windLabel.textContent = "Try again";
    els.windDetails.textContent = "The weather API did not respond. Check your connection and refresh.";
    els.componentDetails.textContent = "";
  } finally {
    els.refreshButton.disabled = false;
    els.refreshButton.textContent = "Refresh";
  }
}

els.refreshButton.addEventListener("click", loadWeather);
loadWeather();
setInterval(loadWeather, REFRESH_INTERVAL_MS);
