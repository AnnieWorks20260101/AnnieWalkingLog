/**
 * プランに応じたお友達利用（登録順の上位 N 匹のみ選択可。ペットと異なり並び替えはしない）
 */

/**
 * @param {string} friendId
 * @param {Array<{ id: string }>} orderedFriends 登録順（createdAt昇順）
 */
export function getFriendSortIndex(friendId, orderedFriends) {
  return orderedFriends.findIndex((f) => f.id === friendId);
}

/**
 * @param {ReturnType<import('../constants/planEntitlements').getPlanEntitlements>} entitlements
 * @returns {number | null} null = 無制限
 */
export function getMaxUsableFriends(entitlements) {
  return entitlements.maxFriends ?? null;
}

/**
 * 登録順で上位 maxFriends 匹だけ選択可
 * @param {string} friendId
 * @param {Array<{ id: string }>} orderedFriends
 * @param {ReturnType<import('../constants/planEntitlements').getPlanEntitlements>} entitlements
 */
export function isFriendUsableByPlanOrder(friendId, orderedFriends, entitlements) {
  const max = getMaxUsableFriends(entitlements);
  if (max == null) {
    return true;
  }
  const index = getFriendSortIndex(friendId, orderedFriends);
  if (index < 0) {
    return false;
  }
  return index < max;
}
