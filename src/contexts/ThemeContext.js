import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';

const THEME_STORAGE_KEY = '@app_theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('light'); // 初期値
  const [loading, setLoading] = useState(true);

  // 起動時に保存されたテーマを読み込む
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && COLORS[savedTheme]) {
          setThemeName(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme', error);
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  // テーマを変更して保存する
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

  const currentTheme = COLORS[themeName];

  return (
    <ThemeContext.Provider value={{ themeName, currentTheme, changeTheme, loading }}>
      {!loading && children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
