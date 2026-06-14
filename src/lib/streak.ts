import { useEffect, useState } from "react";

const KEY = "ph-activity-days";

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function computeStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date();
  // allow streak to count from today; if today missing, start from yesterday
  if (!set.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(todayKey(cursor))) return 0;
  }
  while (set.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function useStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    let days: string[] = [];
    try {
      days = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    } catch {
      days = [];
    }
    const today = todayKey();
    if (!days.includes(today)) {
      days = [...days, today].slice(-400);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(days));
      } catch {
        /* ignore */
      }
    }
    setStreak(computeStreak(days));
  }, []);

  return streak;
}
