import { StyleSheet, View } from 'react-native';

import { palette, radius, spacing } from '@/theme';
import { ThemedText } from './themed-text';

/** Inline message for a whole form: an error from the server, or a short success line. */
export function Notice({ tone, children }: { tone: 'error' | 'success'; children: string }) {
  const isError = tone === 'error';
  return (
    <View
      accessibilityRole={isError ? 'alert' : undefined}
      style={[styles.box, { backgroundColor: isError ? palette.errorSurface : palette.successSurface }]}
    >
      <ThemedText variant="label" style={{ color: isError ? palette.error : palette.success }}>
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: spacing.md, borderRadius: radius.md },
});
