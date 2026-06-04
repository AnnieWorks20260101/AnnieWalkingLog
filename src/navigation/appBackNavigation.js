import { BackHandler } from 'react-native';
import { TAB_WALK_LOG } from './tabNames';
import { SCREEN_WALK_DETAIL } from './walkNavigation';
import { SCREEN_HISTORY } from './screenNames';
import { isWalkTrackingActive } from './walkSessionFlag';

function getActiveTabRoute(rootState) {
  if (!rootState?.routes?.length) {
    return null;
  }
  return rootState.routes[rootState.index];
}

function getWalkLogFocusedRouteName(tabRoute) {
  const stack = tabRoute?.state;
  if (!stack?.routes?.length) {
    return SCREEN_HISTORY;
  }
  return stack.routes[stack.index]?.name ?? SCREEN_HISTORY;
}

/**
 * アプリ共通の戻る処理
 * - お散歩記録中（位置追跡中）: 何もしない
 * - お散歩記録一覧: アプリ終了
 * - お散歩記録の詳細: 一覧へ
 * - 設定タブなどスタック内の子画面: スタックを1つ戻る
 * - その他のタブのルート: お散歩記録一覧へ
 */
export function handleAppBackPress(navigationRef) {
  if (isWalkTrackingActive()) {
    return true;
  }

  if (!navigationRef?.isReady?.()) {
    return false;
  }

  const rootState = navigationRef.getRootState();
  const tabRoute = getActiveTabRoute(rootState);
  if (!tabRoute) {
    return false;
  }

  if (tabRoute.name === TAB_WALK_LOG) {
    const focused = getWalkLogFocusedRouteName(tabRoute);
    if (focused === SCREEN_WALK_DETAIL) {
      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
      } else {
        navigationRef.navigate(TAB_WALK_LOG, { screen: SCREEN_HISTORY });
      }
      return true;
    }
    BackHandler.exitApp();
    return true;
  }

  if (navigationRef.canGoBack()) {
    navigationRef.goBack();
    return true;
  }

  navigationRef.navigate(TAB_WALK_LOG, { screen: SCREEN_HISTORY });
  return true;
}
