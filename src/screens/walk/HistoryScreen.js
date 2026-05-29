import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../services/firebase';
import { FONT_SIZES } from '../../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import ScreenHeader from '../../components/ScreenHeader';
import i18n from '../../i18n';
import { getWalkPetNamesLabel, filterWalksByPet } from '../../utils/walkPets';

const FILTER_ALL = 'all';

export default function HistoryScreen({ navigation }) {
  const { currentTheme } = useTheme();
  const { familyId } = useAuth();
  const { pets, loading: petsLoading } = useFamilyPets(familyId);
  const [walks, setWalks] = useState([]);
  const [walksLoading, setWalksLoading] = useState(true);
  const [filterPetId, setFilterPetId] = useState(FILTER_ALL);

  useEffect(() => {
    if (!familyId) return;
    const q = query(
      collection(db, 'walks'),
      where('familyId', '==', familyId),
      orderBy('startTime', 'desc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const walkData = [];
      querySnapshot.forEach((document) => {
        walkData.push({ id: document.id, ...document.data() });
      });
      setWalks(walkData);
      setWalksLoading(false);
    });
    return () => unsubscribe();
  }, [familyId]);

  const filteredWalks = useMemo(
    () => filterWalksByPet(walks, filterPetId, pets),
    [walks, filterPetId, pets]
  );

  const loading = walksLoading || petsLoading;

  const formatDuration = (minutes) => {
    if (!minutes) return `0${i18n.t('common.minute')}`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return h > 0 ? `${h}${i18n.t('common.hour')}${m}${i18n.t('common.minute')}` : `${m}${i18n.t('common.minute')}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = (id) => {
    Alert.alert(
      i18n.t('walk.deleteConfirm'),
      i18n.t('walk.deleteConfirmMsg'),
      [
        { text: i18n.t('walk.cancel'), style: 'cancel' },
        {
          text: i18n.t('walk.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'walks', id));
            } catch (error) {
              console.error('削除エラー:', error);
              Alert.alert(i18n.t('common.error'), i18n.t('medicine.saveError'));
            }
          },
        },
      ]
    );
  };

  const renderFilterChip = (id, label, photoUrl) => {
    const isSelected = filterPetId === id;
    return (
      <TouchableOpacity
        key={id}
        style={[
          styles.filterChip,
          { backgroundColor: currentTheme.chipBackground, borderColor: currentTheme.accentBorder },
          isSelected && { backgroundColor: currentTheme.selectedFill, borderColor: currentTheme.primary, borderWidth: 2 },
        ]}
        onPress={() => setFilterPetId(id)}
      >
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={[styles.filterAvatar, { borderColor: currentTheme.border }]} />
        ) : id !== FILTER_ALL ? (
          <View style={[styles.filterAvatar, styles.filterAvatarPlaceholder, { backgroundColor: currentTheme.primaryMuted }]}>
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

  const renderItem = ({ item, index }) => {
    const showDateHeader =
      index === 0 || formatDate(item.startTime) !== formatDate(filteredWalks[index - 1].startTime);

    return (
      <View>
        {showDateHeader && (
          <Text
            style={[
              styles.dateHeader,
              { backgroundColor: currentTheme.surface, color: currentTheme.headerText || currentTheme.primary },
            ]}
          >
            {formatDate(item.startTime)}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.card, { backgroundColor: currentTheme.cardTinted }]}
          onPress={() => navigation.navigate('WalkDetail', { walk: item })}
        >
          <View style={styles.timelineContainer}>
            <View style={[styles.timelineDot, { backgroundColor: currentTheme.primary }]} />
            <View style={[styles.timelineLine, { backgroundColor: currentTheme.accentBorder }]} />
          </View>

          <View style={[styles.contentContainer, { borderBottomColor: currentTheme.accentBorder }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={[styles.timeText, { color: currentTheme.text }]}>{formatTime(item.startTime)}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={{ fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.detailsContainer, { backgroundColor: currentTheme.primaryMuted }]}>
              <Text style={[styles.petNames, { color: currentTheme.text }]}>
                🐾 {getWalkPetNamesLabel(item) || i18n.t('walk.defaultPetName')}
              </Text>
              <Text style={[styles.statsText, { color: currentTheme.textSecondary }]}>
                {i18n.t('walk.poopCount', { count: item.poops?.length || 0 })}
              </Text>
              <Text style={[styles.statsText, { color: currentTheme.textSecondary }]}>
                📍 {item.distance ? item.distance.toFixed(2) : '0.00'} km / {formatDuration(item.duration)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const listHeader = () => (
    <View style={[styles.filterSection, { borderBottomColor: currentTheme.accentBorder }]}>
      <Text style={[styles.filterTitle, { color: currentTheme.text }]}>{i18n.t('walk.historyFilterTitle')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {renderFilterChip(FILTER_ALL, i18n.t('walk.filterAll'), null)}
        {pets.map((pet) => renderFilterChip(pet.id, pet.name, pet.photoUrl))}
      </ScrollView>
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
      <ScreenHeader title={i18n.t('walk.historyTitle')} />
      <FlatList
        style={styles.list}
        data={filteredWalks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
            {filterPetId === FILTER_ALL ? i18n.t('walk.historyEmpty') : i18n.t('walk.historyEmptyFiltered')}
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: currentTheme.primary }]}
        onPress={() => navigation.navigate('Walk')}
      >
        <Text style={[styles.fabText, { color: currentTheme.card }]}>{i18n.t('walk.startWalk')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 180 },
  filterSection: {
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  filterTitle: {
    fontSize: FONT_SIZES.standard.m,
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
    fontSize: FONT_SIZES.standard.s,
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
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
    lineHeight: 22,
    fontSize: FONT_SIZES.standard.m,
  },
  dateHeader: {
    fontSize: FONT_SIZES.standard.l,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  card: { flexDirection: 'row', paddingHorizontal: 15 },
  timelineContainer: { width: 20, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 20 },
  timelineLine: { flex: 1, width: 2 },
  contentContainer: { flex: 1, paddingVertical: 15, paddingLeft: 10, borderBottomWidth: 1 },
  timeText: { fontSize: FONT_SIZES.standard.m, fontWeight: '600', marginBottom: 4 },
  detailsContainer: { padding: 10, borderRadius: 8, marginTop: 5 },
  petNames: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold', marginBottom: 3 },
  statsText: { fontSize: FONT_SIZES.standard.s, marginTop: 2 },
  deleteButton: { padding: 10, marginTop: -5, marginRight: -5 },
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: FONT_SIZES.standard.s,
    fontWeight: 'bold',
  },
});
