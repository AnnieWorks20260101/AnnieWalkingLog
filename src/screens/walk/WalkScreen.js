import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase関連
import { db } from '../../services/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 

// 🌟 これが抜けていると保存時に落ちます！
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
  const [route, setRoute] = useState([]);
  const [poops, setPoops] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const mapRef = useRef(null);
  const timerRef = useRef(null);

  // 初期位置取得
  useEffect(() => {
    (async () => {
      try {
        // 1. フォアグラウンド権限のみリクエスト（バックグラウンドはここでは聞かない！）
        let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
          Alert.alert('位置情報の許可が必要です', '設定から許可をお願いします。');
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
    try {
      // バックグラウンド権限を聞く（または確認する）
      let { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (bgStatus !== 'granted') {
        // 🌟 警告だけ出して、return で処理を止めない！
        Alert.alert(
          '⚠️ バックグラウンド記録がオフです', 
          'スマホの設定で「常に許可」にされていないため、画面を消したり他のアプリを開いたりすると、お散歩の記録が途切れる可能性があります。'
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
          notificationTitle: "お散歩記録中",
          notificationBody: "アニーちゃんとのお散歩を記録しています🐾",
        },
      });
    } catch (error) {
      setIsTracking(false);
      console.error(error);
      Alert.alert("エラー", "開始に失敗しました。GPSの電波状況などを確認してください。");
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
      "お散歩終了",
      "この記録を保存しますか？",
      [
        { text: "破棄", style: "destructive", onPress: () => setRoute([]) },
        { text: "保存する", onPress: () => saveWalkData(finalRoute) }
      ]
    );
  };

  const saveWalkData = async (finalRoute) => {
    try {
      const endTime = new Date();
      const distance = calculateTotalDistance(finalRoute); // 🌟 ここで距離計算！
      const duration = (endTime - startTime) / 1000 / 60;

      const walkData = {
        petName: "アニー",
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

      Alert.alert("保存完了！", "今日もお疲れ様でした！🐾", [
        { 
          text: "結果を見る", 
          onPress: () => {
            navigation.replace('WalkDetail', { walk: { ...walkData, id: docRef.id } });
          } 
        }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert("エラー", "保存に失敗しました。");
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
      <View style={styles.container}>
        <Text style={{ marginTop: 100, textAlign: 'center' }}>現在地を取得中...🐾</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐾 お散歩画面</Text>
      <View style={styles.buttonContainer}>
        <Button title={isTracking ? "お散歩中..." : "スタート！"} onPress={startTracking} disabled={isTracking} />
        <Button title="終了！" onPress={stopTracking} disabled={!isTracking} color="red" />
      </View>
      <View style={styles.mapContainer}>
        <MapView ref={mapRef} style={styles.map} showsUserLocation={true} initialRegion={initialRegion}>
          {route.length > 0 && <Polyline coordinates={route} strokeColor="#FF0000" strokeWidth={5} />}
          {poops.map((poop, index) => (
            <Marker key={index} coordinate={poop}><Text style={{fontSize: 30}}>💩</Text></Marker>
          ))}
        </MapView>
        {isTracking && (
          <TouchableOpacity style={styles.poopButton} onPress={recordPoop}>
            <Text style={styles.poopButtonText}>💩</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  mapContainer: { flex: 1, borderWidth: 1, borderColor: '#ccc' },
  map: { width: '100%', height: '100%' },
  poopButton: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    backgroundColor: '#fff',
    width: 70,
    height: 70,
    borderRadius: 35,
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