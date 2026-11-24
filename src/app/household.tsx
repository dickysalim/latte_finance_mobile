import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ApiError, acceptInvite, createHousehold, listInvites, type WaitingInvite } from '@/api';
import { useAuth } from '@/auth/provider';
import { AuthHeader } from '@/components/auth-header';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { displayName } from '@/lib/displayName';
import { toFormProblem } from '@/lib/errors';
import { palette, spacing } from '@/theme';

function deviceTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

/** First household: start a new one, or pick between the invites that are waiting. */
export default function HouseholdScreen() {
  const { reload, signOut } = useAuth();
  const [invites, setInvites] = useState<WaitingInvite[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const reply = await listInvites();
      setError(null);
      setInvites(reply.invites);
    } catch (e) {
      setError(toFormProblem(e).message ?? 'Could not load your invites.');
    }
  }, []);

  useEffect(() => {
    // Reads the waiting invites (server) once when the screen opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function run(key: string, action: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await action();
      await reload();
    } catch (e) {
      // Another tab already finished this step: just move on.
      if (e instanceof ApiError && e.code === 'household_already_set') await reload();
      else setError(toFormProblem(e).message ?? 'Something went wrong. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  async function startOwn(ignoreInvites: boolean) {
    const timezone = deviceTimeZone();
    try {
      await createHousehold({ ignoreInvites, timezone });
    } catch (e) {
      // An unknown time zone name must not block sign-up: the worker falls back to Asia/Jakarta.
      if (e instanceof ApiError && e.fields?.timezone) await createHousehold({ ignoreInvites });
      else throw e;
    }
  }

  if (invites === null && !error) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={palette.textMuted} />
        </View>
      </Screen>
    );
  }

  const waiting = invites ?? [];
  const hasInvites = waiting.length > 0;

  return (
    <Screen>
      <AuthHeader
        title={hasInvites ? 'You have been invited' : 'Set up your household'}
        subtitle={
          hasInvites
            ? 'Join a household that invited you, or start your own. The invites you skip stay open.'
            : 'A household holds your accounts and transactions. Others can join later by invite.'
        }
      />
      {error ? <Notice tone="error">{error}</Notice> : null}

      {hasInvites ? (
        <Card>
          {waiting.map((invite) => (
            <View key={invite.invite_id} style={styles.invite}>
              <View style={styles.inviteText}>
                <ThemedText variant="bodyStrong">{displayName(invite.invited_by_name)}</ThemedText>
                <ThemedText variant="caption">
                  Invited you on {new Date(invite.created_at * 1000).toLocaleDateString()}
                </ThemedText>
              </View>
              <Button
                title="Join"
                loading={busy === invite.invite_id}
                disabled={busy !== null}
                onPress={() => void run(invite.invite_id, () => acceptInvite(invite.invite_id))}
              />
            </View>
          ))}
        </Card>
      ) : null}

      <Button
        variant={hasInvites ? 'secondary' : 'primary'}
        title={hasInvites ? 'Start my own household' : 'Create my household'}
        loading={busy === 'own'}
        disabled={busy !== null && busy !== 'own'}
        onPress={() => void run('own', () => startOwn(hasInvites))}
      />
      {error && invites === null ? <Button variant="ghost" title="Try again" onPress={() => void load()} /> : null}
      <Button variant="ghost" title="Log out" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: spacing.xxl, alignItems: 'center' },
  invite: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  inviteText: { flex: 1, gap: 2 },
});
