import i18n from '../i18n';
import { getPetPhotoUrl } from '../services/petPhotoUpload';

function getPetNameListSeparator() {
  return i18n.locale === 'ja' ? '、' : ', ';
}

function splitPetNameLabel(label) {
  return label
    .split(/、|,/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** お散歩記録のペット表示名（新旧データ形式に対応） */
export function getWalkPetNamesLabel(walk) {
  if (Array.isArray(walk?.petNames) && walk.petNames.length > 0) {
    return walk.petNames.join(getPetNameListSeparator());
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

/**
 * 表示用のペット一覧（id / name / photoUrl）
 * 並びは常に現在のペット設定順（引数 pets の順）を優先する。
 * @returns {{ id: string, name: string, photoUrl: string | null }[]}
 */
export function resolveWalkPetsForDisplay(walk, pets = []) {
  const petIds = getWalkPetIds(walk);
  const walkIdSet = new Set(petIds);

  if (petIds.length > 0) {
    const fromMaster = pets
      .filter((pet) => walkIdSet.has(pet.id))
      .map((pet) => ({
        id: pet.id,
        name: pet.name || i18n.t('walk.defaultPetName'),
        photoUrl: getPetPhotoUrl(pet),
      }));

    const knownIds = new Set(fromMaster.map((pet) => pet.id));
    const orphans = petIds
      .filter((id) => !knownIds.has(id))
      .map((id) => {
        const originalIndex = petIds.indexOf(id);
        return {
          id,
          name: walk.petNames?.[originalIndex] || walk.petName || i18n.t('walk.defaultPetName'),
          photoUrl: null,
        };
      });

    return [...fromMaster, ...orphans];
  }

  const names = splitPetNameLabel(getWalkPetNamesLabel(walk));
  if (names.length === 0) {
    return [{ id: 'fallback', name: i18n.t('walk.defaultPetName'), photoUrl: null }];
  }

  const remainingNames = [...names];
  const fromMaster = [];
  pets.forEach((pet) => {
    const index = remainingNames.indexOf(pet.name);
    if (index === -1) {
      return;
    }
    remainingNames.splice(index, 1);
    fromMaster.push({
      id: pet.id,
      name: pet.name,
      photoUrl: getPetPhotoUrl(pet),
    });
  });

  const orphans = remainingNames.map((name, index) => ({
    id: `name-${index}`,
    name,
    photoUrl: null,
  }));

  return fromMaster.length > 0 || orphans.length > 0
    ? [...fromMaster, ...orphans]
    : [{ id: 'fallback', name: i18n.t('walk.defaultPetName'), photoUrl: null }];
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

  return splitPetNameLabel(walk.petName).includes(petName);
}

export function filterWalksByPet(walks, filterPetId, pets = []) {
  if (!filterPetId || filterPetId === 'all') {
    return walks;
  }

  const petNameById = Object.fromEntries(pets.map((p) => [p.id, p.name]));
  return walks.filter((walk) => walkIncludesPet(walk, filterPetId, petNameById));
}
