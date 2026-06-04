import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import i18n from '../i18n';

export default function BackgroundLocationDisclosureModal({ visible, onAgree, onCancel }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: currentTheme.card }]}>
          <View style={styles.iconRow}>
            <Ionicons name="location" size={40} color={currentTheme.primary} />
          </View>
          <Text style={[styles.title, { color: currentTheme.text }]}>{i18n.t('walk.locationDisclosureTitle')}</Text>
          <Text style={[styles.body, { color: currentTheme.textSecondary }]}>{i18n.t('walk.locationDisclosureBody')}</Text>
          <Text style={[styles.hint, { color: currentTheme.primary }]}>{i18n.t('walk.locationDisclosureAlwaysHint')}</Text>

          <TouchableOpacity
            style={[styles.agreeButton, { backgroundColor: currentTheme.primary }]}
            onPress={onAgree}
          >
            <Text style={[styles.agreeButtonText, { color: currentTheme.card }]}>
              {i18n.t('walk.locationDisclosureAgree')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={[styles.cancelButtonText, { color: currentTheme.textSecondary }]}>
              {i18n.t('walk.locationDisclosureCancel')}
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
    marginBottom: 12,
  },
  hint: {
    fontSize: fs.s,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 20,
  },
  agreeButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  agreeButtonText: {
    fontSize: fs.m,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fs.m,
  },
});
