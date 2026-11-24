import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/provider';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { displayName, householdLabel } from '@/lib/displayName';
import { palette, spacing } from '@/theme';

/** End of Flow 1 (story 56): proof that sign-up, login and the first household worked. */
export default function Flow1FinishedScreen() {
  const { me, signOut } = useAuth();
  const household = householdLabel(me?.household_owner_name);

  return (
    <Screen>
      <Card>
        <ThemedText variant="display" accessibilityRole="header">
          Flow 1 finished
        </ThemedText>
        <View style={styles.facts}>
          <Fact label="Name" value={displayName(me?.name)} />
          <Fact label="Household" value={household || '-'} />
        </View>
        <Button variant="secondary" title="Log out" onPress={() => void signOut()} />
      </Card>
    </Screen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <ThemedText variant="caption">{label}</ThemedText>
      <ThemedText variant="headline">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  facts: {
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.border,
  },
  fact: { gap: 2 },
});
