/**
 * 設定画面から投入するテスト用お散歩データ（isTestSeed フラグ付き）。
 * locale=en のときは英語サンプル（Buddy / Luna、Central Park、英語メモ）。
 */
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { deleteWalkRecord } from '../services/deleteWalk';
import { getTestDataLocaleConfig } from './testDataLocaleConfig';

const BATCH_SIZE = 400;
const SEED_YEARS = 2;
const TEST_SEED_FLAG = 'isTestSeed';

const ENGLISH_TEST_PETS = [
  { id: 'test_seed_buddy', name: 'Buddy' },
  { id: 'test_seed_luna', name: 'Luna' },
  { id: 'test_seed_max', name: 'Max' },
  { id: 'test_seed_bella', name: 'Bella' },
  { id: 'test_seed_charlie', name: 'Charlie' },
];

const ENGLISH_TEST_ROUTE = { lat: 40.7829, lng: -73.9654 };

const ENGLISH_TEST_MEMO_SAMPLES = [
  'Met a friendly golden retriever at the park.',
  'Short walk today — rain expected later.',
  'Great energy this morning!',
  'Stopped for a water break.',
  'Tried a new route through the trees.',
  'Quiet evening stroll.',
  'Lots of squirrels today.',
];

const DEFAULT_TEST_ROUTE = { lat: 35.68, lng: 139.76 };

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  const value = min + Math.random() * (max - min);
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPoops(count, routeBase) {
  const baseLat = routeBase.lat + (Math.random() - 0.5) * 0.02;
  const baseLng = routeBase.lng + (Math.random() - 0.5) * 0.02;
  return Array.from({ length: count }, (_, index) => ({
    latitude: baseLat + index * 0.0001,
    longitude: baseLng + index * 0.0001,
  }));
}

function pickPetsForWalk(pets, defaultPetName, petNameSeparator, useEnglishSamples) {
  const sourcePets = useEnglishSamples ? ENGLISH_TEST_PETS : pets;

  if (!sourcePets.length) {
    return {
      petIds: [],
      petNames: [],
      petId: null,
      petName: defaultPetName,
    };
  }

  const ordered = shuffle(sourcePets);
  const take = randomInt(1, Math.min(2, ordered.length));
  const selected = ordered.slice(0, take);
  const petNames = selected.map((pet) => pet.name);
  return {
    petIds: selected.map((pet) => pet.id),
    petNames,
    petId: selected[0].id,
    petName: petNames.join(petNameSeparator),
  };
}

function buildMemos(seedIndex, useEnglishSamples) {
  if (!useEnglishSamples || Math.random() > 0.28) {
    return [];
  }

  const memoCount = randomInt(1, 2);
  const samples = shuffle(ENGLISH_TEST_MEMO_SAMPLES).slice(0, memoCount);
  return samples.map((text, index) => ({
    id: `memo_test_${seedIndex}_${index}`,
    text,
    updatedAt: new Date().toISOString(),
  }));
}

function buildWalkPayload(
  day,
  slotIndex,
  seedIndex,
  { familyId, userId, pets, defaultPetName, petNameSeparator, useEnglishSamples, routeBase }
) {
  const duration = randomFloat(30, 50, 0);
  const distance = randomFloat(1, 2, 2);
  const poopCount = randomInt(0, 3);

  const start = new Date(day);
  const hourBase = slotIndex === 0 ? randomInt(7, 10) : randomInt(16, 19);
  const minute = randomInt(0, 59);
  start.setHours(hourBase, minute, 0, 0);

  const end = new Date(start.getTime() + duration * 60 * 1000);
  const petFields = pickPetsForWalk(pets, defaultPetName, petNameSeparator, useEnglishSamples);

  return {
    familyId,
    userId,
    ...petFields,
    startTime: Timestamp.fromDate(start),
    endTime: Timestamp.fromDate(end),
    distance,
    duration,
    route: [],
    poops: buildPoops(poopCount, routeBase),
    memos: buildMemos(seedIndex, useEnglishSamples),
    [TEST_SEED_FLAG]: true,
    createdAt: serverTimestamp(),
  };
}

