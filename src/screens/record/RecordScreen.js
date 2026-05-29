import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../../services/firebase';
import { FONT_SIZES } from '../../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, doc, updateDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import SimpleWeightChart from '../../components/SimpleWeightChart';
import ScreenHeader from '../../components/ScreenHeader';
import PetSelector from '../../components/PetSelector';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import i18n from '../../i18n';

const CHART_WIDTH = Dimensions.get('window').width - 72;
const WINDOW_HEIGHT = Dimensions.get('window').height;
/** 13 mini など縦が狭い端末向けにカレンダー高さを抑える */
const COMPACT_CALENDAR_HEIGHT = WINDOW_HEIGHT < 820 ? 258 : 288;

function buildCalendarTheme(currentTheme) {
  return {
    selectedDayBackgroundColor: currentTheme.primary,
    todayTextColor: currentTheme.primary,
    arrowColor: currentTheme.primary,
    calendarBackground: currentTheme.cardTinted,
    textSectionTitleColor: currentTheme.textSecondary,
    dayTextColor: currentTheme.text,
    textDisabledColor: currentTheme.border,
    monthTextColor: currentTheme.text,
    textDayFontSize: 13,
    textMonthFontSize: 15,
    textDayHeaderFontSize: 11,
    'stylesheet.calendar.main': {
      week: {
        marginTop: 1,
        marginBottom: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
      },
    },
    'stylesheet.calendar.header': {
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 8,
        paddingRight: 8,
        marginTop: 2,
        marginBottom: 2,
        alignItems: 'center',
      },
      monthText: {
        fontSize: 15,
        fontWeight: '600',
        color: currentTheme.text,
      },
    },
    'stylesheet.day.basic': {
      base: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
      },
      text: {
        fontSize: 13,
        fontWeight: '500',
      },
    },
  };
}

const CATEGORIES = [
  { id: 'weight', emoji: '⚖️', labelKey: 'record.menuWeight', collection: 'weight_records', main: 'chart', recordEmoji: '⚖️' },
  { id: 'medicine', emoji: '💊', labelKey: 'record.menuMedicine', collection: 'medicine_records', main: 'calendar', recordEmoji: '💊' },
  { id: 'trimming', emoji: '✂️', labelKey: 'record.menuTrimming', collection: 'trimming_records', main: 'calendar', recordEmoji: '✂️' },
  { id: 'hospital', emoji: '🏥', labelKey: 'record.menuHospital', collection: 'hospital_records', main: 'calendar', recordEmoji: '🏥' },
];

function formatDateToYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(ymd) {
  return ymd ? ymd.replace(/-/g, '/') : '';
}

function formatChartLabel(ymd) {
  if (!ymd) return '';
  const [, month, day] = ymd.split('-');
  return `${parseInt(month, 10)}/${parseInt(day, 10)}`;
}

function getRecordTypeLabel(item) {
  if (Array.isArray(item.types) && item.types.length > 0) {
    return item.types.join('、');
  }
  return item.type || '';
}

function parseWeight(value) {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
  }
  return null;
}

