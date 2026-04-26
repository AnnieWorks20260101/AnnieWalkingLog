// src/utils/locationUtils.js

// 2点間の距離を計算（ハバーシン公式）
export const getDistanceBetween = (p1, p2) => {
  const R = 6371; // 地球の半径 (km)
  const dLat = (p2.latitude - p1.latitude) * Math.PI / 180;
  const dLon = (p2.longitude - p1.longitude) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.latitude * Math.PI / 180) * Math.cos(p2.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km単位
};

// ルート配列全体の総距離を計算
export const calculateTotalDistance = (route) => {
  if (route.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += getDistanceBetween(route[i], route[i+1]);
  }
  return total;
};