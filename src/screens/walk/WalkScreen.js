import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase関連
import { db } from '../../services/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 

const LOCATION_TASK_NAME = 'background-location-task';
const TEMP_ROUTE_KEY = 'temp_route';

// 🌟 バックグラウンドタスクの定義
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

export default function WalkScreen({ navigation }) { // 🌟 { navigation } に修正
  const [route, setRoute] = useState([]);
  const [poops, setPoops] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const mapRef = useRef(null);
  const timerRef = useRef(null); // 🌟 UI更新用のタイマー

  // 初期位置取得
  useEffect(() => {
    (async () => {
      // 1. まず権限をリクエスト
      let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Alert.alert('位置情報の許可が必要です', 'お散歩の記録には位置情報の許可を「常に」に設定してください。');
        return;
      }
      
      // 2. Android用のバックグラウンド権限（必要に応じて）
      await Location.requestBackgroundPermissionsAsync();

      // 3. 🌟 現在地をサクッと1回だけ取得
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // 最初はざっくりでOKなので早く取る
      });
      
      // 4. 🌟 取得した場所を初期位置にセット
      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    })();
  }, []);

  // 🌟 UI（赤線）を更新するためのポーリング（1秒ごとにAsyncStorageをチェック）
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(async () => {
        const saved = await AsyncStorage.getItem(TEMP_ROUTE_KEY);
        if (saved) {
          const currentRoute = JSON.parse(saved);
          setRoute(currentRoute); // ここでステートを更新して地図に反映
          
          // 地図を追従させる
          if (currentRoute.length > 0 && mapRef.current) {
            mapRef.current.animateToRegion({
              ...currentRoute[currentRoute.length - 1],
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }, 500);
          }
        }
      }, 2000); // 2秒ごとにUIを更新
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTracking]);

  const startTracking = async () => {
    setIsTracking(true);
    setRoute([]);
    setPoops([]);
    setStartTime(new Date());
    await AsyncStorage.removeItem(TEMP_ROUTE_KEY);
  
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 5,
      showsBackgroundLocationIndicator: true, // iOSで青いバーを出す
      foregroundService: {
        notificationTitle: "お散歩記録中",
        notificationBody: "アニーちゃんとのお散歩を記録しています🐾",
      },
    });
  };

  const stopTracking = async () => {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    setIsTracking(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // 🌟 ストレージから最終的な全ログを回収
    const saved = await AsyncStorage.getItem(TEMP_ROUTE_KEY);
    const finalRoute = saved ? JSON.parse(saved) : [];

    Alert.alert(
      "お散歩終了",
      "この記録を保存しますか？",
      [
        { text: "破棄", style: "destructive", onPress: () => setRoute([]) },
        { text: "保存する", onPress: () => saveWalkData(finalRoute) } // 🌟 引数で渡す
      ]
    );
  };

  const saveWalkData = async (finalRoute) => {
    try {
      const endTime = new Date();
      const distance = calculateTotalDistance(finalRoute); // 🌟 距離計算
      const duration = (endTime - startTime) / 1000 / 60; // 🌟 時間（分）計算

      const walkData = {
        petName: "アニー",
        startTime: startTime,
        endTime: endTime,
        distance: distance,     // km
        duration: duration,     // 分
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
            // 🌟 履歴画面を飛ばして、詳細画面へ直接遷移！
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