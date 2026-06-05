import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { handlePremiumScreenBack } from '../../utils/navigateToPremium';
import PlanComparisonTable from '../../components/PlanComparisonTable';
import { useTheme } from '../../contexts/ThemeContext';
import { usePlanTier } from '../../hooks/usePlanTier';
import i18n from '../../i18n';

export default function PremiumScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentTheme, fontSizes } = useTheme();
  const { tier, isPremium } = usePlanTier();

  return (
    <View style={[styles.wrapper, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader
        title={i18n.t('settings.premiumTitle')}
        showBack
        onBackPress={() => handlePremiumScreenBack(navigation, route)}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.statusCard, { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder }]}>
          <Ionicons
            name={isPremium ? 'checkmark-circle' : 'star-outline'}
            size={32}
            color={isPremium ? currentTheme.primary : currentTheme.textSecondary}
          />
          <Text style={[styles.statusTitle, { color: currentTheme.text, fontSize: fontSizes.l }]}>
            {isPremium ? i18n.t('settings.premiumActive') : i18n.t('settings.premiumInactive')}
          </Text>
          <Text style={[styles.statusDesc, { color: currentTheme.textSecondary, fontSize: fontSizes.m }]}>
            {i18n.t('settings.premiumStatusDesc')}
          </Text>
          <Text style={[styles.tierLabel, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
            {i18n.t('plan.tierLabel.' + tier)}
          </Text>
        </View>

        <PlanComparisonTable
          variant="full"
          highlightTier={tier}
          titleKey="settings.premiumComparisonTitle"
        />

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
    marginBottom: 20,
  },
  statusTitle: { fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
  statusDesc: { marginTop: 8, textAlign: 'center', lineHeight: 22 },
  tierLabel: { marginTop: 12, textAlign: 'center' },
  comingSoon: { marginTop: 24, textAlign: 'center', lineHeight: 20 },
});
