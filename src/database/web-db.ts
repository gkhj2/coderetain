// Web-compatible database adapter
// Replaces expo-sqlite on web platform using IndexedDB

type QuestionCategory = 'Regex' | 'SQL' | 'Git' | 'Shell' | 'Design Patterns' | 'Docker' | 'JavaScript';

interface AnswerRecord {
  id?: number;
  questionId: string;
  category: QuestionCategory;
  correct: number;
  timestamp: string;
  date: string;
}

interface DailyStat {
  id?: number;
  date: string;
  totalAnswered: number;
  correct: number;
  incorrect: number;
  timeSpentSeconds: number;
}

interface Setting {
  key: string;
  value: string;
}

const DB_NAME = 'coderetain_db';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('answers')) {
        db.createObjectStore('answers', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('daily_stats')) {
        db.createObjectStore('daily_stats', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

function getAllFromStore<T>(storeName: string, indexName?: string, indexValue?: string): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    let request: IDBRequest;
    if (indexName && indexValue) {
      const index = store.index(indexName);
      request = index.getAll(indexValue);
    } else {
      request = store.getAll();
    }
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T[]);
    tx.oncomplete = () => db.close();
  });
}

function getFromStore<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T | undefined);
    tx.oncomplete = () => db.close();
  });
}

function addToStore(storeName: string, value: any): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(value);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as number);
    tx.oncomplete = () => db.close();
  });
}

function putInStore(storeName: string, value: any): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(value);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    tx.oncomplete = () => db.close();
  });
}

function updateStore(storeName: string, value: any): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(value);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    tx.oncomplete = () => db.close();
  });
}

function getAllFromIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T[]);
    tx.oncomplete = () => db.close();
  });
}

// Initialize settings
async function initDatabase(): Promise<void> {
  const settings = await getAllFromStore<Setting>('settings');
  const defaultSettings: Setting[] = [
    { key: 'reminderEnabled', value: 'false' },
    { key: 'reminderTime', value: '09:00' },
    { key: 'difficulty', value: 'Beginner' },
  ];
  for (const s of defaultSettings) {
    const existing = settings.find((x) => x.key === s.key);
    if (!existing) {
      await putInStore('settings', s);
    }
  }
}

export async function getDatabase(): Promise<boolean> {
  await initDatabase();
  return true;
}

export async function recordAnswer(
  questionId: string,
  category: QuestionCategory,
  correct: boolean
): Promise<void> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timestamp = now.toISOString();

  await addToStore('answers', {
    questionId,
    category,
    correct: correct ? 1 : 0,
    timestamp,
    date: dateStr,
  });

  // Update daily stats
  const allStats = await getAllFromStore<DailyStat>('daily_stats');
  const existing = allStats.find((s) => s.date === dateStr);

  if (existing) {
    existing.totalAnswered += 1;
    existing.correct += correct ? 1 : 0;
    existing.incorrect += correct ? 0 : 1;
    await updateStore('daily_stats', existing);
  } else {
    await addToStore('daily_stats', {
      date: dateStr,
      totalAnswered: 1,
      correct: correct ? 1 : 0,
      incorrect: correct ? 0 : 1,
      timeSpentSeconds: 0,
    });
  }
}

export async function updateTimeSpent(seconds: number): Promise<void> {
  const dateStr = new Date().toISOString().split('T')[0];
  const allStats = await getAllFromStore<DailyStat>('daily_stats');
  const existing = allStats.find((s) => s.date === dateStr);

  if (existing) {
    existing.timeSpentSeconds += seconds;
    await updateStore('daily_stats', existing);
  } else {
    await addToStore('daily_stats', {
      date: dateStr,
      totalAnswered: 0,
      correct: 0,
      incorrect: 0,
      timeSpentSeconds: seconds,
    });
  }
}

async function calculateStreak(): Promise<number> {
  let streak = 0;
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const allStats = await getAllFromStore<DailyStat>('daily_stats');
  const activeDays = allStats.filter((s) => s.totalAnswered > 0).map((s) => s.date).sort().reverse();

  // Check today
  if (activeDays.length === 0) return 0;
  const mostRecent = activeDays[0];
  if (mostRecent !== dateStr) {
    // Check yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (mostRecent !== yesterdayStr) return 0;
  }

  // Count consecutive days
  for (let i = 0; ; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const ds = date.toISOString().split('T')[0];
    if (activeDays.includes(ds)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function getTodayStats(): Promise<{
  totalAnswered: number;
  correct: number;
  timeSpentSeconds: number;
  streak: number;
  completed: boolean;
}> {
  const dateStr = new Date().toISOString().split('T')[0];
  const allStats = await getAllFromStore<DailyStat>('daily_stats');
  const today = allStats.find((s) => s.date === dateStr);

  const totalAnswered = today?.totalAnswered ?? 0;
  const correct = today?.correct ?? 0;
  const timeSpentSeconds = today?.timeSpentSeconds ?? 0;
  const streak = await calculateStreak();
  const completed = totalAnswered >= 5;

  return { totalAnswered, correct, timeSpentSeconds, streak, completed };
}

export async function getLast30DaysStats(): Promise<
  { date: string; active: boolean; correct: number; total: number }[]
> {
  const allStats = await getAllFromStore<DailyStat>('daily_stats');
  const dates: { date: string; active: boolean; correct: number; total: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const stat = allStats.find((s) => s.date === dateStr);

    dates.push({
      date: dateStr,
      active: (stat?.totalAnswered ?? 0) > 0,
      correct: stat?.correct ?? 0,
      total: stat?.totalAnswered ?? 0,
    });
  }

  return dates;
}

export async function getCategoryAccuracy(): Promise<
  { category: QuestionCategory; total: number; correct: number }[]
> {
  const categories: QuestionCategory[] = ['Regex', 'SQL', 'Git', 'Shell', 'Design Patterns', 'Docker', 'JavaScript'];
  const allAnswers = await getAllFromStore<AnswerRecord>('answers');

  return categories.map((cat) => {
    const catAnswers = allAnswers.filter((a) => a.category === cat);
    return {
      category: cat,
      total: catAnswers.length,
      correct: catAnswers.filter((a) => a.correct === 1).length,
    };
  });
}

export async function getTotalQuestionsAnswered(): Promise<number> {
  const allAnswers = await getAllFromStore<AnswerRecord>('answers');
  return allAnswers.length;
}

export async function getSetting(key: string): Promise<string | null> {
  const settings = await getAllFromStore<Setting>('settings');
  const s = settings.find((x) => x.key === key);
  return s?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await putInStore('settings', { key, value });
}

export async function getWrongQuestions(): Promise<string[]> {
  const allAnswers = await getAllFromStore<AnswerRecord>('answers');
  const dateStr = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString();

  const wrongIds = allAnswers
    .filter((a) => a.correct === 0 && a.timestamp > cutoff)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .map((a) => a.questionId);

  const todayIds = new Set(
    allAnswers.filter((a) => a.date === dateStr).map((a) => a.questionId)
  );

  return [...new Set(wrongIds.filter((id) => !todayIds.has(id)))];
}
