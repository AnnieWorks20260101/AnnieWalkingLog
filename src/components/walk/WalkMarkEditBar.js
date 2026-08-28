import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import i18n from '../../i18n';

export default function WalkMarkEditBar({ title, hint, onSave, onCancel, saving = false }) {
  const { currentTheme, fontSizes } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const hintText = hint ?? i18n.t('walk.markEditHint');

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: currentTheme.card,
          borderColor: currentTheme.accentBorder,
          paddingBottom: Math.max(12, insets.bottom + 8),
        },
      ]}
    >
      <Text style={[styles.title, { color: currentTheme.text, fontSize: fontSizes.m }]}>{title}</Text>
      <Text style={[styles.hint, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
        {hintText}
      </Text>
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
  );
}

const createStyles = (fs) => ({
  bar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 14,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  title: { fontWeight: '700', marginBottom: 4 },
  hint: { lineHeight: Math.round(fs.s * 1.4), marginBottom: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 8 },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    minWidth: 96,
    alignItems: 'center',
  },
});
