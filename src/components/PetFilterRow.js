import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import i18n from '../i18n';
import { getPetPhotoUrl } from '../services/petPhotoUpload';

export const PET_FILTER_ALL = 'all';

export default function PetFilterRow({ pets, filterPetId, onFilterChange, showTitle = true }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const renderFilterChip = (id, label, pet) => {
    const isSelected = filterPetId === id;
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
        ]}
        onPress={() => onFilterChange(id)}
      >
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={[styles.filterAvatar, { borderColor: currentTheme.border }]} />
        ) : id !== PET_FILTER_ALL ? (
          <View
            style={[
              styles.filterAvatar,
              styles.filterAvatarPlaceholder,
              { backgroundColor: currentTheme.primaryMuted },
            ]}
          >
            <Ionicons name="paw" size={16} color={currentTheme.primary} />
          </View>
        ) : null}
        <Text
          style={[
            styles.filterChipText,
            { color: currentTheme.textSecondary },
            isSelected && { color: currentTheme.primary, fontWeight: 'bold' },
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
  },
});
