/**
 * Local date utility — fixes bug #9 (UTC dates breaking non-UTC users).
 * All date keys in the app use local time, not UTC.
 */

/**
 * Returns a YYYY-MM-DD string in the user's local timezone.
 * This prevents sessions before 05:30 IST from being filed under the previous day.
 */
export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats elapsed seconds as MM:SS.
 */
export function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Formats a date as a human-readable local string.
 */
export function formatDateLabel(dateStr: string): string {
  const today = localDateKey();
  const yesterday = localDateKey(new Date(Date.now() - 86400000));
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
