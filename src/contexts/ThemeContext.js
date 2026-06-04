import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES } from '../../constants/theme';
import { enrichTheme } from '../utils/enrichTheme';

const THEME_STORAGE_KEY = '@app_theme';
const FONT_SIZE_STORAGE_KEY = '@app_font_size';

/** 表示設定：小・標準・大 → theme.ts の compact / standard / large */
export const FONT_SIZE_OPTIONS = {
  small: 'compact',
  medium: 'standard',
  large: 'large',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('light');
  const [fontSizeKey, setFontSizeKey] = useState('standard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedTheme, savedFontSize] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY),
        ]);
        if (savedTheme && COLORS[savedTheme]) {
          setThemeName(savedTheme);
        }
        const mapped = Object.values(FONT_SIZE_OPTIONS).includes(savedFontSize) ? savedFontSize : null;
        if (mapped) {
          setFontSizeKey(mapped);
        }
      } catch (error) {
        console.error('Failed to load theme preferences', error);
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const changeTheme = async (newThemeName) => {
    if (COLORS[newThemeName]) {
      setThemeName(newThemeName);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newThemeName);
      } catch (error) {
        console.error('Failed to save theme', error);
      }
    }
  };

  const changeFontSize = async (sizeKey) => {
    const mapped = FONT_SIZE_OPTIONS[sizeKey];
    if (!mapped || !FONT_SIZES[mapped]) {
      return;
    }
    setFontSizeKey(mapped);
    try {
      await AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, mapped);
    } catch (error) {
      console.error('Failed to save font size', error);
    }
  };

  const currentTheme = useMemo(() => enrichTheme(COLORS[themeName]), [themeName]);
  const fontSizes = useMemo(() => FONT_SIZES[fontSizeKey] || FONT_SIZES.standard, [fontSizeKey]);

  const activeFontSizeOption = useMemo(() => {
    const entry = Object.entries(FONT_SIZE_OPTIONS).find(([, v]) => v === fontSizeKey);
    return entry ? entry[0] : 'medium';
  }, [fontSizeKey]);

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        currentTheme,
        changeTheme,
        fontSizes,
        fontSizeKey,
        activeFontSizeOption,
        changeFontSize,
        loading,
      }}
    >
      {!loading && children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
