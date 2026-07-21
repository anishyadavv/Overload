import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { getAllExerciseNames } from '../utils/selectors';
import {
  getExerciseProgress,
  getExerciseStats,
} from '../utils/chartCalculations';
import { colors } from '../theme/colors';

export function ExerciseProgressScreen() {
  const workoutSets = useWorkoutStore((s) => s.workoutSets);
  const sessions = useWorkoutStore((s) => s.sessions);

  const exercises = getAllExerciseNames(workoutSets);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const progress = selectedExercise
    ? getExerciseProgress(selectedExercise, workoutSets, sessions)
    : [];
  const stats = getExerciseStats(progress);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Progress</Text>
      <Text style={styles.subtitle}>Track weight and volume over time</Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedExercise(item)}>
            <Card style={styles.card}>
              <View style={styles.cardRow}>
                <Ionicons name="trending-up" size={22} color={colors.accent} />
                <Text style={styles.exerciseName}>{item}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="analytics-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              Log some workouts to see exercise progress here.
            </Text>
          </View>
        }
      />

      <Modal visible={!!selectedExercise} animationType="slide">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedExercise(null)}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedExercise}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>Personal Best</Text>
                <Text style={styles.statValue}>{stats.personalBest} kg</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>Latest Max</Text>
                <Text style={styles.statValue}>{stats.latestWeight} kg</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>Sessions</Text>
                <Text style={styles.statValue}>{stats.totalSessions}</Text>
              </Card>
            </View>

            <Text style={styles.chartTitle}>Session History</Text>
            {progress.length === 0 ? (
              <Text style={styles.noData}>No data yet</Text>
            ) : (
              progress.map((point) => (
                <Card key={point.dateIso} style={styles.progressCard}>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressDate}>{point.dateLabel}</Text>
                    <Text style={styles.progressWeight}>{point.maxWeight} kg max</Text>
                  </View>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: `${Math.min(100, (point.maxWeight / (stats.personalBest || 1)) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressDetail}>
                    Best set: {point.bestSet} · Vol: {point.totalVolume.toLocaleString()} kg
                  </Text>
                </Card>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 16,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  list: { padding: 16 },
  card: { marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exerciseName: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '600' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: 12 },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', padding: 12 },
  statLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  statValue: { color: colors.accent, fontSize: 20, fontWeight: '800', marginTop: 4 },
  chartTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  noData: { color: colors.textMuted, fontSize: 14 },
  progressCard: { marginBottom: 10 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressDate: { color: colors.text, fontSize: 15, fontWeight: '600' },
  progressWeight: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  barContainer: {
    height: 8,
    backgroundColor: colors.inputBg,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  bar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressDetail: { color: colors.textMuted, fontSize: 12 },
});
