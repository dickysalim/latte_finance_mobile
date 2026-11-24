import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { maxContentWidth, motion, palette, spacing } from '@/theme';

/**
 * Page frame: gray background, one centred column, keyboard aware.
 * The content rises in once on mount (Reanimated drops this to a fade when the user asked for reduced motion).
 */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(motion.base)} style={styles.content}>
            {children}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** A group of items with one tight rhythm; use between a heading and its body. */
export function Stack({ gap = 'md', children }: { gap?: keyof typeof spacing; children: ReactNode }) {
  return <View style={{ gap: spacing[gap] }}>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  content: { width: '100%', maxWidth: maxContentWidth, gap: spacing.lg },
});
