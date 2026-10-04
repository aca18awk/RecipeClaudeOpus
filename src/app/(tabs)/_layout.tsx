import { Tabs } from 'expo-router/js-tabs';

import { HomeIcon, PlusIcon, PotIcon } from '@/components/icons';
import { useRecipes } from '@/state/recipes-context';
import { useTheme } from '@/hooks/use-theme';

export default function TabLayout() {
  const theme = useTheme();
  const { savedIds } = useRecipes();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerTitleStyle: { fontWeight: '800' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Recipes',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="kitchen"
        options={{
          title: 'My Kitchen',
          tabBarIcon: ({ color, focused }) => (
            <PotIcon color={color} size={24} filled={focused} fillDetailColor={theme.background} />
          ),
          tabBarBadge: savedIds.length > 0 ? savedIds.length : undefined,
          tabBarAccessibilityLabel:
            savedIds.length > 0
              ? `My Kitchen, ${savedIds.length} saved ${savedIds.length === 1 ? 'recipe' : 'recipes'}`
              : 'My Kitchen',
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add recipe',
          tabBarLabel: 'Add',
          tabBarIcon: ({ color }) => <PlusIcon color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
