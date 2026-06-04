import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { getOpenWeatherIconUrl } from '../services/openWeather';
import { formatStartWeatherTemp } from '../utils/walkFormat';

export function hasStartWeatherDisplay(startWeather) {
  if (!startWeather) {
    return false;
  }
  const temp = formatStartWeatherTemp(startWeather);
  return !!(getOpenWeatherIconUrl(startWeather.icon) || temp);
}

export default function WalkStartWeather({ startWeather, iconSize = 28, textStyle, style }) {
  const iconUrl = getOpenWeatherIconUrl(startWeather?.icon);
  const temp = formatStartWeatherTemp(startWeather);

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
