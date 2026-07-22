import { calculateAverageSpeedKmh, convertSpeedKmh } from './walkFormat';
import {
  toWalkStartDate,
  sortWalksChronologically,
  getWalkGraphMetricValue,
  formatWalkGraphXDateLabel,
  formatWalkGraphXTimeLabel,
  formatWalkGraphMetricValue,
} from './walkGraphMetrics';

export const GRAPH_PERIOD = {
  monthly: 'monthly',
  yearly: 'yearly',
  last7: 'last7',
  last28: 'last28',
  last90: 'last90',
  last365: 'last365',
  all: 'all',
};

export const GRAPH_AGGREGATION = {
  none: 'none',
  dailySum: 'dailySum',
  dailyAvg: 'dailyAvg',
};

export const GRAPH_PERIOD_OPTIONS = [
  GRAPH_PERIOD.monthly,
  GRAPH_PERIOD.yearly,
  GRAPH_PERIOD.last7,
  GRAPH_PERIOD.last28,
  GRAPH_PERIOD.last90,
  GRAPH_PERIOD.last365,
  GRAPH_PERIOD.all,
];

export const GRAPH_AGGREGATION_OPTIONS = [
  GRAPH_AGGREGATION.none,
  GRAPH_AGGREGATION.dailySum,
  GRAPH_AGGREGATION.dailyAvg,
];

/** 画面内プロット時の最大点数（折れ線用。統計は元データのまま） */
export const GRAPH_FIT_MAX_POINTS = 32;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isGraphScrollPeriod(period) {
  return period === GRAPH_PERIOD.last7 || period === GRAPH_PERIOD.last28;
}

export function isGraphPeriodNavigable(period) {
  return period === GRAPH_PERIOD.monthly || period === GRAPH_PERIOD.yearly;
}

export function shouldGraphShowWeather(period, aggregation) {
  return isGraphScrollPeriod(period) && aggregation === GRAPH_AGGREGATION.none;
}

export function getGraphPeriodBounds(period, cursorDate) {
  const today = new Date();
  const end = endOfDay(today);

  switch (period) {
    case GRAPH_PERIOD.last7:
      return { start: startOfDay(addDays(today, -6)), end };
    case GRAPH_PERIOD.last28:
      return { start: startOfDay(addDays(today, -27)), end };
    case GRAPH_PERIOD.last90:
      return { start: startOfDay(addDays(today, -89)), end };
    case GRAPH_PERIOD.last365:
      return { start: startOfDay(addDays(today, -364)), end };
    case GRAPH_PERIOD.monthly: {
      const y = cursorDate.getFullYear();
      const m = cursorDate.getMonth();
      return {
        start: startOfDay(new Date(y, m, 1)),
        end: endOfDay(new Date(y, m + 1, 0)),
      };
    }
    case GRAPH_PERIOD.yearly: {
      const y = cursorDate.getFullYear();
      return {
        start: startOfDay(new Date(y, 0, 1)),
        end: endOfDay(new Date(y, 11, 31)),
      };
    }
    case GRAPH_PERIOD.all:
    default:
      return { start: null, end: null };
  }
}

export function filterWalksInPeriod(walks, bounds) {
  if (!bounds?.start && !bounds?.end) {
    return walks;
  }
  return walks.filter((walk) => {
    const date = toWalkStartDate(walk.startTime);
    if (!date || Number.isNaN(date.getTime())) {
      return false;
    }
    if (bounds.start && date < bounds.start) {
      return false;
    }
    if (bounds.end && date > bounds.end) {
      return false;
    }
    return true;
  });
}

export function canAdvanceGraphCursor(period, cursorDate) {
  const now = new Date();
  if (period === GRAPH_PERIOD.monthly) {
    const cy = cursorDate.getFullYear();
    const cm = cursorDate.getMonth();
    return cy < now.getFullYear() || (cy === now.getFullYear() && cm < now.getMonth());
  }
  if (period === GRAPH_PERIOD.yearly) {
    return cursorDate.getFullYear() < now.getFullYear();
  }
  return false;
}

export function shiftGraphCursor(period, cursorDate, delta) {
  const next = new Date(cursorDate);
  if (period === GRAPH_PERIOD.monthly) {
    next.setMonth(next.getMonth() + delta, 1);
    return next;
  }
  if (period === GRAPH_PERIOD.yearly) {
    next.setFullYear(next.getFullYear() + delta, 0, 1);
    return next;
  }
  return next;
}

export function formatGraphCursorLabel(period, cursorDate, i18n) {
  if (period === GRAPH_PERIOD.monthly) {
    return i18n.t('walk.graphCursorMonth', {
      year: cursorDate.getFullYear(),
      month: cursorDate.getMonth() + 1,
    });
  }
  if (period === GRAPH_PERIOD.yearly) {
    return i18n.t('walk.graphCursorYear', { year: cursorDate.getFullYear() });
  }
  return '';
}

