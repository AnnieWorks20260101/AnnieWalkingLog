import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import i18n from '../i18n';
import { getPetPhotoUrl } from '../services/petPhotoUpload';
import { isPetUsableByPlanOrder } from '../utils/planPetUsage';

export const PET_FILTER_ALL = 'all';

export default function PetFilterRow({
  pets,
  filterPetId,
  onFilterChange,
  showTitle = true,
  entitlements = null,
}) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const isPetFilterable = (petId) => {
    if (!entitlements) {
      return true;
    }
    return isPetUsableByPlanOrder(petId, pets, entitlements);
  };

  useEffect(() => {
    if (!entitlements || filterPetId === PET_FILTER_ALL) {
      return;
    }
    if (!isPetUsableByPlanOrder(filterPetId, pets, entitlements)) {
      onFilterChange(PET_FILTER_ALL);
    }
  }, [pets, entitlements, filterPetId, onFilterChange]);

  const renderFilterChip = (id, label, pet) => {
    const isAll = id === PET_FILTER_ALL;
    const filterable = isAll || isPetFilterable(id);
    const isSelected = filterable && filterPetId === id;
    const photoUrl = pet ? getPetPhotoUrl(pet) : null;
    return (
      <TouchableOpacity
        key={id}
        style={[
          styles.filterChip,
          { backgroundColor: currentTheme.chipBackground, borderColor: currentTheme.accentBorder },
          isSelected && {
            backgroundColor: currentTheme.selectedFill,
            borderColor: currentTheme.primary,
            borderWidth: 2,
          },
          !filterable && styles.filterChipDisabled,
        ]}
        onPress={() => {
          if (!filterable) {
            Alert.alert(i18n.t('common.notice'), i18n.t('walk.petInactiveForWalk'));
            return;
          }
          onFilterChange(id);
        }}
        activeOpacity={filterable ? 0.7 : 1}
      >
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={[styles.filterAvatar, { borderColor: currentTheme.border }]} />
        ) : !isAll ? (
          <View
            style={[
              styles.filterAvatar,
              styles.filterAvatarPlaceholder,
              {
                backgroundColor: currentTheme.background,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <Ionicons
              name="paw"
              size={16}
              color={filterable ? currentTheme.textSecondary : currentTheme.border}
            />
          </View>
        ) : null}
        <Text
          style={[
            styles.filterChipText,
            { color: currentTheme.textSecondary },
            isSelected && { color: currentTheme.primary, fontWeight: 'bold' },
            !filterable && { color: currentTheme.border },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.filterSection, { borderBottomColor: currentTheme.accentBorder }]}>
      {showTitle ? (
        <Text style={[styles.filterTitle, { color: currentTheme.text }]}>{i18n.t('walk.historyFilterTitle')}</Text>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {renderFilterChip(PET_FILTER_ALL, i18n.t('walk.filterAll'), null)}
        {pets.map((pet) => renderFilterChip(pet.id, pet.name, pet))}
      </ScrollView>
    </View>
  );
}

const createStyles = (fs) => ({
  filterSection: {
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  filterTitle: {
    fontSize: fs.m,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    maxWidth: 140,
  },
  filterChipDisabled: { opacity: 0.38 },
  filterChipText: {
    fontSize: fs.s,
    fontWeight: '600',
  },
  filterAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    borderWidth: 1,
  },
  filterAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
