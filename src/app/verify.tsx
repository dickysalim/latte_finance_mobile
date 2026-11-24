import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';

import { resendVerification, verifyEmail } from '@/api';
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

/**
 * APP_URL/verify?token=... from the verification email.
 * Never verifies on open (mail scanners open links): the person types the password and presses the button.
 */
export default function VerifyScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [problem, setProblem] = useState<{ code: string; message: string } | null>(null);

  const [identifier, setIdentifier] = useState('');
  const [resent, setResent] = useState(false);
  const wait = useCountdown(60);

  async function onVerify() {
    if (!token) return;
    setBusy(true);
    setProblem(null);
    setPasswordError(undefined);
    try {
      await verifyEmail(token, password || undefined);
      setDone(true);
    } catch (error) {
      const p = toFormProblem(error);
      if (p.code === 'wrong_password') setPasswordError(p.message);
      else setProblem({ code: p.code, message: p.message ?? 'Could not verify your email.' });
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    setBusy(true);
    try {
      await resendVerification(clean(identifier));
      setResent(true);
      wait.start();
    } catch (error) {
      setProblem({ code: 'resend', message: toFormProblem(error).message ?? 'Could not send the link.' });
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <Screen>
        <AuthHeader title="This link is not valid" subtitle="Open the link from your email again, or log in to ask for a new one." />
        <ThemedText>
          <TextLink href={'/login' as Href}>Go to log in</TextLink>
        </ThemedText>
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen>
        <AuthHeader title="Email confirmed" subtitle="Your account is ready. Log in to continue." />
        <Button title="Log in" onPress={() => router.replace('/login' as Href)} />
      </Screen>
    );
  }

  const expired = problem?.code === 'link_expired';
  const abandoned = problem?.code === 'signup_abandoned';

  return (
    <Screen>
      <AuthHeader title="Confirm your email" subtitle="Enter the password you chose at sign-up to confirm it is you." />
      <Card>
        <TextField
          label="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setPasswordError(undefined);
          }}
          error={passwordError}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          returnKeyType="go"
          onSubmitEditing={() => void onVerify()}
        />
        {problem ? <Notice tone="error">{problem.message}</Notice> : null}
        <Button title="Confirm email" loading={busy && !expired} onPress={() => void onVerify()} />

        {expired ? (
          <>
            <TextField
              label="Email or username"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            {resent ? <Notice tone="success">If an account needs verifying, we sent a new link.</Notice> : null}
            <Button
              variant="secondary"
              title={wait.running ? `Send a new link in ${wait.left}s` : 'Send me a new link'}
              disabled={wait.running || !identifier.trim()}
              loading={busy}
              onPress={() => void onResend()}
            />
          </>
        ) : null}
        {abandoned ? (
          <ThemedText variant="caption">
            <TextLink href={'/signup' as Href}>Sign up again</TextLink>
          </ThemedText>
        ) : null}
      </Card>
    </Screen>
  );
}
