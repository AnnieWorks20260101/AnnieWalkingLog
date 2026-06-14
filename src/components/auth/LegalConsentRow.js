import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import i18n from '../../i18n';
import { openPrivacyPolicy } from '../../utils/openPrivacyPolicy';
import { openTermsOfService } from '../../utils/openTermsOfService';

/**
 * @param {{ checked: boolean, onToggle: () => void, disabled?: boolean }} props
 */
export default function LegalConsentRow({ checked, onToggle, disabled = false }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.row, { borderColor: currentTheme.border, backgroundColor: currentTheme.card }]}>
      <TouchableOpacity
        style={styles.checkboxHit}
        onPress={disabled ? undefined : onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={checked ? 'checkbox' : 'square-outline'}
          size={24}
          color={checked ? currentTheme.primary : currentTheme.textSecondary}
        />
      </TouchableOpacity>
      <Text style={[styles.label, { color: currentTheme.text }]}>
        <Text style={[styles.link, { color: currentTheme.primary }]} onPress={openPrivacyPolicy}>
          {i18n.t('legal.privacyPolicy')}
        </Text>
        {i18n.t('legal.legalConsentMiddle')}
        <Text style={[styles.link, { color: currentTheme.primary }]} onPress={openTermsOfService}>
          {i18n.t('legal.termsOfService')}
        </Text>
        {i18n.t('legal.legalConsentSuffix')}
      </Text>
    </View>
  );
}

const createStyles = (fs) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  checkboxHit: {
    marginRight: 10,
    marginTop: 1,
  },
  label: {
    flex: 1,
    fontSize: fs.s,
    lineHeight: 22,
  },
  link: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
