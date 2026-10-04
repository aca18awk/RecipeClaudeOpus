import { Image, StyleSheet, View, type ImageStyle, type StyleProp } from 'react-native';

import { PotIcon } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/recipe';

type RecipeImageProps = {
  recipe: Recipe;
  style: StyleProp<ImageStyle>;
  /** Decorative images are hidden from screen readers (e.g. inside a labelled card). */
  decorative?: boolean;
};

/** Recipe photo, or a neutral placeholder for user-added recipes without one. */
export function RecipeImage({ recipe, style, decorative = false }: RecipeImageProps) {
  const theme = useTheme();

  if (!recipe.image) {
    return (
      <View
        style={[styles.placeholder, { backgroundColor: theme.tintSoft }, style as object]}
        accessible={!decorative}
        accessibilityRole={decorative ? undefined : 'image'}
        accessibilityLabel={decorative ? undefined : 'No photo'}
        importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}>
        <PotIcon color={theme.tint} size={36} />
      </View>
    );
  }

  return (
    <Image
      source={recipe.image}
      style={style}
      resizeMode="cover"
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : (recipe.altText ?? `Photo of ${recipe.title}`)}
      importantForAccessibility={decorative ? 'no' : 'yes'}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
