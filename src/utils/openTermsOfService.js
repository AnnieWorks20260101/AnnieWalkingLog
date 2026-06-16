import { Alert, Linking } from 'react-native';
import { getTermsOfServiceUrl } from '../constants/legalUrls';
import i18n from '../i18n';

export async function openTermsOfService() {
  const url = getTermsOfServiceUrl(i18n.locale);
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error('openTermsOfService failed:', error);
    Alert.alert(i18n.t('common.error'), i18n.t('legal.termsOpenError'));
  }
}
