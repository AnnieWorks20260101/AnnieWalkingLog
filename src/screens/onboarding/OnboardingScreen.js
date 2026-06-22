import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyPets } from '../../hooks/useFamilyPets';
import i18n from '../../i18n';
import { TAB_PETS, TAB_WALK } from '../../navigation/tabNames';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * @param {{ onComplete: (initialTab: string) => void, markCompleted: () => Promise<void> }} props
 */
export default function OnboardingScreen({ onComplete, markCompleted }) {
  const { currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { userId, familyId } = useAuth();
  const { language } = useDisplayPreferences();
  const { pets, loading: petsLoading } = useFamilyPets(familyId, userId);
  const listRef = useRef(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const slides = useMemo(() => {
    const lockDesc =
      Platform.OS === 'ios'
        ? i18n.t('onboarding.lockScreenDescIos')
        : i18n.t('onboarding.lockScreenDescAndroid');

    return [
      {
        id: 'welcome',
        icon: 'paw',
        title: i18n.t('onboarding.welcomeTitle'),
        description: i18n.t('onboarding.welcomeDesc'),
        hint: null,
      },
      {
        id: 'pets',
        icon: 'paw-outline',
        title: i18n.t('onboarding.petsTitle'),
        description: i18n.t('onboarding.petsDesc'),
        hint: i18n.t('onboarding.petsHint'),
      },
      {
        id: 'customButton',
        icon: 'options-outline',
        title: i18n.t('onboarding.customButtonTitle'),
        description: i18n.t('onboarding.customButtonDesc'),
        hint: null,
      },
      {
        id: 'lockScreen',
        icon: Platform.OS === 'ios' ? 'phone-portrait-outline' : 'notifications-outline',
        title: i18n.t('onboarding.lockScreenTitle'),
        description: lockDesc,
        hint: null,
      },
    ];
  }, [language]);

  const finishOnboarding = useCallback(async () => {
    if (finishing) {
      return;
    }
    setFinishing(true);
    try {
      await markCompleted();
      const initialTab = pets.length === 0 ? TAB_PETS : TAB_WALK;
      onComplete(initialTab);
    } catch (error) {
      console.error('finishOnboarding failed:', error);
      setFinishing(false);
    }
  }, [finishing, markCompleted, onComplete, pets.length]);

  const goNext = () => {
    if (pageIndex >= slides.length - 1) {
      finishOnboarding();
      return;
    }
    listRef.current?.scrollToIndex({ index: pageIndex + 1, animated: true });
    setPageIndex(pageIndex + 1);
  };

  const onMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setPageIndex(index);
  };

  const isLastPage = pageIndex === slides.length - 1;
  const primaryLabel = isLastPage
    ? pets.length === 0
      ? i18n.t('onboarding.registerPet')
      : i18n.t('onboarding.getStarted')
    : i18n.t('onboarding.next');

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={[styles.iconCircle, { backgroundColor: currentTheme.cardTinted }]}>
        <Ionicons name={item.icon} size={48} color={currentTheme.primary} />
      </View>
      <Text style={[styles.slideTitle, { color: currentTheme.text }]}>{item.title}</Text>
      <Text style={[styles.slideDesc, { color: currentTheme.textSecondary }]}>{item.description}</Text>
      {item.hint ? (
        <Text style={[styles.slideHint, { color: currentTheme.textSecondary }]}>{item.hint}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: currentTheme.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={finishOnboarding}
          disabled={finishing}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('onboarding.skip')}
        >
          <Text style={[styles.skipText, { color: currentTheme.textSecondary }]}>
            {i18n.t('onboarding.skip')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        style={styles.list}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === pageIndex ? currentTheme.primary : currentTheme.border,
                  width: index === pageIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: currentTheme.primary }]}
          onPress={goNext}
          disabled={finishing || (isLastPage && petsLoading)}
          activeOpacity={0.85}
        >
          {finishing || (isLastPage && petsLoading) ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (fs) =>
  StyleSheet.create({
    safe: { flex: 1 },
    list: { flex: 1 },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    skipText: {
      fontSize: fs.m,
      fontWeight: '600',
    },
    slide: {
      flex: 1,
      paddingHorizontal: 28,
      paddingTop: 24,
      alignItems: 'center',
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
    },
    slideTitle: {
      fontSize: fs.xl,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: Math.round(fs.xl * 1.35),
    },
    slideDesc: {
      fontSize: fs.m,
      textAlign: 'center',
      lineHeight: Math.round(fs.m * 1.55),
    },
    slideHint: {
      marginTop: 16,
      fontSize: fs.s,
      textAlign: 'center',
      fontWeight: '600',
      lineHeight: Math.round(fs.s * 1.5),
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      gap: 20,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },
    dot: {
      height: 8,
      borderRadius: 4,
    },
    primaryButton: {
      minHeight: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    primaryButtonText: {
      color: '#fff',
      fontSize: fs.l,
      fontWeight: '700',
    },
  });
