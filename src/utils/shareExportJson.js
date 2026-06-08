import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * @param {string} jsonString
 * @param {string} filename
 */
export async function shareExportJsonFile(jsonString, filename) {
  const safeName = filename.replace(/[^\w.-]/g, '_');
  const fileUri = `${FileSystem.cacheDirectory}${safeName}`;

  await FileSystem.writeAsStringAsync(fileUri, jsonString, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const shareOptions =
    Platform.OS === 'ios'
      ? { url: fileUri }
      : {
          title: safeName,
          message: safeName,
          url: fileUri,
        };

  const result = await Share.share(shareOptions);

  if (result.action === Share.dismissedAction) {
    return { shared: false };
  }

  return { shared: true, fileUri };
}
