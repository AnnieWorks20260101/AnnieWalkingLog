import { BackHandler } from 'react-native';
import { StackActions } from '@react-navigation/native';
import { TAB_SETTINGS, TAB_WALK_LOG } from './tabNames';
import {
  SCREEN_HISTORY,
  SCREEN_PREMIUM,
  SCREEN_SETTINGS_MAIN,
  SCREEN_WALK_DETAIL,
  SCREEN_WALK_PHOTOS,
} from './screenNames';
import { isWalkTrackingActive } from './walkSessionFlag';

function getActiveTabRoute(rootState) {
  if (!rootState?.routes?.length) {
    return null;
  }
  return rootState.routes[rootState.index];
}

function getWalkLogStackState(tabRoute) {
  return tabRoute?.state ?? null;
}

function getWalkLogFocusedRouteName(tabRoute) {
  const stack = getWalkLogStackState(tabRoute);
  if (!stack?.routes?.length) {
    return SCREEN_HISTORY;
  }
  return stack.routes[stack.index]?.name ?? SCREEN_HISTORY;
}

function isWalkLogHistoryRoot(tabRoute) {
  const stack = getWalkLogStackState(tabRoute);
  if (!stack?.routes?.length) {
    return true;
  }
  const index = stack.index ?? 0;
  const focused = stack.routes[index]?.name ?? SCREEN_HISTORY;
  return focused === SCREEN_HISTORY && index === 0;
}

function popWalkLogStack(navigationRef, tabRoute) {
  const stack = getWalkLogStackState(tabRoute);
  if (stack?.key) {
    navigationRef.dispatch({
      ...StackActions.pop(1),
      target: stack.key,
    });
    return;
  }
  navigationRef.navigate(TAB_WALK_LOG, { screen: SCREEN_HISTORY });
}

function getSettingsFocusedRoute(tabRoute) {
  const stack = tabRoute?.state;
  if (!stack?.routes?.length) {
    return { name: SCREEN_SETTINGS_MAIN, params: undefined };
  }
  const route = stack.routes[stack.index];
  return { name: route?.name ?? SCREEN_SETTINGS_MAIN, params: route?.params };
}

/**
 * アプリ共通の戻る処理
 * - お散歩記録中（位置追跡中）: 何もしない
 * - お散歩記録一覧: アプリ終了
 * - お散歩記録の詳細・写真: スタックを1つ戻す
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
    if (isWalkLogHistoryRoot(tabRoute)) {
      const stack = getWalkLogStackState(tabRoute);
      if ((stack?.routes?.length ?? 0) > 1 && stack?.key) {
        navigationRef.dispatch({
          ...StackActions.popToTop(),
          target: stack.key,
        });
        return true;
      }
      BackHandler.exitApp();
      return true;
    }

    const focused = getWalkLogFocusedRouteName(tabRoute);
    if (
      focused === SCREEN_WALK_DETAIL ||
      focused === SCREEN_WALK_PHOTOS ||
      focused === SCREEN_HISTORY
    ) {
      popWalkLogStack(navigationRef, tabRoute);
      return true;
    }

    navigationRef.navigate(TAB_WALK_LOG, { screen: SCREEN_HISTORY });
    return true;
  }

  if (tabRoute.name === TAB_SETTINGS) {
    const { name, params } = getSettingsFocusedRoute(tabRoute);
    if (name !== SCREEN_SETTINGS_MAIN) {
      if (name === SCREEN_PREMIUM && params?.returnTab && params.returnTab !== TAB_SETTINGS) {
        navigationRef.navigate(params.returnTab);
        return true;
      }
      navigationRef.navigate(TAB_SETTINGS, { screen: SCREEN_SETTINGS_MAIN });
      return true;
    }
  }

  if (navigationRef.canGoBack()) {
    navigationRef.goBack();
    return true;
  }

  navigationRef.navigate(TAB_WALK_LOG, { screen: SCREEN_HISTORY });
  return true;
}
