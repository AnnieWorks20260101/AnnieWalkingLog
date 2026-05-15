import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* 権限の確認カード */}
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => alert('権限の確認機能は準備中です🐾')}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#4CAF50" />
          <Text style={styles.cardSubtitle}>権限の確認</Text>
        </View>
        <Text style={styles.cardDescription}>
          位置情報や通知の設定が正しく行われているか確認します。
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.arrow} />
      </TouchableOpacity>

      {/* ペット登録カード */}
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('PetList')}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="paw-outline" size={24} color="#FF6F61" />
          <Text style={styles.cardSubtitle}>ペット登録</Text>
        </View>
        <Text style={styles.cardDescription}>
          ペットの情報を登録・編集します。
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.arrow} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    // 影の設定（iOS/Android）
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
    paddingRight: 30,
  },
  arrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: 5,
  }
});