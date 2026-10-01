import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDisplayPreferences } from '../contexts/DisplayPreferencesContext';
import {
  fetchActiveAnnouncements,
  filterFeatureAnnouncements,
  filterShutdownAnnouncements,
  localizedAnnouncementText,
} from '../services/announcements';
import i18n from '../i18n';

const DISMISSED_KEY = '@walk/dismissedAnnouncements';
const LAST_APP_VERSION_KEY = '@walk/lastAppVersion';

async function loadDismissedIds() {
  try {
    const raw = await AsyncStorage.getItem(DISMISSED_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

async function markDismissed(id) {
  const set = await loadDismissedIds();
  set.add(id);
  await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
}

/**
 * Startup overlays:
 * 1. Shutdown / halt notices
 * 2. App feature / what's-new announcements
 */
export default function StartupNotices() {
  const { userId } = useAuth();
  const { currentTheme, fontSizes } = useTheme();
  const { language } = useDisplayPreferences();
  const [queue, setQueue] = useState([]);
  const [busy, setBusy] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '0.0.0';
  const locale = language || i18n.locale || 'ja';

  const refresh = useCallback(async () => {
    if (!userId) {
      setQueue([]);
      return;
    }

    try {
      const [announcements, dismissed, previousVersion] = await Promise.all([
        fetchActiveAnnouncements().catch((error) => {
          console.warn('[StartupNotices] announcements failed', error);
          return [];
        }),
        loadDismissedIds(),
        AsyncStorage.getItem(LAST_APP_VERSION_KEY),
      ]);

      const next = [];

      for (const row of filterShutdownAnnouncements(announcements)) {
        if (!dismissed.has(row.id) || row.blocking) {
          next.push({ type: 'shutdown', announcement: row });
        }
      }

      for (const row of filterFeatureAnnouncements(announcements, appVersion, previousVersion)) {
        if (!dismissed.has(row.id)) {
          next.push({ type: 'feature', announcement: row });
        }
      }

      setQueue(next);
      await AsyncStorage.setItem(LAST_APP_VERSION_KEY, appVersion);
    } catch (error) {
      console.warn('[StartupNotices] refresh failed', error);
    }
  }, [userId, appVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const current = queue[0] ?? null;

  const advance = () => setQueue((prev) => prev.slice(1));

  const onDismissFeature = async () => {
    if (!current || current.type !== 'feature') {
      return;
    }
    setBusy(true);
    try {
      await markDismissed(current.announcement.id);
      advance();
    } finally {
      setBusy(false);
    }
  };

  const onAckShutdown = async () => {
    if (!current || current.type !== 'shutdown') {
      return;
    }
    if (current.announcement.blocking) {
      return;
    }
    setBusy(true);
    try {
      await markDismissed(current.announcement.id);
      advance();
    } finally {
      setBusy(false);
    }
  };

  const title = useMemo(() => {
    if (!current) {
      return '';
    }
    return localizedAnnouncementText(
      current.announcement.titles,
      locale,
      i18n.t('notices.announcementFallbackTitle')
    );
  }, [current, locale]);

  const body = useMemo(() => {
    if (!current) {
      return '';
    }
    return localizedAnnouncementText(current.announcement.bodies, locale, '');
  }, [current, locale]);

  if (!userId || !current) {
    return null;
  }

  const isBlockingShutdown = current.type === 'shutdown' && current.announcement.blocking;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={() => undefined}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: currentTheme.card, borderColor: currentTheme.border },
          ]}
        >
          <Text style={[styles.title, { color: currentTheme.text, fontSize: fontSizes.l }]}>
            {title}
          </Text>
          <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
            <Text
              style={[
                styles.body,
                { color: currentTheme.textSecondary, fontSize: fontSizes.m, lineHeight: fontSizes.m * 1.5 },
              ]}
            >
              {body}
            </Text>
          </ScrollView>

          <View style={styles.actions}>
            {current.type === 'feature' ? (
              <Pressable
                disabled={busy}
                onPress={onDismissFeature}
                style={[
                  styles.btn,
                  { backgroundColor: currentTheme.primary, opacity: busy ? 0.6 : 1 },
                ]}
              >
                {busy ? (
                  <ActivityIndicator color={currentTheme.card} />
                ) : (
                  <Text style={[styles.btnText, { color: currentTheme.card }]}>
                    {i18n.t('common.ok')}
                  </Text>
                )}
              </Pressable>
            ) : null}

            {current.type === 'shutdown' ? (
              isBlockingShutdown ? (
                <Text
                  style={[
                    styles.blockedHint,
                    { color: currentTheme.textSecondary, fontSize: fontSizes.s },
                  ]}
                >
                  {i18n.t('notices.shutdownBlocked')}
                </Text>
              ) : (
                <Pressable
                  disabled={busy}
                  onPress={onAckShutdown}
                  style={[
                    styles.btn,
                    { backgroundColor: currentTheme.primary, opacity: busy ? 0.6 : 1 },
                  ]}
                >
                  {busy ? (
                    <ActivityIndicator color={currentTheme.card} />
                  ) : (
                    <Text style={[styles.btnText, { color: currentTheme.card }]}>
                      {i18n.t('common.ok')}
                    </Text>
                  )}
                </Pressable>
              )
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontWeight: 'bold',
  },
  bodyScroll: {
    maxHeight: 320,
    marginTop: 12,
  },
  bodyContent: {
    paddingBottom: 8,
  },
  body: {},
  actions: {
    marginTop: 18,
    gap: 10,
  },
  btn: {
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnText: {
    fontWeight: 'bold',
  },
  blockedHint: {
    textAlign: 'center',
    marginTop: 4,
  },
});
