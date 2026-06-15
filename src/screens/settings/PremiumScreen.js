import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PACKAGE_TYPE } from 'react-native-purchases';
import ScreenHeader from '../../components/ScreenHeader';
import { handlePremiumScreenBack } from '../../utils/navigateToPremium';
import PlanComparisonTable from '../../components/PlanComparisonTable';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePlanTier } from '../../hooks/usePlanTier';
import {
  getRevenueCatPackages,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
  isRevenueCatEntitlementActive,
  isRevenueCatSupportedPlatform,
} from '../../services/revenueCat';
import { openPrivacyPolicy } from '../../utils/openPrivacyPolicy';
import { openTermsOfService } from '../../utils/openTermsOfService';
import i18n from '../../i18n';

function getPackageLabelKey(packageType) {
  if (packageType === PACKAGE_TYPE.MONTHLY) {
    return 'settings.premiumSubscribeMonthly';
  }
  if (packageType === PACKAGE_TYPE.ANNUAL) {
    return 'settings.premiumSubscribeAnnual';
  }
  return 'settings.premiumSubscribeDefault';
}

export default function PremiumScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentTheme, fontSizes } = useTheme();
  const { isGuest, familyId } = useAuth();
  const { tier, isPremium } = usePlanTier();
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [purchasingPackageId, setPurchasingPackageId] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const canPurchase = !isGuest && !!familyId && isRevenueCatSupportedPlatform();

  const loadPackages = useCallback(async () => {
    if (!canPurchase) {
      setPackages([]);
      setLoadingPackages(false);
      return;
    }

    setLoadingPackages(true);
    try {
      const availablePackages = await getRevenueCatPackages();
      setPackages(availablePackages);
    } catch (error) {
      console.warn('PremiumScreen: load packages failed:', error);
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  }, [canPurchase]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handlePurchaseSuccess = useCallback((customerInfo) => {
    if (isRevenueCatEntitlementActive(customerInfo)) {
      Alert.alert(i18n.t('common.notice'), i18n.t('settings.premiumPurchaseSuccess'));
    }
  }, []);

  const handlePurchaseError = useCallback((error) => {
    if (error?.userCancelled) {
      return;
    }
    console.warn('PremiumScreen: purchase failed:', error);
    Alert.alert(i18n.t('common.error'), i18n.t('settings.premiumPurchaseError'));
  }, []);

  const handlePurchase = useCallback(
    async (pkg) => {
      if (purchasingPackageId || restoring) {
        return;
      }

      setPurchasingPackageId(pkg.identifier);
      try {
        const customerInfo = await purchaseRevenueCatPackage(pkg);
        handlePurchaseSuccess(customerInfo);
      } catch (error) {
        handlePurchaseError(error);
      } finally {
        setPurchasingPackageId(null);
      }
    },
    [handlePurchaseError, handlePurchaseSuccess, purchasingPackageId, restoring]
  );

  const handleRestore = useCallback(async () => {
    if (purchasingPackageId || restoring) {
      return;
    }

    setRestoring(true);
    try {
      const customerInfo = await restoreRevenueCatPurchases();
      if (isRevenueCatEntitlementActive(customerInfo)) {
        Alert.alert(i18n.t('common.notice'), i18n.t('settings.premiumRestoreSuccess'));
      } else {
        Alert.alert(i18n.t('common.notice'), i18n.t('settings.premiumRestoreNone'));
      }
    } catch (error) {
      console.warn('PremiumScreen: restore failed:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('settings.premiumRestoreError'));
    } finally {
      setRestoring(false);
    }
  }, [purchasingPackageId, restoring]);

  const purchaseBusy = !!purchasingPackageId || restoring;

  return (
    <View style={[styles.wrapper, { backgroundColor: currentTheme.background }]}>
      <ScreenHeader
        title={i18n.t('settings.premiumTitle')}
        showBack
        onBackPress={() => handlePremiumScreenBack(navigation, route)}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.statusCard,
            { backgroundColor: currentTheme.cardTinted, borderColor: currentTheme.accentBorder },
          ]}
        >
          <Ionicons
            name={isPremium ? 'checkmark-circle' : 'star-outline'}
            size={32}
            color={isPremium ? currentTheme.primary : currentTheme.textSecondary}
          />
          <Text style={[styles.statusTitle, { color: currentTheme.text, fontSize: fontSizes.l }]}>
            {isPremium ? i18n.t('settings.premiumActive') : i18n.t('settings.premiumInactive')}
          </Text>
          <Text style={[styles.statusDesc, { color: currentTheme.textSecondary, fontSize: fontSizes.m }]}>
            {i18n.t('settings.premiumStatusDesc')}
          </Text>
          <Text style={[styles.tierLabel, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
            {i18n.t('plan.tierLabel.' + tier)}
          </Text>
        </View>

        <PlanComparisonTable
          variant="full"
          highlightTier={tier}
          titleKey="settings.premiumComparisonTitle"
        />

        <View style={styles.purchaseSection}>
          {isGuest ? (
            <Text style={[styles.purchaseHint, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
              {i18n.t('settings.premiumGuestHint')}
            </Text>
          ) : loadingPackages ? (
            <ActivityIndicator size="small" color={currentTheme.primary} style={styles.loader} />
          ) : isPremium ? (
            <Text style={[styles.purchaseHint, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
              {i18n.t('settings.premiumAlreadyActive')}
            </Text>
          ) : packages.length === 0 ? (
            <Text style={[styles.purchaseHint, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
              {i18n.t('settings.premiumOfferingsUnavailable')}
            </Text>
          ) : (
            packages.map((pkg) => {
              const isPurchasing = purchasingPackageId === pkg.identifier;
              const price = pkg.product.priceString;
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.primaryButton,
                    { backgroundColor: currentTheme.primary, opacity: purchaseBusy && !isPurchasing ? 0.6 : 1 },
                  ]}
                  onPress={() => handlePurchase(pkg)}
                  disabled={purchaseBusy}
                  activeOpacity={0.8}
                >
                  {isPurchasing ? (
                    <ActivityIndicator size="small" color={currentTheme.card} />
                  ) : (
                    <Text style={[styles.primaryButtonText, { color: currentTheme.card, fontSize: fontSizes.m }]}>
                      {i18n.t(getPackageLabelKey(pkg.packageType), { price })}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}

          {canPurchase ? (
            <TouchableOpacity
              style={[styles.restoreButton, { borderColor: currentTheme.border }]}
              onPress={handleRestore}
              disabled={purchaseBusy}
              activeOpacity={0.7}
            >
              {restoring ? (
                <ActivityIndicator size="small" color={currentTheme.primary} />
              ) : (
                <Text style={[styles.restoreButtonText, { color: currentTheme.primary, fontSize: fontSizes.m }]}>
                  {i18n.t('settings.premiumRestore')}
                </Text>
              )}
            </TouchableOpacity>
          ) : null}

          <Text style={[styles.autoRenewNote, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
            {i18n.t('settings.premiumAutoRenewNote')}
          </Text>
        </View>

        <View style={[styles.legalFooter, { borderTopColor: currentTheme.border }]}>
          <Text style={[styles.legalFooterText, { color: currentTheme.textSecondary, fontSize: fontSizes.s }]}>
            <Text style={[styles.legalLink, { color: currentTheme.primary }]} onPress={openTermsOfService}>
              {i18n.t('legal.termsOfService')}
            </Text>
            {i18n.t('settings.premiumLegalSeparator')}
            <Text style={[styles.legalLink, { color: currentTheme.primary }]} onPress={openPrivacyPolicy}>
              {i18n.t('legal.privacyPolicy')}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: { fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
  statusDesc: { marginTop: 8, textAlign: 'center', lineHeight: 22 },
  tierLabel: { marginTop: 12, textAlign: 'center' },
  purchaseSection: { marginTop: 24 },
  loader: { marginVertical: 12 },
  purchaseHint: { textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginBottom: 12,
  },
  primaryButtonText: { fontWeight: 'bold', textAlign: 'center' },
  restoreButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 4,
  },
  restoreButtonText: { fontWeight: '600', textAlign: 'center' },
  autoRenewNote: { marginTop: 16, textAlign: 'center', lineHeight: 20 },
  legalFooter: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  legalFooterText: { textAlign: 'center', lineHeight: 22 },
  legalLink: { textDecorationLine: 'underline', fontWeight: '600' },
});
