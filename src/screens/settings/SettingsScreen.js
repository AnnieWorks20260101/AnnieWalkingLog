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
  Linking,
  Dimensions,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { COLORS } from '../../../constants/theme';
import { getThemeDisplayName } from '../../utils/themeDisplayName';
import { useTheme, FONT_SIZE_OPTIONS } from '../../contexts/ThemeContext';
import { useWalkPreferences } from '../../contexts/WalkPreferencesContext';
import { WALK_CUSTOM_BUTTON_OPTIONS } from '../../constants/walkCustomButtonOptions';
import { useAuth } from '../../contexts/AuthContext';
import { usePremium } from '../../hooks/usePremium';
import ScreenHeader from '../../components/ScreenHeader';
import {
  SCREEN_GUEST_UPGRADE,
  SCREEN_PREMIUM,
  SCREEN_FAQ,
  SCREEN_PERMISSIONS_CHECK,
} from '../../navigation/screenNames';
import {
  useDisplayPreferences,
  LANGUAGE_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from '../../contexts/DisplayPreferencesContext';
import { getTimeFormatLabel } from '../../utils/formatTime';
import i18n from '../../i18n';
import { deleteCurrentUserAccount } from '../../services/deleteAccount';
import { openPrivacyPolicy } from '../../utils/openPrivacyPolicy';
import { openTermsOfService } from '../../utils/openTermsOfService';
import { buildFamilyExportPayload } from '../../services/exportFamilyData';
import { shareExportJsonFile } from '../../utils/shareExportJson';
import FamilyMembersModal from '../../components/settings/FamilyMembersModal';
import {
  seedTestWalksForFamily,
  estimateTestWalkSeedCount,
  countTestWalksForFamily,
  deleteTestWalksForFamily,
} from '../../dev/seedTestWalks';

function SettingRow({ children, onPress, style }) {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.settingRow, style]} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.settingRow, style]}>{children}</View>;
}

