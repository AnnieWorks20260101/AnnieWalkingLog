import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { PLAN_TIER } from '../constants/planEntitlements';
import { PLAN_COMPARISON_ROW_IDS } from '../constants/planComparisonRows';
import i18n from '../i18n';

const FEATURE_COL_WIDTH = 96;
const TIER_COL_WIDTH = 88;

/**
 * @typedef {'full' | 'freeVsPremium'} PlanComparisonVariant
 * full: ゲスト・無料・プレミアム
 * freeVsPremium: 無料会員・プレミアムのみ（FAQ用）
 */

/**
 * @param {object} props
 * @param {PlanComparisonVariant} [props.variant='full']
 * @param {import('../constants/planEntitlements').PlanTier} [props.highlightTier]
 * @param {string} [props.titleKey='plan.comparison.title']
 */
export default function PlanComparisonTable({
  variant = 'full',
  highlightTier,
  titleKey = 'plan.comparison.title',
}) {
  const { currentTheme, fontSizes } = useTheme();

  const columns = useMemo(() => {
    if (variant === 'freeVsPremium') {
      return [
        { tier: PLAN_TIER.registered, labelKey: 'plan.comparison.colFree' },
        { tier: PLAN_TIER.premium, labelKey: 'plan.comparison.colPremium' },
      ];
    }
    return [
      { tier: PLAN_TIER.guest, labelKey: 'plan.comparison.colGuest' },
      { tier: PLAN_TIER.registered, labelKey: 'plan.comparison.colFree' },
      { tier: PLAN_TIER.premium, labelKey: 'plan.comparison.colPremium' },
    ];
  }, [variant]);

  const tableMinWidth = FEATURE_COL_WIDTH + columns.length * TIER_COL_WIDTH;

  const borderColor = currentTheme.accentBorder;
  const headerBg = currentTheme.chipBackground;
  const premiumHighlight = currentTheme.cardTinted;

  const renderCell = (text, { bold, header, highlight, flexStart, fontSize }) => (
    <View
      style={[
        styles.cell,
        flexStart && styles.cellFeature,
        header && { backgroundColor: headerBg },
        highlight && { backgroundColor: premiumHighlight },
        { borderColor, width: flexStart ? FEATURE_COL_WIDTH : TIER_COL_WIDTH },
      ]}
    >
      <Text
        style={[
          styles.cellText,
          flexStart && styles.cellTextLeft,
          {
            color: header ? currentTheme.text : currentTheme.textSecondary,
            fontSize: fontSize ?? fontSizes.s,
            fontWeight: bold || header ? '700' : '400',
          },
        ]}
        numberOfLines={4}
      >
        {text}
      </Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {titleKey ? (
        <Text style={[styles.title, { color: currentTheme.text, fontSize: fontSizes.m }]}>
          {i18n.t(titleKey)}
        </Text>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.table, { minWidth: tableMinWidth, borderColor }]}>
          <View style={[styles.row, { borderColor }]}>
            {renderCell(i18n.t('plan.comparison.colFeature'), {
              header: true,
              bold: true,
              flexStart: true,
            })}
            {columns.map((col) => (
              <React.Fragment key={col.tier}>
                {renderCell(i18n.t(col.labelKey), {
                  header: true,
                  bold: true,
                  highlight: highlightTier === col.tier,
                })}
              </React.Fragment>
            ))}
          </View>

          {PLAN_COMPARISON_ROW_IDS.map((rowId, rowIndex) => (
            <View
              key={rowId}
              style={[
                styles.row,
                { borderColor },
                rowIndex === PLAN_COMPARISON_ROW_IDS.length - 1 && styles.rowLast,
              ]}
            >
              {renderCell(i18n.t(`plan.comparison.rows.${rowId}.label`), {
                flexStart: true,
                bold: true,
                fontSize: fontSizes.s,
              })}
              {columns.map((col) => (
                <React.Fragment key={col.tier}>
                  {renderCell(i18n.t(`plan.comparison.rows.${rowId}.${col.tier}`), {
                    highlight: highlightTier === col.tier,
                  })}
                </React.Fragment>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      {variant === 'freeVsPremium' || variant === 'full' ? (
        <View style={styles.footnotes}>
          {variant === 'freeVsPremium' ? (
            <Text style={[styles.footnote, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
              {i18n.t('plan.comparison.familyNote')}
            </Text>
          ) : null}
          <Text style={[styles.footnote, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
            {i18n.t('plan.comparison.downgradeNote')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 4 },
  title: { fontWeight: '700', marginBottom: 12, marginLeft: 2 },
  table: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLast: { borderBottomWidth: 0 },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  cellFeature: {
    borderRightWidth: 1,
  },
  cellText: {
    lineHeight: 18,
    textAlign: 'center',
  },
  cellTextLeft: { textAlign: 'left' },
  footnotes: { marginTop: 10, gap: 8 },
  footnote: {
    lineHeight: 20,
    paddingHorizontal: 2,
  },
});
