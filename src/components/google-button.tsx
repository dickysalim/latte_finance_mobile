import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import { googleClientIds, googleEnabled } from '@/auth/google-config';
import { fontFamily, palette } from '@/theme';
import { Button } from './button';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  title: string;
  disabled?: boolean;
  /** Called with Google's id_token after the user picks an account. */
  onIdToken: (idToken: string) => void;
  onError?: () => void;
};

/** Renders nothing when no Google client ID is configured for this platform. */
export function GoogleButton(props: Props) {
  if (!googleEnabled) return null;
  return <ConfiguredGoogleButton {...props} />;
}

function ConfiguredGoogleButton({ title, disabled, onIdToken, onError }: Props) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(googleClientIds);

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) onIdToken(idToken);
      else onError?.();
    } else if (response?.type === 'error') {
      onError?.();
    }
    // Only react to a new response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return (
    <Button
      variant="secondary"
      title={title}
      disabled={disabled || !request}
      icon={<Text style={styles.mark}>G</Text>}
      onPress={() => void promptAsync()}
    />
  );
}

const styles = StyleSheet.create({
  mark: { fontFamily: fontFamily.headingBold, fontSize: 16, color: palette.textHeading },
});
