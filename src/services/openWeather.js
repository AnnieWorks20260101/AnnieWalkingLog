import Constants from 'expo-constants';

const OPEN_WEATHER_BASE = 'https://api.openweathermap.org/data/2.5/weather';
const OPEN_WEATHER_ICON_BASE = 'https://openweathermap.org/img/wn/';

export function getOpenWeatherIconUrl(iconCode) {
  if (!iconCode) {
    return null;
  }
  return `${OPEN_WEATHER_ICON_BASE}${iconCode}@2x.png`;
}

function getApiKey() {
  return (
    Constants.expoConfig?.extra?.openWeatherApiKey ??
    Constants.easConfig?.extra?.openWeatherApiKey ??
    null
  );
}

/**
 * 現在位置の天気を OpenWeatherMap から取得（お散歩開始時用）
 * @returns {Promise<object|null>} Firestore 保存用のスナップショット
 */
export async function fetchCurrentWeather(latitude, longitude) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[weather] OpenWeather API key is not configured');
    return null;
  }

  const url =
    `${OPEN_WEATHER_BASE}?lat=${latitude}&lon=${longitude}` +
    `&appid=${apiKey}&units=metric`;

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    console.warn('[weather] API error', response.status, body);
    return null;
  }

  const data = await response.json();
  const condition = data.weather?.[0];

  return {
    provider: 'openweathermap',
    observedAt: new Date().toISOString(),
    latitude,
    longitude,
    tempC: data.main?.temp ?? null,
    feelsLikeC: data.main?.feels_like ?? null,
    humidity: data.main?.humidity ?? null,
    pressureHpa: data.main?.pressure ?? null,
    icon: condition?.icon ?? null,
    main: condition?.main ?? null,
    windSpeedMs: data.wind?.speed ?? null,
    cloudsPercent: data.clouds?.all ?? null,
    cityName: data.name ?? null,
  };
}
