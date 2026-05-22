import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../services/firebase';
import { FONT_SIZES } from '../../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import i18n from '../../i18n';

// カレンダーを日本語化
LocaleConfig.locales['jp'] = {
  monthNames: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  dayNamesShort: ['日','月','火','水','木','金','土'],
  today: '今日'
};
LocaleConfig.defaultLocale = 'jp';

export default function MedicineScreen({ route }) {
  const { currentTheme } = useTheme();
  // RecordScreenから渡されたペット情報を受け取る
  const { pets, selectedPetId: initialPetId } = route.params;
  const [selectedPetId, setSelectedPetId] = useState(initialPetId);

  // カレンダーと履歴のState
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [records, setRecords] = useState([]);
  const [markedDates, setMarkedDates] = useState({});

  // モーダルのState
  const [isModalVisible, setModalVisible] = useState(false);
  const [medicineType, setMedicineType] = useState(i18n.t('medicine.types.fleaTick')); // 初期値
  const [memo, setMemo] = useState('');

  const medicineOptions = [
    i18n.t('medicine.types.fleaTick'), 
    i18n.t('medicine.types.filaria'), 
    i18n.t('medicine.types.vaccine'), 
    i18n.t('medicine.types.prescription'), 
    i18n.t('medicine.types.other')
  ];

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
        marks[record.date] = { marked: true, dotColor: currentTheme.primary };
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
      [selectedDate]: { ...markedDates[selectedDate], selected: true, selectedColor: currentTheme.primary }
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
      Alert.alert(i18n.t('common.error'), i18n.t('medicine.saveError'));
    }
  };

  // 🌟 履歴リストの表示
  const renderRecordItem = ({ item }) => (
    <View style={[styles.recordCard, { backgroundColor: currentTheme.card }]}>
      <View style={[styles.recordDateBox, { borderColor: currentTheme.border }]}>
        <Text style={[styles.recordDateText, { color: currentTheme.textSecondary }]}>{item.date.replace(/-/g, '/')}</Text>
      </View>
      <View style={styles.recordInfo}>
        <Text style={[styles.recordType, { color: currentTheme.text }]}>💊 {item.type}</Text>
        {item.memo ? <Text style={[styles.recordMemo, { color: currentTheme.textSecondary }]}>{item.memo}</Text> : null}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* 🐾 上部：ペット選択（横スクロール） */}
      <View style={[styles.petSelectorWrapper, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
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
                  <View style={[styles.petIcon, styles.noImageIcon, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}><Ionicons name="paw" size={24} color={isSelected ? currentTheme.primary : currentTheme.border} /></View>
                )}
                <Text style={[styles.petName, { color: currentTheme.textSecondary }, isSelected && { color: currentTheme.primary, fontWeight: 'bold' }]} numberOfLines={1}>{item.name}</Text>
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
          selectedDayBackgroundColor: currentTheme.primary,
          todayTextColor: currentTheme.primary,
          arrowColor: currentTheme.primary,
          calendarBackground: currentTheme.card,
          textSectionTitleColor: currentTheme.textSecondary,
          dayTextColor: currentTheme.text,
          textDisabledColor: currentTheme.border,
          monthTextColor: currentTheme.text,
        }}
      />

      {/* 📋 履歴リスト（選択された日付の記録、または全履歴など） */}
      <View style={styles.listContainer}>
        <Text style={[styles.listTitle, { color: currentTheme.text }]}>{i18n.t('medicine.history')}</Text>
        {records.length === 0 ? (
          <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>{i18n.t('medicine.noRecords')}</Text>
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
      <TouchableOpacity style={[styles.fab, { backgroundColor: currentTheme.primary }]} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color={currentTheme.card} />
      </TouchableOpacity>

      {/* 🌟 登録用モーダル */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>{i18n.t('medicine.recordTitle')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={currentTheme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDate, { color: currentTheme.primary }]}>{i18n.t('medicine.date')}: {selectedDate.replace(/-/g, '/')}</Text>

            <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('medicine.type')}</Text>
            <View style={styles.chipContainer}>
              {medicineOptions.map((type) => (
                <TouchableOpacity 
                  key={type} 
                  style={[
                    styles.chip, 
                    { backgroundColor: currentTheme.background, borderColor: currentTheme.border },
                    medicineType === type && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }
                  ]} 
                  onPress={() => setMedicineType(type)}
                >
                  <Text style={[
                    styles.chipText, 
                    { color: currentTheme.textSecondary },
                    medicineType === type && { color: currentTheme.card, fontWeight: 'bold' }
                  ]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('medicine.memo')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder={i18n.t('medicine.memoPlaceholder')}
              placeholderTextColor={currentTheme.textSecondary}
              value={memo}
              onChangeText={setMemo}
              multiline
            />

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: currentTheme.primary }]} onPress={handleSave}>
              <Text style={[styles.saveButtonText, { color: currentTheme.card }]}>{i18n.t('medicine.save')}</Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // ペット選択
  petSelectorWrapper: { paddingVertical: 10, borderBottomWidth: 1 },
  petIconContainer: { alignItems: 'center', marginRight: 15, opacity: 0.4 },
  petIconContainerSelected: { opacity: 1 },
  petIcon: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'transparent' },
  noImageIcon: { justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  petName: { fontSize: FONT_SIZES.standard.s, marginTop: 4, maxWidth: 60 },

  // リスト
  listContainer: { flex: 1, padding: 15 },
  listTitle: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { textAlign: 'center', marginTop: 20 },
  recordCard: { flexDirection: 'row', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  recordDateBox: { justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, paddingRight: 15, marginRight: 15 },
  recordDateText: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold' },
  recordInfo: { flex: 1, justifyContent: 'center' },
  recordType: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold' },
  recordMemo: { fontSize: FONT_SIZES.standard.s, marginTop: 4 },

  // FAB
  fab: { position: 'absolute', right: 25, bottom: 30, width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4 },

  // モーダル
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: FONT_SIZES.standard.xl, fontWeight: 'bold' },
  modalDate: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
  
  // チップ
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 15, marginRight: 8, marginBottom: 8, borderWidth: 1 },
  chipText: { fontSize: FONT_SIZES.standard.m, fontWeight: '500' },

  input: { borderWidth: 1, borderRadius: 10, padding: 15, fontSize: FONT_SIZES.standard.m, minHeight: 80, textAlignVertical: 'top' },
  saveButton: { borderRadius: 25, paddingVertical: 15, alignItems: 'center', marginTop: 25 },
  saveButtonText: { fontSize: FONT_SIZES.standard.l, fontWeight: 'bold' },
});
