import { Platform } from 'react-native';

function isValidCoordinate(coord) {
  if (!coord || !Number.isFinite(coord.latitude) || !Number.isFinite(coord.longitude)) {
    return false;
  }
  if (coord.latitude === 0 && coord.longitude === 0) {
    return false;
  }
  return Math.abs(coord.latitude) <= 90 && Math.abs(coord.longitude) <= 180;
}

/** ルート・マーカー用の有効な座標だけ残す */
export function filterValidCoordinates(coordinates = []) {
  return coordinates.filter(isValidCoordinate);
}

/** 座標群から表示用 region を算出（initialRegion のフォールバック） */
export function getRegionForCoordinates(coordinates = []) {
  const valid = filterValidCoordinates(coordinates);
  if (valid.length === 0) {
    return null;
  }

  let minLat = valid[0].latitude;
  let maxLat = valid[0].latitude;
  let minLng = valid[0].longitude;
  let maxLng = valid[0].longitude;

  for (const c of valid) {
    minLat = Math.min(minLat, c.latitude);
    maxLat = Math.max(maxLat, c.latitude);
    minLng = Math.min(minLng, c.longitude);
    maxLng = Math.max(maxLng, c.longitude);
  }

  const latSpan = Math.max(maxLat - minLat, 0.0005);
  const lngSpan = Math.max(maxLng - minLng, 0.0005);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latSpan * 1.5, 0.004),
    longitudeDelta: Math.max(lngSpan * 1.5, 0.004),
  };
}

const MAP_EDGE_PADDING = { top: 48, right: 48, bottom: 48, left: 48 };

/**
 * 地図をルート全体が見える縮尺に合わせる（Android では initialRegion が無視されることが多い）
 */
export function fitMapToCoordinates(mapRef, coordinates = []) {
  const valid = filterValidCoordinates(coordinates);
  if (!mapRef?.current || valid.length === 0) {
    return;
  }

  const runFit = () => {
    try {
      mapRef.current.fitToCoordinates(valid, {
        edgePadding: MAP_EDGE_PADDING,
        animated: false,
      });
    } catch (e) {
      console.warn('[map] fitToCoordinates failed', e);
    }
  };

  if (Platform.OS === 'android') {
    setTimeout(runFit, 100);
  } else {
    runFit();
  }
}
