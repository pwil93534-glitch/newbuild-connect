import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../design-system';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function TextInput({
  label,
  error,
  prefixIcon,
  suffixIcon,
  containerStyle,
  style,
  ...props
}: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputRow,
          focused && styles.focused,
          error ? styles.errored : null,
        ]}
      >
        {prefixIcon && <View style={styles.icon}>{prefixIcon}</View>}
        <RNTextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textSecondary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {suffixIcon && <View style={styles.icon}>{suffixIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundPrimary,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
  },
  focused: { borderColor: Colors.primary },
  errored: { borderColor: Colors.danger },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  icon: { marginHorizontal: Spacing.xs },
  error: {
    fontSize: FontSize.xs,
    color: Colors.danger,
  },
});
