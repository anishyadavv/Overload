import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Routine } from '../types';
import { colors } from '../theme/colors';

interface DayRoutineRowProps {
  dayLabel: string;
  selectedRoutineId: string | null;
  routines: Routine[];
  onSelect: (routineId: string | null) => void;
}

export function DayRoutineRow({
  dayLabel,
  selectedRoutineId,
  routines,
  onSelect,
}: DayRoutineRowProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const selected = routines.find((r) => r.id === selectedRoutineId);

  return (
    <>
      <View style={styles.row}>
        <Text style={styles.dayLabel}>{dayLabel}</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setPickerVisible(true)}
        >
          <Text
            style={[styles.pickerText, !selected && styles.placeholder]}
            numberOfLines={1}
          >
            {selected?.name ?? 'Select routine'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Modal visible={pickerVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{dayLabel}</Text>
            <ScrollView>
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onSelect(null);
                  setPickerVisible(false);
                }}
              >
                <Text style={styles.optionTextMuted}>None</Text>
              </TouchableOpacity>
              {routines.map((routine) => (
                <TouchableOpacity
                  key={routine.id}
                  style={[
                    styles.option,
                    routine.id === selectedRoutineId && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onSelect(routine.id);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{routine.name}</Text>
                  {routine.id === selectedRoutineId && (
                    <Ionicons name="checkmark" size={20} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    width: 110,
  },
  picker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerText: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
  },
  placeholder: {
    color: colors.textMuted,
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
  optionTextMuted: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