export function getGraphPeriodLabel(period, i18n) {
  const key = {
    [GRAPH_PERIOD.monthly]: 'walk.graphPeriodMonthly',
    [GRAPH_PERIOD.yearly]: 'walk.graphPeriodYearly',
    [GRAPH_PERIOD.last7]: 'walk.graphPeriodLast7',
    [GRAPH_PERIOD.last28]: 'walk.graphPeriodLast28',
    [GRAPH_PERIOD.last90]: 'walk.graphPeriodLast90',
    [GRAPH_PERIOD.last365]: 'walk.graphPeriodLast365',
    [GRAPH_PERIOD.all]: 'walk.graphPeriodAll',
  }[period];
  return key ? i18n.t(key) : period;
}

export function getGraphAggregationLabel(aggregation, i18n) {
  const key = {
    [GRAPH_AGGREGATION.none]: 'walk.graphAggNone',
    [GRAPH_AGGREGATION.dailySum]: 'walk.graphAggDailySum',
    [GRAPH_AGGREGATION.dailyAvg]: 'walk.graphAggDailyAvg',
  }[aggregation];
  return key ? i18n.t(key) : aggregation;
}

export function buildGraphChartPoints(walks, metric, aggregation, unitSystem = 'metric') {
  const sorted = sortWalksChronologically(walks);

  if (aggregation === GRAPH_AGGREGATION.none) {
    return sorted.map((walk) => ({
      id: walk.id,
      value: getWalkGraphMetricValue(walk, metric, unitSystem),
      xDateLabel: formatWalkGraphXDateLabel(walk.startTime),
      xTimeLabel: formatWalkGraphXTimeLabel(walk.startTime),
      startWeather: walk.startWeather,
    }));
  }

  const buckets = new Map();
  sorted.forEach((walk) => {
    const date = toWalkStartDate(walk.startTime);
    if (!date || Number.isNaN(date.getTime())) {
      return;
    }
    const key = dayKey(date);
    if (!buckets.has(key)) {
      buckets.set(key, { date, walks: [] });
    }
    buckets.get(key).walks.push(walk);
  });

  return [...buckets.keys()]
    .sort()
    .map((key) => {
      const { date, walks: dayWalks } = buckets.get(key);
      let value;
      if (aggregation === GRAPH_AGGREGATION.dailySum) {
        if (metric === 'speed') {
          const dist = dayWalks.reduce((sum, w) => sum + (w.distance ?? 0), 0);
          const dur = dayWalks.reduce((sum, w) => sum + (w.duration ?? 0), 0);
          value = convertSpeedKmh(calculateAverageSpeedKmh(dist, dur) ?? 0, unitSystem);
        } else {
          value = dayWalks.reduce((sum, w) => sum + getWalkGraphMetricValue(w, metric, unitSystem), 0);
        }
      } else {
        const values = dayWalks.map((w) => getWalkGraphMetricValue(w, metric, unitSystem));
        value = values.reduce((sum, v) => sum + v, 0) / values.length;
      }

      return {
        id: key,
        value,
        xDateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
        xTimeLabel: dayWalks.length > 1 ? `${dayWalks.length}回` : '',
      };
    });
}

/** 画面内表示用に間引き（統計は元データのまま） */
export function downsampleGraphPointsForFit(points) {
  if (points.length <= GRAPH_FIT_MAX_POINTS) {
    return points;
  }
  const result = [];
  const lastIndex = points.length - 1;
  const step = lastIndex / (GRAPH_FIT_MAX_POINTS - 1);
  for (let i = 0; i < GRAPH_FIT_MAX_POINTS; i += 1) {
    result.push(points[Math.round(i * step)]);
  }
  return result;
}

export function computeGraphPlotStats(points, metric, sourceWalks, unitSystem = 'metric') {
  const count = points.length;
  if (count === 0) {
    return { count: 0, avg: 0, sum: 0 };
  }

  const values = points.map((p) => p.value);
  const avg = values.reduce((sum, v) => sum + v, 0) / count;

  let sum;
  if (metric === 'speed') {
    const dist = sourceWalks.reduce((s, w) => s + (w.distance ?? 0), 0);
    const dur = sourceWalks.reduce((s, w) => s + (w.duration ?? 0), 0);
    sum = convertSpeedKmh(calculateAverageSpeedKmh(dist, dur) ?? 0, unitSystem);
  } else {
    sum = values.reduce((s, v) => s + v, 0);
  }

  return { count, avg, sum };
}

const GRAPH_STAT_LABEL_KEYS = {
  count: 'walk.graphStatCount',
  avg: 'walk.graphStatAverage',
  sum: 'walk.graphStatTotal',
};

export function getGraphStatLabel(kind, i18n) {
  const key = GRAPH_STAT_LABEL_KEYS[kind];
  return key ? i18n.t(key) : kind;
}

export function formatGraphStatValue(kind, metric, value, i18n, unitSystem = 'metric') {
  if (kind === 'count') {
    return String(Math.round(value));
  }
  return formatWalkGraphMetricValue(metric, value, i18n, unitSystem);
}
