import { format, getDay, isToday, parseISO, startOfDay } from 'date-fns';
import { DayOfWeek } from '../types';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

/** Maps JS getDay() (0=Sun) to our DayOfWeek keys (Mon-first). */
export function getDayOfWeekFromDate(date: Date = new Date()): DayOfWeek {
  const jsDay = getDay(date);
  const index = jsDay === 0 ? 6 : jsDay - 1;
  return DAYS_OF_WEEK[index];
}

export function formatSessionDate(dateIso: string): string {
  return format(parseISO(dateIso), 'dd MMM');
}

export function formatFullDate(dateIso: string): string {
  return format(parseISO(dateIso), 'EEEE, dd MMM yyyy');
}

export function getTodayIso(): string {
  return startOfDay(new Date()).toISOString();
}

export function isSessionToday(dateIso: string): boolean {
  return isToday(parseISO(dateIso));
}

export function formatDayHeader(date: Date = new Date()): string {
  const dayKey = getDayOfWeekFromDate(date);
  return DAY_LABELS[dayKey];
}
