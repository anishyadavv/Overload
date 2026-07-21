import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AppState,
  DayOfWeek,
  ExerciseDraft,
  Routine,
  Session,
  WorkoutSet,
} from '../types';
import { persistStorage } from './persistStorage';
import { generateId } from '../utils/id';
import { getTodayIso } from '../utils/dateHelpers';
import { DAYS_OF_WEEK } from '../utils/dateHelpers';

const emptyWeeklyPlan = (): Record<DayOfWeek, string | null> => ({
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
  sunday: null,
});

interface WorkoutActions {
  setWeeklyPlanDay: (day: DayOfWeek, routineId: string | null) => void;
  setWeeklyPlan: (plan: Record<DayOfWeek, string | null>) => void;
  addRoutine: (name: string, defaultExercises?: string[], isRestDay?: boolean) => string;
  updateRoutine: (id: string, updates: Partial<Omit<Routine, 'id'>>) => void;
  deleteRoutine: (id: string) => void;
  completeOnboarding: () => void;
  saveSession: (
    routineId: string,
    exercises: ExerciseDraft[],
    existingSessionId?: string,
  ) => string;
  deleteSession: (sessionId: string) => void;
}

type WorkoutStore = AppState & WorkoutActions;

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      weeklyPlan: emptyWeeklyPlan(),
      routines: {},
      sessions: {},
      workoutSets: {},
      hasCompletedOnboarding: false,

      setWeeklyPlanDay: (day, routineId) =>
        set((state) => ({
          weeklyPlan: { ...state.weeklyPlan, [day]: routineId },
        })),

      setWeeklyPlan: (plan) => set({ weeklyPlan: plan }),

      addRoutine: (name, defaultExercises = [], isRestDay = false) => {
        const id = generateId();
        const routine: Routine = { id, name, defaultExercises, isRestDay };
        set((state) => ({
          routines: { ...state.routines, [id]: routine },
        }));
        return id;
      },

      updateRoutine: (id, updates) =>
        set((state) => {
          const existing = state.routines[id];
          if (!existing) return state;
          return {
            routines: {
              ...state.routines,
              [id]: { ...existing, ...updates },
            },
          };
        }),

      deleteRoutine: (id) =>
        set((state) => {
          const { [id]: _removed, ...routines } = state.routines;
          const weeklyPlan = { ...state.weeklyPlan };
          DAYS_OF_WEEK.forEach((day) => {
            if (weeklyPlan[day] === id) weeklyPlan[day] = null;
          });
          return { routines, weeklyPlan };
        }),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      saveSession: (routineId, exercises, existingSessionId) => {
        const sessionId = existingSessionId ?? generateId();
        const dateIso = getTodayIso();
        const session: Session = { id: sessionId, routineId, dateIso };

        const newSets: Record<string, WorkoutSet> = {};
        let order = 0;

        if (existingSessionId) {
          const oldSetIds = Object.values(get().workoutSets)
            .filter((ws) => ws.sessionId === existingSessionId)
            .map((ws) => ws.id);
          const workoutSets = { ...get().workoutSets };
          oldSetIds.forEach((id) => delete workoutSets[id]);
          set({ workoutSets });
        }

        for (const exercise of exercises) {
          for (const setDraft of exercise.sets) {
            const weight = parseFloat(setDraft.weight) || 0;
            const reps = parseInt(setDraft.reps, 10) || 0;
            if (weight === 0 && reps === 0) continue;

            const setId = setDraft.id.startsWith('draft-')
              ? generateId()
              : setDraft.id;
            newSets[setId] = {
              id: setId,
              sessionId,
              exerciseName: exercise.exerciseName,
              weight,
              reps,
              isWarmup: setDraft.isWarmup,
              order: order++,
              completed: setDraft.completed,
            };
          }
        }

        set((state) => ({
          sessions: { ...state.sessions, [sessionId]: session },
          workoutSets: { ...state.workoutSets, ...newSets },
        }));

        return sessionId;
      },

      deleteSession: (sessionId) =>
        set((state) => {
          const { [sessionId]: _removed, ...sessions } = state.sessions;
          const workoutSets = { ...state.workoutSets };
          Object.values(workoutSets)
            .filter((ws) => ws.sessionId === sessionId)
            .forEach((ws) => delete workoutSets[ws.id]);
          return { sessions, workoutSets };
        }),
    }),
    {
      name: 'workout-log-state',
      storage: createJSONStorage(() => persistStorage),
    },
  ),
);
