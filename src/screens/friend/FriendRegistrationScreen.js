import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import ScreenHeader from '../../components/ScreenHeader';
import i18n from '../../i18n';

import { db } from '../../services/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { usePlanTier } from '../../hooks/usePlanTier';
import { canAddFriend } from '../../constants/planEntitlements';
import { showPlanLimitAlert } from '../../utils/planLimitAlert';

import { uploadFriendPhotoFromUri } from '../../services/friendPhotoUpload';

export default function FriendRegistrationScreen({ navigation, route }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { userId, familyId } = useAuth();
  const { tier, entitlements } = usePlanTier();
  const friendId = route.params?.friendId;
  const isEditMode = !!friendId;

  const [loadingFriend, setLoadingFriend] = useState(isEditMode);
  const [photo, setPhoto] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [breed, setBreed] = useState('');
  const [memo, setMemo] = useState('');
  const [uploading, setUploading] = useState(false);

  const headerTitle = isEditMode ? i18n.t('friendRegistration.editTitle') : i18n.t('friendRegistration.title');

  useEffect(() => {
    if (!friendId || !familyId) {
      setLoadingFriend(false);
      return;
    }

    const loadFriend = async () => {
      try {
        const snap = await getDoc(doc(db, 'pet_friends', friendId));
        if (!snap.exists()) {
          Alert.alert(i18n.t('common.error'), i18n.t('friendRegistration.loadError'));
          navigation.goBack();
          return;
        }

        const data = snap.data();
        if (data.familyId !== familyId) {
          Alert.alert(i18n.t('common.error'), i18n.t('friendRegistration.loadError'));
          navigation.goBack();
          return;
        }

        setName(data.name || '');
        setGender(data.gender || '');
        setBreed(data.breed || '');
        setMemo(data.memo || '');
        setExistingPhotoUrl(data.photoUrl || '');
        setPhoto(null);
      } catch (error) {
        console.error(error);
        Alert.alert(i18n.t('common.error'), i18n.t('friendRegistration.loadError'));
        navigation.goBack();
      } finally {
        setLoadingFriend(false);
      }
    };

    loadFriend();
  }, [friendId, familyId, navigation]);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(i18n.t('common.error'), i18n.t('friendRegistration.photoPermissionDenied'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhoto(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    if (Platform.OS === 'ios') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(i18n.t('common.error'), i18n.t('friendRegistration.photoPermissionDenied'));
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhoto(result.assets[0].uri);
    }
  };

  const openPhotoOptions = () => {
    Alert.alert(i18n.t('friendRegistration.addPhoto'), undefined, [
      { text: i18n.t('friendRegistration.takePhoto'), onPress: takePhoto },
      { text: i18n.t('friendRegistration.chooseFromLibrary'), onPress: pickFromLibrary },
      { text: i18n.t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert(i18n.t('common.error'), i18n.t('friendRegistration.nameRequired'));
      return;
    }
    if (!familyId || !userId) {
      Alert.alert(i18n.t('common.error'), i18n.t('friendRegistration.saveError'));
      return;
    }
    setUploading(true);

    try {
      let photoUrl = existingPhotoUrl?.trim() || '';
      if (photo) {
        photoUrl = await uploadFriendPhotoFromUri(photo, familyId);
        if (!photoUrl?.startsWith('http')) {
          throw new Error('uploadFriendPhoto: photoUrl missing after upload');
        }
      }

      const friendData = { name, gender, breed: breed.trim(), memo: memo.trim(), photoUrl };

      if (isEditMode) {
        await updateDoc(doc(db, 'pet_friends', friendId), friendData);
        Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('friendRegistration.updateSuccessMsg', { name }), [
          { text: i18n.t('common.ok'), onPress: () => navigation.goBack() },
        ]);
      } else {
        const existingFriends = await getDocs(
          query(collection(db, 'pet_friends'), where('familyId', '==', familyId))
        );
        if (!canAddFriend(existingFriends.size, entitlements)) {
          setUploading(false);
          showPlanLimitAlert({ navigation, limitKey: 'friend', tier });
          return;
        }

        await addDoc(collection(db, 'pet_friends'), {
          ...friendData,
          familyId,
          createdBy: userId,
          createdAt: serverTimestamp(),
        });
        Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('friendRegistration.saveSuccessMsg', { name }), [
          { text: i18n.t('common.ok'), onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('friend save error:', error);
      const code = error?.code ? String(error.code) : '';
      const detail = error?.message ? String(error.message) : '';
      const isStorageError =
        code.startsWith('storage/') || detail.toLowerCase().includes('storage') || detail.includes('uploadFriendPhoto');
      const base = isStorageError
        ? i18n.t('friendRegistration.photoUploadError')
        : i18n.t('friendRegistration.saveError');
      const suffix = code || detail ? `\n(${code || detail})` : '';
      Alert.alert(i18n.t('common.error'), `${base}${suffix}`);
    } finally {
      setUploading(false);
    }
  };

  const performDeleteFriend = async () => {
    if (!friendId) {
      return;
    }
    setUploading(true);
    try {
      await deleteDoc(doc(db, 'pet_friends', friendId));
      const displayName = name?.trim() || i18n.t('friendRegistration.title');
      Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('friendRegistration.deleteSuccessMsg', { name: displayName }), [
        { text: i18n.t('common.ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('friend delete error:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('friendRegistration.deleteError'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFriend = () => {
    if (!isEditMode || !friendId || uploading) {
      return;
    }
    const displayName = name?.trim() || i18n.t('friendRegistration.title');
    Alert.alert(
      i18n.t('friendRegistration.deleteConfirmTitle'),
      i18n.t('friendRegistration.deleteConfirmMsg', { name: displayName }),
      [
        { text: i18n.t('walk.cancel'), style: 'cancel' },
        {
          text: i18n.t('friendRegistration.delete'),
          style: 'destructive',
          onPress: performDeleteFriend,
        },
      ]
    );
  };

  const displayPhotoUri = photo || existingPhotoUrl;

  if (loadingFriend) {
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title={headerTitle} showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.photoContainer}>
          <TouchableOpacity
            style={[styles.photoButton, { backgroundColor: currentTheme.primaryMuted, borderColor: currentTheme.accentBorder }]}
            onPress={openPhotoOptions}
          >
            {displayPhotoUri ? (
              <Image source={{ uri: displayPhotoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={40} color={currentTheme.textSecondary} />
                <Text style={[styles.photoText, { color: currentTheme.textSecondary }]}>
                  {i18n.t('friendRegistration.addPhoto')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>
            {i18n.t('friendRegistration.nameLabel')}{' '}
            <Text style={[styles.required, { color: currentTheme.danger }]}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border, color: currentTheme.text }]}
            placeholder={i18n.t('friendRegistration.namePlaceholder')}
            placeholderTextColor={currentTheme.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('friendRegistration.breedLabel')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border, color: currentTheme.text }]}
            placeholder={i18n.t('friendRegistration.breedPlaceholder')}
            placeholderTextColor={currentTheme.textSecondary}
            value={breed}
            onChangeText={setBreed}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('friendRegistration.genderLabel')}</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderButton, { borderColor: currentTheme.border, backgroundColor: currentTheme.inputBackground }, gender === '男の子' && styles.genderActiveBoy]}
              onPress={() => setGender('男の子')}
            >
              <Text style={[styles.genderText, { color: currentTheme.textSecondary }, gender === '男の子' && styles.genderTextActiveBoy]}>
                {i18n.t('friendRegistration.genderBoy')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, { borderColor: currentTheme.border, backgroundColor: currentTheme.inputBackground }, gender === '女の子' && styles.genderActiveGirl]}
              onPress={() => setGender('女の子')}
            >
              <Text style={[styles.genderText, { color: currentTheme.textSecondary }, gender === '女の子' && styles.genderTextActiveGirl]}>
                {i18n.t('friendRegistration.genderGirl')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                { borderColor: currentTheme.border, backgroundColor: currentTheme.inputBackground },
                gender === '未設定' && { backgroundColor: currentTheme.textSecondary, borderColor: currentTheme.textSecondary },
              ]}
              onPress={() => setGender('未設定')}
            >
              <Text style={[styles.genderText, { color: currentTheme.textSecondary }, gender === '未設定' && { color: currentTheme.card }]}>
                {i18n.t('friendRegistration.genderUnspecified')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('friendRegistration.memoLabel')}</Text>
          <TextInput
            style={[
              styles.input,
              styles.memoInput,
              { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border, color: currentTheme.text },
            ]}
            placeholder={i18n.t('friendRegistration.memoPlaceholder')}
            placeholderTextColor={currentTheme.textSecondary}
            value={memo}
            onChangeText={setMemo}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: currentTheme.primary },
            uploading && { backgroundColor: currentTheme.textSecondary },
          ]}
          onPress={handleSave}
          disabled={uploading}
        >
          <Text style={[styles.saveButtonText, { color: currentTheme.card }]}>
            {uploading ? i18n.t('friendRegistration.saving') : isEditMode ? i18n.t('friendRegistration.update') : i18n.t('friendRegistration.save')}
          </Text>
        </TouchableOpacity>

        {isEditMode ? (
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: currentTheme.danger }, uploading && styles.deleteButtonDisabled]}
            onPress={handleDeleteFriend}
            disabled={uploading}
            activeOpacity={0.85}
          >
            <Text style={[styles.deleteButtonText, { color: currentTheme.danger }]}>
              {i18n.t('friendRegistration.delete')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (fs) => ({
  container: { flex: 1 },
  scroll: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  photoContainer: { alignItems: 'center', marginVertical: 20 },
  photoButton: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2 },
  photoPlaceholder: { alignItems: 'center' },
  photo: { width: '100%', height: '100%' },
  photoText: { fontSize: fs.s, marginTop: 5 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: fs.m, fontWeight: 'bold', marginBottom: 8 },
  required: {},
  input: { borderWidth: 1, borderRadius: 10, padding: 15, fontSize: fs.m },
  memoInput: { minHeight: 100 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  genderButton: { flex: 1, paddingVertical: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  genderText: { fontSize: fs.m, fontWeight: 'bold' },
  genderActiveBoy: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  genderActiveGirl: { backgroundColor: '#FF6B81', borderColor: '#FF6B81' },
  genderTextActiveBoy: { color: '#fff' },
  genderTextActiveGirl: { color: '#fff' },
  saveButton: { borderRadius: 25, paddingVertical: 15, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  saveButtonText: { fontSize: fs.l, fontWeight: 'bold' },
  deleteButton: {
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 2,
  },
  deleteButtonDisabled: { opacity: 0.5 },
  deleteButtonText: { fontWeight: 'bold', fontSize: fs.m },
});
