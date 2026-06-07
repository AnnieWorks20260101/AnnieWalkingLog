import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { getTabBarIconName } from './tabBarIcons';
import { TAB_SETTINGS, TAB_WALK_LOG } from './tabNames';
import { SCREEN_HISTORY, SCREEN_SETTINGS_MAIN } from './screenNames';
import { navigateWalkLogToHistory } from './walkNavigation';

/**
 * 標準タブバーはカスタムアイコン枠が小さくクリップしやすいため、参考UIどおり自前レイアウト。
 */
export default function AppTabBar({ state, descriptors, navigation }) {
  const { currentTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: currentTheme.card,
          borderTopColor: currentTheme.border,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;
        const focused = state.index === index;
        const color = focused ? currentTheme.primary : currentTheme.textSecondary;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (route.name === TAB_WALK_LOG) {
            const stackRoute = route.state?.routes?.[route.state?.index ?? 0];
            if (stackRoute?.name && stackRoute.name !== SCREEN_HISTORY) {
              navigateWalkLogToHistory(navigation);
              return;
            }
          }

          if (!focused && !event.defaultPrevented) {
            if (route.name === TAB_SETTINGS) {
              navigation.navigate(TAB_SETTINGS, { screen: SCREEN_SETTINGS_MAIN });
            } else if (route.name === TAB_WALK_LOG) {
              navigateWalkLogToHistory(navigation);
            } else {
              navigation.navigate(route.name, route.params);
            }
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <View style={styles.iconSlot}>
              {focused ? (
                <View style={[styles.pill, { backgroundColor: currentTheme.tabBarPill }]} />
              ) : null}
              <Ionicons name={getTabBarIconName(route.name, focused)} size={22} color={color} />
            </View>
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  iconSlot: {
    width: 56,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 2,
  },
});
