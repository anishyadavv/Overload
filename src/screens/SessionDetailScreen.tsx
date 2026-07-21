import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '../components/Card';
import { useWorkoutStore } from '../store/useWorkoutStore';
import {
  calculateSessionVolume,
  getSessionSets,
  groupSetsByExercise,
} from '../utils/selectors';
import { formatFullDate } from '../utils/dateHelpers';
import { colors } from '../theme/colors';
import { HistoryStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HistoryStackParamList, 'SessionDetail'>;

export function SessionDetailScreen({ route }: Props) {
  const { sessionId } = route.params;
  const sessions = useWorkoutStore((s) => s.sessions);
  const routines = useWorkoutStore((s) => s.routines);
  const workoutSets = useWorkoutStore((s) => s.workoutSets);

  const session = sessions[sessionId];
  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Session not found</Text>
      </SafeAreaView>
    );
  }

  const routine = routines[session.routineId];
  const sets = getSessionSets(sessionId, workoutSets);
  const grouped = groupSetsByExercise(sets);
  const volume = calculateSessionVolume(sets);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.routineName}>{routine?.name ?? 'Unknown'}</Text>
        <Text style={styles.date}>{formatFullDate(session.dateIso)}</Text>
        <Text style={styles.volume}>
          Total volume: {volume.toLocaleString()} kg
        </Text>

        {Array.from(grouped.entries()).map(([name, exerciseSets]) => (
          <Card key={name} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{name}</Text>
            {exerciseSets.map((s, i) => (
              <View key={s.id} style={styles.setRow}>
                <Text style={styles.setNum}>Set {i + 1}</Text>
                <Text style={styles.setValue}>
                  {s.weight}kg × {s.reps}
                </Text>
                {s.isWarmup && (
                  <View style={styles.warmupBadge}>
                    <Text style={styles.warmupText}>Warmup</Text>
                  </View>
                )}
              </View>
            ))}
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  error: { color: colors.danger, padding: 20, fontSize: 16 },
  routineName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  date: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 8,
  },
  volume: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  exerciseCard: { marginBottom: 12 },
  exerciseName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  setNum: { color: colors.textMuted, fontSize: 14, width: 50 },
  setValue: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  warmupBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  warmupText: { color: colors.background, fontSize: 11, fontWeight: '700' },
});
