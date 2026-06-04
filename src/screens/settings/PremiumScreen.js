import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { useTheme } from '../../contexts/ThemeContext';
import { usePremium } from '../../hooks/usePremium';
import i18n from '../../i18n';

export default function PremiumScreen() {
  const { currentTheme, fontSizes } = useTheme();
  const { isPremium } = usePremium();

  return (
    <View style={[styles.wrapper, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('settings.premiumTitle')} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.statusCard, { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder }]}>
          <Ionicons name={isPremium ? 'checkmark-circle' : 'star-outline'} size={32} color={isPremium ? currentTheme.primary : currentTheme.textSecondary} />
          <Text style={[styles.statusTitle, { color: currentTheme.text, fontSize: fontSizes.l }]}>
            {isPremium ? i18n.t('settings.premiumActive') : i18n.t('settings.premiumInactive')}
          </Text>
          <Text style={[styles.statusDesc, { color: currentTheme.textSecondary, fontSize: fontSizes.m }]}>
            {i18n.t('settings.premiumStatusDesc')}
          </Text>
        </View>

        <Text style={[styles.sectionHeading, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
          {i18n.t('settings.premiumBenefitsTitle')}
        </Text>
        {[1, 2, 3].map((n) => (
          <View key={n} style={styles.benefitRow}>
            <Ionicons name="paw" size={18} color={currentTheme.primary} />
            <Text style={[styles.benefitText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
              {i18n.t(`settings.premiumBenefit${n}`)}
            </Text>
          </View>
        ))}

        <Text style={[styles.comingSoon, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
          {i18n.t('settings.premiumComingSoon')}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  statusTitle: { fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
  statusDesc: { marginTop: 8, textAlign: 'center', lineHeight: 22 },
  sectionHeading: { fontWeight: '600', marginBottom: 12, marginLeft: 4 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, paddingHorizontal: 4 },
  benefitText: { flex: 1, marginLeft: 10, lineHeight: 22 },
  comingSoon: { marginTop: 24, textAlign: 'center', lineHeight: 20 },
});
