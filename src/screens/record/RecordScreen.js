import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { db } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function RecordScreen({ navigation }) {
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
          <View style={[styles.petIcon, styles.noImageIcon]}>
            <Ionicons name="paw" size={24} color={isSelected ? "#FF6F61" : "#ccc"} />
          </View>
        )}
        <Text style={[styles.petName, isSelected && styles.petNameSelected]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF6F61" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍖 飼育記録</Text>

      {/* 🌟 ペット選択エリア（横スクロール） */}
      <View style={styles.petSelectorWrapper}>
        {pets.length === 0 ? (
          <Text style={styles.noPetText}>設定タブからペットを登録してください🐾</Text>
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
        <TouchableOpacity style={styles.menuItem} onPress={() => alert('体重記録機能は準備中です')}>
          <Text style={styles.menuEmoji}>⚖️</Text>
          <Text style={styles.menuText}>体重</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          // 🌟 修正：選択中のペットIDとペット一覧を渡して遷移
          onPress={() => {
            if (!selectedPetId) {
              alert("先にペットを登録・選択してください🐾");
              return;
            }
            navigation.navigate('Medicine', { selectedPetId, pets });
          }}
        >
          <Text style={styles.menuEmoji}>💊</Text>
          <Text style={styles.menuText}>薬/予防</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => alert('トリミング機能は準備中です')}>
          <Text style={styles.menuEmoji}>✂️</Text>
          <Text style={styles.menuText}>トリミング</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => alert('病院機能は準備中です')}>
          <Text style={styles.menuEmoji}>🏥</Text>
          <Text style={styles.menuText}>病院</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>最近の記録</Text>
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>まだ記録がありません。{"\n"}上のメニューから追加していきましょう！</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  
  // ペット選択エリア
  petSelectorWrapper: {
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  petSelectorList: {
    alignItems: 'center',
  },
  petIconContainer: {
    alignItems: 'center',
    marginRight: 15,
    opacity: 0.5, // 選択されていないものは少し薄くする
  },
  petIconContainerSelected: {
    opacity: 1, // 選択されているものはクッキリ
  },
  petIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  noImageIcon: {
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#eee',
  },
  petName: {
    fontSize: 12,
    marginTop: 5,
    color: '#666',
    maxWidth: 70,
  },
  petNameSelected: {
    fontWeight: 'bold',
    color: '#FF6F61', // 選択されている名前はアニーちゃんカラーに
  },
  noPetText: {
    color: '#999',
    fontStyle: 'italic',
  },

  // メニューエリア
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 30, marginBottom: 15, color: '#333' },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuItem: {
    width: '23%', backgroundColor: '#f8f8f8', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10,
    borderWidth: 1, borderColor: '#eee'
  },
  menuEmoji: { fontSize: 24, marginBottom: 5 },
  menuText: { fontSize: 12, color: '#555', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -50 },
  emptyText: { color: '#999', textAlign: 'center', lineHeight: 22 }
});