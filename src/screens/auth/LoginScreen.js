import React, { useState, useEffect, useCallback } from 'react';
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
import LegalConsentRow from '../../components/auth/LegalConsentRow';
import GoogleAccountLinkModal from '../../components/auth/GoogleAccountLinkModal';
import i18n from '../../i18n';
import { SCREEN_REGISTER } from '../../navigation/screenNames';
import { hasAcceptedLegalDocuments, setAcceptedLegalDocuments } from '../../utils/legalConsentStorage';
import { getOAuthAuthErrorMessage } from '../../utils/oauthAuthResult';
import { isAppleSignInAvailable } from '../../services/appleSignIn';

export default function LoginScreen({ navigation }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const {
    signInAsGuest,
    signInWithEmail,
    sendPasswordReset,
    signInWithGoogle,
    signInWithApple,
    linkGoogleWithPassword,
    linkAppleWithPassword,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [legalConsentChecked, setLegalConsentChecked] = useState(false);
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

  useEffect(() => {
    hasAcceptedLegalDocuments()
      .then((accepted) => {
        if (accepted) {
          setLegalConsentChecked(true);
        }
      })
      .catch((error) => {
        console.warn('legal consent load failed:', error);
      });
  }, []);

  const ensureLegalConsent = useCallback(() => {
    if (legalConsentChecked) {
      return true;
    }
    Alert.alert(i18n.t('common.notice'), i18n.t('legal.legalConsentRequired'));
    return false;
  }, [legalConsentChecked]);

  const handleGuestLogin = async () => {
    if (!ensureLegalConsent()) {
      return;
    }
    setLoading(true);
    try {
      await signInAsGuest();
      await setAcceptedLegalDocuments();
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('auth.guestError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!ensureLegalConsent()) {
      return;
    }
    if (!email.trim() || !password) {
      Alert.alert(i18n.t('common.error'), i18n.t('auth.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      await setAcceptedLegalDocuments();
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoRegister = () => {
    if (!ensureLegalConsent()) {
      return;
    }
    navigation.navigate(SCREEN_REGISTER);
  };

  const handlePasswordReset = async () => {
    if (!ensureLegalConsent()) {
      return;
    }
    if (!email.trim()) {
      Alert.alert(i18n.t('common.error'), i18n.t('auth.resetEmailRequired'));
      return;
    }
    try {
      await sendPasswordReset(email);
      Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('auth.resetSent'));
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('auth.resetError'));
    }
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

  const handleGoogleLogin = async () => {
    if (!ensureLegalConsent()) {
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        await setAcceptedLegalDocuments();
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

  const handleAppleLogin = async () => {
    if (!ensureLegalConsent()) {
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithApple();
      if (result.success) {
        await setAcceptedLegalDocuments();
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
        await setAcceptedLegalDocuments();
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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Ionicons name="paw" size={72} color={currentTheme.primary} />
          <Text style={[styles.title, { color: currentTheme.text }]}>{i18n.t('auth.loginTitle')}</Text>
          <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>{i18n.t('auth.loginSubtitle')}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={currentTheme.primary} style={{ marginTop: 24 }} />
        ) : (
          <>
            <LegalConsentRow
              checked={legalConsentChecked}
              onToggle={() => setLegalConsentChecked((prev) => !prev)}
            />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: '#32CD32', opacity: legalConsentChecked ? 1 : 0.45 },
              ]}
              onPress={handleGuestLogin}
            >
              <Text style={[styles.primaryButtonText, { color: '#fff' }]}>{i18n.t('auth.guestLogin')}</Text>
            </TouchableOpacity>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: currentTheme.textSecondary }]}>
                {i18n.t('auth.emailSection')}
              </Text>
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
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.inputBackground,
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  },
                ]}
                placeholder={i18n.t('auth.passwordPlaceholder')}
                placeholderTextColor={currentTheme.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: currentTheme.primary, opacity: legalConsentChecked ? 1 : 0.45 },
                ]}
                onPress={handleEmailLogin}
              >
                <Text style={[styles.primaryButtonText, { color: currentTheme.card }]}>{i18n.t('auth.login')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.outlineButton,
                  { borderColor: currentTheme.primary, opacity: legalConsentChecked ? 1 : 0.45 },
                ]}
                onPress={handleGoRegister}
              >
                <Text style={[styles.outlineButtonText, { color: currentTheme.primary }]}>
                  {i18n.t('auth.goRegister')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePasswordReset} style={styles.linkButton}>
                <Text style={[styles.linkText, { color: currentTheme.textSecondary }]}>{i18n.t('auth.forgotPassword')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: currentTheme.border }]} />
              <Text style={[styles.dividerText, { color: currentTheme.textSecondary }]}>{i18n.t('auth.or')}</Text>
              <View style={[styles.dividerLine, { backgroundColor: currentTheme.border }]} />
            </View>

            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  borderColor: currentTheme.border,
                  backgroundColor: currentTheme.card,
                  opacity: legalConsentChecked ? 1 : 0.45,
                },
              ]}
              onPress={handleGoogleLogin}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.socialIcon} />
              <Text style={[styles.socialText, { color: currentTheme.text }]}>{i18n.t('auth.googleLogin')}</Text>
            </TouchableOpacity>

            {appleSignInAvailable ? (
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  {
                    borderColor: currentTheme.border,
                    backgroundColor: currentTheme.card,
                    opacity: legalConsentChecked ? 1 : 0.45,
                  },
                ]}
                onPress={handleAppleLogin}
              >
                <Ionicons name="logo-apple" size={20} color={currentTheme.text} style={styles.socialIcon} />
                <Text style={[styles.socialText, { color: currentTheme.text }]}>{i18n.t('auth.appleLogin')}</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </ScrollView>

      <GoogleAccountLinkModal
        visible={oauthLinkRequest != null}
        email={oauthLinkRequest?.email ?? ''}
        provider={oauthLinkRequest?.provider ?? 'google'}
        guestDataWarning={oauthLinkRequest?.guestDataWarning ?? false}
        submitting={linkSubmitting}
        onCancel={() => setOauthLinkRequest(null)}
        onSubmit={handleOAuthLinkSubmit}
      />
    </KeyboardAvoidingView>
  );
}

const createStyles = (fs) => ({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: fs.xl, fontWeight: 'bold', marginTop: 12 },
  subtitle: { fontSize: fs.m, marginTop: 8, textAlign: 'center', lineHeight: 22 },
  section: { marginBottom: 8 },
  sectionLabel: { fontSize: fs.s, fontWeight: '600', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: fs.m,
    marginBottom: 10,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: { fontSize: fs.m, fontWeight: 'bold' },
  outlineButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  outlineButtonText: { fontSize: fs.m, fontWeight: 'bold' },
  linkButton: { alignItems: 'center', paddingVertical: 8 },
  linkText: { fontSize: fs.s, textDecorationLine: 'underline' },
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
