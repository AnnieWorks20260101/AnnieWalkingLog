import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  AppState,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import i18n from '../../i18n';
import {
  getWalkPermissionStatus,
  requestWalkNotificationPermission,
  requestWalkForegroundLocationPermission,
  requestWalkBackgroundLocationPermission,
  openAppSettings,
} from '../../utils/walkPermissions';
import {
  getDeviceManufacturerCategory,
  getDeviceGuideBodyKey,
  getManufacturerDisplayName,
  isStrictAndroidDevice,
} from '../../utils/deviceManufacturer';

function StatusIcon({ ok, size = 26 }) {
  return (
    <Ionicons
      name={ok ? 'checkmark-circle' : 'close-circle'}
      size={size}
      color={ok ? '#34C759' : '#FF3B30'}
    />
  );
}

export default function PermissionsCheckScreen() {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [status, setStatus] = useState({
    notification: false,
    foregroundLocation: false,
    backgroundLocation: false,
  });

  const deviceCategory = getDeviceManufacturerCategory();
  const deviceGuideKey = getDeviceGuideBodyKey(deviceCategory);
  const showStrictWarning = isStrictAndroidDevice();
  const manufacturerName = getManufacturerDisplayName();

  const refreshStatus = useCallback(async () => {
    const next = await getWalkPermissionStatus();
    setStatus(next);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshStatus();
      const sub = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          refreshStatus();
        }
      });
      return () => sub.remove();
    }, [refreshStatus])
  );

  const handleNotification = async () => {
    if (status.notification) {
      return;
    }
    const granted = await requestWalkNotificationPermission();
    if (!granted) {
      const opened = await openAppSettings();
      if (!opened) {
        Alert.alert(i18n.t('common.error'), i18n.t('settings.permissionOpenSettingsError'));
      }
    }
    await refreshStatus();
  };

  const handleForegroundLocation = async () => {
    if (status.foregroundLocation) {
      return;
    }
    const granted = await requestWalkForegroundLocationPermission();
    if (!granted) {
      const opened = await openAppSettings();
      if (!opened) {
        Alert.alert(i18n.t('common.error'), i18n.t('settings.permissionOpenSettingsError'));
      }
    }
    await refreshStatus();
  };

  const handleBackgroundLocation = async () => {
    if (status.backgroundLocation) {
      return;
    }
    if (!status.foregroundLocation) {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.permissionForegroundFirst'));
      return;
    }
    const granted = await requestWalkBackgroundLocationPermission();
    if (!granted) {
      const opened = await openAppSettings();
      if (!opened) {
        Alert.alert(i18n.t('common.error'), i18n.t('settings.permissionOpenSettingsError'));
      }
    }
    await refreshStatus();
  };

  const handleOpenDeviceSettings = async () => {
    const opened = await openAppSettings();
    if (!opened) {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.permissionOpenSettingsError'));
    }
  };

  const renderPermissionRow = (label, description, ok, onPress) => (
    <TouchableOpacity style={styles.permissionRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.permissionTextBlock}>
        <Text style={[styles.permissionLabel, { color: currentTheme.text }]}>{label}</Text>
        {description ? (
          <Text style={[styles.permissionDesc, { color: currentTheme.textSecondary }]}>{description}</Text>
        ) : null}
      </View>
      <StatusIcon ok={ok} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('settings.permissionCardTitle')} showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionHint, { color: currentTheme.textSecondary }]}>
          {i18n.t('settings.permissionCheckIntro')}
        </Text>

        <Text style={[styles.groupTitle, { color: currentTheme.textSecondary }]}>
          {i18n.t('settings.permissionGroupRequired')}
        </Text>
        <View style={[styles.card, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          {renderPermissionRow(
            i18n.t('settings.permissionNotification'),
            i18n.t('settings.permissionNotificationDesc'),
            status.notification,
            handleNotification
          )}
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          {renderPermissionRow(
            i18n.t('settings.permissionForegroundLocation'),
            i18n.t('settings.permissionForegroundLocationDesc'),
            status.foregroundLocation,
            handleForegroundLocation
          )}
          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
          {renderPermissionRow(
            i18n.t('settings.permissionBackgroundLocation'),
            i18n.t('settings.permissionBackgroundLocationDesc'),
            status.backgroundLocation,
            handleBackgroundLocation
          )}
        </View>

        <Text style={[styles.groupTitle, { color: currentTheme.textSecondary }]}>
          {i18n.t('settings.permissionGroupBackground')}
        </Text>

        {showStrictWarning ? (
          <View style={[styles.warningBox, { borderColor: '#FF3B3040', backgroundColor: '#FF3B3010' }]}>
            <View style={styles.warningTitleRow}>
              <Ionicons name="warning" size={22} color="#FF3B30" style={{ marginRight: 8 }} />
              <Text style={[styles.warningTitle, { color: '#FF3B30' }]}>
                {i18n.t('settings.permissionStrictWarning', { manufacturer: manufacturerName })}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.disclosureTitle, { color: currentTheme.text }]}>
            {i18n.t('walk.locationDisclosureTitle')}
          </Text>
          <Text style={[styles.disclosureBody, { color: currentTheme.textSecondary }]}>
            {i18n.t('walk.locationDisclosureBody')}
          </Text>
          <Text style={[styles.disclosureHint, { color: currentTheme.primary }]}>
            {i18n.t('walk.locationDisclosureAlwaysHint')}
          </Text>

          <View style={[styles.innerDivider, { backgroundColor: currentTheme.border }]} />

          <Text style={[styles.deviceGuideTitle, { color: currentTheme.text }]}>
            {i18n.t('walk.deviceGuideTitle')}
          </Text>
          <Text style={[styles.deviceGuideBody, { color: currentTheme.textSecondary }]}>
            {i18n.t(deviceGuideKey)}
          </Text>

          <TouchableOpacity
            style={[styles.configureButton, { backgroundColor: currentTheme.primary }]}
            onPress={handleOpenDeviceSettings}
          >
            <Ionicons name="settings-outline" size={20} color={currentTheme.card} style={{ marginRight: 8 }} />
            <Text style={[styles.configureButtonText, { color: currentTheme.card }]}>
              {i18n.t('walk.deviceGuideConfigure')}
            </Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'ios' ? (
          <Text style={[styles.iosNote, { color: currentTheme.textSecondary }]}>
            {i18n.t('walk.deviceGuideBody_ios')}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const createStyles = (fs) => ({
  wrapper: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionHint: { fontSize: fs.m, lineHeight: 22, marginBottom: 16 },
  groupTitle: { fontSize: fs.s, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  permissionTextBlock: { flex: 1, paddingRight: 12 },
  permissionLabel: { fontSize: fs.m, fontWeight: '600' },
  permissionDesc: { fontSize: fs.s, lineHeight: 18, marginTop: 4 },
  divider: { height: 1 },
  innerDivider: { height: 1, marginVertical: 16 },
  warningBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  warningTitleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  warningTitle: { flex: 1, fontSize: fs.m, fontWeight: 'bold', lineHeight: 22 },
  disclosureTitle: { fontSize: fs.m, fontWeight: 'bold', marginBottom: 8 },
  disclosureBody: { fontSize: fs.m, lineHeight: 22 },
  disclosureHint: { fontSize: fs.s, fontWeight: '600', lineHeight: 20, marginTop: 10 },
  deviceGuideTitle: { fontSize: fs.m, fontWeight: 'bold', marginBottom: 8 },
  deviceGuideBody: { fontSize: fs.m, lineHeight: 22 },
  configureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  configureButtonText: { fontSize: fs.m, fontWeight: 'bold' },
  iosNote: { fontSize: fs.s, lineHeight: 20, marginTop: -8 },
});
