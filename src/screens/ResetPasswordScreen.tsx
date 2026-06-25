import React, { useEffect, useState } from 'react';
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
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { resetPassword } from '../api/auth';
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
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
  route: RouteProp<AuthStackParamList, 'ResetPassword'>;
};

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { email, code } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!success) return;
    const id = setTimeout(() => navigation.popToTop(), 1500);
    return () => clearTimeout(id);
  }, [success, navigation]);

  function validateNewPassword(value: string): string {
    return value.length >= MIN_PASSWORD_LENGTH
      ? ''
      : `Минимум ${MIN_PASSWORD_LENGTH} символов`;
  }

  function validateConfirm(password: string, confirm: string): string {
    if (!confirm) return '';
    return password === confirm ? '' : 'Пароли не совпадают';
  }

  function handleNewPasswordChange(value: string) {
    setNewPassword(value);
    setNewPasswordError(validateNewPassword(value));
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirm(value, confirmPassword));
    }
  }

  function handleConfirmChange(value: string) {
    setConfirmPassword(value);
    setConfirmPasswordError(validateConfirm(newPassword, value));
  }

  async function handleSubmit() {
    const npErr = validateNewPassword(newPassword);
    const cpErr = confirmPassword
      ? validateConfirm(newPassword, confirmPassword)
      : 'Повторите пароль';

    setNewPasswordError(npErr);
    setConfirmPasswordError(cpErr);
    if (npErr || cpErr) return;

    setFormError('');
    setIsLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      setSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setFormError('Код недействителен. Запросите новый');
      } else {
        setFormError('Ошибка. Попробуйте позже');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const isFormValid =
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword === newPassword;

  if (success) {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successIcon}>
          <Text style={styles.successCheckmark}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Пароль изменён</Text>
        <Text style={styles.successSubtitle}>Сейчас перенаправим вас ко входу…</Text>
      </View>
    );
  }

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
          <Text style={styles.title}>Новый пароль</Text>
          <Text style={styles.subtitle}>Придумайте надёжный пароль — не менее 8 символов</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.inputWithIcon, newPasswordError ? styles.inputError : null]}
                placeholder="Новый пароль"
                placeholderTextColor={colors.textMuted}
                value={newPassword}
                onChangeText={handleNewPasswordChange}
                secureTextEntry={!showNewPassword}
                autoComplete="new-password"
                autoFocus
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNewPassword(v => !v)} activeOpacity={0.7}>
                <Feather name={showNewPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {newPasswordError ? (
              <Text style={styles.fieldError}>{newPasswordError}</Text>
            ) : null}
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.inputWithIcon, confirmPasswordError ? styles.inputError : null]}
                placeholder="Повторите пароль"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={handleConfirmChange}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(v => !v)} activeOpacity={0.7}>
                <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text style={styles.fieldError}>{confirmPasswordError}</Text>
            ) : null}
          </View>

          {confirmPassword === newPassword && newPassword.length >= MIN_PASSWORD_LENGTH ? (
            <Text style={styles.matchOk}>✓ Пароли совпадают</Text>
          ) : null}

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <TouchableOpacity
            style={[styles.button, (!isFormValid || isLoading) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Сохранить</Text>
            )}
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
  form: {
    gap: spacing.xs,
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
  matchOk: {
    ...typography.small,
    color: colors.ok,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  formError: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
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
  successScreen: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenH,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: radii.pill,
    backgroundColor: colors.ok,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
    ...shadows.button,
  },
  successCheckmark: {
    fontFamily: fontFamily.black,
    fontSize: 38,
    color: colors.onPrimary,
  },
  successTitle: {
    ...typography.h1,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successSubtitle: {
    ...typography.body,
    textAlign: 'center',
  },
});
