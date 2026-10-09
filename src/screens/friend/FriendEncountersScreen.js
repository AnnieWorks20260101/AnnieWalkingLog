import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import { useFriendEncounterWalks } from '../../hooks/useFriendEncounterWalks';
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import ScreenHeader from '../../components/ScreenHeader';
import WalkPetChips from '../../components/walk/WalkPetChips';
import { WalkHistoryStatsText } from '../../components/walk/WalkHistoryEntryMetrics';
import { formatTimestampTime } from '../../utils/formatTime';
import { resolveWalkPetsForDisplay } from '../../utils/walkPets';
import { openWalkDetail } from '../../navigation/walkNavigation';
import { blendColors } from '../../utils/enrichTheme';
import i18n from '../../i18n';

export default function FriendEncountersScreen({ navigation, route }) {
  const friendId = route.params?.friendId;
  const friendName = typeof route.params?.friendName === 'string' ? route.params.friendName : '';
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const surroundBg = blendColors(currentTheme.background, currentTheme.primary, 0.03);
  const { familyId, userId } = useAuth();
  const { timeFormat, language } = useDisplayPreferences();
  const { pets } = useFamilyPets(familyId, userId);
  const { walks, loading } = useFriendEncounterWalks(familyId, friendId);

  const title = useMemo(() => {
    if (friendName) {
      return i18n.t('friendEncounters.titleNamed', { name: friendName });
    }
    return i18n.t('friendEncounters.title');
  }, [friendName]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const locale = language === 'en' ? 'en-US' : 'ja-JP';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderItem = ({ item }) => {
    const valueColor = { color: currentTheme.text };
    const mutedColor = { color: currentTheme.textSecondary };
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: surroundBg, borderColor: currentTheme.accentBorder }]}
        onPress={() => openWalkDetail(navigation.getParent(), item)}
        activeOpacity={0.75}
      >
        <Text style={[styles.dateText, { color: currentTheme.textSecondary }]}>
          {formatDate(item.startTime)} {formatTimestampTime(item.startTime, timeFormat)}
        </Text>
        <WalkPetChips pets={resolveWalkPetsForDisplay(item, pets)} layout="row" />
        <WalkHistoryStatsText walk={item} valueStyle={valueColor} mutedStyle={mutedColor} />
      </TouchableOpacity>
    );
  };

  if (!friendId) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <ScreenHeader title={title} />
        <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
          {i18n.t('friendEncounters.loadError')}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={title} />
      <FlatList
        data={walks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={[styles.hint, { color: currentTheme.textSecondary }]}>
            {i18n.t('friendEncounters.hint')}
          </Text>
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
            {i18n.t('friendEncounters.empty')}
          </Text>
        }
      />
    </View>
  );
}

const createStyles = (fs) => ({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 12, paddingBottom: 40, flexGrow: 1 },
  hint: { fontSize: fs.s, lineHeight: 20, marginBottom: 12, paddingHorizontal: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, paddingHorizontal: 24, lineHeight: 22, fontSize: fs.m },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  dateText: { fontSize: fs.m, fontWeight: '600' },
});
