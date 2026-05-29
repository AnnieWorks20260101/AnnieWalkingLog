import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert } from 'react-native';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import PetSelector from '../../components/PetSelector';
import * as Location from 'expo-location';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import i18n from '../../i18n';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase関連
import { db } from '../../services/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 

import { calculateTotalDistance } from '../../utils/locationUtils';

const LOCATION_TASK_NAME = 'background-location-task';
const TEMP_ROUTE_KEY = 'temp_route';

// バックグラウンドタスクの定義
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
  const { userId, familyId } = useAuth();
  const { pets } = useFamilyPets(familyId);
  const [selectedPetIds, setSelectedPetIds] = useState([]);
  const [route, setRoute] = useState([]);
  const [poops, setPoops] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const mapRef = useRef(null);
  const timerRef = useRef(null);

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

  // 初期位置取得
  useEffect(() => {
    (async () => {
      try {
        // 1. フォアグラウンド権限のみリクエスト（バックグラウンドはここでは聞かない！）
        let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
          Alert.alert(i18n.t('walk.locationError'), i18n.t('walk.locationErrorMsg'));
          setInitialRegion({ latitude: 35.681236, longitude: 139.767125, latitudeDelta: 0.005, longitudeDelta: 0.005 });
          return;
        }

        // 2. 現在地をサクッと1回だけ取得
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      } catch (error) {
        console.warn("初期位置エラー:", error);
        setInitialRegion({ latitude: 35.681236, longitude: 139.767125, latitudeDelta: 0.005, longitudeDelta: 0.005 });
      }
    })();
  }, []);

  // UI（赤線）を更新するためのポーリング
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(async () => {
        const saved = await AsyncStorage.getItem(TEMP_ROUTE_KEY);
        if (saved) {
          const currentRoute = JSON.parse(saved);
          setRoute(currentRoute);
          
          if (currentRoute.length > 0 && mapRef.current) {
            mapRef.current.animateToRegion({
              ...currentRoute[currentRoute.length - 1],
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }, 500);
          }
        }
      }, 2000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTracking]);

  const startTracking = async () => {
    if (selectedPetIds.length === 0) {
      Alert.alert(i18n.t('record.alertNoPet'));
      return;
    }

    try {
      // バックグラウンド権限を聞く（または確認する）
      let { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (bgStatus !== 'granted') {
        // 🌟 警告だけ出して、return で処理を止めない！
        Alert.alert(
          i18n.t('walk.bgLocationWarning'), 
          i18n.t('walk.bgLocationWarningMsg')
        );
      }

      setIsTracking(true);
      setRoute([]);
      setPoops([]);
      setStartTime(new Date());
      await AsyncStorage.removeItem(TEMP_ROUTE_KEY);
    
      // 🌟 権限がなくても、とりあえず裏側での記録開始を試みる
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: i18n.t('walk.walking'),
          notificationBody: "🐾",
        },
      });
    } catch (error) {
      setIsTracking(false);
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('walk.startError'));
    }
  };

  const stopTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch(e) {} // 既に止まっていた場合のエラー回避
    
    setIsTracking(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const saved = await AsyncStorage.getItem(TEMP_ROUTE_KEY);
    const finalRoute = saved ? JSON.parse(saved) : [];

    Alert.alert(
      i18n.t('walk.endConfirm'),
      i18n.t('walk.endConfirmMsg'),
      [
        { text: i18n.t('walk.discard'), style: "destructive", onPress: () => setRoute([]) },
        { text: i18n.t('walk.save'), onPress: () => saveWalkData(finalRoute) }
      ]
    );
  };

  const saveWalkData = async (finalRoute) => {
    try {
      const endTime = new Date();
      const distance = calculateTotalDistance(finalRoute); // 🌟 ここで距離計算！
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
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "walks"), walkData);
      await AsyncStorage.removeItem(TEMP_ROUTE_KEY);

      Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('walk.saveSuccessMsg'), [
        { 
          text: i18n.t('walk.viewResult'), 
          onPress: () => {
            navigation.replace('WalkDetail', { walk: { ...walkData, id: docRef.id } });
          } 
        }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert(i18n.t('common.error'), i18n.t('medicine.saveError'));
    }
  };

  const recordPoop = async () => {
    let location = await Location.getCurrentPositionAsync({});
    setPoops((prev) => [...prev, {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    }]);
  };

  if (!initialRegion) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <Text style={{ marginTop: 100, textAlign: 'center', color: currentTheme.textSecondary }}>{i18n.t('walk.gettingLocation')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={isTracking ? i18n.t('walk.walking') : i18n.t('walk.title')} showBack />

      {!isTracking && (
        <View style={[styles.petSection, { borderBottomColor: currentTheme.accentBorder }]}>
          <Text style={[styles.petSectionLabel, { color: currentTheme.textSecondary }]}>{i18n.t('walk.selectPet')}</Text>
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
        <Button
          title={isTracking ? i18n.t('walk.walking') : i18n.t('walk.start')}
          onPress={startTracking}
          disabled={isTracking || selectedPetIds.length === 0}
          color={currentTheme.primary}
        />
        <Button title={i18n.t('walk.end')} onPress={stopTracking} disabled={!isTracking} color={currentTheme.danger} />
      </View>
      <View style={[styles.mapContainer, { borderColor: currentTheme.accentBorder }]}>
        <MapView ref={mapRef} style={styles.map} showsUserLocation={true} initialRegion={initialRegion}>
          {route.length > 0 && <Polyline coordinates={route} strokeColor={currentTheme.primary} strokeWidth={5} />}
          {poops.map((poop, index) => (
            <Marker key={index} coordinate={poop}><Text style={{fontSize: 30}}>💩</Text></Marker>
          ))}
        </MapView>
        {isTracking && (
          <TouchableOpacity style={[styles.poopButton, { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.primary }]} onPress={recordPoop}>
            <Text style={styles.poopButtonText}>{i18n.t('walk.poopLabel')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  petSection: { paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1 },
  petSectionLabel: { fontSize: 14, fontWeight: '600', paddingHorizontal: 20, marginBottom: 8 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10, paddingHorizontal: 12, marginTop: 8 },
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
  poopButtonText: { fontSize: 35 }
});
