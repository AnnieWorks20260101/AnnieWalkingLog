import { Alert } from 'react-native';
import i18n from '../i18n';
import { navigateToPremiumScreen } from './navigateToPremium';

/**
 * 比較グラフなどプレミアムロック領域タップ時
 * @param {import('@react-navigation/native').NavigationProp<any>} navigation
 */
export function showPremiumLockedAlert(navigation) {
  Alert.alert(i18n.t('walk.graphPremiumLockedAlertTitle'), i18n.t('walk.graphPremiumLockedAlertMessage'), [
    { text: i18n.t('walk.graphPremiumLockedLater'), style: 'cancel' },
    {
      text: i18n.t('walk.graphPremiumLockedViewPlan'),
      onPress: () => navigateToPremiumScreen(navigation),
    },
  ]);
}
