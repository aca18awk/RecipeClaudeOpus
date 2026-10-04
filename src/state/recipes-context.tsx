import { createContext, useContext, useState, type ReactNode } from 'react';

import { INITIAL_RECIPES } from '@/data/recipes';
import type { Recipe } from '@/types/recipe';

export type ShoppingListItem = {
  id: string;
  recipeId: string;
  text: string;
};

type RecipesContextValue = {
  recipes: Recipe[];
  /** Saved ("My Kitchen") recipe ids, most recently saved first. */
  savedIds: string[];
  shoppingList: ShoppingListItem[];
  getRecipe: (id: string) => Recipe | undefined;
  isSaved: (id: string) => boolean;
  /** Returns `true` if the recipe is saved after toggling. */
  toggleSaved: (id: string) => boolean;
  /** Removes a saved recipe and returns its former position (for undo). */
  removeSaved: (id: string) => number;
  restoreSaved: (id: string, index: number) => void;
  addRecipe: (recipe: Recipe) => void;
  addToShoppingList: (recipeId: string, items: string[]) => void;
};

const RecipesContext = createContext<RecipesContextValue | null>(null);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  const value: RecipesContextValue = {
    recipes,
    savedIds,
    shoppingList,
    getRecipe: (id) => recipes.find((recipe) => recipe.id === id),
    isSaved: (id) => savedIds.includes(id),
    toggleSaved: (id) => {
      const willSave = !savedIds.includes(id);
      setSavedIds((current) =>
        current.includes(id) ? current.filter((savedId) => savedId !== id) : [id, ...current]
      );
      return willSave;
    },
    removeSaved: (id) => {
      const index = savedIds.indexOf(id);
      setSavedIds((current) => current.filter((savedId) => savedId !== id));
      return index;
    },
    restoreSaved: (id, index) => {
      setSavedIds((current) => {
        if (current.includes(id)) return current;
        const next = [...current];
        next.splice(Math.max(0, Math.min(index, next.length)), 0, id);
        return next;
      });
    },
    addRecipe: (recipe) => setRecipes((current) => [recipe, ...current]),
    addToShoppingList: (recipeId, items) =>
      setShoppingList((current) => [
        ...current,
        ...items.map((text, index) => ({ id: `${recipeId}-${Date.now()}-${index}`, recipeId, text })),
      ]),
  };

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipesContext);
  if (!context) throw new Error('useRecipes must be used inside RecipesProvider');
  return context;
}
