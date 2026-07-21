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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { getSessionsForRoutine } from '../utils/selectors';
import { colors } from '../theme/colors';
import { HistoryStackParamList } from '../navigation/types';

export function RoutineHistoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<HistoryStackParamList>>();
  const routines = useWorkoutStore((s) => s.routines);
  const sessions = useWorkoutStore((s) => s.sessions);

  const routineList = Object.values(routines).filter((r) => !r.isRestDay);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>History</Text>
      <FlatList
        data={routineList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const sessionCount = getSessionsForRoutine(item.id, sessions).length;
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('RoutineSessions', {
                  routineId: item.id,
                  routineName: item.name,
                })
              }
            >
              <Card style={styles.card}>
                <View style={styles.cardRow}>
                  <Ionicons name="barbell" size={24} color={colors.accent} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.routineName}>{item.name}</Text>
                    <Text style={styles.sessionCount}>
                      {sessionCount} session{sessionCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No routines yet. Set up your plan first.</Text>
          </View>
        }
      />
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
    paddingBottom: 12,
  },
  list: { padding: 16, gap: 12 },
  card: { marginBottom: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardInfo: { flex: 1 },
  routineName: { color: colors.text, fontSize: 17, fontWeight: '700' },
  sessionCount: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 15 },
});
