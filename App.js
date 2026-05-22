// App.js 
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import i18n from './src/i18n';

import HistoryScreen from './src/screens/walk/HistoryScreen';
import WalkScreen from './src/screens/walk/WalkScreen';
import WalkDetailScreen from './src/screens/walk/WalkDetailScreen';

import RecordScreen from './src/screens/record/RecordScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import PetListScreen from './src/screens/settings/PetListScreen';
import PetRegistrationScreen from './src/screens/settings/PetRegistrationScreen';
import MedicineScreen from './src/screens/record/MedicineScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator(); // 🌟 1. これが抜けていました！

// 🌟 2. お散歩画面のスタック（これが消えていました！）
function WalkStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: i18n.t('walk.historyTitle') }} />
      <Stack.Screen name="Walk" component={WalkScreen} options={{ title: i18n.t('walk.walking'), headerShown: false }} />
      <Stack.Screen name="WalkDetail" component={WalkDetailScreen} options={{ title: i18n.t('walk.detailTitle') }} />
    </Stack.Navigator>
  );
}

// 設定画面のスタック
function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: i18n.t('settings.title') }} />
      <Stack.Screen name="PetList" component={PetListScreen} options={{ title: i18n.t('petList.title') }} />
      <Stack.Screen name="PetRegistration" component={PetRegistrationScreen} options={{ title: i18n.t('petRegistration.title') }} />
    </Stack.Navigator>
  );
}

// 飼育記録のスタック
function RecordStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RecordMain" component={RecordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Medicine" component={MedicineScreen} options={{ title: i18n.t('medicine.title') }} />
    </Stack.Navigator>
  );
}

function MainApp() {
  const { currentTheme } = useTheme();

  return (
    <NavigationContainer>
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
          tabBarActiveTintColor: currentTheme.primary, // アクティブな時の色
          tabBarInactiveTintColor: currentTheme.textSecondary,
          tabBarStyle: { backgroundColor: currentTheme.background },
          headerShown: false, // Stack側でヘッダーを出すのでTab側は消す
        })}
      >
        <Tab.Screen name={i18n.t('tabs.record')} component={RecordStack} />
        <Tab.Screen name={i18n.t('tabs.walk')} component={WalkStack} />
        <Tab.Screen name={i18n.t('tabs.settings')} component={SettingsStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
