import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { PLAN_TIER } from '../constants/planEntitlements';
import { showPlanLimitAlert } from '../utils/planLimitAlert';
import i18n from '../i18n';

/**
 * ゲスト・無料会員向けのプラン注意書き（タップで詳細アラート）
 * @param {'history' | 'graph'} variant
 */
export default function PlanTierNotice({ tier, variant = 'history', style }) {
  const navigation = useNavigation();
  const { currentTheme, fontSizes } = useTheme();

  if (tier !== PLAN_TIER.guest && tier !== PLAN_TIER.registered) {
    return null;
  }

  const messageKey =
    variant === 'graph' ? `plan.graphNotice.${tier}` : `plan.historyNotice.${tier}`;

  return (
    <TouchableOpacity
      style={[
        styles.planNotice,
        { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder },
        style,
      ]}
      onPress={() => showPlanLimitAlert({ navigation, limitKey: 'history', tier })}
      activeOpacity={0.8}
    >
      <Text style={[styles.planNoticeText, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
        {i18n.t(messageKey)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  planNotice: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  planNoticeText: { lineHeight: 20 },
});
