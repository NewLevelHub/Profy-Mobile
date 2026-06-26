import React, { useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { colors, spacing, radii, shadows, fontFamily } from '../../constants/themes/themes';

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
  length?: number;
}

export default function OtpInput({ value, onChange, hasError = false, length = 6 }: OtpInputProps) {
  const inputs = useRef<Array<TextInput | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  function handleChange(text: string, index: number) {
    const clean = text.replace(/\D/g, '');
    if (clean.length > 1) {
      const pasted = clean.slice(0, length);
      onChange(pasted);
      inputs.current[Math.min(pasted.length, length - 1)]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = clean;
    onChange(next.join(''));
    if (clean && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      onChange(next.join(''));
      inputs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputs.current[index] = ref; }}
          style={[
            styles.box,
            digit ? styles.boxFilled : null,
            hasError ? styles.boxError : null,
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={2}
          autoFocus={index === 0}
          textContentType="oneTimeCode"
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  box: {
    flex: 1,
    height: 58,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    textAlign: 'center',
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    color: colors.text,
    ...shadows.card,
  },
  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  boxError: {
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
});
