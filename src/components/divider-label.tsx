import { StyleSheet, View } from 'react-native';

import { palette, spacing } from '@/theme';
import { ThemedText } from './themed-text';

/** "or" between the form and the provider buttons. */
export function DividerLabel({ children }: { children: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <ThemedText variant="caption">{children}</ThemedText>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: palette.border },
});
