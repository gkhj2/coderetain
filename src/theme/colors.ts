export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  surfaceLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  cardBackground: string;
  streakActive: string;
  streakInactive: string;
  streakEmpty: string;
}

export const darkTheme: ThemeColors = {
  primary: '#6C63FF',
  background: '#1A1A2E',
  surface: '#16213E',
  surfaceLight: '#1E2D4A',
  text: '#FFFFFF',
  textSecondary: '#B0B0C3',
  textMuted: '#6B7280',
  border: '#2A2A4A',
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FFB74D',
  tabBarBackground: '#0F0F23',
  tabBarActive: '#6C63FF',
  tabBarInactive: '#6B7280',
  cardBackground: '#16213E',
  streakActive: '#6C63FF',
  streakInactive: '#2A2A4A',
  streakEmpty: '#1E1E3A',
};

export const lightTheme: ThemeColors = {
  primary: '#6C63FF',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceLight: '#EEEEFF',
  text: '#1A1A2E',
  textSecondary: '#555570',
  textMuted: '#9CA3AF',
  border: '#E0E0E0',
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FFB74D',
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#6C63FF',
  tabBarInactive: '#9CA3AF',
  cardBackground: '#FFFFFF',
  streakActive: '#6C63FF',
  streakInactive: '#E0E0E0',
  streakEmpty: '#F0F0F0',
};
