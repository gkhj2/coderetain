export type QuestionCategory = 'Regex' | 'SQL' | 'Git' | 'Shell' | 'Design Patterns' | 'Docker' | 'JavaScript';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Question {
  id: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AnswerRecord {
  id?: number;
  questionId: string;
  category: QuestionCategory;
  correct: boolean;
  timestamp: string;
  date: string;
}

export interface DailyStats {
  date: string;
  totalAnswered: number;
  correct: number;
  incorrect: number;
  timeSpentSeconds: number;
}

export interface CategoryAccuracy {
  category: QuestionCategory;
  total: number;
  correct: number;
}
