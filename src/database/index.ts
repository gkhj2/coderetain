// Database adapter — auto-switches between native (expo-sqlite) and web (IndexedDB)
import { Platform } from 'react-native';

// Re-export everything from the platform-specific implementation
export type QuestionCategory = 'Regex' | 'SQL' | 'Git' | 'Shell' | 'Design Patterns' | 'Docker' | 'JavaScript';
export interface DailyStats {
  totalAnswered: number;
  correct: number;
  timeSpentSeconds: number;
  streak: number;
  completed: boolean;
}

const isWeb = Platform.OS === 'web';

let impl: typeof import('./db') | typeof import('./web-db');

if (isWeb) {
  impl = require('./web-db');
} else {
  impl = require('./db');
}

export const getDatabase = impl.getDatabase;
export const recordAnswer = impl.recordAnswer;
export const updateTimeSpent = impl.updateTimeSpent;
export const getTodayStats = impl.getTodayStats;
export const getLast30DaysStats = impl.getLast30DaysStats;
export const getCategoryAccuracy = impl.getCategoryAccuracy;
export const getTotalQuestionsAnswered = impl.getTotalQuestionsAnswered;
export const getSetting = impl.getSetting;
export const setSetting = impl.setSetting;
export const getWrongQuestions = impl.getWrongQuestions;
