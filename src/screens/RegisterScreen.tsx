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
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { registerUser } from '../api/auth';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setFormError('');
    setIsLoading(true);
    try {
      const { email: confirmedEmail } = await registerUser(email.trim(), password);
      navigation.navigate('VerifyEmail', { email: confirmedEmail ?? email.trim() });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message: string = err.response?.data?.detail ?? err.response?.data?.message ?? '';
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
    <KeyboardAvoidingView style={styles.flex} behavior={undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
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

        {/* Form + Link */}
        <View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Регистрация</Text>

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
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.inputWithIcon, passwordError ? styles.inputError : null]}
                  placeholder="Пароль"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setPasswordError(''); }}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(v => !v)} activeOpacity={0.7}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
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
                <Text style={styles.buttonText}>Зарегистрироваться</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>
              Уже есть аккаунт?{' '}
              <Text style={styles.linkAccent}>Войти</Text>
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: spacing['2xl'],
    paddingTop: 72,
    paddingBottom: spacing['3xl'],
  },
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
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
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  badgeStar: {
    ...typography.small,
    color: colors.onPrimary,
  },
  brandName: {
    ...typography.display,
    marginBottom: spacing.xs,
  },
  brandTagline: {
    ...typography.body,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  formTitle: {
    ...typography.h1,
    marginBottom: spacing.lg,
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  inputContainer: {
    position: 'relative',
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
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
  link: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  linkText: {
    ...typography.caption,
  },
  linkAccent: {
    color: colors.primary,
    fontFamily: fontFamily.extrabold,
  },
});
