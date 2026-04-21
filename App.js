// App.js 
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HistoryScreen from './src/screens/walk/HistoryScreen';
import WalkScreen from './src/screens/walk/WalkScreen';
import WalkDetailScreen from './src/screens/walk/WalkDetailScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="History">
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'お散歩履歴' }} />
        <Stack.Screen name="Walk" component={WalkScreen} options={{ title: 'お散歩中' }} />
        {/* 🌟 追加: お散歩詳細画面 */}
        <Stack.Screen name="WalkDetail" component={WalkDetailScreen} options={{ title: 'お散歩ルート' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}