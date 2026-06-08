import { TAB_WALK_LOG } from './tabNames';
import { SCREEN_HISTORY, SCREEN_WALK_DETAIL } from './screenNames';
import { serializeWalkForNavigation } from '../utils/walkNavigationParams';

export { SCREEN_WALK_DETAIL };

/** お散歩記録タブを一覧へ（スタック上の詳細などを畳む） */
export function navigateWalkLogToHistory(tabNavigation) {
  tabNavigation?.navigate(TAB_WALK_LOG, { screen: SCREEN_HISTORY });
}

/** ルート ref からお散歩記録一覧へ */
export function navigateWalkLogToHistoryFromRoot(navigationRef) {
  if (!navigationRef?.isReady?.()) {
    return;
  }
  navigationRef.navigate(TAB_WALK_LOG, { screen: SCREEN_HISTORY });
}

/**
 * お散歩記録タブの詳細画面へ遷移（お散歩タブのスタックと分離）
 * 一覧→詳細と同じく、いったん一覧に畳んでから詳細を開く
 */
export function navigateToWalkDetail(tabNavigation, walk) {
  if (!tabNavigation) {
    return;
  }

  const serializedWalk = serializeWalkForNavigation(walk);

  tabNavigation.navigate(TAB_WALK_LOG, { screen: SCREEN_HISTORY });
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
