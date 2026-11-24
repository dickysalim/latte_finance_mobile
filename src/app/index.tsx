import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/screen';
import { colors, spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Latte Finance</Text>
      <Text style={styles.subtitle}>Know where your money goes.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: '700', color: colors.primary, marginTop: spacing.xl },
  subtitle: { fontSize: 16, color: colors.textMuted },
});
