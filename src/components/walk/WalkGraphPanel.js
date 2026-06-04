import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import WalkHistoryLineChart from '../WalkHistoryLineChart';
import GraphSelectDropdown from '../GraphSelectDropdown';
import i18n from '../../i18n';
import { blendColors } from '../../utils/enrichTheme';
import {
  computeWalkMetricTrend,
  getWalkGraphTrendMessage,
  computeAllPointsAverage,
} from '../../utils/walkGraphMetrics';
import {
  GRAPH_PERIOD,
  GRAPH_AGGREGATION,
  GRAPH_PERIOD_OPTIONS,
  GRAPH_AGGREGATION_OPTIONS,
  getGraphPeriodBounds,
  filterWalksInPeriod,
  buildGraphChartPoints,
  isGraphScrollPeriod,
  isGraphPeriodNavigable,
  shouldGraphShowWeather,
  canAdvanceGraphCursor,
  shiftGraphCursor,
  formatGraphCursorLabel,
  getGraphPeriodLabel,
  getGraphAggregationLabel,
  downsampleGraphPointsForFit,
  computeGraphPlotStats,
  getGraphStatLabel,
  formatGraphStatValue,
} from '../../utils/walkGraphData';

const STAT_CARDS = [
  { kind: 'count', valueKey: 'count' },
  { kind: 'avg', valueKey: 'avg' },
  { kind: 'sum', valueKey: 'sum' },
];

function defaultCursorDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function WalkGraphPanel({
  walks,
  metric,
  loading,
  emptyMessage,
  locked = false,
  sectionTitle,
  defaultPeriod = GRAPH_PERIOD.monthly,
  defaultAggregation = GRAPH_AGGREGATION.none,
  defaultCursor = defaultCursorDate(),
}) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [period, setPeriod] = useState(defaultPeriod);
  const [aggregation, setAggregation] = useState(defaultAggregation);
  const [cursor, setCursor] = useState(defaultCursor);

  const periodBounds = useMemo(
    () => (locked ? null : getGraphPeriodBounds(period, cursor)),
    [locked, period, cursor]
  );

  const periodWalks = useMemo(
    () => (locked || !periodBounds ? [] : filterWalksInPeriod(walks, periodBounds)),
    [locked, walks, periodBounds]
  );

  const chartPointsFull = useMemo(
    () => (locked ? [] : buildGraphChartPoints(periodWalks, metric, aggregation)),
    [locked, periodWalks, metric, aggregation]
  );

  const horizontalScroll = !locked && isGraphScrollPeriod(period);
  const showWeather = !locked && shouldGraphShowWeather(period, aggregation);

  const chartPoints = useMemo(() => {
    if (locked || chartPointsFull.length === 0) {
      return [];
    }
    if (horizontalScroll) {
      return chartPointsFull;
    }
    return downsampleGraphPointsForFit(chartPointsFull);
  }, [locked, chartPointsFull, horizontalScroll]);

  const plotStats = useMemo(
    () =>
      locked ? { count: 0, avg: 0, sum: 0 } : computeGraphPlotStats(chartPointsFull, metric, periodWalks),
    [locked, chartPointsFull, metric, periodWalks]
  );

  const averageValue = useMemo(() => {
    if (locked || horizontalScroll) {
      return undefined;
    }
    return computeAllPointsAverage(chartPointsFull);
  }, [locked, horizontalScroll, chartPointsFull]);

  const trendMessage = useMemo(() => {
    if (locked) {
      return null;
    }
    const trend = computeWalkMetricTrend(periodWalks, metric);
    return getWalkGraphTrendMessage(trend, periodWalks.length, i18n);
  }, [locked, periodWalks, metric]);

  const canGoNext = !locked && canAdvanceGraphCursor(period, cursor);
  const showPeriodNav = isGraphPeriodNavigable(period);

  const handlePrevCursor = () => {
    if (!locked) {
      setCursor((prev) => shiftGraphCursor(period, prev, -1));
    }
  };

  const handleNextCursor = () => {
    if (!locked && canGoNext) {
      setCursor((prev) => shiftGraphCursor(period, prev, 1));
    }
  };

  const renderStatCard = (kind, value) => (
    <View
      key={kind}
      style={[
        styles.statCard,
        {
          backgroundColor: currentTheme.cardTinted,
          borderColor: currentTheme.accentBorder,
          borderLeftColor: currentTheme.primary,
        },
      ]}
    >
      <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>
        {getGraphStatLabel(kind, i18n)}
      </Text>
      <Text style={[styles.statValue, { color: currentTheme.primary }]} numberOfLines={1}>
        {formatGraphStatValue(kind, metric, value, i18n)}
      </Text>
    </View>
  );

  const controlsDisabled = locked;

  return (
    <View style={styles.panel}>
      {sectionTitle ? (
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{sectionTitle}</Text>
          {locked ? (
            <View style={[styles.premiumBadge, { backgroundColor: currentTheme.chipBackground }]}>
              <Ionicons name="lock-closed" size={14} color={currentTheme.textSecondary} />
              <Text style={[styles.premiumBadgeText, { color: currentTheme.textSecondary }]}>
                {i18n.t('walk.graphPremiumBadge')}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.controlsBlock,
          { borderBottomColor: currentTheme.accentBorder },
          controlsDisabled && styles.controlsDisabled,
        ]}
        pointerEvents={controlsDisabled ? 'none' : 'auto'}
      >
        <View style={styles.controlsRow}>
          {showPeriodNav ? (
            <View style={styles.cursorNav}>
              <TouchableOpacity onPress={handlePrevCursor} style={styles.navButton} disabled={controlsDisabled}>
                <Ionicons name="chevron-back" size={22} color={currentTheme.primary} />
              </TouchableOpacity>
              <Text style={[styles.cursorLabel, { color: currentTheme.text }]} numberOfLines={1}>
                {formatGraphCursorLabel(period, cursor, i18n)}
              </Text>
              <TouchableOpacity
                onPress={handleNextCursor}
                style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
                disabled={controlsDisabled || !canGoNext}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={canGoNext ? currentTheme.primary : currentTheme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cursorNavPlaceholder} />
          )}
          <GraphSelectDropdown
            label={getGraphPeriodLabel(period, i18n)}
            options={GRAPH_PERIOD_OPTIONS}
            value={period}
            onChange={setPeriod}
            getOptionLabel={(v) => getGraphPeriodLabel(v, i18n)}
            disabled={controlsDisabled}
          />
        </View>
        <View style={styles.controlsRow}>
          <View style={styles.cursorNavPlaceholder} />
          <GraphSelectDropdown
            label={getGraphAggregationLabel(aggregation, i18n)}
            options={GRAPH_AGGREGATION_OPTIONS}
            value={aggregation}
            onChange={setAggregation}
            getOptionLabel={(v) => getGraphAggregationLabel(v, i18n)}
            disabled={controlsDisabled}
          />
        </View>
      </View>

      <View style={styles.chartBody}>
        {locked ? (
          <View
            style={[
              styles.lockedOverlay,
              { backgroundColor: blendColors(currentTheme.background, currentTheme.text, 0.12) },
            ]}
          >
            <View style={[styles.lockCircle, { backgroundColor: currentTheme.cardTinted }]}>
              <Ionicons name="lock-closed" size={36} color={currentTheme.textSecondary} />
            </View>
            <Text style={[styles.lockedTitle, { color: currentTheme.text }]}>
              {i18n.t('walk.graphPremiumLocked')}
            </Text>
            <Text style={[styles.lockedHint, { color: currentTheme.textSecondary }]}>
              {i18n.t('walk.graphPremiumLockedHint')}
            </Text>
          </View>
        ) : loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={currentTheme.primary} />
          </View>
        ) : chartPointsFull.length === 0 ? (
          <View style={styles.center}>
            <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>{emptyMessage}</Text>
          </View>
        ) : (
          <>
            {horizontalScroll ? (
              <Text style={[styles.scrollHint, { color: currentTheme.textSecondary }]}>
                {i18n.t('walk.graphScrollHint')}
              </Text>
            ) : null}
            <WalkHistoryLineChart
              points={chartPoints}
              metric={metric}
              color={currentTheme.primary}
              labelColor={currentTheme.textSecondary}
              borderColor={currentTheme.accentBorder}
              averageColor={blendColors(currentTheme.primary, currentTheme.text, 0.55)}
              i18n={i18n}
              horizontalScroll={horizontalScroll}
              showWeather={showWeather}
              averageValue={averageValue}
            />
            <View style={styles.statsRow}>
              {STAT_CARDS.map(({ kind, valueKey }) => renderStatCard(kind, plotStats[valueKey]))}
            </View>
            {trendMessage ? (
              <Text style={[styles.trendText, { color: currentTheme.text }]}>{trendMessage}</Text>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const createStyles = (fs) => ({
  panel: {
    paddingBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: fs.m,
    fontWeight: '700',
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: fs.s,
    fontWeight: '600',
  },
  controlsBlock: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  controlsDisabled: {
    opacity: 0.45,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cursorNav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginRight: 4,
  },
  cursorNavPlaceholder: {
    flex: 1,
  },
  navButton: {
    padding: 4,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  cursorLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: fs.m,
    fontWeight: '700',
  },
  chartBody: {
    minHeight: 220,
  },
  lockedOverlay: {
    minHeight: 260,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  lockCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: fs.m,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  lockedHint: {
    fontSize: fs.s,
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollHint: {
    fontSize: fs.s,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 18,
    opacity: 0.85,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: fs.s,
    fontWeight: '600',
    marginBottom: 6,
  },
  statValue: {
    fontSize: fs.l,
    fontWeight: '800',
    textAlign: 'center',
  },
  trendText: {
    fontSize: fs.m,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: fs.m,
    textAlign: 'center',
    lineHeight: 22,
  },
});
