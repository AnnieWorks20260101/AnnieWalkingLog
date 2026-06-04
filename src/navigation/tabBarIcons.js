import { TAB_WALK_LOG, TAB_WALK_GRAPH, TAB_WALK, TAB_PETS, TAB_SETTINGS } from './tabNames';

/** タブごとのアイコン名（未選択は outline、選択中は塗り） */
export function getTabBarIconName(routeName, focused) {
  switch (routeName) {
    case TAB_WALK_LOG:
      return focused ? 'list' : 'list-outline';
    case TAB_WALK_GRAPH:
      return focused ? 'bar-chart' : 'bar-chart-outline';
    case TAB_WALK:
      return focused ? 'walk' : 'walk-outline';
    case TAB_PETS:
      return focused ? 'paw' : 'paw-outline';
    case TAB_SETTINGS:
      return focused ? 'settings' : 'settings-outline';
    default:
      return 'ellipse-outline';
  }
}
