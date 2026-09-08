import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage, firebaseConfig } from './firebase';
import { readImageBytes } from './petPhotoUpload';

const STORAGE_BUCKET = firebaseConfig.storageBucket;

function friendPhotoObjectPath(familyId) {
  return `families/${familyId}/friends/${Date.now()}.jpg`;
}

function buildDownloadUrl(objectPath, downloadToken) {
  const encodedPath = encodeURIComponent(objectPath);
  const base = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
  return downloadToken ? `${base}&token=${downloadToken}` : base;
}

async function uploadFriendPhotoViaRest(bytes, familyId) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('uploadFriendPhoto: not signed in');
  }

  const token = await user.getIdToken();
  const objectPath = friendPhotoObjectPath(familyId);
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
    throw new Error('uploadFriendPhoto: invalid REST download url');
  }

  return downloadUrl;
}

async function uploadFriendPhotoViaSdk(bytes, familyId) {
  const storageRef = ref(storage, friendPhotoObjectPath(familyId));
  await uploadBytes(storageRef, bytes, { contentType: 'image/jpeg' });
  const downloadUrl = await getDownloadURL(storageRef);
  if (!downloadUrl?.startsWith('http')) {
    throw new Error('uploadFriendPhoto: invalid SDK download url');
  }
  return downloadUrl;
}

/**
 * 端末上の画像 URI → Firebase Storage（お友達フォルダ） → ダウンロード URL
 */
export async function uploadFriendPhotoFromUri(localUri, familyId) {
  if (!localUri || !familyId) {
    throw new Error('uploadFriendPhotoFromUri: missing uri or familyId');
  }

  const bytes = await readImageBytes(localUri);

  try {
    return await uploadFriendPhotoViaRest(bytes, familyId);
  } catch (restError) {
    console.warn('friend photo REST upload failed, trying SDK:', restError);
  }

  return uploadFriendPhotoViaSdk(bytes, familyId);
}
