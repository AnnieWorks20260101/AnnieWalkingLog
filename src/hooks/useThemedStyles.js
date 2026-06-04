import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

/**
 * 設定の文字サイズ（小・標準・大）に連動した StyleSheet を生成する。
 * 下タブなど、意図的に固定サイズにしたい箇所では使わない。
 */
export function useThemedStyles(stylesFactory) {
  const { fontSizes } = useTheme();
  return useMemo(() => StyleSheet.create(stylesFactory(fontSizes)), [fontSizes]);
}
