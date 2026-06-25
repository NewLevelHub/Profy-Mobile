import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { verifyEmail, resendVerificationCode } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { AuthStackParamList } from '../types';
import { colors, typography, spacing, radii, shadows, fontFamily, fontSize } from '../constants/themes/themes';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
  route: RouteProp<AuthStackParamList, 'VerifyEmail'>;
};

const RESEND_COOLDOWN = 60;
const CODE_LENGTH = 6;

function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return email;
  return email[0] + '***' + email.slice(atIndex);
}

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const login = useAuthStore((s) => s.login);

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [formError, setFormError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);

  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const handleChange = useCallback((text: string, index: number) => {
    setFormError('');

    if (text.length > 1) {
      const clean = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
      const next = [...clean.split(''), ...Array(CODE_LENGTH).fill('')].slice(0, CODE_LENGTH);
      setDigits(next);
      const focusIndex = Math.min(clean.length, CODE_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = text.replace(/\D/g, '');
    setDigits(next);
    if (text && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [digits]);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  async function handleVerify() {
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      setFormError('Введите все 6 цифр');
      return;
    }

    setFormError('');
    setIsVerifying(true);
    try {
      const { access_token, user } = await verifyEmail(email, code);
      login(access_token, user);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail: string = err.response?.data?.detail ?? '';
        if (detail.includes('expired')) {
          setFormError('Код истёк. Запросите новый');
        } else {
          setFormError('Неверный код. Попробуйте ещё раз');
        }
      } else {
        setFormError('Ошибка. Попробуйте позже');
      }
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    setFormError('');
    try {
      await resendVerificationCode(email);
      setDigits(Array(CODE_LENGTH).fill(''));
      setCountdown(RESEND_COOLDOWN);
      inputRefs.current[0]?.focus();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setFormError('Подождите 60 секунд перед повторной отправкой');
      } else {
        setFormError('Не удалось отправить код. Попробуйте позже');
      }
    } finally {
      setIsResending(false);
    }
  }

  const canResend = countdown <= 0 && !isResending;
  const maskedEmail = maskEmail(email);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.header}>
          <Text style={styles.title}>Подтвердите email</Text>
          <Text style={styles.subtitle}>
            {'Мы отправили 6-значный код на '}
            <Text style={styles.emailHighlight}>{maskedEmail}</Text>
          </Text>
        </View>

        <View style={styles.otpRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[styles.otpCell, digit ? styles.otpCellFilled : null]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              textAlign="center"
              autoFocus={index === 0}
              selectTextOnFocus
            />
          ))}
        </View>

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <TouchableOpacity
          style={[styles.button, (isVerifying || digits.join('').length < CODE_LENGTH) && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={isVerifying || digits.join('').length < CODE_LENGTH}
          activeOpacity={0.85}
        >
          {isVerifying ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>Подтвердить</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendRow}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              {isResending ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={styles.resendActive}>Отправить повторно</Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              {'Отправить повторно через '}
              <Text style={styles.resendTimerCount}>{countdown} с</Text>
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>← Назад</Text>
        </TouchableOpacity>
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
    paddingTop: 80,
    paddingBottom: spacing['3xl'],
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  otpCell: {
    width: 48,
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.title,
    color: colors.text,
    ...shadows.card,
  },
  otpCellFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  formError: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    width: '100%',
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
    marginBottom: spacing.xl,
  },
  resendActive: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: fontFamily.extrabold,
  },
  resendTimer: {
    ...typography.caption,
    color: colors.textMuted,
  },
  resendTimerCount: {
    fontFamily: fontFamily.bold,
    color: colors.textSecondary,
  },
  backLink: {
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
