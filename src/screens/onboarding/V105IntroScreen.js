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
 * バージョンアップお知らせ（既定は v1.05 / v105Intro）
 * @param {{
 *   markSeen: () => Promise<void>,
 *   i18nKey?: string,
 *   bulletCount?: number,
 * }} props
 */
export default function V105IntroScreen({
  markSeen,
  i18nKey = 'v105Intro',
  bulletCount = 5,
}) {
  const { currentTheme, fontSizes } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { language } = useDisplayPreferences();
  const [busy, setBusy] = useState(false);

  const bullets = useMemo(() => {
    const items = [];
    for (let i = 1; i <= bulletCount; i += 1) {
      items.push(i18n.t(`${i18nKey}.bullet${i}`));
    }
    return items;
  }, [language, i18nKey, bulletCount]);

  const closing = useMemo(() => {
    const key = `${i18nKey}.closing`;
    const text = i18n.t(key);
    return text && text !== key ? text : '';
  }, [language, i18nKey]);

  const handleContinue = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await markSeen();
    } catch (error) {
      console.error(`${i18nKey} markSeen failed:`, error);
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
          {i18n.t(`${i18nKey}.title`)}
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
          {i18n.t(`${i18nKey}.lead`)}
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

        {closing ? (
          <Text
            style={[
              styles.lead,
              {
                color: currentTheme.textSecondary,
                fontSize: fontSizes.m,
                lineHeight: fontSizes.m * 1.45,
                marginBottom: 8,
              },
            ]}
          >
            {closing}
          </Text>
        ) : null}

        {busy ? (
          <ActivityIndicator size="large" color={currentTheme.primary} style={styles.loader} />
        ) : (
          <Pressable
            style={[styles.button, { backgroundColor: currentTheme.primary }]}
            onPress={handleContinue}
          >
            <Text style={[styles.buttonText, { color: currentTheme.card }]}>
              {i18n.t(`${i18nKey}.continue`)}
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
