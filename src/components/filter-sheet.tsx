import { useEffect, useRef } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { Chip } from '@/components/chip';
import { CloseIcon } from '@/components/icons';
import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useLargeText } from '@/hooks/use-large-text';
import { useTheme } from '@/hooks/use-theme';
import { DIFFICULTIES, EMPTY_FILTERS, type Difficulty, type RecipeFilters } from '@/types/recipe';
import { announce } from '@/utils/announce';
import { DIFFICULTY_LABELS } from '@/utils/format';

type FilterSheetProps = {
  visible: boolean;
  filters: RecipeFilters;
  resultCount: number;
  onChange: (filters: RecipeFilters) => void;
  onClose: () => void;
};

/** Bottom sheet built on the core Modal. Filters apply immediately. */
export function FilterSheet({ visible, filters, resultCount, onChange, onClose }: FilterSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const largeText = useLargeText();

  // The result count on the screen behind the modal can't be heard, so speak it here.
  const announcedCount = useRef(resultCount);
  useEffect(() => {
    if (visible && resultCount !== announcedCount.current) {
      announce(`${resultCount} ${resultCount === 1 ? 'recipe' : 'recipes'} match`);
    }
    announcedCount.current = resultCount;
  }, [visible, resultCount]);

  const toggleDifficulty = (difficulty: Difficulty) => {
    const difficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter((d) => d !== difficulty)
      : [...filters.difficulties, difficulty];
    onChange({ ...filters, difficulties });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent>
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlay }]}
          onPress={onClose}
          // Tap-outside-to-dismiss for touch users; screen readers use the close button.
          accessible={false}
          importantForAccessibility="no"
          accessibilityElementsHidden
        />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.background, paddingBottom: insets.bottom + Spacing.three },
          ]}
          accessibilityViewIsModal>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
              Filters
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close filters"
              style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.6 : 1 }]}>
              <CloseIcon color={theme.text} size={18} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.groupLabel, { color: theme.textSecondary }]} accessibilityRole="header">
              Diet and time
            </Text>
            <View style={styles.chips}>
              <Chip
                label="Vegetarian"
                selected={filters.vegetarian}
                onPress={() => onChange({ ...filters, vegetarian: !filters.vegetarian })}
              />
              <Chip
                label="Under 30 min"
                selected={filters.under30}
                onPress={() => onChange({ ...filters, under30: !filters.under30 })}
              />
            </View>

            <Text style={[styles.groupLabel, { color: theme.textSecondary }]} accessibilityRole="header">
              Difficulty
            </Text>
            <View style={styles.chips}>
              {DIFFICULTIES.map((difficulty) => (
                <Chip
                  key={difficulty}
                  label={DIFFICULTY_LABELS[difficulty]}
                  selected={filters.difficulties.includes(difficulty)}
                  onPress={() => toggleDifficulty(difficulty)}
                />
              ))}
            </View>
          </ScrollView>

          <View style={[styles.footer, largeText && styles.footerStacked]}>
            <AppButton
              label="Clear all"
              variant="secondary"
              onPress={() => onChange(EMPTY_FILTERS)}
              style={!largeText && styles.footerButton}
            />
            <AppButton
              label={`Show ${resultCount} ${resultCount === 1 ? 'recipe' : 'recipes'}`}
              onPress={onClose}
              style={!largeText && styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.large + 4,
    borderTopRightRadius: Radius.large + 4,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    maxHeight: '85%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    marginBottom: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  closeButton: {
    width: MinTouchSize,
    height: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -Spacing.two,
  },
  content: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  groupLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  footerStacked: {
    flexDirection: 'column',
  },
  footerButton: {
    flex: 1,
  },
});
