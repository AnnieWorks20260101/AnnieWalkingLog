import i18n from '../i18n';

export const GROUP_FILTER_ALL = 'all';
export const GROUP_FILTER_UNASSIGNED = '__unassigned__';

/** ペットに設定されたグループ名（空白のみは未所属） */
export function getPetGroupName(pet) {
  const name = (pet?.group || '').trim();
  return name.length > 0 ? name : null;
}

export function collectPetGroupNames(pets) {
  const names = new Set();
  pets.forEach((pet) => {
    const group = getPetGroupName(pet);
    if (group) {
      names.add(group);
    }
  });
  const sortLocale = i18n.locale === 'en' ? 'en' : 'ja';
  return [...names].sort((a, b) => a.localeCompare(b, sortLocale));
}

export function filterPetsByGroup(pets, filterKey) {
  if (filterKey === GROUP_FILTER_ALL) {
    return pets;
  }
  if (filterKey === GROUP_FILTER_UNASSIGNED) {
    return pets.filter((pet) => !getPetGroupName(pet));
  }
  return pets.filter((pet) => getPetGroupName(pet) === filterKey);
}
