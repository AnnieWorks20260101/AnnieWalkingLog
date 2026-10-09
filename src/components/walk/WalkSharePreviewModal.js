import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import ViewShot from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import WalkPetChips from './WalkPetChips';
import WalkStartWeather, { hasStartWeatherDisplay } from '../WalkStartWeather';
import i18n from '../../i18n';
import { applyWalkSharePrivacy } from '../../utils/walkSharePrivacy';
import { resolveFriendMarkForDisplay } from '../../utils/walkFriendMarks';
import { fitMapToCoordinates, getRegionForCoordinates } from '../../utils/mapRegion';
import { getWalkPhotoCoordinate } from '../../utils/walkPhotos';
import { shareViewScreenshot } from '../../utils/shareViewScreenshot';
import {
  formatAverageSpeed,
  formatDistanceValue,
  formatDurationMinutes,
  getDistanceUnitLabel,
  getSpeedUnitLabel,
} from '../../utils/walkFormat';
import { formatTimestampTime } from '../../utils/formatTime';
import { toWalkStartDate } from '../../utils/walkGraphMetrics';

const CARD_WIDTH = Math.min(Dimensions.get('window').width - 32, 360);
const MAP_HEIGHT = 220;
const PHOTO_PREVIEW_HEIGHT = Math.min(Dimensions.get('window').height * 0.42, 360);
const SHARE_TARGET_ROUTE = 'route';

