import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DayRoutineRow } from '../components/DayRoutineRow';
import { Card } from '../components/Card';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { DAYS_OF_WEEK, DAY_LABELS } from '../utils/dateHelpers';
import { colors } from '../theme/colors';
import { DayOfWeek } from '../types';

const DEFAULT_ROUTINES = [
  { name: 'Chest, Triceps & Shoulders', exercises: ['Bench Press', 'Incline DB Press', 'Tricep Pushdown', 'Lateral Raise'] },
  { name: 'Back, Biceps & Shoulders', exercises: ['Deadlift', 'Barbell Row', 'Lat Pulldown', 'Barbell Curl'] },
  { name: 'Legs', exercises: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl'] },
  { name: 'Rest Day', exercises: [], isRestDay: true },
];

interface PlanSetupScreenProps {
  onComplete: () => void;
}

export function PlanSetupScreen({ onComplete }: PlanSetupScreenProps) {
  const weeklyPlan = useWorkoutStore((s) => s.weeklyPlan);
  const routines = useWorkoutStore((s) => s.routines);
  const setWeeklyPlanDay = useWorkoutStore((s) => s.setWeeklyPlanDay);
  const addRoutine = useWorkoutStore((s) => s.addRoutine);
  const completeOnboarding = useWorkoutStore((s) => s.completeOnboarding);

  const [newRoutineName, setNewRoutineName] = useState('');
  const [initialized, setInitialized] = useState(
    () => Object.keys(useWorkoutStore.getState().routines).length > 0,
  );

  React.useEffect(() => {
    if (initialized) return;
    DEFAULT_ROUTINES.forEach((r) => {
      addRoutine(r.name, r.exercises, r.isRestDay);
    });
    const allRoutines = Object.values(useWorkoutStore.getState().routines);
    const push = allRoutines.find((r) => r.name.includes('Chest'));
    const pull = allRoutines.find((r) => r.name.includes('Back'));
    const legs = allRoutines.find((r) => r.name.includes('Legs'));
    const rest = allRoutines.find((r) => r.isRestDay);

    const mapping: Partial<Record<DayOfWeek, string | null>> = {
      monday: push?.id ?? null,
      tuesday: pull?.id ?? null,
      wednesday: rest?.id ?? null,
      thursday: push?.id ?? null,
      friday: pull?.id ?? null,
      saturday: legs?.id ?? null,
      sunday: rest?.id ?? null,
    };

    DAYS_OF_WEEK.forEach((day) => {
      if (mapping[day]) setWeeklyPlanDay(day, mapping[day]!);
    });
    setInitialized(true);
  }, [initialized, addRoutine, setWeeklyPlanDay]);

  const routineList = Object.values(routines);

  const handleAddRoutine = () => {
    const trimmed = newRoutineName.trim();
    if (!trimmed) return;
    addRoutine(trimmed);
    setNewRoutineName('');
  };

  const handleFinish = () => {
    const assigned = DAYS_OF_WEEK.some((day) => weeklyPlan[day] !== null);
    if (!assigned) {
      Alert.alert('Assign routines', 'Assign at least one routine to a day of the week.');
      return;
    }
    completeOnboarding();
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Set Up Your Week</Text>
        <Text style={styles.subtitle}>
          Assign a routine to each day. You can change this anytime in Plan.
        </Text>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          {DAYS_OF_WEEK.map((day) => (
            <DayRoutineRow
              key={day}
              dayLabel={DAY_LABELS[day]}
              selectedRoutineId={weeklyPlan[day]}
              routines={routineList}
              onSelect={(id) => setWeeklyPlanDay(day, id)}
            />
          ))}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Your Routines</Text>
          {routineList.map((routine) => (
            <View key={routine.id} style={styles.routineItem}>
              <Ionicons
                name={routine.isRestDay ? 'bed-outline' : 'barbell-outline'}
                size={18}
                color={routine.isRestDay ? colors.restDay : colors.accent}
              />
              <Text style={styles.routineName}>{routine.name}</Text>
            </View>
          ))}

          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={newRoutineName}
              onChangeText={setNewRoutineName}
              placeholder="New routine name..."
              placeholderTextColor={colors.placeholder}
              onSubmitEditing={handleAddRoutine}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddRoutine}>
              <Ionicons name="add" size={22} color={colors.background} />
            </TouchableOpacity>
          </View>
        </Card>

        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishBtnText}>Start Training</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.background} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  routineName: { color: colors.textSecondary, fontSize: 15 },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  addInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  finishBtnText: {
    color: colors.background,
    fontSize: 17,
    fontWeight: '800',
  },
});
