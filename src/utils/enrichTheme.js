function parseHex(hex) {
  if (!hex || typeof hex !== 'string') return [255, 255, 255];
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return h.split('').map((c) => parseInt(c + c, 16));
  }
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function toHex([r, g, b]) {
  return (
    '#' +
    [r, g, b]
      .map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function blendColors(hex1, hex2, ratio) {
  const a = parseHex(hex1);
  const b = parseHex(hex2);
  return toHex(a.map((v, i) => v * (1 - ratio) + b[i] * ratio));
}

/** テーマ定義に UI 用の派生色を付与する */
export function enrichTheme(theme) {
  const surface = theme.headerBackground || blendColors(theme.background, theme.primary, 0.2);
  return {
    ...theme,
    surface,
    cardTinted: blendColors(theme.card, theme.primary, 0.1),
    primaryMuted: blendColors(theme.background, theme.primary, 0.16),
    selectedFill: blendColors(theme.background, theme.primary, 0.24),
    accentBorder: blendColors(theme.border, theme.primary, 0.45),
    chipBackground: blendColors(theme.inputBackground || theme.card, theme.primary, 0.08),
  };
}
