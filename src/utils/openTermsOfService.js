import { Alert, Linking } from 'react-native';
import { TERMS_OF_SERVICE_URL } from '../constants/legalUrls';
import i18n from '../i18n';

export async function openTermsOfService() {
  try {
    await Linking.openURL(TERMS_OF_SERVICE_URL);
  } catch (error) {
    console.error('openTermsOfService failed:', error);
    Alert.alert(i18n.t('common.error'), i18n.t('legal.termsOpenError'));
  }
}
