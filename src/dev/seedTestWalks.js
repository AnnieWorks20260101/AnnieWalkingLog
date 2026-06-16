/**
 * TEST ONLY — 本番リリース前にこのファイルと設定画面の呼び出しを削除すること。
 * 過去2年分のダミーお散歩記録を Firestore に投入する。
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

function buildPoops(count) {
  const baseLat = 35.68 + (Math.random() - 0.5) * 0.02;
  const baseLng = 139.76 + (Math.random() - 0.5) * 0.02;
  return Array.from({ length: count }, (_, index) => ({
    latitude: baseLat + index * 0.0001,
    longitude: baseLng + index * 0.0001,
  }));
}

function pickPetsForWalk(pets, defaultPetName, petNameSeparator) {
  if (!pets.length) {
    return {
      petIds: [],
      petNames: [],
      petId: null,
      petName: defaultPetName,
    };
  }

  const ordered = shuffle(pets);
  const take = randomInt(1, Math.min(2, ordered.length));
  const selected = ordered.slice(0, take);
  const petNames = selected.map((p) => p.name);
  return {
    petIds: selected.map((p) => p.id),
    petNames,
    petId: selected[0].id,
    petName: petNames.join(petNameSeparator),
  };
}

function buildWalkPayload(day, slotIndex, { familyId, userId, pets, defaultPetName, petNameSeparator }) {
  const duration = randomFloat(30, 50, 0);
  const distance = randomFloat(1, 2, 2);
  const poopCount = randomInt(0, 3);

  const start = new Date(day);
  const hourBase = slotIndex === 0 ? randomInt(7, 10) : randomInt(16, 19);
  const minute = randomInt(0, 59);
  start.setHours(hourBase, minute, 0, 0);

  const end = new Date(start.getTime() + duration * 60 * 1000);
  const petFields = pickPetsForWalk(pets, defaultPetName, petNameSeparator);

  return {
    familyId,
    userId,
    ...petFields,
    startTime: Timestamp.fromDate(start),
    endTime: Timestamp.fromDate(end),
    distance,
    duration,
    route: [],
    poops: buildPoops(poopCount),
    [TEST_SEED_FLAG]: true,
    createdAt: serverTimestamp(),
  };
}

/** 投入予定件数（確認ダイアログ用） */
export function estimateTestWalkSeedCount() {
  const days = SEED_YEARS * 365 + 1;
  return days * 1.5;
}

function buildAllWalkPayloads({ familyId, userId, pets, defaultPetName, petNameSeparator }) {
  const payloads = [];
  const today = startOfDay(new Date());
  const firstDay = addDays(today, -(SEED_YEARS * 365));

  for (let cursor = new Date(firstDay); cursor <= today; cursor = addDays(cursor, 1)) {
    const walksToday = randomInt(1, 2);
    for (let slot = 0; slot < walksToday; slot += 1) {
      payloads.push(
        buildWalkPayload(cursor, slot, { familyId, userId, pets, defaultPetName, petNameSeparator })
      );
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

  const { defaultPetName, petNameSeparator } = getTestDataLocaleConfig(locale);
  const pets = await fetchFamilyPets(familyId);
  const payloads = buildAllWalkPayloads({
    familyId,
    userId,
    pets,
    defaultPetName,
    petNameSeparator,
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

  return { created: total, petCount: pets.length };
}

function allTestWalksQuery() {
  return query(collection(db, 'walks'), where(TEST_SEED_FLAG, '==', true));
}

/** 削除対象のテストお散歩件数（Firestore 全体・家族 ID 不問） */
export async function countAllTestWalks() {
  const snap = await getDocs(allTestWalksQuery());
  return snap.size;
}

const DELETE_CHUNK_SIZE = 15;

/**
 * isTestSeed のお散歩を Firestore 全体から削除（Storage 写真含む・家族 ID 不問）
 * @param {{ onProgress?: (done: number, total: number) => void }} [params]
 */
export async function deleteAllTestWalks({ onProgress } = {}) {
  const snap = await getDocs(allTestWalksQuery());
  const walks = snap.docs.map((d) => ({
    id: d.id,
    familyId: d.data()?.familyId,
  }));
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
