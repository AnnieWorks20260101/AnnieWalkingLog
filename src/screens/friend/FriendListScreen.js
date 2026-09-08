import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyFriends } from '../../hooks/useFamilyFriends';
import { getPetPhotoUrl } from '../../services/petPhotoUpload';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { SCREEN_FRIEND_REGISTRATION } from '../../navigation/screenNames';
import { usePlanTier } from '../../hooks/usePlanTier';
import { isFriendUsableByPlanOrder } from '../../utils/planFriendUsage';
import i18n from '../../i18n';

export default function FriendListScreen({ navigation }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { familyId } = useAuth();
  const { entitlements } = usePlanTier();
  const { friends, loading } = useFamilyFriends(familyId);

  const renderItem = ({ item }) => {
    const photoUrl = getPetPhotoUrl(item);
    const isUsable = isFriendUsableByPlanOrder(item.id, friends, entitlements);
    return (
      <TouchableOpacity
        style={[
          styles.friendCard,
          {
            backgroundColor: currentTheme.cardTinted,
            borderColor: currentTheme.accentBorder,
            borderLeftColor: isUsable ? currentTheme.primary : currentTheme.border,
          },
          !isUsable && styles.friendCardInactive,
        ]}
        onPress={() => navigation.navigate(SCREEN_FRIEND_REGISTRATION, { friendId: item.id })}
        activeOpacity={0.7}
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
          <Text style={[styles.friendName, { color: currentTheme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {!isUsable ? (
            <Text style={[styles.planInactiveLabel, { color: currentTheme.textSecondary }]}>
              {i18n.t('friendList.planInactiveFriend')}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={22} color={currentTheme.textSecondary} />
      </TouchableOpacity>
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
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
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
  friendInfo: { flex: 1, minWidth: 0 },
  friendName: { fontSize: fs.l, fontWeight: 'bold' },
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
