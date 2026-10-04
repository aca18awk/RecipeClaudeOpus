import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { FeaturedCarousel } from '@/components/featured-carousel';
import { FilterSheet } from '@/components/filter-sheet';
import { CloseIcon, FilterIcon, SearchIcon } from '@/components/icons';
import { PotButton } from '@/components/pot-button';
import { RecipeCard } from '@/components/recipe-card';
import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRecipes } from '@/state/recipes-context';
import { EMPTY_FILTERS, type Recipe, type RecipeFilters } from '@/types/recipe';

function matchesSearch(recipe: Recipe, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    recipe.title.toLowerCase().includes(q) ||
    recipe.description.toLowerCase().includes(q) ||
    recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(q))
  );
}

function matchesFilters(recipe: Recipe, filters: RecipeFilters) {
  if (filters.vegetarian && !recipe.vegetarian) return false;
  if (filters.under30 && recipe.cookingTimeMinutes >= 30) return false;
  if (filters.difficulties.length > 0 && !filters.difficulties.includes(recipe.difficulty)) {
    return false;
  }
  return true;
}

function countActiveFilters(filters: RecipeFilters) {
  return Number(filters.vegetarian) + Number(filters.under30) + filters.difficulties.length;
}

export default function HomeScreen() {
  const theme = useTheme();
  const { recipes, isSaved, toggleSaved } = useRecipes();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);

  const trimmedQuery = query.trim();
  const results = recipes.filter(
    (recipe) => matchesSearch(recipe, trimmedQuery) && matchesFilters(recipe, filters)
  );
  const featured = recipes.filter((recipe) => recipe.featured);
  const activeFilterCount = countActiveFilters(filters);
  const isFiltering = trimmedQuery.length > 0 || activeFilterCount > 0;

  const resultsLabel = `${results.length} ${results.length === 1 ? 'recipe' : 'recipes'}`;

  const clearAll = () => {
    setQuery('');
    setFilters(EMPTY_FILTERS);
  };

  const header = (
    <View style={styles.header}>
      <FeaturedCarousel recipes={featured} />

      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchField,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <SearchIcon color={theme.textSecondary} size={20} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search recipes or ingredients"
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel="Search recipes"
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="never"
            style={[styles.searchInput, { color: theme.text }]}
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
              style={styles.clearButton}>
              <CloseIcon color={theme.textSecondary} size={14} />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={() => setSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={
            activeFilterCount > 0 ? `Filters, ${activeFilterCount} active` : 'Filters'
          }
          style={({ pressed }) => [
            styles.filterButton,
            {
              backgroundColor: activeFilterCount > 0 ? theme.tint : theme.backgroundElement,
              borderColor: activeFilterCount > 0 ? theme.tint : theme.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <FilterIcon color={activeFilterCount > 0 ? theme.onTint : theme.text} size={20} />
          {activeFilterCount > 0 ? (
            <View style={[styles.filterCount, { backgroundColor: theme.onTint }]}>
              <Text style={[styles.filterCountText, { color: theme.tint }]}>
                {activeFilterCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.resultsRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityRole="header">
          All recipes
        </Text>
        {/* Live region so screen readers hear the count change while typing or filtering. */}
        <Text
          style={[styles.resultCount, { color: theme.textSecondary }]}
          accessibilityLiveRegion="polite">
          {isFiltering ? `${resultsLabel} found` : resultsLabel}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <RecipeCard
              recipe={item}
              action={
                <PotButton
                  recipeTitle={item.title}
                  saved={isSaved(item.id)}
                  onPress={() => toggleSaved(item.id)}
                />
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No recipes match"
            message="Try a different search term or remove some filters."
            actionLabel="Clear search and filters"
            onAction={clearAll}
          />
        }
      />

      <FilterSheet
        visible={sheetOpen}
        filters={filters}
        resultCount={results.length}
        onChange={setFilters}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.five,
  },
  header: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three - 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: MinTouchSize,
    paddingLeft: Spacing.three - 4,
    paddingRight: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.two,
  },
  clearButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    width: MinTouchSize + 4,
    height: MinTouchSize + 4,
    borderRadius: Radius.medium,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCount: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  resultCount: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  cardWrapper: {
    paddingHorizontal: Spacing.three,
  },
  separator: {
    height: Spacing.three - 4,
  },
});
