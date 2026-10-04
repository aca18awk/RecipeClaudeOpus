import { router } from 'expo-router';
import { useRef, useState, type RefObject } from 'react';
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { AppButton } from '@/components/app-button';
import { CloseIcon, PlusIcon } from '@/components/icons';
import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRecipes } from '@/state/recipes-context';
import { useToast } from '@/state/toast-context';
import { DIFFICULTIES, type Difficulty, type Recipe } from '@/types/recipe';
import { DIFFICULTY_LABELS, parseIngredient } from '@/utils/format';

const MAX_SERVINGS = 24;
const MAX_MINUTES = 1440;

type IngredientRow = { key: number; text: string };

type FormValues = {
  title: string;
  servings: string;
  minutes: string;
  sourceUrl: string;
  ingredients: IngredientRow[];
};

type FieldName = 'title' | 'servings' | 'minutes' | 'sourceUrl' | 'ingredients';
type FormErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ['title', 'servings', 'minutes', 'sourceUrl', 'ingredients'];

let nextRowKey = 1;
const newRow = (): IngredientRow => ({ key: nextRowKey++, text: '' });

const emptyForm = (): FormValues => ({
  title: '',
  servings: '',
  minutes: '',
  sourceUrl: '',
  ingredients: [newRow()],
});

