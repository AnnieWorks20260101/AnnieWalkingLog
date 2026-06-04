import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { auth, storage, firebaseConfig } from './firebase';
import { readImageBytes, resolveReadableImageUri } from './petPhotoUpload';

const STORAGE_BUCKET = firebaseConfig.storageBucket;

export function walkPhotoObjectPath(familyId, walkId, photoId) {
  return `families/${familyId}/walks/${walkId}/${photoId}.jpg`;
}

function walkPhotosFolderPath(familyId, walkId) {
  return `families/${familyId}/walks/${walkId}`;
}

/**
 * お散歩に紐づく Storage 写真を削除（フォルダ内の全ファイル）
 * object-not-found は無視（既に削除済みなど）
 */
export async function deleteWalkPhotosFromStorage(familyId, walkId) {
  if (!familyId || !walkId) {
    return;
  }

  const folderRef = ref(storage, walkPhotosFolderPath(familyId, walkId));

  let listing;
  try {
    listing = await listAll(folderRef);
  } catch (error) {
    const code = error?.code ?? '';
    if (code === 'storage/object-not-found' || code === 'storage/unauthorized') {
      return;
    }
    throw error;
  }

  await Promise.all(
    listing.items.map((itemRef) =>
      deleteObject(itemRef).catch((error) => {
        if (error?.code === 'storage/object-not-found') {
          return;
        }
        throw error;
      })
    )
  );
}

function buildDownloadUrl(objectPath, downloadToken) {
  const encodedPath = encodeURIComponent(objectPath);
  const base = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
  return downloadToken ? `${base}&token=${downloadToken}` : base;
}

async function uploadWalkPhotoViaRest(bytes, familyId, walkId, photoId) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('uploadWalkPhoto: not signed in');
  }

  const token = await user.getIdToken();
  const objectPath = walkPhotoObjectPath(familyId, walkId, photoId);
  const encodedName = encodeURIComponent(objectPath);
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o?uploadType=media&name=${encodedName}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'image/jpeg',
    },
    body: bytes,
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`storage REST ${response.status}: ${responseText}`);
  }

  let downloadToken;
  try {
    const json = JSON.parse(responseText);
    downloadToken = json.downloadTokens;
  } catch {
    downloadToken = undefined;
  }

  const downloadUrl = buildDownloadUrl(objectPath, downloadToken);
  if (!downloadUrl.startsWith('http')) {
    throw new Error('uploadWalkPhoto: invalid REST download url');
  }

  return downloadUrl;
}

async function uploadWalkPhotoViaSdk(bytes, familyId, walkId, photoId) {
  const storageRef = ref(storage, walkPhotoObjectPath(familyId, walkId, photoId));
  await uploadBytes(storageRef, bytes, { contentType: 'image/jpeg' });
  const downloadUrl = await getDownloadURL(storageRef);
  if (!downloadUrl?.startsWith('http')) {
    throw new Error('uploadWalkPhoto: invalid SDK download url');
  }
  return downloadUrl;
}

/**
 * お散歩写真を Storage にアップロード
 * @returns {Promise<string>} download URL
 */
export async function uploadWalkPhotoFromUri(localUri, familyId, walkId, photoId) {
  if (!localUri || !familyId || !walkId || !photoId) {
    throw new Error('uploadWalkPhotoFromUri: missing arguments');
  }

  await resolveReadableImageUri(localUri);
  const bytes = await readImageBytes(localUri);

  try {
    return await uploadWalkPhotoViaRest(bytes, familyId, walkId, photoId);
  } catch (restError) {
    console.warn('walk photo REST upload failed, trying SDK:', restError);
  }

  return uploadWalkPhotoViaSdk(bytes, familyId, walkId, photoId);
}
