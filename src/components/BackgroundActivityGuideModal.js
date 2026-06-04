import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import i18n from '../i18n';
import { getDeviceGuideBodyKey } from '../utils/deviceManufacturer';

export default function BackgroundActivityGuideModal({ visible, manufacturerCategory, onConfigure, onLater }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const bodyKey = getDeviceGuideBodyKey(manufacturerCategory);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onLater}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: currentTheme.card }]}>
          <View style={styles.iconRow}>
            <Ionicons name="settings-outline" size={40} color={currentTheme.primary} />
          </View>
          <Text style={[styles.title, { color: currentTheme.text }]}>{i18n.t('walk.deviceGuideTitle')}</Text>
          <Text style={[styles.body, { color: currentTheme.textSecondary }]}>{i18n.t(bodyKey)}</Text>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: currentTheme.primary }]}
            onPress={onConfigure}
          >
            <Text style={[styles.primaryButtonText, { color: currentTheme.card }]}>{i18n.t('walk.deviceGuideConfigure')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onLater}>
            <Text style={[styles.secondaryButtonText, { color: currentTheme.textSecondary }]}>
              {i18n.t('walk.deviceGuideLater')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (fs) => ({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    borderRadius: 16,
    padding: 24,
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: fs.l,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: fs.m,
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    fontSize: fs.m,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: fs.m,
  },
});