const DEFAULT_REGION = {
  latitude: 35.681236,
  longitude: 139.767125,
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

function isShareablePhoto(photo) {
  return typeof photo?.storageUrl === 'string' && photo.storageUrl.trim().length > 0;
}

export default function WalkSharePreviewModal({
  visible,
  onClose,
  walk,
  walkPets,
  memos = [],
  poops = [],
  customMarks = [],
  friendMarks = [],
  friends = [],
  privacyRadiusMeters,
  unitSystem,
  timeFormat,
  language,
}) {
  const { currentTheme, fontSizes } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const shotRef = useRef(null);
  const photoShotRef = useRef(null);
  const mapRef = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [outerScrollEnabled, setOuterScrollEnabled] = useState(true);
  const [shareTarget, setShareTarget] = useState(SHARE_TARGET_ROUTE);
  const [photoImageReady, setPhotoImageReady] = useState(false);

  const shareWalk = useMemo(
    () => ({
      ...walk,
      poops,
      customMarks,
      friendMarks,
      memos,
    }),
    [walk, poops, customMarks, friendMarks, memos]
  );

  const privacyData = useMemo(
    () => applyWalkSharePrivacy(shareWalk, privacyRadiusMeters),
    [shareWalk, privacyRadiusMeters]
  );

  const shareablePhotos = useMemo(
    () => privacyData.photos.filter(isShareablePhoto),
    [privacyData.photos]
  );

  const showTargetSelector = shareablePhotos.length > 0;
  const selectedPhotoIndex =
    typeof shareTarget === 'string' && shareTarget.startsWith('photo:')
      ? Number(shareTarget.slice('photo:'.length))
      : -1;
  const selectedPhoto =
    selectedPhotoIndex >= 0 && selectedPhotoIndex < shareablePhotos.length
      ? shareablePhotos[selectedPhotoIndex]
      : null;
  const isRouteTarget = shareTarget === SHARE_TARGET_ROUTE;

  useEffect(() => {
    if (!visible) {
      return;
    }
    setShareTarget(SHARE_TARGET_ROUTE);
    setOuterScrollEnabled(true);
    setPhotoImageReady(false);
  }, [visible, walk?.id]);

  useEffect(() => {
    if (!visible || isRouteTarget) {
      return;
    }
    if (!selectedPhoto) {
      setShareTarget(SHARE_TARGET_ROUTE);
      return;
    }
    setPhotoImageReady(false);
  }, [visible, isRouteTarget, selectedPhoto]);

  const photoCoordinates = useMemo(
    () =>
      privacyData.photos
        .map(getWalkPhotoCoordinate)
        .filter((coord) => coord != null),
    [privacyData.photos]
  );

  const mapCoordinates = useMemo(
    () => [
      ...privacyData.route,
      ...privacyData.poops,
      ...privacyData.customMarks,
      ...privacyData.friendMarks,
      ...photoCoordinates,
    ],
    [privacyData, photoCoordinates]
  );

  const initialRegion = useMemo(
    () => getRegionForCoordinates(mapCoordinates) ?? DEFAULT_REGION,
    [mapCoordinates]
  );

  const handleMapReady = useCallback(() => {
    fitMapToCoordinates(mapRef, mapCoordinates);
  }, [mapCoordinates]);

  const handleFitRoute = useCallback(() => {
    fitMapToCoordinates(mapRef, mapCoordinates);
  }, [mapCoordinates]);

  const enableOuterScroll = useCallback(() => {
    setOuterScrollEnabled(true);
  }, []);

  const disableOuterScroll = useCallback(() => {
    setOuterScrollEnabled(false);
  }, []);

  const showMap = isRouteTarget && privacyData.route.length >= 2;

  // Modal 内の MapView は非表示のままだと Android で真っ白になりやすいので、開いたときだけ載せる
  useEffect(() => {
    if (!visible || !showMap) {
      setOuterScrollEnabled(true);
      return undefined;
    }
    const timer = setTimeout(() => {
      fitMapToCoordinates(mapRef, mapCoordinates);
    }, Platform.OS === 'android' ? 350 : 150);
    return () => clearTimeout(timer);
  }, [visible, showMap, mapCoordinates]);

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

  const memoText = useMemo(
    () =>
      memos
        .map((memo) => (memo?.text ?? '').trim())
        .filter(Boolean)
        .join('\n'),
    [memos]
  );

  const handleShare = async () => {
    if (sharing) {
      return;
    }
    if (!isRouteTarget && (!selectedPhoto?.storageUrl || !photoImageReady)) {
      return;
    }
    setSharing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      await shareViewScreenshot(isRouteTarget ? shotRef : photoShotRef);
      onClose();
    } catch (error) {
      console.warn('share walk preview failed:', error);
      const message =
        error?.message === 'shareViewScreenshot: sharing unavailable'
          ? i18n.t('walk.shareResultUnavailable')
          : i18n.t('walk.shareResultError');
      Alert.alert(i18n.t('common.error'), message);
    } finally {
      setSharing(false);
    }
  };

  const shareDisabled =
    sharing || (!isRouteTarget && (!selectedPhoto?.storageUrl || !photoImageReady));

  const renderTargetChip = (key, label, selected, onPress) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.targetChip,
        {
          backgroundColor: selected ? currentTheme.primary : currentTheme.card,
          borderColor: selected ? currentTheme.primary : currentTheme.accentBorder,
        },
      ]}
      onPress={onPress}
      disabled={sharing}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.targetChipText,
          {
            color: selected ? currentTheme.card : currentTheme.text,
            fontSize: fontSizes.s,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: currentTheme.background,
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: currentTheme.text, fontSize: fontSizes.l }]}>
            {i18n.t('walk.sharePreviewTitle')}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={12} disabled={sharing}>
            <Ionicons name="close-circle" size={28} color={currentTheme.textSecondary} />
          </TouchableOpacity>
        </View>

        {showTargetSelector ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.targetBar}
            contentContainerStyle={styles.targetBarContent}
            keyboardShouldPersistTaps="handled"
          >
            {renderTargetChip(
              SHARE_TARGET_ROUTE,
              i18n.t('walk.sharePreviewTargetRoute'),
              isRouteTarget,
              () => setShareTarget(SHARE_TARGET_ROUTE)
            )}
            {shareablePhotos.map((photo, index) =>
              renderTargetChip(
                photo.id ?? `photo-${index}`,
                i18n.t('walk.sharePreviewTargetPhoto', { number: index + 1 }),
                selectedPhotoIndex === index,
                () => setShareTarget(`photo:${index}`)
              )
            )}
          </ScrollView>
        ) : null}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={outerScrollEnabled}
          nestedScrollEnabled
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="handled"
        >
          {isRouteTarget ? (
            <>
              {showMap ? (
                <Text style={[styles.mapHint, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                  {i18n.t('walk.sharePreviewMapHint')}
                </Text>
              ) : null}
              <ViewShot
                ref={shotRef}
                options={{ format: 'png', quality: 1, result: 'tmpfile' }}
                collapsable={false}
                style={[
                  styles.card,
                  {
                    backgroundColor: currentTheme.card,
                    width: CARD_WIDTH,
                    borderColor: currentTheme.border,
                  },
                ]}
              >
                <View style={[styles.cardHeader, { borderBottomColor: currentTheme.accentBorder }]}>
                  {endTimeLabel ? (
                    <Text
                      style={[styles.endTime, { color: currentTheme.text, fontSize: fontSizes.m }]}
                      numberOfLines={1}
                    >
                      {endTimeLabel}
                    </Text>
                  ) : null}
                  <WalkPetChips pets={walkPets} layout="row" style={styles.petChips} />
                </View>

                <View
                  style={[styles.mapBox, { backgroundColor: currentTheme.background, width: CARD_WIDTH }]}
                  collapsable={false}
                  onStartShouldSetResponderCapture={() => {
                    disableOuterScroll();
                    return false;
                  }}
                  onResponderRelease={enableOuterScroll}
                  onResponderTerminate={enableOuterScroll}
                >
                  {visible && showMap ? (
                    <MapView
                      key={`share-map-${walk?.id ?? 'walk'}-${visible ? '1' : '0'}`}
                      ref={mapRef}
                      style={{ width: CARD_WIDTH, height: MAP_HEIGHT }}
                      initialRegion={initialRegion}
                      onMapReady={handleMapReady}
                      scrollEnabled
                      zoomEnabled
                      rotateEnabled={false}
                      pitchEnabled={false}
                      moveOnMarkerPress={false}
                      onTouchStart={disableOuterScroll}
                      onTouchEnd={enableOuterScroll}
                      onTouchCancel={enableOuterScroll}
                      onRegionChangeComplete={enableOuterScroll}
                    >
                      <Polyline
                        coordinates={privacyData.route}
                        strokeColor={currentTheme.primary}
                        strokeWidth={4}
                      />
                      {privacyData.customMarks.map((mark, index) => (
                        <Marker
                          key={`custom-${mark.id ?? index}`}
                          coordinate={mark}
                          anchor={{ x: 0.5, y: 0.5 }}
                          tracksViewChanges={false}
                        >
                          <Text style={styles.markEmoji}>{mark.icon || '💦'}</Text>
                        </Marker>
                      ))}
                      {privacyData.friendMarks.map((mark, index) => {
                        const displayMark = resolveFriendMarkForDisplay(mark, friends);
                        return (
                          <Marker
                            key={`friend-${mark.friendPetId ?? index}`}
                            coordinate={mark}
                            anchor={{ x: 0.5, y: 0.5 }}
                            tracksViewChanges={false}
                          >
                            {displayMark.photoUrl ? (
                              <Image source={{ uri: displayMark.photoUrl }} style={styles.friendMarkerImage} />
                            ) : (
                              <View
                                style={[
                                  styles.friendMarkerFallback,
                                  { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.primary },
                                ]}
                              >
                                <Ionicons name="paw" size={16} color={currentTheme.primary} />
                              </View>
                            )}
                          </Marker>
                        );
                      })}
                      {privacyData.photos.map((photo, index) => {
                        const coordinate = getWalkPhotoCoordinate(photo);
                        if (!coordinate) {
                          return null;
                        }
                        return (
                          <Marker
                            key={`photo-${photo.id ?? index}`}
                            coordinate={coordinate}
                            tracksViewChanges={false}
                          >
                            <Text style={styles.markEmoji}>📷</Text>
                          </Marker>
                        );
                      })}
                      {privacyData.poops.map((poop, index) => (
                        <Marker
                          key={`poop-${poop.id ?? index}`}
                          coordinate={poop}
                          anchor={{ x: 0.5, y: 0.5 }}
                          tracksViewChanges={false}
                        >
                          <Text style={styles.markEmoji}>💩</Text>
                        </Marker>
                      ))}
                    </MapView>
                  ) : (
                    <View style={styles.noRouteBox}>
                      <Text style={[styles.noRouteText, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                        {privacyData.routeFullyHidden
                          ? i18n.t('walk.sharePreviewNoRoute')
                          : i18n.t('walk.sharePreviewNoRouteData')}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={[styles.statsRow, { borderTopColor: currentTheme.accentBorder }]}>
                  <View style={styles.statColumn}>
                    <Text style={[styles.statLabel, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                      {i18n.t('walk.distance')}
                    </Text>
                    <Text style={[styles.statValue, { color: currentTheme.primary, fontSize: fontSizes.m }]}>
                      {distanceStr}
                    </Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={[styles.statLabel, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                      {i18n.t('walk.time')}
                    </Text>
                    <Text style={[styles.statValue, { color: currentTheme.primary, fontSize: fontSizes.m }]}>
                      {durationStr}
                    </Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={[styles.statLabel, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                      {i18n.t('walk.poopLabel')}
                    </Text>
                    <Text style={[styles.statValue, { color: currentTheme.primary, fontSize: fontSizes.m }]}>
                      {poopCountStr}
                    </Text>
                  </View>
                </View>

                <View style={[styles.speedRow, { borderTopColor: currentTheme.accentBorder }]}>
                  <Text style={[styles.statLabel, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                    {i18n.t('walk.averageSpeed')}
                  </Text>
                  <Text style={[styles.speedValue, { color: currentTheme.primary, fontSize: fontSizes.m }]}>
                    {speedDisplay}
                  </Text>
                  {showWeather ? (
                    <WalkStartWeather
                      startWeather={walk.startWeather}
                      iconSize={24}
                      textStyle={[styles.weatherValue, { color: currentTheme.primary, fontSize: fontSizes.s }]}
                    />
                  ) : null}
                </View>

                {memoText ? (
                  <View style={[styles.memoBlock, { borderTopColor: currentTheme.accentBorder }]}>
                    <Text style={[styles.memoText, { color: currentTheme.text, fontSize: fontSizes.s }]}>
                      {memoText}
                    </Text>
                  </View>
                ) : null}

                <Text style={[styles.branding, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                  {i18n.t('walk.sharePreviewBranding')}
                </Text>
              </ViewShot>
              {showMap ? (
                <TouchableOpacity
                  style={[
                    styles.fitButton,
                    {
                      backgroundColor: currentTheme.card,
                      borderColor: currentTheme.accentBorder,
                    },
                  ]}
                  onPress={handleFitRoute}
                  activeOpacity={0.85}
                  accessibilityLabel={i18n.t('walk.sharePreviewFitRoute')}
                >
                  <Ionicons name="expand-outline" size={18} color={currentTheme.primary} />
                  <Text style={[styles.fitButtonText, { color: currentTheme.primary, fontSize: fontSizes.s }]}>
                    {i18n.t('walk.sharePreviewFitRoute')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <>
              <ViewShot
                ref={photoShotRef}
                options={{ format: 'png', quality: 1, result: 'tmpfile' }}
                collapsable={false}
                style={[
                  styles.card,
                  styles.photoCard,
                  {
                    backgroundColor: currentTheme.card,
                    width: CARD_WIDTH,
                    borderColor: currentTheme.border,
                  },
                ]}
              >
                <Image
                  source={{ uri: selectedPhoto.storageUrl }}
                  style={styles.photoPreview}
                  resizeMode="contain"
                  onLoad={() => setPhotoImageReady(true)}
                  onError={() => setPhotoImageReady(false)}
                />
                <Text style={[styles.branding, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                  {i18n.t('walk.sharePreviewBranding')}
                </Text>
              </ViewShot>
              <Text style={[styles.photoHint, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
                {i18n.t('walk.sharePreviewPhotoHint', { number: selectedPhotoIndex + 1 })}
              </Text>
            </>
          )}
        </ScrollView>

        <View
          style={[
            styles.actions,
            {
              borderTopColor: currentTheme.border,
              backgroundColor: currentTheme.card,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                borderColor: currentTheme.border,
                backgroundColor: currentTheme.background,
              },
            ]}
            onPress={onClose}
            disabled={sharing}
          >
            <Text style={[styles.cancelButtonText, { color: currentTheme.text, fontSize: fontSizes.m }]}>
              {i18n.t('common.cancel')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.shareButton,
              {
                backgroundColor: currentTheme.primary,
                opacity: shareDisabled && !sharing ? 0.55 : 1,
              },
            ]}
            onPress={handleShare}
            disabled={shareDisabled}
          >
            {sharing ? (
              <ActivityIndicator size="small" color={currentTheme.card} />
            ) : (
              <Text style={[styles.shareButtonText, { color: currentTheme.card, fontSize: fontSizes.m }]}>
                {i18n.t('walk.shareResult')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = () =>
  StyleSheet.create({
    overlay: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    headerTitle: {
      fontWeight: '700',
      flex: 1,
    },
    targetBar: {
      flexGrow: 0,
      marginBottom: 8,
    },
    targetBarContent: {
      paddingHorizontal: 16,
      gap: 8,
      alignItems: 'center',
    },
    targetChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 18,
      borderWidth: 1,
    },
    targetChipText: {
      fontWeight: '600',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    mapHint: {
      alignSelf: 'stretch',
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 18,
    },
    card: {
      borderRadius: 12,
      borderWidth: 2,
      overflow: 'hidden',
    },
    photoCard: {
      alignItems: 'center',
    },
    photoPreview: {
      width: CARD_WIDTH,
      height: PHOTO_PREVIEW_HEIGHT,
      backgroundColor: '#111',
    },
    photoHint: {
      marginTop: 10,
      paddingHorizontal: 12,
      textAlign: 'center',
      lineHeight: 18,
    },
    cardHeader: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      gap: 6,
    },
    endTime: {
      fontWeight: '700',
    },
    petChips: {
      alignSelf: 'flex-start',
    },
    mapBox: {
      height: MAP_HEIGHT,
      width: CARD_WIDTH,
      overflow: 'hidden',
    },
    fitButton: {
      marginTop: 10,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 18,
      borderWidth: 1,
    },
    fitButtonText: {
      fontWeight: '600',
    },
    noRouteBox: {
      flex: 1,
      height: MAP_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    noRouteText: {
      textAlign: 'center',
    },
    markEmoji: {
      fontSize: 24,
    },
    friendMarkerImage: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#fff' },
    friendMarkerFallback: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    statColumn: {
      flex: 1,
      alignItems: 'center',
    },
    statLabel: {
      marginBottom: 2,
      textAlign: 'center',
    },
    statValue: {
      fontWeight: 'bold',
      textAlign: 'center',
    },
    speedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      gap: 8,
    },
    speedValue: {
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'right',
    },
    weatherValue: {
      fontWeight: '600',
    },
    memoBlock: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    memoText: {
      lineHeight: 20,
    },
    branding: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 12,
      textAlign: 'center',
      fontWeight: '500',
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    cancelButton: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontWeight: '600',
    },
    shareButton: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 46,
    },
    shareButtonText: {
      fontWeight: '700',
    },
  });
