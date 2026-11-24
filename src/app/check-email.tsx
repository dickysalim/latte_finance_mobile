import { type Href } from 'expo-router';
import { useState } from 'react';

import { resendVerification } from '@/api';
import { getPendingEmail } from '@/auth/pending';
import { AuthHeader } from '@/components/auth-header';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { TextLink } from '@/components/text-link';
import { ThemedText } from '@/components/themed-text';
import { toFormProblem } from '@/lib/errors';
import { useCountdown } from '@/lib/use-countdown';
import { clean } from '@/lib/validation';

export default function CheckEmailScreen() {
  const known = getPendingEmail();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The sign-up just sent a link, so the wait starts now.
  const wait = useCountdown(60, !!known);

  async function onResend() {
    setBusy(true);
    setError(null);
    setSent(false);
    try {
      await resendVerification(known ?? clean(typed));
      setSent(true);
      wait.start();
    } catch (e) {
      setError(toFormProblem(e).message ?? 'Could not send the link. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <AuthHeader
        title="Check your email"
        subtitle={known ? `We sent a link to ${known}. Open it to confirm your account.` : 'Open the link we emailed you to confirm your account.'}
      />
      <Card>
        <ThemedText>The link works for 24 hours. After you confirm, come back here and log in.</ThemedText>
        {!known ? (
          <TextField
            label="Email or username"
            value={typed}
            onChangeText={setTyped}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        ) : null}
        {error ? <Notice tone="error">{error}</Notice> : null}
        {sent ? <Notice tone="success">If an account needs verifying, we sent a new link.</Notice> : null}
        <Button
          variant="secondary"
          title={wait.running ? `Send the link again in ${wait.left}s` : 'Send the link again'}
          disabled={wait.running || (!known && !typed.trim())}
          loading={busy}
          onPress={() => void onResend()}
        />
      </Card>
      <ThemedText style={{ textAlign: 'center' }}>
        <TextLink href={'/login' as Href}>Back to log in</TextLink>
      </ThemedText>
    </Screen>
  );
}
