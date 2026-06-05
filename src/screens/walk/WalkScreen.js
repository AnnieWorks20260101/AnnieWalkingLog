import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  AppState,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import PetSelector from '../../components/PetSelector';
import BackgroundLocationDisclosureModal from '../../components/BackgroundLocationDisclosureModal';
import BackgroundActivityGuideModal from '../../components/BackgroundActivityGuideModal';
import * as Location from 'expo-location';
import { useTheme } from '../../contexts/ThemeContext';
import { useWalkPreferences } from '../../contexts/WalkPreferencesContext';
import { useAuth } from '../../contexts/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../../i18n';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  hasAcceptedBgLocationDisclosure,
  setAcceptedBgLocationDisclosure,
} from '../../utils/locationDisclosureStorage';
import { hasCompletedLocationSetup, setCompletedLocationSetup } from '../../utils/locationSetupStorage';
import { getDeviceManufacturerCategory } from '../../utils/deviceManufacturer';

import { db } from '../../services/firebase';
import { collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { useThemedStyles } from '../../hooks/useThemedStyles';
import { calculateTotalDistance } from '../../utils/locationUtils';
import { fetchCurrentWeather } from '../../services/openWeather';
import { navigateToWalkDetail } from '../../navigation/walkNavigation';
import { setWalkTrackingActive } from '../../navigation/walkSessionFlag';
import { getCurrentWalkMapCoordinate } from '../../utils/walkMapMarks';
import {
  isBackgroundLocationGranted,
  isWalkBackgroundLocationReady,
} from '../../utils/walkPermissions';
import { getWalkPhotoLimits } from '../../constants/walkPhotoLimits';
import { createPendingWalkPhoto, persistWalkPhotoUri } from '../../utils/walkPhotos';
import { resolveWalkPhotoUploadPolicy } from '../../utils/walkPhotoUploadPolicy';
import { uploadWalkPhotoFromUri } from '../../services/walkPhotoUpload';
import { saveWalkPhotoToDeviceLibrary } from '../../utils/saveWalkPhotoToLibrary';
import { notifyFamilyMembersWalkEnded } from '../../services/notifyFamilyWalkEnded';
import { usePlanTier } from '../../hooks/usePlanTier';
import { canUseWalkPhotos } from '../../constants/planEntitlements';
import { showPlanLimitAlert } from '../../utils/planLimitAlert';
import {
  getUsablePetIds,
  isPetUsableByPlanOrder,
} from '../../utils/planPetUsage';

const LOCATION_TASK_NAME = 'background-location-task';
const TEMP_ROUTE_KEY = 'temp_route';

const DEFAULT_REGION = {
  latitude: 35.681236,
  longitude: 139.767125,
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) return;
  if (data) {
    const { locations } = data;
    const newPoint = {
      latitude: locations[0].coords.latitude,
      longitude: locations[0].coords.longitude,
    };

    const saved = await AsyncStorage.getItem(TEMP_ROUTE_KEY);
    const route = saved ? JSON.parse(saved) : [];
    route.push(newPoint);
    await AsyncStorage.setItem(TEMP_ROUTE_KEY, JSON.stringify(route));
  }
});

