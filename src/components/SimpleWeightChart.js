import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { FONT_SIZES } from '../../constants/theme';

const CHART_HEIGHT = 160;
const PADDING = { top: 28, right: 16, bottom: 32, left: 16 };

export default function SimpleWeightChart({ labels, data, theme, width }) {
  const safeData = useMemo(
    () => data.filter((v) => typeof v === 'number' && !isNaN(v)),
    [data]
  );

  if (safeData.length === 0) return null;

  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const range = max - min || 1;
  const plotWidth = width - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const points = safeData.map((value, index) => {
    const x =
      PADDING.left +
      (safeData.length === 1 ? plotWidth / 2 : (index / (safeData.length - 1)) * plotWidth);
    const y = PADDING.top + plotH(plotHeight, value, min, range);
    return { x, y, value, label: labels[index] };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const gridColor = theme.accentBorder || theme.border;

  return (
    <View style={{ width, height: CHART_HEIGHT }}>
      <Svg width={width} height={CHART_HEIGHT - 24}>
        {[0, 0.5, 1].map((ratio) => {
          const y = PADDING.top + plotHeight * ratio;
          return (
            <Line
              key={ratio}
              x1={PADDING.left}
              y1={y}
              x2={width - PADDING.right}
              y2={y}
              stroke={gridColor}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}
        {safeData.length > 1 && (
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke={theme.primary}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {points.map((p, index) => (
          <Circle
            key={`${p.label}-${index}`}
            cx={p.x}
            cy={p.y}
            r={5}
            fill={theme.primary}
            stroke={theme.card || '#fff'}
            strokeWidth={2}
          />
        ))}
      </Svg>
      <View style={{ flexDirection: 'row', paddingHorizontal: PADDING.left, marginTop: 4 }}>
        {points.map((p, index) => (
          <View key={`label-${index}`} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: FONT_SIZES.standard.s,
                color: theme.primary,
                fontWeight: '600',
                marginBottom: 2,
              }}
            >
              {p.value.toFixed(1)}
            </Text>
            <Text style={{ fontSize: FONT_SIZES.standard.s, color: theme.textSecondary, textAlign: 'center' }}>
              {p.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function plotH(plotHeight, value, min, range) {
  return plotHeight - ((value - min) / range) * plotHeight;
}
