import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, useColorScheme, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { darkTheme, lightTheme } from './src/theme/colors';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate some loading time for splash
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } finally {
        setAppIsReady(true);
        // Fade out splash
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setShowSplash(false);
        });
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (showSplash) {
    return (
      <Animated.View
        style={[
          styles.splashContainer,
          { backgroundColor: theme.primary, opacity: fadeAnim },
        ]}
      >
        <Ionicons name="code-slash" size={64} color="#FFFFFF" />
        <Text style={styles.splashTitle}>CodeRetain</Text>
        <Text style={styles.splashSubtitle}>Keep your edge</Text>
      </Animated.View>
    );
  }

  return (
    <SafeAreaProvider><View style={{flex:1}} onLayout={onLayoutRootView}>
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: theme.primary,
            background: theme.background,
            card: theme.surface,
            text: theme.text,
            border: theme.border,
            notification: theme.primary,
          },
          fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' },
            medium: { fontFamily: 'System', fontWeight: '500' },
            bold: { fontFamily: 'System', fontWeight: '700' },
            heavy: { fontFamily: 'System', fontWeight: '800' },
          },
        }}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </View></SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
  },
  splashSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
});

