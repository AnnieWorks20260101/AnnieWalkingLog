import React, { useState } from 'react';
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
import { FONT_SIZES } from '../../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import i18n from '../../i18n';

export default function GuestUpgradeScreen({ navigation }) {
  const { currentTheme } = useTheme();
  const { upgradeGuestWithEmail } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const showComingSoon = (provider) => {
    Alert.alert(i18n.t('auth.comingSoonTitle'), i18n.t('auth.comingSoonMsg', { provider }));
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
                onPress={() => showComingSoon('Google')}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.socialIcon} />
                <Text style={[styles.socialText, { color: currentTheme.text }]}>{i18n.t('auth.upgradeGoogle')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, { borderColor: currentTheme.border, backgroundColor: currentTheme.card }]}
                onPress={() => showComingSoon('Apple')}
              >
                <Ionicons name="logo-apple" size={20} color={currentTheme.text} style={styles.socialIcon} />
                <Text style={[styles.socialText, { color: currentTheme.text }]}>{i18n.t('auth.upgradeApple')}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 24 },
  heroTitle: { fontSize: FONT_SIZES.standard.l, fontWeight: 'bold', marginTop: 16, textAlign: 'center' },
  heroDesc: { fontSize: FONT_SIZES.standard.m, marginTop: 12, textAlign: 'center', lineHeight: 22 },
  label: { fontSize: FONT_SIZES.standard.s, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: FONT_SIZES.standard.m,
    marginBottom: 8,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: { fontSize: FONT_SIZES.standard.m, fontWeight: 'bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: FONT_SIZES.standard.s },
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
  socialText: { fontSize: FONT_SIZES.standard.m, fontWeight: '600' },
});
