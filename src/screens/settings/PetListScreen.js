import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SectionList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { db } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function PetListScreen({ navigation }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "pets"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const petData = [];
      querySnapshot.forEach((doc) => {
        petData.push({ id: doc.id, ...doc.data() });
      });

      // 🌟 ここで「グループごと」のデータ構造に変換します
      const groupedData = petData.reduce((acc, pet) => {
        // グループが未入力の場合は「その他のペット」という枠に入れる
        const groupName = pet.group ? pet.group : 'その他のペット';
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(pet);
        return acc;
      }, {});

      // SectionList用の配列に整形する
      const sectionArray = Object.keys(groupedData).map(key => ({
        title: key,
        data: groupedData[key]
      }));

      // 「その他のペット」を一番下に持っていくための並び替え
      sectionArray.sort((a, b) => {
        if (a.title === 'その他のペット') return 1;
        if (b.title === 'その他のペット') return -1;
        return a.title.localeCompare(b.title);
      });

      setSections(sectionArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.petCard}>
      <View style={styles.avatarContainer}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.noImage]}>
            <Ionicons name="paw" size={30} color="#ccc" />
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petDetails}>
          {item.type} {item.gender ? ` / ${item.gender}` : ''}
        </Text>
        <Text style={styles.birthdayText}>🎂 {item.birthday || '未設定'}</Text>
      </View>
    </View>
  );

  // 🌟 見出し（グループ名）の描画
  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={title === 'その他のペット' ? "paw-outline" : "home-outline"} size={18} color="#555" />
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF6F61" /></View>;

  return (
    <View style={styles.container}>
      {sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="paw" size={60} color="#ccc" />
          <Text style={styles.emptyText}>まだ登録されていません。{"\n"}右下のボタンから追加してください🐾</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
          stickySectionHeadersEnabled={false} // スクロール時に見出しを固定するかどうか
        />
      )}
      
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PetRegistration')}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 10, lineHeight: 22 },
  
  // 🌟 追加：見出しのスタイル
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginLeft: 8,
  },

  petCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  avatarContainer: { marginRight: 15 },
  avatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: '#eee' },
  noImage: { backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center' },
  infoContainer: { flex: 1 },
  petName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  petDetails: { fontSize: 14, color: '#666' },
  birthdayText: { fontSize: 12, color: '#999', marginTop: 5 },
  fab: { position: 'absolute', right: 25, bottom: 30, backgroundColor: '#FF6F61', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },
});