import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { NavigationRefContext } from '../navigation/NavigationRefContext';
import { handleAppBackPress } from '../navigation/appBackNavigation';

export default function ScreenHeader({ title, showBack = false, onBackPress }) {
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

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: currentTheme.surface,
          borderBottomColor: currentTheme.accentBorder,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="戻る"
          >
            <Ionicons name="chevron-back" size={28} color={accentColor} />
          </TouchableOpacity>
        ) : null}
        <Text
          style={[
            styles.title,
            { color: titleColor, fontSize: showBack ? fontSizes.l : fontSizes.xl },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 4,
    marginLeft: -6,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
});
