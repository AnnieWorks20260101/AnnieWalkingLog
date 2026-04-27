import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { db } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

export default function HistoryScreen({ navigation }) {
  const [walks, setWalks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "walks"), orderBy("startTime", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const walkData = [];
      querySnapshot.forEach((document) => {
        walkData.push({ id: document.id, ...document.data() });
      });
      setWalks(walkData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatDuration = (minutes) => {
    if (!minutes) return "0分";
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return h > 0 ? `${h}時間${m}分` : `${m}分`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = (id) => {
    Alert.alert(
      "データの削除",
      "このお散歩記録を削除してもよろしいですか？",
      [
        { text: "キャンセル", style: "cancel" },
        { 
          text: "削除する", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "walks", id));
            } catch (error) {
              console.error("削除エラー:", error);
              Alert.alert("エラー", "削除に失敗しました。");
            }
          } 
        }
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    const showDateHeader = index === 0 || formatDate(item.startTime) !== formatDate(walks[index - 1].startTime);

    return (
      <View>
        {showDateHeader && (
          <Text style={styles.dateHeader}>{formatDate(item.startTime)}</Text>
        )}
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('WalkDetail', { walk: item })}
        >
          <View style={styles.timelineContainer}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineLine} />
          </View>

          <View style={styles.contentContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={styles.timeText}>{formatTime(item.startTime)}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={{ fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailsContainer}>
              <Text style={styles.petNames}>🐾 {item.petName || "アニー"}</Text>
              <Text style={styles.statsText}>💩 うんち {item.poops?.length || 0}回</Text>
              <Text style={styles.statsText}>
                📍 {item.distance ? item.distance.toFixed(2) : "0.00"} km / {formatDuration(item.duration)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={walks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Walk')}
      >
        <Text style={styles.fabText}>🐾 開始</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  listContent: { paddingBottom: 180 }, 
  
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    color: '#333',
  },
  card: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 15 },
  timelineContainer: { width: 20, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ccc', marginTop: 20 },
  timelineLine: { flex: 1, width: 2, backgroundColor: '#eee' },
  contentContainer: { flex: 1, paddingVertical: 15, paddingLeft: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  timeText: { fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 4 },
  detailsContainer: { backgroundColor: '#fafafa', padding: 10, borderRadius: 8, marginTop: 5 },
  petNames: { fontSize: 15, fontWeight: 'bold', color: '#555', marginBottom: 3 },
  statsText: { fontSize: 13, color: '#777', marginTop: 2 },
  deleteButton: { padding: 10, marginTop: -5, marginRight: -5 },
  
  // FAB
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 90,
    backgroundColor: '#FF6F61', 
    width: 75,
    height: 75,
    borderRadius: 37.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,           
    shadowColor: '#000',    
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});