export default function WalkScreen({ navigation }) {
  const { currentTheme } = useTheme();
  const { customButtonId, customButtonIcon, customButtonLabel, uploadPhotosOnCellular, savePhotoToLibrary } =
    useWalkPreferences();
  const { tier, entitlements } = usePlanTier();
  const walkPhotosEnabled = canUseWalkPhotos(entitlements);
  const styles = useThemedStyles(createStyles);
  const { userId, familyId } = useAuth();
  const { pets } = useFamilyPets(familyId, userId);
  const maxSelectable = entitlements.maxPets ?? Number.POSITIVE_INFINITY;
  const usablePetIds = useMemo(
    () => getUsablePetIds(pets, entitlements),
    [pets, entitlements]
  );
  const [selectedPetIds, setSelectedPetIds] = useState([]);
  const [route, setRoute] = useState([]);
  const [poops, setPoops] = useState([]);
  const [customMarks, setCustomMarks] = useState([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [isSavingWalk, setIsSavingWalk] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [isDisclosureVisible, setIsDisclosureVisible] = useState(false);
  const [isDeviceGuideVisible, setIsDeviceGuideVisible] = useState(false);
  const [deviceGuideCategory, setDeviceGuideCategory] = useState('generic');
  const mapRef = useRef(null);
  const timerRef = useRef(null);
  const waitingForSettingsReturnRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const startWeatherRef = useRef(null);

  useEffect(() => {
    setWalkTrackingActive(isTracking);
    return () => setWalkTrackingActive(false);
  }, [isTracking]);

  useEffect(() => {
    if (pets.length === 0) {
      setSelectedPetIds([]);
      return;
    }
    setSelectedPetIds((prev) => {
      const valid = prev.filter((id) => usablePetIds.includes(id));
      if (valid.length > 0) return valid;
      return usablePetIds.length ? [usablePetIds[0]] : [];
    });
  }, [pets, usablePetIds]);

  const togglePetSelection = (petId) => {
    setSelectedPetIds((prev) => {
      if (prev.includes(petId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== petId);
      }
      if (!isPetUsableByPlanOrder(petId, pets, entitlements)) {
        Alert.alert(i18n.t('common.notice'), i18n.t('walk.petInactiveForWalk'));
        return prev;
      }
      if (prev.length >= maxSelectable) {
        Alert.alert(i18n.t('common.notice'), i18n.t('walk.petSelectLimit', { max: maxSelectable }));
        return prev;
      }
      return [...prev, petId];
    });
  };

  const handleDisabledPetPress = () => {
    Alert.alert(i18n.t('common.notice'), i18n.t('walk.petInactiveForWalk'));
  };

  const refreshMapToCurrentLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        return false;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setInitialRegion(region);
      if (mapRef.current) {
        mapRef.current.animateToRegion(region, 500);
      }
      return true;
    } catch (error) {
      console.warn('現在地取得エラー:', error);
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      const updated = await refreshMapToCurrentLocation();
      if (!updated) {
        setInitialRegion(DEFAULT_REGION);
      }
    })();
  }, []);

  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(async () => {
        const saved = await AsyncStorage.getItem(TEMP_ROUTE_KEY);
        if (saved) {
          const currentRoute = JSON.parse(saved);
          setRoute(currentRoute);

          if (currentRoute.length > 0 && mapRef.current) {
            mapRef.current.animateToRegion(
              {
                ...currentRoute[currentRoute.length - 1],
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              },
              500
            );
          }
        }
      }, 2000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextAppState;

      const returnedToApp =
        (previousState === 'background' || previousState === 'inactive') && nextAppState === 'active';

      if (!returnedToApp || !waitingForSettingsReturnRef.current) {
        return;
      }

      waitingForSettingsReturnRef.current = false;

      setTimeout(() => {
        finishLocationSetup();
      }, 300);
    });

    return () => subscription.remove();
  }, []);

  const areWalkPermissionsReady = () => isWalkBackgroundLocationReady();

  const showReadyToStartAlert = () => {
    Alert.alert(i18n.t('walk.readyToStartTitle'), i18n.t('walk.readyToStartMsg'), [{ text: i18n.t('common.ok') }]);
  };

  const finishLocationSetup = async () => {
    waitingForSettingsReturnRef.current = false;
    await setCompletedLocationSetup();
    setIsDeviceGuideVisible(false);
    await refreshMapToCurrentLocation();
    showReadyToStartAlert();
  };

  const showDeviceGuideModal = () => {
    setDeviceGuideCategory(getDeviceManufacturerCategory());
    setIsDeviceGuideVisible(true);
  };

  const requestLocationPermissions = async () => {
    let foreground = await Location.getForegroundPermissionsAsync();
    if (foreground.status !== 'granted') {
      const foregroundResult = await Location.requestForegroundPermissionsAsync();
      if (foregroundResult.status !== 'granted') {
        Alert.alert(i18n.t('walk.locationError'), i18n.t('walk.locationErrorMsg'));
        return false;
      }
      foreground = await Location.getForegroundPermissionsAsync();
    }

    let background = await Location.getBackgroundPermissionsAsync();
    if (!isBackgroundLocationGranted(foreground, background)) {
      const backgroundResult = await Location.requestBackgroundPermissionsAsync();
      foreground = await Location.getForegroundPermissionsAsync();
      background = backgroundResult;
      if (!isBackgroundLocationGranted(foreground, background)) {
        Alert.alert(i18n.t('walk.bgLocationWarning'), i18n.t('walk.bgLocationWarningMsg'));
      }
    }

    return true;
  };

  const runLocationSetupFlow = async () => {
    const permissionsOk = await requestLocationPermissions();
    if (!permissionsOk) {
      return;
    }
    showDeviceGuideModal();
  };

  const captureStartWeather = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      startWeatherRef.current = await fetchCurrentWeather(
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (error) {
      console.warn('[weather] 開始時の天気取得に失敗:', error);
      startWeatherRef.current = null;
    }
  };

  const beginWalkTracking = async () => {
    try {
      startWeatherRef.current = null;
      setIsTracking(true);
      setRoute([]);
      setPoops([]);
      setCustomMarks([]);
      setPendingPhotos([]);
      setStartTime(new Date());
      await AsyncStorage.removeItem(TEMP_ROUTE_KEY);

      await captureStartWeather();

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: i18n.t('walk.walking'),
          notificationBody: '🐾',
        },
      });
    } catch (error) {
      setIsTracking(false);
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('walk.startError'));
    }
  };

  const startTracking = async () => {
    if (selectedPetIds.length === 0) {
      Alert.alert(i18n.t('walk.alertNoPet'));
      return;
    }

    const setupDone = await hasCompletedLocationSetup();
    const permissionsReady = await areWalkPermissionsReady();

    if (setupDone && permissionsReady) {
      await refreshMapToCurrentLocation();
      await beginWalkTracking();
      return;
    }

    const disclosureAccepted = await hasAcceptedBgLocationDisclosure();
    if (!disclosureAccepted) {
      setIsDisclosureVisible(true);
      return;
    }

    await runLocationSetupFlow();
  };

  const handleDisclosureAgree = async () => {
    setIsDisclosureVisible(false);
    await setAcceptedBgLocationDisclosure();
    await runLocationSetupFlow();
  };

  const handleDisclosureCancel = () => {
    setIsDisclosureVisible(false);
  };

  const handleDeviceGuideConfigure = async () => {
    try {
      waitingForSettingsReturnRef.current = true;
      if (Platform.OS === 'android') {
        await Linking.openSettings();
      } else {
        await Linking.openURL('app-settings:');
      }
    } catch (error) {
      waitingForSettingsReturnRef.current = false;
      console.warn('設定画面を開けませんでした:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('walk.locationErrorMsg'));
    }
  };

  const handleDeviceGuideLater = async () => {
    await finishLocationSetup();
  };

  const promptEndWalkSave = (finalRoute) => {
    Alert.alert(i18n.t('walk.endConfirm'), i18n.t('walk.endConfirmMsg'), [
      {
        text: i18n.t('walk.discard'),
        style: 'destructive',
        onPress: () => {
          startWeatherRef.current = null;
          setRoute([]);
          setPoops([]);
          setCustomMarks([]);
          setPendingPhotos([]);
        },
      },
      { text: i18n.t('walk.save'), onPress: () => saveWalkData(finalRoute) },
    ]);
  };

  const stopTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch (e) {}

    setIsTracking(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const saved = await AsyncStorage.getItem(TEMP_ROUTE_KEY);
    const finalRoute = saved ? JSON.parse(saved) : [];

    promptEndWalkSave(finalRoute);
  };

  const resetWalkSession = () => {
    startWeatherRef.current = null;
    setRoute([]);
    setPoops([]);
    setCustomMarks([]);
    setPendingPhotos([]);
    setIsTracking(false);
    setStartTime(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const saveWalkData = async (finalRoute) => {
    if (isSavingWalk) {
      return;
    }
    if (!familyId || !userId) {
      Alert.alert(i18n.t('common.error'), i18n.t('walk.saveError'));
      return;
    }
    if (!startTime) {
      Alert.alert(i18n.t('common.error'), i18n.t('walk.saveError'));
      return;
    }
    setIsSavingWalk(true);
    try {
      const endTime = new Date();
      const distance = calculateTotalDistance(finalRoute);
      const duration = (endTime - startTime) / 1000 / 60;

      const selectedPets = pets.filter((p) => selectedPetIds.includes(p.id));
      const petNames = selectedPets.map((p) => p.name);
      const petNameLabel = petNames.length > 0 ? petNames.join('、') : i18n.t('walk.defaultPetName');

      const walkRef = doc(collection(db, 'walks'));
      const walkId = walkRef.id;

      let uploadPhotos = false;
      let skippedReason = null;
      if (walkPhotosEnabled && pendingPhotos.length > 0) {
        const policy = await resolveWalkPhotoUploadPolicy(
          uploadPhotosOnCellular,
          pendingPhotos.length
        );
        uploadPhotos = policy.upload;
        skippedReason = policy.skippedReason;

        if (skippedReason === 'user_declined_skip' || skippedReason === 'user_cancelled') {
          promptEndWalkSave(finalRoute);
          return;
        }
      }

      const walkData = {
        familyId,
        userId,
        petIds: selectedPetIds,
        petNames,
        petId: selectedPetIds[0] ?? null,
        petName: petNameLabel,
        startTime: startTime,
        endTime: endTime,
        distance: distance,
        duration: duration,
        route: finalRoute,
        poops: poops,
        customMarks: customMarks,
        photos: [],
        memos: [],
        ...(startWeatherRef.current ? { startWeather: startWeatherRef.current } : {}),
        createdAt: serverTimestamp(),
      };

      await setDoc(walkRef, walkData);

      let photos = [];
      let photoUploadFailed = false;
      if (walkPhotosEnabled && pendingPhotos.length > 0 && uploadPhotos) {
        try {
          for (const pending of pendingPhotos) {
            const storageUrl = await uploadWalkPhotoFromUri(
              pending.localUri,
              familyId,
              walkId,
              pending.id
            );
            photos.push({
              id: pending.id,
              storageUrl,
              takenAt: pending.takenAt,
              latitude: pending.latitude,
              longitude: pending.longitude,
            });
          }
          if (photos.length > 0) {
            await updateDoc(walkRef, { photos });
          }
        } catch (photoError) {
          console.error('walk photo upload failed:', photoError);
          photoUploadFailed = true;
        }
      }

      await AsyncStorage.removeItem(TEMP_ROUTE_KEY);
      resetWalkSession();

      notifyFamilyMembersWalkEnded({
        familyId,
        senderUserId: userId,
        petNameLabel,
        walkId,
      }).catch((error) => {
        console.warn('notifyFamilyMembersWalkEnded failed:', error);
      });

      const savedWalk = { ...walkData, id: walkId, photos };
      const successTitle = i18n.t('walk.saveSuccess');
      let successMsg = i18n.t('walk.saveSuccessMsg');
      if (photoUploadFailed) {
        successMsg = i18n.t('walk.saveSuccessPhotosFailed');
      } else if (skippedReason === 'cellular_disabled') {
        successMsg = i18n.t('walk.photoSkippedCellular');
      } else if (skippedReason === 'no_network') {
        successMsg = i18n.t('walk.photoSkippedNoNetwork');
      }

      Alert.alert(successTitle, successMsg, [
        {
          text: i18n.t('walk.viewResult'),
          onPress: () => {
            navigateToWalkDetail(navigation.getParent(), savedWalk);
          },
        },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert(i18n.t('common.error'), i18n.t('walk.saveError'));
    } finally {
      setIsSavingWalk(false);
    }
  };

  const captureWalkPhoto = async () => {
    if (!walkPhotosEnabled) {
      showPlanLimitAlert({ navigation, limitKey: 'photo', tier });
      return;
    }

    const limits = getWalkPhotoLimits(tier);
    if (limits.maxPerWalk === 0) {
      showPlanLimitAlert({ navigation, limitKey: 'photo', tier });
      return;
    }
    if (pendingPhotos.length >= limits.maxPerWalk) {
      Alert.alert(i18n.t('common.error'), i18n.t('walk.photoLimitReached', { max: limits.maxPerWalk }));
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(i18n.t('common.error'), i18n.t('walk.photoPermissionDenied'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: limits.quality,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    const pickedUri = result.assets[0].uri;

    try {
      const localUri = await persistWalkPhotoUri(pickedUri);

      if (savePhotoToLibrary) {
        await saveWalkPhotoToDeviceLibrary(localUri);
      }

      const coordinate = await getCurrentWalkMapCoordinate();
      setPendingPhotos((prev) => [...prev, createPendingWalkPhoto(localUri, coordinate)]);
    } catch (error) {
      console.error('walk photo capture error:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('walk.photoCaptureError'));
    }
  };

  const recordPoop = async () => {
    const coordinate = await getCurrentWalkMapCoordinate();
    setPoops((prev) => [...prev, coordinate]);
  };

  const recordCustomMark = async () => {
    const coordinate = await getCurrentWalkMapCoordinate();
    setCustomMarks((prev) => [
      ...prev,
      {
        ...coordinate,
        icon: customButtonIcon,
        buttonId: customButtonId,
      },
    ]);
  };

  if (!initialRegion) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <Text style={{ marginTop: 100, textAlign: 'center', color: currentTheme.textSecondary }}>
          {i18n.t('walk.gettingLocation')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={isTracking ? i18n.t('walk.walking') : i18n.t('walk.title')} />

      <BackgroundLocationDisclosureModal
        visible={isDisclosureVisible}
        onAgree={handleDisclosureAgree}
        onCancel={handleDisclosureCancel}
      />

      <BackgroundActivityGuideModal
        visible={isDeviceGuideVisible}
        manufacturerCategory={deviceGuideCategory}
        onConfigure={handleDeviceGuideConfigure}
        onLater={handleDeviceGuideLater}
      />

      {!isTracking && (
        <View style={[styles.petSection, { borderBottomColor: currentTheme.accentBorder }]}>
          <Text style={[styles.petSectionLabel, { color: currentTheme.textSecondary }]}>
            {i18n.t('walk.selectPet')}
          </Text>
          <PetSelector
            pets={pets}
            multiple
            selectedPetIds={selectedPetIds}
            onTogglePet={togglePetSelection}
            emptyMessage={i18n.t('walk.noPetForWalk')}
            isPetUsable={(petId) => isPetUsableByPlanOrder(petId, pets, entitlements)}
            onDisabledPetPress={handleDisabledPetPress}
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.walkActionButton,
            { backgroundColor: currentTheme.primary },
            (isTracking || selectedPetIds.length === 0) && styles.walkActionButtonDisabled,
          ]}
          onPress={startTracking}
          disabled={isTracking || selectedPetIds.length === 0}
          activeOpacity={0.85}
        >
          <Text style={[styles.walkActionButtonText, { color: currentTheme.card }]}>
            {isTracking ? i18n.t('walk.walking') : i18n.t('walk.start')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.walkActionButton,
            { backgroundColor: currentTheme.danger },
            !isTracking && styles.walkActionButtonDisabled,
          ]}
          onPress={stopTracking}
          disabled={!isTracking}
          activeOpacity={0.85}
        >
          <Text style={[styles.walkActionButtonText, { color: currentTheme.card }]}>{i18n.t('walk.end')}</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.mapContainer, { borderColor: currentTheme.accentBorder }]}>
        <MapView ref={mapRef} style={styles.map} showsUserLocation={true} initialRegion={initialRegion}>
          {route.length > 0 && <Polyline coordinates={route} strokeColor={currentTheme.primary} strokeWidth={5} />}
          {customMarks.map((mark, index) => (
            <Marker key={`custom-${index}`} coordinate={mark}>
              <Text style={{ fontSize: 30 }}>{mark.icon}</Text>
            </Marker>
          ))}
          {pendingPhotos.map((photo, index) => (
            <Marker key={`photo-${index}`} coordinate={photo}>
              <Text style={{ fontSize: 30 }}>📷</Text>
            </Marker>
          ))}
          {poops.map((poop, index) => (
            <Marker key={`poop-${index}`} coordinate={poop}>
              <Text style={{ fontSize: 30 }}>💩</Text>
            </Marker>
          ))}
        </MapView>
        {isSavingWalk ? (
          <View style={styles.savingOverlay}>
            <ActivityIndicator size="large" color={currentTheme.primary} />
            <Text style={[styles.savingOverlayText, { color: currentTheme.text }]}>
              {pendingPhotos.length > 0 && walkPhotosEnabled
                ? i18n.t('walk.photoUploading')
                : i18n.t('walk.savingRecord')}
            </Text>
          </View>
        ) : null}
        {isTracking && (
          <View style={styles.trackingActionsColumn}>
            <TouchableOpacity
              style={[
                styles.trackingActionButton,
                { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.primary },
              ]}
              onPress={recordCustomMark}
              activeOpacity={0.85}
              accessibilityLabel={customButtonLabel}
            >
              <Text style={styles.trackingActionEmoji}>{customButtonIcon}</Text>
            </TouchableOpacity>
            {walkPhotosEnabled ? (
              <TouchableOpacity
                style={[
                  styles.trackingActionButton,
                  { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.primary },
                ]}
                onPress={captureWalkPhoto}
                activeOpacity={0.85}
                accessibilityLabel={i18n.t('walk.photoButton')}
                disabled={isSavingWalk}
              >
                <Ionicons name="camera" size={32} color={currentTheme.primary} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[
                styles.trackingActionButton,
                { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.primary },
              ]}
              onPress={recordPoop}
              activeOpacity={0.85}
              accessibilityLabel={i18n.t('walk.poopLabel')}
            >
              <Text style={styles.trackingActionEmoji}>{i18n.t('walk.poopLabel')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const createStyles = (fs) => ({
  container: { flex: 1 },
  petSection: { paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1 },
  petSectionLabel: { fontSize: fs.s, fontWeight: '600', paddingHorizontal: 20, marginBottom: 8 },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  walkActionButton: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  walkActionButtonDisabled: {
    opacity: 0.45,
  },
  walkActionButtonText: {
    fontSize: fs.l,
    fontWeight: '700',
  },
  mapContainer: { flex: 1, borderWidth: 1 },
  map: { width: '100%', height: '100%' },
  trackingActionsColumn: {
    position: 'absolute',
    bottom: 88,
    right: 20,
    gap: 12,
    alignItems: 'center',
  },
  trackingActionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  trackingActionEmoji: { fontSize: 32 },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  savingOverlayText: { marginTop: 12, fontWeight: '600' },
});
