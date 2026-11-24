import { Link, type Href } from 'expo-router';
import { StyleSheet } from 'react-native';

import { fontFamily, palette, type } from '@/theme';

/** Inline navigation link in the body text style, underlined so it reads as a link. */
export function TextLink({ href, children }: { href: Href; children: string }) {
  return (
    <Link href={href} style={styles.link}>
      {children}
    </Link>
  );
}

const styles = StyleSheet.create({
  link: {
    ...type.body,
    fontFamily: fontFamily.bodySemiBold,
    color: palette.textHeading,
    textDecorationLine: 'underline',
  },
});
