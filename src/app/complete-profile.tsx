import { useState } from 'react';

import { completeProfile } from '@/api';
import { useAuth } from '@/auth/provider';
import { AuthHeader } from '@/components/auth-header';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { displayName } from '@/lib/displayName';
import { toFormProblem } from '@/lib/errors';
import { clean, validation, type FieldErrors } from '@/lib/validation';

type Field = 'username' | 'name' | 'password';

/** First login of a Google user: pick a username, confirm the name, add a password. */
export default function CompleteProfileScreen() {
  const { me, reload, signOut } = useAuth();
  const [values, setValues] = useState({ username: '', name: displayName(me?.name), password: '' });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (field: Field) => (text: string) => {
    setValues((v) => ({ ...v, [field]: text }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  async function onSubmit() {
    const input = { username: clean(values.username), name: clean(values.name), password: values.password };
    const found: FieldErrors<Field> = {
      username: validation.username(input.username),
      name: validation.name(input.name),
      password: validation.password(input.password),
    };
    setErrors(found);
    setNotice(null);
    if (Object.values(found).some(Boolean)) return;

    setBusy(true);
    try {
      await completeProfile(input);
      await reload();
    } catch (error) {
      const p = toFormProblem(error);
      if (p.code === 'username_taken') setErrors({ username: p.message });
      else if (p.code === 'profile_completed') await reload();
      else if (Object.keys(p.fields).length > 0) setErrors(p.fields);
      else setNotice(p.message ?? 'Could not save your profile. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <AuthHeader
        title="Finish your profile"
        subtitle="Pick a username and a password. You can then log in with Google or with them."
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
        {notice ? <Notice tone="error">{notice}</Notice> : null}
        <Button title="Continue" loading={busy} onPress={() => void onSubmit()} />
      </Card>
      <Button variant="ghost" title="Log out" onPress={() => void signOut()} />
    </Screen>
  );
}
