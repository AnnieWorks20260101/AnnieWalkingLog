import * as Location from 'expo-location';

/** お散歩中の地図マーカー用（うんち・カスタム共通） */
export async function getCurrentWalkMapCoordinate() {
  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}
