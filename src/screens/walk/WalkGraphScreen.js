import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyWalks } from '../../hooks/useFamilyWalks';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import { usePremium } from '../../hooks/usePremium';
import ScreenHeader from '../../components/ScreenHeader';
import PetFilterRow, { PET_FILTER_ALL } from '../../components/PetFilterRow';
import WalkGraphPanel from '../../components/walk/WalkGraphPanel';
import i18n from '../../i18n';
import { filterWalksByPet } from '../../utils/walkPets';
import { GRAPH_METRICS, getWalkGraphMetricLabel } from '../../utils/walkGraphMetrics';
import { GRAPH_PERIOD } from '../../utils/walkGraphData';

function initialSecondGraphCursor() {
  const now = new Date();
  return new Date(now.getFullYear() - 1, 0, 1);
}

export default function WalkGraphScreen() {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { familyId, userId } = useAuth();
  const { isPremium } = usePremium();
  const { pets, loading: petsLoading } = useFamilyPets(familyId, userId);
  const { walks, loading: walksLoading } = useFamilyWalks(familyId);
  const [metric, setMetric] = useState('distance');
  const [filterPetId, setFilterPetId] = useState(PET_FILTER_ALL);

  const loading = walksLoading || petsLoading;

  const petFilteredWalks = useMemo(
    () => filterWalksByPet(walks, filterPetId, pets),
    [walks, filterPetId, pets]
  );

  const emptyMessage =
    filterPetId === PET_FILTER_ALL
      ? i18n.t('walk.graphEmpty')
      : i18n.t('walk.graphEmptyFiltered');

  const renderMetricTab = (metricKey) => {
    const selected = metric === metricKey;
    return (
      <TouchableOpacity
        key={metricKey}
        style={[
          styles.metricTab,
          {
            backgroundColor: selected ? currentTheme.primary : currentTheme.chipBackground,
            borderColor: currentTheme.accentBorder,
          },
        ]}
        onPress={() => setMetric(metricKey)}
      >
        <Text
          style={[
            styles.metricTabText,
            { color: selected ? currentTheme.card : currentTheme.text },
          ]}
        >
          {getWalkGraphMetricLabel(metricKey, i18n)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('tabs.walkGraph')} />

      <PetFilterRow
        pets={pets}
        filterPetId={filterPetId}
        onFilterChange={setFilterPetId}
        showTitle={false}
      />

      <View style={[styles.metricTabRow, { borderBottomColor: currentTheme.accentBorder }]}>
        {GRAPH_METRICS.map(renderMetricTab)}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <WalkGraphPanel
          walks={petFilteredWalks}
          metric={metric}
          loading={loading}
          emptyMessage={emptyMessage}
        />

        <View style={[styles.divider, { backgroundColor: currentTheme.accentBorder }]} />

        <WalkGraphPanel
          walks={petFilteredWalks}
          metric={metric}
          loading={loading}
          emptyMessage={emptyMessage}
          locked={!isPremium}
          sectionTitle={i18n.t('walk.graphSecondTitle')}
          defaultPeriod={GRAPH_PERIOD.yearly}
          defaultCursor={initialSecondGraphCursor()}
        />
      </ScrollView>
    </View>
  );
}

const createStyles = (fs) => ({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  metricTabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  metricTab: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 72,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricTabText: {
    fontSize: fs.s,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 20,
    opacity: 0.85,
  },
});
