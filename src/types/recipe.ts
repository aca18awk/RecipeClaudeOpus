import type { ImageSourcePropType } from 'react-native';
import type { VideoSource } from 'expo-video';

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export type Ingredient = {
  name: string;
  /** `null` for ingredients without an amount, e.g. "salt, to taste". */
  quantity: number | null;
  unit: string | null;
};

export type Step = {
  text: string;
  timerSeconds: number | null;
};

export type RecipeVideo = {
  source: VideoSource;
  title: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  /** `null` for user-added recipes, which render a placeholder. */
  image: ImageSourcePropType | null;
  /** Description of the photo for screen readers; may be missing in the data. */
  altText: string | null;
  cookingTimeMinutes: number;
  difficulty: Difficulty;
  vegetarian: boolean;
  featured: boolean;
  servings: number;
  video: RecipeVideo | null;
  ingredients: Ingredient[];
  steps: Step[];
  sourceUrl: string | null;
};

export type RecipeFilters = {
  vegetarian: boolean;
  under30: boolean;
  difficulties: Difficulty[];
};

export const EMPTY_FILTERS: RecipeFilters = {
  vegetarian: false,
  under30: false,
  difficulties: [],
};
