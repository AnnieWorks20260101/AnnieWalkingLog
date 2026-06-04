/**
 * プランに応じたペット利用（並び順の上位 N 匹のみ利用可）
 */

/**
 * @param {string} petId
 * @param {Array<{ id: string }>} orderedPets
 */
export function getPetSortIndex(petId, orderedPets) {
  return orderedPets.findIndex((p) => p.id === petId);
}

/**
 * @param {ReturnType<import('../constants/planEntitlements').getPlanEntitlements>} entitlements
 * @returns {number | null} null = 無制限
 */
export function getMaxUsablePets(entitlements) {
  return entitlements.maxPets ?? null;
}

/**
 * 並び順で上位 maxPets 匹だけ利用可
 * @param {string} petId
 * @param {Array<{ id: string }>} orderedPets
 * @param {ReturnType<import('../constants/planEntitlements').getPlanEntitlements>} entitlements
 */
export function isPetUsableByPlanOrder(petId, orderedPets, entitlements) {
  const max = getMaxUsablePets(entitlements);
  if (max == null) {
    return true;
  }
  const index = getPetSortIndex(petId, orderedPets);
  if (index < 0) {
    return false;
  }
  return index < max;
}

/**
 * 利用可ペットだけの ID 一覧（並び順どおり）
 */
export function getUsablePetIds(orderedPets, entitlements) {
  const max = getMaxUsablePets(entitlements);
  if (max == null) {
    return orderedPets.map((p) => p.id);
  }
  return orderedPets.slice(0, max).map((p) => p.id);
}

/**
 * 並び替え: 利用可スロット内だけ移動可能（グレーアウト枠と入れ替え不可）
 * @param {number} globalIndex pets 全体での並び順インデックス
 * @param {'up' | 'down'} direction
 */
export function canReorderPetAtPlanIndex(globalIndex, direction, entitlements, totalPets) {
  const max = getMaxUsablePets(entitlements);
  if (max == null) {
    if (direction === 'up') {
      return globalIndex > 0;
    }
    return globalIndex >= 0 && globalIndex < totalPets - 1;
  }
  if (globalIndex < 0 || globalIndex >= max) {
    return false;
  }
  if (direction === 'up') {
    return globalIndex > 0;
  }
  return globalIndex < max - 1 && globalIndex < totalPets - 1;
}
