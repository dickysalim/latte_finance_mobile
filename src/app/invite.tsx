import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';

import { inviteSignUp, login } from '@/api';
import { useAuth } from '@/auth/provider';
import { AuthHeader } from '@/components/auth-header';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { TextLink } from '@/components/text-link';
import { ThemedText } from '@/components/themed-text';
import { toFormProblem } from '@/lib/errors';
import { clean, validation, type FieldErrors } from '@/lib/validation';

type Field = 'username' | 'name' | 'password';

/**
 * APP_URL/invite?token=... from the invite email, for a person with no account yet.
 * The email is the invite's, so it is not asked. Signing up lands them in the household, then they are logged in.
 */
export default function InviteScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const router = useRouter();
  const { reload } = useAuth();

  const [values, setValues] = useState({ username: '', name: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [problem, setProblem] = useState<{ code: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (field: Field) => (text: string) => {
    setValues((v) => ({ ...v, [field]: text }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  async function onSubmit() {
    if (!token) return;
    const input = { username: clean(values.username), name: clean(values.name), password: values.password };
    const found: FieldErrors<Field> = {
      username: validation.username(input.username),
      name: validation.name(input.name),
      password: validation.password(input.password),
    };
    setErrors(found);
    setProblem(null);
    if (Object.values(found).some(Boolean)) return;

    setBusy(true);
    try {
      await inviteSignUp({ token, ...input });
    } catch (error) {
      const p = toFormProblem(error);
      if (p.code === 'username_taken') setErrors({ username: p.message });
      else if (Object.keys(p.fields).length > 0) setErrors(p.fields);
      else setProblem({ code: p.code, message: p.message ?? 'Could not accept the invite.' });
      setBusy(false);
      return;
    }
    // The account exists now. Log in with what was just typed.
    try {
      await login(input.username, input.password);
      await reload();
      router.replace('/' as Href);
    } catch {
      router.replace('/login' as Href);
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <Screen>
        <AuthHeader title="This invite link is not valid" subtitle="Open the link from your email again." />
      </Screen>
    );
  }

  const hasAccount = problem?.code === 'email_taken';
  const dead = problem?.code === 'invite_invalid' || problem?.code === 'invite_expired';

  return (
    <Screen>
      <AuthHeader
        title="Join the household"
        subtitle="You were invited. Pick a username and a password to create your account."
      />
      <Card>
        <TextField
          label="Username"
          value={values.username}
          onChangeText={set('username')}
          error={errors.username}
          hint="3 to 30 characters, no spaces or @."
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username-new"
        />
        <TextField
          label="Name"
          value={values.name}
          onChangeText={set('name')}
          error={errors.name}
          autoCapitalize="words"
          autoComplete="name"
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
          returnKeyType="go"
          onSubmitEditing={() => void onSubmit()}
        />
        {problem ? <Notice tone="error">{problem.message}</Notice> : null}
        {hasAccount ? (
          <ThemedText variant="caption">
            <TextLink href={'/login' as Href}>Log in</TextLink> and find the invite in your list.
          </ThemedText>
        ) : null}
        {dead ? <ThemedText variant="caption">Ask the person who invited you to send a new link.</ThemedText> : null}
        <Button title="Create account and join" loading={busy} onPress={() => void onSubmit()} />
      </Card>
    </Screen>
  );
}
