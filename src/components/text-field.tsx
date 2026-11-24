import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { controlHeight, fontFamily, palette, radius, spacing } from '@/theme';
import { ThemedText } from './themed-text';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({ label, error, hint, secureTextEntry, onFocus, onBlur, ...input }: Props) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.field}>
      <ThemedText variant="label">{label}</ThemedText>
      <View
        style={[
          styles.box,
          focused && styles.boxFocused,
          !!error && styles.boxError,
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={palette.textPlaceholder}
          selectionColor={palette.primary}
          secureTextEntry={isPassword && !revealed}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={styles.input}
          {...input}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            hitSlop={8}
            onPress={() => setRevealed((r) => !r)}
          >
            <ThemedText variant="caption" style={styles.toggle}>
              {revealed ? 'Hide' : 'Show'}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ThemedText variant="error" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText variant="caption">{hint}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  box: {
    minHeight: controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
  },
  boxFocused: { borderColor: palette.primary },
  boxError: { borderColor: palette.errorBorder },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: palette.textHeading,
    // Web: the field box draws the focus ring, not the input.
    outlineWidth: 0,
  },
  toggle: { color: palette.textMuted, fontFamily: fontFamily.bodySemiBold },
});
