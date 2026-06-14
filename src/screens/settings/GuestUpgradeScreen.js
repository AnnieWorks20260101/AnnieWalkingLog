import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAuth } from '../../contexts/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import GoogleAccountLinkModal from '../../components/auth/GoogleAccountLinkModal';
import i18n from '../../i18n';
import { getOAuthAuthErrorMessage } from '../../utils/oauthAuthResult';
import { isAppleSignInAvailable } from '../../services/appleSignIn';

export default function GuestUpgradeScreen({ navigation }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const {
    upgradeGuestWithEmail,
    upgradeGuestWithGoogle,
    upgradeGuestWithApple,
    linkGoogleWithPassword,
    linkAppleWithPassword,
  } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLinkRequest, setOauthLinkRequest] = useState(null);
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [appleSignInAvailable, setAppleSignInAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }
    isAppleSignInAvailable()
      .then(setAppleSignInAvailable)
      .catch((error) => {
        console.warn('apple sign-in availability check failed:', error);
      });
  }, []);

  const showUpgradeSuccess = () => {
    Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('auth.upgradeSuccess'), [
      { text: i18n.t('common.ok'), onPress: () => navigation.goBack() },
    ]);
  };

  const openOAuthLinkModal = (result) => {
    setOauthLinkRequest({
      email: result.email,
      idToken: result.idToken,
      rawNonce: result.rawNonce ?? null,
      provider: result.provider ?? 'google',
      guestDataWarning: result.guestDataWarning ?? false,
    });
  };

  const handleGoogleUpgrade = async () => {
    setLoading(true);
    try {
      const result = await upgradeGuestWithGoogle();
      if (result.success) {
        showUpgradeSuccess();
        return;
      }
      if (result.reason === 'linkPasswordRequired') {
        openOAuthLinkModal(result);
        return;
      }
      const message = getOAuthAuthErrorMessage(result, 'google');
      if (message) {
        Alert.alert(i18n.t('common.error'), message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('auth.googleLoginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleUpgrade = async () => {
    setLoading(true);
    try {
      const result = await upgradeGuestWithApple();
      if (result.success) {
        showUpgradeSuccess();
        return;
      }
      if (result.reason === 'linkPasswordRequired') {
        openOAuthLinkModal(result);
        return;
      }
      const message = getOAuthAuthErrorMessage(result, 'apple');
      if (message) {
        Alert.alert(i18n.t('common.error'), message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('auth.appleLoginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLinkSubmit = async (linkPassword) => {
    if (!oauthLinkRequest) {
      return;
    }

    setLinkSubmitting(true);
    try {
      const result =
        oauthLinkRequest.provider === 'apple'
          ? await linkAppleWithPassword(
              oauthLinkRequest.email,
              linkPassword,
              oauthLinkRequest.idToken,
              oauthLinkRequest.rawNonce
            )
          : await linkGoogleWithPassword(
              oauthLinkRequest.email,
              linkPassword,
              oauthLinkRequest.idToken
            );
      if (result.success) {
        setOauthLinkRequest(null);
        showUpgradeSuccess();
        return;
      }
      Alert.alert(i18n.t('common.error'), i18n.t('auth.googleLinkError'));
    } catch (error) {
      console.error(error);
      if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        Alert.alert(i18n.t('common.error'), i18n.t('auth.googleLinkWrongPassword'));
      } else {
        Alert.alert(i18n.t('common.error'), i18n.t('auth.googleLinkError'));
      }
    } finally {
      setLinkSubmitting(false);
    }
  };

  const handleUpgrade = async () => {
    if (!email.trim() || !password) {
      Alert.alert(i18n.t('common.error'), i18n.t('auth.emailRequired'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(i18n.t('common.error'), i18n.t('auth.passwordMin'));
      return;
    }

    setLoading(true);
    try {
      const result = await upgradeGuestWithEmail(email, password, displayName);
      if (result.success) {
        Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('auth.upgradeSuccess'), [
          { text: i18n.t('common.ok'), onPress: () => navigation.goBack() },
        ]);
        return;
      }
      Alert.alert(i18n.t('common.error'), i18n.t('auth.upgradeError'));
    } catch (error) {
      console.error(error);
      const code = error?.code;
      if (code === 'auth/email-already-in-use' || code === 'auth/credential-already-in-use') {
        Alert.alert(i18n.t('common.error'), i18n.t('auth.upgradeEmailInUse'));
      } else {
        Alert.alert(i18n.t('common.error'), i18n.t('auth.upgradeError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('auth.upgradeTitle')} showBack />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Ionicons name="shield-checkmark" size={64} color="#32CD32" />
            <Text style={[styles.heroTitle, { color: currentTheme.text }]}>{i18n.t('auth.upgradeHeroTitle')}</Text>
            <Text style={[styles.heroDesc, { color: currentTheme.textSecondary }]}>{i18n.t('auth.upgradeHeroDesc')}</Text>
          </View>

          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('auth.displayNameLabel')}</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: currentTheme.inputBackground,
                borderColor: currentTheme.border,
                color: currentTheme.text,
              },
            ]}
            placeholder={i18n.t('auth.displayNamePlaceholder')}
            placeholderTextColor={currentTheme.textSecondary}
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('auth.emailPlaceholder')}</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: currentTheme.inputBackground,
                borderColor: currentTheme.border,
                color: currentTheme.text,
              },
            ]}
            placeholder={i18n.t('auth.emailPlaceholder')}
            placeholderTextColor={currentTheme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('auth.passwordPlaceholder')}</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: currentTheme.inputBackground,
                borderColor: currentTheme.border,
                color: currentTheme.text,
              },
            ]}
            placeholder={i18n.t('auth.passwordMin')}
            placeholderTextColor={currentTheme.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {loading ? (
            <ActivityIndicator size="large" color={currentTheme.primary} style={{ marginTop: 24 }} />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: currentTheme.primary }]}
                onPress={handleUpgrade}
              >
                <Text style={[styles.primaryButtonText, { color: currentTheme.card }]}>
                  {i18n.t('auth.upgradeEmailButton')}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: currentTheme.border }]} />
                <Text style={[styles.dividerText, { color: currentTheme.textSecondary }]}>{i18n.t('auth.or')}</Text>
                <View style={[styles.dividerLine, { backgroundColor: currentTheme.border }]} />
              </View>

              <TouchableOpacity
                style={[styles.socialButton, { borderColor: currentTheme.border, backgroundColor: currentTheme.card }]}
                onPress={handleGoogleUpgrade}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.socialIcon} />
                <Text style={[styles.socialText, { color: currentTheme.text }]}>{i18n.t('auth.upgradeGoogle')}</Text>
              </TouchableOpacity>

              {appleSignInAvailable ? (
                <TouchableOpacity
                  style={[styles.socialButton, { borderColor: currentTheme.border, backgroundColor: currentTheme.card }]}
                  onPress={handleAppleUpgrade}
                >
                  <Ionicons name="logo-apple" size={20} color={currentTheme.text} style={styles.socialIcon} />
                  <Text style={[styles.socialText, { color: currentTheme.text }]}>{i18n.t('auth.upgradeApple')}</Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <GoogleAccountLinkModal
        visible={oauthLinkRequest != null}
        email={oauthLinkRequest?.email ?? ''}
        provider={oauthLinkRequest?.provider ?? 'google'}
        guestDataWarning={oauthLinkRequest?.guestDataWarning ?? false}
        submitting={linkSubmitting}
        onCancel={() => setOauthLinkRequest(null)}
        onSubmit={handleOAuthLinkSubmit}
      />
    </View>
  );
}

const createStyles = (fs) => ({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 24 },
  heroTitle: { fontSize: fs.l, fontWeight: 'bold', marginTop: 16, textAlign: 'center' },
  heroDesc: { fontSize: fs.m, marginTop: 12, textAlign: 'center', lineHeight: 22 },
  label: { fontSize: fs.s, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: fs.m,
    marginBottom: 8,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: { fontSize: fs.m, fontWeight: 'bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: fs.s },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
  },
  socialIcon: { marginRight: 8 },
  socialText: { fontSize: fs.m, fontWeight: '600' },
});
