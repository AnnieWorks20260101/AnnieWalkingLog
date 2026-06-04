import { Alert } from 'react-native';
import i18n from '../i18n';
import { SCREEN_GUEST_UPGRADE } from '../navigation/screenNames';
import { PLAN_TIER } from '../constants/planEntitlements';
import { navigateToPremiumScreen } from './navigateToPremium';

/**
 * @param {object} params
 * @param {import('@react-navigation/native').NavigationProp<any>} params.navigation
 * @param {'pet' | 'photo' | 'history'} params.limitKey
 * @param {import('../constants/planEntitlements').PlanTier} params.tier
 */
export function showPlanLimitAlert({ navigation, limitKey, tier }) {
  const title = i18n.t(`plan.limit.${limitKey}.title`);
  const message = i18n.t(`plan.limit.${limitKey}.message`);

  const buttons = [{ text: i18n.t('walk.cancel'), style: 'cancel' }];

  if (tier === PLAN_TIER.guest) {
    buttons.push({
      text: i18n.t('plan.limit.registerCta'),
      onPress: () => navigation.navigate(SCREEN_GUEST_UPGRADE),
    });
  } else {
    buttons.push({
      text: i18n.t('plan.limit.premiumCta'),
      onPress: () => navigateToPremiumScreen(navigation),
    });
  }

  Alert.alert(title, message, buttons);
}
