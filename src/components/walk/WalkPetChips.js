import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

/**
 * @param {{ id: string, name: string, photoUrl?: string | null }[]} pets
 * @param {'row' | 'column'} layout row=横スクロール / column=改行（縦並び）
 */
export default function WalkPetChips({ pets = [], layout = 'row', style }) {
  const { currentTheme, fontSizes } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (!pets.length) {
    return null;
  }

  const chips = pets.map((pet) => (
    <View
      key={pet.id}
      style={[
        styles.chip,
        layout === 'column' && styles.chipColumn,
        {
          backgroundColor: currentTheme.chipBackground || currentTheme.background,
          borderColor: currentTheme.accentBorder,
        },
      ]}
      accessibilityLabel={pet.name}
    >
      {pet.photoUrl ? (
        <Image
          source={{ uri: pet.photoUrl }}
          style={[styles.avatar, { borderColor: currentTheme.border }]}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            styles.avatarPlaceholder,
            {
              backgroundColor: currentTheme.background,
              borderColor: currentTheme.border,
            },
          ]}
        >
          <Ionicons name="paw" size={14} color={currentTheme.textSecondary} />
        </View>
      )}
      <Text
        style={[styles.name, { color: currentTheme.text, fontSize: fontSizes.s }]}
        numberOfLines={1}
      >
        {pet.name}
      </Text>
    </View>
  ));

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
