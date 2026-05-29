// App.js 
import 'react-native-gesture-handler';
import React from 'react';
import { useNotificationObserver } from './src/hooks/useNotificationObserver';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import ThemedStatusBar from './src/components/ThemedStatusBar';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { setupCalendarLocale } from './src/utils/calendarLocale';
import i18n from './src/i18n';

import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import FamilySetupScreen from './src/screens/auth/FamilySetupScreen';

setupCalendarLocale();

import HistoryScreen from './src/screens/walk/HistoryScreen';
import WalkScreen from './src/screens/walk/WalkScreen';
import WalkDetailScreen from './src/screens/walk/WalkDetailScreen';

import RecordScreen from './src/screens/record/RecordScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import PetListScreen from './src/screens/settings/PetListScreen';
import PetRegistrationScreen from './src/screens/settings/PetRegistrationScreen';
import GuestUpgradeScreen from './src/screens/settings/GuestUpgradeScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();

function WalkStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Walk" component={WalkScreen} />
      <Stack.Screen name="WalkDetail" component={WalkDetailScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="PetList" component={PetListScreen} />
      <Stack.Screen name="PetRegistration" component={PetRegistrationScreen} />
      <Stack.Screen name="GuestUpgrade" component={GuestUpgradeScreen} />
    </Stack.Navigator>
  );
}

function RecordStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RecordMain" component={RecordScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainApp() {
  const { currentTheme } = useTheme();
  useNotificationObserver();

  return (
    <NavigationContainer>
      <ThemedStatusBar />
      <Tab.Navigator
        initialRouteName={i18n.t('tabs.walk')}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === i18n.t('tabs.record')) iconName = 'book-outline';
            else if (route.name === i18n.t('tabs.walk')) iconName = 'paw';
            else if (route.name === i18n.t('tabs.settings')) iconName = 'settings-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: currentTheme.primary,
          tabBarInactiveTintColor: currentTheme.textSecondary,
          tabBarStyle: {
            backgroundColor: currentTheme.surface,
            borderTopColor: currentTheme.accentBorder,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name={i18n.t('tabs.record')} component={RecordStack} />
        <Tab.Screen name={i18n.t('tabs.walk')} component={WalkStack} />
        <Tab.Screen name={i18n.t('tabs.settings')} component={SettingsStack} />
      </Tab.Navigator>
    </NavigationContainer>
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
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
