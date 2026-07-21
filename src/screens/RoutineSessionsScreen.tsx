import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '../components/Card';
import { useWorkoutStore } from '../store/useWorkoutStore';
import {
  calculateSessionVolume,
  getSessionSets,
  getSessionsForRoutine,
} from '../utils/selectors';
import { formatFullDate, formatSessionDate } from '../utils/dateHelpers';
import { colors } from '../theme/colors';
import { HistoryStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HistoryStackParamList, 'RoutineSessions'>;

export function RoutineSessionsScreen({ route, navigation }: Props) {
  const { routineId, routineName } = route.params;
  const sessions = useWorkoutStore((s) => s.sessions);
  const workoutSets = useWorkoutStore((s) => s.workoutSets);

  const routineSessions = getSessionsForRoutine(routineId, sessions);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: routineName });
  }, [navigation, routineName]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={routineSessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const sets = getSessionSets(item.id, workoutSets);
          const volume = calculateSessionVolume(sets);
          const exerciseCount = new Set(sets.map((s) => s.exerciseName)).size;

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('SessionDetail', { sessionId: item.id })
              }
            >
              <Card style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.dateBlock}>
                    <Text style={styles.dateDay}>
                      {formatSessionDate(item.dateIso)}
                    </Text>
                    <Text style={styles.dateFull}>
                      {formatFullDate(item.dateIso)}
                    </Text>
                  </View>
                  <View style={styles.stats}>
                    <Text style={styles.statText}>
                      {exerciseCount} exercises
                    </Text>
                    <Text style={styles.statText}>{volume.toLocaleString()} kg vol</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No sessions logged yet for this routine.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  card: { marginBottom: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateBlock: { flex: 1 },
  dateDay: { color: colors.text, fontSize: 18, fontWeight: '700' },
  dateFull: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  stats: { alignItems: 'flex-end' },
  statText: { color: colors.textMuted, fontSize: 12 },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 15 },
});
