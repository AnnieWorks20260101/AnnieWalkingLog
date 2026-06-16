import { Alert, Linking } from 'react-native';
import { getPrivacyPolicyUrl } from '../constants/legalUrls';
import i18n from '../i18n';

export async function openPrivacyPolicy() {
  const url = getPrivacyPolicyUrl(i18n.locale);
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error('openPrivacyPolicy failed:', error);
    Alert.alert(i18n.t('common.error'), i18n.t('legal.privacyPolicyOpenError'));
  }
}
