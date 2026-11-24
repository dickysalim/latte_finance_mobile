import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { controlHeight, palette, radius, spacing, type } from '@/theme';
import { ThemedText } from './themed-text';

const variants = {
  primary: { background: palette.primary, pressed: palette.primaryPressed, text: palette.onPrimary, border: palette.primary },
  secondary: { background: palette.surface, pressed: '#F3F4F6', text: palette.textHeading, border: palette.borderStrong },
  ghost: { background: 'transparent', pressed: '#F3F4F6', text: palette.textMuted, border: 'transparent' },
} as const;

type Props = {
  title: string;
  onPress?: () => void;
  variant?: keyof typeof variants;
  loading?: boolean;
  disabled?: boolean;
  /** Small leading element, for example a provider mark. */
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, style }: Props) {
  const v = variants[variant];
  const inactive = !!(disabled || loading);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? v.pressed : v.background,
          borderColor: v.border,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.row}>
          {icon}
          <ThemedText style={[type.button, { color: v.text }]}>{title}</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: controlHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Web: pointer cursor and no text selection on press.
    cursor: 'pointer',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
