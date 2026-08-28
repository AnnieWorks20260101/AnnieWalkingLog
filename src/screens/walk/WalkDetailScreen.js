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
  BackHandler,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import { useTheme } from '../../contexts/ThemeContext';
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWalkPreferences } from '../../contexts/WalkPreferencesContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import WalkMemoModal from '../../components/walk/WalkMemoModal';
import WalkMarkEditBar from '../../components/walk/WalkMarkEditBar';
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
import { moveWalkMark, persistWalkMapMarks, createPoopMark, createCustomMark, removeWalkMark } from '../../services/walkMapMarks';
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

/** 編集バー分だけ地図の視覚中央を上にずらす */
const MARK_EDIT_MAP_BOTTOM_INSET = 168;

export default function WalkDetailScreen({ route, navigation }) {
  const { currentTheme, fontSizes } = useTheme();
  const { unitSystem, timeFormat, language } = useDisplayPreferences();
  const { familyId, userId } = useAuth();
  const { pets } = useFamilyPets(familyId, userId);
  const { customButtonId, customButtonIcon } = useWalkPreferences();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const walk = useMemo(
    () => parseWalkFromNavigationParams(route.params?.walk),
    [route.params?.walk]
  );
  const walkId = walk.id;
  const fromSaveReview = route.params?.fromSaveReview === true;
  const reviewMilestone = route.params?.reviewMilestone ?? null;
  const walkRoute = walk.route || [];
  const photos = walk.photos || [];
  const mapRef = useRef(null);
  const shareShotRef = useRef(null);

  const [poops, setPoops] = useState(() => (Array.isArray(walk.poops) ? walk.poops : []));
  const [customMarks, setCustomMarks] = useState(() =>
    Array.isArray(walk.customMarks) ? walk.customMarks : []
  );
  const [editingMark, setEditingMark] = useState(null);
  const [editingIsNew, setEditingIsNew] = useState(false);
  const [markSaving, setMarkSaving] = useState(false);
  const addingMarkRef = useRef(false);
  const [memos, setMemos] = useState(() => (Array.isArray(walk.memos) ? walk.memos : []));
  const [isMemoModalVisible, setIsMemoModalVisible] = useState(false);
  const [memoDraft, setMemoDraft] = useState('');
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [memoSaving, setMemoSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    setPoops(Array.isArray(walk.poops) ? walk.poops : []);
    setCustomMarks(Array.isArray(walk.customMarks) ? walk.customMarks : []);
    setEditingMark(null);
    setEditingIsNew(false);
  }, [walk.id]);

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

  const isEditingMark = useCallback(
    (type, index) => editingMark?.type === type && editingMark?.index === index,
    [editingMark]
  );

  const beginMarkEdit = useCallback(
    (type, index) => {
      if (!walkId || markSaving) {
        return;
      }
      if (editingMark) {
        return;
      }
      const source = type === 'poop' ? poops[index] : customMarks[index];
      if (!source) {
        return;
      }
      setEditingMark({ type, index });
      setEditingIsNew(false);
      requestAnimationFrame(() => {
        mapRef.current?.animateCamera?.({
          center: {
            latitude: source.latitude,
            longitude: source.longitude,
          },
        });
      });
    },
    [walkId, markSaving, editingMark, poops, customMarks]
  );

  const cancelMarkEdit = useCallback(() => {
    if (markSaving) {
      return;
    }
    if (editingMark && editingIsNew) {
      if (editingMark.type === 'poop') {
        setPoops((prev) => removeWalkMark(prev, editingMark.index));
      } else {
        setCustomMarks((prev) => removeWalkMark(prev, editingMark.index));
      }
    }
    setEditingMark(null);
    setEditingIsNew(false);
  }, [markSaving, editingMark, editingIsNew]);

  const clearMarkEdit = useCallback(() => {
    setEditingMark(null);
    setEditingIsNew(false);
  }, []);

  const resolveAddCoordinate = useCallback(async () => {
    try {
      const camera = await mapRef.current?.getCamera?.();
      if (camera?.center?.latitude != null && camera?.center?.longitude != null) {
        return {
          latitude: camera.center.latitude,
          longitude: camera.center.longitude,
        };
      }
    } catch (error) {
      console.warn('getCamera failed:', error);
    }
    const lastRoute = walkRoute[walkRoute.length - 1];
    if (lastRoute?.latitude != null && lastRoute?.longitude != null) {
      return {
        latitude: lastRoute.latitude,
        longitude: lastRoute.longitude,
      };
    }
    return {
      latitude: initialRegion.latitude,
      longitude: initialRegion.longitude,
    };
  }, [walkRoute, initialRegion]);

  const handleSaveMarkEdit = useCallback(async () => {
    if (!walkId || !editingMark || markSaving) {
      return;
    }

    setMarkSaving(true);
    try {
      const coordinate = await resolveAddCoordinate();
      const nextPoops =
        editingMark.type === 'poop'
          ? moveWalkMark(poops, editingMark.index, coordinate)
          : poops;
      const nextCustomMarks =
        editingMark.type === 'custom'
          ? moveWalkMark(customMarks, editingMark.index, coordinate)
          : customMarks;
      setPoops(nextPoops);
      setCustomMarks(nextCustomMarks);
      await persistWalkMapMarks(walkId, { poops: nextPoops, customMarks: nextCustomMarks });
      clearMarkEdit();
    } catch (error) {
      console.error('walk mark save error:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('walk.markEditSaveError'));
    } finally {
      setMarkSaving(false);
    }
  }, [
    walkId,
    editingMark,
    markSaving,
    poops,
    customMarks,
    clearMarkEdit,
    resolveAddCoordinate,
  ]);

  const beginAddMark = useCallback(
    async (type) => {
      if (!walkId || markSaving || editingMark || addingMarkRef.current) {
        return;
      }
      addingMarkRef.current = true;
      try {
        const coordinate = await resolveAddCoordinate();
        if (type === 'poop') {
          const next = [...poops, createPoopMark(coordinate)];
          setPoops(next);
          setEditingMark({ type: 'poop', index: next.length - 1 });
        } else {
          const next = [
            ...customMarks,
            createCustomMark(coordinate, {
              icon: customButtonIcon,
              buttonId: customButtonId,
            }),
          ];
          setCustomMarks(next);
          setEditingMark({ type: 'custom', index: next.length - 1 });
        }
        setEditingIsNew(true);
      } catch (error) {
        console.error('beginAddMark failed:', error);
        Alert.alert(i18n.t('common.error'), i18n.t('walk.markEditSaveError'));
      } finally {
        addingMarkRef.current = false;
      }
    },
    [
      walkId,
      markSaving,
      editingMark,
      resolveAddCoordinate,
      poops,
      customMarks,
      customButtonIcon,
      customButtonId,
    ]
  );

  const handleBackPress = useCallback(() => {
    if (editingMark) {
      cancelMarkEdit();
      return;
    }
    closeWalkDetailToHistory(navigation);
  }, [editingMark, cancelMarkEdit, navigation]);

  useEffect(() => {
    if (!editingMark) {
      return undefined;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      cancelMarkEdit();
      return true;
    });
    return () => subscription.remove();
  }, [editingMark, cancelMarkEdit]);

  const editingMarkTitle = useMemo(() => {
    if (!editingMark) {
      return '';
    }
    if (editingMark.type === 'poop') {
      return i18n.t(editingIsNew ? 'walk.markAddTitlePoop' : 'walk.markEditTitlePoop');
    }
    const icon = customMarks[editingMark.index]?.icon || customButtonIcon || '💦';
    return i18n.t(editingIsNew ? 'walk.markAddTitleCustom' : 'walk.markEditTitleCustom', { icon });
  }, [editingMark, editingIsNew, customMarks, customButtonIcon]);

  const editingOverlayIcon = useMemo(() => {
    if (!editingMark) {
      return '';
    }
    if (editingMark.type === 'poop') {
      return '💩';
    }
    return customMarks[editingMark.index]?.icon || customButtonIcon || '💦';
  }, [editingMark, customMarks, customButtonIcon]);

  const renderEditMarker = (type, mark, index, label) => {
    if (isEditingMark(type, index)) {
      return null;
    }
    return (
      <Marker
        key={`${type}-${index}`}
        coordinate={mark}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges
        onPress={(event) => {
          event?.stopPropagation?.();
          beginMarkEdit(type, index);
        }}
      >
        <Text style={{ fontSize: 30 }}>{label}</Text>
      </Marker>
    );
  };

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
        onBackPress={handleBackPress}
        rightAction={
          <TouchableOpacity
            onPress={handleShareResult}
            disabled={isSharing || !!editingMark}
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
                  onPress={() => {
                    if (editingMark) {
                      return;
                    }
                    openEditMemo(memo);
                  }}
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
            onPress={() => {
              if (editingMark) {
                return;
              }
              navigation.navigate(SCREEN_WALK_PHOTOS, { walk: serializeWalkForNavigation(walk) });
            }}
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
            mapPadding={
              editingMark
                ? { top: 0, right: 0, bottom: MARK_EDIT_MAP_BOTTOM_INSET, left: 0 }
                : undefined
            }
          >
            {walkRoute.length > 0 && (
              <Polyline coordinates={walkRoute} strokeColor={currentTheme.primary} strokeWidth={5} />
            )}
            {customMarks.map((mark, index) =>
              renderEditMarker('custom', mark, index, mark.icon || '💦')
            )}
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
            {poops.map((poop, index) => renderEditMarker('poop', poop, index, '💩'))}
          </MapView>
          {editingMark ? (
            <View
              style={[styles.centerPinWrap, { bottom: MARK_EDIT_MAP_BOTTOM_INSET }]}
              pointerEvents="none"
            >
              <View style={[styles.selectedMarkHalo, { borderColor: currentTheme.primary }]}>
                <Text style={{ fontSize: 36 }}>{editingOverlayIcon}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </ViewShot>

      {walkId && !editingMark ? (
        <View style={[styles.detailActionsColumn, { bottom: Math.max(24, insets.bottom + 12) }]}>
          <TouchableOpacity
            style={[
              styles.detailAddButton,
              { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.primary },
            ]}
            onPress={() => beginAddMark('custom')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={i18n.t('walk.markAddCustom', { icon: customButtonIcon })}
          >
            <Text style={styles.detailAddEmoji}>{customButtonIcon}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.detailAddButton,
              { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.primary },
            ]}
            onPress={() => beginAddMark('poop')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={i18n.t('walk.markAddPoop')}
          >
            <Text style={styles.detailAddEmoji}>{i18n.t('walk.poopLabel')}</Text>
          </TouchableOpacity>
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
        </View>
      ) : null}

      {editingMark ? (
        <WalkMarkEditBar
          title={editingMarkTitle}
          onSave={handleSaveMarkEdit}
          onCancel={cancelMarkEdit}
          saving={markSaving}
        />
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
  centerPinWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarkHalo: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 2,
  },
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
  detailActionsColumn: {
    position: 'absolute',
    right: 20,
    gap: 12,
    alignItems: 'flex-end',
  },
  detailAddButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  detailAddEmoji: { fontSize: 28 },
  memoFab: {
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
