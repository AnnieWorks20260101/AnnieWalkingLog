import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FONT_SIZES } from '../../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import { movePetInOrder } from '../../utils/petOrder';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import i18n from '../../i18n';

export default function PetListScreen({ navigation }) {
  const { currentTheme } = useTheme();
  const { familyId } = useAuth();
  const { pets, petOrder, loading, savePetOrder } = useFamilyPets(familyId);

  const handleMove = async (petId, direction) => {
    const newOrder = movePetInOrder(petOrder, petId, direction);
    if (newOrder === petOrder) return;

    try {
      await savePetOrder(newOrder);
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('petList.reorderError'));
    }
  };

  const renderItem = ({ item, index }) => {
    const canMoveUp = index > 0;
    const canMoveDown = index < pets.length - 1;
    const groupLabel = item.group || i18n.t('petList.otherPets');

    return (
      <View
        style={[
          styles.petCard,
          { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder, borderLeftColor: currentTheme.primary },
        ]}
      >
        <View style={styles.reorderColumn}>
          <TouchableOpacity
            onPress={() => handleMove(item.id, 'up')}
            disabled={!canMoveUp}
            style={[styles.reorderButton, !canMoveUp && styles.reorderButtonDisabled]}
          >
            <Ionicons name="chevron-up" size={22} color={canMoveUp ? currentTheme.primary : currentTheme.border} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleMove(item.id, 'down')}
            disabled={!canMoveDown}
            style={[styles.reorderButton, !canMoveDown && styles.reorderButtonDisabled]}
          >
            <Ionicons name="chevron-down" size={22} color={canMoveDown ? currentTheme.primary : currentTheme.border} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.petMain}
          onPress={() => navigation.navigate('PetRegistration', { petId: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            {item.photoUrl ? (
              <Image source={{ uri: item.photoUrl }} style={[styles.avatar, { borderColor: currentTheme.border }]} />
            ) : (
              <View style={[styles.avatar, styles.noImage, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
                <Ionicons name="paw" size={30} color={currentTheme.textSecondary} />
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={[styles.petName, { color: currentTheme.text }]}>{item.name}</Text>
            <Text style={[styles.groupText, { color: currentTheme.textSecondary }]}>{groupLabel}</Text>
            <Text style={[styles.petDetails, { color: currentTheme.textSecondary }]}>
              {item.type} {item.gender ? ` / ${item.gender}` : ''}
            </Text>
            <Text style={[styles.birthdayText, { color: currentTheme.textSecondary }]}>
              🎂 {item.birthday || i18n.t('petList.unspecified')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={currentTheme.textSecondary} />
        </TouchableOpacity>
      </View>
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
      <ScreenHeader title={i18n.t('petList.title')} showBack />

      {pets.length > 0 && (
        <Text style={[styles.sortHint, { color: currentTheme.textSecondary }]}>{i18n.t('petList.sortHint')}</Text>
      )}

      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="paw" size={60} color={currentTheme.textSecondary} />
          <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>{i18n.t('petList.noPets')}</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: currentTheme.primary }]}
        onPress={() => navigation.navigate('PetRegistration')}
      >
        <Ionicons name="add" size={32} color={currentTheme.card} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 10, lineHeight: 22 },
  sortHint: { fontSize: FONT_SIZES.standard.s, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, lineHeight: 18 },
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
  infoContainer: { flex: 1 },
  petName: { fontSize: FONT_SIZES.standard.l, fontWeight: 'bold', marginBottom: 2 },
  groupText: { fontSize: FONT_SIZES.standard.s, marginBottom: 2 },
  petDetails: { fontSize: FONT_SIZES.standard.s },
  birthdayText: { fontSize: FONT_SIZES.standard.s, marginTop: 4 },
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
