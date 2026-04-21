// src/screens/WalkDetailScreen.js
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';

export default function WalkDetailScreen({ route }) {
  // 履歴画面から渡されたお散歩データ（walk）を受け取る
  const { walk } = route.params;
  const walkRoute = walk.route || [];
  const poops = walk.poops || [];

  // 地図の初期表示位置（ルートの最初の地点を中心にする）
  const initialRegion = walkRoute.length > 0 ? {
    latitude: walkRoute[0].latitude,
    longitude: walkRoute[0].longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  } : {
    latitude: 35.681236, // データがない場合のダミー（東京）
    longitude: 139.767125,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
      >
        {/* 歩いたルートの赤線 */}
        {walkRoute.length > 0 && (
          <Polyline coordinates={walkRoute} strokeColor="#FF0000" strokeWidth={5} />
        )}
        
        {/* うんちピン */}
        {poops.map((poop, index) => (
          <Marker key={index} coordinate={poop}>
            <Text style={{fontSize: 30}}>💩</Text>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});