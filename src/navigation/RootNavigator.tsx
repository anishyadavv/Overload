import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabNavigator } from './TabNavigator';
import { PlanSetupScreen } from '../screens/PlanSetupScreen';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { colors } from '../theme/colors';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

export function RootNavigator() {
  const hasCompletedOnboarding = useWorkoutStore((s) => s.hasCompletedOnboarding);
  const [hydrated, setHydrated] = useState(
    () => useWorkoutStore.persist.hasHydrated(),
  );
  const [setupDone, setSetupDone] = useState(hasCompletedOnboarding);

  React.useEffect(() => {
    const unsub = useWorkoutStore.persist.onFinishHydration(() => {
      setHydrated(true);
      setSetupDone(useWorkoutStore.getState().hasCompletedOnboarding);
    });
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!setupDone) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <PlanSetupScreen onComplete={() => setSetupDone(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
