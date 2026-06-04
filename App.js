// App.js 
import 'react-native-gesture-handler';
import React from 'react';
import { useNotificationObserver } from './src/hooks/useNotificationObserver';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { DisplayPreferencesProvider } from './src/contexts/DisplayPreferencesContext';
import ThemedStatusBar from './src/components/ThemedStatusBar';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import i18n from './src/i18n';
import { TAB_WALK_LOG, TAB_WALK_GRAPH, TAB_WALK, TAB_PETS, TAB_SETTINGS } from './src/navigation/tabNames';
import {
  SCREEN_HISTORY,
  SCREEN_WALK_DETAIL,
  SCREEN_WALK_MAIN,
  SCREEN_PET_LIST,
  SCREEN_PET_REGISTRATION,
  SCREEN_SETTINGS_MAIN,
  SCREEN_PERMISSIONS_CHECK,
  SCREEN_GUEST_UPGRADE,
  SCREEN_PREMIUM,
  SCREEN_FAQ,
  SCREEN_LOGIN,
  SCREEN_REGISTER,
} from './src/navigation/screenNames';
import AppTabBar from './src/navigation/AppTabBar';

import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import FamilySetupScreen from './src/screens/auth/FamilySetupScreen';

import HistoryScreen from './src/screens/walk/HistoryScreen';
import WalkGraphScreen from './src/screens/walk/WalkGraphScreen';
import WalkScreen from './src/screens/walk/WalkScreen';
import WalkDetailScreen from './src/screens/walk/WalkDetailScreen';

import SettingsScreen from './src/screens/settings/SettingsScreen';
import PermissionsCheckScreen from './src/screens/settings/PermissionsCheckScreen';
import PremiumScreen from './src/screens/settings/PremiumScreen';
import FaqScreen from './src/screens/settings/FaqScreen';
import PetListScreen from './src/screens/pet/PetListScreen';
import PetRegistrationScreen from './src/screens/pet/PetRegistrationScreen';
import GuestUpgradeScreen from './src/screens/settings/GuestUpgradeScreen';
import { NavigationRefContext } from './src/navigation/NavigationRefContext';
import AppBackHandler from './src/navigation/AppBackHandler';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();

function WalkHistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCREEN_HISTORY} component={HistoryScreen} />
      <Stack.Screen name={SCREEN_WALK_DETAIL} component={WalkDetailScreen} />
    </Stack.Navigator>
  );
}

function WalkActiveStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCREEN_WALK_MAIN} component={WalkScreen} />
    </Stack.Navigator>
  );
}

function PetStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCREEN_PET_LIST} component={PetListScreen} />
      <Stack.Screen name={SCREEN_PET_REGISTRATION} component={PetRegistrationScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCREEN_SETTINGS_MAIN} component={SettingsScreen} />
      <Stack.Screen name={SCREEN_PERMISSIONS_CHECK} component={PermissionsCheckScreen} />
      <Stack.Screen name={SCREEN_GUEST_UPGRADE} component={GuestUpgradeScreen} />
      <Stack.Screen name={SCREEN_PREMIUM} component={PremiumScreen} />
      <Stack.Screen name={SCREEN_FAQ} component={FaqScreen} />
    </Stack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name={SCREEN_LOGIN} component={LoginScreen} />
      <AuthStack.Screen name={SCREEN_REGISTER} component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainApp() {
  const navigationRef = useNavigationContainerRef();
  useNotificationObserver();

  return (
    <NavigationRefContext.Provider value={navigationRef}>
      <NavigationContainer ref={navigationRef}>
        <AppBackHandler />
        <ThemedStatusBar />
        <Tab.Navigator
          initialRouteName={TAB_WALK}
          tabBar={(props) => <AppTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
        <Tab.Screen
          name={TAB_WALK_LOG}
          component={WalkHistoryStack}
          options={{ tabBarLabel: i18n.t('tabs.walkLog') }}
        />
        <Tab.Screen
          name={TAB_WALK_GRAPH}
          component={WalkGraphScreen}
          options={{ tabBarLabel: i18n.t('tabs.walkGraph') }}
        />
        <Tab.Screen
          name={TAB_WALK}
          component={WalkActiveStack}
          options={{ tabBarLabel: i18n.t('tabs.walk') }}
        />
        <Tab.Screen
          name={TAB_PETS}
          component={PetStack}
          options={{ tabBarLabel: i18n.t('tabs.pets') }}
        />
        <Tab.Screen
          name={TAB_SETTINGS}
          component={SettingsStack}
          options={{ tabBarLabel: i18n.t('tabs.settings') }}
        />
        </Tab.Navigator>
      </NavigationContainer>
    </NavigationRefContext.Provider>
  );
}

function RootNavigator() {
  const { currentTheme } = useTheme();
  const { loading, userId, needsFamilySetup } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: currentTheme.background }}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  if (!userId) {
    return (
      <NavigationContainer>
        <ThemedStatusBar />
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  if (needsFamilySetup) {
    return (
      <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
        <ThemedStatusBar />
        <FamilySetupScreen />
      </View>
    );
  }

  return <MainApp />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DisplayPreferencesProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </DisplayPreferencesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
