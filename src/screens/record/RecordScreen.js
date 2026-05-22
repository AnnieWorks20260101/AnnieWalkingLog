import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { db } from '../../services/firebase';
import { COLORS, FONT_SIZES } from '../../../constants/theme';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import i18n from '../../i18n';

export default function RecordScreen({ navigation }) {
  const { currentTheme } = useTheme();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null); // 🌟 現在選択されているペットのID
  const [loading, setLoading] = useState(true);

  // Firebaseからペット一覧を取得
  useEffect(() => {
    const q = query(collection(db, "pets"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const petData = [];
      querySnapshot.forEach((doc) => {
        petData.push({ id: doc.id, ...doc.data() });
      });
      setPets(petData);
      
      // 最初は一番目のペットを自動的に選択状態にする
      if (petData.length > 0 && !selectedPetId) {
        setSelectedPetId(petData[0].id);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 画面上部のペット選択アイコンを描画
  const renderPetItem = ({ item }) => {
    const isSelected = item.id === selectedPetId;
    return (
      <TouchableOpacity 
        style={[styles.petIconContainer, isSelected && styles.petIconContainerSelected]} 
        onPress={() => setSelectedPetId(item.id)}
      >
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.petIcon} />
        ) : (
          <View style={[styles.petIcon, styles.noImageIcon, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
            <Ionicons name="paw" size={24} color={isSelected ? currentTheme.primary : currentTheme.border} />
          </View>
        )}
        <Text style={[styles.petName, { color: currentTheme.textSecondary }, isSelected && { color: currentTheme.primary, fontWeight: 'bold' }]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={currentTheme.primary} /></View>;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>{i18n.t('record.title')}</Text>

      {/* 🌟 ペット選択エリア（横スクロール） */}
      <View style={[styles.petSelectorWrapper, { borderBottomColor: currentTheme.border }]}>
        {pets.length === 0 ? (
          <Text style={[styles.noPetText, { color: currentTheme.textSecondary }]}>{i18n.t('record.noPet')}</Text>
        ) : (
          <FlatList
            data={pets}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderPetItem}
            contentContainerStyle={styles.petSelectorList}
          />
        )}
      </View>

      {/* メニューエリア */}
      <View style={styles.menuGrid}>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]} onPress={() => alert(i18n.t('record.menuWeight') + i18n.t('record.alertComingSoon'))}>
          <Text style={styles.menuEmoji}>⚖️</Text>
          <Text style={[styles.menuText, { color: currentTheme.textSecondary }]}>{i18n.t('record.menuWeight')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]} 
          // 🌟 修正：選択中のペットIDとペット一覧を渡して遷移
          onPress={() => {
            if (!selectedPetId) {
              alert(i18n.t('record.alertNoPet'));
              return;
            }
            navigation.navigate('Medicine', { selectedPetId, pets });
          }}
        >
          <Text style={styles.menuEmoji}>💊</Text>
          <Text style={[styles.menuText, { color: currentTheme.textSecondary }]}>{i18n.t('record.menuMedicine')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]} onPress={() => alert(i18n.t('record.menuTrimming') + i18n.t('record.alertComingSoon'))}>
          <Text style={styles.menuEmoji}>✂️</Text>
          <Text style={[styles.menuText, { color: currentTheme.textSecondary }]}>{i18n.t('record.menuTrimming')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]} onPress={() => alert(i18n.t('record.menuHospital') + i18n.t('record.alertComingSoon'))}>
          <Text style={styles.menuEmoji}>🏥</Text>
          <Text style={[styles.menuText, { color: currentTheme.textSecondary }]}>{i18n.t('record.menuHospital')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.subtitle, { color: currentTheme.text }]}>{i18n.t('record.recentRecords')}</Text>
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>{i18n.t('record.noRecords')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FONT_SIZES.standard.xl, fontWeight: 'bold', marginBottom: 15 },
  
  // ペット選択エリア
  petSelectorWrapper: {
    marginBottom: 25,
    borderBottomWidth: 1,
    paddingBottom: 15,
  },
  petSelectorList: {
    alignItems: 'center',
  },
  petIconContainer: {
    alignItems: 'center',
    marginRight: 15,
    opacity: 0.5,
  },
  petIconContainerSelected: {
    opacity: 1,
  },
  petIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  noImageIcon: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petName: {
    fontSize: FONT_SIZES.standard.s,
    marginTop: 5,
    maxWidth: 70,
  },
  petNameSelected: {
    fontWeight: 'bold',
  },
  noPetText: {
    fontStyle: 'italic',
  },

  // メニューエリア
  subtitle: { fontSize: FONT_SIZES.standard.l, fontWeight: 'bold', marginTop: 30, marginBottom: 15 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuItem: {
    width: '23%', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10,
    borderWidth: 1
  },
  menuEmoji: { fontSize: FONT_SIZES.standard.xl, marginBottom: 5 },
  menuText: { fontSize: FONT_SIZES.standard.s, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -50 },
  emptyText: { textAlign: 'center', lineHeight: 22 }
});
