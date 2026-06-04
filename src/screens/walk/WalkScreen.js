import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  AppState,
} from 'react-native';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import PetSelector from '../../components/PetSelector';
import BackgroundLocationDisclosureModal from '../../components/BackgroundLocationDisclosureModal';
import BackgroundActivityGuideModal from '../../components/BackgroundActivityGuideModal';
import * as Location from 'expo-location';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { useThemedStyles } from '../../hooks/useThemedStyles';
import { calculateTotalDistance } from '../../utils/locationUtils';
import { fetchCurrentWeather } from '../../services/openWeather';
import { navigateToWalkDetail } from '../../navigation/walkNavigation';
import { setWalkTrackingActive } from '../../navigation/walkSessionFlag';

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
  const styles = useThemedStyles(createStyles);
  const { userId, familyId } = useAuth();
  const { pets } = useFamilyPets(familyId, userId);
  const [selectedPetIds, setSelectedPetIds] = useState([]);
  const [route, setRoute] = useState([]);
  const [poops, setPoops] = useState([]);
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
      const valid = prev.filter((id) => pets.some((p) => p.id === id));
      if (valid.length > 0) return valid;
      return [pets[0].id];
    });
  }, [pets]);

  const togglePetSelection = (petId) => {
    setSelectedPetIds((prev) => {
      if (prev.includes(petId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== petId);
      }
      return [...prev, petId];
    });
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

  const areWalkPermissionsReady = async () => {
    const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
    const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
    return foregroundStatus === 'granted' && bgStatus === 'granted';
  };

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
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      Alert.alert(i18n.t('walk.locationError'), i18n.t('walk.locationErrorMsg'));
      return false;
    }

    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      Alert.alert(i18n.t('walk.bgLocationWarning'), i18n.t('walk.bgLocationWarningMsg'));
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

  const stopTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch (e) {}

    setIsTracking(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const saved = await AsyncStorage.getItem(TEMP_ROUTE_KEY);
    const finalRoute = saved ? JSON.parse(saved) : [];

    Alert.alert(i18n.t('walk.endConfirm'), i18n.t('walk.endConfirmMsg'), [
      {
        text: i18n.t('walk.discard'),
        style: 'destructive',
        onPress: () => {
          startWeatherRef.current = null;
          setRoute([]);
        },
      },
      { text: i18n.t('walk.save'), onPress: () => saveWalkData(finalRoute) },
    ]);
  };

  const resetWalkSession = () => {
    startWeatherRef.current = null;
    setRoute([]);
    setPoops([]);
    setIsTracking(false);
    setStartTime(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const saveWalkData = async (finalRoute) => {
    try {
      const endTime = new Date();
      const distance = calculateTotalDistance(finalRoute);
      const duration = (endTime - startTime) / 1000 / 60;

      const selectedPets = pets.filter((p) => selectedPetIds.includes(p.id));
      const petNames = selectedPets.map((p) => p.name);
      const petNameLabel = petNames.length > 0 ? petNames.join('、') : i18n.t('walk.defaultPetName');

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
        ...(startWeatherRef.current ? { startWeather: startWeatherRef.current } : {}),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'walks'), walkData);
      await AsyncStorage.removeItem(TEMP_ROUTE_KEY);
      resetWalkSession();

      const savedWalk = { ...walkData, id: docRef.id };
      Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('walk.saveSuccessMsg'), [
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
    }
  };

  const recordPoop = async () => {
    const location = await Location.getCurrentPositionAsync({});
    setPoops((prev) => [
      ...prev,
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
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
          {poops.map((poop, index) => (
            <Marker key={index} coordinate={poop}>
              <Text style={{ fontSize: 30 }}>💩</Text>
            </Marker>
          ))}
        </MapView>
        {isTracking && (
          <TouchableOpacity
            style={[styles.poopButton, { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.primary }]}
            onPress={recordPoop}
          >
            <Text style={styles.poopButtonText}>{i18n.t('walk.poopLabel')}</Text>
          </TouchableOpacity>
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
  poopButton: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  poopButtonText: { fontSize: 35 },
});
