// src/shared/components/Button.tsx
// Full-width design-system button with primary/secondary/danger variants.

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@shared/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const isSecondary = variant === 'secondary';

  const backgroundColor = isDisabled
    ? COLORS.DISABLED
    : variant === 'primary'
      ? COLORS.PRIMARY
      : variant === 'danger'
        ? COLORS.DANGER
        : 'transparent';

  const textColor = isSecondary ? COLORS.PRIMARY : COLORS.WHITE;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor },
        isSecondary && styles.secondaryBorder,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: SPACING.TOUCH_PREFERRED,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.LG,
  },
  secondaryBorder: {
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontSize: TYPOGRAPHY.BODY,
    fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
  },
});
