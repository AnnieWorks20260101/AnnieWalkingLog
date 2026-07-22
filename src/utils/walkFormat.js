/** km → miles / km/h → mph */
export const KM_TO_MILES = 0.621371192;

export function isImperialUnitSystem(unitSystem) {
  return unitSystem === 'imperial';
}

export function convertDistanceKm(distanceKm, unitSystem = 'metric') {
  const value = distanceKm ?? 0;
  return isImperialUnitSystem(unitSystem) ? value * KM_TO_MILES : value;
}

export function convertSpeedKmh(speedKmh, unitSystem = 'metric') {
  const value = speedKmh ?? 0;
  return isImperialUnitSystem(unitSystem) ? value * KM_TO_MILES : value;
}

export function convertTempC(tempC, unitSystem = 'metric') {
  return isImperialUnitSystem(unitSystem) ? (tempC * 9) / 5 + 32 : tempC;
}

export function getDistanceUnitLabel(unitSystem, i18n) {
  return isImperialUnitSystem(unitSystem) ? i18n.t('walk.graphUnitMi') : i18n.t('walk.graphUnitKm');
}

export function getSpeedUnitLabel(unitSystem, i18n) {
  return isImperialUnitSystem(unitSystem) ? i18n.t('walk.graphUnitMph') : i18n.t('walk.graphUnitKmh');
}

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
  return formatAverageSpeed(distanceKm, durationMinutes, 'metric');
}

export function formatAverageSpeed(distanceKm, durationMinutes, unitSystem = 'metric') {
  const speed = calculateAverageSpeedKmh(distanceKm, durationMinutes);
  if (speed == null) {
    return null;
  }
  return convertSpeedKmh(speed, unitSystem).toFixed(1);
}

export function formatDistanceValue(distanceKm, unitSystem = 'metric') {
  return convertDistanceKm(distanceKm ?? 0, unitSystem).toFixed(2);
}

export function formatDurationMinutes(minutes, i18n) {
  if (!minutes) {
    return `0${i18n.t('common.minute')}`;
  }
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}${i18n.t('common.hour')}${m}${i18n.t('common.minute')}` : `${m}${i18n.t('common.minute')}`;
}

/** 開始時気温（例: 12°C / 54°F） */
export function formatStartWeatherTemp(startWeather, unitSystem = 'metric') {
  if (!startWeather || startWeather.tempC == null || Number.isNaN(startWeather.tempC)) {
    return null;
  }
  const temp = convertTempC(startWeather.tempC, unitSystem);
  const unit = isImperialUnitSystem(unitSystem) ? '°F' : '°C';
  return `${Math.round(temp)}${unit}`;
}

/** 例: 0.89km / 33分：1.6km/h */
export function formatWalkDistanceDurationSpeed(walk, i18n, unitSystem = 'metric') {
  const distance = formatDistanceValue(walk.distance, unitSystem);
  const duration = formatDurationMinutes(walk.duration, i18n);
  const speed = formatAverageSpeed(walk.distance, walk.duration, unitSystem);
  const speedStr = speed ?? '—';
  return i18n.t('walk.statsSummary', {
    distance,
    distanceUnit: getDistanceUnitLabel(unitSystem, i18n),
    duration,
    speedLabel: i18n.t('walk.averageSpeed'),
    speed: speedStr,
    speedUnit: getSpeedUnitLabel(unitSystem, i18n),
  });
}
