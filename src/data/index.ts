import { Question } from '../types';
import { bundledQuestions } from './questions';
import { bundledQuestionsZh } from './questions-zh';

export function getQuestions(lang: 'en' | 'zh'): Question[] {
  return lang === 'zh' ? bundledQuestionsZh : bundledQuestions;
}
