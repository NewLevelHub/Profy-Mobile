import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { verifyEmail, resendVerification } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { AuthStackParamList } from '../types';
import { colors, typography, spacing, radii, shadows, fontFamily, fontSize } from '../constants/themes/themes';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
  route: RouteProp<AuthStackParamList, 'VerifyEmail'>;
};

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const login = useAuthStore((s) => s.login);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  async function handleSubmit() {
    if (code.length !== 6) {
      setCodeError('Введите 6-значный код');
      return;
    }

    setCodeError('');
    setFormError('');
    setIsLoading(true);
    try {
      const { access_token, user } = await verifyEmail(email, code.trim());
      login(access_token, user);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 429) {
          setFormError('Слишком много попыток. Подождите и попробуйте снова');
        } else {
          setCodeError('Неверный или истёкший код');
        }
      } else {
        setFormError('Ошибка. Попробуйте позже');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setResendMessage('');
    setResendDisabled(true);
    try {
      await resendVerification(email);
      setResendMessage('Новый код отправлен на почту');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setResendMessage('Подождите 60 секунд перед повторной отправкой');
      } else {
        setResendMessage('Не удалось отправить код. Попробуйте позже');
      }
    } finally {
      setTimeout(() => setResendDisabled(false), 60_000);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.header}>
          <Text style={styles.title}>Подтверждение почты</Text>
          <Text style={styles.subtitle}>
            Мы отправили 6-значный код на{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, codeError ? styles.inputError : null]}
              placeholder="000000"
              placeholderTextColor={colors.textMuted}
              value={code}
              onChangeText={(v) => { setCode(v.replace(/\D/g, '')); setCodeError(''); }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            {codeError ? <Text style={styles.fieldError}>{codeError}</Text> : null}
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <TouchableOpacity
            style={[styles.button, (isLoading || code.length !== 6) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading || code.length !== 6}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Подтвердить</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resendButton, resendDisabled && styles.resendDisabled]}
            onPress={handleResend}
            disabled={resendDisabled}
            activeOpacity={0.7}
          >
            <Text style={[styles.resendText, resendDisabled && styles.resendTextMuted]}>
              Отправить код повторно
            </Text>
          </TouchableOpacity>

          {resendMessage ? <Text style={styles.resendMessage}>{resendMessage}</Text> : null}
        </View>

        <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backText}>
            {'← '}Вернуться ко входу
          </Text>
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
    paddingHorizontal: spacing['2xl'],
    paddingTop: 80,
    paddingBottom: spacing['3xl'],
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  emailHighlight: {
    color: colors.primary,
    fontFamily: fontFamily.semibold,
  },
  form: {
    flex: 1,
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  input: {
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    fontFamily: fontFamily.semibold,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 8,
    ...shadows.card,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  fieldError: {
    ...typography.small,
    marginTop: spacing.xs,
    color: colors.danger,
    paddingHorizontal: spacing.xs,
  },
  formError: {
    ...typography.caption,
    marginBottom: spacing.md,
    color: colors.danger,
    textAlign: 'center',
  },
  button: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
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
  resendButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  resendDisabled: {
    opacity: 0.4,
  },
  resendText: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: fontFamily.semibold,
  },
  resendTextMuted: {
    color: colors.textMuted,
  },
  resendMessage: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
  },
  backText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
