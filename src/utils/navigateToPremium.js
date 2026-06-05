import { TAB_SETTINGS } from '../navigation/tabNames';
import { SCREEN_PREMIUM, SCREEN_SETTINGS_MAIN } from '../navigation/screenNames';

function getTabNavigator(navigation) {
  return navigation.getParent?.() ?? navigation;
}

function getActiveTabName(tabNavigation) {
  const state = tabNavigation.getState?.();
  if (!state?.routes?.length) {
    return null;
  }
  return state.routes[state.index]?.name ?? null;
}

/**
 * どのタブからでも設定スタックのプレミアム画面へ遷移
 * @param {import('@react-navigation/native').NavigationProp<any>} navigation
 */
export function navigateToPremiumScreen(navigation) {
  const tabNav = getTabNavigator(navigation);
  const returnTab = getActiveTabName(tabNav);

  tabNav.navigate(TAB_SETTINGS, {
    screen: SCREEN_PREMIUM,
    params: { returnTab },
  });
}

/**
 * プレミアム画面の戻る（ヘッダー・Android 戻るボタン共通）
 * @param {import('@react-navigation/native').NavigationProp<any>} navigation
 * @param {import('@react-navigation/native').RouteProp<any>} route
 */
export function handlePremiumScreenBack(navigation, route) {
  const returnTab = route?.params?.returnTab;
  const tabNav = navigation.getParent();

  if (returnTab && returnTab !== TAB_SETTINGS && tabNav) {
    tabNav.navigate(returnTab);
    return true;
  }

  if (navigation.canGoBack()) {
    navigation.goBack();
    return true;
  }

  navigation.navigate(SCREEN_SETTINGS_MAIN);
  return true;
}
