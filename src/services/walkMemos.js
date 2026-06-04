import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * @param {string} text
 * @returns {{ id: string, text: string, updatedAt: string }}
 */
export function createWalkMemo(text) {
  const trimmed = text.trim();
  return {
    id: `memo_${Date.now()}`,
    text: trimmed,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * @param {string} walkId
 * @param {Array<{ id: string, text: string, updatedAt: string }>} memos
 */
export async function persistWalkMemos(walkId, memos) {
  await updateDoc(doc(db, 'walks', walkId), { memos });
}

/** @param {{ memos?: Array<{ text?: string }> } | null | undefined} walk */
export function walkHasMemos(walk) {
  return (
    Array.isArray(walk?.memos) &&
    walk.memos.some((memo) => typeof memo?.text === 'string' && memo.text.trim().length > 0)
  );
}
