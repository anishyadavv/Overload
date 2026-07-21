import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LogSessionView, RoutineOverridePicker } from '../components/LogSessionView';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { getTodayRoutineId } from '../utils/selectors';
import { formatDayHeader } from '../utils/dateHelpers';
import { colors } from '../theme/colors';

export function HomeScreen() {
  const weeklyPlan = useWorkoutStore((s) => s.weeklyPlan);
  const routines = useWorkoutStore((s) => s.routines);

  const plannedRoutineId = getTodayRoutineId(weeklyPlan);
  const [overrideRoutineId, setOverrideRoutineId] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const activeRoutineId = overrideRoutineId ?? plannedRoutineId;
  const routine = activeRoutineId ? routines[activeRoutineId] : null;
  const dayName = formatDayHeader();

  const handleSaved = () => {
    setSessionKey((k) => k + 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>WorkoutLog</Text>
        <Text style={styles.dayLine}>
          Today is {dayName}
          {routine ? ` — ${routine.name}` : ''}
        </Text>
      </View>

      {!routine ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No routine planned</Text>
          <Text style={styles.emptyText}>
            Set up your weekly plan in the Plan tab.
          </Text>
        </View>
      ) : routine.isRestDay ? (
        <View style={styles.restDay}>
          <Ionicons name="bed" size={64} color={colors.restDay} />
          <Text style={styles.restTitle}>Rest Day</Text>
          <Text style={styles.restText}>
            Recovery is part of the program. Enjoy your day off!
          </Text>
          <TouchableOpacity
            style={styles.overrideLink}
            onPress={() => setPickerVisible(true)}
          >
            <Text style={styles.overrideText}>
              Not resting? Choose a different routine
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.overrideLink}
            onPress={() => setPickerVisible(true)}
          >
            <Ionicons name="swap-horizontal" size={16} color={colors.accent} />
            <Text style={styles.overrideText}>
              Not doing today's planned workout? Choose a different routine
            </Text>
          </TouchableOpacity>

          <LogSessionView
            key={`${activeRoutineId}-${sessionKey}`}
            routine={routine}
            onSaved={handleSaved}
          />
        </>
      )}

      <RoutineOverridePicker
        visible={pickerVisible}
        routines={Object.values(routines)}
        currentRoutineId={activeRoutineId ?? ''}
        onSelect={(id) => {
          setOverrideRoutineId(id);
          setSessionKey((k) => k + 1);
        }}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  greeting: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dayLine: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  overrideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  overrideText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  restDay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  restTitle: {
    color: colors.restDay,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 16,
  },
  restText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
