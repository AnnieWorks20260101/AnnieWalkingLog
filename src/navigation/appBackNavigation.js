import { BackHandler } from 'react-native';
import { StackActions } from '@react-navigation/native';
import { TAB_SETTINGS, TAB_WALK, TAB_WALK_LOG } from './tabNames';
import { SCREEN_PREMIUM, SCREEN_SETTINGS_MAIN } from './screenNames';
import { isWalkTrackingActive } from './walkSessionFlag';
import {
  getWalkLogStackSnapshot,
  isWalkLogHistoryRoot,
  isWalkLogShowingHistoryList,
  popWalkLogToHistoryFromRoot,
} from './walkNavigation';

function getActiveTabRoute(rootState) {
  if (!rootState?.routes?.length) {
    return null;
  }
  return rootState.routes[rootState.index];
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
 * - お散歩タブで追跡中のみ: 戻るを無効化
 * - お散歩記録一覧（スタック先頭のみ）: アプリ終了
 * - お散歩記録の詳細・写真: 一覧へ（スタック popTo）
 * - 設定タブなどスタック内の子画面: スタックを1つ戻る
 * - その他のタブのルート: お散歩記録一覧へ
 */
export function handleAppBackPress(navigationRef) {
  if (!navigationRef?.isReady?.()) {
    return false;
  }

  const rootState = navigationRef.getRootState();
  const tabRoute = getActiveTabRoute(rootState);
  if (!tabRoute) {
    return false;
  }

  if (__DEV__ && tabRoute.name === TAB_WALK_LOG) {
    const snapshot = getWalkLogStackSnapshot(navigationRef);
    console.log('[walkNav] back press WalkLog stack:', {
      routes: snapshot.routes,
      index: snapshot.index,
      routeCount: snapshot.routeCount,
      focused: snapshot.focused,
      isHistoryRoot: isWalkLogHistoryRoot(snapshot),
    });
  }

  if (isWalkTrackingActive() && tabRoute.name === TAB_WALK) {
    return true;
  }

  if (tabRoute.name === TAB_WALK_LOG) {
    const snapshot = getWalkLogStackSnapshot(navigationRef);

    if (isWalkLogShowingHistoryList(snapshot)) {
      if (snapshot.routeCount > 1) {
        const stackKey = tabRoute.state?.key;
        if (stackKey) {
          navigationRef.dispatch({ ...StackActions.popToTop(), target: stackKey });
        }
      }
      BackHandler.exitApp();
      return true;
    }

    popWalkLogToHistoryFromRoot(navigationRef);
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

  popWalkLogToHistoryFromRoot(navigationRef);
  return true;
}
