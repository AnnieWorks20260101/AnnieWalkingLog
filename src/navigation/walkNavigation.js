import { StackActions } from '@react-navigation/native';
import { TAB_WALK_LOG } from './tabNames';
import { SCREEN_HISTORY, SCREEN_WALK_DETAIL, SCREEN_WALK_PHOTOS } from './screenNames';
import { serializeWalkForNavigation } from '../utils/walkNavigationParams';

export { SCREEN_WALK_DETAIL };

function getWalkLogTabRoute(rootState) {
  return rootState?.routes?.find((route) => route.name === TAB_WALK_LOG) ?? null;
}

function getWalkLogStackKeyFromRootState(rootState) {
  return getWalkLogTabRoute(rootState)?.state?.key ?? null;
}

function buildWalkLogSnapshot(stackState, focused) {
  if (!stackState?.routes?.length) {
    return {
      name: SCREEN_HISTORY,
      index: 0,
      routeCount: 1,
      routes: [SCREEN_HISTORY],
      focused,
    };
  }

  const index = stackState.index ?? 0;
  return {
    name: stackState.routes[index]?.name ?? SCREEN_HISTORY,
    index,
    routeCount: stackState.routes.length,
    routes: stackState.routes.map((route) => route.name),
    focused,
  };
}

/** ルート state からお散歩記録スタックの状態を取得 */
export function getWalkLogStackSnapshot(navigationRef) {
  if (!navigationRef?.isReady?.()) {
    return buildWalkLogSnapshot(null, false);
  }

  const rootState = navigationRef.getRootState();
  const activeTab = rootState?.routes?.[rootState.index ?? 0];
  const walkLogTab = getWalkLogTabRoute(rootState);
  const focused = activeTab?.name === TAB_WALK_LOG;

  return buildWalkLogSnapshot(walkLogTab?.state, focused);
}

/** 一覧画面を表示中か（index 0 の History） */
export function isWalkLogShowingHistoryList(snapshot) {
  return snapshot.name === SCREEN_HISTORY && snapshot.index === 0;
}

/** お散歩記録一覧がスタック唯一の画面か */
export function isWalkLogHistoryRoot(snapshot) {
  return isWalkLogShowingHistoryList(snapshot) && snapshot.routeCount === 1;
}

function isWalkLogStackPolluted(snapshot) {
  const historyCount = snapshot.routes.filter((name) => name === SCREEN_HISTORY).length;
  return historyCount > 1 || (isWalkLogShowingHistoryList(snapshot) && snapshot.routeCount > 1);
}

function isWalkLogNestedScreen(snapshot) {
  return snapshot.name === SCREEN_WALK_DETAIL || snapshot.name === SCREEN_WALK_PHOTOS;
}

function dispatchWalkLogPopToHistory(navigation, rootState) {
  const stackKey = getWalkLogStackKeyFromRootState(rootState);
  if (!stackKey) {
    return false;
  }

  navigation.dispatch({ ...StackActions.popTo(SCREEN_HISTORY), target: stackKey });
  return true;
}

function dispatchWalkLogPopToTop(navigation, rootState) {
  const stackKey = getWalkLogStackKeyFromRootState(rootState);
  if (!stackKey) {
    return false;
  }

  navigation.dispatch({ ...StackActions.popToTop(), target: stackKey });
  return true;
}

/** 詳細を開く（保存後・通知・一覧タップで共通） */
export function openWalkDetail(navigation, walk) {
  if (!navigation || !walk) {
    return;
  }

  navigation.navigate(TAB_WALK_LOG, {
    screen: SCREEN_WALK_DETAIL,
    params: { walk: serializeWalkForNavigation(walk) },
  });
}

/**
 * ルート NavigationContainer から記録詳細へ（プッシュ通知タップ用）
 * @param {import('@react-navigation/native').NavigationContainerRef<ReactNavigation.RootParamList> | null} navigationRef
 * @param {Record<string, unknown>} walk
 */
export function openWalkDetailFromRoot(navigationRef, walk) {
  if (!navigationRef || !walk) {
    return;
  }

  const navigate = () => {
    openWalkDetail(navigationRef, walk);
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

/** 詳細を閉じて一覧へ（スタック内 popTo のみ） */
export function closeWalkDetailToHistory(stackNavigation) {
  if (!stackNavigation) {
    return;
  }

  if (typeof stackNavigation.popTo === 'function') {
    stackNavigation.popTo(SCREEN_HISTORY);
    return;
  }

  if (stackNavigation.canGoBack()) {
    stackNavigation.pop();
  }
}

/**
 * お散歩記録タブの一覧へ復帰（他タブからのタブ切替用）
 * 表示中タブのスタック操作は popWalkLogToHistoryFromRoot を使う
 */
export function popWalkLogToHistory(tabNavigation) {
  if (!tabNavigation?.navigate) {
    return;
  }

  tabNavigation.navigate(TAB_WALK_LOG, {
    screen: SCREEN_HISTORY,
    pop: true,
  });
}

/** ルート ref からお散歩記録一覧へ強制復帰（ハードウェア戻る用） */
export function popWalkLogToHistoryFromRoot(navigationRef) {
  if (!navigationRef?.isReady?.()) {
    return;
  }

  const snapshot = getWalkLogStackSnapshot(navigationRef);
  const rootState = navigationRef.getRootState();
  const activeTab = rootState?.routes?.[rootState.index ?? 0];
  const onWalkLogTab = activeTab?.name === TAB_WALK_LOG;

  if (isWalkLogHistoryRoot(snapshot) && snapshot.focused) {
    return;
  }

  if (onWalkLogTab) {
    if (isWalkLogStackPolluted(snapshot)) {
      dispatchWalkLogPopToTop(navigationRef, rootState);
      return;
    }

    if (isWalkLogNestedScreen(snapshot)) {
      dispatchWalkLogPopToHistory(navigationRef, rootState);
      return;
    }

    dispatchWalkLogPopToTop(navigationRef, rootState);
    return;
  }

  navigationRef.navigate(TAB_WALK_LOG, {
    screen: SCREEN_HISTORY,
    pop: true,
  });
}
