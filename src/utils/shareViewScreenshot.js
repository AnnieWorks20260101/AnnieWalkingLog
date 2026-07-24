import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

function ensureFileUri(uri) {
  if (!uri) {
    return uri;
  }
  return uri.startsWith('file://') ? uri : `file://${uri}`;
}

/**
 * 指定 View を画像化して OS の共有シートを開く
 * @param {React.RefObject} viewRef
 */
export async function shareViewScreenshot(viewRef) {
  if (!viewRef?.current) {
    throw new Error('shareViewScreenshot: viewRef is missing');
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('shareViewScreenshot: sharing unavailable');
  }

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
