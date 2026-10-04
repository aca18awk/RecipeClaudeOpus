import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { RecipesProvider } from '@/state/recipes-context';
import { ToastProvider } from '@/state/toast-context';

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.tint,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <RecipesProvider>
        <ToastProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Recipes' }} />
            <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe' }} />
            <Stack.Screen name="cooking/[id]" options={{ title: 'Cooking mode' }} />
          </Stack>
        </ToastProvider>
      </RecipesProvider>
    </ThemeProvider>
  );
}
