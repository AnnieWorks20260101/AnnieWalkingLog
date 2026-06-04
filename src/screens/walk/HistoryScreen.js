import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { db } from '../../services/firebase';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { deleteWalkRecord } from '../../services/deleteWalk';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyWalksFromPlan } from '../../hooks/useFamilyWalksFromPlan';
import { usePlanTier } from '../../hooks/usePlanTier';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import PlanTierNotice from '../../components/PlanTierNotice';
import ScreenHeader from '../../components/ScreenHeader';
import PetFilterRow, { PET_FILTER_ALL } from '../../components/PetFilterRow';
import i18n from '../../i18n';
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import { formatTimestampTime } from '../../utils/formatTime';
import { getWalkPetNamesLabel, filterWalksByPet } from '../../utils/walkPets';
import WalkStartWeather, { hasStartWeatherDisplay } from '../../components/WalkStartWeather';
import { WalkHistoryStatsText, WalkHistoryPoopText } from '../../components/walk/WalkHistoryEntryMetrics';
import { blendColors } from '../../utils/enrichTheme';
import { walkHasMemos } from '../../services/walkMemos';
import { walkHasPhotos, getWalkPhotos } from '../../utils/walkPhotos';
import { SCREEN_WALK_DETAIL, SCREEN_WALK_PHOTOS } from '../../navigation/screenNames';
import { serializeWalkForNavigation } from '../../utils/walkNavigationParams';

export default function HistoryScreen({ navigation }) {
  const { currentTheme, fontSizes } = useTheme();
  const styles = useThemedStyles(createStyles);
  const historySurroundBg = blendColors(currentTheme.background, currentTheme.primary, 0.03);
  const { familyId, userId } = useAuth();
  const { timeFormat, language } = useDisplayPreferences();
  const { tier, entitlements } = usePlanTier();
  const { pets, loading: petsLoading } = useFamilyPets(familyId, userId);
  const { walks, loading: walksLoading } = useFamilyWalksFromPlan(familyId);
  const [filterPetId, setFilterPetId] = useState(PET_FILTER_ALL);

  const filteredWalks = useMemo(
    () => filterWalksByPet(walks, filterPetId, pets),
    [walks, filterPetId, pets]
  );

  const loading = walksLoading || petsLoading;

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const locale = language === 'en' ? 'en-US' : 'ja-JP';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  const handleDelete = (walk) => {
    Alert.alert(
      i18n.t('walk.deleteConfirm'),
      i18n.t('walk.deleteConfirmMsg'),
      [
        { text: i18n.t('walk.cancel'), style: 'cancel' },
        {
          text: i18n.t('walk.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWalkRecord({
                id: walk.id,
                familyId: walk.familyId ?? familyId,
              });
            } catch (error) {
              console.error('削除エラー:', error);
              Alert.alert(i18n.t('common.error'), i18n.t('walk.saveError'));
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    const showDateHeader =
      index === 0 || formatDate(item.startTime) !== formatDate(filteredWalks[index - 1].startTime);

    const showWeather = hasStartWeatherDisplay(item.startWeather);
    const hasMemo = walkHasMemos(item);
    const hasPhotos = walkHasPhotos(item);
    const photoCount = getWalkPhotos(item).length;
    const valueColor = { color: currentTheme.text };
    const mutedColor = { color: currentTheme.textSecondary };

    return (
      <View>
        {showDateHeader && (
          <Text
            style={[
              styles.dateHeader,
              { backgroundColor: currentTheme.surface, color: currentTheme.headerText || currentTheme.primary },
            ]}
          >
            {formatDate(item.startTime)}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.card, { backgroundColor: historySurroundBg }]}
          onPress={() =>
            navigation.navigate(SCREEN_WALK_DETAIL, { walk: serializeWalkForNavigation(item) })
          }
        >
          <View style={styles.timelineContainer}>
            <View style={[styles.timelineDot, { backgroundColor: currentTheme.primary }]} />
            <View style={[styles.timelineLine, { backgroundColor: currentTheme.accentBorder }]} />
          </View>

          <View
            style={[
              styles.contentContainer,
              {
                backgroundColor: currentTheme.card,
                borderBottomColor: currentTheme.accentBorder,
              },
            ]}
          >
            <View style={styles.timeRow}>
              <View style={styles.timeWeatherGroup}>
                <Text style={[styles.timeText, { color: currentTheme.text }]}>
                  {formatTimestampTime(item.startTime, timeFormat)}
                </Text>
                {showWeather ? (
                  <WalkStartWeather
                    startWeather={item.startWeather}
                    iconSize={24}
                    style={styles.weatherChip}
                    textStyle={[styles.weatherTemp, { color: currentTheme.textSecondary }]}
                  />
                ) : null}
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                <Text style={{ fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.petNames, { color: currentTheme.text }]}>
              🐾 {getWalkPetNamesLabel(item) || i18n.t('walk.defaultPetName')}
            </Text>
            <View style={styles.detailsStatsRow}>
              <WalkHistoryStatsText
                walk={item}
                valueStyle={valueColor}
                mutedStyle={mutedColor}
              />
              <View style={styles.statsRightColumn}>
                <WalkHistoryPoopText
                  count={item.poops?.length || 0}
                  valueStyle={valueColor}
                  mutedStyle={mutedColor}
                />
              </View>
            </View>
            {hasMemo ? (
              <Text style={[styles.memoBadge, { color: currentTheme.textSecondary }]}>
                {i18n.t('walk.historyHasMemo')}
              </Text>
            ) : null}
            {hasPhotos ? (
              <TouchableOpacity
                style={styles.photosLinkRow}
                onPress={() =>
                  navigation.navigate(SCREEN_WALK_PHOTOS, {
                    walk: serializeWalkForNavigation(item),
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={[styles.photosLinkText, { color: currentTheme.primary, fontSize: fontSizes.m }]}>
                  {i18n.t('walk.historyPhotosLink', { count: photoCount })}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const listHeader = () => (
    <View>
      <PlanTierNotice tier={tier} variant="history" />
      <PetFilterRow
        pets={pets}
        filterPetId={filterPetId}
        onFilterChange={setFilterPetId}
        entitlements={entitlements}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('walk.historyTitle')} />
      <FlatList
        style={styles.list}
        data={filteredWalks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
            {filterPetId === PET_FILTER_ALL ? i18n.t('walk.historyEmpty') : i18n.t('walk.historyEmptyFiltered')}
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const createStyles = (fs) => ({
  container: { flex: 1 },
  list: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 24 },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
    lineHeight: 22,
    fontSize: fs.m,
  },
  dateHeader: {
    fontSize: fs.l,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  card: { flexDirection: 'row', paddingHorizontal: 15 },
  timelineContainer: { width: 20, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 20 },
  timelineLine: { flex: 1, width: 2 },
  contentContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingLeft: 10,
    marginBottom: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeWeatherGroup: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingRight: 8,
  },
  timeText: { fontSize: fs.l, fontWeight: '600' },
  weatherChip: { marginLeft: 8 },
  weatherTemp: { fontSize: fs.s },
  petNames: { fontSize: fs.m, fontWeight: 'bold', marginBottom: 6 },
  detailsStatsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statsRightColumn: {
    flexShrink: 0,
    alignItems: 'flex-end',
    minWidth: 72,
  },
  memoBadge: {
    fontSize: fs.s,
    marginTop: 8,
  },
  photosLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  photosLinkText: { fontWeight: '600' },
  deleteButton: { padding: 10, marginTop: -5, marginRight: -5 },
});
