import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { DifficultyBadge } from '@/components/difficulty-badge';
import { EmptyState } from '@/components/empty-state';
import { CheckIcon, ClockIcon } from '@/components/icons';
import { PotButton } from '@/components/pot-button';
import { RecipeImage } from '@/components/recipe-image';
import { RecipeVideo } from '@/components/recipe-video';
import { Stepper } from '@/components/stepper';
import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRecipes } from '@/state/recipes-context';
import { useToast } from '@/state/toast-context';
import { formatMinutes, scaleIngredient, spokenMinutes } from '@/utils/format';

const MAX_SERVINGS = 24;

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { getRecipe, isSaved, toggleSaved, addToShoppingList } = useRecipes();
  const { showToast } = useToast();
  const recipe = getRecipe(id);

  const [servings, setServings] = useState(recipe?.servings ?? 1);
  const [checked, setChecked] = useState<Set<number>>(() => new Set());

  if (!recipe) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <EmptyState
          title="Recipe not found"
          message="This recipe may have been removed."
          actionLabel="Back to recipes"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const factor = servings / recipe.servings;
  const ingredientLines = recipe.ingredients.map((ingredient) => scaleIngredient(ingredient, factor));

  const changeServings = (value: number) => {
    setServings(value);
    AccessibilityInfo.announceForAccessibility(
      `${value} ${value === 1 ? 'serving' : 'servings'}. Ingredient quantities updated.`
    );
  };

  const toggleIngredient = (index: number) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addAllToShoppingList = () => {
    addToShoppingList(recipe.id, ingredientLines);
    showToast(
      `Added ${ingredientLines.length} ingredients for ${servings} ${servings === 1 ? 'serving' : 'servings'} to your shopping list`
    );
  };

  const hasSteps = recipe.steps.length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: recipe.title }} />
      <ScrollView contentContainerStyle={styles.content}>
        <RecipeImage recipe={recipe} style={styles.hero} />

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
              {recipe.title}
            </Text>
            <PotButton
              recipeTitle={recipe.title}
              saved={isSaved(recipe.id)}
              onPress={() => toggleSaved(recipe.id)}
            />
          </View>

          <View style={styles.metaRow}>
            <View
              style={styles.metaItem}
              accessible
              accessibilityLabel={`Cooking time: ${spokenMinutes(recipe.cookingTimeMinutes)}`}>
              <ClockIcon color={theme.textSecondary} size={16} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {formatMinutes(recipe.cookingTimeMinutes)}
              </Text>
            </View>
            <DifficultyBadge difficulty={recipe.difficulty} />
            {recipe.vegetarian ? (
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>Vegetarian</Text>
            ) : null}
          </View>

          {recipe.description ? (
            <Text style={[styles.description, { color: theme.text }]}>{recipe.description}</Text>
          ) : null}

          {recipe.video ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">
                Technique video
              </Text>
              <RecipeVideo video={recipe.video} />
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">
              Ingredients
            </Text>
            <Stepper
              label="Servings"
              value={servings}
              min={1}
              max={MAX_SERVINGS}
              onChange={changeServings}
              formatValue={(value) => `${value} ${value === 1 ? 'serving' : 'servings'}`}
            />
            <View style={[styles.checklist, { borderColor: theme.border }]}>
              {ingredientLines.map((line, index) => {
                const isChecked = checked.has(index);
                return (
                  <Pressable
                    key={`${recipe.ingredients[index].name}-${index}`}
                    onPress={() => toggleIngredient(index)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isChecked }}
                    accessibilityLabel={line}
                    style={({ pressed }) => [
                      styles.ingredientRow,
                      index > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                      { opacity: pressed ? 0.7 : 1 },
                    ]}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: isChecked ? theme.tint : theme.textSecondary,
                          backgroundColor: isChecked ? theme.tint : 'transparent',
                        },
                      ]}>
                      {isChecked ? <CheckIcon color={theme.onTint} size={14} /> : null}
                    </View>
                    <Text
                      style={[
                        styles.ingredientText,
                        {
                          color: isChecked ? theme.textSecondary : theme.text,
                          textDecorationLine: isChecked ? 'line-through' : 'none',
                        },
                      ]}>
                      {line}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            paddingBottom: insets.bottom + Spacing.two,
          },
        ]}>
        <AppButton
          label="Add to shopping list"
          variant="secondary"
          onPress={addAllToShoppingList}
          style={styles.footerButton}
        />
        <AppButton
          label="Start cooking"
          onPress={() => router.push({ pathname: '/cooking/[id]', params: { id: recipe.id } })}
          disabled={!hasSteps}
          accessibilityHint={hasSteps ? 'Shows the steps one at a time' : 'This recipe has no steps'}
          style={styles.footerButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.five,
  },
  hero: {
    width: '100%',
    aspectRatio: 4 / 3,
    maxHeight: 360,
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  title: {
    flex: 1,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.three - 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  metaText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    gap: Spacing.three - 4,
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
  },
  checklist: {
    borderWidth: 1,
    borderRadius: Radius.medium,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - 4,
    minHeight: MinTouchSize + 4,
    paddingHorizontal: Spacing.three - 4,
    paddingVertical: Spacing.two,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three - 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerButton: {
    flex: 1,
  },
});
