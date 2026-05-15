// App.js 
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

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
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'お散歩履歴' }} />
      <Stack.Screen name="Walk" component={WalkScreen} options={{ title: 'お散歩中', headerShown: false }} />
      <Stack.Screen name="WalkDetail" component={WalkDetailScreen} options={{ title: 'お散歩の記録' }} />
    </Stack.Navigator>
  );
}

// 設定画面のスタック
function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: '設定' }} />
      <Stack.Screen name="PetList" component={PetListScreen} options={{ title: 'ペット一覧' }} />
      <Stack.Screen name="PetRegistration" component={PetRegistrationScreen} options={{ title: 'ペット登録' }} />
    </Stack.Navigator>
  );
}

// 飼育記録のスタック
function RecordStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RecordMain" component={RecordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Medicine" component={MedicineScreen} options={{ title: '薬・予防の記録' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="お散歩"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === '飼育記録') iconName = 'book-outline';
            else if (route.name === 'お散歩') iconName = 'paw';
            else if (route.name === '設定') iconName = 'settings-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF6F61', // アクティブな時の色
          tabBarInactiveTintColor: 'gray',
          headerShown: false, // Stack側でヘッダーを出すのでTab側は消す
        })}
      >
        <Tab.Screen name="飼育記録" component={RecordStack} />
        <Tab.Screen name="お散歩" component={WalkStack} />
        <Tab.Screen name="設定" component={SettingsStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}