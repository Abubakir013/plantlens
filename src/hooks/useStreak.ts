import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'plantlens_streak';

interface StreakData {
  currentStreak: number;
  lastActiveDate: string;
}

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function updateStreak(): Promise<void> {
  const today = getToday();
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  const data: StreakData = raw ? JSON.parse(raw) : { currentStreak: 0, lastActiveDate: '' };

  if (data.lastActiveDate === today) return;

  const yesterday = getYesterday();
  const newStreak = data.lastActiveDate === yesterday ? data.currentStreak + 1 : 1;
  await AsyncStorage.setItem(
    STREAK_KEY,
    JSON.stringify({ currentStreak: newStreak, lastActiveDate: today }),
  );
}

export async function loadStreak(): Promise<number> {
  const today = getToday();
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  if (!raw) return 0;
  const { currentStreak, lastActiveDate } = JSON.parse(raw) as StreakData;
  const yesterday = getYesterday();
  if (lastActiveDate === today || lastActiveDate === yesterday) return currentStreak;
  return 0;
}
