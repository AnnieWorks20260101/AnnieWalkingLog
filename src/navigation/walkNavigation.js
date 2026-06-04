import { TAB_WALK_LOG } from './tabNames';
import { SCREEN_WALK_DETAIL } from './screenNames';

export { SCREEN_WALK_DETAIL };

/** お散歩記録タブの詳細画面へ遷移（お散歩タブのスタックと分離） */
export function navigateToWalkDetail(tabNavigation, walk) {
  tabNavigation?.navigate(TAB_WALK_LOG, {
    screen: SCREEN_WALK_DETAIL,
    params: { walk },
  });
}
