/**
 * Date utility functions
 */

import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  parseISO,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  startOfDay,
  endOfDay,
  subDays,
  subHours,
  addHours,
} from 'date-fns';

/**
 * Format a date for display in logs and tables
 * Shows "Today", "Yesterday", or the full date
 */
export function formatLogDate(dateString: string): string {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }

  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }

  return format(date, 'MMM d, yyyy h:mm a');
}

/**
 * Format a date as relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a timestamp for API requests (ISO format)
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Format a date for display in headers (e.g., "Friday, January 16")
 */
export function formatDateHeader(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'EEEE, MMMM d');
}

/**
 * Format a time only (e.g., "2:30 PM")
 */
export function formatTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'h:mm a');
}

/**
 * Format a short date (e.g., "Jan 16")
 */
export function formatShortDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d');
}

/**
 * Format a full date and time (e.g., "January 16, 2026 at 2:30 PM")
 */
export function formatFullDateTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "MMMM d, yyyy 'at' h:mm a");
}

/**
 * Get duration between two timestamps in human-readable format
 */
export function formatDuration(startString: string, endString: string): string {
  const start = parseISO(startString);
  const end = parseISO(endString);

  const minutes = differenceInMinutes(end, start);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = differenceInHours(end, start);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = differenceInDays(end, start);
  return `${days}d ${hours % 24}h`;
}

/**
 * Format duration from seconds
 */
export function formatDurationFromSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Get start of today
 */
export function getStartOfToday(): Date {
  return startOfDay(new Date());
}

/**
 * Get end of today
 */
export function getEndOfToday(): Date {
  return endOfDay(new Date());
}

/**
 * Get date range for the last N days
 */
export function getLastNDays(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = startOfDay(subDays(end, days));
  return { start, end };
}

/**
 * Get date range for the last N hours
 */
export function getLastNHours(hours: number): { start: Date; end: Date } {
  const end = new Date();
  const start = subHours(end, hours);
  return { start, end };
}

/**
 * Check if a date is within the last N minutes
 */
export function isWithinLastMinutes(dateString: string, minutes: number): boolean {
  const date = parseISO(dateString);
  const now = new Date();
  return differenceInMinutes(now, date) <= minutes;
}

/**
 * Check if a date is expired (past the expiration date)
 */
export function isExpired(expiresAt: string | undefined): boolean {
  if (!expiresAt) return false;
  return parseISO(expiresAt) < new Date();
}

/**
 * Generate timestamps for simulated data
 */
export function generateTimestamp(hoursAgo: number = 0): string {
  const date = subHours(new Date(), hoursAgo);
  return toISOString(date);
}

/**
 * Generate a random timestamp within a date range
 */
export function generateRandomTimestamp(start: Date, end: Date): string {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime).toISOString();
}

/**
 * Format for chart axis labels
 */
export function formatChartTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'HH:mm');
}

/**
 * Format for chart axis labels (date)
 */
export function formatChartDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d');
}
