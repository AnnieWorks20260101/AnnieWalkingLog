import i18n from '../i18n';

export const FRIEND_GROUP_FILTER_ALL = 'all';
export const FRIEND_GROUP_FILTER_UNASSIGNED = '__unassigned__';

/** お友達に設定されたグループ名（空白のみは未所属） */
export function getFriendGroupName(friend) {
  const name = (friend?.group || '').trim();
  return name.length > 0 ? name : null;
}

export function collectFriendGroupNames(friends) {
  const names = new Set();
  friends.forEach((friend) => {
    const group = getFriendGroupName(friend);
    if (group) {
      names.add(group);
    }
  });
  const sortLocale = i18n.locale === 'en' ? 'en' : 'ja';
  return [...names].sort((a, b) => a.localeCompare(b, sortLocale));
}

export function filterFriendsByGroup(friends, filterKey) {
  if (filterKey === FRIEND_GROUP_FILTER_ALL) {
    return friends;
  }
  if (filterKey === FRIEND_GROUP_FILTER_UNASSIGNED) {
    return friends.filter((friend) => !getFriendGroupName(friend));
  }
  return friends.filter((friend) => getFriendGroupName(friend) === filterKey);
}
