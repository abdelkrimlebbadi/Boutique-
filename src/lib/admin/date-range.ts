// Turns an inclusive `to` date (YYYY-MM-DD) into an exclusive upper bound
// timestamp, so `created_at >= from AND created_at < nextDayIso(to)`
// captures the whole `to` day regardless of time-of-day.
export function nextDayIso(dateIso: string): string {
  const date = new Date(`${dateIso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString();
}
