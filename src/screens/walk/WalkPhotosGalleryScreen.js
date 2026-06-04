import React, { useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, Image, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import ScreenHeader from '../../components/ScreenHeader';
import i18n from '../../i18n';
import { getWalkPhotos } from '../../utils/walkPhotos';
import { parseWalkFromNavigationParams } from '../../utils/walkNavigationParams';

const LIST_WIDTH = Dimensions.get('window').width - 32;

export default function WalkPhotosGalleryScreen({ route }) {
  const walk = useMemo(
    () => parseWalkFromNavigationParams(route.params?.walk),
    [route.params?.walk]
  );
  const { currentTheme, fontSizes } = useTheme();
  const styles = useThemedStyles(createStyles);
  const photos = getWalkPhotos(walk);

  const renderItem = ({ item, index }) => (
    <View style={[styles.photoCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
      <Text style={[styles.photoIndex, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
        {i18n.t('walk.photoGalleryIndex', { number: index + 1 })}
      </Text>
      <Image source={{ uri: item.storageUrl }} style={styles.photoImage} resizeMode="contain" />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader
        title={i18n.t('walk.photoGalleryTitle', { count: photos.length })}
        showBack
      />
      <FlatList
        data={photos}
        keyExtractor={(item, index) => item.id ?? `photo-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: currentTheme.textSecondary, fontSize: fontSizes.m }]}>
            {i18n.t('walk.photoGalleryEmpty')}
          </Text>
        }
      />
    </View>
  );
}

const createStyles = (fs) => ({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 32 },
  photoCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  photoIndex: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    fontWeight: '600',
  },
  photoImage: {
    width: LIST_WIDTH - 2,
    height: LIST_WIDTH * 0.75,
    alignSelf: 'center',
  },
  empty: { textAlign: 'center', marginTop: 40 },
});
