import * as SQLite from 'expo-sqlite';
import { AnswerRecord, CategoryAccuracy, QuestionCategory } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('coderetain.db', { useNewConnection: true });
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      questionId TEXT NOT NULL,
      category TEXT NOT NULL,
      correct INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      date TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      totalAnswered INTEGER DEFAULT 0,
      correct INTEGER DEFAULT 0,
      incorrect INTEGER DEFAULT 0,
      timeSpentSeconds INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  // Insert default settings if not present
  const reminderEnabled = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'reminderEnabled'"
  );
  if (!reminderEnabled) {
    await database.runAsync(
      "INSERT INTO settings (key, value) VALUES ('reminderEnabled', 'false')"
    );
  }
  const reminderTime = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'reminderTime'"
  );
  if (!reminderTime) {
    await database.runAsync(
      "INSERT INTO settings (key, value) VALUES ('reminderTime', '09:00')"
    );
  }
  const difficulty = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'difficulty'"
  );
  if (!difficulty) {
    await database.runAsync(
      "INSERT INTO settings (key, value) VALUES ('difficulty', 'Beginner')"
    );
  }
}

export async function recordAnswer(
  questionId: string,
  category: QuestionCategory,
  correct: boolean
): Promise<void> {
  const database = await getDatabase();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timestamp = now.toISOString();

  await database.runAsync(
    'INSERT INTO answers (questionId, category, correct, timestamp, date) VALUES (?, ?, ?, ?, ?)',
    [questionId, category, correct ? 1 : 0, timestamp, dateStr]
  );

  // Update daily stats
  const existing = await database.getFirstAsync<{
    id: number;
    totalAnswered: number;
    correct: number;
    incorrect: number;
  }>('SELECT * FROM daily_stats WHERE date = ?', dateStr);

  if (existing) {
    await database.runAsync(
      'UPDATE daily_stats SET totalAnswered = totalAnswered + 1, correct = correct + ?, incorrect = incorrect + ? WHERE date = ?',
      [correct ? 1 : 0, correct ? 0 : 1, dateStr]
    );
  } else {
    await database.runAsync(
      'INSERT INTO daily_stats (date, totalAnswered, correct, incorrect, timeSpentSeconds) VALUES (?, 1, ?, ?, 0)',
      [dateStr, correct ? 1 : 0, correct ? 0 : 1]
    );
  }
}

export async function updateTimeSpent(seconds: number): Promise<void> {
  const database = await getDatabase();
  const dateStr = new Date().toISOString().split('T')[0];

  const existing = await database.getFirstAsync<{ id: number }>(
    'SELECT id FROM daily_stats WHERE date = ?',
    dateStr
  );
  if (existing) {
    await database.runAsync(
      'UPDATE daily_stats SET timeSpentSeconds = timeSpentSeconds + ? WHERE date = ?',
      [seconds, dateStr]
    );
  } else {
    await database.runAsync(
      'INSERT INTO daily_stats (date, totalAnswered, correct, incorrect, timeSpentSeconds) VALUES (?, 0, 0, 0, ?)',
      [dateStr, seconds]
    );
  }
}

export async function getTodayStats(): Promise<{
  totalAnswered: number;
  correct: number;
  timeSpentSeconds: number;
  streak: number;
  completed: boolean;
}> {
  const database = await getDatabase();
  const dateStr = new Date().toISOString().split('T')[0];

  const row = await database.getFirstAsync<{
    totalAnswered: number;
    correct: number;
    incorrect: number;
    timeSpentSeconds: number;
  }>('SELECT * FROM daily_stats WHERE date = ?', dateStr);

  const totalAnswered = row?.totalAnswered ?? 0;
  const correct = row?.correct ?? 0;
  const timeSpentSeconds = row?.timeSpentSeconds ?? 0;

  // Calculate streak
  const streak = await calculateStreak(database);

  // Check if all questions for today are done (aim for 5 questions per day)
  const completed = totalAnswered >= 5;

  return { totalAnswered, correct, timeSpentSeconds, streak, completed };
}

async function calculateStreak(database: SQLite.SQLiteDatabase): Promise<number> {
  let streak = 0;
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  // Check today first
  const todayStats = await database.getFirstAsync<{ totalAnswered: number }>(
    'SELECT totalAnswered FROM daily_stats WHERE date = ? AND totalAnswered > 0',
    dateStr
  );

  if (!todayStats) {
    // If no activity today, check yesterday to see if streak is still alive
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayStats = await database.getFirstAsync<{ totalAnswered: number }>(
      'SELECT totalAnswered FROM daily_stats WHERE date = ? AND totalAnswered > 0',
      yesterdayStr
    );
    if (!yesterdayStats) return 0;
  }

  // Count consecutive days going backwards
  for (let i = 0; ; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const ds = date.toISOString().split('T')[0];
    const stats = await database.getFirstAsync<{ totalAnswered: number }>(
      'SELECT totalAnswered FROM daily_stats WHERE date = ? AND totalAnswered > 0',
      ds
    );
    if (stats) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export async function getLast30DaysStats(): Promise<
  { date: string; active: boolean; correct: number; total: number }[]
> {
  const database = await getDatabase();
  const dates: { date: string; active: boolean; correct: number; total: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const stats = await database.getFirstAsync<{
      totalAnswered: number;
      correct: number;
    }>('SELECT totalAnswered, correct FROM daily_stats WHERE date = ?', dateStr);

    dates.push({
      date: dateStr,
      active: (stats?.totalAnswered ?? 0) > 0,
      correct: stats?.correct ?? 0,
      total: stats?.totalAnswered ?? 0,
    });
  }

  return dates;
}

export async function getCategoryAccuracy(): Promise<CategoryAccuracy[]> {
  const database = await getDatabase();
  const categories: QuestionCategory[] = [
    'Regex',
    'SQL',
    'Git',
    'Shell',
    'Design Patterns',
    'Docker',
    'JavaScript',
  ];

  const result: CategoryAccuracy[] = [];
  for (const cat of categories) {
    const row = await database.getFirstAsync<{
      total: number;
      correct: number;
    }>(
      'SELECT COUNT(*) as total, SUM(correct) as correct FROM answers WHERE category = ?',
      cat
    );
    result.push({
      category: cat,
      total: row?.total ?? 0,
      correct: row?.correct ?? 0,
    });
  }

  return result;
}

export async function getTotalQuestionsAnswered(): Promise<number> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM answers'
  );
  return row?.count ?? 0;
}

export async function getSetting(key: string): Promise<string | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    key
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}

export async function getWrongQuestions(): Promise<string[]> {
  const database = await getDatabase();
  const dateStr = new Date().toISOString().split('T')[0];

  // Get questions answered wrong recently (last 7 days) for spaced repetition
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString();

  const rows = await database.getAllAsync<{ questionId: string }>(
    `SELECT DISTINCT questionId FROM answers 
     WHERE correct = 0 AND timestamp > ? 
     ORDER BY timestamp DESC`,
    cutoff
  );

  if (rows.length === 0) return [];

  // Prioritize recently wrong questions
  // Also get questions answered today to not repeat them
  const todayRows = await database.getAllAsync<{ questionId: string }>(
    "SELECT DISTINCT questionId FROM answers WHERE date = ?",
    dateStr
  );

  const todayIds = new Set(todayRows.map((r: { questionId: string }) => r.questionId));
  const wrongIds = rows.map((r: { questionId: string }) => r.questionId).filter((id: string) => !todayIds.has(id));

  return wrongIds;
}

