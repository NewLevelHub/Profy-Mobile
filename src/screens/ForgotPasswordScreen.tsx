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
import axios from 'axios';
import { forgotPassword } from '../api/auth';
import { AuthStackParamList } from '../types';
import { colors, typography, spacing, radii, shadows, fontFamily, fontSize } from '../constants/themes/themes';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

function validateEmail(email: string): string {
  return email.includes('@') ? '' : 'Введите корректный email';
}

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (eErr) return;

    setFormError('');
    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      navigation.navigate('ResetPassword', { email: email.trim() });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setFormError('Слишком много запросов. Попробуйте позже');
      } else {
        setFormError('Ошибка. Попробуйте позже');
      }
    } finally {
      setIsLoading(false);
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
          <Text style={styles.title}>Сброс пароля</Text>
          <Text style={styles.subtitle}>
            Введите почту — мы отправим код для создания нового пароля
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="Электронная почта"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={(v) => { setEmail(v); setEmailError(''); }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              autoFocus
            />
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Отправить код</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backText}>{'← '}Вернуться ко входу</Text>
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
    fontSize: fontSize.body,
    color: colors.text,
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
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.label,
    color: colors.onPrimary,
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
