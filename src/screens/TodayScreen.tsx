import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ChallengeCard from '../components/ChallengeCard';
import { Question, QuestionCategory } from '../types';
import { bundledQuestions } from '../data/questions';
import { darkTheme, lightTheme, ThemeColors } from '../theme/colors';
import {
  getTodayStats,
  recordAnswer,
  updateTimeSpent,
  getWrongQuestions,
  getSetting,
} from '../database/db';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function TodayScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme: ThemeColors = isDark ? darkTheme : lightTheme;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [difficulty, setDifficulty] = useState('Beginner');
  const [sessionStart, setSessionStart] = useState(Date.now());

  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadSession = useCallback(async () => {
    const savedDifficulty = await getSetting('difficulty');
    const diff = savedDifficulty || 'Beginner';
    setDifficulty(diff);

    // Get wrong questions for spaced repetition
    const wrongIds = await getWrongQuestions(0);

    // Filter questions by difficulty
    const filtered = bundledQuestions.filter((q) => {
      if (diff === 'Beginner') return q.difficulty === 'Beginner';
      if (diff === 'Intermediate')
        return q.difficulty === 'Beginner' || q.difficulty === 'Intermediate';
      return true; // Advanced includes all
    });

    // Pick questions: prioritize wrong ones, then random
    const wrongQuestions = filtered.filter((q) => wrongIds.includes(q.id));
    const otherQuestions = filtered.filter((q) => !wrongIds.includes(q.id));

    const selected: Question[] = [];

    // Add up to 3 wrong questions
    const shuffledWrong = shuffleArray(wrongQuestions);
    selected.push(...shuffledWrong.slice(0, Math.min(3, shuffledWrong.length)));

    // Fill remaining with other questions
    const shuffledOthers = shuffleArray(otherQuestions);
    const remaining = 5 - selected.length;
    selected.push(...shuffledOthers.slice(0, remaining));

    setQuestions(shuffleArray(selected));
    setCurrentIndex(0);
    setSelectedIndex(null);
    setShowResult(false);
    setCompleted(false);
    setSessionStart(Date.now());
  }, []);

  const loadStats = useCallback(async () => {
    const stats = await getTodayStats();
    setStreak(stats.streak);
    setTimeSpent(stats.timeSpentSeconds);
    setTotalAnswered(stats.totalAnswered);
    setCompleted(stats.completed);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSession();
      loadStats();

      // Track time
      timerRef.current = setInterval(async () => {
        const now = Date.now();
        const elapsed = Math.floor((now - sessionStart) / 1000);
        if (elapsed > 0) {
          setTimeSpent((prev) => prev + 1);
        }
      }, 10000); // Update every 10 seconds

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      };
    }, [loadSession, loadStats])
  );

  const handleAnswer = async (index: number) => {
    if (showResult || completed) return;
    setSelectedIndex(index);
    setShowResult(true);

    const currentQuestion = questions[currentIndex];
    const correct = index === currentQuestion.correctIndex;

    await recordAnswer(currentQuestion.id, currentQuestion.category, correct);
    await updateTimeSpent(5); // Assume 5 seconds per question

    // Auto-advance after 2 seconds
    autoAdvanceRef.current = setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedIndex(null);
        setShowResult(false);
      } else {
        setCompleted(true);
        loadStats();
      }
    }, 2000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (completed) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.completedContainer}>
          <Ionicons name="trophy" size={80} color="#FFB74D" />
          <Text style={[styles.completedTitle, { color: theme.text }]}>
            Challenge Complete!
          </Text>
          <Text style={[styles.completedSubtitle, { color: theme.textSecondary }]}>
            Great job! You've completed today's coding practice.
          </Text>
          <View style={[styles.completedStats, { backgroundColor: theme.surface }]}>
            <View style={styles.completedStat}>
              <Ionicons name="flame" size={24} color={theme.primary} />
              <Text style={[styles.completedStatValue, { color: theme.text }]}>
                {streak}
              </Text>
              <Text style={[styles.completedStatLabel, { color: theme.textMuted }]}>
                Day Streak
              </Text>
            </View>
            <View style={[styles.completedStatDivider, { backgroundColor: theme.border }]} />
            <View style={styles.completedStat}>
              <Ionicons name="time-outline" size={24} color={theme.primary} />
              <Text style={[styles.completedStatValue, { color: theme.text }]}>
                {formatTime(timeSpent)}
              </Text>
              <Text style={[styles.completedStatLabel, { color: theme.textMuted }]}>
                Today
              </Text>
            </View>
            <View style={[styles.completedStatDivider, { backgroundColor: theme.border }]} />
            <View style={styles.completedStat}>
              <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
              <Text style={[styles.completedStatValue, { color: theme.text }]}>
                {totalAnswered}
              </Text>
              <Text style={[styles.completedStatLabel, { color: theme.textMuted }]}>
                Today Q's
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.startOverButton, { backgroundColor: theme.primary }]}
            onPress={() => loadSession()}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.startOverButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex] || null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Stats */}
        <View style={styles.headerStats}>
          <View style={[styles.statBadge, { backgroundColor: theme.surface }]}>
            <Ionicons name="flame" size={16} color="#FFB74D" />
            <Text style={[styles.statBadgeText, { color: theme.text }]}>{streak}</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: theme.surface }]}>
            <Ionicons name="time-outline" size={16} color={theme.primary} />
            <Text style={[styles.statBadgeText, { color: theme.text }]}>
              {formatTime(timeSpent)}
            </Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: theme.surface }]}>
            <Ionicons name="checkmark-circle" size={16} color={theme.success} />
            <Text style={[styles.statBadgeText, { color: theme.text }]}>
              {currentIndex + 1}/{questions.length}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        {questions.length > 0 && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.primary,
                    width: `${((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Question Card */}
        {currentQuestion ? (
          <View>
            <ChallengeCard
              question={currentQuestion}
              selectedIndex={selectedIndex}
              onSelect={handleAnswer}
              showResult={showResult}
              correctIndex={currentQuestion.correctIndex}
              darkMode={isDark}
            />
            {showResult && (
              <View
                style={[
                  styles.explanationCard,
                  { backgroundColor: theme.cardBackground, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.explanationLabel,
                    {
                      color:
                        selectedIndex === currentQuestion.correctIndex
                          ? theme.success
                          : theme.error,
                    },
                  ]}
                >
                  {selectedIndex === currentQuestion.correctIndex ? '✓ Correct!' : '✗ Incorrect'}
                </Text>
                <Text style={[styles.explanationText, { color: theme.textSecondary }]}>
                  {currentQuestion.explanation}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading challenges...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  explanationCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  explanationLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 20,
  },
  completedSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  completedStats: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  completedStat: {
    alignItems: 'center',
    gap: 4,
  },
  completedStatDivider: {
    width: 1,
    height: 40,
  },
  completedStatValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  completedStatLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  startOverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  startOverButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
