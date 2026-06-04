import { TAB_SETTINGS } from '../navigation/tabNames';
import { SCREEN_PREMIUM } from '../navigation/screenNames';

/**
 * どのタブからでも設定スタックのプレミアム画面へ遷移
 * @param {import('@react-navigation/native').NavigationProp<any>} navigation
 */
export function navigateToPremiumScreen(navigation) {
  const root = navigation.getParent?.() ?? navigation;
  root.navigate(TAB_SETTINGS, {
    screen: SCREEN_PREMIUM,
  });
}
