import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { EmptyState } from '@/components/empty-state';
import { ClockIcon } from '@/components/icons';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRecipes } from '@/state/recipes-context';
import type { Step } from '@/types/recipe';
import { formatClock, spokenSeconds } from '@/utils/format';

type TimerState = {
  /** Epoch ms when a running timer ends; `null` while paused or idle. */
  endAt: number | null;
  /** Seconds left while paused. */
  remaining: number;
  finished: boolean;
};

function initialTimers(steps: Step[]): Record<number, TimerState> {
  const timers: Record<number, TimerState> = {};
  steps.forEach((step, index) => {
    if (step.timerSeconds) {
      timers[index] = { endAt: null, remaining: step.timerSeconds, finished: false };
    }
  });
  return timers;
}

function secondsLeft(timer: TimerState, now: number) {
  return timer.endAt ? Math.max(0, (timer.endAt - now) / 1000) : timer.remaining;
}

export default function CookingModeScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const recipe = useRecipes().getRecipe(id);
  const steps = recipe?.steps ?? [];

  const [stepIndex, setStepIndex] = useState(0);
  const [timers, setTimers] = useState(() => initialTimers(steps));
  const [now, setNow] = useState(() => Date.now());

  // The interval callback reads the latest timers through a ref.
  const timersRef = useRef(timers);
  useEffect(() => {
    timersRef.current = timers;
  });

  const anyRunning = Object.values(timers).some((timer) => timer.endAt !== null);

  useEffect(() => {
    if (!anyRunning) return;
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      const done = Object.entries(timersRef.current)
        .filter(([, timer]) => timer.endAt !== null && timer.endAt <= current)
        .map(([index]) => Number(index));
      if (done.length === 0) return;

      setTimers((prev) => {
        const next = { ...prev };
        done.forEach((index) => {
          next[index] = { endAt: null, remaining: 0, finished: true };
        });
        return next;
      });
      const label = done.map((index) => `step ${index + 1}`).join(' and ');
      Vibration.vibrate([0, 500, 250, 500, 250, 500]);
      AccessibilityInfo.announceForAccessibility(`Timer finished for ${label}`);
      Alert.alert('Timer finished', `Time's up for ${label}.`, [{ text: 'OK' }]);
    }, 250);
    return () => clearInterval(interval);
  }, [anyRunning]);

  if (!recipe || steps.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <EmptyState
          title={recipe ? 'No steps yet' : 'Recipe not found'}
          message={recipe ? 'This recipe has no cooking steps.' : 'This recipe may have been removed.'}
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const timer = timers[stepIndex];
  const startLabel = !timer
    ? ''
    : timer.finished
      ? 'Restart'
      : timer.remaining < (step.timerSeconds ?? 0)
        ? 'Resume'
        : 'Start timer';

  const goTo = (index: number) => {
    setStepIndex(index);
    AccessibilityInfo.announceForAccessibility(
      `Step ${index + 1} of ${steps.length}. ${steps[index].text}`
    );
  };

  const updateTimer = (index: number, update: (timer: TimerState) => TimerState) =>
    setTimers((prev) => ({ ...prev, [index]: update(prev[index]) }));

  const startTimer = (index: number) => {
    const current = Date.now();
    setNow(current);
    updateTimer(index, (t) => {
      const duration = t.finished ? (steps[index].timerSeconds ?? 0) : t.remaining;
      return { endAt: current + duration * 1000, remaining: duration, finished: false };
    });
  };

  const pauseTimer = (index: number) => {
    const current = Date.now();
    updateTimer(index, (t) => ({ ...t, endAt: null, remaining: secondsLeft(t, current) }));
  };

  const resetTimer = (index: number) =>
    updateTimer(index, () => ({
      endAt: null,
      remaining: steps[index].timerSeconds ?? 0,
      finished: false,
    }));

  // Timers keep running when moving between steps; list them so they stay visible.
  const otherRunning = Object.entries(timers)
    .map(([index, t]) => ({ index: Number(index), timer: t }))
    .filter(({ index, timer: t }) => index !== stepIndex && t.endAt !== null);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: recipe.title }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressHeader}>
          <Text style={[styles.stepCounter, { color: theme.tint }]} accessibilityRole="header">
            Step {stepIndex + 1} of {steps.length}
          </Text>
          <View
            style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.tint,
                  width: `${((stepIndex + 1) / steps.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {otherRunning.map(({ index, timer: t }) => (
          <Pressable
            key={index}
            onPress={() => goTo(index)}
            accessibilityRole="button"
            accessibilityLabel={`Step ${index + 1} timer running, ${spokenSeconds(secondsLeft(t, now))} left. Go to step ${index + 1}`}
            style={({ pressed }) => [
              styles.runningBanner,
              { backgroundColor: theme.tintSoft, opacity: pressed ? 0.7 : 1 },
            ]}>
            <ClockIcon color={theme.text} size={16} />
            <Text style={[styles.runningBannerText, { color: theme.text }]}>
              Step {index + 1} timer · {formatClock(secondsLeft(t, now))}
            </Text>
          </Pressable>
        ))}

        <Text style={[styles.stepText, { color: theme.text }]}>{step.text}</Text>

        {timer ? (
          <View
            style={[
              styles.timerCard,
              { backgroundColor: theme.backgroundElement, borderColor: timer.finished ? theme.tint : theme.border },
            ]}>
            <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>
              {timer.finished ? "Time's up!" : 'Timer'}
            </Text>
            <Text
              style={[styles.timerValue, { color: timer.finished ? theme.tint : theme.text }]}
              accessibilityLabel={
                timer.finished
                  ? 'Timer finished'
                  : `${spokenSeconds(secondsLeft(timer, now))} ${timer.endAt ? 'remaining' : 'on the timer'}`
              }>
              {formatClock(secondsLeft(timer, now))}
            </Text>
            <View style={styles.timerButtons}>
              {timer.endAt ? (
                <AppButton
                  label="Pause"
                  variant="secondary"
                  onPress={() => pauseTimer(stepIndex)}
                  accessibilityLabel="Pause timer"
                  style={styles.timerButton}
                />
              ) : (
                <AppButton
                  label={startLabel}
                  onPress={() => startTimer(stepIndex)}
                  accessibilityLabel={`${startLabel.replace(' timer', '')} timer`}
                  style={styles.timerButton}
                />
              )}
              <AppButton
                label="Reset"
                variant="ghost"
                onPress={() => resetTimer(stepIndex)}
                accessibilityLabel="Reset timer"
                style={styles.timerButton}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: theme.border,
            paddingBottom: insets.bottom + Spacing.two,
          },
        ]}>
        <AppButton
          label="Previous"
          size="large"
          variant="secondary"
          onPress={() => goTo(stepIndex - 1)}
          disabled={isFirst}
          accessibilityLabel="Previous step"
          style={styles.footerButton}
        />
        <AppButton
          label={isLast ? 'Finish' : 'Next'}
          size="large"
          onPress={() => (isLast ? router.back() : goTo(stepIndex + 1))}
          accessibilityLabel={isLast ? 'Finish cooking' : 'Next step'}
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
    padding: Spacing.four - 4,
    gap: Spacing.four,
  },
  progressHeader: {
    gap: Spacing.two,
  },
  stepCounter: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  runningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 44,
    paddingHorizontal: Spacing.three - 4,
    borderRadius: Radius.small,
  },
  runningBannerText: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  stepText: {
    fontSize: 28,
    lineHeight: 40,
    fontWeight: '600',
  },
  timerCard: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.four - 4,
    borderRadius: Radius.large,
    borderWidth: 2,
  },
  timerLabel: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerValue: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timerButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignSelf: 'stretch',
  },
  timerButton: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three - 4,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three - 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerButton: {
    flex: 1,
  },
});
