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
import { forgotPassword } from '../api/auth';
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
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Введите корректный email');
      return false;
    }
    setEmailError('');
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      navigation.navigate('VerifyResetCode', { email: email.trim() });
    } catch {
      // Always navigate even on error — don't reveal if email exists
      navigation.navigate('VerifyResetCode', { email: email.trim() });
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
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Назад</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Забыли пароль?</Text>
          <Text style={styles.subtitle}>
            Введите вашу почту — мы отправим 6-значный код для сброса пароля
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

        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Вернуться ко входу</Text>
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
    marginBottom: spacing['2xl'],
  },
  inputWrapper: {
    marginBottom: spacing.lg,
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
  button: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
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
  linkRow: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  linkText: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: fontFamily.extrabold,
  },
});
