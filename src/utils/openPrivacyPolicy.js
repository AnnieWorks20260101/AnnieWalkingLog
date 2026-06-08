import { Alert, Linking } from 'react-native';
import { PRIVACY_POLICY_URL } from '../constants/legalUrls';
import i18n from '../i18n';

export async function openPrivacyPolicy() {
  try {
    await Linking.openURL(PRIVACY_POLICY_URL);
  } catch (error) {
    console.error('openPrivacyPolicy failed:', error);
    Alert.alert(i18n.t('common.error'), i18n.t('legal.privacyPolicyOpenError'));
  }
}
