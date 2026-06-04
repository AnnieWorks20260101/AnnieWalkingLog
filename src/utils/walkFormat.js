/**
 * お散歩の距離・時間から平均時速 (km/h) を算出
 */
export function calculateAverageSpeedKmh(distanceKm, durationMinutes) {
  if (distanceKm == null || durationMinutes == null || durationMinutes <= 0) {
    return null;
  }
  return (distanceKm * 60) / durationMinutes;
}

export function formatAverageSpeedKmh(distanceKm, durationMinutes) {
  const speed = calculateAverageSpeedKmh(distanceKm, durationMinutes);
  if (speed == null) {
    return null;
  }
  return speed.toFixed(1);
}

export function formatDurationMinutes(minutes, i18n) {
  if (!minutes) {
    return `0${i18n.t('common.minute')}`;
  }
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}${i18n.t('common.hour')}${m}${i18n.t('common.minute')}` : `${m}${i18n.t('common.minute')}`;
}

/** 開始時気温（例: 12°C） */
export function formatStartWeatherTemp(startWeather) {
  if (!startWeather || startWeather.tempC == null || Number.isNaN(startWeather.tempC)) {
    return null;
  }
  return `${Math.round(startWeather.tempC)}°C`;
}

/** 例: 0.89km / 33分：1.6km/h */
export function formatWalkDistanceDurationSpeed(walk, i18n) {
  const distance = (walk.distance ?? 0).toFixed(2);
  const duration = formatDurationMinutes(walk.duration, i18n);
  const speed = formatAverageSpeedKmh(walk.distance, walk.duration);
  const speedStr = speed ?? '—';
  return i18n.t('walk.statsSummary', {
    distance,
    duration,
    speedLabel: i18n.t('walk.averageSpeed'),
    speed: speedStr,
  });
}
