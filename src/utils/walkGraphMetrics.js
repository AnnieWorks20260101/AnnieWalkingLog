import {
  calculateAverageSpeedKmh,
  convertDistanceKm,
  convertSpeedKmh,
  getDistanceUnitLabel,
  getSpeedUnitLabel,
} from './walkFormat';

/** 画面に収まる目安の本数（1スロット幅は GRAPH_COLUMN_WIDTH と揃える） */
export const GRAPH_VISIBLE_SLOTS = 7;
export const GRAPH_COLUMN_WIDTH = 56;
/** 傾向分析・グラフ用に読み込む最大件数 */
export const GRAPH_HISTORY_MAX = 30;
/** 傾向文言を出す最低件数 */
export const GRAPH_TREND_MIN_COUNT = 5;
/** 移動平均の窓（奇数推奨） */
export const GRAPH_TREND_MA_WINDOW = 5;

export const GRAPH_METRICS = ['distance', 'duration', 'speed', 'poop'];

export function toWalkStartDate(startTime) {
  if (!startTime) {
    return null;
  }
  if (typeof startTime.toDate === 'function') {
    return startTime.toDate();
  }
  if (startTime instanceof Date) {
    return startTime;
  }
  return new Date(startTime);
}

/** グラフ用：古い順に並べ替え（読み込み済みの件数まで） */
export function sortWalksChronologically(walks) {
  return [...walks].sort((a, b) => {
    const ta = toWalkStartDate(a.startTime)?.getTime() ?? 0;
    const tb = toWalkStartDate(b.startTime)?.getTime() ?? 0;
    return ta - tb;
  });
}

function movingAverage(values, windowSize) {
  if (values.length === 0) {
    return [];
  }
  const size = Math.min(windowSize, values.length);
  const half = Math.floor(size / 2);
  return values.map((_, index) => {
    const start = Math.max(0, index - half);
    const end = Math.min(values.length, index + half + 1);
    const slice = values.slice(start, end);
    return slice.reduce((sum, v) => sum + v, 0) / slice.length;
  });
}

/**
 * 直近履歴から傾向を判定（移動平均の前半/後半比較）
 * @returns {'increasing'|'decreasing'|'stable'|null} null = 件数不足
 */
export function computeWalkMetricTrend(walks, metric, unitSystem = 'metric') {
  const sorted = sortWalksChronologically(walks);
  if (sorted.length < GRAPH_TREND_MIN_COUNT) {
    return null;
  }

  const values = sorted.map((w) => getWalkGraphMetricValue(w, metric, unitSystem));
  const smoothed = movingAverage(values, GRAPH_TREND_MA_WINDOW);
  const mid = Math.max(1, Math.floor(smoothed.length / 2));
  const early = smoothed.slice(0, mid);
  const late = smoothed.slice(mid);
  const earlyAvg = early.reduce((s, v) => s + v, 0) / early.length;
  const lateAvg = late.reduce((s, v) => s + v, 0) / late.length;
  const diff = lateAvg - earlyAvg;

  if (metric === 'poop') {
    if (Math.abs(diff) < 0.35) {
      return 'stable';
    }
    return diff > 0 ? 'increasing' : 'decreasing';
  }

  const base = Math.max(Math.abs(earlyAvg), 0.05);
  if (Math.abs(diff) / base < 0.1) {
    return 'stable';
  }
  return diff > 0 ? 'increasing' : 'decreasing';
}

export function computeAllPointsAverage(points) {
  if (!points?.length) {
    return 0;
  }
  return points.reduce((sum, p) => sum + p.value, 0) / points.length;
}

export function getWalkGraphTrendMessage(trend, historyCount, i18n) {
  if (!trend) {
    return null;
  }
  const count = historyCount;
  const key = {
    increasing: 'walk.graphTrendIncreasing',
    decreasing: 'walk.graphTrendDecreasing',
    stable: 'walk.graphTrendStable',
  }[trend];
  return key ? i18n.t(key, { count }) : null;
}

/** 表示中スロットの平均（スクロール位置ベース） */
export function computeVisibleAverage(points, scrollX, viewportWidth, columnWidth = GRAPH_COLUMN_WIDTH) {
  if (!points.length || viewportWidth <= 0) {
    return 0;
  }
  const first = Math.max(0, Math.floor(scrollX / columnWidth));
  const visibleSlots = Math.max(1, Math.ceil((viewportWidth - 40) / columnWidth));
  const last = Math.min(points.length, first + visibleSlots);
  const slice = points.slice(first, last);
  if (slice.length === 0) {
    return 0;
  }
  return slice.reduce((sum, p) => sum + p.value, 0) / slice.length;
}

export function getWalkGraphMetricValue(walk, metric, unitSystem = 'metric') {
  switch (metric) {
    case 'distance':
      return convertDistanceKm(walk.distance ?? 0, unitSystem);
    case 'duration':
      return walk.duration ?? 0;
    case 'speed':
      return convertSpeedKmh(calculateAverageSpeedKmh(walk.distance, walk.duration) ?? 0, unitSystem);
    case 'poop':
      return walk.poops?.length ?? 0;
    default:
      return 0;
  }
}

function niceStep(rough) {
  if (rough <= 0) {
    return 1;
  }
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

/** Y軸スケール（目盛り 4 分割） */
export function computeGraphYScale(values, divisions = 4) {
  const maxVal = Math.max(...values, 0);

  if (maxVal === 0) {
    const yMax = divisions;
    const ticks = Array.from({ length: divisions }, (_, i) => i + 1);
    return { yMax, ticks };
  }

  const step = niceStep(maxVal / divisions);
  const yMax = step * divisions;
  const ticks = Array.from({ length: divisions }, (_, i) => step * (i + 1));
  return { yMax, ticks };
}

export function formatWalkGraphXDateLabel(startTime) {
  const date = toWalkStartDate(startTime);
  if (!date || Number.isNaN(date.getTime())) {
    return '—';
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatWalkGraphXTimeLabel(startTime) {
  const date = toWalkStartDate(startTime);
  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatWalkGraphMetricValue(metric, value, i18n, unitSystem = 'metric') {
  if (metric === 'distance') {
    return `${Number(value).toFixed(2)}${getDistanceUnitLabel(unitSystem, i18n)}`;
  }
  if (metric === 'duration') {
    return `${Math.round(value)}${i18n.t('walk.graphUnitMin')}`;
  }
  if (metric === 'speed') {
    return `${Number(value).toFixed(1)}${getSpeedUnitLabel(unitSystem, i18n)}`;
  }
  if (metric === 'poop') {
    return `${Math.round(value)}${i18n.t('walk.graphUnitTimes')}`;
  }
  return String(value);
}

export function getWalkGraphMetricLabel(metric, i18n) {
  const key = {
    distance: 'walk.graphMetricDistance',
    duration: 'walk.graphMetricDuration',
    speed: 'walk.graphMetricSpeed',
    poop: 'walk.graphMetricPoop',
  }[metric];
  return key ? i18n.t(key) : metric;
}
