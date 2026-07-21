export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface Routine {
  id: string;
  name: string;
  defaultExercises: string[];
  isRestDay?: boolean;
}

export interface Session {
  id: string;
  routineId: string;
  dateIso: string;
}

export interface WorkoutSet {
  id: string;
  sessionId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  isWarmup: boolean;
  order: number;
  completed?: boolean;
}

export interface AppState {
  weeklyPlan: Record<DayOfWeek, string | null>;
  routines: Record<string, Routine>;
  sessions: Record<string, Session>;
  workoutSets: Record<string, WorkoutSet>;
  hasCompletedOnboarding: boolean;
}

export interface SessionWithSets {
  session: Session;
  sets: WorkoutSet[];
}

export interface ExerciseDraft {
  exerciseName: string;
  sets: SetDraft[];
}

export interface SetDraft {
  id: string;
  weight: string;
  reps: string;
  isWarmup: boolean;
  completed: boolean;
  placeholderWeight?: string;
  placeholderReps?: string;
}
