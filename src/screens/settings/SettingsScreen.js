import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_SIZES, COLORS } from '../../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import i18n from '../../i18n';

export default function SettingsScreen({ navigation }) {
  const { currentTheme, themeName, changeTheme } = useTheme();
  const { userId, familyId, joinFamily } = useAuth();
  const [joinFamilyIdInput, setJoinFamilyIdInput] = useState('');

  const handleJoinFamily = async () => {
    const result = await joinFamily(joinFamilyIdInput);
    if (result.success) {
      Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('settings.joinFamilySuccess'));
      setJoinFamilyIdInput('');
      return;
    }
    if (result.reason === 'notFound') {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.joinFamilyNotFound'));
      return;
    }
    Alert.alert(i18n.t('common.error'), i18n.t('settings.joinFamilyInvalid'));
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('settings.title')} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* 家族グループ */}
      <View style={[styles.card, styles.themedCard, { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder, borderLeftColor: currentTheme.primary }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="people-outline" size={24} color={currentTheme.primary} />
          <Text style={[styles.cardSubtitle, { color: currentTheme.text }]}>{i18n.t('settings.familyCardTitle')}</Text>
        </View>
        <Text style={[styles.cardDescription, { color: currentTheme.textSecondary, marginBottom: 12 }]}>
          {i18n.t('settings.familyCardDesc')}
        </Text>
        <Text style={[styles.idLabel, { color: currentTheme.textSecondary }]}>{i18n.t('settings.familyIdLabel')}</Text>
        <Text style={[styles.idValue, { color: currentTheme.text }]} selectable>
          {familyId || '-'}
        </Text>
        <Text style={[styles.idLabel, { color: currentTheme.textSecondary, marginTop: 10 }]}>{i18n.t('settings.userIdLabel')}</Text>
        <Text style={[styles.idValue, { color: currentTheme.text }]} selectable>
          {userId || '-'}
        </Text>
        <Text style={[styles.idLabel, { color: currentTheme.textSecondary, marginTop: 16 }]}>{i18n.t('settings.joinFamilyLabel')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border, color: currentTheme.text }]}
          placeholder={i18n.t('settings.joinFamilyPlaceholder')}
          placeholderTextColor={currentTheme.textSecondary}
          value={joinFamilyIdInput}
          onChangeText={setJoinFamilyIdInput}
          autoCapitalize="none"
        />
        <TouchableOpacity style={[styles.joinButton, { backgroundColor: currentTheme.primary }]} onPress={handleJoinFamily}>
          <Text style={[styles.joinButtonText, { color: currentTheme.card }]}>{i18n.t('settings.joinFamilyButton')}</Text>
        </TouchableOpacity>
      </View>

      {/* テーマ設定カード */}
      <View style={[styles.card, styles.themedCard, { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder, borderLeftColor: currentTheme.primary }]}>
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
                {
                  backgroundColor: COLORS[themeKey].background,
                  borderColor: COLORS[themeKey].primary,
                },
                themeName === themeKey && { borderWidth: 3 },
              ]}
              onPress={() => changeTheme(themeKey)}
            >
              <View style={[styles.themeSwatch, { backgroundColor: COLORS[themeKey].primary }]} />
              <Text style={{ color: COLORS[themeKey].text, fontSize: FONT_SIZES.standard.s, fontWeight: '600' }}>
                {themeKey.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.card, styles.themedCard, { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder, borderLeftColor: currentTheme.primary }]}
        onPress={() => alert(i18n.t('record.alertComingSoon'))}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark-outline" size={24} color={currentTheme.primary} />
          <Text style={[styles.cardSubtitle, { color: currentTheme.text }]}>{i18n.t('settings.permissionCardTitle')}</Text>
        </View>
        <Text style={[styles.cardDescription, { color: currentTheme.textSecondary }]}>{i18n.t('settings.permissionCardDesc')}</Text>
        <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} style={styles.arrow} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, styles.themedCard, { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder, borderLeftColor: currentTheme.primary }]}
        onPress={() => navigation.navigate('PetList')}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="paw-outline" size={24} color={currentTheme.primary} />
          <Text style={[styles.cardSubtitle, { color: currentTheme.text }]}>{i18n.t('settings.petListCardTitle')}</Text>
        </View>
        <Text style={[styles.cardDescription, { color: currentTheme.textSecondary }]}>{i18n.t('settings.petListCardDesc')}</Text>
        <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} style={styles.arrow} />
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, padding: 15 },
  themedCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardSubtitle: { fontSize: FONT_SIZES.standard.l, fontWeight: 'bold', marginLeft: 10 },
  cardDescription: { fontSize: FONT_SIZES.standard.m, lineHeight: 20, paddingRight: 30 },
  idLabel: { fontSize: FONT_SIZES.standard.s, fontWeight: '600' },
  idValue: { fontSize: FONT_SIZES.standard.s, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: FONT_SIZES.standard.m, marginTop: 8 },
  joinButton: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  joinButtonText: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold' },
  arrow: { position: 'absolute', right: 20, top: '50%', marginTop: 5 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  themeButton: {
    width: '48%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  themeSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
  },
});