export default function SettingsScreen({ navigation }) {
  const { currentTheme, themeName, changeTheme, fontSizes, activeFontSizeOption, changeFontSize } =
    useTheme();
  const { userId, familyId, isGuest, joinFamily, signOut, discardGuestSession } = useAuth();
  const { isPremium } = usePremium();
  const { language, languageLabel, timeFormat, timeFormatLabel, setLanguage, setTimeFormat } =
    useDisplayPreferences();
  const {
    customButtonId,
    customButtonIcon,
    customButtonLabel,
    setCustomButtonId,
    uploadPhotosOnCellular,
    setUploadPhotosOnCellular,
    savePhotoToLibrary,
    setSavePhotoToLibrary,
  } = useWalkPreferences();

  const [isFamilyModalVisible, setIsFamilyModalVisible] = useState(false);
  const [isFamilyMembersModalVisible, setIsFamilyMembersModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [isTimeFormatModalVisible, setIsTimeFormatModalVisible] = useState(false);
  const [isFontSizeModalVisible, setIsFontSizeModalVisible] = useState(false);
  const [isCustomButtonModalVisible, setIsCustomButtonModalVisible] = useState(false);
  const [editFamilyId, setEditFamilyId] = useState('');
  const [testDevRunning, setTestDevRunning] = useState(false);
  const [testDevProgress, setTestDevProgress] = useState({ done: 0, total: 0 });
  const [guestLogoutRunning, setGuestLogoutRunning] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportRunning, setExportRunning] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

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
      await Share.share({ message: i18n.t('settings.inviteMessage', { familyId }) });
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('settings.inviteError'));
    }
  };

  const handleOpenExportModal = () => {
    if (!familyId || !userId) {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.exportNoFamily'));
      return;
    }
    setIsExportModalVisible(true);
  };

  const handleExportData = async (mode) => {
    if (!familyId || !userId || exportRunning) {
      return;
    }

    setExportRunning(true);
    try {
      const payload = await buildFamilyExportPayload({
        familyId,
        userId,
        mode,
        appVersion,
      });

      if (payload.stats.petCount === 0 && payload.stats.walkCount === 0) {
        Alert.alert(i18n.t('common.notice'), i18n.t('settings.exportEmpty'));
        return;
      }

      const jsonString = JSON.stringify(payload, null, 2);
      const dateStr = new Date().toISOString().slice(0, 10);
      await shareExportJsonFile(jsonString, `annie-walking-log-${mode}-${dateStr}.json`);
      setIsExportModalVisible(false);
    } catch (error) {
      console.error('export data failed:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('settings.exportError'));
    } finally {
      setExportRunning(false);
    }
  };

  const handleSupportEmail = async () => {
    const email = 'support@annie-works.com';
    const subject = encodeURIComponent(i18n.t('settings.supportEmailSubject'));
    const url = `mailto:${email}?subject=${subject}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.supportEmailError'));
    }
  };

  const handleGuestDiscard = async () => {
    if (guestLogoutRunning) {
      return;
    }
    setGuestLogoutRunning(true);
    try {
      await discardGuestSession();
    } catch (error) {
      console.error('guest discard failed:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('settings.guestLogoutError'));
    } finally {
      setGuestLogoutRunning(false);
    }
  };

  const handleSignOut = () => {
    if (isGuest) {
      if (guestLogoutRunning) {
        return;
      }
      Alert.alert(i18n.t('auth.guestLogoutTitle'), i18n.t('auth.guestLogoutDesc'), [
        { text: i18n.t('walk.cancel'), style: 'cancel' },
        {
          text: i18n.t('auth.upgradeBannerButton'),
          onPress: () => navigation.navigate(SCREEN_GUEST_UPGRADE),
        },
        {
          text: i18n.t('auth.guestLogoutDiscard'),
          style: 'destructive',
          onPress: () => {
            handleGuestDiscard();
          },
        },
      ]);
      return;
    }
    Alert.alert(i18n.t('auth.signOut'), i18n.t('auth.signOutConfirm'), [
      { text: i18n.t('walk.cancel'), style: 'cancel' },
      { text: i18n.t('auth.signOutButton'), style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const handlePermissionCheck = () => {
    navigation.navigate(SCREEN_PERMISSIONS_CHECK);
  };

  const runSeedTestWalks = (seedLocale) => {
    if (!familyId || !userId) {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.testSeedNoFamily'));
      return;
    }

    const approxCount = Math.round(estimateTestWalkSeedCount());
    Alert.alert(
      i18n.t('settings.testSeedConfirmTitle'),
      i18n.t('settings.testSeedConfirmMsg', { count: approxCount }),
      [
        { text: i18n.t('walk.cancel'), style: 'cancel' },
        {
          text: i18n.t('settings.testSeedCardTitle'),
          onPress: async () => {
            setTestDevRunning(true);
            setTestDevProgress({ done: 0, total: approxCount });
            try {
              const { created } = await seedTestWalksForFamily({
                familyId,
                userId,
                locale: seedLocale,
                onProgress: (done, total) => setTestDevProgress({ done, total }),
              });
              Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('settings.testSeedSuccess', { count: created }));
            } catch (error) {
              console.error('test seed error:', error);
              Alert.alert(i18n.t('common.error'), i18n.t('settings.testSeedError'));
            } finally {
              setTestDevRunning(false);
            }
          },
        },
      ]
    );
  };

  const handleSeedTestWalks = () => {
    runSeedTestWalks('en');
  };

  const handleSeedTestWalksKo = () => {
    runSeedTestWalks('ko');
  };

  const handleDeleteTestWalks = async () => {
    if (!familyId) {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.testSeedNoFamily'));
      return;
    }

    let count = 0;
    try {
      count = await countTestWalksForFamily(familyId);
    } catch (error) {
      console.error('count test walks error:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('settings.testDeleteError'));
      return;
    }

    if (count === 0) {
      Alert.alert(i18n.t('settings.testDeleteEmptyTitle'), i18n.t('settings.testDeleteEmptyMsg'));
      return;
    }

    Alert.alert(
      i18n.t('settings.testDeleteConfirmTitle'),
      i18n.t('settings.testDeleteConfirmMsg', { count }),
      [
        { text: i18n.t('walk.cancel'), style: 'cancel' },
        {
          text: i18n.t('settings.testDeleteCardTitle'),
          style: 'destructive',
          onPress: async () => {
            setTestDevRunning(true);
            setTestDevProgress({ done: 0, total: count });
            try {
              const { deleted } = await deleteTestWalksForFamily({
                familyId,
                onProgress: (done, total) => setTestDevProgress({ done, total }),
              });
              Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('settings.testDeleteSuccess', { count: deleted }));
            } catch (error) {
              console.error('delete test walks error:', error);
              Alert.alert(i18n.t('common.error'), i18n.t('settings.testDeleteError'));
            } finally {
              setTestDevRunning(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (isGuest) {
      Alert.alert(i18n.t('settings.deleteAccountGuestTitle'), i18n.t('settings.deleteAccountGuestMsg'), [
        { text: i18n.t('walk.cancel'), style: 'cancel' },
        {
          text: i18n.t('auth.upgradeBannerButton'),
          onPress: () => navigation.navigate(SCREEN_GUEST_UPGRADE),
        },
      ]);
      return;
    }

    Alert.alert(i18n.t('settings.deleteAccountTitle'), i18n.t('settings.deleteAccountMsg'), [
      { text: i18n.t('walk.cancel'), style: 'cancel' },
      {
        text: i18n.t('settings.deleteAccountButton'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCurrentUserAccount();
            Alert.alert(i18n.t('settings.deleteAccountDoneTitle'), i18n.t('settings.deleteAccountDoneMsg'));
          } catch (error) {
            console.error('delete account error:', error);
            if (error?.code === 'auth/requires-recent-login') {
              Alert.alert(i18n.t('common.error'), i18n.t('settings.deleteAccountRecentLogin'));
            } else {
              Alert.alert(i18n.t('common.error'), i18n.t('settings.deleteAccountError'));
            }
          }
        },
      },
    ]);
  };

  const fontSizeLabel = i18n.t(`settings.fontSizeOption_${activeFontSizeOption}`);
  const currentThemeLabel = getThemeDisplayName(themeName, i18n);
  const fontSizeOptionKeys = Object.keys(FONT_SIZE_OPTIONS);

  const sectionCardStyle = [
    styles.sectionCard,
    { backgroundColor: currentTheme.card, borderColor: currentTheme.border },
  ];

  return (
    <View style={[styles.wrapper, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('settings.title')} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {isGuest ? (
          <TouchableOpacity
            style={[styles.premiumBanner, { backgroundColor: '#32CD32' }]}
            onPress={() => navigation.navigate(SCREEN_GUEST_UPGRADE)}
          >
            <View style={styles.premiumHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#fff" />
              <Text style={[styles.premiumTitle, { fontSize: fontSizes.l }]}>{i18n.t('auth.upgradeBannerTitle')}</Text>
            </View>
            <Text style={[styles.premiumDesc, { fontSize: fontSizes.m }]}>{i18n.t('auth.upgradeBannerDesc')}</Text>
            <View style={styles.premiumButtonLight}>
              <Text style={[styles.premiumButtonLightText, { fontSize: fontSizes.m }]}>
                {i18n.t('auth.upgradeBannerButton')}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => navigation.navigate(SCREEN_PREMIUM)}
          >
            <View style={styles.premiumHeader}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={[styles.premiumTitle, { fontSize: fontSizes.l }]}>{i18n.t('settings.premiumBannerTitle')}</Text>
            </View>
            <Text style={[styles.premiumDesc, { fontSize: fontSizes.m }]}>{i18n.t('settings.premiumBannerDesc')}</Text>
            <View style={styles.premiumButtonGold}>
              <Text style={[styles.premiumButtonGoldText, { fontSize: fontSizes.s }]}>
                {isPremium ? i18n.t('settings.premiumBannerManage') : i18n.t('settings.premiumBannerCta')}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionTitle, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
          {i18n.t('settings.permissionSectionTitle')}
        </Text>
        <View style={sectionCardStyle}>
          <SettingRow onPress={handlePermissionCheck}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <View style={styles.settingTextBlock}>
                <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                  {i18n.t('settings.permissionCardTitle')}
                </Text>
                <Text style={[styles.settingSubtext, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                  {i18n.t('settings.permissionCardDesc')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
          </SettingRow>
        </View>

        <Text style={[styles.sectionTitle, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
          {i18n.t('settings.walkSectionTitle')}
        </Text>
        <View style={sectionCardStyle}>
          <SettingRow onPress={() => setIsCustomButtonModalVisible(true)}>
            <View style={styles.settingLeft}>
              <Ionicons name="ellipse-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <View style={styles.settingTextBlock}>
                <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                  {i18n.t('settings.customButtonLabel')}
                </Text>
                <Text style={[styles.settingSubtext, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                  {customButtonIcon} {customButtonLabel}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          <SettingRow>
            <View style={styles.settingLeft}>
              <Ionicons name="cellular-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <View style={styles.settingTextBlock}>
                <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                  {i18n.t('settings.uploadPhotosOnCellular')}
                </Text>
                <Text style={[styles.settingSubtext, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                  {i18n.t('settings.uploadPhotosOnCellularDesc')}
                </Text>
              </View>
            </View>
            <Switch
              value={uploadPhotosOnCellular}
              onValueChange={setUploadPhotosOnCellular}
              trackColor={{ false: currentTheme.border, true: currentTheme.primary }}
              thumbColor={currentTheme.card}
            />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          <SettingRow>
            <View style={styles.settingLeft}>
              <Ionicons name="images-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <View style={styles.settingTextBlock}>
                <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                  {i18n.t('settings.savePhotoToLibrary')}
                </Text>
                <Text style={[styles.settingSubtext, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                  {i18n.t('settings.savePhotoToLibraryDesc')}
                </Text>
              </View>
            </View>
            <Switch
              value={savePhotoToLibrary}
              onValueChange={setSavePhotoToLibrary}
              trackColor={{ false: currentTheme.border, true: currentTheme.primary }}
              thumbColor={currentTheme.card}
            />
          </SettingRow>
        </View>

        <Text style={[styles.sectionTitle, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
          {i18n.t('settings.displaySectionTitle')}
        </Text>
        <View style={sectionCardStyle}>
          <SettingRow onPress={() => setIsLanguageModalVisible(true)}>
            <View style={styles.settingLeft}>
              <Ionicons name="language" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <View style={styles.settingTextBlock}>
                <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                  {i18n.t('settings.languageLabel')}
                </Text>
                <Text style={[styles.settingSubtext, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                  {languageLabel}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          <SettingRow onPress={() => setIsTimeFormatModalVisible(true)}>
            <View style={styles.settingLeft}>
              <Ionicons name="time-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <View style={styles.settingTextBlock}>
                <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                  {i18n.t('settings.timeFormatLabel')}
                </Text>
                <Text style={[styles.settingSubtext, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                  {timeFormatLabel}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          <SettingRow onPress={() => setIsFontSizeModalVisible(true)}>
            <View style={styles.settingLeft}>
              <Ionicons name="text" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <View style={styles.settingTextBlock}>
                <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                  {i18n.t('settings.fontSizeLabel')}
                </Text>
                <Text style={[styles.settingSubtext, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                  {fontSizeLabel}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          <SettingRow onPress={() => setIsThemeModalVisible(true)}>
            <View style={styles.settingLeft}>
              <Ionicons name="color-palette" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <View style={styles.settingTextBlock}>
                <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                  {i18n.t('settings.themeChangeLabel')}
                </Text>
                <Text style={[styles.settingSubtext, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                  {currentThemeLabel}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
          </SettingRow>
        </View>

        <Text style={[styles.sectionTitle, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
          {i18n.t('settings.familySectionTitle')}
        </Text>
        <View style={sectionCardStyle}>
          <SettingRow onPress={() => setIsFamilyMembersModalVisible(true)}>
            <View style={styles.settingLeft}>
              <Ionicons name="people" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                {i18n.t('settings.familyMembersList')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          <SettingRow onPress={openFamilyModal}>
            <View style={styles.settingLeft}>
              <Ionicons name="key-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                {i18n.t('settings.familyCodeManage')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          <SettingRow onPress={() => setIsInviteModalVisible(true)}>
            <View style={styles.settingLeft}>
              <Ionicons name="people-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                {i18n.t('settings.familyInvite')}
              </Text>
            </View>
            <Ionicons name="share-outline" size={20} color={currentTheme.primary} />
          </SettingRow>
        </View>

        <Text style={[styles.sectionTitle, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
          {i18n.t('settings.supportSectionTitle')}
        </Text>
        <View style={sectionCardStyle}>
          <SettingRow onPress={() => navigation.navigate(SCREEN_FAQ)}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                {i18n.t('settings.faqLink')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          <SettingRow onPress={exportRunning ? undefined : handleOpenExportModal}>
            <View style={styles.settingLeft}>
              <Ionicons name="download-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                {exportRunning ? i18n.t('settings.exportRunning') : i18n.t('settings.exportData')}
              </Text>
            </View>
            {exportRunning ? (
              <ActivityIndicator size="small" color={currentTheme.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
            )}
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          <SettingRow onPress={openPrivacyPolicy}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                {i18n.t('legal.privacyPolicy')}
              </Text>
            </View>
            <Ionicons name="open-outline" size={20} color={currentTheme.textSecondary} />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          <SettingRow onPress={openTermsOfService}>
            <View style={styles.settingLeft}>
              <Ionicons name="reader-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                {i18n.t('legal.termsOfService')}
              </Text>
            </View>
            <Ionicons name="open-outline" size={20} color={currentTheme.textSecondary} />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          <SettingRow onPress={handleSupportEmail}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                {i18n.t('settings.supportContact')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          <SettingRow>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={22} color={currentTheme.textSecondary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                {i18n.t('settings.versionLabel')}
              </Text>
            </View>
            <Text style={[styles.versionText, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
              {appVersion}
            </Text>
          </SettingRow>
        </View>

        <Text style={[styles.sectionTitle, styles.accountSectionTitle, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
          {i18n.t('settings.accountOpsSectionTitle')}
        </Text>
        <View style={sectionCardStyle}>
          {!isGuest ? (
            <>
              <SettingRow onPress={handleDeleteAccount}>
                <View style={styles.settingLeft}>
                  <Ionicons name="trash-bin-outline" size={22} color="#FF3B30" style={styles.settingIcon} />
                  <Text style={[styles.settingText, styles.dangerText, { fontSize: fontSizes.m }]}>
                    {i18n.t('settings.deleteAccountButton')}
                  </Text>
                </View>
              </SettingRow>
              <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
            </>
          ) : null}
          <SettingRow onPress={guestLogoutRunning ? undefined : handleSignOut}>
            <View style={styles.settingLeft}>
              <Ionicons name="log-out-outline" size={22} color="#FF3B30" style={styles.settingIcon} />
              <Text style={[styles.settingText, styles.dangerText, { fontSize: fontSizes.m }]}>
                {guestLogoutRunning && isGuest
                  ? i18n.t('auth.guestLogoutInProgress')
                  : i18n.t('auth.signOut')}
              </Text>
            </View>
            {guestLogoutRunning && isGuest ? (
              <ActivityIndicator size="small" color={currentTheme.primary} />
            ) : null}
          </SettingRow>
        </View>

        <>
            <Text style={[styles.sectionTitle, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
              {i18n.t('settings.testDataSectionTitle')}
            </Text>
            <TouchableOpacity
              style={[
                styles.testSeedCard,
                { backgroundColor: currentTheme.card, borderColor: '#E6A800' },
              ]}
              onPress={handleSeedTestWalks}
              disabled={testDevRunning}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="flask-outline" size={22} color="#E6A800" style={styles.settingIcon} />
                <View style={styles.settingTextBlock}>
                  <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                    {i18n.t('settings.testSeedCardTitle')}
                  </Text>
                  <Text style={[styles.settingSubtext, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                    {i18n.t('settings.testSeedCardDesc')}
                  </Text>
                </View>
              </View>
              {testDevRunning ? (
                <View style={styles.testSeedProgressRow}>
                  <ActivityIndicator size="small" color={currentTheme.primary} />
                  <Text style={[styles.testSeedProgressText, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                    {i18n.t('settings.testSeedRunning', {
                      done: testDevProgress.done,
                      total: testDevProgress.total,
                    })}
                  </Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.testSeedCard,
                { backgroundColor: currentTheme.card, borderColor: '#5B8DEF' },
              ]}
              onPress={handleSeedTestWalksKo}
              disabled={testDevRunning}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={22} color="#5B8DEF" style={styles.settingIcon} />
                <View style={styles.settingTextBlock}>
                  <Text style={[styles.settingText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                    {i18n.t('settings.testSeedCardTitleKo')}
                  </Text>
                  <Text style={[styles.settingSubtext, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                    {i18n.t('settings.testSeedCardDescKo')}
                  </Text>
                </View>
              </View>
              {testDevRunning ? (
                <View style={styles.testSeedProgressRow}>
                  <ActivityIndicator size="small" color={currentTheme.primary} />
                  <Text style={[styles.testSeedProgressText, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                    {i18n.t('settings.testSeedRunning', {
                      done: testDevProgress.done,
                      total: testDevProgress.total,
                    })}
                  </Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.testSeedCard,
                styles.testDeleteCard,
                { backgroundColor: currentTheme.card, borderColor: '#FF3B30' },
              ]}
              onPress={handleDeleteTestWalks}
              disabled={testDevRunning}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="trash-outline" size={22} color="#FF3B30" style={styles.settingIcon} />
                <View style={styles.settingTextBlock}>
                  <Text style={[styles.settingText, styles.dangerText, { fontSize: fontSizes.m }]}>
                    {i18n.t('settings.testDeleteCardTitle')}
                  </Text>
                  <Text style={[styles.settingSubtext, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                    {i18n.t('settings.testDeleteCardDesc')}
                  </Text>
                </View>
              </View>
              {testDevRunning ? (
                <View style={styles.testSeedProgressRow}>
                  <ActivityIndicator size="small" color={currentTheme.primary} />
                  <Text style={[styles.testSeedProgressText, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                    {i18n.t('settings.testDeleteRunning', {
                      done: testDevProgress.done,
                      total: testDevProgress.total,
                    })}
                  </Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={20} color={currentTheme.textSecondary} />
              )}
            </TouchableOpacity>
        </>

      </ScrollView>

      <FamilyMembersModal
        visible={isFamilyMembersModalVisible}
        onClose={() => setIsFamilyMembersModalVisible(false)}
        theme={currentTheme}
        fontSizes={fontSizes}
      />

      <Modal visible={isExportModalVisible} animationType="fade" transparent onRequestClose={() => !exportRunning && setIsExportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text, fontSize: fontSizes.l }]}>
              {i18n.t('settings.exportModalTitle')}
            </Text>
            <Text style={[styles.modalDesc, { color: currentTheme.textSecondary, fontSize: fontSizes.m }]}>
              {i18n.t('settings.exportModalDesc')}
            </Text>

            <TouchableOpacity
              style={[styles.exportOptionButton, { borderColor: currentTheme.border, backgroundColor: currentTheme.background }]}
              onPress={() => handleExportData('summary')}
              disabled={exportRunning}
            >
              <Text style={[styles.exportOptionTitle, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                {i18n.t('settings.exportSummaryTitle')}
              </Text>
              <Text style={[styles.exportOptionDesc, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                {i18n.t('settings.exportSummaryDesc')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportOptionButton, { borderColor: currentTheme.border, backgroundColor: currentTheme.background }]}
              onPress={() => handleExportData('full')}
              disabled={exportRunning}
            >
              <Text style={[styles.exportOptionTitle, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                {i18n.t('settings.exportFullTitle')}
              </Text>
              <Text style={[styles.exportOptionDesc, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                {i18n.t('settings.exportFullDesc')}
              </Text>
            </TouchableOpacity>

            {exportRunning ? (
              <View style={styles.exportRunningRow}>
                <ActivityIndicator size="small" color={currentTheme.primary} />
                <Text style={[styles.exportRunningText, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                  {i18n.t('settings.exportRunning')}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => setIsExportModalVisible(false)}
              style={styles.modalClose}
              disabled={exportRunning}
            >
              <Text style={{ color: currentTheme.textSecondary, fontSize: fontSizes.m }}>{i18n.t('walk.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isFamilyModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text, fontSize: fontSizes.l }]}>
              {i18n.t('settings.familyCodeModalTitle')}
            </Text>
            <Text style={[styles.modalDesc, { color: currentTheme.textSecondary, fontSize: fontSizes.m }]}>
              {i18n.t('settings.familyCodeModalDesc')}
            </Text>
            <Text style={[styles.modalLabel, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
              {i18n.t('settings.familyIdLabel')}
            </Text>
            <Text style={[styles.modalFamilyId, { color: currentTheme.text, fontSize: fontSizes.s }]} selectable>
              {familyId || '-'}
            </Text>
            <Text style={[styles.modalLabel, { color: currentTheme.textSecondary, fontSize: fontSizes.s, marginTop: 16 }]}>
              {i18n.t('settings.familyCodeChangeLabel')}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: currentTheme.inputBackground,
                  borderColor: currentTheme.border,
                  color: currentTheme.text,
                  fontSize: fontSizes.m,
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
                <Text style={{ color: currentTheme.textSecondary, fontSize: fontSizes.m }}>{i18n.t('walk.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, { backgroundColor: currentTheme.primary }]}
                onPress={handleSaveFamilyId}
              >
                <Text style={{ color: currentTheme.card, fontWeight: 'bold', fontSize: fontSizes.m }}>
                  {i18n.t('settings.familyCodeSave')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={isInviteModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text, fontSize: fontSizes.l }]}>
              {i18n.t('settings.familyInviteModalTitle')}
            </Text>
            <Text style={[styles.modalDesc, { color: currentTheme.textSecondary, fontSize: fontSizes.m }]}>
              {i18n.t('settings.familyInviteModalDesc')}
            </Text>
            <Text style={[styles.modalLabel, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
              {i18n.t('settings.familyIdLabel')}
            </Text>
            <Text style={[styles.modalFamilyId, { color: currentTheme.text, fontSize: fontSizes.s }]} selectable>
              {familyId || '-'}
            </Text>
            <TouchableOpacity
              style={[styles.inviteShareButton, { backgroundColor: currentTheme.primary }]}
              onPress={handleInviteShare}
            >
              <Ionicons name="share-social-outline" size={20} color={currentTheme.card} style={{ marginRight: 8 }} />
              <Text style={{ color: currentTheme.card, fontWeight: 'bold', fontSize: fontSizes.m }}>
                {i18n.t('settings.familyInviteShare')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsInviteModalVisible(false)} style={styles.modalClose}>
              <Text style={{ color: currentTheme.textSecondary, fontSize: fontSizes.m }}>{i18n.t('walk.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isFontSizeModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, styles.themeModalOverlay]}>
          <View style={[styles.themeModalContent, { backgroundColor: currentTheme.card }]}>
            <View style={styles.themeModalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text, fontSize: fontSizes.l, marginBottom: 0 }]}>
                {i18n.t('settings.fontSizeModalTitle')}
              </Text>
              <TouchableOpacity onPress={() => setIsFontSizeModalVisible(false)} hitSlop={12}>
                <Ionicons name="close-circle" size={28} color={currentTheme.textSecondary} />
              </TouchableOpacity>
            </View>
            {fontSizeOptionKeys.map((optionKey) => {
              const selected = activeFontSizeOption === optionKey;
              return (
                <TouchableOpacity
                  key={optionKey}
                  style={[styles.themeOptionRow, { borderBottomColor: currentTheme.border }]}
                  onPress={() => {
                    changeFontSize(optionKey);
                    setIsFontSizeModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.themeOptionLabel,
                      {
                        color: currentTheme.text,
                        fontSize: fontSizes.m,
                        fontWeight: selected ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {i18n.t(`settings.fontSizeOption_${optionKey}`)}
                  </Text>
                  {selected ? <Ionicons name="checkmark" size={24} color={currentTheme.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal visible={isCustomButtonModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, styles.themeModalOverlay]}>
          <View style={[styles.themeModalContent, { backgroundColor: currentTheme.card }]}>
            <View style={styles.themeModalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text, fontSize: fontSizes.l, marginBottom: 0 }]}>
                {i18n.t('settings.customButtonModalTitle')}
              </Text>
              <TouchableOpacity onPress={() => setIsCustomButtonModalVisible(false)} hitSlop={12}>
                <Ionicons name="close-circle" size={28} color={currentTheme.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalDesc, { color: currentTheme.textSecondary, fontSize: fontSizes.s, marginBottom: 12 }]}>
              {i18n.t('settings.customButtonModalDesc')}
            </Text>
            <ScrollView style={{ maxHeight: Dimensions.get('window').height * 0.5 }}>
              <View style={styles.customButtonGrid}>
                {WALK_CUSTOM_BUTTON_OPTIONS.map((option) => {
                  const selected = customButtonId === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.customButtonCell,
                        {
                          borderColor: selected ? currentTheme.primary : currentTheme.border,
                          backgroundColor: selected ? currentTheme.cardTinted : currentTheme.background,
                        },
                      ]}
                      onPress={() => {
                        setCustomButtonId(option.id);
                        setIsCustomButtonModalVisible(false);
                      }}
                    >
                      <Text style={styles.customButtonCellIcon}>{option.icon}</Text>
                      <Text
                        style={[
                          styles.customButtonCellLabel,
                          { color: currentTheme.textSecondary, fontSize: fontSizes.s },
                        ]}
                        numberOfLines={1}
                      >
                        {i18n.t(option.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isLanguageModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, styles.themeModalOverlay]}>
          <View style={[styles.themeModalContent, { backgroundColor: currentTheme.card }]}>
            <View style={styles.themeModalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text, fontSize: fontSizes.l, marginBottom: 0 }]}>
                {i18n.t('settings.languageModalTitle')}
              </Text>
              <TouchableOpacity onPress={() => setIsLanguageModalVisible(false)} hitSlop={12}>
                <Ionicons name="close-circle" size={28} color={currentTheme.textSecondary} />
              </TouchableOpacity>
            </View>
            {LANGUAGE_OPTIONS.map((option) => {
              const selected = language === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.themeOptionRow, { borderBottomColor: currentTheme.border }]}
                  onPress={() => {
                    setLanguage(option.id);
                    setIsLanguageModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.themeOptionLabel,
                      {
                        color: currentTheme.text,
                        fontSize: fontSizes.m,
                        fontWeight: selected ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {i18n.t(option.labelKey)}
                  </Text>
                  {selected ? <Ionicons name="checkmark" size={24} color={currentTheme.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal visible={isTimeFormatModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, styles.themeModalOverlay]}>
          <View style={[styles.themeModalContent, { backgroundColor: currentTheme.card }]}>
            <View style={styles.themeModalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text, fontSize: fontSizes.l, marginBottom: 0 }]}>
                {i18n.t('settings.timeFormatModalTitle')}
              </Text>
              <TouchableOpacity onPress={() => setIsTimeFormatModalVisible(false)} hitSlop={12}>
                <Ionicons name="close-circle" size={28} color={currentTheme.textSecondary} />
              </TouchableOpacity>
            </View>
            {TIME_FORMAT_OPTIONS.map((format) => {
              const selected = timeFormat === format;
              return (
                <TouchableOpacity
                  key={format}
                  style={[styles.themeOptionRow, { borderBottomColor: currentTheme.border }]}
                  onPress={() => {
                    setTimeFormat(format);
                    setIsTimeFormatModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.themeOptionLabel,
                      {
                        color: currentTheme.text,
                        fontSize: fontSizes.m,
                        fontWeight: selected ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {getTimeFormatLabel(format, i18n)}
                  </Text>
                  {selected ? <Ionicons name="checkmark" size={24} color={currentTheme.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal visible={isThemeModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, styles.themeModalOverlay]}>
          <View style={[styles.themeModalContent, { backgroundColor: currentTheme.card }]}>
            <View style={styles.themeModalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text, fontSize: fontSizes.l, marginBottom: 0 }]}>
                {i18n.t('settings.themeModalTitle')}
              </Text>
              <TouchableOpacity onPress={() => setIsThemeModalVisible(false)} hitSlop={12}>
                <Ionicons name="close-circle" size={28} color={currentTheme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: Dimensions.get('window').height * 0.6 }}>
              {Object.keys(COLORS).map((themeKey) => {
                const selected = themeName === themeKey;
                return (
                  <TouchableOpacity
                    key={themeKey}
                    style={[styles.themeOptionRow, { borderBottomColor: currentTheme.border }]}
                    onPress={() => {
                      changeTheme(themeKey);
                      setIsThemeModalVisible(false);
                    }}
                  >
                    <View style={styles.themeOptionLeft}>
                      <View
                        style={[
                          styles.themeSwatch,
                          { backgroundColor: COLORS[themeKey].primary, borderColor: currentTheme.border },
                        ]}
                      />
                      <Text
                        style={[
                          styles.themeOptionLabel,
                          {
                            color: currentTheme.text,
                            fontSize: fontSizes.m,
                            fontWeight: selected ? 'bold' : 'normal',
                          },
                        ]}
                      >
                        {getThemeDisplayName(themeKey, i18n)}
                      </Text>
                    </View>
                    {selected ? <Ionicons name="checkmark" size={24} color={currentTheme.primary} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  premiumBanner: {
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  premiumHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  premiumTitle: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  premiumDesc: { color: '#ddd', lineHeight: 22, marginBottom: 16 },
  premiumButtonGold: {
    backgroundColor: '#FFD700',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  premiumButtonGoldText: { color: '#333', fontWeight: 'bold' },
  premiumButtonLight: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  premiumButtonLightText: { color: '#32CD32', fontWeight: 'bold' },
  sectionTitle: { fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  accountSectionTitle: { marginTop: 8 },
  sectionCard: { borderRadius: 12, marginBottom: 24, borderWidth: 1, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { marginRight: 12 },
  settingTextBlock: { flex: 1 },
  settingText: { fontWeight: '500' },
  settingSubtext: { marginTop: 4 },
  dangerText: { color: '#FF3B30', fontWeight: 'bold' },
  divider: { height: 1, marginLeft: 50 },
  versionText: {},
  testDeleteCard: { marginTop: 10 },
  testSeedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  testSeedProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 120 },
  testSeedProgressText: { flexShrink: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  themeModalOverlay: { justifyContent: 'flex-end', padding: 0 },
  modalContent: { borderRadius: 16, padding: 24 },
  themeModalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  themeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontWeight: 'bold', marginBottom: 12 },
  modalDesc: { lineHeight: 22, marginBottom: 16 },
  modalLabel: { fontWeight: '600', marginBottom: 6 },
  modalFamilyId: { padding: 12, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)' },
  modalInput: { borderWidth: 1, borderRadius: 10, padding: 12 },
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
  exportOptionButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  exportOptionTitle: { fontWeight: '700', marginBottom: 6 },
  exportOptionDesc: { lineHeight: 20 },
  exportRunningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  exportRunningText: { marginLeft: 8 },
  modalClose: { alignItems: 'center', marginTop: 16, padding: 8 },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  themeOptionLeft: { flexDirection: 'row', alignItems: 'center' },
  themeSwatch: { width: 24, height: 24, borderRadius: 12, marginRight: 16, borderWidth: 1 },
  themeOptionLabel: {},
  customButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
    paddingBottom: 8,
  },
  customButtonCell: {
    width: '30%',
    minWidth: 96,
    flexGrow: 1,
    maxWidth: 120,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 2,
  },
  customButtonCellIcon: { fontSize: 36, marginBottom: 6 },
  customButtonCellLabel: { textAlign: 'center' },
});
