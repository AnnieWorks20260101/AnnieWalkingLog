import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { getTimeFormatLabel } from '../utils/formatTime';

const LANGUAGE_STORAGE_KEY = '@app_language';
const TIME_FORMAT_STORAGE_KEY = '@app_time_format';

export const LANGUAGE_OPTIONS = [{ id: 'ja', labelKey: 'settings.languageJa' }];
export const TIME_FORMAT_OPTIONS = ['auto', 'h12', 'h24'];

const DisplayPreferencesContext = createContext(null);

export function DisplayPreferencesProvider({ children }) {
  const [language, setLanguageState] = useState('ja');
  const [timeFormat, setTimeFormatState] = useState('auto');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [savedLang, savedTimeFormat] = await Promise.all([
          AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
          AsyncStorage.getItem(TIME_FORMAT_STORAGE_KEY),
        ]);
        if (savedLang && LANGUAGE_OPTIONS.some((o) => o.id === savedLang)) {
          setLanguageState(savedLang);
          i18n.locale = savedLang;
        }
        if (savedTimeFormat && TIME_FORMAT_OPTIONS.includes(savedTimeFormat)) {
          setTimeFormatState(savedTimeFormat);
        }
      } catch (error) {
        console.error('Failed to load display preferences', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setLanguage = useCallback(async (lang) => {
    if (!LANGUAGE_OPTIONS.some((o) => o.id === lang)) {
      return;
    }
    setLanguageState(lang);
    i18n.locale = lang;
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error('Failed to save language', error);
    }
  }, []);

  const setTimeFormat = useCallback(async (format) => {
    if (!TIME_FORMAT_OPTIONS.includes(format)) {
      return;
    }
    setTimeFormatState(format);
    try {
      await AsyncStorage.setItem(TIME_FORMAT_STORAGE_KEY, format);
    } catch (error) {
      console.error('Failed to save time format', error);
    }
  }, []);

  const languageLabel = useMemo(() => {
    const option = LANGUAGE_OPTIONS.find((o) => o.id === language);
    return option ? i18n.t(option.labelKey) : language;
  }, [language]);

  const timeFormatLabel = useMemo(() => getTimeFormatLabel(timeFormat, i18n), [timeFormat]);

  return (
    <DisplayPreferencesContext.Provider
      value={{
        language,
        languageLabel,
        setLanguage,
        timeFormat,
        timeFormatLabel,
        setTimeFormat,
        loading,
      }}
    >
      {!loading && children}
    </DisplayPreferencesContext.Provider>
  );
}

export function useDisplayPreferences() {
  const ctx = useContext(DisplayPreferencesContext);
  if (!ctx) {
    throw new Error('useDisplayPreferences must be used within DisplayPreferencesProvider');
  }
  return ctx;
}
