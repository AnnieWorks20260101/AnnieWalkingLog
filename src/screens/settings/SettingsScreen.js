import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_SIZES, COLORS } from '../../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import i18n from '../../i18n';

export default function SettingsScreen({ navigation }) {
  const { currentTheme, themeName, changeTheme } = useTheme();
  const { userId, familyId, isGuest, joinFamily, signOut } = useAuth();

  const [isFamilyModalVisible, setIsFamilyModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [editFamilyId, setEditFamilyId] = useState('');

  const openFamilyModal = () => {
    setEditFamilyId(familyId || '');
    setIsFamilyModalVisible(true);
  };

  const handleSaveFamilyId = async () => {
    const trimmed = editFamilyId.trim();
    if (!trimmed) {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.joinFamilyInvalid'));
      return;
    }
    if (trimmed === familyId) {
      setIsFamilyModalVisible(false);
      return;
    }
    const result = await joinFamily(trimmed);
    if (result.success) {
      setIsFamilyModalVisible(false);
      Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('settings.familyCodeUpdated'));
      return;
    }
    if (result.reason === 'notFound') {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.joinFamilyNotFound'));
      return;
    }
    Alert.alert(i18n.t('common.error'), i18n.t('settings.joinFamilyInvalid'));
  };

  const handleInviteShare = async () => {
    if (!familyId) {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.familyCodeMissing'));
      return;
    }
    try {
      const message = i18n.t('settings.inviteMessage', { familyId });
      await Share.share({ message });
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('settings.inviteError'));
    }
  };

  const handleSignOut = () => {
    if (isGuest) {
      Alert.alert(i18n.t('auth.guestLogoutTitle'), i18n.t('auth.guestLogoutDesc'), [
        { text: i18n.t('walk.cancel'), style: 'cancel' },
        {
          text: i18n.t('auth.upgradeBannerButton'),
          onPress: () => navigation.navigate('GuestUpgrade'),
        },
        {
          text: i18n.t('auth.guestLogoutDiscard'),
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]);
      return;
    }
    Alert.alert(i18n.t('auth.signOut'), i18n.t('auth.signOutConfirm'), [
      { text: i18n.t('walk.cancel'), style: 'cancel' },
      { text: i18n.t('auth.signOutButton'), style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('settings.title')} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {isGuest ? (
          <TouchableOpacity
            style={[styles.guestBanner, { backgroundColor: '#32CD32' }]}
            onPress={() => navigation.navigate('GuestUpgrade')}
          >
            <View style={styles.guestBannerHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#fff" />
              <Text style={styles.guestBannerTitle}>{i18n.t('auth.upgradeBannerTitle')}</Text>
            </View>
            <Text style={styles.guestBannerDesc}>{i18n.t('auth.upgradeBannerDesc')}</Text>
            <View style={styles.guestBannerButton}>
              <Text style={styles.guestBannerButtonText}>{i18n.t('auth.upgradeBannerButton')}</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[
            styles.card,
            styles.themedCard,
            { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder, borderLeftColor: currentTheme.primary },
          ]}
          onPress={() => navigation.navigate('PetList')}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="paw-outline" size={24} color={currentTheme.primary} />
            <Text style={[styles.cardSubtitle, { color: currentTheme.text }]}>{i18n.t('settings.petListCardTitle')}</Text>
          </View>
          <Text style={[styles.cardDescription, { color: currentTheme.textSecondary }]}>{i18n.t('settings.petListCardDesc')}</Text>
          <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} style={styles.arrow} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: currentTheme.textSecondary }]}>{i18n.t('settings.familySectionTitle')}</Text>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder },
          ]}
        >
          <TouchableOpacity style={styles.settingRow} onPress={openFamilyModal}>
            <View style={styles.settingLeft}>
              <Ionicons name="key-outline" size={22} color={currentTheme.primary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: currentTheme.text }]}>{i18n.t('settings.familyCodeManage')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />

          <TouchableOpacity style={styles.settingRow} onPress={() => setIsInviteModalVisible(true)}>
            <View style={styles.settingLeft}>
              <Ionicons name="people-outline" size={22} color={currentTheme.primary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: currentTheme.text }]}>{i18n.t('settings.familyInvite')}</Text>
            </View>
            <Ionicons name="share-outline" size={20} color={currentTheme.primary} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.card,
            styles.themedCard,
            { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder, borderLeftColor: currentTheme.primary },
          ]}
        >
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
                  { backgroundColor: COLORS[themeKey].background, borderColor: COLORS[themeKey].primary },
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
          style={[
            styles.card,
            styles.themedCard,
            { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder, borderLeftColor: currentTheme.primary },
          ]}
          onPress={() => alert(i18n.t('record.alertComingSoon'))}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={24} color={currentTheme.primary} />
            <Text style={[styles.cardSubtitle, { color: currentTheme.text }]}>{i18n.t('settings.permissionCardTitle')}</Text>
          </View>
          <Text style={[styles.cardDescription, { color: currentTheme.textSecondary }]}>{i18n.t('settings.permissionCardDesc')}</Text>
          <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} style={styles.arrow} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: currentTheme.textSecondary }]}>{i18n.t('settings.accountSectionTitle')}</Text>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder },
          ]}
        >
          <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
            <View style={styles.settingLeft}>
              <Ionicons name="log-out-outline" size={22} color="#FF3B30" style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: '#FF3B30', fontWeight: 'bold' }]}>{i18n.t('auth.signOut')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={isFamilyModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>{i18n.t('settings.familyCodeModalTitle')}</Text>
            <Text style={[styles.modalDesc, { color: currentTheme.textSecondary }]}>{i18n.t('settings.familyCodeModalDesc')}</Text>

            <Text style={[styles.modalLabel, { color: currentTheme.textSecondary }]}>{i18n.t('settings.familyIdLabel')}</Text>
            <Text style={[styles.modalFamilyId, { color: currentTheme.text }]} selectable>
              {familyId || '-'}
            </Text>

            <Text style={[styles.modalLabel, { color: currentTheme.textSecondary, marginTop: 16 }]}>
              {i18n.t('settings.familyCodeChangeLabel')}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: currentTheme.inputBackground,
                  borderColor: currentTheme.border,
                  color: currentTheme.text,
                },
              ]}
              value={editFamilyId}
              onChangeText={setEditFamilyId}
              placeholder={i18n.t('settings.joinFamilyPlaceholder')}
              placeholderTextColor={currentTheme.textSecondary}
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsFamilyModalVisible(false)} style={styles.modalCancel}>
                <Text style={{ color: currentTheme.textSecondary }}>{i18n.t('walk.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, { backgroundColor: currentTheme.primary }]}
                onPress={handleSaveFamilyId}
              >
                <Text style={{ color: currentTheme.card, fontWeight: 'bold' }}>{i18n.t('settings.familyCodeSave')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={isInviteModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>{i18n.t('settings.familyInviteModalTitle')}</Text>
            <Text style={[styles.modalDesc, { color: currentTheme.textSecondary }]}>{i18n.t('settings.familyInviteModalDesc')}</Text>

            <Text style={[styles.modalLabel, { color: currentTheme.textSecondary }]}>{i18n.t('settings.familyIdLabel')}</Text>
            <Text style={[styles.modalFamilyId, { color: currentTheme.text }]} selectable>
              {familyId || '-'}
            </Text>

            <TouchableOpacity
              style={[styles.inviteShareButton, { backgroundColor: currentTheme.primary }]}
              onPress={handleInviteShare}
            >
              <Ionicons name="share-social-outline" size={20} color={currentTheme.card} style={{ marginRight: 8 }} />
              <Text style={{ color: currentTheme.card, fontWeight: 'bold' }}>{i18n.t('settings.familyInviteShare')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsInviteModalVisible(false)} style={styles.modalClose}>
              <Text style={{ color: currentTheme.textSecondary }}>{i18n.t('walk.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, padding: 15 },
  guestBanner: { borderRadius: 15, padding: 20, marginBottom: 15 },
  guestBannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  guestBannerTitle: { color: '#fff', fontSize: FONT_SIZES.standard.l, fontWeight: 'bold', marginLeft: 10 },
  guestBannerDesc: { color: '#fff', fontSize: FONT_SIZES.standard.m, lineHeight: 22, marginBottom: 12 },
  guestBannerButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  guestBannerButtonText: { color: '#32CD32', fontWeight: 'bold', fontSize: FONT_SIZES.standard.m },
  sectionTitle: { fontSize: FONT_SIZES.standard.s, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  sectionCard: { borderRadius: 15, borderWidth: 1, marginBottom: 15, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { marginRight: 12 },
  settingText: { fontSize: FONT_SIZES.standard.m },
  divider: { height: 1, marginHorizontal: 16 },
  themedCard: { borderWidth: 1, borderLeftWidth: 4 },
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
  themeSwatch: { width: 14, height: 14, borderRadius: 7, marginRight: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: { borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: FONT_SIZES.standard.l, fontWeight: 'bold', marginBottom: 12 },
  modalDesc: { fontSize: FONT_SIZES.standard.m, lineHeight: 22, marginBottom: 16 },
  modalLabel: { fontSize: FONT_SIZES.standard.s, fontWeight: '600', marginBottom: 6 },
  modalFamilyId: { fontSize: FONT_SIZES.standard.s, padding: 12, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)' },
  modalInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: FONT_SIZES.standard.m },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 },
  modalCancel: { padding: 12 },
  modalSave: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  inviteShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  modalClose: { alignItems: 'center', marginTop: 16, padding: 8 },
});
