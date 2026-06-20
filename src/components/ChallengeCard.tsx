import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Question } from '../types';
import { darkTheme, lightTheme, ThemeColors } from '../theme/colors';

interface ChallengeCardProps {
  question: Question;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  showResult: boolean;
  correctIndex: number;
  darkMode: boolean;
}

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

export default function ChallengeCard({
  question,
  selectedIndex,
  onSelect,
  showResult,
  correctIndex,
  darkMode,
}: ChallengeCardProps) {
  const { t } = useTranslation();
  const theme: ThemeColors = darkMode ? darkTheme : lightTheme;

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return {
        backgroundColor: selectedIndex === index ? theme.primary + '20' : theme.surface,
        borderColor: selectedIndex === index ? theme.primary : theme.border,
      };
    }
    if (index === correctIndex) {
      return { backgroundColor: theme.success + '20', borderColor: theme.success };
    }
    if (index === selectedIndex && index !== correctIndex) {
      return { backgroundColor: theme.error + '20', borderColor: theme.error };
    }
    return { backgroundColor: theme.surface, borderColor: theme.border };
  };

  const getOptionIcon = (index: number) => {
    if (!showResult) return null;
    if (index === correctIndex) {
      return <Ionicons name="checkmark-circle" size={20} color={theme.success} />;
    }
    if (index === selectedIndex && index !== correctIndex) {
      return <Ionicons name="close-circle" size={20} color={theme.error} />;
    }
    return null;
  };

  const iconName = categoryIcons[question.category] || 'help-circle';

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, shadowColor: theme.text }]}>
      <View style={styles.categoryRow}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: (categoryColors[question.category] || theme.primary) + '20' },
          ]}
        >
          <Ionicons
            name={iconName}
            size={14}
            color={categoryColors[question.category] || theme.primary}
          />
          <Text
            style={[
              styles.categoryText,
              { color: categoryColors[question.category] || theme.primary },
            ]}
          >
            {t(`categories.${question.category}`, question.category)}
          </Text>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: theme.surfaceLight }]}>
          <Text style={[styles.difficultyText, { color: theme.textSecondary }]}>
            {t('difficulty.' + question.difficulty)}
          </Text>
        </View>
      </View>

      <Text style={[styles.questionText, { color: theme.text }]}>{question.question}</Text>

      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionButton, getOptionStyle(index)]}
            onPress={() => !showResult && onSelect(index)}
            disabled={showResult}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View
                style={[
                  styles.optionLetter,
                  {
                    backgroundColor:
                      selectedIndex === index
                        ? theme.primary + '20'
                        : theme.surfaceLight,
                    borderColor:
                      selectedIndex === index ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionLetterText,
                    {
                      color:
                        selectedIndex === index ? theme.primary : theme.textSecondary,
                    },
                  ]}
                >
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[styles.optionText, { color: theme.text }]}>{option}</Text>
            </View>
            {getOptionIcon(index)}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  optionLetterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 21,
  },
});

