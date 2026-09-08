import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { getPetPhotoUrl } from '../../services/petPhotoUpload';
import i18n from '../../i18n';

/** お散歩中・結果画面共通の「お友達を選ぶ」タップ即選択モーダル */
export default function FriendPickerModal({
  visible,
  friends = [],
  onSelect,
  onClose,
  /** @param {string} friendId */
  isFriendUsable = () => true,
  onDisabledFriendPress,
}) {
  const { currentTheme, fontSizes } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);

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
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              style={styles.list}
            />
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
});
