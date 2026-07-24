import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { NavigationRefContext } from '../navigation/NavigationRefContext';
import { handleAppBackPress } from '../navigation/appBackNavigation';

export default function ScreenHeader({
  title,
  showBack = false,
  onBackPress,
  compact = false,
  rightAction = null,
  children,
}) {
  const { currentTheme, fontSizes } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const navigationRef = useContext(NavigationRefContext);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    if (navigationRef?.isReady?.()) {
      handleAppBackPress(navigationRef);
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const titleColor = currentTheme.headerText || currentTheme.text;
  const accentColor = currentTheme.headerText || currentTheme.primary;
  const titleSize = compact
    ? fontSizes.m
    : showBack
      ? fontSizes.l
      : fontSizes.xl;

  return (
    <View
      style={[
        styles.header,
        compact ? styles.headerCompact : null,
        {
          backgroundColor: currentTheme.surface,
          borderBottomColor: currentTheme.accentBorder,
          paddingTop: insets.top + (compact ? 4 : 8),
        },
      ]}
    >
      <View style={[styles.row, compact && styles.rowCompact]}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.backButton, compact && styles.backButtonCompact]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="戻る"
          >
            <Ionicons name="chevron-back" size={compact ? 24 : 28} color={accentColor} />
          </TouchableOpacity>
        ) : null}
        <Text
          style={[styles.title, { color: titleColor, fontSize: titleSize }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
      </View>
      {children ? <View style={[styles.extra, compact && styles.extraCompact]}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerCompact: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowCompact: {
    minHeight: 28,
  },
  backButton: {
    marginRight: 4,
    marginLeft: -6,
  },
  backButtonCompact: {
    marginRight: 2,
    marginLeft: -4,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  rightAction: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extra: {
    marginTop: 8,
  },
  extraCompact: {
    marginTop: 4,
  },
});
