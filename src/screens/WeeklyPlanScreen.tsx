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

export function WeeklyPlanScreen() {
  const weeklyPlan = useWorkoutStore((s) => s.weeklyPlan);
  const routines = useWorkoutStore((s) => s.routines);
  const setWeeklyPlanDay = useWorkoutStore((s) => s.setWeeklyPlanDay);
  const addRoutine = useWorkoutStore((s) => s.addRoutine);
  const updateRoutine = useWorkoutStore((s) => s.updateRoutine);
  const deleteRoutine = useWorkoutStore((s) => s.deleteRoutine);

  const [newRoutineName, setNewRoutineName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const routineList = Object.values(routines);

  const handleAddRoutine = () => {
    const trimmed = newRoutineName.trim();
    if (!trimmed) return;
    addRoutine(trimmed);
    setNewRoutineName('');
  };

  const handleDeleteRoutine = (id: string, name: string) => {
    Alert.alert('Delete routine', `Remove "${name}"? Sessions are kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteRoutine(id),
      },
    ]);
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateRoutine(editingId, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Weekly Plan</Text>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Day → Routine</Text>
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
          <Text style={styles.sectionTitle}>Manage Routines</Text>
          {routineList.map((routine) => (
            <View key={routine.id} style={styles.routineRow}>
              {editingId === routine.id ? (
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                  onSubmitEditing={saveEdit}
                  onBlur={saveEdit}
                />
              ) : (
                <>
                  <Ionicons
                    name={routine.isRestDay ? 'bed-outline' : 'barbell-outline'}
                    size={18}
                    color={routine.isRestDay ? colors.restDay : colors.accent}
                  />
                  <Text style={styles.routineName}>{routine.name}</Text>
                  <TouchableOpacity onPress={() => startEdit(routine.id, routine.name)}>
                    <Ionicons name="pencil" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteRoutine(routine.id, routine.name)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))}

          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={newRoutineName}
              onChangeText={setNewRoutineName}
              placeholder="Add routine..."
              placeholderTextColor={colors.placeholder}
              onSubmitEditing={handleAddRoutine}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddRoutine}>
              <Ionicons name="add" size={22} color={colors.background} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.restDayBtn}
            onPress={() => addRoutine('Rest Day', [], true)}
          >
            <Ionicons name="bed-outline" size={18} color={colors.restDay} />
            <Text style={styles.restDayText}>Add Rest Day routine</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  header: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  routineName: { flex: 1, color: colors.textSecondary, fontSize: 15 },
  editInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 15,
  },
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
  restDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
  },
  restDayText: { color: colors.restDay, fontSize: 14, fontWeight: '600' },
});