function parseWholeNumber(value: string): number | null {
  const trimmed = value.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.title.trim()) errors.title = 'Enter a recipe title.';

  const servings = parseWholeNumber(values.servings);
  if (!values.servings.trim()) errors.servings = 'Enter the number of servings.';
  else if (servings === null || servings < 1 || servings > MAX_SERVINGS) {
    errors.servings = `Servings must be a whole number from 1 to ${MAX_SERVINGS}.`;
  }

  const minutes = parseWholeNumber(values.minutes);
  if (!values.minutes.trim()) errors.minutes = 'Enter the cooking time in minutes.';
  else if (minutes === null || minutes < 1 || minutes > MAX_MINUTES) {
    errors.minutes = `Cooking time must be a whole number of minutes from 1 to ${MAX_MINUTES}.`;
  }

  const url = values.sourceUrl.trim();
  if (url && !/^https?:\/\/[^\s/$.?#][^\s]*\.[^\s]+$/i.test(url)) {
    errors.sourceUrl = 'Enter a full web address starting with http:// or https://';
  }

  if (!values.ingredients.some((row) => row.text.trim())) {
    errors.ingredients = 'Add at least one ingredient.';
  }

  return errors;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function makeRecipeId(title: string) {
  return `${slugify(title) || 'recipe'}-${Date.now().toString(36)}`;
}

export default function AddRecipeScreen() {
  const theme = useTheme();
  const { addRecipe } = useRecipes();
  const { showToast } = useToast();

  const [values, setValues] = useState<FormValues>(emptyForm);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [vegetarian, setVegetarian] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const titleRef = useRef<TextInput>(null);
  const servingsRef = useRef<TextInput>(null);
  const minutesRef = useRef<TextInput>(null);
  const urlRef = useRef<TextInput>(null);
  const ingredientRefs = useRef(new Map<number, TextInput>());
  /** Row to focus once it mounts (set when the user adds an ingredient). */
  const focusOnMountKey = useRef<number | null>(null);

  // Errors appear after the first save attempt, then update as the user types.
  const errors = submitted ? validate(values) : {};

  const setField = (field: Exclude<FieldName, 'ingredients'>, text: string) =>
    setValues((current) => ({ ...current, [field]: text }));

  const setIngredient = (key: number, text: string) =>
    setValues((current) => ({
      ...current,
      ingredients: current.ingredients.map((row) => (row.key === key ? { ...row, text } : row)),
    }));

  const addIngredientRow = () => {
    const row = newRow();
    setValues((current) => ({ ...current, ingredients: [...current.ingredients, row] }));
    focusOnMountKey.current = row.key;
  };

  const removeIngredientRow = (key: number, position: number) => {
    setValues((current) => ({
      ...current,
      ingredients: current.ingredients.filter((row) => row.key !== key),
    }));
    AccessibilityInfo.announceForAccessibility(`Ingredient ${position} removed`);
  };

  const focusField = (field: FieldName) => {
    const refs: Record<FieldName, RefObject<TextInput | null> | undefined> = {
      title: titleRef,
      servings: servingsRef,
      minutes: minutesRef,
      sourceUrl: urlRef,
      ingredients: undefined,
    };
    if (field === 'ingredients') {
      const first = values.ingredients[0];
      if (first) ingredientRefs.current.get(first.key)?.focus();
    } else {
      refs[field]?.current?.focus();
    }
  };

  const save = () => {
    setSubmitted(true);
    const currentErrors = validate(values);
    const invalid = FIELD_ORDER.filter((field) => currentErrors[field]);

    if (invalid.length > 0) {
      AccessibilityInfo.announceForAccessibility(
        `Recipe not saved. ${invalid.length === 1 ? '1 field needs' : `${invalid.length} fields need`} attention. ${currentErrors[invalid[0]]}`
      );
      focusField(invalid[0]);
      return;
    }

    const title = values.title.trim();
    const recipe: Recipe = {
      id: makeRecipeId(title),
      title,
      description: '',
      image: null,
      altText: null,
      cookingTimeMinutes: Number(values.minutes.trim()),
      difficulty,
      vegetarian,
      featured: false,
      servings: Number(values.servings.trim()),
      video: null,
      ingredients: values.ingredients
        .map((row) => row.text.trim())
        .filter(Boolean)
        .map(parseIngredient),
      steps: [],
      sourceUrl: values.sourceUrl.trim() || null,
    };

    addRecipe(recipe);
    showToast(`${title} added to recipes`);
    setValues(emptyForm());
    setDifficulty('medium');
    setVegetarian(false);
    setSubmitted(false);
    router.navigate('/');
  };

  const errorCount = Object.keys(errors).length;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'android' ? 'height' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          Fields marked “required” must be filled in.
        </Text>

        {errorCount > 0 ? (
          <View
            style={[styles.errorSummary, { borderColor: theme.danger }]}
            accessibilityRole="alert">
            <Text style={[styles.errorSummaryText, { color: theme.danger }]}>
              Please fix {errorCount === 1 ? '1 field' : `${errorCount} fields`} below before saving.
            </Text>
          </View>
        ) : null}

        <FormField
          inputRef={titleRef}
          label="Title"
          required
          value={values.title}
          onChangeText={(text) => setField('title', text)}
          error={errors.title}
          placeholder="e.g. Mushroom risotto"
          autoCapitalize="sentences"
          returnKeyType="next"
          onSubmitEditing={() => servingsRef.current?.focus()}
          submitBehavior="submit"
        />

        <View style={styles.row}>
          <FormField
            inputRef={servingsRef}
            label="Servings"
            required
            value={values.servings}
            onChangeText={(text) => setField('servings', text)}
            error={errors.servings}
            placeholder="e.g. 4"
            keyboardType="number-pad"
            maxLength={2}
            style={styles.rowField}
          />
          <FormField
            inputRef={minutesRef}
            label="Cooking time (minutes)"
            required
            value={values.minutes}
            onChangeText={(text) => setField('minutes', text)}
            error={errors.minutes}
            placeholder="e.g. 45"
            keyboardType="number-pad"
            maxLength={4}
            style={styles.rowField}
          />
        </View>

        <FormField
          inputRef={urlRef}
          label="Source URL"
          value={values.sourceUrl}
          onChangeText={(text) => setField('sourceUrl', text)}
          error={errors.sourceUrl}
          placeholder="https://example.com/recipe"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="URL"
        />

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Difficulty
          </Text>
          <View style={styles.segmented} accessibilityRole="radiogroup" accessibilityLabel="Difficulty">
            {DIFFICULTIES.map((option) => {
              const selected = option === difficulty;
              return (
                <Pressable
                  key={option}
                  onPress={() => setDifficulty(option)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={DIFFICULTY_LABELS[option]}
                  style={({ pressed }) => [
                    styles.segment,
                    {
                      borderColor: selected ? theme.tint : theme.border,
                      backgroundColor: selected ? theme.tint : theme.backgroundElement,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}>
                  <Text
                    style={[styles.segmentText, { color: selected ? theme.onTint : theme.text }]}>
                    {DIFFICULTY_LABELS[option]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.switchRow, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.label, { color: theme.text }]}>Vegetarian</Text>
          <Switch
            value={vegetarian}
            onValueChange={setVegetarian}
            accessibilityLabel="Vegetarian"
            trackColor={{ true: theme.tint, false: theme.border }}
            thumbColor={Platform.OS === 'android' ? theme.backgroundElement : undefined}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]} accessibilityRole="header">
            Ingredients <Text style={[styles.requiredTag, { color: theme.textSecondary }]}>(required)</Text>
          </Text>
          <Text style={[styles.helper, { color: theme.textSecondary }]}>
            Start with the amount, e.g. “200 g flour” or “2 tbsp olive oil”, so quantities can be
            rescaled.
          </Text>

          {values.ingredients.map((row, index) => (
            <View key={row.key} style={styles.ingredientRow}>
              <TextInput
                ref={(node) => {
                  if (!node) {
                    ingredientRefs.current.delete(row.key);
                    return;
                  }
                  ingredientRefs.current.set(row.key, node);
                  if (focusOnMountKey.current === row.key) {
                    focusOnMountKey.current = null;
                    node.focus();
                  }
                }}
                value={row.text}
                onChangeText={(text) => setIngredient(row.key, text)}
                placeholder={index === 0 ? 'e.g. 200 g flour' : 'Another ingredient'}
                placeholderTextColor={theme.textSecondary}
                accessibilityLabel={`Ingredient ${index + 1}`}
                accessibilityHint={index === 0 && errors.ingredients ? errors.ingredients : undefined}
                returnKeyType={index === values.ingredients.length - 1 ? 'done' : 'next'}
                onSubmitEditing={() => {
                  const next = values.ingredients[index + 1];
                  if (next) ingredientRefs.current.get(next.key)?.focus();
                }}
                submitBehavior={index === values.ingredients.length - 1 ? 'blurAndSubmit' : 'submit'}
                style={[
                  styles.input,
                  styles.ingredientInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.backgroundElement,
                    borderColor: errors.ingredients ? theme.danger : theme.border,
                  },
                ]}
              />
              {values.ingredients.length > 1 ? (
                <Pressable
                  onPress={() => removeIngredientRow(row.key, index + 1)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ingredient ${index + 1}${row.text.trim() ? `, ${row.text.trim()}` : ''}`}
                  style={({ pressed }) => [styles.removeButton, { opacity: pressed ? 0.6 : 1 }]}>
                  <CloseIcon color={theme.textSecondary} size={16} />
                </Pressable>
              ) : null}
            </View>
          ))}
          {errors.ingredients ? <ErrorText message={errors.ingredients} /> : null}

          <AppButton
            label="Add ingredient"
            variant="ghost"
            icon={<PlusIcon color={theme.tint} size={18} />}
            onPress={addIngredientRow}
            style={styles.addIngredient}
          />
        </View>

        <AppButton label="Save recipe" size="large" onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FormFieldProps = Omit<TextInputProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  label: string;
  required?: boolean;
  error?: string;
  inputRef: RefObject<TextInput | null>;
};

function FormField({ label, required = false, error, inputRef, style, ...inputProps }: FormFieldProps) {
  const theme = useTheme();
  return (
    <View style={[styles.fieldGroup, style]}>
      <Text style={[styles.label, { color: theme.text }]}>
        {label}{' '}
        <Text style={[styles.requiredTag, { color: theme.textSecondary }]}>
          {required ? '(required)' : '(optional)'}
        </Text>
      </Text>
      <TextInput
        ref={inputRef}
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel={`${label}, ${required ? 'required' : 'optional'}`}
        accessibilityHint={error}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: error ? theme.danger : theme.border,
            borderWidth: error ? 2 : 1.5,
          },
        ]}
        {...inputProps}
      />
      {error ? <ErrorText message={error} /> : null}
    </View>
  );
}

function ErrorText({ message }: { message: string }) {
  const theme = useTheme();
  return (
    <Text style={[styles.error, { color: theme.danger }]} accessibilityLiveRegion="polite">
      ⚠︎ {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.four - 4,
    paddingBottom: Spacing.six,
  },
  intro: {
    fontSize: 15,
    lineHeight: 20,
  },
  errorSummary: {
    borderWidth: 2,
    borderRadius: Radius.medium,
    padding: Spacing.three - 4,
  },
  errorSummaryText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three - 4,
  },
  rowField: {
    flexGrow: 1,
    flexBasis: 140,
  },
  fieldGroup: {
    gap: Spacing.two - 2,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  requiredTag: {
    fontSize: 14,
    fontWeight: '500',
  },
  helper: {
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    minHeight: MinTouchSize,
    borderWidth: 1.5,
    borderRadius: Radius.small + 2,
    paddingHorizontal: Spacing.three - 4,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  segmented: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  segment: {
    flex: 1,
    minHeight: MinTouchSize - 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.small + 2,
    borderWidth: 1.5,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MinTouchSize + 8,
    paddingHorizontal: Spacing.three - 4,
    borderWidth: 1.5,
    borderRadius: Radius.small + 2,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  ingredientInput: {
    flex: 1,
  },
  removeButton: {
    width: MinTouchSize,
    height: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIngredient: {
    alignSelf: 'flex-start',
  },
});
