import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from './firebase';
import { serializeForExport, toExportIsoString } from '../utils/firestoreJson';

/** @typedef {'summary' | 'full'} ExportMode */

const EXPORT_FORMAT_VERSION = 1;

/**
 * @param {Record<string, unknown>} pet
 */
function serializePet(pet) {
  return {
    id: pet.id,
    name: pet.name ?? '',
    type: pet.type ?? '',
    gender: pet.gender ?? '',
    birthday: pet.birthday ?? '',
    welcomeDate: pet.welcomeDate ?? '',
    farewellDate: pet.farewellDate ?? '',
    group: pet.group ?? '',
    photoUrl: typeof pet.photoUrl === 'string' ? pet.photoUrl : '',
  };
}

/**
 * @param {Array<{ id?: string, text?: string, updatedAt?: unknown }>} memos
 */
function serializeMemos(memos) {
  if (!Array.isArray(memos)) {
    return [];
  }
  return memos.map((memo) => ({
    id: memo.id ?? null,
    text: memo.text ?? '',
    updatedAt: toExportIsoString(memo.updatedAt),
  }));
}

/**
 * @param {Array<Record<string, unknown>>} photos
 * @param {ExportMode} mode
 */
function serializePhotos(photos, mode) {
  if (!Array.isArray(photos)) {
    return [];
  }
  return photos.map((photo) => {
    const base = {
      id: photo.id ?? null,
      storageUrl: typeof photo.storageUrl === 'string' ? photo.storageUrl : '',
      takenAt: toExportIsoString(photo.takenAt),
    };
    if (mode === 'full') {
      return {
        ...base,
        latitude: photo.latitude ?? null,
        longitude: photo.longitude ?? null,
      };
    }
    return base;
  });
}

/**
 * @param {Record<string, unknown> | null | undefined} weather
 * @param {ExportMode} mode
 */
function serializeStartWeather(weather, mode) {
  if (!weather || typeof weather !== 'object') {
    return null;
  }
  if (mode === 'summary') {
    return {
      provider: weather.provider ?? null,
      observedAt: toExportIsoString(weather.observedAt),
      tempC: weather.tempC ?? null,
      feelsLikeC: weather.feelsLikeC ?? null,
      main: weather.main ?? null,
      icon: weather.icon ?? null,
      humidity: weather.humidity ?? null,
    };
  }
  return serializeForExport(weather);
}

/**
 * @param {Record<string, unknown>} walk
 * @param {ExportMode} mode
 */
function serializeWalk(walk, mode) {
  const base = {
    id: walk.id,
    userId: walk.userId ?? null,
    startTime: toExportIsoString(walk.startTime),
    endTime: toExportIsoString(walk.endTime),
    distance: walk.distance ?? null,
    duration: walk.duration ?? null,
    petIds: Array.isArray(walk.petIds) ? walk.petIds : [],
    petNames: Array.isArray(walk.petNames) ? walk.petNames : [],
    petId: walk.petId ?? null,
    petName: walk.petName ?? '',
    memos: serializeMemos(walk.memos),
    photos: serializePhotos(walk.photos, mode),
    startWeather: serializeStartWeather(walk.startWeather, mode),
    createdAt: toExportIsoString(walk.createdAt),
  };

  if (mode === 'summary') {
    return {
      ...base,
      poopCount: Array.isArray(walk.poops) ? walk.poops.length : 0,
      customMarkCount: Array.isArray(walk.customMarks) ? walk.customMarks.length : 0,
      routePointCount: Array.isArray(walk.route) ? walk.route.length : 0,
    };
  }

  return {
    ...base,
    route: Array.isArray(walk.route) ? serializeForExport(walk.route) : [],
    poops: Array.isArray(walk.poops) ? serializeForExport(walk.poops) : [],
    customMarks: Array.isArray(walk.customMarks) ? serializeForExport(walk.customMarks) : [],
  };
}

/**
 * @param {string} familyId
 * @param {string} userId
 */
async function fetchFamilyRecords(familyId, userId) {
  const [userSnap, petsSnap, walksSnap] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    getDocs(query(collection(db, 'pets'), where('familyId', '==', familyId))),
    getDocs(query(collection(db, 'walks'), where('familyId', '==', familyId), orderBy('startTime', 'desc'))),
  ]);

  const pets = petsSnap.docs.map((petDoc) => ({ id: petDoc.id, ...petDoc.data() }));
  const walks = walksSnap.docs
    .map((walkDoc) => ({ id: walkDoc.id, ...walkDoc.data() }))
    .filter((walk) => walk.isTestSeed !== true);

  return {
    userData: userSnap.exists() ? userSnap.data() : {},
    pets,
    walks,
  };
}

/**
 * @param {{ familyId: string, userId: string, mode: ExportMode, appVersion?: string }} options
 */
export async function buildFamilyExportPayload({ familyId, userId, mode, appVersion = '1.0.0' }) {
  if (!familyId || !userId) {
    throw new Error('export/missing-context');
  }

  const { userData, pets, walks } = await fetchFamilyRecords(familyId, userId);
  const authUser = auth.currentUser;

  const payload = {
    formatVersion: EXPORT_FORMAT_VERSION,
    exportMode: mode,
    exportedAt: new Date().toISOString(),
    app: {
      name: 'Annie Walking Log',
      version: appVersion,
    },
    profile: {
      userId,
      displayName: userData.displayName ?? '',
      email: authUser?.email ?? userData.email ?? null,
      isGuest: Boolean(userData.isGuest ?? authUser?.isAnonymous),
    },
    familyId,
    pets: pets.map(serializePet),
    walks: walks.map((walk) => serializeWalk(walk, mode)),
    stats: {
      petCount: pets.length,
      walkCount: walks.length,
    },
    notes: {
      photos:
        'photos[].storageUrl は Firebase Storage 上の画像への参照です。アカウントおよび家族アクセスが有効な間、URL から画像を取得できます。',
      summaryMode:
        mode === 'summary'
          ? 'サマリー版ではルート座標・マーク座標は含まれません。routePointCount で点数のみ示します。'
          : null,
    },
  };

  return payload;
}
