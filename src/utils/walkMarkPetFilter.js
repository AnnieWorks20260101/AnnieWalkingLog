export const WALK_MARK_PET_FILTER_ALL = 'all';

/**
 * @param {{ petId?: unknown } | null | undefined} mark
 * @param {string} filterPetId
 * @param {{ includeUnassigned?: boolean }} [options]
 *   includeUnassigned: petId を持たない旧データも一致扱いにする（1頭のお散歩で使う）
 */
export function markMatchesPetFilter(mark, filterPetId, options = {}) {
  if (!filterPetId || filterPetId === WALK_MARK_PET_FILTER_ALL) {
    return true;
  }
  const petId = typeof mark?.petId === 'string' ? mark.petId : '';
  if (!petId) {
    return options.includeUnassigned === true;
  }
  return petId === filterPetId;
}

/**
 * 出会った人ピンは「すべて」のときだけ表示
 * @param {string} filterPetId
 */
export function friendMarkMatchesPetFilter(filterPetId) {
  return !filterPetId || filterPetId === WALK_MARK_PET_FILTER_ALL;
}

/**
 * 追加時の petId。フィルター中ならその犬、すべてなら先頭の犬。
 * @param {{ filterPetId: string, walkPets: { id: string }[] }} args
 */
export function resolveMarkPetIdForAdd({ filterPetId, walkPets }) {
  if (filterPetId && filterPetId !== WALK_MARK_PET_FILTER_ALL) {
    return filterPetId;
  }
  return walkPets[0]?.id ?? '';
}
