import { StyleSheet, View } from 'react-native';

import { fontFamily, palette, spacing } from '@/theme';
import { ThemedText } from './themed-text';

/** Wordmark, page title and one line of help. Same top of every auth screen. */
export function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.brand}>Latte Finance</ThemedText>
      <View style={styles.text}>
        <ThemedText variant="title" accessibilityRole="header">
          {title}
        </ThemedText>
        {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  brand: {
    fontFamily: fontFamily.headingBold,
    fontSize: 15,
    letterSpacing: 0.2,
    color: palette.textHeading,
  },
  text: { gap: spacing.xs },
  subtitle: { color: palette.textMuted },
});
