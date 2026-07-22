import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from '../i18n';
import { normalizeAppLocale, resolveInitialLocale } from '../i18n/localeConfig';
import { getTimeFormatLabel } from '../utils/formatTime';

const LANGUAGE_STORAGE_KEY = '@app_language';
const TIME_FORMAT_STORAGE_KEY = '@app_time_format';
const UNIT_SYSTEM_STORAGE_KEY = '@app_unit_system';

export const LANGUAGE_OPTIONS = [
  { id: 'ja', labelKey: 'settings.languageJa' },
  { id: 'en', labelKey: 'settings.languageEn' },
  { id: 'es', labelKey: 'settings.languageEs' },
  { id: 'ko', labelKey: 'settings.languageKo' },
  { id: 'de', labelKey: 'settings.languageDe' },
  { id: 'fr', labelKey: 'settings.languageFr' },
  { id: 'it', labelKey: 'settings.languageIt' },
  { id: 'pt', labelKey: 'settings.languagePt' },
  { id: 'nl', labelKey: 'settings.languageNl' },
];
export const TIME_FORMAT_OPTIONS = ['auto', 'h12', 'h24'];
export const UNIT_SYSTEM_OPTIONS = ['metric', 'imperial'];

const DisplayPreferencesContext = createContext(null);

export function DisplayPreferencesProvider({ children }) {
  const [language, setLanguageState] = useState('ja');
  const [timeFormat, setTimeFormatState] = useState('auto');
  const [unitSystem, setUnitSystemState] = useState('metric');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [savedLang, savedTimeFormat, savedUnitSystem] = await Promise.all([
          AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
          AsyncStorage.getItem(TIME_FORMAT_STORAGE_KEY),
          AsyncStorage.getItem(UNIT_SYSTEM_STORAGE_KEY),
        ]);
        if (savedLang) {
          const lang = normalizeAppLocale(savedLang);
          if (LANGUAGE_OPTIONS.some((o) => o.id === lang)) {
            setLanguageState(lang);
            i18n.locale = lang;
          }
        } else {
          try {
            const locales = getLocales();
            const deviceCode = locales[0]?.languageCode ?? locales[0]?.languageTag ?? 'ja';
            const initial = resolveInitialLocale(deviceCode);
            setLanguageState(initial);
            i18n.locale = initial;
          } catch {
            // keep default ja
          }
        }
        if (savedTimeFormat && TIME_FORMAT_OPTIONS.includes(savedTimeFormat)) {
          setTimeFormatState(savedTimeFormat);
        }
        if (savedUnitSystem && UNIT_SYSTEM_OPTIONS.includes(savedUnitSystem)) {
          setUnitSystemState(savedUnitSystem);
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
    const normalized = normalizeAppLocale(lang);
    if (!LANGUAGE_OPTIONS.some((o) => o.id === normalized)) {
      return;
    }
    setLanguageState(normalized);
    i18n.locale = normalized;
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
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

  const setUnitSystem = useCallback(async (system) => {
    if (!UNIT_SYSTEM_OPTIONS.includes(system)) {
      return;
    }
    setUnitSystemState(system);
    try {
      await AsyncStorage.setItem(UNIT_SYSTEM_STORAGE_KEY, system);
    } catch (error) {
      console.error('Failed to save unit system', error);
    }
  }, []);

  const languageLabel = useMemo(() => {
    const option = LANGUAGE_OPTIONS.find((o) => o.id === language);
    return option ? i18n.t(option.labelKey) : language;
  }, [language]);

  const timeFormatLabel = useMemo(
    () => getTimeFormatLabel(timeFormat, i18n),
    [timeFormat, language]
  );

  const unitSystemLabel = useMemo(
    () => i18n.t(`settings.unitSystem_${unitSystem}`),
    [unitSystem, language]
  );

  return (
    <DisplayPreferencesContext.Provider
      value={{
        language,
        languageLabel,
        setLanguage,
        timeFormat,
        timeFormatLabel,
        setTimeFormat,
        unitSystem,
        unitSystemLabel,
        setUnitSystem,
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
