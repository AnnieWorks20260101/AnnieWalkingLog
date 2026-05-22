// theme.ts

// 🎨 カラーパレットの定義
export const COLORS = {
  light: {
    background: '#FFFFFF',
    card: '#F8F8F8',
    text: '#333333',
    textSecondary: '#888888',
    primary: '#007AFF',     // アニーのメインブルー
    border: '#F0F0F0',
    danger: '#FF3B30',
    headerBackground: '#E8F5E9', 
    headerText: '#2E7D32',
    inputBackground: '#FFFFFF',
  },
  dark: {
    background: '#121212',
    card: '#252525',
    text: '#E0E0E0',
    textSecondary: '#AAAAAA',
    primary: '#0A84FF',
    border: '#383838',
    danger: '#FF453A',
    headerBackground: '#1B5E20', 
    headerText: '#E8F5E9',
    inputBackground: '#252525',
  },
  warm: { // 💡 「その他」の例（目に優しいセピア・ウォーム系）
    background: '#FDF6E3',
    card: '#EEE8D5',
    text: '#5D4037',
    textSecondary: '#8D6E63',
    primary: '#D97736',
    border: '#E0D4B6',
    danger: '#CB4B16',
    headerBackground: '#E6C280', 
    headerText: '#5D4037',
    inputBackground: '#FFFFFF',
  },
  mint: {
    background: '#F1F8F6',
    card: '#FFFFFF',
    text: '#2D3436',
    textSecondary: '#636E72',
    primary: '#00B894', // ミントグリーン
    border: '#DFF2ED',
    danger: '#D63031',
    headerBackground: '#E6F4F1',
    headerText: '#006266',
    inputBackground: '#FFFFFF',
  },
  midnight: {
    background: '#000000', // 完全な黒
    card: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#888888',
    primary: '#BB86FC', // バイオレット系
    border: '#333333',
    danger: '#CF6679',
    headerBackground: '#000000',
    headerText: '#BB86FC',
    inputBackground: '#121212',
  },
  sakura: {
    background: '#FFF5F7',
    card: '#FFFFFF',
    text: '#4A235A',
    textSecondary: '#9B59B6',
    primary: '#E91E63',
    border: '#FADBD8',
    danger: '#C0392B',
    headerBackground: '#F8BBD0',
    headerText: '#880E4F',
    inputBackground: '#FFFFFF',
  },
  ocean: {
    background: '#F0F7FF',
    card: '#FFFFFF',
    text: '#2C3E50',
    textSecondary: '#5D6D7E',
    primary: '#0984E3',
    border: '#D1E9FF',
    danger: '#E74C3C',
    headerBackground: '#E1F5FE', 
    headerText: '#01579B',
    inputBackground: '#FFFFFF',
  },
  lemon: {
    background: '#FFFDE7',
    card: '#FFFFFF',
    text: '#5D4037',
    textSecondary: '#8D6E63',
    primary: '#FBC02D', // 視認性を考え、少し濃いめの黄色
    border: '#FFF9C4',
    danger: '#D32F2F',
    headerBackground: '#FFF9C4', 
    headerText: '#F57F17',
    inputBackground: '#FFFFFF',
  },
  lavender: {
    background: '#F8F4FF',
    card: '#FFFFFF',
    text: '#4834D4',
    textSecondary: '#686DE0',
    primary: '#6C5CE7',
    border: '#EFECFF',
    danger: '#FF7675',
    headerBackground: '#F3E5F5', 
    headerText: '#4A148C',
    inputBackground: '#FFFFFF',
  },
  forest: {
    background: '#E7F2E8',     // 少し深みのある薄緑
    card: '#FFFFFF',
    text: '#1B4332',           // 濃い常盤色
    textSecondary: '#40916C',
    primary: '#2D6A4F',        // 🌟 深いフォレストグリーン
    border: '#B7E4C7',
    danger: '#E74C3C',
    headerBackground: '#B7E4C7', 
    headerText: '#1B4332',
    inputBackground: '#FFFFFF',
  }
};

// 🔠 フォントサイズの定義
// ※基本となるサイズ(s, m, l, xl)をセットで用意しておくと、画面ごとのバランスが崩れません
export const FONT_SIZES = {
  compact: { s: 10, m: 14, l: 16, xl: 20 },
  standard: {
    s: 12, // 補足テキスト用
    m: 16, // 本文・リスト用
    l: 18, // 見出し用
    xl: 24, // 大見出し・強調用
  },
  large: { s: 14, m: 18, l: 22, xl: 28, },
  extra: { s: 16, m: 22, l: 26, xl: 34,
  }
};

// 型定義（TypeScriptの恩恵を受けるため）
export type ThemeType = keyof typeof COLORS;
export type FontSizeType = keyof typeof FONT_SIZES;