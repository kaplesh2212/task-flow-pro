export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateNDaysAgoISO(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export function lastNDates(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(dateNDaysAgoISO(i));
  }
  return out;
}

export function dayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

export function computeStreak(sortedDates: string[]): number {
  // sortedDates: completed dates ascending, format YYYY-MM-DD
  const set = new Set(sortedDates);
  let streak = 0;
  const today = new Date();
  // If today not completed, start from yesterday so streak doesn't break early in day
  let cursor = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    ),
  );
  if (!set.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
