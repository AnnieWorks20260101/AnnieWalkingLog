import React from 'react';
import { Text } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import i18n from '../../i18n';
import {
  formatAverageSpeed,
  formatDistanceValue,
  getDistanceUnitLabel,
  getSpeedUnitLabel,
} from '../../utils/walkFormat';

const createStyles = (fs) => ({
  statsLine: {
    flex: 1,
    flexShrink: 1,
    fontSize: fs.m,
    paddingRight: 12,
  },
  poopLine: {
    fontSize: fs.m,
    textAlign: 'right',
  },
});

function getDurationParts(minutes) {
  if (!minutes) {
    return [{ type: 'value', text: '0' }, { type: 'unit', text: i18n.t('common.minute') }];
  }
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  const parts = [];
  if (h > 0) {
    parts.push({ type: 'value', text: String(h) });
    parts.push({ type: 'unit', text: i18n.t('common.hour') });
  }
  parts.push({ type: 'value', text: String(m) });
  parts.push({ type: 'unit', text: i18n.t('common.minute') });
  return parts;
}

function StyledSegment({ type, text, valueStyle, mutedStyle }) {
  return <Text style={type === 'value' ? valueStyle : mutedStyle}>{text}</Text>;
}

export function WalkHistoryStatsText({ walk, valueStyle, mutedStyle, style }) {
  const styles = useThemedStyles(createStyles);
  const { unitSystem } = useDisplayPreferences();
  const distance = formatDistanceValue(walk.distance, unitSystem);
  const speed = formatAverageSpeed(walk.distance, walk.duration, unitSystem) ?? '—';
  const durationParts = getDurationParts(walk.duration);
  const distanceUnit = getDistanceUnitLabel(unitSystem, i18n);
  const speedUnit = getSpeedUnitLabel(unitSystem, i18n);

  return (
    <Text style={[styles.statsLine, style]} numberOfLines={2}>
      <StyledSegment type="value" text={distance} valueStyle={valueStyle} mutedStyle={mutedStyle} />
      <StyledSegment type="unit" text={distanceUnit} valueStyle={valueStyle} mutedStyle={mutedStyle} />
      <StyledSegment type="unit" text=" / " valueStyle={valueStyle} mutedStyle={mutedStyle} />
      {durationParts.map((part, i) => (
        <StyledSegment
          key={`dur-${i}`}
          type={part.type}
          text={part.text}
          valueStyle={valueStyle}
          mutedStyle={mutedStyle}
        />
      ))}
      <StyledSegment type="unit" text=" / " valueStyle={valueStyle} mutedStyle={mutedStyle} />
      <StyledSegment
        type="unit"
        text={`${i18n.t('walk.averageSpeed')}：`}
        valueStyle={valueStyle}
        mutedStyle={mutedStyle}
      />
      <StyledSegment type="value" text={speed} valueStyle={valueStyle} mutedStyle={mutedStyle} />
      <StyledSegment type="unit" text={speedUnit} valueStyle={valueStyle} mutedStyle={mutedStyle} />
    </Text>
  );
}

export function WalkHistoryPoopText({ count, valueStyle, mutedStyle, style }) {
  const styles = useThemedStyles(createStyles);
  const n = count ?? 0;
  return (
    <Text style={[styles.poopLine, style]}>
      <StyledSegment type="unit" text={`${i18n.t('walk.poopCountLabel')} `} valueStyle={valueStyle} mutedStyle={mutedStyle} />
      <StyledSegment type="value" text={String(n)} valueStyle={valueStyle} mutedStyle={mutedStyle} />
      <StyledSegment type="unit" text={i18n.t('walk.graphUnitTimes')} valueStyle={valueStyle} mutedStyle={mutedStyle} />
    </Text>
  );
}
