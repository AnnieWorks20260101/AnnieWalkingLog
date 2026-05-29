/** お散歩記録のペット表示名（新旧データ形式に対応） */
export function getWalkPetNamesLabel(walk) {
  if (Array.isArray(walk?.petNames) && walk.petNames.length > 0) {
    return walk.petNames.join('、');
  }
  if (walk?.petName) {
    return walk.petName;
  }
  return '';
}

/** お散歩記録に紐づくペット ID 一覧 */
export function getWalkPetIds(walk) {
  if (Array.isArray(walk?.petIds) && walk.petIds.length > 0) {
    return walk.petIds;
  }
  if (walk?.petId) {
    return [walk.petId];
  }
  return [];
}

/** 指定ペットがそのお散歩に含まれるか（旧形式の petName も名前で照合） */
export function walkIncludesPet(walk, petId, petNameById = {}) {
  const ids = getWalkPetIds(walk);
  if (ids.includes(petId)) {
    return true;
  }

  const petName = petNameById[petId];
  if (!petName || !walk?.petName) {
    return false;
  }

  return walk.petName
    .split('、')
    .map((s) => s.trim())
    .includes(petName);
}

export function filterWalksByPet(walks, filterPetId, pets = []) {
  if (!filterPetId || filterPetId === 'all') {
    return walks;
  }

  const petNameById = Object.fromEntries(pets.map((p) => [p.id, p.name]));
  return walks.filter((walk) => walkIncludesPet(walk, filterPetId, petNameById));
}
