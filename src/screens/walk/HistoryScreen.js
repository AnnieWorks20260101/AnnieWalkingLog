import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { db } from '../../services/firebase';
import { FONT_SIZES } from '../../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import i18n from '../../i18n';

export default function HistoryScreen({ navigation }) {
  const { currentTheme } = useTheme();
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
    if (!minutes) return `0${i18n.t('common.minute')}`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return h > 0 ? `${h}${i18n.t('common.hour')}${m}${i18n.t('common.minute')}` : `${m}${i18n.t('common.minute')}`;
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
      i18n.t('walk.deleteConfirm'),
      i18n.t('walk.deleteConfirmMsg'),
      [
        { text: i18n.t('walk.cancel'), style: "cancel" },
        { 
          text: i18n.t('walk.delete'), 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "walks", id));
            } catch (error) {
              console.error("削除エラー:", error);
              Alert.alert(i18n.t('common.error'), i18n.t('medicine.saveError'));
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
          <Text style={[styles.dateHeader, { backgroundColor: currentTheme.border, color: currentTheme.text }]}>{formatDate(item.startTime)}</Text>
        )}
        
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: currentTheme.card }]}
          onPress={() => navigation.navigate('WalkDetail', { walk: item })}
        >
          <View style={styles.timelineContainer}>
            <View style={[styles.timelineDot, { backgroundColor: currentTheme.textSecondary }]} />
            <View style={[styles.timelineLine, { backgroundColor: currentTheme.border }]} />
          </View>

          <View style={[styles.contentContainer, { borderBottomColor: currentTheme.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={[styles.timeText, { color: currentTheme.text }]}>{formatTime(item.startTime)}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={{ fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.detailsContainer, { backgroundColor: currentTheme.background }]}>
              <Text style={[styles.petNames, { color: currentTheme.text }]}>🐾 {item.petName || "アニー"}</Text>
              <Text style={[styles.statsText, { color: currentTheme.textSecondary }]}>{i18n.t('walk.poopCount', { count: item.poops?.length || 0 })}</Text>
              <Text style={[styles.statsText, { color: currentTheme.textSecondary }]}>
                📍 {item.distance ? item.distance.toFixed(2) : "0.00"} km / {formatDuration(item.duration)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={currentTheme.primary} /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <FlatList
        data={walks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: currentTheme.primary }]} 
        onPress={() => navigation.navigate('Walk')}
      >
        <Text style={[styles.fabText, { color: currentTheme.card }]}>{i18n.t('walk.startWalk')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  listContent: { paddingBottom: 180 }, 
  
  dateHeader: {
    fontSize: FONT_SIZES.standard.l,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  card: { flexDirection: 'row', paddingHorizontal: 15 },
  timelineContainer: { width: 20, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 20 },
  timelineLine: { flex: 1, width: 2 },
  contentContainer: { flex: 1, paddingVertical: 15, paddingLeft: 10, borderBottomWidth: 1 },
  timeText: { fontSize: FONT_SIZES.standard.m, fontWeight: '600', marginBottom: 4 },
  detailsContainer: { padding: 10, borderRadius: 8, marginTop: 5 },
  petNames: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold', marginBottom: 3 },
  statsText: { fontSize: FONT_SIZES.standard.s, marginTop: 2 },
  deleteButton: { padding: 10, marginTop: -5, marginRight: -5 },
  
  // FAB
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 30,     
    width: 65,      
    height: 65,     
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,           
    shadowColor: '#000',    
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // 🌟 3. ボタンが少し小さくなったので、文字も少しだけスッキリさせます
  fabText: {
    fontSize: FONT_SIZES.standard.s, 
    fontWeight: 'bold',
  },
});
