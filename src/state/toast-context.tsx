import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTheme } from '@/hooks/use-theme';
import { announce } from '@/utils/announce';

const TOAST_DURATION_MS = 3000;
/** Keeps the toast clear of tab bars and sticky footers. */
const TOAST_BOTTOM_OFFSET = 112;

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);

  const showToast = (message: string) => {
    setToast({ message, key: Date.now() });
    // Queued so it survives the screen change that often follows (e.g. after saving).
    announce(message);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast key={toast.key} message={toast.message} onHide={() => setToast(null)} />}
    </ToastContext.Provider>
  );
}

function Toast({ message, onHide }: { message: string; onHide: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const duration = reducedMotion ? 0 : 200;
    Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }).start();
    const timeout = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration, useNativeDriver: true }).start(onHide);
    }, TOAST_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [opacity, onHide, reducedMotion]);

  return (
    <Animated.View
      pointerEvents="none"
      // The message is announced via announceForAccessibility when shown.
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[
        styles.toast,
        {
          opacity,
          bottom: insets.bottom + TOAST_BOTTOM_OFFSET,
          backgroundColor: theme.inverseBackground,
        },
      ]}>
      <Text style={[styles.text, { color: theme.inverseText }]}>{message}</Text>
    </Animated.View>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});
