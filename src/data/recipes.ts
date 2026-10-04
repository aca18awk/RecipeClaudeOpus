import type { ImageSourcePropType } from 'react-native';
import type { VideoSource } from 'expo-video';

import recipesJson from '../../data/recipes.json';

import type { Difficulty, Recipe } from '@/types/recipe';

// Metro can only bundle assets referenced by static `require` calls, so the
// paths in recipes.json are mapped to bundled assets here.
const IMAGES: Record<string, ImageSourcePropType> = {
  'assets/images/recipes/shakshuka.jpeg': require('@/assets/images/recipes/shakshuka.jpeg'),
  'assets/images/recipes/pierogi-ruskie.jpeg': require('@/assets/images/recipes/pierogi-ruskie.jpeg'),
  'assets/images/recipes/roast-chicken.jpg': require('@/assets/images/recipes/roast-chicken.jpg'),
  'assets/images/recipes/thai-green-curry.jpeg': require('@/assets/images/recipes/thai-green-curry.jpeg'),
  'assets/images/recipes/aglio-olio.jpeg': require('@/assets/images/recipes/aglio-olio.jpeg'),
  'assets/images/recipes/teriyaki-salmon.jpeg': require('@/assets/images/recipes/teriyaki-salmon.jpeg'),
  'assets/images/recipes/chocolate-babka.jpeg': require('@/assets/images/recipes/chocolate-babka.jpeg'),
  'assets/images/recipes/red-lentil-dal.jpeg': require('@/assets/images/recipes/red-lentil-dal.jpeg'),
};

const VIDEOS: Record<string, VideoSource> = {
  'assets/videos/folding-pierogi.mp4': require('@/assets/videos/folding-pierogi.mp4'),
  'assets/videos/shaping-babka.mp4': require('@/assets/videos/shaping-babka.mp4'),
};

export const INITIAL_RECIPES: Recipe[] = recipesJson.recipes.map((raw) => ({
  id: raw.id,
  title: raw.title,
  description: raw.description,
  image: IMAGES[raw.image] ?? null,
  altText: raw.altText,
  cookingTimeMinutes: raw.cookingTimeMinutes,
  difficulty: raw.difficulty as Difficulty,
  vegetarian: raw.vegetarian,
  featured: raw.featured,
  servings: raw.servings,
  video:
    raw.video && VIDEOS[raw.video.file]
      ? { source: VIDEOS[raw.video.file], title: raw.video.title }
      : null,
  ingredients: raw.ingredients.map((ingredient) => ({
    name: ingredient.name,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
  })),
  steps: raw.steps.map((step) => ({ text: step.text, timerSeconds: step.timerSeconds })),
  sourceUrl: null,
}));
