import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SetDraft } from '../types';
import { colors } from '../theme/colors';

interface SetInputProps {
  set: SetDraft;
  setNumber: number;
  onChange: (updates: Partial<SetDraft>) => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

export function SetInput({
  set,
  setNumber,
  onChange,
  onRemove,
  showRemove,
}: SetInputProps) {
  const handleToggleComplete = () => {
    const next = !set.completed;
    onChange({ completed: next });
    if (next) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const weightPlaceholder = set.placeholderWeight
    ? `${set.placeholderWeight}kg`
    : 'kg';
  const repsPlaceholder = set.placeholderReps ?? 'reps';

  return (
    <View style={[styles.row, set.isWarmup && styles.warmupRow]}>
      <TouchableOpacity
        style={[styles.checkBtn, set.completed && styles.checkBtnDone]}
        onPress={handleToggleComplete}
      >
        {set.completed && (
          <Ionicons name="checkmark" size={16} color={colors.background} />
        )}
      </TouchableOpacity>

      <Text style={styles.setNum}>{setNumber}</Text>

      <TextInput
        style={styles.input}
        value={set.weight}
        onChangeText={(v) => onChange({ weight: v })}
        placeholder={weightPlaceholder}
        placeholderTextColor={colors.placeholder}
        keyboardType="decimal-pad"
        selectTextOnFocus
      />

      <Text style={styles.times}>×</Text>

      <TextInput
        style={styles.input}
        value={set.reps}
        onChangeText={(v) => onChange({ reps: v })}
        placeholder={repsPlaceholder}
        placeholderTextColor={colors.placeholder}
        keyboardType="decimal-pad"
        selectTextOnFocus
      />

      <TouchableOpacity
        style={[styles.warmupBtn, set.isWarmup && styles.warmupBtnActive]}
        onPress={() => onChange({ isWarmup: !set.isWarmup })}
      >
        <Text style={[styles.warmupText, set.isWarmup && styles.warmupTextActive]}>
          W
        </Text>
      </TouchableOpacity>

      {showRemove && onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  warmupRow: {
    opacity: 0.7,
  },
  checkBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  setNum: {
    color: colors.textMuted,
    fontSize: 14,
    width: 16,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  times: {
    color: colors.textMuted,
    fontSize: 16,
  },
  warmupBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warmupBtnActive: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  warmupText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  warmupTextActive: {
    color: colors.background,
  },
  removeBtn: {
    padding: 2,
  },
});
