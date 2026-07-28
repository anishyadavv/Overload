import {
  AppState,
  DayOfWeek,
  ExerciseDraft,
  Routine,
  Session,
  SessionWithSets,
  WorkoutSet,
} from '../types';
import { getDayOfWeekFromDate, getTodayIso } from './dateHelpers';
import { generateId } from './id';
import { parseISO, startOfDay } from 'date-fns';

export function getTodayRoutineId(
  weeklyPlan: Record<DayOfWeek, string | null>,
  date: Date = new Date(),
): string | null {
  const dayKey = getDayOfWeekFromDate(date);
  return weeklyPlan[dayKey] ?? null;
}

export function getLastSession(
  routineId: string,
  sessions: Record<string, Session>,
  workoutSets: Record<string, WorkoutSet>,
  excludeToday = true,
): SessionWithSets | null {
  const todayStart = startOfDay(new Date()).getTime();

  const routineSessions = Object.values(sessions)
    .filter((s) => s.routineId === routineId)
    .filter((s) => {
      if (!excludeToday) return true;
      return startOfDay(parseISO(s.dateIso)).getTime() < todayStart;
    })
    .sort((a, b) => parseISO(b.dateIso).getTime() - parseISO(a.dateIso).getTime());

  const session = routineSessions[0];
  if (!session) return null;

  const sets = Object.values(workoutSets)
    .filter((ws) => ws.sessionId === session.id)
    .sort((a, b) => a.order - b.order);

  return { session, sets };
}

export function getTodaySession(
  routineId: string,
  sessions: Record<string, Session>,
): Session | null {
  const todayIso = getTodayIso();
  return (
    Object.values(sessions).find(
      (s) => s.routineId === routineId && s.dateIso === todayIso,
    ) ?? null
  );
}

export function getSessionSets(
  sessionId: string,
  workoutSets: Record<string, WorkoutSet>,
): WorkoutSet[] {
  return Object.values(workoutSets)
    .filter((ws) => ws.sessionId === sessionId)
    .sort((a, b) => a.order - b.order);
}

export function getSessionsForRoutine(
  routineId: string,
  sessions: Record<string, Session>,
): Session[] {
  return Object.values(sessions)
    .filter((s) => s.routineId === routineId)
    .sort((a, b) => parseISO(b.dateIso).getTime() - parseISO(a.dateIso).getTime());
}

export function groupSetsByExercise(sets: WorkoutSet[]): Map<string, WorkoutSet[]> {
  const map = new Map<string, WorkoutSet[]>();
  for (const set of sets) {
    const existing = map.get(set.exerciseName) ?? [];
    existing.push(set);
    map.set(set.exerciseName, existing);
  }
  return map;
}

export function setsToExerciseDrafts(
  sets: WorkoutSet[],
  lastSets?: WorkoutSet[],
): ExerciseDraft[] {
  const grouped = groupSetsByExercise(sets);
  const lastGrouped = lastSets ? groupSetsByExercise(lastSets) : new Map();

  const exercises = Array.from(grouped.keys());
  if (exercises.length === 0 && lastSets) {
    return setsToExerciseDrafts([], lastSets);
  }

  const allExerciseNames =
    exercises.length > 0
      ? exercises
      : lastSets
        ? Array.from(groupSetsByExercise(lastSets).keys())
        : [];

  return allExerciseNames.map((name) => {
    const exerciseSets = grouped.get(name) ?? [];
    const lastExerciseSets = lastGrouped.get(name) ?? [];

    if (exerciseSets.length === 0) {
      return {
        id: generateId(),
        exerciseName: name,
        sets: lastExerciseSets.map((ls: WorkoutSet, i: number) => ({
          id: `draft-${name}-${i}`,
          weight: '',
          reps: '',
          isWarmup: false,
          completed: false,
          placeholderWeight: String(ls.weight),
          placeholderReps: String(ls.reps),
        })),
      };
    }

    return {
      id: generateId(),
      exerciseName: name,
      sets: exerciseSets.map((s, i) => {
        const last = lastExerciseSets[i];
        return {
          id: s.id,
          weight: s.weight > 0 ? String(s.weight) : '',
          reps: s.reps > 0 ? String(s.reps) : '',
          isWarmup: s.isWarmup,
          completed: s.completed ?? false,
          placeholderWeight: last ? String(last.weight) : undefined,
          placeholderReps: last ? String(last.reps) : undefined,
        };
      }),
    };
  });
}

export function buildDraftFromLastSession(
  lastSession: SessionWithSets | null,
  routine: Routine,
): ExerciseDraft[] {
  if (lastSession && lastSession.sets.length > 0) {
    return setsToExerciseDrafts([], lastSession.sets);
  }

  if (routine.defaultExercises.length > 0) {
    return routine.defaultExercises.map((name) => ({
      id: generateId(),
      exerciseName: name,
      sets: [
        {
          id: `draft-${name}-0`,
          weight: '',
          reps: '',
          isWarmup: false,
          completed: false,
        },
      ],
    }));
  }

  return [
    {
      id: generateId(),
      exerciseName: 'Exercise 1',
      sets: [
        {
          id: 'draft-exercise-1-0',
          weight: '',
          reps: '',
          isWarmup: false,
          completed: false,
        },
      ],
    },
  ];
}

export function getAllExerciseNames(
  workoutSets: Record<string, WorkoutSet>,
): string[] {
  const names = new Set<string>();
  Object.values(workoutSets).forEach((ws) => names.add(ws.exerciseName));
  return Array.from(names).sort();
}

export function calculateSetVolume(set: WorkoutSet): number {
  if (set.isWarmup) return 0;
  return set.weight * set.reps;
}

export function calculateSessionVolume(sets: WorkoutSet[]): number {
  return sets.reduce((sum, s) => sum + calculateSetVolume(s), 0);
}
