import * as FileSystem from 'expo-file-system/legacy';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage, firebaseConfig } from './firebase';

const STORAGE_BUCKET = firebaseConfig.storageBucket;

/** 表示用に有効な photoUrl か */
export function getPetPhotoUrl(pet) {
  const url = pet?.photoUrl;
  if (typeof url !== 'string') {
    return null;
  }
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function petPhotoObjectPath(familyId) {
  return `families/${familyId}/pets/${Date.now()}.jpg`;
}

function buildDownloadUrl(objectPath, downloadToken) {
  const encodedPath = encodeURIComponent(objectPath);
  const base = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
  return downloadToken ? `${base}&token=${downloadToken}` : base;
}

/**
 * content:// などをキャッシュにコピー（Android で readAsStringAsync が失敗しやすいため）
 */
export async function resolveReadableImageUri(localUri) {
  if (!localUri) {
    throw new Error('resolveReadableImageUri: missing uri');
  }

  const needsCopy =
    localUri.startsWith('content://') ||
    localUri.startsWith('ph://') ||
    localUri.startsWith('assets-library://');

  if (!needsCopy) {
    return localUri;
  }

  const dest = `${FileSystem.cacheDirectory}img-upload-${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: localUri, to: dest });
  return dest;
}

export async function readImageBytes(localUri) {
  const readableUri = await resolveReadableImageUri(localUri);
  const base64 = await FileSystem.readAsStringAsync(readableUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (!base64?.length) {
    throw new Error('uploadPetPhoto: empty image data');
  }

  return base64ToUint8Array(base64);
}

async function uploadPetPhotoViaRest(bytes, familyId) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('uploadPetPhoto: not signed in');
  }

  const token = await user.getIdToken();
  const objectPath = petPhotoObjectPath(familyId);
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
    throw new Error('uploadPetPhoto: invalid REST download url');
  }

  return downloadUrl;
}

async function uploadPetPhotoViaSdk(bytes, familyId) {
  const storageRef = ref(storage, petPhotoObjectPath(familyId));
  await uploadBytes(storageRef, bytes, { contentType: 'image/jpeg' });
  const downloadUrl = await getDownloadURL(storageRef);
  if (!downloadUrl?.startsWith('http')) {
    throw new Error('uploadPetPhoto: invalid SDK download url');
  }
  return downloadUrl;
}

/**
 * 端末上の画像 URI → Firebase Storage → ダウンロード URL
 */
export async function uploadPetPhotoFromUri(localUri, familyId) {
  if (!localUri || !familyId) {
    throw new Error('uploadPetPhotoFromUri: missing uri or familyId');
  }

  const bytes = await readImageBytes(localUri);

  try {
    return await uploadPetPhotoViaRest(bytes, familyId);
  } catch (restError) {
    console.warn('pet photo REST upload failed, trying SDK:', restError);
  }

  return uploadPetPhotoViaSdk(bytes, familyId);
}
