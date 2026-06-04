import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

export default function GraphSelectDropdown({
  label,
  options,
  value,
  onChange,
  getOptionLabel,
  disabled = false,
}) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [open, setOpen] = useState(false);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setOpen(false);
  };

  const triggerStyle = [
    styles.trigger,
    { backgroundColor: currentTheme.chipBackground, borderColor: currentTheme.accentBorder },
    disabled && styles.triggerDisabled,
  ];

  return (
    <>
      {disabled ? (
        <View style={triggerStyle}>
          <Text style={[styles.triggerText, { color: currentTheme.textSecondary }]} numberOfLines={1}>
            {label}
          </Text>
          <Ionicons name="chevron-down" size={16} color={currentTheme.textSecondary} />
        </View>
      ) : (
        <TouchableOpacity
          style={triggerStyle}
          onPress={() => setOpen(true)}
          accessibilityRole="button"
        >
          <Text style={[styles.triggerText, { color: currentTheme.text }]} numberOfLines={1}>
            {label}
          </Text>
          <Ionicons name="chevron-down" size={16} color={currentTheme.textSecondary} />
        </TouchableOpacity>
      )}

      <Modal visible={!disabled && open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: currentTheme.card, borderColor: currentTheme.accentBorder }]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView bounces={false}>
              {options.map((optionValue) => {
                const selected = optionValue === value;
                return (
                  <TouchableOpacity
                    key={optionValue}
                    style={[
                      styles.option,
                      selected && { backgroundColor: currentTheme.primaryMuted },
                    ]}
                    onPress={() => handleSelect(optionValue)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: currentTheme.text },
                        selected && { color: currentTheme.primary, fontWeight: '700' },
                      ]}
                    >
                      {getOptionLabel(optionValue)}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark" size={20} color={currentTheme.primary} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (fs) => ({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    maxWidth: 168,
    gap: 4,
  },
  triggerText: {
    flex: 1,
    fontSize: fs.s,
    fontWeight: '600',
  },
  triggerDisabled: {
    opacity: 0.7,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 360,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: fs.m,
    flex: 1,
  },
});
