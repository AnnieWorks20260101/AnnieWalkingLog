import { ref, listAll, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

function isIgnorableStorageError(error) {
  const code = error?.code ?? '';
  return code === 'storage/object-not-found' || code === 'storage/unauthorized';
}

/**
 * Storage フォルダを再帰的に削除（配下のファイルとサブフォルダ）
 * @param {import('firebase/storage').StorageReference} folderRef
 */
async function deleteStorageFolderRecursive(folderRef) {
  let listing;
  try {
    listing = await listAll(folderRef);
  } catch (error) {
    if (isIgnorableStorageError(error)) {
      return;
    }
    throw error;
  }

  await Promise.all([
    ...listing.items.map((itemRef) =>
      deleteObject(itemRef).catch((error) => {
        if (isIgnorableStorageError(error)) {
          return;
        }
        throw error;
      })
    ),
    ...listing.prefixes.map((subRef) => deleteStorageFolderRecursive(subRef)),
  ]);
}

/**
 * 家族に紐づく Storage 全体（お散歩写真・ペット写真など）を削除
 * @param {string} familyId
 */
export async function deleteFamilyStorageAssets(familyId) {
  if (!familyId) {
    return;
  }
  await deleteStorageFolderRecursive(ref(storage, `families/${familyId}`));
}
