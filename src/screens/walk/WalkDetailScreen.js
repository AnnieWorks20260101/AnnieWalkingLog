// src/screens/walk/WalkDetailScreen.js
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';

export default function WalkDetailScreen({ route }) {
  const { walk } = route.params;
  const walkRoute = walk.route || [];
  const poops = walk.poops || [];

  // 表示用のフォーマット
  const distanceStr = walk.distance ? walk.distance.toFixed(2) : "0.00";
  const durationStr = walk.duration ? Math.floor(walk.duration) : "0";

  const initialRegion = walkRoute.length > 0 ? {
    latitude: walkRoute[0].latitude,
    longitude: walkRoute[0].longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  } : {
    latitude: 35.681236,
    longitude: 139.767125,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={styles.container}>
      {/* 🌟 統計情報パネル */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>距離</Text>
          <Text style={styles.statValue}>{distanceStr}<Text style={styles.unit}> km</Text></Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>時間</Text>
          <Text style={styles.statValue}>{durationStr}<Text style={styles.unit}> 分</Text></Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>💩</Text>
          <Text style={styles.statValue}>{poops.length}<Text style={styles.unit}> 回</Text></Text>
        </View>
      </View>

      <MapView style={styles.map} initialRegion={initialRegion}>
        {walkRoute.length > 0 && (
          <Polyline coordinates={walkRoute} strokeColor="#FF0000" strokeWidth={5} />
        )}
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
  map: { flex: 1 },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 3,
    zIndex: 10,
  },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  unit: { fontSize: 12, fontWeight: 'normal' },
});