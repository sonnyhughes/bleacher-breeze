const WRIGLEY = {
  latitude: 41.9484,
  longitude: -87.6553,
  centerFieldBearing: 50
};

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

// Fan-facing estimate: roughly 5 mph of wind behind a fly ball can add about 19 feet.
// 19 / 5 = 3.8 feet per 1 mph of carry wind.
const FEET_PER_MPH_CARRY = 3.8;

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
  windDirectionDetail: document.querySelector("#windDirectionDetail"),
  windValue: document.querySelector("#windValue"),
  gustValue: document.querySelector("#gustValue"),
  tempValue: document.querySelector("#tempValue"),
  conditionsValue: document.querySelector("#conditionsValue"),
  carryBadge: document.querySelector("#carryBadge"),
  crossBadge: document.querySelector("#crossBadge"),
  tempChart: document.querySelector("#tempChart"),
  speedChart: document.querySelector("#speedChart"),
  gustChart: document.querySelector("#gustChart"),
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

  let headline;
  let detail;

  if (outComponent >= 2) {
    headline = "Blowing Out";
    detail = "Toward center field";
  } else if (outComponent <= -2) {
    headline = "Blowing In";
    detail = "Toward home plate";
  } else if (crossComponent > 0) {
    headline = "Left to Right";
    detail = "Across the field";
  } else {
    headline = "Right to Left";
    detail = "Across the field";
  }

  return {
    headline,
    detail,
    windTo,
    outComponent,
    crossComponent
  };
}

function estimatedFeet(component) {
  return Math.round(component * FEET_PER_MPH_CARRY);
}

function summarizeCarry(outComponent) {
  const feet = estimatedFeet(outComponent);
  const absFeet = Math.abs(feet);

  if (absFeet < 3) return "Neutral";
  if (feet > 0) return `+${absFeet} ft`;
  return `−${absFeet} ft`;
}

function summarizeCross(crossComponent) {
  const feet = estimatedFeet(crossComponent);
  const absFeet = Math.abs(feet);

  if (absFeet < 3) return "Minimal";
  const dir = crossComponent > 0 ? "L→R" : "R→L";
  return `${absFeet} ft ${dir}`;
}

function formatTime(isoString, withMinutes = false) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: withMinutes ? "2-digit" : undefined,
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
  els.windArrow.setAttribute("transform", `translate(724 543) rotate(${windTo})`);
}

function renderCurrent(current) {
  const speed = current.wind_speed_10m;
  const gusts = current.wind_gusts_10m;
  const direction = current.wind_direction_10m;
  const temp = Math.round(current.temperature_2m);
  const conditions = weatherCodeText[current.weather_code] || "Current conditions";
  const classification = classifyWind(direction, speed);

  els.windLabel.textContent = classification.headline;
  els.windDirectionDetail.textContent = classification.detail;
  els.windValue.textContent = `${Math.round(speed)} mph`;
  els.gustValue.textContent = `${Math.round(gusts)} mph`;
  els.tempValue.textContent = `${temp}°`;
  els.conditionsValue.textContent = conditions;
  els.carryBadge.textContent = summarizeCarry(classification.outComponent);
  els.crossBadge.textContent = summarizeCross(classification.crossComponent);
  els.updatedText.textContent = `Updated ${formatUpdated()}`;
  setArrow(classification.windTo);
}

function chartSvg({ values, labels, unit, minOverride = null }) {
  const width = 1000;
  const height = 206;
  const margin = { top: 22, right: 32, bottom: 38, left: 92 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const minVal = minOverride ?? Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = Math.max(unit === "°" ? 2 : 2, (maxVal - minVal) * 0.18);
  const yMin = minOverride === 0 ? 0 : Math.floor(minVal - padding);
  const yMax = Math.ceil(maxVal + padding);
  const range = Math.max(1, yMax - yMin);

  const x = index => margin.left + (values.length === 1 ? innerW / 2 : (index / (values.length - 1)) * innerW);
  const y = value => margin.top + ((yMax - value) / range) * innerH;

  const points = values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const areaPoints = `${margin.left},${margin.top + innerH} ${points} ${margin.left + innerW},${margin.top + innerH}`;
  const gridValues = [yMin, yMin + range / 2, yMax];

  const formatAxisValue = value => {
    if (unit === "°") return `${Math.round(value)}°`;
    return `${Math.round(value)} mph`;
  };

  const grid = gridValues.map(value => {
    const yy = y(value);
    return `
      <line class="grid-line" x1="${margin.left}" y1="${yy}" x2="${margin.left + innerW}" y2="${yy}" />
      <text class="chart-label" x="${margin.left - 14}" y="${yy + 4}" text-anchor="end">${formatAxisValue(value)}</text>
    `;
  }).join("");

  const dots = values.map((value, index) => `
    <circle class="chart-dot" cx="${x(index)}" cy="${y(value)}" r="4.5" />
  `).join("");

  const valueLabels = values.map((value, index) => {
    // Keep labels consistent across all charts:
    // 4th point, 8th point, and final point.
    const labelIndexes = new Set([
      Math.min(3, values.length - 1),
      Math.min(7, values.length - 1),
      values.length - 1
    ]);

    if (!labelIndexes.has(index)) return "";
    return `<text class="chart-value" x="${x(index)}" y="${y(value) - 12}" text-anchor="middle">${Math.round(value)}${unit}</text>`;
  }).join("");

  const xLabels = labels.map((label, index) => {
    const show = index === 0 || index === values.length - 1 || index % 3 === 0;
    if (!show) return "";
    return `<text class="chart-label" x="${x(index)}" y="${height - 10}" text-anchor="middle">${label}</text>`;
  }).join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="presentation" focusable="false" aria-hidden="true">
      ${grid}
      <line class="axis" x1="${margin.left}" y1="${margin.top + innerH}" x2="${margin.left + innerW}" y2="${margin.top + innerH}" />
      <polygon class="chart-area" points="${areaPoints}" />
      <polyline class="chart-line" points="${points}" />
      ${dots}
      ${valueLabels}
      ${xLabels}
    </svg>
  `;
}

function renderCharts(hourly) {
  const times = hourly.time.slice(0, 12);
  const labels = times.map(time => formatTime(time));
  const temps = hourly.temperature_2m.slice(0, 12);
  const speeds = hourly.wind_speed_10m.slice(0, 12);
  const gusts = hourly.wind_gusts_10m.slice(0, 12);

  els.tempChart.innerHTML = chartSvg({ values: temps, labels, unit: "°" });
  els.speedChart.innerHTML = chartSvg({ values: speeds, labels, unit: " mph", minOverride: 0 });
  els.gustChart.innerHTML = chartSvg({ values: gusts, labels, unit: " mph", minOverride: 0 });
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
    renderCharts(data.hourly);
  } catch (error) {
    console.error(error);
    els.updatedText.textContent = "Unable to load weather";
    els.windLabel.textContent = "Try again";
  els.windDirectionDetail.textContent = "Unable to read wind direction";
    els.windValue.textContent = "--";
    els.gustValue.textContent = "--";
    els.tempValue.textContent = "--";
    els.conditionsValue.textContent = "--";
    els.carryBadge.textContent = "--";
    els.crossBadge.textContent = "--";
    els.tempChart.innerHTML = "";
    els.speedChart.innerHTML = "";
    els.gustChart.innerHTML = "";
  } finally {
    els.refreshButton.disabled = false;
    els.refreshButton.textContent = "Refresh";
  }
}

els.refreshButton.addEventListener("click", loadWeather);
loadWeather();
setInterval(loadWeather, REFRESH_INTERVAL_MS);
