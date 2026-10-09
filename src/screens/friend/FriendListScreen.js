import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyFriends } from '../../hooks/useFamilyFriends';
import { getPetPhotoUrl } from '../../services/petPhotoUpload';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { SCREEN_FRIEND_REGISTRATION, SCREEN_FRIEND_ENCOUNTERS } from '../../navigation/screenNames';
import { usePlanTier } from '../../hooks/usePlanTier';
import { isFriendUsableByPlanOrder } from '../../utils/planFriendUsage';
import {
  FRIEND_GROUP_FILTER_ALL,
  FRIEND_GROUP_FILTER_UNASSIGNED,
  collectFriendGroupNames,
  filterFriendsByGroup,
} from '../../utils/friendGroup';
import {
  FRIEND_SORT_REGISTERED,
  FRIEND_SORT_ENCOUNTER_COUNT,
  FRIEND_SORT_LAST_ENCOUNTER,
  sortFriends,
} from '../../utils/friendSort';
import { readFriendEncounterCount, readFriendLastEncounterDate } from '../../services/friendEncounters';
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import i18n from '../../i18n';

export default function FriendListScreen({ navigation }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { familyId } = useAuth();
  const { entitlements } = usePlanTier();
  const { language } = useDisplayPreferences();
  const { friends, loading } = useFamilyFriends(familyId);
  const [groupFilter, setGroupFilter] = useState(FRIEND_GROUP_FILTER_ALL);
  const [sortKey, setSortKey] = useState(FRIEND_SORT_REGISTERED);

  const formatEncounterDate = (date) => {
    if (!date) {
      return i18n.t('friendList.lastEncounterUnknown');
    }
    const locale = language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : undefined;
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'numeric', day: 'numeric' });
  };

  const groupNames = useMemo(() => collectFriendGroupNames(friends), [friends]);
  const displayedFriends = useMemo(
    () => sortFriends(filterFriendsByGroup(friends, groupFilter), sortKey),
    [friends, groupFilter, sortKey]
  );

  const renderChip = (selected, label, onPress, key) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.filterChip,
        { backgroundColor: currentTheme.chipBackground, borderColor: currentTheme.accentBorder },
        selected && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: currentTheme.textSecondary },
          selected && { color: currentTheme.card, fontWeight: 'bold' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const listHeader = () => (
    <View style={[styles.filterSection, { borderBottomColor: currentTheme.accentBorder }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {renderChip(
          groupFilter === FRIEND_GROUP_FILTER_ALL,
          i18n.t('friendList.filterAll'),
          () => setGroupFilter(FRIEND_GROUP_FILTER_ALL),
          FRIEND_GROUP_FILTER_ALL
        )}
        {groupNames.map((name) =>
          renderChip(groupFilter === name, name, () => setGroupFilter(name), `group-${name}`)
        )}
        {renderChip(
          groupFilter === FRIEND_GROUP_FILTER_UNASSIGNED,
          i18n.t('friendList.filterUnassigned'),
          () => setGroupFilter(FRIEND_GROUP_FILTER_UNASSIGNED),
          FRIEND_GROUP_FILTER_UNASSIGNED
        )}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterScroll, styles.sortScroll]}
      >
        {renderChip(
          sortKey === FRIEND_SORT_REGISTERED,
          i18n.t('friendList.sortRegistered'),
          () => setSortKey(FRIEND_SORT_REGISTERED),
          FRIEND_SORT_REGISTERED
        )}
        {renderChip(
          sortKey === FRIEND_SORT_ENCOUNTER_COUNT,
          i18n.t('friendList.sortEncounterCount'),
          () => setSortKey(FRIEND_SORT_ENCOUNTER_COUNT),
          FRIEND_SORT_ENCOUNTER_COUNT
        )}
        {renderChip(
          sortKey === FRIEND_SORT_LAST_ENCOUNTER,
          i18n.t('friendList.sortLastEncounter'),
          () => setSortKey(FRIEND_SORT_LAST_ENCOUNTER),
          FRIEND_SORT_LAST_ENCOUNTER
        )}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => {
    const photoUrl = getPetPhotoUrl(item);
    const isUsable = isFriendUsableByPlanOrder(item.id, friends, entitlements);
    const encounterCount = readFriendEncounterCount(item.encounterCount);
    const lastEncounterDate = readFriendLastEncounterDate(item.lastEncounterAt);
    const breed = typeof item.breed === 'string' ? item.breed.trim() : '';

    return (
      <View
        style={[
          styles.friendCard,
          {
            backgroundColor: currentTheme.cardTinted,
            borderColor: currentTheme.accentBorder,
            borderLeftColor: isUsable ? currentTheme.primary : currentTheme.border,
          },
          !isUsable && styles.friendCardInactive,
        ]}
      >
        <View style={styles.avatarContainer}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={[styles.avatar, { borderColor: currentTheme.border }]} />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.noImage,
                { backgroundColor: currentTheme.background, borderColor: currentTheme.border },
              ]}
            >
              <Ionicons name="paw" size={26} color={currentTheme.textSecondary} />
            </View>
          )}
        </View>
        <View style={styles.friendInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.friendName, { color: currentTheme.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            {breed ? (
              <Text style={[styles.friendBreed, { color: currentTheme.textSecondary }]} numberOfLines={1}>
                {i18n.t('friendList.breedInParens', { breed })}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.encounterCount, { color: currentTheme.textSecondary }]} numberOfLines={1}>
            {i18n.t('friendList.encounterCount', { count: encounterCount })}
          </Text>
          <Text style={[styles.lastEncounterDate, { color: currentTheme.textSecondary }]} numberOfLines={1}>
            {i18n.t('friendList.lastEncounterDate', { date: formatEncounterDate(lastEncounterDate) })}
          </Text>
          {!isUsable ? (
            <Text style={[styles.planInactiveLabel, { color: currentTheme.textSecondary }]}>
              {i18n.t('friendList.planInactiveFriend')}
            </Text>
          ) : null}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: currentTheme.accentBorder, backgroundColor: currentTheme.background }]}
            onPress={() => navigation.navigate(SCREEN_FRIEND_REGISTRATION, { friendId: item.id })}
            accessibilityLabel={i18n.t('friendList.editButton')}
            activeOpacity={0.75}
          >
            <Ionicons name="create-outline" size={20} color={currentTheme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: currentTheme.accentBorder, backgroundColor: currentTheme.background }]}
            onPress={() =>
              navigation.navigate(SCREEN_FRIEND_ENCOUNTERS, {
                friendId: item.id,
                friendName: item.name,
              })
            }
            accessibilityLabel={i18n.t('friendList.encountersButton')}
            activeOpacity={0.75}
          >
            <Ionicons name="map-outline" size={20} color={currentTheme.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('friendList.title')} showSettings />

      {friends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={60} color={currentTheme.textSecondary} />
          <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
            {i18n.t('friendList.noFriends')}
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={displayedFriends}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <Text style={[styles.emptyFilteredText, { color: currentTheme.textSecondary }]}>
              {i18n.t('friendList.emptyFiltered')}
            </Text>
          }
          contentContainerStyle={{ padding: 10, paddingBottom: 100, flexGrow: 1 }}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: currentTheme.primary }]}
        onPress={() => navigation.navigate(SCREEN_FRIEND_REGISTRATION)}
      >
        <Ionicons name="add" size={32} color={currentTheme.card} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (fs) => ({
  container: { flex: 1 },
  list: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyText: { textAlign: 'center', marginTop: 10, lineHeight: 22 },
  emptyFilteredText: {
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
    lineHeight: 22,
    fontSize: fs.m,
  },
  filterSection: {
    marginBottom: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 4,
  },
  sortScroll: {
    marginTop: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: { fontSize: fs.s },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  friendCardInactive: { opacity: 0.52 },
  avatarContainer: { marginRight: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 1 },
  noImage: { justifyContent: 'center', alignItems: 'center' },
  friendInfo: { flex: 1, minWidth: 0, marginRight: 8 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 0,
  },
  friendName: { fontSize: fs.l, fontWeight: 'bold', flexShrink: 0, maxWidth: '70%' },
  friendBreed: { fontSize: fs.s, fontWeight: 'normal', flexShrink: 1, minWidth: 0 },
  encounterCount: { fontSize: fs.s, marginTop: 2 },
  lastEncounterDate: { fontSize: fs.s, marginTop: 1 },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInactiveLabel: { fontSize: fs.s, fontWeight: '600', marginTop: 2 },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 30,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
