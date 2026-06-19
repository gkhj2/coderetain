import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { darkTheme, lightTheme, ThemeColors } from '../theme/colors';

interface StreakCalendarProps {
  data: { date: string; active: boolean; correct: number; total: number }[];
  darkMode: boolean;
}

export default function StreakCalendar({ data, darkMode }: StreakCalendarProps) {
  const theme: ThemeColors = darkMode ? darkTheme : lightTheme;

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Group data into weeks (starting from Monday)
  const weeks: { date: string; active: boolean; correct: number; total: number }[][] = [];
  let currentWeek: (typeof data)[0][] = [];

  for (const day of data) {
    const d = new Date(day.date);
    const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ...
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = Monday, 6 = Sunday

    if (adjustedDay === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getDayColor = (active: boolean, total: number, correct: number) => {
    if (!active) return theme.streakEmpty;
    const ratio = total > 0 ? correct / total : 0;
    if (ratio >= 0.8) return theme.streakActive;
    if (ratio >= 0.5) return theme.primary + '99';
    return theme.primary + '55';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.weekRow}>
        {dayLabels.map((label, i) => (
          <View key={i} style={styles.dayLabelContainer}>
            <Text style={[styles.dayLabel, { color: theme.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {dayLabels.map((_, dayIndex) => {
            const day = week[dayIndex];
            return (
              <View key={dayIndex} style={styles.dayContainer}>
                {day ? (
                  <View
                    style={[
                      styles.dayBox,
                      {
                        backgroundColor: getDayColor(day.active, day.total, day.correct),
                        borderColor: day.active ? 'transparent' : theme.border,
                        borderWidth: day.active ? 0 : 1,
                      },
                    ]}
                  />
                ) : (
                  <View style={[styles.dayBox, { backgroundColor: 'transparent' }]} />
                )}
              </View>
            );
          })}
        </View>
      ))}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.streakEmpty }]} />
          <Text style={[styles.legendText, { color: theme.textMuted }]}>None</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.primary + '55' }]} />
          <Text style={[styles.legendText, { color: theme.textMuted }]}>Low</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.primary + '99' }]} />
          <Text style={[styles.legendText, { color: theme.textMuted }]}>Medium</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.streakActive }]} />
          <Text style={[styles.legendText, { color: theme.textMuted }]}>High</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  dayLabelContainer: {
    width: 32,
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  dayContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
  },
});
