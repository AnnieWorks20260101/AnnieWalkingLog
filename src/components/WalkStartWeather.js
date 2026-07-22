import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { getOpenWeatherIconUrl } from '../services/openWeather';
import { formatStartWeatherTemp } from '../utils/walkFormat';
import { useDisplayPreferences } from '../contexts/DisplayPreferencesContext';

export function hasStartWeatherDisplay(startWeather) {
  if (!startWeather) {
    return false;
  }
  // tempC presence is enough; unit formatting is display-only
  const hasTemp = startWeather.tempC != null && !Number.isNaN(startWeather.tempC);
  return !!(getOpenWeatherIconUrl(startWeather.icon) || hasTemp);
}

export default function WalkStartWeather({ startWeather, iconSize = 28, textStyle, style }) {
  const { unitSystem } = useDisplayPreferences();
  const iconUrl = getOpenWeatherIconUrl(startWeather?.icon);
  const temp = formatStartWeatherTemp(startWeather, unitSystem);

  if (!iconUrl && !temp) {
    return null;
  }

  return (
    <View style={[styles.row, style]}>
      {iconUrl ? (
        <Image source={{ uri: iconUrl }} style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
      ) : null}
      {temp ? <Text style={[styles.temp, textStyle]}>{temp}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  temp: {
    fontWeight: '600',
  },
});
