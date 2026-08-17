import { format, startOfDay } from 'date-fns';

/**
 * Returns today's date as 'YYYY-MM-DD' in local timezone.
 * All date strings across the app use this format for consistency.
 * For timezone safety, we use startOfDay to ensure midnight boundary.
 */
export function getTodayString() {
  return format(startOfDay(new Date()), 'yyyy-MM-dd');
}

/**
 * Converts any Date to 'YYYY-MM-DD' string format.
 */
export function toDateString(date) {
  return format(startOfDay(date), 'yyyy-MM-dd');
}
