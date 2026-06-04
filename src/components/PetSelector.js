import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import i18n from '../i18n';
import { getPetPhotoUrl } from '../services/petPhotoUpload';

export default function PetSelector({
  pets,
  selectedPetId,
  onSelectPet,
  multiple = false,
  selectedPetIds = [],
  onTogglePet,
  emptyMessage,
  /** @param {string} petId */
  isPetUsable = () => true,
  onDisabledPetPress,
}) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (pets.length === 0) {
    return (
      <Text style={[styles.noPetText, { color: currentTheme.textSecondary }]}>
        {emptyMessage || i18n.t('walk.noPetForWalk')}
      </Text>
    );
  }

  const renderItem = ({ item }) => {
    const photoUrl = getPetPhotoUrl(item);
    const usable = isPetUsable(item.id);
    const isSelected = multiple ? selectedPetIds.includes(item.id) : item.id === selectedPetId;
    const handlePress = () => {
      if (!usable) {
        onDisabledPetPress?.(item);
        return;
      }
      if (multiple) {
        onTogglePet?.(item.id);
      } else {
        onSelectPet?.(item.id);
      }
    };

    return (
      <TouchableOpacity
        style={[styles.petIconContainer, !usable && styles.petIconContainerDisabled]}
        onPress={handlePress}
        activeOpacity={usable ? 0.7 : 1}
      >
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={[
              styles.petIcon,
              {
                borderColor: isSelected && usable ? currentTheme.primary : currentTheme.border,
                borderWidth: isSelected && usable ? 3 : 2,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.petIcon,
              styles.noImageIcon,
              {
                backgroundColor: currentTheme.background,
                borderColor: isSelected && usable ? currentTheme.primary : currentTheme.border,
                borderWidth: isSelected && usable ? 3 : 1,
              },
            ]}
          >
            <Ionicons
              name="paw"
              size={28}
              color={isSelected && usable ? currentTheme.primary : currentTheme.textSecondary}
            />
          </View>
        )}
        {multiple && isSelected && usable && (
          <View style={[styles.checkBadge, { backgroundColor: currentTheme.primary }]}>
            <Ionicons name="checkmark" size={12} color={currentTheme.card} />
          </View>
        )}
        <Text
          style={[
            styles.petName,
            { color: currentTheme.textSecondary },
            isSelected && usable && { color: currentTheme.primary, fontWeight: 'bold' },
            !usable && { color: currentTheme.border },
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

const createStyles = (fs) => ({
  list: { alignItems: 'center', paddingHorizontal: 20 },
  petIconContainer: { alignItems: 'center', marginRight: 15, position: 'relative' },
  petIconContainerDisabled: { opacity: 0.38 },
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
  petIcon: { width: 60, height: 60, borderRadius: 30 },
  noImageIcon: { justifyContent: 'center', alignItems: 'center' },
  petName: { fontSize: fs.s, marginTop: 5, maxWidth: 70 },
  noPetText: { fontSize: fs.m, fontStyle: 'italic', paddingHorizontal: 20 },
});
