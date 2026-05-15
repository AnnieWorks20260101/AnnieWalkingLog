import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

// 🌟 getDocs と getDoc などを追加
import { db, storage } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function PetRegistrationScreen({ navigation }) {
  const [photo, setPhoto] = useState(null);
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

  // 🌟 画面を開いた時に「既存のグループ一覧」を取得する
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "pets"));
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
  }, []);

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
      Alert.alert("エラー", "名前は入力必須です🐾");
      return;
    }
    setUploading(true);

    try {
      let photoUrl = "";
      if (photo) {
        const response = await fetch(photo);
        const blob = await response.blob();
        const storageRef = ref(storage, `pets/${Date.now()}.jpg`);
        await uploadBytes(storageRef, blob);
        photoUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "pets"), {
        name,
        type,
        birthday: birthdayStr,
        gender,
        group: group.trim(), // 🌟 追加：前後の空白を消して保存
        photoUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert("保存完了", `${name} を登録しました！`, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("エラー", "保存に失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={40} color="#ccc" />
                <Text style={styles.photoText}>写真を追加</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>お名前 <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} placeholder="例: アニー" value={name} onChangeText={setName} />
        </View>

        {/* 🌟 追加：グループ入力エリア */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>グループ (任意)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="例: 自宅、実家、〇〇家 など" 
            value={group} 
            onChangeText={setGroup} 
          />
          {/* 🌟 既存のグループがあれば、タップできるタグ（チップ）として表示 */}
          {existingGroups.length > 0 && (
            <View style={styles.chipContainer}>
              {existingGroups.map((g, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.chip, group === g && styles.chipActive]} 
                  onPress={() => setGroup(g)}
                >
                  <Text style={[styles.chipText, group === g && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>種類 (犬種・猫種など)</Text>
          <TextInput style={styles.input} placeholder="例: トイプードル、ミックス" value={type} onChangeText={setType} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>お誕生日</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
            <Text style={birthdayStr ? styles.dateText : styles.placeholderText}>
              {birthdayStr || "日付を選択してください"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>性別</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity style={[styles.genderButton, gender === '男の子' && styles.genderActiveBoy]} onPress={() => setGender('男の子')}>
              <Text style={[styles.genderText, gender === '男の子' && styles.genderTextActive]}>男の子</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.genderButton, gender === '女の子' && styles.genderActiveGirl]} onPress={() => setGender('女の子')}>
              <Text style={[styles.genderText, gender === '女の子' && styles.genderTextActive]}>女の子</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.genderButton, gender === '未設定' && styles.genderActiveOther]} onPress={() => setGender('未設定')}>
              <Text style={[styles.genderText, gender === '未設定' && styles.genderTextActive]}>未設定</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, uploading && { backgroundColor: '#ccc' }]} 
          onPress={handleSave}
          disabled={uploading}
        >
          <Text style={styles.saveButtonText}>{uploading ? "保存中..." : "登録する"}</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  photoContainer: { alignItems: 'center', marginVertical: 20 },
  photoButton: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: '#eee' },
  photoPlaceholder: { alignItems: 'center' },
  photo: { width: '100%', height: '100%' },
  photoText: { color: '#888', fontSize: 12, marginTop: 5 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  required: { color: '#FF6F61' },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 15, fontSize: 16, color: '#333' },
  
  // 🌟 追加：チップ（タグ）のスタイル
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  chip: { 
    backgroundColor: '#eee', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, 
    marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#ddd' 
  },
  chipActive: { backgroundColor: '#FF6F61', borderColor: '#FF6F61' },
  chipText: { color: '#555', fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },

  dateInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 16, color: '#333' },
  placeholderText: { fontSize: 16, color: '#999' },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  genderButton: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 10, alignItems: 'center', marginHorizontal: 5, backgroundColor: '#f9f9f9' },
  genderText: { fontSize: 14, color: '#666', fontWeight: 'bold' },
  genderTextActive: { color: '#fff' },
  genderActiveBoy: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  genderActiveGirl: { backgroundColor: '#FF6B81', borderColor: '#FF6B81' },
  genderActiveOther: { backgroundColor: '#999', borderColor: '#999' },
  saveButton: { backgroundColor: '#FF6F61', borderRadius: 25, paddingVertical: 15, alignItems: 'center', marginTop: 30, shadowColor: '#FF6F61', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});