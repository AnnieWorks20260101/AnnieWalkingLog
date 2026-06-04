import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useThemedStyles } from '../hooks/useThemedStyles';
import WalkStartWeather, { hasStartWeatherDisplay } from './WalkStartWeather';
import {
  computeGraphYScale,
  formatWalkGraphMetricValue,
  computeVisibleAverage,
  GRAPH_COLUMN_WIDTH,
} from '../utils/walkGraphMetrics';

const PLOT_PADDING_LEFT = 40;
const PLOT_PADDING_RIGHT = 12;
const PLOT_PADDING_TOP = 8;
const PLOT_PADDING_BOTTOM = 8;
const WEATHER_BLOCK_HEIGHT = 40;
const X_LABEL_BLOCK_HEIGHT = 40;
const CHART_PLOT_HEIGHT = 160;
const GRID_DIVISIONS = 4;
/** 左スクロール以外の X 軸目盛り数 */
const FIT_X_TICK_COUNT = 5;

function buildLinePath(plotPoints) {
  if (plotPoints.length === 0) {
    return '';
  }
  return plotPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

function getScrollSlotCenterX(index, plotLeft) {
  return plotLeft + index * GRAPH_COLUMN_WIDTH + GRAPH_COLUMN_WIDTH / 2;
}

function getFitSlotCenterX(index, count, plotLeft, plotInnerWidth) {
  if (count <= 1) {
    return plotLeft + plotInnerWidth / 2;
  }
  return plotLeft + (index / (count - 1)) * plotInnerWidth;
}

function valueToY(value, yMax, baselineY, plotHeight) {
  if (yMax <= 0) {
    return baselineY;
  }
  return baselineY - (value / yMax) * plotHeight;
}

function getScrollContentWidth(pointCount) {
  return PLOT_PADDING_LEFT + pointCount * GRAPH_COLUMN_WIDTH + PLOT_PADDING_RIGHT;
}

function getEvenlySpacedIndices(total, tickCount) {
  const indices = new Set();
  if (total <= 0) {
    return indices;
  }
  if (total === 1 || tickCount <= 1) {
    indices.add(0);
    return indices;
  }
  const slots = Math.min(tickCount, total);
  for (let i = 0; i < slots; i += 1) {
    indices.add(Math.round((i / (slots - 1)) * (total - 1)));
  }
  return indices;
}

function shouldShowXLabel(horizontalScroll, index, total) {
  if (horizontalScroll) {
    const scrollLabelMax = 7;
    if (total <= scrollLabelMax) {
      return true;
    }
    const step = Math.ceil(total / scrollLabelMax);
    return index % step === 0 || index === total - 1;
  }
  return getEvenlySpacedIndices(total, FIT_X_TICK_COUNT).has(index);
}

export default function WalkHistoryLineChart({
  points,
  metric,
  color,
  labelColor,
  borderColor,
  averageColor,
  i18n,
  horizontalScroll = true,
  showWeather = true,
  averageValue,
}) {
  const styles = useThemedStyles(createStyles);
  const [scrollViewportWidth, setScrollViewportWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const scrollRef = useRef(null);

  const scrollContentWidth = useMemo(
    () => getScrollContentWidth(points.length),
    [points.length]
  );

  const contentWidth = horizontalScroll
    ? scrollContentWidth
    : Math.max(scrollViewportWidth, PLOT_PADDING_LEFT + PLOT_PADDING_RIGHT + 40);

  const displayAverage = useMemo(() => {
    if (typeof averageValue === 'number') {
      return averageValue;
    }
    if (horizontalScroll) {
      return computeVisibleAverage(points, scrollX, scrollViewportWidth, GRAPH_COLUMN_WIDTH);
    }
    return 0;
  }, [averageValue, horizontalScroll, points, scrollX, scrollViewportWidth]);

  const layout = useMemo(() => {
    if (contentWidth <= 0 || points.length === 0 || scrollViewportWidth <= 0) {
      return null;
    }

    const values = points.map((p) => p.value);
    const { yMax, ticks } = computeGraphYScale(values, GRID_DIVISIONS);

    const plotLeft = PLOT_PADDING_LEFT;
    const plotRight = contentWidth - PLOT_PADDING_RIGHT;
    const plotInnerWidth = Math.max(0, plotRight - plotLeft);
    const plotTop = PLOT_PADDING_TOP;
    const plotBottom = plotTop + CHART_PLOT_HEIGHT;
    const plotHeight = CHART_PLOT_HEIGHT;
    const count = points.length;

    const plotPoints = points.map((point, index) => {
      const x = horizontalScroll
        ? getScrollSlotCenterX(index, plotLeft)
        : getFitSlotCenterX(index, count, plotLeft, plotInnerWidth);
      const y = valueToY(point.value, yMax, plotBottom, plotHeight);
      return {
        ...point,
        x,
        y,
        showLabel: shouldShowXLabel(horizontalScroll, index, count),
        showDot: horizontalScroll || shouldShowXLabel(horizontalScroll, index, count),
      };
    });

    const gridLines = ticks.map((tick) => ({
      tick,
      y: valueToY(tick, yMax, plotBottom, plotHeight),
    }));

    const averageY = valueToY(displayAverage, yMax, plotBottom, plotHeight);

    const slotWidth = horizontalScroll
      ? GRAPH_COLUMN_WIDTH
      : Math.max(24, plotInnerWidth / Math.max(count, 1));

    return {
      svgHeight: plotBottom + PLOT_PADDING_BOTTOM,
      plotLeft,
      plotRight,
      plotTop,
      plotBottom,
      plotHeight,
      yMax,
      ticks,
      averageY,
      gridLines,
      plotPoints,
      linePath: buildLinePath(plotPoints),
      footerTop: plotBottom + PLOT_PADDING_BOTTOM,
      slotWidth,
      plotInnerWidth,
    };
  }, [contentWidth, points, displayAverage, horizontalScroll, scrollViewportWidth]);

  const scrollToLatest = useCallback(() => {
    if (!horizontalScroll) {
      setScrollX(0);
      return;
    }
    const maxScroll = Math.max(0, scrollContentWidth - scrollViewportWidth);
    if (maxScroll > 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: maxScroll, animated: false });
      setScrollX(maxScroll);
    } else {
      setScrollX(0);
    }
  }, [horizontalScroll, scrollContentWidth, scrollViewportWidth]);

  useEffect(() => {
    scrollToLatest();
  }, [scrollToLatest, points.length, metric, horizontalScroll]);

  const onScrollViewportLayout = (e) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0 && width !== scrollViewportWidth) {
      setScrollViewportWidth(width);
    }
  };

  const onScroll = (e) => {
    setScrollX(e.nativeEvent.contentOffset.x);
  };

  if (points.length === 0) {
    return null;
  }

  const weatherHeight = showWeather ? WEATHER_BLOCK_HEIGHT : 0;
  const xLabelHeight = horizontalScroll ? X_LABEL_BLOCK_HEIGHT : 22;
  const totalHeight = layout
    ? layout.footerTop + weatherHeight + xLabelHeight + 8
    : CHART_PLOT_HEIGHT + 100;

  const canScrollLeft =
    horizontalScroll && scrollContentWidth > scrollViewportWidth && scrollViewportWidth > 0;

  const renderChartBody = () => {
    if (!layout) {
      return null;
    }

    const chartContent = (
      <View style={{ width: contentWidth, height: totalHeight }}>
        <View style={[styles.plotArea, { height: layout.svgHeight }]}>
          <Svg width={contentWidth} height={layout.svgHeight}>
            {layout.gridLines.map(({ tick, y }) => (
              <Line
                key={`grid-${tick}`}
                x1={layout.plotLeft}
                y1={y}
                x2={layout.plotRight}
                y2={y}
                stroke={borderColor}
                strokeWidth={1}
                strokeDasharray="4 6"
                opacity={0.55}
              />
            ))}

            <Line
              x1={layout.plotLeft}
              y1={layout.plotBottom}
              x2={layout.plotRight}
              y2={layout.plotBottom}
              stroke={borderColor}
              strokeWidth={1}
            />

            <Line
              x1={layout.plotLeft}
              y1={layout.averageY}
              x2={layout.plotRight}
              y2={layout.averageY}
              stroke={averageColor}
              strokeWidth={2}
              strokeDasharray="6 5"
            />

            {layout.plotPoints.length > 1 ? (
              <Path
                d={layout.linePath}
                stroke={color}
                strokeWidth={horizontalScroll ? 2.5 : 2}
                fill="none"
              />
            ) : null}

            {layout.plotPoints.map((p) =>
              p.showDot ? <Circle key={p.id} cx={p.x} cy={p.y} r={horizontalScroll ? 5 : 4} fill={color} /> : null
            )}
          </Svg>
        </View>

        {layout.plotPoints.map((p, index) => {
          if (!p.showLabel) {
            return null;
          }
          const labelWidth = horizontalScroll
            ? layout.slotWidth
            : Math.min(64, Math.max(44, layout.plotInnerWidth / FIT_X_TICK_COUNT));
          const left = horizontalScroll
            ? PLOT_PADDING_LEFT + index * GRAPH_COLUMN_WIDTH
            : p.x - labelWidth / 2;
          return (
            <View
              key={`col-${p.id}`}
              style={[
                styles.column,
                {
                  left: Math.max(layout.plotLeft, Math.min(left, layout.plotRight - labelWidth)),
                  top: layout.footerTop,
                  width: labelWidth,
                },
              ]}
            >
              {showWeather ? (
                <View style={styles.weatherCell}>
                  {hasStartWeatherDisplay(p.startWeather) ? (
                    <WalkStartWeather
                      startWeather={p.startWeather}
                      iconSize={22}
                      textStyle={[styles.weatherTemp, { color: labelColor }]}
                    />
                  ) : (
                    <Text style={[styles.weatherEmpty, { color: labelColor }]}>—</Text>
                  )}
                </View>
              ) : null}
              <Text
                style={[
                  horizontalScroll ? styles.xLabel : styles.xLabelCompact,
                  { color: labelColor },
                ]}
                numberOfLines={horizontalScroll ? 2 : 1}
              >
                {horizontalScroll && p.xTimeLabel
                  ? `${p.xDateLabel}\n${p.xTimeLabel}`
                  : p.xDateLabel}
              </Text>
            </View>
          );
        })}
      </View>
    );

    if (horizontalScroll) {
      return (
        <ScrollView
          ref={scrollRef}
          horizontal
          style={styles.scrollView}
          contentContainerStyle={{ width: contentWidth }}
          showsHorizontalScrollIndicator={canScrollLeft}
          onScroll={onScroll}
          scrollEventThrottle={16}
          bounces={canScrollLeft}
        >
          {chartContent}
        </ScrollView>
      );
    }

    return chartContent;
  };

  return (
    <View style={[styles.wrapper, { minHeight: totalHeight }]}>
      {layout && scrollViewportWidth > 0 ? (
        <View style={styles.chartRow}>
          <View style={[styles.yAxis, { height: layout.svgHeight }]}>
            {layout.gridLines.map(({ tick, y }, index) => (
              <Text
                key={`tick-label-${tick}`}
                style={[
                  styles.tickLabel,
                  index === layout.gridLines.length - 1 && styles.tickLabelMax,
                  { color: labelColor, top: y - 8 },
                ]}
              >
                {formatWalkGraphMetricValue(metric, tick, i18n)}
              </Text>
            ))}
          </View>

          <View style={styles.scrollViewport} onLayout={onScrollViewportLayout}>
            {renderChartBody()}
          </View>
        </View>
      ) : layout ? (
        <View style={{ height: totalHeight }} onLayout={onScrollViewportLayout} />
      ) : (
        <View style={{ height: CHART_PLOT_HEIGHT + 100 }} onLayout={onScrollViewportLayout} />
      )}
    </View>
  );
}

const createStyles = (fs) => ({
  wrapper: {
    width: '100%',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  yAxis: {
    width: PLOT_PADDING_LEFT,
    position: 'relative',
  },
  scrollViewport: {
    flex: 1,
    minWidth: 0,
  },
  scrollView: {
    flex: 1,
  },
  plotArea: {
    position: 'relative',
    width: '100%',
  },
  tickLabel: {
    position: 'absolute',
    left: 0,
    width: PLOT_PADDING_LEFT - 6,
    fontSize: fs.s,
    textAlign: 'right',
    zIndex: 2,
  },
  tickLabelMax: {
    fontWeight: '700',
    fontSize: fs.s,
  },
  column: {
    position: 'absolute',
    alignItems: 'center',
  },
  weatherCell: {
    height: WEATHER_BLOCK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  weatherTemp: {
    fontSize: fs.s,
  },
  weatherEmpty: {
    fontSize: fs.s,
    marginTop: 4,
  },
  xLabel: {
    fontSize: fs.s,
    textAlign: 'center',
    lineHeight: 16,
    minHeight: X_LABEL_BLOCK_HEIGHT,
  },
  xLabelCompact: {
    fontSize: fs.s,
    textAlign: 'center',
    lineHeight: 14,
  },
});
