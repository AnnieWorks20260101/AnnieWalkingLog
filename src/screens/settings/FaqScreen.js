import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { useTheme } from '../../contexts/ThemeContext';
import i18n from '../../i18n';

const FAQ_ITEMS = [
  { id: 'family', icon: 'people-outline' },
  { id: 'guest', icon: 'person-outline' },
  { id: 'walk', icon: 'walk-outline' },
  { id: 'graph', icon: 'stats-chart-outline' },
];

export default function FaqScreen() {
  const { currentTheme, fontSizes } = useTheme();
  const [expandedId, setExpandedId] = useState(null);

  return (
    <View style={[styles.wrapper, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader title={i18n.t('settings.faqTitle')} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: currentTheme.textSecondary, fontSize: fontSizes.m }]}>
          {i18n.t('settings.faqIntro')}
        </Text>
        {FAQ_ITEMS.map((item) => {
          const open = expandedId === item.id;
          return (
            <View
              key={item.id}
              style={[styles.card, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
            >
              <TouchableOpacity
                style={styles.questionRow}
                onPress={() => setExpandedId(open ? null : item.id)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={20} color={currentTheme.primary} style={styles.qIcon} />
                <Text style={[styles.question, { color: currentTheme.text, fontSize: fontSizes.m }]}>
                  {i18n.t(`settings.faq.${item.id}.q`)}
                </Text>
                <Ionicons
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={currentTheme.textSecondary}
                />
              </TouchableOpacity>
              {open ? (
                <Text style={[styles.answer, { color: currentTheme.textSecondary, fontSize: fontSizes.m }]}>
                  {i18n.t(`settings.faq.${item.id}.a`)}
                </Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  intro: { lineHeight: 22, marginBottom: 16, paddingHorizontal: 4 },
  card: { borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  questionRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  qIcon: { marginRight: 10 },
  question: { flex: 1, fontWeight: 'bold', lineHeight: 22 },
  answer: { paddingHorizontal: 16, paddingBottom: 16, lineHeight: 24 },
});
