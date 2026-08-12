export type DatedCompletion = { date: string; completed: boolean; task_id: string };
export type DatedEntry = {
  entry_date: string;
  boolean_value?: boolean | null;
  duration_minutes?: number | null;
  numeric_value?: number | null;
};

export function calculateTaskCompletionRate(
  expectedCount: number,
  completions: DatedCompletion[],
) {
  if (expectedCount === 0) return 0;
  return Math.round(
    (completions.filter((item) => item.completed).length / expectedCount) * 100,
  );
}

export function calculateCurrentStreak(
  entries: DatedEntry[],
  dateField: keyof DatedEntry = "entry_date",
) {
  const dates = new Set(
    entries
      .filter((entry) => entry.boolean_value ?? entry.numeric_value)
      .map((entry) => String(entry[dateField])),
  );
  const cursor = new Date();
  let streak = 0;
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function calculateLongestStreak(entries: DatedEntry[]) {
  const dates = [...new Set(entries.map((entry) => entry.entry_date))].sort();
  let longest = 0;
  let current = 0;
  let previous: Date | undefined;
  for (const date of dates) {
    const parsed = new Date(`${date}T00:00:00`);
    if (previous && (parsed.getTime() - previous.getTime()) / 86400000 === 1)
      current += 1;
    else current = 1;
    longest = Math.max(longest, current);
    previous = parsed;
  }
  return longest;
}

export const calculateAverage = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
export const calculateDurationTotal = (entries: DatedEntry[]) =>
  entries.reduce((sum, entry) => sum + (entry.duration_minutes ?? 0), 0);
export const calculateChangePercentage = (current: number, previous: number) =>
  previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);
export const calculateSleepDuration = (start: string, end: string) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let result = eh * 60 + em - (sh * 60 + sm);
  if (result < 0) result += 1440;
  return result;
};
