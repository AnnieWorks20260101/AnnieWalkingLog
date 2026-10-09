import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

function ensureFileUri(uri) {
  if (!uri) {
    return uri;
  }
  return uri.startsWith('file://') ? uri : `file://${uri}`;
}

async function assertSharingAvailable() {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('shareViewScreenshot: sharing unavailable');
  }
}

/**
 * 指定 View を画像化して OS の共有シートを開く
 * @param {React.RefObject} viewRef
 */
export async function shareViewScreenshot(viewRef) {
  if (!viewRef?.current) {
    throw new Error('shareViewScreenshot: viewRef is missing');
  }

  await assertSharingAvailable();

  const uri = await captureRef(viewRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });

  const fileUri = ensureFileUri(uri);
  await Sharing.shareAsync(fileUri, {
    mimeType: 'image/png',
    dialogTitle: undefined,
    UTI: Platform.OS === 'ios' ? 'public.png' : undefined,
  });

  return { fileUri };
}

/**
 * 画像 URI（ローカル / https）を OS の共有シートで共有
 * @param {string} uri
 * @param {{ mimeType?: string }} [options]
 */
export async function shareImageFile(uri, options = {}) {
  if (!uri || typeof uri !== 'string') {
    throw new Error('shareImageFile: missing uri');
  }

  await assertSharingAvailable();

  let fileUri = uri;
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    const dest = `${FileSystem.cacheDirectory}share-photo-${Date.now()}.jpg`;
    const downloaded = await FileSystem.downloadAsync(uri, dest);
    if (!downloaded?.uri) {
      throw new Error('shareImageFile: download failed');
    }
    fileUri = downloaded.uri;
  }

  fileUri = ensureFileUri(fileUri);
  const mimeType = typeof options.mimeType === 'string' && options.mimeType
    ? options.mimeType
    : 'image/jpeg';

  await Sharing.shareAsync(fileUri, {
    mimeType,
    dialogTitle: undefined,
    UTI: Platform.OS === 'ios' ? (mimeType === 'image/png' ? 'public.png' : 'public.jpeg') : undefined,
  });

  return { fileUri };
}
