import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { parseWalkFromNavigationParams, serializeWalkForNavigation } from '../../utils/walkNavigationParams';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import { useTheme } from '../../contexts/ThemeContext';
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import ScreenHeader from '../../components/ScreenHeader';
import WalkMemoModal from '../../components/walk/WalkMemoModal';
import WalkPetChips from '../../components/walk/WalkPetChips';
import i18n from '../../i18n';
import {
  formatAverageSpeed,
  formatDistanceValue,
  formatDurationMinutes,
  getDistanceUnitLabel,
  getSpeedUnitLabel,
} from '../../utils/walkFormat';
import { formatTimestampTime } from '../../utils/formatTime';
import { toWalkStartDate } from '../../utils/walkGraphMetrics';
import { resolveWalkPetsForDisplay } from '../../utils/walkPets';
import WalkStartWeather, { hasStartWeatherDisplay } from '../../components/WalkStartWeather';
import { fitMapToCoordinates, getRegionForCoordinates } from '../../utils/mapRegion';
import { getWalkPhotoCoordinate, walkHasPhotos, getWalkPhotos } from '../../utils/walkPhotos';
import { SCREEN_WALK_PHOTOS } from '../../navigation/screenNames';
import { closeWalkDetailToHistory } from '../../navigation/walkNavigation';
import { createWalkMemo, persistWalkMemos } from '../../services/walkMemos';
import { shareViewScreenshot } from '../../utils/shareViewScreenshot';
import {
  maybeRequestStoreReview,
  STORE_REVIEW_PROMPT_DELAY_MS,
} from '../../utils/storeReviewPrompt';

