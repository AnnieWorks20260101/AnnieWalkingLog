import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_SIZES } from '../../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

export default function ScreenHeader({ title, showBack = false, onBackPress }) {
  const { currentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
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
        <Text style={[styles.title, { color: titleColor }, showBack && styles.titleWithBack]} numberOfLines={1}>
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
    fontSize: FONT_SIZES.standard.xl,
    fontWeight: 'bold',
    flex: 1,
  },
  titleWithBack: {
    fontSize: FONT_SIZES.standard.l,
  },
});
