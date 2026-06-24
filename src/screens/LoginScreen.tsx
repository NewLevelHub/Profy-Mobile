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
import { loginUser } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { AuthStackParamList } from '../types';
import { colors, typography, spacing, radii, shadows, fontFamily, fontSize } from '../constants/themes/themes';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

function validateEmail(email: string): string {
  return email.includes('@') ? '' : 'Введите корректный email';
}

function validatePassword(password: string): string {
  return password.length >= 6 ? '' : 'Минимум 6 символов';
}

export default function LoginScreen({ navigation }: Props) {
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
      const { access_token, user } = await loginUser(email.trim(), password);
      login(access_token, user);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setFormError('Неверный email или пароль');
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
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.iconWrapper}>
            <View style={styles.iconBox}>
              <Text style={styles.iconLetter}>P</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeStar}>✦</Text>
            </View>
          </View>
          <Text style={styles.brandName}>Profy</Text>
          <Text style={styles.brandTagline}>Найди дело, которое тебе по душе</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Вход</Text>

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
            />
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder="Пароль"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={(v) => { setPassword(v); setPasswordError(''); }}
              secureTextEntry
              autoComplete="current-password"
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
              <Text style={styles.buttonText}>Войти</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>
            Нет аккаунта?{' '}
            <Text style={styles.linkAccent}>Зарегистрироваться</Text>
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
    paddingTop: 72,
    paddingBottom: spacing['3xl'],
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8,
  },
  iconLetter: {
    fontFamily: fontFamily.black,
    fontSize: 38,
    color: colors.onPrimary,
    letterSpacing: -1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  badgeStar: {
    fontSize: 10,
    color: colors.onPrimary,
  },
  brandName: {
    fontFamily: fontFamily.black,
    fontSize: 30,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  brandTagline: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.h1,
    color: colors.text,
    marginBottom: spacing.lg,
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
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  fieldError: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.small,
    marginTop: spacing.xs,
    color: colors.danger,
    paddingHorizontal: spacing.xs,
  },
  formError: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
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
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  linkAccent: {
    color: colors.primary,
    fontFamily: fontFamily.extrabold,
  },
});
