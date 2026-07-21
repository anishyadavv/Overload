import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WorkoutSet } from '../types';
import { groupSetsByExercise } from '../utils/selectors';
import { Card } from './Card';
import { colors } from '../theme/colors';

interface LastSessionCardProps {
  routineName: string;
  dateLabel: string;
  sets: WorkoutSet[];
}

export function LastSessionCard({
  routineName,
  dateLabel,
  sets,
}: LastSessionCardProps) {
  const grouped = groupSetsByExercise(sets);

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>
        Last {routineName} session ({dateLabel})
      </Text>
      {sets.length === 0 ? (
        <Text style={styles.empty}>No previous sessions yet</Text>
      ) : (
        Array.from(grouped.entries()).map(([name, exerciseSets]) => (
          <View key={name} style={styles.exerciseBlock}>
            <Text style={styles.exerciseName}>{name}</Text>
            {exerciseSets.map((s, i) => (
              <Text key={s.id} style={styles.setLine}>
                Set {i + 1}
                {s.isWarmup ? ' (warmup)' : ''}: {s.weight}kg × {s.reps}
              </Text>
            ))}
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    opacity: 0.85,
    backgroundColor: colors.surfaceElevated,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  exerciseBlock: {
    marginBottom: 10,
  },
  exerciseName: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  setLine: {
    color: colors.textMuted,
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 2,
  },
});
