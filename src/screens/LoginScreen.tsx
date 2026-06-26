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
import { loginUser, loginWithGoogle } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { AuthStackParamList } from '../types';
import { colors, typography, spacing, radii, shadows, fontFamily, fontSize } from '../constants/themes/themes';
import GoogleSignInButton from '../components/common/GoogleSignInButton';
import Toast from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { signInWithGoogle, isErrorWithCode, statusCodes } from '../services/googleAuth';

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toastMessage, showToast, hideToast } = useToast();

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
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setFormError('Неверный email или пароль');
        } else if (status === 403 && err.response?.data?.detail?.detail === 'email_not_verified') {
          navigation.navigate('VerifyEmail', { email: email.trim() });
        } else {
          setFormError('Ошибка. Попробуйте позже');
        }
      } else {
        setFormError('Ошибка. Попробуйте позже');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      const result = await loginWithGoogle(idToken);
      login(result.access_token, { id: result.user_id, email: '', name: '' });
      if (result.is_new_user) {
        showToast('Добро пожаловать! Аккаунт создан');
      }
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) return;
      showToast('Не удалось войти через Google, попробуйте позже');
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <View style={styles.flex}>
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

          {/* Form + Google + Link */}
          <View>
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

              <TouchableOpacity style={styles.forgotLink} onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Забыли пароль?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>или</Text>
              <View style={styles.dividerLine} />
            </View>

            <GoogleSignInButton onPress={handleGoogleSignIn} isLoading={isGoogleLoading} />

            <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>
                Нет аккаунта?{' '}
                <Text style={styles.linkAccent}>Зарегистрироваться</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast message={toastMessage} onHide={hideToast} />
    </View>
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
  forgotLink: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  forgotText: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: fontFamily.semibold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: spacing.sm,
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
