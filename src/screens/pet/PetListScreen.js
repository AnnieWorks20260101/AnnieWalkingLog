import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import { movePetInOrder } from '../../utils/petOrder';
import {
  GROUP_FILTER_ALL,
  GROUP_FILTER_UNASSIGNED,
  collectPetGroupNames,
  filterPetsByGroup,
} from '../../utils/petGroup';
import {
  formatPetElapsedLabel,
  formatPetAgeYearsMonthsLabel,
  formatPetDateDisplay,
  getPetGenderSymbol,
  getPetGenderShortLabel,
} from '../../utils/petDates';
import { getPetPhotoUrl } from '../../services/petPhotoUpload';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { SCREEN_PET_REGISTRATION } from '../../navigation/screenNames';
import i18n from '../../i18n';

export default function PetListScreen({ navigation }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { familyId, userId } = useAuth();
  const { pets, petOrder, loading, savePetOrder } = useFamilyPets(familyId, userId);
  const [groupFilter, setGroupFilter] = useState(GROUP_FILTER_ALL);

  const groupNames = useMemo(() => collectPetGroupNames(pets), [pets]);
  const canReorder = groupFilter === GROUP_FILTER_ALL;
  const filteredPets = useMemo(
    () => filterPetsByGroup(pets, groupFilter),
    [pets, groupFilter]
  );

  const handleMove = async (petId, direction) => {
    if (!canReorder) {
      return;
    }
    const newOrder = movePetInOrder(petOrder, petId, direction);
    if (newOrder === petOrder) {
      return;
    }

    try {
      await savePetOrder(newOrder);
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('petList.reorderError'));
    }
  };

  const renderDateSection = (iconName, labelKey, dateStr, farewellDateStr) => {
    const hasDate = Boolean(dateStr?.trim());
    const elapsed = hasDate ? formatPetElapsedLabel(dateStr, i18n, farewellDateStr) : null;
    const displayDate = hasDate ? formatPetDateDisplay(dateStr) : i18n.t('petList.unspecified');

    return (
      <View style={styles.dateSection}>
        <View style={styles.dateHeaderRow}>
          <View style={styles.dateHeaderLeft}>
            <Ionicons name={iconName} size={15} color={currentTheme.textSecondary} style={styles.dateIcon} />
            <Text style={[styles.dateHeaderLabel, { color: currentTheme.textSecondary }]}>{i18n.t(labelKey)}</Text>
          </View>
          <Text style={[styles.dateColumnHeader, { color: currentTheme.textSecondary }]}>
            {i18n.t('petList.elapsedColumnLabel')}
          </Text>
        </View>
        <View style={styles.dateValueRow}>
          <Text style={[styles.dateValue, { color: currentTheme.text }]} numberOfLines={1}>
            {displayDate}
          </Text>
          {elapsed ? (
            <Text style={[styles.dateElapsed, { color: currentTheme.textSecondary }]}>{elapsed}</Text>
          ) : (
            <View style={styles.dateElapsedPlaceholder} />
          )}
        </View>
      </View>
    );
  };

  const renderFilterChip = (filterKey, label) => {
    const selected = groupFilter === filterKey;
    return (
      <TouchableOpacity
        key={filterKey}
        style={[
          styles.filterChip,
          { backgroundColor: currentTheme.chipBackground, borderColor: currentTheme.accentBorder },
          selected && {
            backgroundColor: currentTheme.selectedFill,
            borderColor: currentTheme.primary,
            borderWidth: 2,
          },
        ]}
        onPress={() => setGroupFilter(filterKey)}
      >
        <Text
          style={[
            styles.filterChipText,
            { color: currentTheme.textSecondary },
            selected && { color: currentTheme.primary, fontWeight: 'bold' },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index }) => {
    const canMoveUp = canReorder && index > 0;
    const canMoveDown = canReorder && index < filteredPets.length - 1;
    const photoUrl = getPetPhotoUrl(item);
    const ageLabel = formatPetAgeYearsMonthsLabel(item.birthday, i18n, item.farewellDate);
    const genderSymbol = getPetGenderSymbol(item.gender);
    const typePart = item.type?.trim() || '';
    const genderShort = getPetGenderShortLabel(item.gender, i18n);
    const breedGenderLine = [typePart, genderShort].filter(Boolean).join('／');

    return (
      <View
        style={[
          styles.petCard,
          {
            backgroundColor: currentTheme.cardTinted,
            borderColor: currentTheme.accentBorder,
            borderLeftColor: currentTheme.primary,
          },
        ]}
      >
        {canReorder ? (
          <View style={styles.reorderColumn}>
            <TouchableOpacity
              onPress={() => handleMove(item.id, 'up')}
              disabled={!canMoveUp}
              style={[styles.reorderButton, !canMoveUp && styles.reorderButtonDisabled]}
            >
              <Ionicons
                name="chevron-up"
                size={22}
                color={canMoveUp ? currentTheme.primary : currentTheme.border}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleMove(item.id, 'down')}
              disabled={!canMoveDown}
              style={[styles.reorderButton, !canMoveDown && styles.reorderButtonDisabled]}
            >
              <Ionicons
                name="chevron-down"
                size={22}
                color={canMoveDown ? currentTheme.primary : currentTheme.border}
              />
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.petMain}
          onPress={() => navigation.navigate(SCREEN_PET_REGISTRATION, { petId: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={[styles.avatar, { borderColor: currentTheme.border }]}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.noImage,
                  { backgroundColor: currentTheme.background, borderColor: currentTheme.border },
                ]}
              >
                <Ionicons name="paw" size={30} color={currentTheme.textSecondary} />
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={[styles.nameRow, { color: currentTheme.text }]} numberOfLines={2}>
              <Text style={styles.petName}>{item.name}</Text>
              {ageLabel ? (
                <Text style={[styles.petAge, { color: currentTheme.textSecondary }]}>（{ageLabel}）</Text>
              ) : null}
              {genderSymbol ? <Text style={styles.genderSymbol}> {genderSymbol}</Text> : null}
            </Text>
            {breedGenderLine ? (
              <Text style={[styles.breedGenderLine, { color: currentTheme.textSecondary }]} numberOfLines={1}>
                {breedGenderLine}
              </Text>
            ) : null}
            {renderDateSection('gift-outline', 'petList.birthdayRowLabel', item.birthday, item.farewellDate)}
            {renderDateSection('home-outline', 'petList.welcomeDateRowLabel', item.welcomeDate, item.farewellDate)}
          </View>
          <Ionicons name="chevron-forward" size={22} color={currentTheme.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  const listHeader = () => (
    <View style={[styles.filterSection, { borderBottomColor: currentTheme.accentBorder }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {renderFilterChip(GROUP_FILTER_ALL, i18n.t('petList.filterAll'))}
        {groupNames.map((name) => renderFilterChip(name, name))}
        {renderFilterChip(GROUP_FILTER_UNASSIGNED, i18n.t('petList.filterUnassigned'))}
      </ScrollView>
      {pets.length > 0 ? (
        <Text style={[styles.sortHint, { color: currentTheme.textSecondary }]}>
          {canReorder ? i18n.t('petList.sortHint') : i18n.t('petList.sortHintDisabled')}
        </Text>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('petList.title')} />

      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="paw" size={60} color={currentTheme.textSecondary} />
          <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
            {i18n.t('petList.noPets')}
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={filteredPets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <Text style={[styles.emptyFilteredText, { color: currentTheme.textSecondary }]}>
              {i18n.t('petList.emptyFiltered')}
            </Text>
          }
          contentContainerStyle={{ padding: 10, paddingBottom: 100, flexGrow: 1 }}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: currentTheme.primary }]}
        onPress={() => navigation.navigate(SCREEN_PET_REGISTRATION)}
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
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 10, lineHeight: 22 },
  emptyFilteredText: {
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
    lineHeight: 22,
    fontSize: fs.m,
  },
  filterSection: {
    marginHorizontal: -10,
    paddingBottom: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: 2,
    paddingTop: 4,
    paddingBottom: 8,
    alignItems: 'center',
  },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    maxWidth: 160,
  },
  filterChipText: {
    fontSize: fs.s,
    fontWeight: '600',
  },
  sortHint: {
    fontSize: fs.s,
    paddingHorizontal: 6,
    paddingBottom: 4,
    lineHeight: 18,
  },
  petCard: {
    flexDirection: 'row',
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'stretch',
    borderWidth: 1,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  reorderColumn: { justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 8 },
  reorderButton: { padding: 4 },
  reorderButtonDisabled: { opacity: 0.35 },
  petMain: { flex: 1, flexDirection: 'row', padding: 12, alignItems: 'center' },
  avatarContainer: { marginRight: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 1 },
  noImage: { justifyContent: 'center', alignItems: 'center' },
  infoContainer: { flex: 1, minWidth: 0 },
  nameRow: { marginBottom: 4, lineHeight: 22 },
  petName: { fontSize: fs.l, fontWeight: 'bold' },
  petAge: { fontSize: fs.m, fontWeight: '600' },
  genderSymbol: { fontSize: fs.l, fontWeight: '700' },
  breedGenderLine: { fontSize: fs.s, marginBottom: 6 },
  dateSection: { marginTop: 4 },
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  dateHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  dateIcon: { marginRight: 4 },
  dateHeaderLabel: { fontSize: fs.s, fontWeight: '600' },
  dateColumnHeader: { fontSize: fs.s, fontWeight: '600', flexShrink: 0, marginLeft: 8 },
  dateValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 19,
    gap: 8,
  },
  dateValue: { fontSize: fs.s, flex: 1, minWidth: 0 },
  dateElapsed: { fontSize: fs.s, flexShrink: 0, textAlign: 'right' },
  dateElapsedPlaceholder: { minWidth: 48 },
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
