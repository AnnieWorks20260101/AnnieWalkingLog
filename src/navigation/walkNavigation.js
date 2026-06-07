import { CommonActions } from '@react-navigation/native';
import { TAB_WALK_LOG } from './tabNames';
import { SCREEN_HISTORY, SCREEN_WALK_DETAIL } from './screenNames';
import { serializeWalkForNavigation } from '../utils/walkNavigationParams';

export { SCREEN_WALK_DETAIL };

function getWalkLogStackKey(navigation) {
  const state = navigation.getState?.();
  if (!state?.routes?.length) {
    return null;
  }

  const walkLogRoute = state.routes.find((route) => route.name === TAB_WALK_LOG);
  return walkLogRoute?.state?.key ?? null;
}

function resetWalkLogStack(navigation, routes, index) {
  const stackKey = getWalkLogStackKey(navigation);
  if (!stackKey) {
    return false;
  }

  navigation.dispatch({
    ...CommonActions.reset({
      index,
      routes,
    }),
    target: stackKey,
  });
  return true;
}

/** お散歩記録タブを一覧だけのスタックにリセット */
export function navigateWalkLogToHistory(tabNavigation) {
  if (!tabNavigation) {
    return;
  }

  tabNavigation.navigate(TAB_WALK_LOG);

  if (
    resetWalkLogStack(tabNavigation, [{ name: SCREEN_HISTORY }], 0)
  ) {
    return;
  }

  tabNavigation.navigate(TAB_WALK_LOG, { screen: SCREEN_HISTORY });
}

/** ルート ref からお散歩記録一覧へ */
export function navigateWalkLogToHistoryFromRoot(navigationRef) {
  if (!navigationRef?.isReady?.()) {
    return;
  }
  navigateWalkLogToHistory(navigationRef);
}

/** お散歩記録タブの詳細画面へ遷移（スタックを [一覧, 詳細] に固定） */
export function navigateToWalkDetail(tabNavigation, walk) {
  if (!tabNavigation) {
    return;
  }

  const serializedWalk = serializeWalkForNavigation(walk);
  tabNavigation.navigate(TAB_WALK_LOG);

  if (
    resetWalkLogStack(
      tabNavigation,
      [
        { name: SCREEN_HISTORY },
        { name: SCREEN_WALK_DETAIL, params: { walk: serializedWalk } },
      ],
      1
    )
  ) {
    return;
  }

  tabNavigation.navigate(TAB_WALK_LOG, {
    screen: SCREEN_WALK_DETAIL,
    params: { walk: serializedWalk },
  });
}

/**
 * ルート NavigationContainer から記録詳細へ（プッシュ通知タップ用）
 * @param {import('@react-navigation/native').NavigationContainerRef<ReactNavigation.RootParamList> | null} navigationRef
 * @param {Record<string, unknown>} walk
 */
export function navigateToWalkDetailFromRoot(navigationRef, walk) {
  if (!navigationRef || !walk) {
    return;
  }

  const navigate = () => {
    navigateToWalkDetail(navigationRef, walk);
  };

  if (navigationRef.isReady()) {
    navigate();
    return;
  }

  const unsubscribe = navigationRef.addListener('state', () => {
    if (navigationRef.isReady()) {
      unsubscribe();
      navigate();
    }
  });
}
