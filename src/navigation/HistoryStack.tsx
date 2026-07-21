import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoutineHistoryScreen } from '../screens/RoutineHistoryScreen';
import { RoutineSessionsScreen } from '../screens/RoutineSessionsScreen';
import { SessionDetailScreen } from '../screens/SessionDetailScreen';
import { HistoryStackParamList } from './types';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="RoutineHistory"
        component={RoutineHistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoutineSessions"
        component={RoutineSessionsScreen}
        options={{ title: 'Sessions' }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{ title: 'Session Detail' }}
      />
    </Stack.Navigator>
  );
}
