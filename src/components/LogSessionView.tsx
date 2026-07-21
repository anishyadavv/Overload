import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseRow } from './ExerciseRow';
import { LastSessionCard } from './LastSessionCard';
import { Card } from './Card';
import { ExerciseDraft, Routine } from '../types';
import { colors } from '../theme/colors';
import { generateId } from '../utils/id';
import {
  buildDraftFromLastSession,
  getLastSession,
  getSessionSets,
  getTodaySession,
  setsToExerciseDrafts,
} from '../utils/selectors';
import { formatSessionDate } from '../utils/dateHelpers';
import { useWorkoutStore } from '../store/useWorkoutStore';

interface LogSessionViewProps {
  routine: Routine;
  onSaved?: () => void;
}

export function LogSessionView({ routine, onSaved }: LogSessionViewProps) {
  const sessions = useWorkoutStore((s) => s.sessions);
  const workoutSets = useWorkoutStore((s) => s.workoutSets);
  const saveSession = useWorkoutStore((s) => s.saveSession);

  const todaySession = getTodaySession(routine.id, sessions);
  const lastSession = getLastSession(routine.id, sessions, workoutSets, true);

  const [exercises, setExercises] = useState<ExerciseDraft[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    if (todaySession) {
      const todaySets = getSessionSets(todaySession.id, workoutSets);
      const lastSets = lastSession?.sets;
      setExercises(setsToExerciseDrafts(todaySets, lastSets));
    } else {
      setExercises(buildDraftFromLastSession(lastSession, routine));
    }
    setInitialized(true);
  }, [todaySession, lastSession, routine, workoutSets, initialized]);

  const handleSave = () => {
    const hasData = exercises.some((e) =>
      e.sets.some((s) => (parseFloat(s.weight) || 0) > 0 || (parseInt(s.reps, 10) || 0) > 0),
    );

    if (!hasData) {
      Alert.alert('No data', 'Enter at least one set before saving.');
      return;
    }

    saveSession(routine.id, exercises, todaySession?.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSaved?.();
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        exerciseName: `Exercise ${exercises.length + 1}`,
        sets: [
          {
            id: generateId(),
            weight: '',
            reps: '',
            isWarmup: false,
            completed: false,
          },
        ],
      },
    ]);
  };

  const removeExercise = (index: number) => {
    if (exercises.length <= 1) return;
    setExercises(exercises.filter((_, i) => i !== index));
  };

  return (
    <KeyboardAwareScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      enableOnAndroid
      extraScrollHeight={80}
      keyboardShouldPersistTaps="handled"
    >
      {lastSession && (
        <LastSessionCard
          routineName={routine.name}
          dateLabel={formatSessionDate(lastSession.session.dateIso)}
          sets={lastSession.sets}
        />
      )}

      <Card style={styles.todayCard}>
        <View style={styles.todayHeader}>
          <Text style={styles.todayTitle}>Today</Text>
          {todaySession && (
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>Editing</Text>
            </View>
          )}
        </View>

        {exercises.map((exercise, index) => (
          <ExerciseRow
            key={`${exercise.exerciseName}-${index}`}
            exercise={exercise}
            onChange={(updated) => {
              const next = [...exercises];
              next[index] = updated;
              setExercises(next);
            }}
            onRemove={() => removeExercise(index)}
            showRemove={exercises.length > 1}
          />
        ))}

        <TouchableOpacity style={styles.addExerciseBtn} onPress={addExercise}>
          <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
          <Text style={styles.addExerciseText}>Add exercise</Text>
        </TouchableOpacity>
      </Card>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Ionicons name="checkmark-circle" size={22} color={colors.background} />
        <Text style={styles.saveBtnText}>
          {todaySession ? 'Update Session' : 'Save Session'}
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

interface RoutineOverridePickerProps {
  visible: boolean;
  routines: Routine[];
  currentRoutineId: string;
  onSelect: (routineId: string) => void;
  onClose: () => void;
}

export function RoutineOverridePicker({
  visible,
  routines,
  currentRoutineId,
  onSelect,
  onClose,
}: RoutineOverridePickerProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Choose a routine</Text>
          <ScrollView>
            {routines
              .filter((r) => !r.isRestDay)
              .map((routine) => (
                <TouchableOpacity
                  key={routine.id}
                  style={[
                    styles.option,
                    routine.id === currentRoutineId && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onSelect(routine.id);
                    onClose();
                  }}
                >
                  <Text style={styles.optionText}>{routine.name}</Text>
                  {routine.id === currentRoutineId && (
                    <Ionicons name="checkmark" size={20} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  todayCard: {
    borderColor: colors.accentDim,
    borderWidth: 1,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  todayTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  editBadge: {
    backgroundColor: colors.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editBadgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 4,
  },
  addExerciseText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  saveBtnText: {
    color: colors.background,
    fontSize: 17,
    fontWeight: '800',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
  },
});
