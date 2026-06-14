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
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAuth } from '../../contexts/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import LegalConsentRow from '../../components/auth/LegalConsentRow';
import i18n from '../../i18n';
import { hasAcceptedLegalDocuments, setAcceptedLegalDocuments } from '../../utils/legalConsentStorage';

export default function RegisterScreen({ navigation }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { signUpWithEmail } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [legalConsentChecked, setLegalConsentChecked] = useState(false);

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

  const handleRegister = async () => {
    if (!ensureLegalConsent()) {
      return;
    }
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
      await signUpWithEmail(email, password, displayName);
      await setAcceptedLegalDocuments();
      Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('auth.registerSuccess'));
    } catch (error) {
      console.error(error);
      const code = error?.code;
      if (code === 'auth/email-already-in-use') {
        Alert.alert(i18n.t('common.error'), i18n.t('auth.emailInUse'));
      } else {
        Alert.alert(i18n.t('common.error'), i18n.t('auth.registerError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('auth.registerTitle')} showBack />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={[styles.desc, { color: currentTheme.textSecondary }]}>{i18n.t('auth.registerDesc')}</Text>

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

          <LegalConsentRow
            checked={legalConsentChecked}
            onToggle={() => setLegalConsentChecked((prev) => !prev)}
            disabled={loading}
          />

          {loading ? (
            <ActivityIndicator size="large" color={currentTheme.primary} style={{ marginTop: 8 }} />
          ) : (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: currentTheme.primary, opacity: legalConsentChecked ? 1 : 0.45 },
              ]}
              onPress={handleRegister}
            >
              <Text style={[styles.primaryButtonText, { color: currentTheme.card }]}>
                {i18n.t('auth.registerButton')}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (fs) => ({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  desc: { fontSize: fs.m, lineHeight: 22, marginBottom: 20 },
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
    marginTop: 4,
  },
  primaryButtonText: { fontSize: fs.m, fontWeight: 'bold' },
});
