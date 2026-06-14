import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import i18n from '../../i18n';

/**
 * 同一メールの既存アカウントに OAuth をリンクするためのパスワード入力
 * @param {{
 *   visible: boolean,
 *   email: string,
 *   provider?: 'google' | 'apple',
 *   guestDataWarning?: boolean,
 *   submitting?: boolean,
 *   onCancel: () => void,
 *   onSubmit: (password: string) => void | Promise<void>,
 * }} props
 */
export default function GoogleAccountLinkModal({
  visible,
  email,
  provider = 'google',
  guestDataWarning = false,
  submitting = false,
  onCancel,
  onSubmit,
}) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [password, setPassword] = useState('');

  const handleClose = () => {
    if (submitting) {
      return;
    }
    setPassword('');
    onCancel();
  };

  const handleSubmit = () => {
    if (!password || submitting) {
      return;
    }
    onSubmit(password);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.content, { backgroundColor: currentTheme.card }]}>
          <View style={styles.iconRow}>
            <Ionicons name="link-outline" size={40} color={currentTheme.primary} />
          </View>
          <Text style={[styles.title, { color: currentTheme.text }]}>{i18n.t('auth.googleLinkTitle')}</Text>
          <Text style={[styles.body, { color: currentTheme.textSecondary }]}>
            {i18n.t(provider === 'apple' ? 'auth.appleLinkDesc' : 'auth.googleLinkDesc', { email })}
          </Text>
          {guestDataWarning ? (
            <Text style={[styles.warning, { color: currentTheme.textSecondary }]}>
              {i18n.t('auth.googleLinkGuestWarning')}
            </Text>
          ) : null}

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
            editable={!submitting}
          />

          {submitting ? (
            <ActivityIndicator size="large" color={currentTheme.primary} style={styles.loader} />
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: currentTheme.primary, opacity: password ? 1 : 0.45 }]}
              onPress={handleSubmit}
              disabled={!password}
            >
              <Text style={[styles.primaryButtonText, { color: currentTheme.card }]}>
                {i18n.t('auth.googleLinkConfirm')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={submitting}>
            <Text style={[styles.cancelButtonText, { color: currentTheme.textSecondary }]}>
              {i18n.t('walk.cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (fs) => ({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  content: {
    borderRadius: 16,
    padding: 24,
  },
  iconRow: { alignItems: 'center', marginBottom: 12 },
  title: {
    fontSize: fs.l,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: fs.s,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  warning: {
    fontSize: fs.s,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: fs.m,
    marginBottom: 16,
  },
  loader: { marginVertical: 8 },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { fontSize: fs.m, fontWeight: 'bold' },
  cancelButton: { alignItems: 'center', marginTop: 16, padding: 8 },
  cancelButtonText: { fontSize: fs.s, textDecorationLine: 'underline' },
});
