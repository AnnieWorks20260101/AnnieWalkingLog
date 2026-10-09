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
 * 遭遇ピンはペット絞り込みの対象外（どの犬フィルターでも表示）。
 * ※ 1頭お散歩では markPetFilterId が自動でその犬の ID になるため、
 *   「すべて」のときだけ表示にすると遭遇ピンが消えてしまう。
 * @param {string} _filterPetId
 */
export function friendMarkMatchesPetFilter(_filterPetId) {
  return true;
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
