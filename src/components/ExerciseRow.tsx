import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseDraft, SetDraft } from '../types';
import { SetInput } from './SetInput';
import { colors } from '../theme/colors';
import { generateId } from '../utils/id';

interface ExerciseRowProps {
  exercise: ExerciseDraft;
  onChange: (exercise: ExerciseDraft) => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

export function ExerciseRow({
  exercise,
  onChange,
  onRemove,
  showRemove,
}: ExerciseRowProps) {
  const updateSet = (index: number, updates: Partial<SetDraft>) => {
    const sets = exercise.sets.map((s, i) =>
      i === index ? { ...s, ...updates } : s,
    );
    onChange({ ...exercise, sets });
  };

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: SetDraft = {
      id: generateId(),
      weight: '',
      reps: '',
      isWarmup: false,
      completed: false,
      placeholderWeight: lastSet?.placeholderWeight,
      placeholderReps: lastSet?.placeholderReps,
    };
    onChange({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const removeSet = (index: number) => {
    if (exercise.sets.length <= 1) return;
    onChange({
      ...exercise,
      sets: exercise.sets.filter((_, i) => i !== index),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.exerciseName}
          value={exercise.exerciseName}
          onChangeText={(name) => onChange({ ...exercise, exerciseName: name })}
          placeholder="Exercise name"
          placeholderTextColor={colors.placeholder}
          selectTextOnFocus
        />
        {showRemove && onRemove && (
          <TouchableOpacity onPress={onRemove}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      {exercise.sets.map((set, index) => (
        <SetInput
          key={set.id}
          set={set}
          setNumber={index + 1}
          onChange={(updates) => updateSet(index, updates)}
          onRemove={() => removeSet(index)}
          showRemove={exercise.sets.length > 1}
        />
      ))}

      <TouchableOpacity style={styles.addSetBtn} onPress={addSet}>
        <Ionicons name="add" size={18} color={colors.accent} />
        <Text style={styles.addSetText}>Add set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exerciseName: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  addSetText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});
