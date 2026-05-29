import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_SIZES } from '../../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import i18n from '../i18n';

export default function PetSelector({
  pets,
  selectedPetId,
  onSelectPet,
  multiple = false,
  selectedPetIds = [],
  onTogglePet,
  emptyMessage,
}) {
  const { currentTheme } = useTheme();

  if (pets.length === 0) {
    return (
      <Text style={[styles.noPetText, { color: currentTheme.textSecondary }]}>
        {emptyMessage || i18n.t('record.noPet')}
      </Text>
    );
  }

  const renderItem = ({ item }) => {
    const isSelected = multiple ? selectedPetIds.includes(item.id) : item.id === selectedPetId;
    const handlePress = () => {
      if (multiple) {
        onTogglePet?.(item.id);
      } else {
        onSelectPet?.(item.id);
      }
    };

    return (
      <TouchableOpacity
        style={[styles.petIconContainer, isSelected && styles.petIconContainerSelected]}
        onPress={handlePress}
      >
        {item.photoUrl ? (
          <Image
            source={{ uri: item.photoUrl }}
            style={[styles.petIcon, isSelected && { borderColor: currentTheme.primary, borderWidth: 3 }]}
          />
        ) : (
          <View
            style={[
              styles.petIcon,
              styles.noImageIcon,
              { backgroundColor: currentTheme.primaryMuted, borderColor: isSelected ? currentTheme.primary : currentTheme.accentBorder },
              isSelected && { borderWidth: 3 },
            ]}
          >
            <Ionicons name="paw" size={24} color={isSelected ? currentTheme.primary : currentTheme.border} />
          </View>
        )}
        {multiple && isSelected && (
          <View style={[styles.checkBadge, { backgroundColor: currentTheme.primary }]}>
            <Ionicons name="checkmark" size={12} color={currentTheme.card} />
          </View>
        )}
        <Text
          style={[
            styles.petName,
            { color: currentTheme.textSecondary },
            isSelected && { color: currentTheme.primary, fontWeight: 'bold' },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={pets}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { alignItems: 'center', paddingHorizontal: 20 },
  petIconContainer: { alignItems: 'center', marginRight: 15, opacity: 0.5, position: 'relative' },
  petIconContainerSelected: { opacity: 1 },
  checkBadge: {
    position: 'absolute',
    top: 0,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  petIcon: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: 'transparent' },
  noImageIcon: { borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  petName: { fontSize: FONT_SIZES.standard.s, marginTop: 5, maxWidth: 70 },
  noPetText: { fontStyle: 'italic', paddingHorizontal: 20 },
});
