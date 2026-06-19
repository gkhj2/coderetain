import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { darkTheme, lightTheme, ThemeColors } from '../theme/colors';
import { getSetting, setSetting } from '../database/db';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme: ThemeColors = isDark ? darkTheme : lightTheme;

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [showTimePicker, setShowTimePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const re = await getSetting('reminderEnabled');
        const rt = await getSetting('reminderTime');
        const diff = await getSetting('difficulty');
        setReminderEnabled(re === 'true');
        setReminderTime(rt || '09:00');
        setDifficulty(diff || 'Beginner');
      };
      load();
    }, [])
  );

  const toggleReminder = async (value: boolean) => {
    setReminderEnabled(value);
    await setSetting('reminderEnabled', value.toString());
  };

  const handleTimeChange = async (hours: number, minutes: number) => {
    const newTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    setReminderTime(newTime);
    setShowTimePicker(false);
    await setSetting('reminderTime', newTime);
  };

  const handleDifficultyChange = async (value: string) => {
    setDifficulty(value);
    await setSetting('difficulty', value);
  };

  const hours = parseInt(reminderTime.split(':')[0], 10);
  const minutes = parseInt(reminderTime.split(':')[1], 10);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        {/* Daily Reminder */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Reminder</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={22} color={theme.primary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Daily Practice Reminder
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={toggleReminder}
              trackColor={{ false: theme.border, true: theme.primary + '60' }}
              thumbColor={reminderEnabled ? theme.primary : theme.textMuted}
            />
          </View>

          {reminderEnabled && (
            <TouchableOpacity
              style={[styles.timePickerRow, { backgroundColor: theme.surfaceLight }]}
              onPress={() => setShowTimePicker(!showTimePicker)}
            >
              <Ionicons name="time-outline" size={20} color={theme.primary} />
              <Text style={[styles.timePickerLabel, { color: theme.text }]}>
                Reminder Time
              </Text>
              <Text style={[styles.timePickerValue, { color: theme.primary }]}>
                {reminderTime}
              </Text>
              <Ionicons
                name={showTimePicker ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={theme.textMuted}
              />
            </TouchableOpacity>
          )}

          {showTimePicker && (
            <View style={styles.timePickerGrid}>
              <View style={styles.timeColumn}>
                <Text style={[styles.timeColumnLabel, { color: theme.textMuted }]}>Hour</Text>
                <ScrollView style={styles.timeScroll} nestedScrollEnabled>
                  {Array.from({ length: 24 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.timeOption,
                        {
                          backgroundColor: i === hours ? theme.primary + '20' : 'transparent',
                        },
                      ]}
                      onPress={() => {
                        const h = i;
                        handleTimeChange(h, minutes);
                      }}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          {
                            color: i === hours ? theme.primary : theme.text,
                            fontWeight: i === hours ? '700' : '400',
                          },
                        ]}
                      >
                        {String(i).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.timeColumn}>
                <Text style={[styles.timeColumnLabel, { color: theme.textMuted }]}>Min</Text>
                <ScrollView style={styles.timeScroll} nestedScrollEnabled>
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.timeOption,
                        {
                          backgroundColor: m === minutes ? theme.primary + '20' : 'transparent',
                        },
                      ]}
                      onPress={() => {
                        handleTimeChange(hours, m);
                      }}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          {
                            color: m === minutes ? theme.primary : theme.text,
                            fontWeight: m === minutes ? '700' : '400',
                          },
                        ]}
                      >
                        {String(m).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </View>

        {/* Difficulty */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            {DIFFICULTIES.map((d) => {
              const icons: Record<string, string> = {
                Beginner: 'easel-outline',
                Intermediate: 'stats-chart-outline',
                Advanced: 'rocket-outline',
              };
              const descriptions: Record<string, string> = {
                Beginner: 'Fundamentals & basics',
                Intermediate: 'Practical problems',
                Advanced: 'Expert-level challenges',
              };
              const isSelected = difficulty === d;
              return (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.difficultyOption,
                    {
                      backgroundColor: isSelected ? theme.primary + '15' : theme.surfaceLight,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => handleDifficultyChange(d)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={icons[d]}
                    size={24}
                    color={isSelected ? theme.primary : theme.textMuted}
                  />
                  <Text
                    style={[
                      styles.difficultyName,
                      { color: isSelected ? theme.primary : theme.text },
                    ]}
                  >
                    {d}
                  </Text>
                  <Text style={[styles.difficultyDesc, { color: theme.textMuted }]}>
                    {descriptions[d]}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* About */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
          <View style={styles.aboutRow}>
            <Ionicons name="information-circle-outline" size={22} color={theme.primary} />
            <View style={styles.aboutInfo}>
              <Text style={[styles.aboutName, { color: theme.text }]}>CodeRetain</Text>
              <Text style={[styles.aboutVersion, { color: theme.textMuted }]}>v1.0.0</Text>
            </View>
          </View>
          <Text style={[styles.aboutDesc, { color: theme.textSecondary }]}>
            Daily 5-minute coding practice to sharpen your skills. Designed for developers who
            want to retain their edge in the age of AI.
          </Text>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 10,
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  timePickerValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  timePickerGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  timeColumn: {
    flex: 1,
  },
  timeColumnLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  timeScroll: {
    maxHeight: 160,
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 15,
  },
  difficultyContainer: {
    gap: 10,
  },
  difficultyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  difficultyName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  difficultyDesc: {
    fontSize: 12,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  aboutInfo: {},
  aboutName: {
    fontSize: 16,
    fontWeight: '700',
  },
  aboutVersion: {
    fontSize: 12,
    marginTop: 2,
  },
  aboutDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
});

