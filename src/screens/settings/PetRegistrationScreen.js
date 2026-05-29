import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FONT_SIZES } from '../../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenHeader from '../../components/ScreenHeader';
import i18n from '../../i18n';

// 🌟 getDocs と getDoc などを追加
import { db, storage } from '../../services/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, serverTimestamp, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function parseBirthdayToDate(birthdayStr) {
  if (!birthdayStr) return new Date();
  const normalized = birthdayStr.replace(/\//g, '-');
  const parsed = new Date(normalized);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function PetRegistrationScreen({ navigation, route }) {
  const { currentTheme } = useTheme();
  const { userId, familyId } = useAuth();
  const petId = route.params?.petId;
  const isEditMode = !!petId;

  const [loadingPet, setLoadingPet] = useState(isEditMode);
  const [photo, setPhoto] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [gender, setGender] = useState(''); 
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthdayStr, setBirthdayStr] = useState('');
  
  // 🌟 追加：グループ関連のState
  const [group, setGroup] = useState('');
  const [existingGroups, setExistingGroups] = useState([]);
  
  const [uploading, setUploading] = useState(false);

  const headerTitle = isEditMode ? i18n.t('petRegistration.editTitle') : i18n.t('petRegistration.title');

  useEffect(() => {
    if (!petId || !familyId) {
      setLoadingPet(false);
      return;
    }

    const loadPet = async () => {
      try {
        const snap = await getDoc(doc(db, 'pets', petId));
        if (!snap.exists()) {
          Alert.alert(i18n.t('common.error'), i18n.t('petRegistration.loadError'));
          navigation.goBack();
          return;
        }

        const data = snap.data();
        if (data.familyId !== familyId) {
          Alert.alert(i18n.t('common.error'), i18n.t('petRegistration.loadError'));
          navigation.goBack();
          return;
        }

        setName(data.name || '');
        setType(data.type || '');
        setGender(data.gender || '');
        setGroup(data.group || '');
        setBirthdayStr(data.birthday || '');
        setDate(parseBirthdayToDate(data.birthday));
        setExistingPhotoUrl(data.photoUrl || '');
        setPhoto(null);
      } catch (error) {
        console.error(error);
        Alert.alert(i18n.t('common.error'), i18n.t('petRegistration.loadError'));
        navigation.goBack();
      } finally {
        setLoadingPet(false);
      }
    };

    loadPet();
  }, [petId, familyId, navigation]);

  useEffect(() => {
    if (!familyId) return;
    const fetchGroups = async () => {
      try {
        const q = query(collection(db, 'pets'), where('familyId', '==', familyId));
        const querySnapshot = await getDocs(q);
        const groups = new Set(); // 重複を許さないリスト（Set）
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.group) groups.add(data.group); // グループ名が存在すれば追加
        });
        setExistingGroups(Array.from(groups)); // Setを配列に戻してStateにセット
      } catch (error) {
        console.error("グループの取得に失敗:", error);
      }
    };
    fetchGroups();
  }, [familyId]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      setBirthdayStr(`${y}/${m}/${d}`);
    }
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert(i18n.t('common.error'), i18n.t('petRegistration.nameRequired'));
      return;
    }
    if (!familyId || !userId) {
      Alert.alert(i18n.t('common.error'), i18n.t('petRegistration.saveError'));
      return;
    }
    setUploading(true);

    try {
      let photoUrl = existingPhotoUrl;
      if (photo) {
        const response = await fetch(photo);
        const blob = await response.blob();
        const storageRef = ref(storage, `families/${familyId}/pets/${Date.now()}.jpg`);
        await uploadBytes(storageRef, blob);
        photoUrl = await getDownloadURL(storageRef);
      }

      const petData = {
        name,
        type,
        birthday: birthdayStr,
        gender,
        group: group.trim(),
        photoUrl,
      };

      if (isEditMode) {
        await updateDoc(doc(db, 'pets', petId), petData);
        Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('petRegistration.updateSuccessMsg', { name }), [
          { text: i18n.t('common.ok'), onPress: () => navigation.goBack() },
        ]);
      } else {
        await addDoc(collection(db, 'pets'), {
          ...petData,
          familyId,
          createdBy: userId,
          createdAt: serverTimestamp(),
        });
        Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('petRegistration.saveSuccessMsg', { name }), [
          { text: i18n.t('common.ok'), onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('petRegistration.saveError'));
    } finally {
      setUploading(false);
    }
  };

  const displayPhotoUri = photo || existingPhotoUrl;

  if (loadingPet) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <ScreenHeader title={headerTitle} showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: currentTheme.background }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScreenHeader title={headerTitle} showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.photoContainer}>
          <TouchableOpacity style={[styles.photoButton, { backgroundColor: currentTheme.primaryMuted, borderColor: currentTheme.accentBorder }]} onPress={pickImage}>
            {displayPhotoUri ? (
              <Image source={{ uri: displayPhotoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={40} color={currentTheme.textSecondary} />
                <Text style={[styles.photoText, { color: currentTheme.textSecondary }]}>{i18n.t('petRegistration.addPhoto')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('petRegistration.nameLabel')} <Text style={[styles.required, { color: currentTheme.danger }]}>*</Text></Text>
          <TextInput style={[styles.input, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border, color: currentTheme.text }]} placeholder={i18n.t('petRegistration.namePlaceholder')} placeholderTextColor={currentTheme.textSecondary} value={name} onChangeText={setName} />
        </View>

        {/* 🌟 追加：グループ入力エリア */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('petRegistration.groupLabel')}</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border, color: currentTheme.text }]} 
            placeholder={i18n.t('petRegistration.groupPlaceholder')} 
            placeholderTextColor={currentTheme.textSecondary}
            value={group} 
            onChangeText={setGroup} 
          />
          {/* 🌟 既存のグループがあれば、タップできるタグ（チップ）として表示 */}
          {existingGroups.length > 0 && (
            <View style={styles.chipContainer}>
              {existingGroups.map((g, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.chip, 
                    { backgroundColor: currentTheme.chipBackground, borderColor: currentTheme.accentBorder },
                    group === g && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }
                  ]} 
                  onPress={() => setGroup(g)}
                >
                  <Text style={[
                    styles.chipText, 
                    { color: currentTheme.textSecondary },
                    group === g && { color: currentTheme.card, fontWeight: 'bold' }
                  ]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('petRegistration.typeLabel')}</Text>
          <TextInput style={[styles.input, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border, color: currentTheme.text }]} placeholder={i18n.t('petRegistration.typePlaceholder')} placeholderTextColor={currentTheme.textSecondary} value={type} onChangeText={setType} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('petRegistration.birthdayLabel')}</Text>
          <TouchableOpacity style={[styles.dateInput, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border }]} onPress={() => setShowDatePicker(true)}>
            <Text style={birthdayStr ? [styles.dateText, { color: currentTheme.text }] : [styles.placeholderText, { color: currentTheme.textSecondary }]}>
              {birthdayStr || i18n.t('petRegistration.birthdayPlaceholder')}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={currentTheme.textSecondary} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('petRegistration.genderLabel')}</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity style={[styles.genderButton, { borderColor: currentTheme.border, backgroundColor: currentTheme.inputBackground }, gender === '男の子' && styles.genderActiveBoy]} onPress={() => setGender('男の子')}>
              <Text style={[styles.genderText, { color: currentTheme.textSecondary }, gender === '男の子' && styles.genderTextActiveBoy]}>{i18n.t('petRegistration.genderBoy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.genderButton, { borderColor: currentTheme.border, backgroundColor: currentTheme.inputBackground }, gender === '女の子' && styles.genderActiveGirl]} onPress={() => setGender('女の子')}>
              <Text style={[styles.genderText, { color: currentTheme.textSecondary }, gender === '女の子' && styles.genderTextActiveGirl]}>{i18n.t('petRegistration.genderGirl')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.genderButton, { borderColor: currentTheme.border, backgroundColor: currentTheme.inputBackground }, gender === '未設定' && { backgroundColor: currentTheme.textSecondary, borderColor: currentTheme.textSecondary }]} onPress={() => setGender('未設定')}>
              <Text style={[styles.genderText, { color: currentTheme.textSecondary }, gender === '未設定' && { color: currentTheme.card }]}>{i18n.t('petRegistration.genderUnspecified')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: currentTheme.primary }, uploading && { backgroundColor: currentTheme.textSecondary }]} 
          onPress={handleSave}
          disabled={uploading}
        >
          <Text style={[styles.saveButtonText, { color: currentTheme.card }]}>
            {uploading ? i18n.t('petRegistration.saving') : isEditMode ? i18n.t('petRegistration.update') : i18n.t('petRegistration.save')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  photoContainer: { alignItems: 'center', marginVertical: 20 },
  photoButton: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2 },
  photoPlaceholder: { alignItems: 'center' },
  photo: { width: '100%', height: '100%' },
  photoText: { fontSize: FONT_SIZES.standard.s, marginTop: 5 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold', marginBottom: 8 },
  required: { },
  input: { borderWidth: 1, borderRadius: 10, padding: 15, fontSize: FONT_SIZES.standard.m },
  
  // 🌟 追加：チップ（タグ）のスタイル
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  chip: { 
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, 
    marginRight: 8, marginBottom: 8, borderWidth: 1 
  },
  chipText: { fontSize: FONT_SIZES.standard.m },

  dateInput: { borderWidth: 1, borderRadius: 10, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: FONT_SIZES.standard.m },
  placeholderText: { fontSize: FONT_SIZES.standard.m },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  genderButton: { flex: 1, paddingVertical: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  genderText: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold' },
  genderActiveBoy: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  genderActiveGirl: { backgroundColor: '#FF6B81', borderColor: '#FF6B81' },
  genderTextActiveBoy: { color: '#fff' },
  genderTextActiveGirl: { color: '#fff' },
  saveButton: { borderRadius: 25, paddingVertical: 15, alignItems: 'center', marginTop: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  saveButtonText: { fontSize: FONT_SIZES.standard.l, fontWeight: 'bold' },
});
