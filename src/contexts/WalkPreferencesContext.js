import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { useDisplayPreferences } from './DisplayPreferencesContext';
import {
  DEFAULT_WALK_CUSTOM_BUTTON_ID,
  getWalkCustomButtonOption,
  isValidWalkCustomButtonId,
  normalizeWalkCustomButtonId,
} from '../constants/walkCustomButtonOptions';
import {
  DEFAULT_WALK_SHARE_PRIVACY_RADIUS_METERS,
  isValidWalkSharePrivacyRadius,
  normalizeWalkSharePrivacyRadius,
} from '../constants/walkSharePrivacyOptions';

const WALK_CUSTOM_BUTTON_STORAGE_KEY = '@walk_custom_button_id';
const WALK_UPLOAD_ON_CELLULAR_KEY = '@walk_upload_on_cellular';
const WALK_SAVE_PHOTO_TO_LIBRARY_KEY = '@walk_save_photo_to_library';
const WALK_SHARE_PRIVACY_RADIUS_KEY = '@walk_share_privacy_radius_meters';

const WalkPreferencesContext = createContext(null);

export function WalkPreferencesProvider({ children }) {
  const { language } = useDisplayPreferences();
  const [customButtonId, setCustomButtonIdState] = useState(DEFAULT_WALK_CUSTOM_BUTTON_ID);
  const [uploadPhotosOnCellular, setUploadPhotosOnCellularState] = useState(false);
  const [savePhotoToLibrary, setSavePhotoToLibraryState] = useState(false);
  const [sharePrivacyRadiusMeters, setSharePrivacyRadiusMetersState] = useState(
    DEFAULT_WALK_SHARE_PRIVACY_RADIUS_METERS
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [savedButton, savedCellular, savedToLibrary, savedSharePrivacy] = await Promise.all([
          AsyncStorage.getItem(WALK_CUSTOM_BUTTON_STORAGE_KEY),
          AsyncStorage.getItem(WALK_UPLOAD_ON_CELLULAR_KEY),
          AsyncStorage.getItem(WALK_SAVE_PHOTO_TO_LIBRARY_KEY),
          AsyncStorage.getItem(WALK_SHARE_PRIVACY_RADIUS_KEY),
        ]);
        if (savedButton) {
          const normalized = normalizeWalkCustomButtonId(savedButton);
          setCustomButtonIdState(normalized);
          if (normalized !== savedButton) {
            await AsyncStorage.setItem(WALK_CUSTOM_BUTTON_STORAGE_KEY, normalized);
          }
        }
        if (savedCellular === 'true') {
          setUploadPhotosOnCellularState(true);
        }
        if (savedToLibrary === 'true') {
          setSavePhotoToLibraryState(true);
        }
        if (savedSharePrivacy != null) {
          const normalized = normalizeWalkSharePrivacyRadius(savedSharePrivacy);
          setSharePrivacyRadiusMetersState(normalized);
          if (normalized !== Number(savedSharePrivacy)) {
            await AsyncStorage.setItem(WALK_SHARE_PRIVACY_RADIUS_KEY, String(normalized));
          }
        }
      } catch (error) {
        console.error('Failed to load walk preferences', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setCustomButtonId = useCallback(async (id) => {
    if (!isValidWalkCustomButtonId(id)) {
      return;
    }
    setCustomButtonIdState(id);
    try {
      await AsyncStorage.setItem(WALK_CUSTOM_BUTTON_STORAGE_KEY, id);
    } catch (error) {
      console.error('Failed to save walk custom button', error);
    }
  }, []);

  const setUploadPhotosOnCellular = useCallback(async (enabled) => {
    setUploadPhotosOnCellularState(enabled);
    try {
      await AsyncStorage.setItem(WALK_UPLOAD_ON_CELLULAR_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      console.error('Failed to save upload on cellular preference', error);
    }
  }, []);

  const setSavePhotoToLibrary = useCallback(async (enabled) => {
    setSavePhotoToLibraryState(enabled);
    try {
      await AsyncStorage.setItem(WALK_SAVE_PHOTO_TO_LIBRARY_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      console.error('Failed to save photo to library preference', error);
    }
  }, []);

  const setSharePrivacyRadiusMeters = useCallback(async (radiusMeters) => {
    if (!isValidWalkSharePrivacyRadius(radiusMeters)) {
      return;
    }
    setSharePrivacyRadiusMetersState(radiusMeters);
    try {
      await AsyncStorage.setItem(WALK_SHARE_PRIVACY_RADIUS_KEY, String(radiusMeters));
    } catch (error) {
      console.error('Failed to save share privacy radius', error);
    }
  }, []);

  const customButtonOption = useMemo(
    () => getWalkCustomButtonOption(customButtonId),
    [customButtonId]
  );

  const customButtonIcon = customButtonOption.icon;

  const customButtonLabel = useMemo(
    () => i18n.t(customButtonOption.labelKey),
    [customButtonOption.labelKey, language]
  );

  return (
    <WalkPreferencesContext.Provider
      value={{
        customButtonId,
        customButtonIcon,
        customButtonLabel,
        setCustomButtonId,
        uploadPhotosOnCellular,
        setUploadPhotosOnCellular,
        savePhotoToLibrary,
        setSavePhotoToLibrary,
        sharePrivacyRadiusMeters,
        setSharePrivacyRadiusMeters,
        loading,
      }}
    >
      {!loading && children}
    </WalkPreferencesContext.Provider>
  );
}

export function useWalkPreferences() {
  const ctx = useContext(WalkPreferencesContext);
  if (!ctx) {
    throw new Error('useWalkPreferences must be used within WalkPreferencesProvider');
  }
  return ctx;
}
