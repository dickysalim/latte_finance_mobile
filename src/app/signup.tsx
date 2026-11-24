import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';

import { googleLogin, googleSignUp, signUp } from '@/api';
import { googleEnabled } from '@/auth/google-config';
import { setPendingEmail } from '@/auth/pending';
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
import { clean, validation, type FieldErrors } from '@/lib/validation';

type Field = 'email' | 'username' | 'name' | 'password';

export default function SignupScreen() {
  const router = useRouter();
  const { reload } = useAuth();
  const [values, setValues] = useState({ email: '', username: '', name: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (field: Field) => (text: string) => {
    setValues((v) => ({ ...v, [field]: text }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  async function onSubmit() {
    const input = {
      email: clean(values.email),
      username: clean(values.username),
      name: clean(values.name),
      password: values.password,
    };
    const found: FieldErrors<Field> = {
      email: validation.email(input.email),
      username: validation.username(input.username),
      name: validation.name(input.name),
      password: validation.password(input.password),
    };
    setErrors(found);
    setNotice(null);
    if (Object.values(found).some(Boolean)) return;

    setBusy(true);
    try {
      await signUp(input);
      setPendingEmail(input.email);
      router.replace('/check-email' as Href);
    } catch (error) {
      const p = toFormProblem(error);
      if (p.code === 'username_taken') setErrors({ username: p.message });
      else if (Object.keys(p.fields).length > 0) setErrors(p.fields);
      else setNotice(p.message ?? 'Could not sign you up. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle(idToken: string) {
    setBusy(true);
    setNotice(null);
    try {
      await googleSignUp(idToken);
      await googleLogin(idToken);
      await reload();
    } catch (error) {
      setNotice(toFormProblem(error).message ?? 'Google sign-up did not finish. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <AuthHeader title="Create your account" subtitle="Takes a minute. We will email you a link to confirm it." />
      <Card>
        <TextField
          label="Email"
          value={values.email}
          onChangeText={set('email')}
          error={errors.email}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
        />
        <TextField
          label="Username"
          value={values.username}
          onChangeText={set('username')}
          error={errors.username}
          hint="You can log in with it. 3 to 30 characters."
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username-new"
          textContentType="username"
        />
        <TextField
          label="Name"
          value={values.name}
          onChangeText={set('name')}
          error={errors.name}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
        <TextField
          label="Password"
          value={values.password}
          onChangeText={set('password')}
          error={errors.password}
          hint="8 characters or more."
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={() => void onSubmit()}
        />
        {notice ? <Notice tone="error">{notice}</Notice> : null}
        <Button title="Create account" loading={busy} onPress={() => void onSubmit()} />

        {googleEnabled ? (
          <>
            <DividerLabel>or</DividerLabel>
            {/* Room for Sign in with Apple here (story 55, iOS only, later). */}
            <GoogleButton
              title="Sign up with Google"
              disabled={busy}
              onIdToken={(idToken) => void onGoogle(idToken)}
              onError={() => setNotice('Google sign-up did not finish. Please try again.')}
            />
          </>
        ) : null}
      </Card>
      <ThemedText style={{ textAlign: 'center' }}>
        Already have an account? <TextLink href={'/login' as Href}>Log in</TextLink>
      </ThemedText>
    </Screen>
  );
}
