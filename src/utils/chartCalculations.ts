import { parseISO } from 'date-fns';
import { WorkoutSet } from '../types';
import { calculateSetVolume } from './selectors';

export interface ProgressDataPoint {
  dateIso: string;
  dateLabel: string;
  maxWeight: number;
  totalVolume: number;
  bestSet: string;
}

export function getExerciseProgress(
  exerciseName: string,
  workoutSets: Record<string, WorkoutSet>,
  sessions: Record<string, { id: string; dateIso: string }>,
): ProgressDataPoint[] {
  const exerciseSets = Object.values(workoutSets).filter(
    (ws) => ws.exerciseName === exerciseName && !ws.isWarmup,
  );

  const bySession = new Map<string, WorkoutSet[]>();
  for (const set of exerciseSets) {
    const existing = bySession.get(set.sessionId) ?? [];
    existing.push(set);
    bySession.set(set.sessionId, existing);
  }

  const points: ProgressDataPoint[] = [];

  for (const [sessionId, sets] of bySession) {
    const session = sessions[sessionId];
    if (!session) continue;

    const maxWeight = Math.max(...sets.map((s) => s.weight));
    const totalVolume = sets.reduce((sum, s) => sum + calculateSetVolume(s), 0);
    const best = sets.reduce((a, b) =>
      a.weight * a.reps > b.weight * b.reps ? a : b,
    );

    points.push({
      dateIso: session.dateIso,
      dateLabel: parseISO(session.dateIso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      }),
      maxWeight,
      totalVolume,
      bestSet: `${best.weight}kg × ${best.reps}`,
    });
  }

  return points.sort(
    (a, b) => parseISO(a.dateIso).getTime() - parseISO(b.dateIso).getTime(),
  );
}

export function getExerciseStats(points: ProgressDataPoint[]) {
  if (points.length === 0) {
    return { personalBest: 0, latestWeight: 0, totalSessions: 0 };
  }
  const personalBest = Math.max(...points.map((p) => p.maxWeight));
  const latestWeight = points[points.length - 1].maxWeight;
  return { personalBest, latestWeight, totalSessions: points.length };
}
