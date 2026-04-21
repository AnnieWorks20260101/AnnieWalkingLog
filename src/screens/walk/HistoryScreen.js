// src/screens/HistoryScreen.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../../services/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function HistoryScreen({ navigation }) {
  const [walks, setWalks] = useState([]);

  // 画面が表示されるたびにデータを再取得
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchWalks();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchWalks = async () => {
    try {
      const q = query(collection(db, "walks"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const walkData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWalks(walkData);
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      // 🌟 タップしたら WalkDetail 画面に移動し、この item のデータを渡す
      onPress={() => navigation.navigate('WalkDetail', { walk: item })}
    >
      <Text style={styles.dateText}>
        {item.startTime?.toDate().toLocaleString('ja-JP')}
      </Text>
      <Text style={styles.petText}>{item.petName}ちゃんのお散歩</Text>
      <Text style={styles.infoText}>💩 {item.poops?.length || 0} 回</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={walks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>まだ履歴がありません</Text>}
      />

      {/* 🌟 新規お散歩開始のフローティングボタン */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Walk')}
      >
        <Text style={styles.fabText}>🐾</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
  },
  dateText: { fontSize: 12, color: '#666' },
  petText: { fontSize: 18, fontWeight: 'bold', marginVertical: 5 },
  infoText: { fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    backgroundColor: '#4CAF50',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: { fontSize: 35 },
});