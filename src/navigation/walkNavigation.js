import { TAB_WALK_LOG } from './tabNames';
import { SCREEN_WALK_DETAIL } from './screenNames';
import { serializeWalkForNavigation } from '../utils/walkNavigationParams';

export { SCREEN_WALK_DETAIL };

/** お散歩記録タブの詳細画面へ遷移（お散歩タブのスタックと分離） */
export function navigateToWalkDetail(tabNavigation, walk) {
  tabNavigation?.navigate(TAB_WALK_LOG, {
    screen: SCREEN_WALK_DETAIL,
    params: { walk: serializeWalkForNavigation(walk) },
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
    navigationRef.navigate(TAB_WALK_LOG, {
      screen: SCREEN_WALK_DETAIL,
      params: { walk: serializeWalkForNavigation(walk) },
    });
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