const DEFAULT_REGION = {
  latitude: 35.681236,
  longitude: 139.767125,
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

export default function WalkDetailScreen({ route, navigation }) {
  const { currentTheme, fontSizes } = useTheme();
  const { unitSystem, timeFormat, language } = useDisplayPreferences();
  const { familyId, userId } = useAuth();
  const { pets } = useFamilyPets(familyId, userId);
  const styles = useThemedStyles(createStyles);
  const walk = useMemo(
    () => parseWalkFromNavigationParams(route.params?.walk),
    [route.params?.walk]
  );
  const walkId = walk.id;
  const fromSaveReview = route.params?.fromSaveReview === true;
  const reviewMilestone = route.params?.reviewMilestone ?? null;
  const walkRoute = walk.route || [];
  const poops = walk.poops || [];
  const customMarks = walk.customMarks || [];
  const photos = walk.photos || [];
  const mapRef = useRef(null);
  const shareShotRef = useRef(null);

  const [memos, setMemos] = useState(() => (Array.isArray(walk.memos) ? walk.memos : []));
  const [isMemoModalVisible, setIsMemoModalVisible] = useState(false);
  const [memoDraft, setMemoDraft] = useState('');
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [memoSaving, setMemoSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const photoCoordinates = useMemo(
    () =>
      photos.map(getWalkPhotoCoordinate).filter((coord) => coord != null),
    [photos]
  );

  const mapCoordinates = useMemo(
    () => [...walkRoute, ...poops, ...customMarks, ...photoCoordinates],
    [walkRoute, poops, customMarks, photoCoordinates]
  );

  const initialRegion = useMemo(
    () => getRegionForCoordinates(mapCoordinates) ?? DEFAULT_REGION,
    [mapCoordinates]
  );

  const handleMapReady = useCallback(() => {
    fitMapToCoordinates(mapRef, mapCoordinates);
  }, [mapCoordinates]);

  const endTimeLabel = useMemo(() => {
    const endDate = toWalkStartDate(walk.endTime) || toWalkStartDate(walk.startTime);
    if (!endDate || Number.isNaN(endDate.getTime())) {
      return '';
    }
    const locale = language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : undefined;
    const datePart = endDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    const timePart = formatTimestampTime(endDate, timeFormat);
    return `${datePart} ${timePart}`.trim();
  }, [walk.endTime, walk.startTime, timeFormat, language]);

  const walkPets = useMemo(() => resolveWalkPetsForDisplay(walk, pets), [walk, pets]);

  const distanceStr = `${formatDistanceValue(walk.distance, unitSystem)}${getDistanceUnitLabel(unitSystem, i18n)}`;
  const durationStr = formatDurationMinutes(walk.duration, i18n);
  const poopCountStr = i18n.t('walk.poopCountShort', { count: poops.length });
  const speedStr = formatAverageSpeed(walk.distance, walk.duration, unitSystem);
  const speedUnit = getSpeedUnitLabel(unitSystem, i18n);
  const speedDisplay =
    speedStr != null
      ? i18n.t('walk.speedValue', { speed: speedStr, speedUnit })
      : i18n.t('walk.speedValue', { speed: '—', speedUnit });
  const showWeather = hasStartWeatherDisplay(walk.startWeather);
  const hasPhotos = walkHasPhotos(walk);
  const photoCount = getWalkPhotos(walk).length;

  useEffect(() => {
    if (!fromSaveReview || reviewMilestone == null) {
      return undefined;
    }

    const timer = setTimeout(() => {
      maybeRequestStoreReview({ milestone: reviewMilestone }).catch((error) => {
        console.warn('maybeRequestStoreReview failed:', error);
      });
    }, STORE_REVIEW_PROMPT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [fromSaveReview, reviewMilestone]);

  const openNewMemo = () => {
    if (!walkId) {
      Alert.alert(i18n.t('common.error'), i18n.t('walk.memoSaveError'));
      return;
    }
    setEditingMemoId(null);
    setMemoDraft('');
    setIsMemoModalVisible(true);
  };

  const openEditMemo = (memo) => {
    if (!walkId) {
      return;
    }
    setEditingMemoId(memo.id);
    setMemoDraft(memo.text);
    setIsMemoModalVisible(true);
  };

  const closeMemoModal = () => {
    if (memoSaving) {
      return;
    }
    setIsMemoModalVisible(false);
    setMemoDraft('');
    setEditingMemoId(null);
  };

  const handleSaveMemo = async () => {
    const trimmed = memoDraft.trim();
    if (!trimmed) {
      Alert.alert(i18n.t('common.error'), i18n.t('walk.memoEmpty'));
      return;
    }
    if (!walkId) {
      Alert.alert(i18n.t('common.error'), i18n.t('walk.memoSaveError'));
      return;
    }

    let nextMemos;
    if (editingMemoId) {
      nextMemos = memos.map((m) =>
        m.id === editingMemoId
          ? { ...m, text: trimmed, updatedAt: new Date().toISOString() }
          : m
      );
    } else {
      nextMemos = [...memos, createWalkMemo(trimmed)];
    }

    setMemoSaving(true);
    try {
      await persistWalkMemos(walkId, nextMemos);
      setMemos(nextMemos);
      closeMemoModal();
    } catch (error) {
      console.error('memo save error:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('walk.memoSaveError'));
    } finally {
      setMemoSaving(false);
    }
  };

  const memoModalTitle = editingMemoId
    ? i18n.t('walk.memoEditTitle', {
        number: memos.findIndex((m) => m.id === editingMemoId) + 1,
      })
    : i18n.t('walk.memoNewTitle');

  const handleShareResult = async () => {
    if (isSharing) {
      return;
    }
    setIsSharing(true);
    try {
      await shareViewScreenshot(shareShotRef);
    } catch (error) {
      console.warn('share walk result failed:', error);
      const message =
        error?.message === 'shareViewScreenshot: sharing unavailable'
          ? i18n.t('walk.shareResultUnavailable')
          : i18n.t('walk.shareResultError');
      Alert.alert(i18n.t('common.error'), message);
    } finally {
      setIsSharing(false);
    }
  };

  const renderStatColumn = (label, value) => (
    <View style={styles.statColumn}>
      <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: currentTheme.primary }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader
        title={i18n.t('walk.detailTitle')}
        showBack
        compact
        onBackPress={() => closeWalkDetailToHistory(navigation)}
        rightAction={
          <TouchableOpacity
            onPress={handleShareResult}
            disabled={isSharing}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={i18n.t('walk.shareResult')}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color={currentTheme.headerText || currentTheme.primary} />
            ) : (
              <Ionicons
                name="share-outline"
                size={24}
                color={currentTheme.headerText || currentTheme.primary}
              />
            )}
          </TouchableOpacity>
        }
      />

      <ViewShot
        ref={shareShotRef}
        style={styles.shareShot}
        options={{ format: 'png', quality: 1, result: 'tmpfile' }}
        collapsable={false}
      >
        <View
          style={[
            styles.statsContainer,
            { backgroundColor: currentTheme.primaryMuted, borderBottomColor: currentTheme.accentBorder },
          ]}
        >
          <View style={styles.headerMetaRow}>
            {endTimeLabel ? (
              <Text
                style={[
                  styles.headerEndTime,
                  { color: currentTheme.text, fontSize: fontSizes.l },
                ]}
                numberOfLines={1}
              >
                {endTimeLabel}
              </Text>
            ) : null}
            <WalkPetChips pets={walkPets} layout="row" style={styles.headerPetsScroll} />
          </View>

          <View style={[styles.statsRow, { borderTopColor: currentTheme.accentBorder }]}>
            {renderStatColumn(i18n.t('walk.distance'), distanceStr)}
            {renderStatColumn(i18n.t('walk.time'), durationStr)}
            {renderStatColumn(i18n.t('walk.poopLabel'), poopCountStr)}
          </View>

          <View style={[styles.speedWeatherRow, { borderTopColor: currentTheme.accentBorder }]}>
            <View style={styles.speedBlock}>
              <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>
                {i18n.t('walk.averageSpeed')}
              </Text>
              <Text style={[styles.speedValue, { color: currentTheme.primary }]}>{speedDisplay}</Text>
            </View>
            {showWeather ? (
              <View style={styles.weatherBlock}>
                <WalkStartWeather
                  startWeather={walk.startWeather}
                  iconSize={40}
                  textStyle={[styles.weatherValue, { color: currentTheme.primary }]}
                />
              </View>
            ) : null}
          </View>
        </View>

        {memos.length > 0 ? (
          <View
            style={[
              styles.memoBar,
              {
                borderBottomColor: currentTheme.accentBorder,
                backgroundColor: currentTheme.background,
              },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.memoBarContent}
            >
              {memos.map((memo, index) => (
                <TouchableOpacity
                  key={memo.id}
                  style={[
                    styles.memoChip,
                    { backgroundColor: currentTheme.card, borderColor: currentTheme.primary },
                  ]}
                  onPress={() => openEditMemo(memo)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.memoChipText, { color: currentTheme.primary, fontSize: fontSizes.m }]}>
                    {i18n.t('walk.memoButtonLabel', { number: index + 1 })}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {hasPhotos ? (
          <TouchableOpacity
            style={[
              styles.photosLinkBar,
              {
                borderBottomColor: currentTheme.accentBorder,
                backgroundColor: currentTheme.background,
              },
            ]}
            onPress={() =>
              navigation.navigate(SCREEN_WALK_PHOTOS, { walk: serializeWalkForNavigation(walk) })
            }
            activeOpacity={0.7}
          >
            <Text style={[styles.photosLinkText, { color: currentTheme.primary, fontSize: fontSizes.m }]}>
              {i18n.t('walk.historyPhotosLink', { count: photoCount })}
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={[styles.mapWrapper, { backgroundColor: currentTheme.background }]}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            onMapReady={handleMapReady}
          >
            {walkRoute.length > 0 && (
              <Polyline coordinates={walkRoute} strokeColor={currentTheme.primary} strokeWidth={5} />
            )}
            {customMarks.map((mark, index) => (
              <Marker key={`custom-${index}`} coordinate={mark}>
                <Text style={{ fontSize: 30 }}>{mark.icon || '💦'}</Text>
              </Marker>
            ))}
            {photos.map((photo, index) => {
              const coordinate = getWalkPhotoCoordinate(photo);
              if (!coordinate) {
                return null;
              }
              return (
                <Marker key={`photo-${photo.id ?? index}`} coordinate={coordinate}>
                  <Text style={{ fontSize: 30 }}>📷</Text>
                </Marker>
              );
            })}
            {poops.map((poop, index) => (
              <Marker key={`poop-${index}`} coordinate={poop}>
                <Text style={{ fontSize: 30 }}>💩</Text>
              </Marker>
            ))}
          </MapView>
        </View>
      </ViewShot>

      {walkId ? (
        <TouchableOpacity
          style={[styles.memoFab, { backgroundColor: currentTheme.primary }]}
          onPress={openNewMemo}
          activeOpacity={0.85}
          accessibilityLabel={i18n.t('walk.memoAddFab')}
        >
          <Ionicons name="add" size={22} color={currentTheme.card} style={styles.memoFabIcon} />
          <Text style={[styles.memoFabLabel, { color: currentTheme.card, fontSize: fontSizes.m }]}>
            {i18n.t('walk.memoFabLabel')}
          </Text>
        </TouchableOpacity>
      ) : null}

      <WalkMemoModal
        visible={isMemoModalVisible}
        title={memoModalTitle}
        value={memoDraft}
        onChangeText={setMemoDraft}
        onSave={handleSaveMemo}
        onCancel={closeMemoModal}
        saving={memoSaving}
      />
    </View>
  );
}

const createStyles = (fs) => ({
  container: { flex: 1 },
  shareShot: { flex: 1 },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerEndTime: {
    fontWeight: '700',
    flexShrink: 0,
    maxWidth: '58%',
  },
  headerPetsScroll: {
    flex: 1,
    minWidth: 0,
  },
  mapWrapper: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  statsContainer: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    elevation: 3,
    zIndex: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: fs.s,
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    fontSize: fs.l,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  speedWeatherRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  speedBlock: {
    flex: 1,
    alignItems: 'center',
  },
  speedValue: {
    fontSize: fs.xl,
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'center',
  },
  weatherBlock: {
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: 12,
  },
  weatherValue: {
    fontSize: fs.l,
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'right',
  },
  memoBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  memoBarContent: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memoChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  memoChipText: { fontWeight: '600' },
  photosLinkBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  photosLinkText: { fontWeight: '600' },
  memoFab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 18,
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  memoFabIcon: { marginRight: 4 },
  memoFabLabel: { fontWeight: '700' },
});
