import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  compactInviteCode,
  formatInviteCode,
  generateInviteCode,
  isValidInviteCodeInput,
} from '../utils/familyInviteCode';

const MAX_GENERATE_ATTEMPTS = 24;

async function writeInviteCodeLookup(compactCode, familyId, formattedCode) {
  await setDoc(doc(db, 'inviteCodes', compactCode), {
    familyId,
    inviteCode: formattedCode,
  });
}

/**
 * 家族の招待コードを取得する。未発行なら新規発行し families/{familyId}.inviteCode に保存する
 * @param {string} familyId
 * @returns {Promise<string>} "XXXX-XXXX" 形式の招待コード
 */
export async function ensureFamilyInviteCode(familyId) {
  if (!familyId) {
    throw new Error('ensureFamilyInviteCode: missing familyId');
  }

  const familyRef = doc(db, 'families', familyId);
  const familySnap = await getDoc(familyRef);
  const existing = familySnap.exists() ? familySnap.data().inviteCode : null;

  if (typeof existing === 'string' && isValidInviteCodeInput(existing)) {
    const compact = compactInviteCode(existing);
    const lookupSnap = await getDoc(doc(db, 'inviteCodes', compact));
    if (!lookupSnap.exists()) {
      // 参照ドキュメントが何らかの理由で欠けていた場合の自己修復
      await writeInviteCodeLookup(compact, familyId, formatInviteCode(existing));
    }
    return formatInviteCode(existing);
  }

  for (let attempt = 0; attempt < MAX_GENERATE_ATTEMPTS; attempt += 1) {
    const formatted = generateInviteCode();
    const compact = compactInviteCode(formatted);
    const lookupSnap = await getDoc(doc(db, 'inviteCodes', compact));
    if (lookupSnap.exists()) {
      continue;
    }
    await writeInviteCodeLookup(compact, familyId, formatted);
    await updateDoc(familyRef, { inviteCode: formatted });
    return formatted;
  }

  throw new Error('ensureFamilyInviteCode: failed to generate a unique invite code');
}

/**
 * 招待コード（8桁）または旧形式の生 familyId から familyId を解決する
 * @param {string} input
 * @returns {Promise<string | null>}
 */
export async function resolveInviteInputToFamilyId(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) {
    return null;
  }

  if (isValidInviteCodeInput(trimmed)) {
    const compact = compactInviteCode(trimmed);
    const lookupSnap = await getDoc(doc(db, 'inviteCodes', compact));
    return lookupSnap.exists() ? (lookupSnap.data().familyId ?? null) : null;
  }

  // 旧形式（生の familyId をそのまま共有していた）との後方互換
  const familySnap = await getDoc(doc(db, 'families', trimmed));
  return familySnap.exists() ? trimmed : null;
}

/**
 * 家族削除時などに招待コードの参照ドキュメントを削除する
 * @param {string} familyId
 */
export async function deleteInviteCodeLookup(familyId) {
  if (!familyId) {
    return;
  }
  const familySnap = await getDoc(doc(db, 'families', familyId));
  const existing = familySnap.exists() ? familySnap.data().inviteCode : null;
  if (typeof existing !== 'string' || !isValidInviteCodeInput(existing)) {
    return;
  }
  const compact = compactInviteCode(existing);
  try {
    await deleteDoc(doc(db, 'inviteCodes', compact));
  } catch (error) {
    console.warn('deleteInviteCodeLookup failed:', error);
  }
}
