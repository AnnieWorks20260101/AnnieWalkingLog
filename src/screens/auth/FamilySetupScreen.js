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
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAuth } from '../../contexts/AuthContext';
import i18n from '../../i18n';

export default function FamilySetupScreen() {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { completeFamilySetup } = useAuth();
  const [familyIdInput, setFamilyIdInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!familyIdInput.trim()) {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.joinFamilyInvalid'));
      return;
    }
    setLoading(true);
    try {
      const result = await completeFamilySetup({ familyIdInput: familyIdInput.trim(), createNew: false });
      if (result.success) return;
      if (result.reason === 'notFound') {
        Alert.alert(i18n.t('common.error'), i18n.t('settings.joinFamilyNotFound'));
      } else {
        Alert.alert(i18n.t('common.error'), i18n.t('settings.joinFamilyInvalid'));
      }
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('auth.familySetupError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    setLoading(true);
    try {
      const result = await completeFamilySetup({ createNew: true });
      if (!result.success) {
        Alert.alert(i18n.t('common.error'), i18n.t('auth.familySetupError'));
      }
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t('common.error'), i18n.t('auth.familySetupError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Ionicons name="people" size={64} color={currentTheme.primary} />
          <Text style={[styles.title, { color: currentTheme.text }]}>{i18n.t('auth.familySetupTitle')}</Text>
          <Text style={[styles.desc, { color: currentTheme.textSecondary }]}>{i18n.t('auth.familySetupDesc')}</Text>
        </View>

        <Text style={[styles.label, { color: currentTheme.textSecondary }]}>{i18n.t('auth.familyIdLabel')}</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: currentTheme.inputBackground,
              borderColor: currentTheme.border,
              color: currentTheme.text,
            },
          ]}
          placeholder={i18n.t('settings.joinFamilyPlaceholder')}
          placeholderTextColor={currentTheme.textSecondary}
          value={familyIdInput}
          onChangeText={setFamilyIdInput}
          autoCapitalize="none"
        />

        {loading ? (
          <ActivityIndicator size="large" color={currentTheme.primary} style={{ marginTop: 24 }} />
        ) : (
          <>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: currentTheme.primary }]}
              onPress={handleJoin}
            >
              <Text style={[styles.primaryButtonText, { color: currentTheme.card }]}>{i18n.t('auth.joinFamily')}</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: currentTheme.border }]} />
              <Text style={[styles.dividerText, { color: currentTheme.textSecondary }]}>{i18n.t('auth.or')}</Text>
              <View style={[styles.dividerLine, { backgroundColor: currentTheme.border }]} />
            </View>

            <TouchableOpacity
              style={[styles.outlineButton, { borderColor: currentTheme.primary }]}
              onPress={handleCreateNew}
            >
              <Text style={[styles.outlineButtonText, { color: currentTheme.primary }]}>
                {i18n.t('auth.createNewFamily')}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (fs) => ({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: fs.xl, fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
  desc: { fontSize: fs.m, marginTop: 12, textAlign: 'center', lineHeight: 22 },
  label: { fontSize: fs.s, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: fs.m,
    marginBottom: 16,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: { fontSize: fs.m, fontWeight: 'bold' },
  outlineButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  outlineButtonText: { fontSize: fs.m, fontWeight: 'bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: fs.s },
});
