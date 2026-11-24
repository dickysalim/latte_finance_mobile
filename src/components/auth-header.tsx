import { Image, StyleSheet, View } from 'react-native';

import { palette, spacing } from '@/theme';
import { ThemedText } from './themed-text';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logo = require('../../assets/brand/logo.png');

/** Logo, page title and one line of help. Same top of every auth screen. */
export function AuthHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="Latte Finance" />
      {title ? (
        <View style={styles.text}>
          <ThemedText variant="title" accessibilityRole="header">
            {title}
          </ThemedText>
          {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  logo: { width: 280, height: 91, alignSelf: 'center' },
  text: { gap: spacing.xs },
  subtitle: { color: palette.textMuted },
});
