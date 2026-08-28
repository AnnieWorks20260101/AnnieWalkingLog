import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import i18n from '../../i18n';

export default function WalkDetailTipModal({ visible, title, messageLine1, messageLine2, onClose }) {
  const { currentTheme, fontSizes } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.title, { color: currentTheme.text, fontSize: fontSizes.l }]}>{title}</Text>
          <Text style={[styles.message, { color: currentTheme.text, fontSize: fontSizes.m }]}>{messageLine1}</Text>
          <Text style={[styles.message, styles.messageSecond, { color: currentTheme.text, fontSize: fontSizes.m }]}>
            {messageLine2}
          </Text>
          <TouchableOpacity
            style={[styles.okButton, { backgroundColor: currentTheme.primary }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[styles.okButtonText, { color: currentTheme.card, fontSize: fontSizes.m }]}>
              {i18n.t('common.ok')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = () =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 28,
    },
    card: {
      width: '100%',
      maxWidth: 340,
      borderRadius: 14,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
    },
    title: {
      fontWeight: '700',
      marginBottom: 12,
      textAlign: 'center',
    },
    message: {
      lineHeight: 22,
    },
    messageSecond: {
      marginTop: 12,
    },
    okButton: {
      marginTop: 18,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    okButtonText: {
      fontWeight: '700',
    },
  });
