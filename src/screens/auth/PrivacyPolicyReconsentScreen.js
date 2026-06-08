import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAuth } from '../../contexts/AuthContext';
import PrivacyPolicyConsentRow from '../../components/auth/PrivacyPolicyConsentRow';
import i18n from '../../i18n';
import { setAcceptedPrivacyPolicy } from '../../utils/privacyConsentStorage';

/**
 * @param {{ onAccepted: () => void | Promise<void> }} props
 */
export default function PrivacyPolicyReconsentScreen({ onAccepted }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { isGuest, signOut } = useAuth();
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!checked) {
      Alert.alert(i18n.t('common.notice'), i18n.t('legal.privacyConsentRequired'));
      return;
    }

    setSubmitting(true);
    try {
      await setAcceptedPrivacyPolicy();
      await onAccepted();
    } catch (error) {
      console.error('reconsent failed:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('legal.reconsentError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(i18n.t('legal.reconsentSignOutTitle'), i18n.t('legal.reconsentSignOutMsg'), [
      { text: i18n.t('walk.cancel'), style: 'cancel' },
      {
        text: i18n.t('legal.reconsentSignOutConfirm'),
        style: 'destructive',
        onPress: () => {
          signOut().catch((error) => {
            console.error('reconsent signOut failed:', error);
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: currentTheme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Ionicons name="document-text-outline" size={56} color={currentTheme.primary} />
          <Text style={[styles.title, { color: currentTheme.text }]}>{i18n.t('legal.reconsentTitle')}</Text>
          <Text style={[styles.desc, { color: currentTheme.textSecondary }]}>{i18n.t('legal.reconsentDesc')}</Text>
          {isGuest ? (
            <Text style={[styles.hint, { color: currentTheme.textSecondary }]}>{i18n.t('legal.reconsentGuestHint')}</Text>
          ) : null}
        </View>

        <PrivacyPolicyConsentRow checked={checked} onToggle={() => setChecked((prev) => !prev)} disabled={submitting} />

        {submitting ? (
          <ActivityIndicator size="large" color={currentTheme.primary} style={styles.loader} />
        ) : (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: currentTheme.primary, opacity: checked ? 1 : 0.45 },
            ]}
            onPress={handleContinue}
          >
            <Text style={[styles.primaryButtonText, { color: currentTheme.card }]}>
              {i18n.t('legal.reconsentContinue')}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} disabled={submitting}>
          <Text style={[styles.signOutText, { color: currentTheme.textSecondary }]}>
            {i18n.t('legal.reconsentSignOut')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (fs) => ({
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: fs.xl,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  desc: {
    fontSize: fs.m,
    lineHeight: 24,
    marginTop: 12,
    textAlign: 'center',
  },
  hint: {
    fontSize: fs.s,
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  loader: { marginTop: 20 },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: fs.m,
    fontWeight: 'bold',
  },
  signOutButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  signOutText: {
    fontSize: fs.s,
    textDecorationLine: 'underline',
  },
});
