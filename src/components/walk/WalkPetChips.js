import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { WALK_MARK_PET_FILTER_ALL } from '../../utils/walkMarkPetFilter';
import i18n from '../../i18n';

/**
 * @param {{ id: string, name: string, photoUrl?: string | null }[]} pets
 * @param {'row' | 'column'} layout row=横スクロール / column=改行（縦並び）
 * @param {string | null} [selectedPetId] 選択中の petId。フィルター用。null/未指定なら選択UIなし
 * @param {(petId: string) => void} [onSelectPet]
 * @param {boolean} [showAllOption] 「すべて」チップを先頭に出す
 */
export default function WalkPetChips({
  pets = [],
  layout = 'row',
  style,
  selectedPetId = null,
  onSelectPet,
  showAllOption = false,
}) {
  const { currentTheme, fontSizes } = useTheme();
  const styles = useThemedStyles(createStyles);
  const selectable = typeof onSelectPet === 'function';

  if (!pets.length && !showAllOption) {
    return null;
  }

  const renderChip = ({ id, name, photoUrl, isAll }) => {
    const selected = selectable && selectedPetId === id;
    const content = (
      <>
        {isAll ? (
          <View
            style={[
              styles.avatar,
              styles.avatarPlaceholder,
              {
                backgroundColor: currentTheme.background,
                borderColor: selected ? currentTheme.primary : currentTheme.border,
              },
            ]}
          >
            <Ionicons
              name="paw"
              size={14}
              color={selected ? currentTheme.primary : currentTheme.textSecondary}
            />
          </View>
        ) : photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={[
              styles.avatar,
              { borderColor: selected ? currentTheme.primary : currentTheme.border },
            ]}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              styles.avatarPlaceholder,
              {
                backgroundColor: currentTheme.background,
                borderColor: selected ? currentTheme.primary : currentTheme.border,
              },
            ]}
          >
            <Ionicons
              name="paw"
              size={14}
              color={selected ? currentTheme.primary : currentTheme.textSecondary}
            />
          </View>
        )}
        <Text
          style={[
            styles.name,
            {
              color: selected ? currentTheme.primary : currentTheme.text,
              fontSize: fontSizes.s,
            },
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </>
    );

    const chipStyle = [
      styles.chip,
      layout === 'column' && styles.chipColumn,
      {
        backgroundColor: selected
          ? currentTheme.cardTinted || currentTheme.primaryMuted || currentTheme.background
          : currentTheme.chipBackground || currentTheme.background,
        borderColor: selected ? currentTheme.primary : currentTheme.accentBorder,
      },
    ];

    if (selectable) {
      return (
        <TouchableOpacity
          key={id}
          style={chipStyle}
          onPress={() => onSelectPet(id)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={name}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return (
      <View key={id} style={chipStyle} accessibilityLabel={name}>
        {content}
      </View>
    );
  };

  const chips = [];
  if (showAllOption) {
    chips.push(
      renderChip({
        id: WALK_MARK_PET_FILTER_ALL,
        name: i18n.t('walk.petFilterAll'),
        isAll: true,
      })
    );
  }
  pets.forEach((pet) => {
    chips.push(
      renderChip({
        id: pet.id,
        name: pet.name,
        photoUrl: pet.photoUrl,
        isAll: false,
      })
    );
  });

  if (!chips.length) {
    return null;
  }

  if (layout === 'column') {
    return <View style={[styles.column, style]}>{chips}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.row}
    >
      {chips}
    </ScrollView>
  );
}

const createStyles = () => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 4,
  },
  column: {
    gap: 6,
    marginBottom: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 2,
    paddingLeft: 2,
    paddingRight: 8,
    maxWidth: 140,
  },
  chipColumn: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    marginRight: 5,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontWeight: '600',
    flexShrink: 1,
  },
});
