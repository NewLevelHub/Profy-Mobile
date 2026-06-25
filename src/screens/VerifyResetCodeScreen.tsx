import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { forgotPassword, verifyResetCode } from '../api/auth';
import { AuthStackParamList } from '../types';
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  fontFamily,
  fontSize,
} from '../constants/themes/themes';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'VerifyResetCode'>;
  route: RouteProp<AuthStackParamList, 'VerifyResetCode'>;
};

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 1) return email;
  return email[0] + '***' + email.slice(atIndex);
}

export default function VerifyResetCodeScreen({ navigation, route }: Props) {
  const { email } = route.params;

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN);

  const inputRefs = useRef<Array<TextInput | null>>(Array(CODE_LENGTH).fill(null));

  useEffect(() => {
    const id = setInterval(() => {
      setResendSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleChange = useCallback((index: number, value: string) => {
    if (value.length > 1) {
      const cleaned = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
      if (cleaned.length === CODE_LENGTH) {
        setDigits(cleaned.split(''));
        setCodeError('');
        inputRefs.current[CODE_LENGTH - 1]?.focus();
        return;
      }
    }

    const digit = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setCodeError('');

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback(
    (index: number, { nativeEvent }: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  async function handleVerify() {
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      setCodeError('Введите все 6 цифр');
      return;
    }

    setIsLoading(true);
    try {
      await verifyResetCode(email, code);
      navigation.navigate('ResetPassword', { email, code });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setCodeError('Неверный или истёкший код');
      } else {
        setCodeError('Ошибка. Попробуйте позже');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (resendSeconds > 0) return;
    setIsResending(true);
    try {
      await forgotPassword(email);
      setResendSeconds(RESEND_COOLDOWN);
      setDigits(Array(CODE_LENGTH).fill(''));
      setCodeError('');
      inputRefs.current[0]?.focus();
    } catch {
      // Silent — same security non-disclosure policy
    } finally {
      setIsResending(false);
    }
  }

  const canResend = resendSeconds === 0;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Назад</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Введите код из письма</Text>
          <Text style={styles.subtitle}>
            {'Мы отправили код на '}
            <Text style={styles.emailHighlight}>{maskEmail(email)}</Text>
          </Text>
        </View>

        <View style={styles.otpRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              style={[
                styles.otpCell,
                digit ? styles.otpCellFilled : null,
                codeError ? styles.otpCellError : null,
              ]}
              value={digit}
              onChangeText={(v) => handleChange(index, v)}
              onKeyPress={(e) => handleKeyPress(index, e)}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              selectTextOnFocus
              caretHidden={false}
              textContentType="oneTimeCode"
            />
          ))}
        </View>

        {codeError ? <Text style={styles.codeError}>{codeError}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>Подтвердить</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendRow}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              {isResending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.resendActive}>Отправить повторно</Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendCooldown}>
              {'Отправить повторно через '}
              <Text style={styles.resendTimer}>{resendSeconds}</Text>
              {' с'}
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['3xl'],
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
    gap: spacing.xs,
  },
  backArrow: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.title,
    color: colors.primary,
    lineHeight: 26,
  },
  backLabel: {
    ...typography.body,
    color: colors.primary,
  },
  header: {
    marginBottom: spacing['3xl'],
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    lineHeight: 22,
  },
  emailHighlight: {
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  otpCell: {
    width: 48,
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.title,
    color: colors.text,
    ...shadows.card,
  },
  otpCellFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  otpCellError: {
    borderColor: colors.danger,
  },
  codeError: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  button: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.button,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.label,
    color: colors.onPrimary,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendActive: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: fontFamily.extrabold,
  },
  resendCooldown: {
    ...typography.caption,
  },
  resendTimer: {
    fontFamily: fontFamily.extrabold,
    color: colors.text,
  },
});
