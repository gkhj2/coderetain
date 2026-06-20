import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import StreakCalendar from '../components/StreakCalendar';
import { CategoryAccuracy } from '../types';
import { darkTheme, lightTheme, ThemeColors } from '../theme/colors';
import {
  getLast30DaysStats,
  getCategoryAccuracy,
  getTotalQuestionsAnswered,
  getTodayStats,
} from '../database';

export default function StatsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme: ThemeColors = isDark ? darkTheme : lightTheme;

  const [calendarData, setCalendarData] = useState<
    { date: string; active: boolean; correct: number; total: number }[]
  >([]);
  const [categoryData, setCategoryData] = useState<CategoryAccuracy[]>([]);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [cd, cat, total, stats] = await Promise.all([
          getLast30DaysStats(),
          getCategoryAccuracy(),
          getTotalQuestionsAnswered(),
          getTodayStats(),
        ]);
        setCalendarData(cd);
        setCategoryData(cat);
        setTotalAnswered(total);
        setStreak(stats.streak);
      };
      load();
    }, [])
  );

  const categoryIcons: Record<string, string> = {
    Regex: 'code-slash',
    SQL: 'server',
    Git: 'git-branch',
    Shell: 'terminal',
    'Design Patterns': 'layers',
    Docker: 'cube',
    JavaScript: 'logo-javascript',
  };

  const categoryColors: Record<string, string> = {
    Regex: '#FF6B6B',
    SQL: '#4ECDC4',
    Git: '#FFB74D',
    Shell: '#A78BFA',
    'Design Patterns': '#60A5FA',
    Docker: '#2496ED',
    JavaScript: '#F7DF1E',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>{t('stats.title')}</Text>

        <View style={[styles.overallCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.overallRow}>
            <View style={styles.overallItem}>
              <Ionicons name="flame" size={28} color="#FFB74D" />
              <Text style={[styles.overallValue, { color: theme.text }]}>{streak}</Text>
              <Text style={[styles.overallLabel, { color: theme.textMuted }]}>
                {t('stats.streak')}
              </Text>
            </View>
            <View style={[styles.overallDivider, { backgroundColor: theme.border }]} />
            <View style={styles.overallItem}>
              <Ionicons name="checkmark-circle" size={28} color={theme.primary} />
              <Text style={[styles.overallValue, { color: theme.text }]}>
                {totalAnswered}
              </Text>
              <Text style={[styles.overallLabel, { color: theme.textMuted }]}>
                {t('stats.totalAnswered')}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('stats.last30Days')}</Text>
        <StreakCalendar data={calendarData} darkMode={isDark} />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('stats.categoryAccuracy')}</Text>
        <View style={[styles.categoryCard, { backgroundColor: theme.cardBackground }]}>
          {categoryData.map((cat) => {
            const accuracy = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
            const barWidth = cat.total > 0 ? (cat.correct / cat.total) * 100 : 0;
            const iconName = categoryIcons[cat.category] || 'help-circle';
            const color = categoryColors[cat.category] || theme.primary;

            return (
              <View key={cat.category} style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <View
                    style={[styles.categoryIconCircle, { backgroundColor: color + '20' }]}
                  >
                    <Ionicons name={iconName} size={16} color={color} />
                  </View>
                  <Text style={[styles.categoryName, { color: theme.text }]}>
                    {t(`categories.${cat.category}`, cat.category)}
                  </Text>
                  <Text style={[styles.categoryAccuracy, { color: theme.textSecondary }]}>
                    {cat.total > 0 ? `${accuracy}%` : '—'}
                  </Text>
                </View>
                <View style={[styles.barContainer, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.barFill,
                      { backgroundColor: color, width: `${barWidth}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.categoryCount, { color: theme.textMuted }]}>
                  {cat.correct}/{cat.total}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 16, marginTop: 20, marginBottom: 8 },
  overallCard: { marginHorizontal: 16, borderRadius: 16, padding: 20, marginTop: 4 },
  overallRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  overallItem: { alignItems: 'center', gap: 4 },
  overallValue: { fontSize: 28, fontWeight: '800' },
  overallLabel: { fontSize: 12, fontWeight: '500' },
  overallDivider: { width: 1, height: 50 },
  categoryCard: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginTop: 4 },
  categoryRow: { marginBottom: 16 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  categoryIconCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  categoryName: { fontSize: 14, fontWeight: '600', flex: 1 },
  categoryAccuracy: { fontSize: 14, fontWeight: '700' },
  barContainer: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  categoryCount: { fontSize: 11, marginTop: 4, textAlign: 'right' },
});