/** 投入予定件数（確認ダイアログ用） */
export function estimateTestWalkSeedCount() {
  const days = SEED_YEARS * 365 + 1;
  return days * 1.5;
}

function buildAllWalkPayloads({
  familyId,
  userId,
  pets,
  defaultPetName,
  petNameSeparator,
  useEnglishSamples,
  routeBase,
}) {
  const payloads = [];
  const today = startOfDay(new Date());
  const firstDay = addDays(today, -(SEED_YEARS * 365));
  let seedIndex = 0;

  for (let cursor = new Date(firstDay); cursor <= today; cursor = addDays(cursor, 1)) {
    const walksToday = randomInt(1, 2);
    for (let slot = 0; slot < walksToday; slot += 1) {
      payloads.push(
        buildWalkPayload(cursor, slot, seedIndex, {
          familyId,
          userId,
          pets,
          defaultPetName,
          petNameSeparator,
          useEnglishSamples,
          routeBase,
        })
      );
      seedIndex += 1;
    }
  }

  return payloads;
}

async function fetchFamilyPets(familyId) {
  const snap = await getDocs(query(collection(db, 'pets'), where('familyId', '==', familyId)));
  const pets = [];
  snap.forEach((petDoc) => {
    pets.push({ id: petDoc.id, ...petDoc.data() });
  });
  return pets;
}

/**
 * @param {{ familyId: string, userId: string, locale?: string, onProgress?: (done: number, total: number) => void }} params
 */
export async function seedTestWalksForFamily({ familyId, userId, locale, onProgress }) {
  if (!familyId || !userId) {
    throw new Error('seedTestWalks: familyId and userId are required');
  }

  const { defaultPetName, petNameSeparator, locale: resolvedLocale } = getTestDataLocaleConfig(locale);
  const useEnglishSamples = resolvedLocale === 'en';
  const routeBase = useEnglishSamples ? ENGLISH_TEST_ROUTE : DEFAULT_TEST_ROUTE;
  const pets = useEnglishSamples ? ENGLISH_TEST_PETS : await fetchFamilyPets(familyId);
  const payloads = buildAllWalkPayloads({
    familyId,
    userId,
    pets,
    defaultPetName,
    petNameSeparator,
    useEnglishSamples,
    routeBase,
  });
  const total = payloads.length;
  let done = 0;

  for (let offset = 0; offset < payloads.length; offset += BATCH_SIZE) {
    const chunk = payloads.slice(offset, offset + BATCH_SIZE);
    const batch = writeBatch(db);

    chunk.forEach((data) => {
      const ref = doc(collection(db, 'walks'));
      batch.set(ref, data);
    });

    await batch.commit();
    done += chunk.length;
    onProgress?.(done, total);
  }

  return { created: total, petCount: pets.length, locale: resolvedLocale };
}

function testWalksQuery(familyId) {
  return query(
    collection(db, 'walks'),
    where('familyId', '==', familyId),
    where(TEST_SEED_FLAG, '==', true)
  );
}

/** 削除対象のテストお散歩件数 */
export async function countTestWalksForFamily(familyId) {
  if (!familyId) {
    return 0;
  }
  const snap = await getDocs(testWalksQuery(familyId));
  return snap.size;
}

const DELETE_CHUNK_SIZE = 15;

/**
 * isTestSeed のお散歩だけ削除（Storage 写真含む）
 * @param {{ familyId: string, onProgress?: (done: number, total: number) => void }} params
 */
export async function deleteTestWalksForFamily({ familyId, onProgress }) {
  if (!familyId) {
    throw new Error('deleteTestWalks: familyId is required');
  }

  const snap = await getDocs(testWalksQuery(familyId));
  const walks = snap.docs.map((d) => ({ id: d.id, familyId }));
  const total = walks.length;

  if (total === 0) {
    onProgress?.(0, 0);
    return { deleted: 0 };
  }

  let done = 0;
  for (let offset = 0; offset < walks.length; offset += DELETE_CHUNK_SIZE) {
    const chunk = walks.slice(offset, offset + DELETE_CHUNK_SIZE);
    await Promise.all(chunk.map((walk) => deleteWalkRecord(walk)));
    done += chunk.length;
    onProgress?.(done, total);
  }

  return { deleted: total };
}
