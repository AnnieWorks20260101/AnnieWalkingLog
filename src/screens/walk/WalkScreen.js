import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert } from 'react-native'; // 🌟 Alertを追加
import * as Location from 'expo-location';
import MapView, { Polyline, Marker } from 'react-native-maps';

// 🌟 Firebase関連のインポートを追加
import { db } from '../../services/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 

export default function WalkScreen( navigation ) {
  const [route, setRoute] = useState([]);
  const [poops, setPoops] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [startTime, setStartTime] = useState(null); // 🌟 開始時間を記録用

  const [initialRegion, setInitialRegion] = useState({
    latitude: 35.681236,
    longitude: 139.767125,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('位置情報の許可が必要です！');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    })();
  }, []);

  const startTracking = async () => {
    setIsTracking(true);
    setRoute([]);
    setPoops([]);
    setStartTime(new Date()); // 🌟 開始時刻をセット

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
      },
      (newLocation) => {
        const coords = {
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
        };
        setRoute((prevRoute) => [...prevRoute, coords]);
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...coords,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }
      }
    );
    setLocationSubscription(subscription);
  };

  // 🌟 データをFirebaseに保存する関数
  const saveWalkData = async () => {
    try {
      await addDoc(collection(db, "walks"), {
        petName: "アニー", // とりあえず固定値。将来的に選択可能に！
        startTime: startTime,
        endTime: new Date(),
        route: route,
        poops: poops,
        createdAt: serverTimestamp(), // Firebase側のサーバー時刻
      });
      Alert.alert("保存完了！", "お散歩の記録を保存しました。", [
        { text: "OK", onPress: () => navigation.goBack() } // 🌟 履歴画面に戻る
      ]);
    } catch (e) {
      console.error("Error adding document: ", e);
      Alert.alert("エラー", "保存に失敗しました。");
    }
  };

  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);

    // 🌟 終了時に保存するか確認する
    Alert.alert(
      "お散歩終了",
      "この記録を保存しますか？",
      [
        { text: "破棄", style: "destructive", onPress: () => setRoute([]) },
        { text: "保存する", onPress: saveWalkData }
      ]
    );
  };

  const recordPoop = async () => {
    let location = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setPoops((prev) => [...prev, coords]);
  };

  return (
    <View style={styles.container}>
      {/* UI部分は変更なし */}
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