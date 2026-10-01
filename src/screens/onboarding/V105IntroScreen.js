import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import i18n from '../../i18n';

/**
 * v1.05 バージョンアップお知らせ（AnnieEndingNote の v104-intro 相当）
 * @param {{ markSeen: () => Promise<void> }} props
 */
export default function V105IntroScreen({ markSeen }) {
  const { currentTheme, fontSizes } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { language } = useDisplayPreferences();
  const [busy, setBusy] = useState(false);

  const bullets = useMemo(
    () => [
      i18n.t('v105Intro.bullet1'),
      i18n.t('v105Intro.bullet2'),
      i18n.t('v105Intro.bullet3'),
      i18n.t('v105Intro.bullet4'),
      i18n.t('v105Intro.bullet5'),
    ],
    [language]
  );

  const handleContinue = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await markSeen();
    } catch (error) {
      console.error('V105Intro markSeen failed:', error);
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Ionicons name="megaphone" size={72} color={currentTheme.primary} />
        </View>

        <Text style={[styles.title, { color: currentTheme.text, fontSize: fontSizes.l + 4 }]}>
          {i18n.t('v105Intro.title')}
        </Text>
        <Text
          style={[
            styles.lead,
            {
              color: currentTheme.textSecondary,
              fontSize: fontSizes.m,
              lineHeight: fontSizes.m * 1.45,
            },
          ]}
        >
          {i18n.t('v105Intro.lead')}
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: currentTheme.card, borderColor: currentTheme.border },
          ]}
        >
          {bullets.map((text, index) => (
            <View key={index} style={[styles.bulletRow, index > 0 && styles.bulletSpacing]}>
              <Text style={[styles.bulletDot, { color: currentTheme.primary }]}>・</Text>
              <Text
                style={[
                  styles.bulletText,
                  {
                    color: currentTheme.text,
                    fontSize: fontSizes.m,
                    lineHeight: fontSizes.m * 1.5,
                  },
                ]}
              >
                {text}
              </Text>
            </View>
          ))}
        </View>

        {busy ? (
          <ActivityIndicator size="large" color={currentTheme.primary} style={styles.loader} />
        ) : (
          <Pressable
            style={[styles.button, { backgroundColor: currentTheme.primary }]}
            onPress={handleContinue}
          >
            <Text style={[styles.buttonText, { color: currentTheme.card }]}>
              {i18n.t('v105Intro.continue')}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = () => ({
  safeArea: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  iconContainer: { alignItems: 'center', marginBottom: 16 },
  title: { fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  lead: { textAlign: 'center', marginBottom: 24 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start' },
  bulletSpacing: { marginTop: 16 },
  bulletDot: { fontSize: 16, fontWeight: 'bold', marginRight: 8, lineHeight: 24 },
  bulletText: { flex: 1 },
  loader: { marginTop: 24 },
  button: {
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { fontSize: 17, fontWeight: 'bold' },
});
