import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../contexts/ThemeContext';

const DARK_THEMES = ['dark', 'midnight'];

export default function ThemedStatusBar() {
  const { themeName } = useTheme();
  const barStyle = DARK_THEMES.includes(themeName) ? 'light' : 'dark';

  return <StatusBar style={barStyle} translucent backgroundColor="transparent" />;
}
