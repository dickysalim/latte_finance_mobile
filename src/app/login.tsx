import { type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { googleLogin, login, resendVerification } from '@/api';
import { useAuth } from '@/auth/provider';
import { AuthHeader } from '@/components/auth-header';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { DividerLabel } from '@/components/divider-label';
import { GoogleButton } from '@/components/google-button';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { TextLink } from '@/components/text-link';
import { ThemedText } from '@/components/themed-text';
import { toFormProblem } from '@/lib/errors';
import { useCountdown } from '@/lib/use-countdown';
import { clean } from '@/lib/validation';
import { googleEnabled } from '@/auth/google-config';
import { spacing } from '@/theme';

type Problem = { message: string; code: string };

export default function LoginScreen() {
  const { reload } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [resent, setResent] = useState(false);
  const wait = useCountdown(60);

  async function finish(run: () => Promise<unknown>) {
    setBusy(true);
    setProblem(null);
    setResent(false);
    try {
      await run();
      await reload();
    } catch (error) {
      const p = toFormProblem(error);
      setProblem({ code: p.code, message: p.message ?? 'Check the fields and try again.' });
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = () => {
    const id = clean(identifier);
    if (!id || !password) {
      setProblem({ code: 'missing', message: 'Enter your email or username and your password.' });
      return;
    }
    void finish(() => login(id, password));
  };

  async function onResend() {
    setBusy(true);
    try {
      await resendVerification(clean(identifier));
      setResent(true);
      wait.start();
    } catch (error) {
      const p = toFormProblem(error);
      setProblem({ code: p.code, message: p.message ?? 'Could not send the link.' });
    } finally {
      setBusy(false);
    }
  }

  const needsVerification = problem?.code === 'email_not_verified';
  const abandoned = problem?.code === 'signup_abandoned';

  return (
    <Screen>
      <AuthHeader title="Welcome back" subtitle="Log in to see where your money goes." />
      <Card>
        <TextField
          label="Email or username"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          keyboardType="email-address"
          returnKeyType="next"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={onSubmit}
        />
        {problem ? <Notice tone="error">{problem.message}</Notice> : null}
        {resent ? <Notice tone="success">If an account needs verifying, we sent a new link.</Notice> : null}
        {needsVerification ? (
          <Button
            variant="secondary"
            title={wait.running ? `Send the link again in ${wait.left}s` : 'Send the link again'}
            disabled={wait.running}
            loading={busy}
            onPress={onResend}
          />
        ) : null}
        {abandoned ? (
          <ThemedText variant="caption">
            That sign-up was never finished, so it was released. <TextLink href={'/signup' as Href}>Sign up again</TextLink>
          </ThemedText>
        ) : null}
        <Button title="Log in" loading={busy && !needsVerification} onPress={onSubmit} />

        {googleEnabled ? (
          <>
            <DividerLabel>or</DividerLabel>
            {/* Room for Sign in with Apple here (story 55, iOS only, later). */}
            <View style={{ gap: spacing.sm }}>
              <GoogleButton
                title="Continue with Google"
                disabled={busy}
                onIdToken={(idToken) => void finish(() => googleLogin(idToken))}
                onError={() => setProblem({ code: 'google', message: 'Google sign-in did not finish. Please try again.' })}
              />
            </View>
          </>
        ) : null}
      </Card>
      <ThemedText style={{ textAlign: 'center' }}>
        New here? <TextLink href={'/signup' as Href}>Create an account</TextLink>
      </ThemedText>
    </Screen>
  );
}