function parseDateFromYmd(ymd) {
  if (!ymd) return new Date();
  const parsed = new Date(ymd);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function getRecordTypesArray(item) {
  if (Array.isArray(item.types) && item.types.length > 0) return item.types;
  if (item.type) return [item.type];
  return [];
}

function getTypeOptions(categoryId) {
  if (categoryId === 'medicine') {
    return [
      i18n.t('medicine.types.fleaTick'),
      i18n.t('medicine.types.filaria'),
      i18n.t('medicine.types.vaccine'),
      i18n.t('medicine.types.prescription'),
      i18n.t('medicine.types.other'),
    ];
  }
  if (categoryId === 'trimming') {
    return [
      i18n.t('trimming.types.cut'),
      i18n.t('trimming.types.shampoo'),
      i18n.t('trimming.types.nail'),
      i18n.t('trimming.types.ear'),
      i18n.t('trimming.types.full'),
      i18n.t('trimming.types.other'),
    ];
  }
  if (categoryId === 'hospital') {
    return [
      i18n.t('hospital.types.checkup'),
      i18n.t('hospital.types.vaccine'),
      i18n.t('hospital.types.surgery'),
      i18n.t('hospital.types.test'),
      i18n.t('hospital.types.hospitalization'),
      i18n.t('hospital.types.other'),
    ];
  }
  return [];
}

export default function RecordScreen() {
  const { currentTheme } = useTheme();
  const { userId, familyId } = useAuth();
  const { pets, loading: petsLoading } = useFamilyPets(familyId);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('weight');

  const [selectedDate, setSelectedDate] = useState(formatDateToYMD(new Date()));
  const [records, setRecords] = useState([]);
  const [markedDates, setMarkedDates] = useState({});

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [modalRecordDateStr, setModalRecordDateStr] = useState(formatDateToYMD(new Date()));
  const [weight, setWeight] = useState('');
  const [memo, setMemo] = useState('');
  const [recordType, setRecordType] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [modalDate, setModalDate] = useState(new Date());
  const [modalDateStr, setModalDateStr] = useState(formatDateToYMD(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const activeCategory = useMemo(
    () => CATEGORIES.find((c) => c.id === selectedCategory) ?? CATEGORIES[0],
    [selectedCategory]
  );
  const typeOptions = useMemo(() => getTypeOptions(selectedCategory), [selectedCategory]);
  const isCalendarCategory = activeCategory.main === 'calendar';
  const isMultiSelectCategory =
    selectedCategory === 'trimming' || selectedCategory === 'medicine' || selectedCategory === 'hospital';

  const calendarTheme = useMemo(() => buildCalendarTheme(currentTheme), [currentTheme]);

  const weightChartData = useMemo(() => {
    if (selectedCategory !== 'weight') return null;
    const withWeight = records
      .map((r) => ({ ...r, weightValue: parseWeight(r.weight) }))
      .filter((r) => r.weightValue != null);
    if (withWeight.length === 0) return null;
    const sorted = withWeight.sort((a, b) => a.date.localeCompare(b.date));
    return {
      labels: sorted.map((r) => formatChartLabel(r.date)),
      data: sorted.map((r) => r.weightValue),
    };
  }, [records, selectedCategory]);

  useEffect(() => {
    if (pets.length === 0) {
      setSelectedPetId(null);
      return;
    }
    setSelectedPetId((prev) => (prev && pets.some((p) => p.id === prev) ? prev : pets[0].id));
  }, [pets]);

  useEffect(() => {
    if (isMultiSelectCategory) {
      setSelectedTypes([]);
      setRecordType('');
    } else if (typeOptions.length > 0) {
      setRecordType(typeOptions[0]);
      setSelectedTypes([]);
    }
  }, [selectedCategory, isMultiSelectCategory, typeOptions]);

  useEffect(() => {
    if (!selectedPetId || !familyId) {
      setRecords([]);
      setMarkedDates({});
      return;
    }

    setRecords([]);
    setMarkedDates({});

    const q = query(
      collection(db, activeCategory.collection),
      where('familyId', '==', familyId),
      where('petId', '==', selectedPetId),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = [];
        const marks = {};
        snapshot.forEach((doc) => {
          const record = { id: doc.id, ...doc.data() };
          data.push(record);
          if (isCalendarCategory && record.date) {
            marks[record.date] = { marked: true, dotColor: currentTheme.primary };
          }
        });
        setRecords(data);
        setMarkedDates(marks);
      },
      (error) => console.error(`${activeCategory.collection} snapshot error:`, error)
    );

    return () => unsubscribe();
  }, [selectedPetId, selectedCategory, activeCategory.collection, isCalendarCategory, currentTheme.primary, familyId]);

  const getMarkedDates = () => ({
    ...markedDates,
    [selectedDate]: { ...markedDates[selectedDate], selected: true, selectedColor: currentTheme.primary },
  });

  const closeModal = () => {
    setModalVisible(false);
    setEditingRecordId(null);
  };

  const openModal = () => {
    if (!selectedPetId) {
      Alert.alert(i18n.t('record.alertNoPet'));
      return;
    }
    const today = new Date();
    setEditingRecordId(null);
    if (isCalendarCategory) {
      setModalRecordDateStr(selectedDate);
      if (isMultiSelectCategory) {
        setSelectedTypes([]);
      } else if (typeOptions.length > 0) {
        setRecordType(typeOptions[0]);
      }
      setMemo('');
      setModalVisible(true);
    } else {
      setModalDate(today);
      setModalDateStr(formatDateToYMD(today));
      setWeight('');
      setMemo('');
      setModalVisible(true);
    }
  };

  const openModalForEdit = (item) => {
    if (!selectedPetId) return;
    setEditingRecordId(item.id);
    if (selectedCategory === 'weight') {
      const w = parseWeight(item.weight);
      setModalDateStr(item.date || formatDateToYMD(new Date()));
      setModalDate(parseDateFromYmd(item.date));
      setWeight(w != null ? String(w) : '');
      setMemo(item.memo || '');
    } else if (isCalendarCategory) {
      setModalRecordDateStr(item.date || selectedDate);
      if (isMultiSelectCategory) {
        setSelectedTypes(getRecordTypesArray(item));
        setRecordType('');
      } else {
        setRecordType(item.type || (typeOptions.length > 0 ? typeOptions[0] : ''));
        setSelectedTypes([]);
      }
      setMemo(item.memo || '');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (selectedCategory === 'weight') {
        const parsed = parseFloat(weight);
        if (!weight.trim() || isNaN(parsed) || parsed <= 0) {
          Alert.alert(i18n.t('common.error'), i18n.t('weight.weightRequired'));
          return;
        }
        const payload = {
          date: modalDateStr,
          weight: parsed,
          memo: memo.trim(),
        };
        if (editingRecordId) {
          await updateDoc(doc(db, 'weight_records', editingRecordId), payload);
        } else {
          await addDoc(collection(db, 'weight_records'), {
            ...payload,
            familyId,
            petId: selectedPetId,
            userId,
            createdAt: serverTimestamp(),
          });
        }
      } else if (isMultiSelectCategory) {
        if (selectedTypes.length === 0) {
          Alert.alert(i18n.t('common.error'), i18n.t(`${selectedCategory}.typesRequired`));
          return;
        }
        const payload = {
          date: modalRecordDateStr,
          types: selectedTypes,
          type: selectedTypes.join('、'),
          memo: memo.trim(),
        };
        if (editingRecordId) {
          await updateDoc(doc(db, activeCategory.collection, editingRecordId), payload);
        } else {
          await addDoc(collection(db, activeCategory.collection), {
            ...payload,
            familyId,
            petId: selectedPetId,
            userId,
            createdAt: serverTimestamp(),
          });
        }
      } else {
        const payload = {
          date: modalRecordDateStr,
          type: recordType,
          memo: memo.trim(),
        };
        if (editingRecordId) {
          await updateDoc(doc(db, activeCategory.collection, editingRecordId), payload);
        } else {
          await addDoc(collection(db, activeCategory.collection), {
            ...payload,
            familyId,
            petId: selectedPetId,
            userId,
            createdAt: serverTimestamp(),
          });
        }
      }
      closeModal();
      setWeight('');
      setMemo('');
      setSelectedTypes([]);
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t(`${selectedCategory}.saveError`));
    }
  };

  const toggleSelectedType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const onChangeModalDate = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setModalDate(selected);
      setModalDateStr(formatDateToYMD(selected));
    }
  };

  const renderRecordItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.recordCard,
        { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder, borderLeftColor: currentTheme.primary },
      ]}
      onPress={() => openModalForEdit(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.recordDateBox, { borderColor: currentTheme.border }]}>
        <Text style={[styles.recordDateText, { color: currentTheme.textSecondary }]}>{formatDateDisplay(item.date)}</Text>
      </View>
      <View style={styles.recordInfo}>
        {selectedCategory === 'weight' ? (
          <Text style={[styles.recordMain, { color: currentTheme.text }]}>
            {parseWeight(item.weight) ?? '-'} {i18n.t('weight.unit')}
          </Text>
        ) : (
          <Text style={[styles.recordMain, { color: currentTheme.text }]}>
            {activeCategory.recordEmoji} {getRecordTypeLabel(item)}
          </Text>
        )}
        {item.memo ? <Text style={[styles.recordMemo, { color: currentTheme.textSecondary }]}>{item.memo}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} style={styles.recordChevron} />
    </TouchableOpacity>
  );

  const isEditMode = !!editingRecordId;
  const modalTitle = isEditMode
    ? i18n.t(`${selectedCategory}.editRecordTitle`)
    : i18n.t(`${selectedCategory}.recordTitle`);

  if (petsLoading) {
    return (
      <View style={[styles.center, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('record.title')} />

      {/* 段①: ペット選択 */}
      <View style={[styles.petSelectorWrapper, { borderBottomColor: currentTheme.accentBorder }]}>
        <PetSelector
          pets={pets}
          selectedPetId={selectedPetId}
          onSelectPet={setSelectedPetId}
        />
      </View>

      {/* 段②: 項目選択 */}
      <View style={[styles.categoryWrapper, { borderBottomColor: currentTheme.accentBorder }]}>
        <View style={styles.menuGrid}>
          {CATEGORIES.map((cat) => {
            const isSelected = cat.id === selectedCategory;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.menuItem,
                  { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder },
                  isSelected && {
                    backgroundColor: currentTheme.selectedFill,
                    borderColor: currentTheme.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={styles.menuEmoji}>{cat.emoji}</Text>
                <Text style={[styles.menuText, { color: currentTheme.textSecondary }, isSelected && { color: currentTheme.primary, fontWeight: 'bold' }]}>
                  {i18n.t(cat.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 段③: グラフ or カレンダー */}
      {activeCategory.main === 'chart' ? (
        <View
          style={[
            styles.chartSection,
            { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{i18n.t('weight.chartTitle')}</Text>
          {weightChartData ? (
            <SimpleWeightChart labels={weightChartData.labels} data={weightChartData.data} theme={currentTheme} width={CHART_WIDTH} />
          ) : (
            <Text style={[styles.chartEmptyText, { color: currentTheme.textSecondary }]}>{i18n.t('weight.noChartData')}</Text>
          )}
        </View>
      ) : (
        <View
          style={[
            styles.calendarWrapper,
            { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder },
          ]}
        >
          <Calendar
            style={[styles.calendar, { height: COMPACT_CALENDAR_HEIGHT }]}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            hideExtraDays
            enableSwipeMonths
            theme={calendarTheme}
          />
        </View>
      )}

      {/* 段④: 直近の記録 */}
      <View style={styles.listContainer}>
        <Text style={[styles.listTitle, { color: currentTheme.text }]}>{i18n.t('record.recentRecords')}</Text>
        {records.length === 0 ? (
          <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>{i18n.t(`${selectedCategory}.noRecords`)}</Text>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            renderItem={renderRecordItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: currentTheme.primary }]} onPress={openModal}>
        <Ionicons name="add" size={32} color={currentTheme.card} />
      </TouchableOpacity>

      {/* 入力モーダル */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.cardTinted }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>{modalTitle}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={28} color={currentTheme.textSecondary} />
              </TouchableOpacity>
            </View>

            {isCalendarCategory ? (
              <>
                <Text style={[styles.modalDate, { color: currentTheme.primary }]}>
                  {i18n.t(`${selectedCategory}.date`)}: {formatDateDisplay(modalRecordDateStr)}
                </Text>
                <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t(`${selectedCategory}.type`)}</Text>
                <View style={styles.chipContainer}>
                  {typeOptions.map((type) => {
                    const isChipSelected = isMultiSelectCategory
                      ? selectedTypes.includes(type)
                      : recordType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.chip,
                          { backgroundColor: currentTheme.chipBackground, borderColor: currentTheme.accentBorder },
                          isChipSelected && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary },
                        ]}
                        onPress={() => (isMultiSelectCategory ? toggleSelectedType(type) : setRecordType(type))}
                      >
                        <Text style={[styles.chipText, { color: currentTheme.textSecondary }, isChipSelected && { color: currentTheme.card, fontWeight: 'bold' }]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('weight.date')}</Text>
                <TouchableOpacity
                  style={[styles.dateButton, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.dateButtonText, { color: currentTheme.text }]}>
                    {modalDateStr ? formatDateDisplay(modalDateStr) : i18n.t('weight.datePlaceholder')}
                  </Text>
                  <Ionicons name="calendar-outline" size={22} color={currentTheme.textSecondary} />
                </TouchableOpacity>
                {showDatePicker && <DateTimePicker value={modalDate} mode="date" display="default" onChange={onChangeModalDate} />}
                <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('weight.weight')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border, color: currentTheme.text }]}
                  placeholder={i18n.t('weight.weightPlaceholder')}
                  placeholderTextColor={currentTheme.textSecondary}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                />
              </>
            )}

            <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t(`${selectedCategory}.memo`)}</Text>
            <TextInput
              style={[styles.input, styles.memoInput, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder={i18n.t(`${selectedCategory}.memoPlaceholder`)}
              placeholderTextColor={currentTheme.textSecondary}
              value={memo}
              onChangeText={setMemo}
              multiline
            />

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: currentTheme.primary }]} onPress={handleSave}>
              <Text style={[styles.saveButtonText, { color: currentTheme.card }]}>
                {isEditMode ? i18n.t(`${selectedCategory}.update`) : i18n.t(`${selectedCategory}.save`)}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  petSelectorWrapper: { borderBottomWidth: 1, marginTop: 8, paddingTop: 12, paddingBottom: 12, marginBottom: 4 },
  categoryWrapper: { borderBottomWidth: 1, paddingBottom: 8, marginBottom: 2 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
  menuItem: { width: '23%', padding: 10, borderRadius: 12, alignItems: 'center', marginBottom: 6, borderWidth: 1 },
  menuEmoji: { fontSize: FONT_SIZES.standard.xl, marginBottom: 4 },
  menuText: { fontSize: FONT_SIZES.standard.s, fontWeight: '600' },

  calendarWrapper: {
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  calendar: {
    width: '100%',
  },
  chartSection: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  sectionTitle: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold', marginBottom: 8, alignSelf: 'flex-start', marginLeft: 8 },
  chartEmptyText: { fontSize: FONT_SIZES.standard.s, textAlign: 'center', paddingVertical: 24, paddingHorizontal: 16 },

  listContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 4, minHeight: 120 },
  listTitle: { fontSize: FONT_SIZES.standard.l, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { textAlign: 'center', marginTop: 20, lineHeight: 22 },
  recordCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  recordDateBox: { justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, paddingRight: 15, marginRight: 15 },
  recordDateText: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold' },
  recordInfo: { flex: 1, justifyContent: 'center' },
  recordChevron: { alignSelf: 'center', marginLeft: 8 },
  recordMain: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold' },
  recordMemo: { fontSize: FONT_SIZES.standard.s, marginTop: 4 },

  fab: { position: 'absolute', right: 25, bottom: 30, width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: FONT_SIZES.standard.xl, fontWeight: 'bold' },
  modalDate: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 15, marginRight: 8, marginBottom: 8, borderWidth: 1 },
  chipText: { fontSize: FONT_SIZES.standard.m, fontWeight: '500' },
  dateButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 15 },
  dateButtonText: { fontSize: FONT_SIZES.standard.m },
  input: { borderWidth: 1, borderRadius: 10, padding: 15, fontSize: FONT_SIZES.standard.m },
  memoInput: { minHeight: 80, textAlignVertical: 'top' },
  saveButton: { borderRadius: 25, paddingVertical: 15, alignItems: 'center', marginTop: 25 },
  saveButtonText: { fontSize: FONT_SIZES.standard.l, fontWeight: 'bold' },
});
