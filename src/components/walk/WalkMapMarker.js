import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Marker } from 'react-native-maps';

const TRACK_VIEW_CHANGES_MS = 1200;

/**
 * 絵文字マーカー。Android は tracksViewChanges が有効な間マーカー画像を作り直し続けるため、
 * 表示直後だけ有効にして、ちらつきと描画抜けを防ぐ。
 *
 * @param {{
 *   coordinate: { latitude: number, longitude: number },
 *   emoji: string,
 *   size?: number,
 *   onPress?: (event: any) => void,
 *   anchor?: { x: number, y: number },
 * }} props
 */
export default function WalkMapMarker({ coordinate, emoji, size = 30, onPress, anchor }) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), TRACK_VIEW_CHANGES_MS);
    return () => clearTimeout(timer);
  }, [emoji, size]);

  return (
    <Marker
      coordinate={coordinate}
      anchor={anchor}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
    >
      <Text style={{ fontSize: size }}>{emoji}</Text>
    </Marker>
  );
}
