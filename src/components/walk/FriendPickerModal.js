import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { getPetPhotoUrl } from '../../services/petPhotoUpload';
import {
  FRIEND_GROUP_FILTER_ALL,
  FRIEND_GROUP_FILTER_UNASSIGNED,
  collectFriendGroupNames,
  filterFriendsByGroup,
} from '../../utils/friendGroup';
import i18n from '../../i18n';

/** お散歩中・結果画面共通の「お友達を選ぶ」タップ即選択モーダル */
export default function FriendPickerModal({
  visible,
  friends = [],
  onSelect,
  onClose,
  /** @param {string} friendId — 親側で「フィルタ前の全友達」を使って判定すること */
  isFriendUsable = () => true,
  onDisabledFriendPress,
}) {
  const { currentTheme, fontSizes } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const [groupFilter, setGroupFilter] = useState(FRIEND_GROUP_FILTER_ALL);

  useEffect(() => {
    if (!visible) {
      setGroupFilter(FRIEND_GROUP_FILTER_ALL);
    }
  }, [visible]);

  const groupNames = useMemo(() => collectFriendGroupNames(friends), [friends]);
  const filteredFriends = useMemo(
    () => filterFriendsByGroup(friends, groupFilter),
    [friends, groupFilter]
  );
  const showGroupFilters = friends.length > 0;

  const renderFilterChip = (filterKey, label) => {
    const selected = groupFilter === filterKey;
    return (
      <TouchableOpacity
        key={filterKey}
        style={[
          styles.filterChip,
          { backgroundColor: currentTheme.chipBackground, borderColor: currentTheme.accentBorder },
          selected && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary },
        ]}
        onPress={() => setGroupFilter(filterKey)}
        activeOpacity={0.75}
      >
        <Text
          style={[
            styles.filterChipText,
            { color: currentTheme.textSecondary, fontSize: fontSizes.s },
            selected && { color: currentTheme.card, fontWeight: 'bold' },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const photoUrl = getPetPhotoUrl(item);
    const usable = isFriendUsable(item.id);
    const handlePress = () => {
      if (!usable) {
        onDisabledFriendPress?.(item);
        return;
      }
      onSelect?.(item);
    };
    return (
      <TouchableOpacity
        style={[styles.friendRow, !usable && styles.friendRowDisabled]}
        onPress={handlePress}
        activeOpacity={usable ? 0.7 : 1}
      >
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
            <Ionicons name="paw" size={24} color={currentTheme.textSecondary} />
          </View>
        )}
        <Text style={[styles.friendName, { color: currentTheme.text }]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.sheet,
            { backgroundColor: currentTheme.card, paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: currentTheme.text, fontSize: fontSizes.l }]}>
              {i18n.t('walk.friendPickerTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close-circle" size={26} color={currentTheme.textSecondary} />
            </TouchableOpacity>
          </View>

          {friends.length === 0 ? (
            <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
              {i18n.t('walk.friendPickerEmptyMsg')}
            </Text>
          ) : (
            <>
              {showGroupFilters ? (
                <View style={[styles.filterSection, { borderBottomColor: currentTheme.accentBorder }]}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                  >
                    {renderFilterChip(FRIEND_GROUP_FILTER_ALL, i18n.t('friendList.filterAll'))}
                    {groupNames.map((name) => renderFilterChip(name, name))}
                    {renderFilterChip(
                      FRIEND_GROUP_FILTER_UNASSIGNED,
                      i18n.t('friendList.filterUnassigned')
                    )}
                  </ScrollView>
                </View>
              ) : null}

              <FlatList
                data={filteredFriends}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                style={styles.list}
                ListEmptyComponent={
                  <Text style={[styles.emptyFilteredText, { color: currentTheme.textSecondary }]}>
                    {i18n.t('friendList.emptyFiltered')}
                  </Text>
                }
              />
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const createStyles = (fs) => ({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontWeight: '700' },
  filterSection: {
    marginBottom: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 4,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {},
  list: { flexGrow: 0 },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  friendRowDisabled: { opacity: 0.4 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, marginRight: 12 },
  noImage: { justifyContent: 'center', alignItems: 'center' },
  friendName: { fontSize: fs.m, fontWeight: '600' },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: fs.m,
    lineHeight: 22,
  },
  emptyFilteredText: {
    textAlign: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    fontSize: fs.m,
    lineHeight: 22,
  },
});
