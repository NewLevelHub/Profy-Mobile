import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { registerUser, loginUser } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { AuthStackParamList } from '../types';
import { colors, typography, spacing, radii, shadows, fontFamily, fontSize } from '../constants/themes/themes';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

function validateEmail(email: string): string {
  return email.includes('@') ? '' : 'Введите корректный email';
}

function validatePassword(password: string): string {
  return password.length >= 6 ? '' : 'Минимум 6 символов';
}

export default function RegisterScreen({ navigation }: Props) {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setFormError('');
    setIsLoading(true);
    try {
      await registerUser(email.trim(), password);
      const { access_token, user } = await loginUser(email.trim(), password);
      login(access_token, user);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message: string = err.response?.data?.message ?? '';
        if (status === 400 && message.toLowerCase().includes('already')) {
          setEmailError('Этот email уже зарегистрирован');
        } else if (status === 409) {
          setEmailError('Этот email уже зарегистрирован');
        } else {
          setFormError('Ошибка регистрации. Попробуйте позже');
        }
      } else {
        setFormError('Ошибка. Попробуйте позже');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View style={styles.brandBubble}>
            <Text style={styles.brandEmoji}>🎯</Text>
          </View>
          <Text style={styles.brandName}>Profy</Text>
          <Text style={styles.brandTagline}>Начни свой путь</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Регистрация</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="your@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={(v) => { setEmail(v); setEmailError(''); }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder="Минимум 6 символов"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={(v) => { setPassword(v); setPasswordError(''); }}
              secureTextEntry
              autoComplete="new-password"
            />
            {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
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
              <Text style={styles.buttonText}>Создать аккаунт</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>
            Уже есть аккаунт?{' '}
            <Text style={styles.linkAccent}>Войти</Text>
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
    paddingTop: 60,
    paddingBottom: spacing['3xl'],
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  brandBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
  brandEmoji: {
    fontSize: 32,
  },
  brandName: {
    fontFamily: fontFamily.black,
    fontSize: 28,
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  brandTagline: {
    ...typography.caption,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    marginBottom: spacing.xl,
  },
  cardTitle: {
    ...typography.h1,
    marginBottom: spacing['2xl'],
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  inputError: {
    borderColor: colors.danger,
  },
  fieldError: {
    ...typography.small,
    marginTop: spacing.xs,
    color: colors.danger,
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
  link: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  linkText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  linkAccent: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
  },
});
