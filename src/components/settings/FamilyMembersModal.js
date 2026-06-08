import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyMembers } from '../../hooks/useFamilyMembers';
import { getEditableDisplayName } from '../../utils/displayName';
import i18n from '../../i18n';

export default function FamilyMembersModal({ visible, onClose, theme, fontSizes }) {
  const { userId, familyId, displayName, updateDisplayName } = useAuth();
  const { members, loading } = useFamilyMembers(familyId, userId);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setEditName(getEditableDisplayName(displayName));
    }
  }, [visible, displayName]);

  const otherMembers = members.filter((member) => member.userId !== userId);

  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert(i18n.t('common.error'), i18n.t('auth.displayNameRequired'));
      return;
    }

    setSaving(true);
    try {
      const result = await updateDisplayName(trimmed);
      if (result.success) {
        Alert.alert(i18n.t('walk.saveSuccess'), i18n.t('settings.displayNameSaved'));
      } else {
        Alert.alert(i18n.t('common.error'), i18n.t('settings.displayNameSaveError'));
      }
    } catch (error) {
      console.error('updateDisplayName failed:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('settings.displayNameSaveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.content, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text, fontSize: fontSizes.l }]}>
              {i18n.t('settings.familyMembersModalTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close-circle" size={28} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontSize: fontSizes.s }]}>
              {i18n.t('settings.familyMembersSelfLabel')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                  color: theme.text,
                  fontSize: fontSizes.m,
                },
              ]}
              placeholder={i18n.t('auth.displayNamePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              value={editName}
              onChangeText={setEditName}
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSaveName}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={theme.card} />
              ) : (
                <Text style={[styles.saveButtonText, { color: theme.card, fontSize: fontSizes.m }]}>
                  {i18n.t('settings.displayNameSave')}
                </Text>
              )}
            </TouchableOpacity>

            <Text
              style={[
                styles.sectionLabel,
                styles.othersSectionLabel,
                { color: theme.textSecondary, fontSize: fontSizes.s },
              ]}
            >
              {i18n.t('settings.familyMembersOthersLabel')}
            </Text>

            {loading ? (
              <ActivityIndicator color={theme.primary} style={styles.loading} />
            ) : otherMembers.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textSecondary, fontSize: fontSizes.m }]}>
                {i18n.t('settings.familyMembersEmpty')}
              </Text>
            ) : (
              otherMembers.map((member, index) => (
                <View key={member.userId}>
                  {index > 0 ? (
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                  ) : null}
                  <View style={styles.memberRow}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={theme.textSecondary}
                      style={styles.memberIcon}
                    />
                    <Text style={[styles.memberName, { color: theme.text, fontSize: fontSizes.m }]}>
                      {member.displayLabel ?? i18n.t('settings.familyMembersUnnamed')}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  scroll: {
    flexGrow: 0,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  othersSectionLabel: {
    marginTop: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  saveButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: 'bold',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  memberIcon: {
    marginRight: 10,
  },
  memberName: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  emptyText: {
    paddingVertical: 12,
  },
  loading: {
    marginVertical: 16,
  },
});
