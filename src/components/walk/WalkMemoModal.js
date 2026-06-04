import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import i18n from '../../i18n';

export default function WalkMemoModal({
  visible,
  title,
  value,
  onChangeText,
  onSave,
  onCancel,
  saving = false,
}) {
  const { currentTheme, fontSizes } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const sheetBottomPadding = Math.max(24, insets.bottom + 16);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: currentTheme.card, paddingBottom: sheetBottomPadding },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: currentTheme.text, fontSize: fontSizes.l }]}>{title}</Text>
            <TouchableOpacity onPress={onCancel} hitSlop={12} disabled={saving}>
              <Ionicons name="close-circle" size={28} color={currentTheme.textSecondary} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={[
              styles.input,
              {
                color: currentTheme.text,
                borderColor: currentTheme.border,
                backgroundColor: currentTheme.background,
                fontSize: fontSizes.m,
              },
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={i18n.t('walk.memoPlaceholder')}
            placeholderTextColor={currentTheme.textSecondary}
            multiline
            textAlignVertical="top"
            autoFocus
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} disabled={saving}>
              <Text style={{ color: currentTheme.textSecondary, fontSize: fontSizes.m }}>
                {i18n.t('walk.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: currentTheme.primary }]}
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={currentTheme.card} />
              ) : (
                <Text style={{ color: currentTheme.card, fontWeight: 'bold', fontSize: fontSizes.m }}>
                  {i18n.t('walk.memoSave')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (fs) => ({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontWeight: 'bold', flex: 1, marginRight: 8 },
  input: {
    minHeight: 120,
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 8 },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
});
