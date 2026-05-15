import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../services/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

// カレンダーを日本語化
LocaleConfig.locales['jp'] = {
  monthNames: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  dayNamesShort: ['日','月','火','水','木','金','土'],
  today: '今日'
};
LocaleConfig.defaultLocale = 'jp';

export default function MedicineScreen({ route }) {
  // RecordScreenから渡されたペット情報を受け取る
  const { pets, selectedPetId: initialPetId } = route.params;
  const [selectedPetId, setSelectedPetId] = useState(initialPetId);

  // カレンダーと履歴のState
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [records, setRecords] = useState([]);
  const [markedDates, setMarkedDates] = useState({});

  // モーダルのState
  const [isModalVisible, setModalVisible] = useState(false);
  const [medicineType, setMedicineType] = useState('ノミ・ダニ'); // 初期値
  const [memo, setMemo] = useState('');

  const medicineOptions = ['ノミ・ダニ', 'フィラリア', 'ワクチン', '処方薬', 'その他'];

  // 🌟 Firebaseから投薬履歴を取得する
  useEffect(() => {
    if (!selectedPetId) return;

    // 選択されたペットの記録だけを取得
    const q = query(
      collection(db, "medicine_records"),
      where("petId", "==", selectedPetId),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      const marks = {};

      snapshot.forEach((doc) => {
        const record = { id: doc.id, ...doc.data() };
        data.push(record);
        // カレンダーに丸印をつけるためのデータを作成
        marks[record.date] = { marked: true, dotColor: '#FF6F61' };
      });

      setRecords(data);
      setMarkedDates(marks);
    });

    return () => unsubscribe();
  }, [selectedPetId]);

  // カレンダーの日付が押された時の色付け処理
  const getMarkedDates = () => {
    return {
      ...markedDates,
      [selectedDate]: { ...markedDates[selectedDate], selected: true, selectedColor: '#FF6F61' }
    };
  };

  // 🌟 保存処理
  const handleSave = async () => {
    try {
      await addDoc(collection(db, "medicine_records"), {
        petId: selectedPetId,
        date: selectedDate, // カレンダーで選択中の日付
        type: medicineType,
        memo: memo,
        createdAt: serverTimestamp()
      });
      setModalVisible(false); // モーダルを閉じる
      setMemo(''); // メモをリセット
    } catch (error) {
      console.error(error);
      Alert.alert("エラー", "保存に失敗しました。");
    }
  };

  // 🌟 履歴リストの表示
  const renderRecordItem = ({ item }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordDateBox}>
        <Text style={styles.recordDateText}>{item.date.replace(/-/g, '/')}</Text>
      </View>
      <View style={styles.recordInfo}>
        <Text style={styles.recordType}>💊 {item.type}</Text>
        {item.memo ? <Text style={styles.recordMemo}>{item.memo}</Text> : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🐾 上部：ペット選択（横スクロール） */}
      <View style={styles.petSelectorWrapper}>
        <FlatList
          data={pets}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedPetId;
            return (
              <TouchableOpacity 
                style={[styles.petIconContainer, isSelected && styles.petIconContainerSelected]} 
                onPress={() => setSelectedPetId(item.id)}
              >
                {item.photoUrl ? (
                  <Image source={{ uri: item.photoUrl }} style={styles.petIcon} />
                ) : (
                  <View style={[styles.petIcon, styles.noImageIcon]}><Ionicons name="paw" size={24} color={isSelected ? "#FF6F61" : "#ccc"} /></View>
                )}
                <Text style={[styles.petName, isSelected && styles.petNameSelected]} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        />
      </View>

      {/* 📅 カレンダー */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates()}
        theme={{
          selectedDayBackgroundColor: '#FF6F61',
          todayTextColor: '#FF6F61',
          arrowColor: '#FF6F61',
        }}
      />

      {/* 📋 履歴リスト（選択された日付の記録、または全履歴など） */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>📝 投薬履歴</Text>
        {records.length === 0 ? (
          <Text style={styles.emptyText}>記録がありません</Text>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            renderItem={renderRecordItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      {/* ➕ 追加ボタン (FAB) */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* 🌟 登録用モーダル */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💊 薬・予防の記録</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDate}>日付: {selectedDate.replace(/-/g, '/')}</Text>

            <Text style={styles.label}>種類</Text>
            <View style={styles.chipContainer}>
              {medicineOptions.map((type) => (
                <TouchableOpacity 
                  key={type} 
                  style={[styles.chip, medicineType === type && styles.chipActive]} 
                  onPress={() => setMedicineType(type)}
                >
                  <Text style={[styles.chipText, medicineType === type && styles.chipTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>メモ (任意)</Text>
            <TextInput
              style={styles.input}
              placeholder="例: フロントライン滴下、ご飯に混ぜて完食 など"
              value={memo}
              onChangeText={setMemo}
              multiline
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>記録する</Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  
  // ペット選択
  petSelectorWrapper: { backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  petIconContainer: { alignItems: 'center', marginRight: 15, opacity: 0.4 },
  petIconContainerSelected: { opacity: 1 },
  petIcon: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'transparent' },
  noImageIcon: { backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', borderColor: '#eee' },
  petName: { fontSize: 11, marginTop: 4, color: '#666', maxWidth: 60 },
  petNameSelected: { fontWeight: 'bold', color: '#FF6F61' },

  // リスト
  listContainer: { flex: 1, padding: 15 },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  emptyText: { color: '#999', textAlign: 'center', marginTop: 20 },
  recordCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  recordDateBox: { justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#eee', paddingRight: 15, marginRight: 15 },
  recordDateText: { fontSize: 14, fontWeight: 'bold', color: '#666' },
  recordInfo: { flex: 1, justifyContent: 'center' },
  recordType: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  recordMemo: { fontSize: 13, color: '#777', marginTop: 4 },

  // FAB
  fab: { position: 'absolute', right: 25, bottom: 30, backgroundColor: '#FF6F61', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4 },

  // モーダル
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalDate: { fontSize: 16, color: '#FF6F61', fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8, marginTop: 10 },
  
  // チップ
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 15, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  chipActive: { backgroundColor: '#FF6F61', borderColor: '#FF6F61' },
  chipText: { color: '#555', fontSize: 14, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },

  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 15, fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#FF6F61', borderRadius: 25, paddingVertical: 15, alignItems: 'center', marginTop: 25 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});