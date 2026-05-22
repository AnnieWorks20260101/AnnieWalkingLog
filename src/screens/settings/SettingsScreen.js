import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_SIZES } from '../../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import i18n from '../../i18n';

export default function SettingsScreen({ navigation }) {
  const { currentTheme, themeName, changeTheme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* テーマ設定カード */}
      <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="color-palette-outline" size={24} color={currentTheme.primary} />
          <Text style={[styles.cardSubtitle, { color: currentTheme.text }]}>{i18n.t('settings.themeCardTitle')}</Text>
        </View>
        <Text style={[styles.cardDescription, { color: currentTheme.textSecondary, marginBottom: 15 }]}>
          {i18n.t('settings.themeCardDesc')}
        </Text>
        
        <View style={styles.themeGrid}>
          {['light', 'dark', 'warm', 'mint', 'midnight', 'sakura', 'ocean', 'lemon', 'lavender', 'forest'].map((themeKey) => (
            <TouchableOpacity 
              key={themeKey}
              style={[
                styles.themeButton, 
                themeName === themeKey && { borderColor: currentTheme.primary, borderWidth: 2 }
              ]}
              onPress={() => changeTheme(themeKey)}
            >
              <Text style={{ color: currentTheme.text, fontSize: FONT_SIZES.standard.s }}>
                {themeKey.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 権限の確認カード */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: currentTheme.card }]} 
        onPress={() => alert(i18n.t('record.alertComingSoon'))}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#4CAF50" />
          <Text style={[styles.cardSubtitle, { color: currentTheme.text }]}>{i18n.t('settings.permissionCardTitle')}</Text>
        </View>
        <Text style={[styles.cardDescription, { color: currentTheme.textSecondary }]}>
          {i18n.t('settings.permissionCardDesc')}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} style={styles.arrow} />
      </TouchableOpacity>

      {/* ペット登録カード */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: currentTheme.card }]} 
        onPress={() => navigation.navigate('PetList')}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="paw-outline" size={24} color={currentTheme.primary} />
          <Text style={[styles.cardSubtitle, { color: currentTheme.text }]}>{i18n.t('settings.petListCardTitle')}</Text>
        </View>
        <Text style={[styles.cardDescription, { color: currentTheme.textSecondary }]}>
          {i18n.t('settings.petListCardDesc')}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} style={styles.arrow} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  card: {
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
    fontSize: FONT_SIZES.standard.l,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cardDescription: {
    fontSize: FONT_SIZES.standard.m,
    lineHeight: 20,
    paddingRight: 30,
  },
  arrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: 5,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeButton: {
    width: '48%',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  }
});
