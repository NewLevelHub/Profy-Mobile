import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import type { AppStackParamList } from '../types';
import { colors, typography, spacing, radii, shadows, fontFamily } from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'Welcome'>;

const STEPS = [
  { num: '1', emoji: '📝', label: 'Расскажи о себе', desc: 'Профиль, интересы и цели' },
  { num: '2', emoji: '🧩', label: 'Пройди тест', desc: '7 коротких блоков вопросов' },
  { num: '3', emoji: '🎯', label: 'Получи план', desc: 'Персональная дорожная карта' },
] as const;

export default function WelcomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.trim().split(' ')[0] || null;
  const greeting = firstName ? `Привет, ${firstName}!` : 'Привет!';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const waveRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveRotate, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(waveRotate, { toValue: -1, duration: 280, useNativeDriver: true }),
        Animated.timing(waveRotate, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(waveRotate, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.delay(2200),
      ]),
      { iterations: 3 },
    );
    const waveTimer = setTimeout(() => waveLoop.start(), 600);

    return () => {
      clearTimeout(waveTimer);
      waveLoop.stop();
    };
  }, []);

  const waveInterpolate = waveRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View
        style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.header}>
          <Animated.Text
            style={[styles.wave, { transform: [{ rotate: waveInterpolate }] }]}
          >
            👋
          </Animated.Text>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.sub}>
            Рады, что ты с нами. Давай вместе разберёмся, что тебе подходит.
          </Text>
        </View>

        <View style={styles.stepsSection}>
          <Text style={styles.stepsLabel}>Что тебя ждёт:</Text>
          {STEPS.map((step) => (
            <View key={step.num} style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>{step.num}</Text>
              </View>
              <Text style={styles.stepEmoji}>{step.emoji}</Text>
              <View style={styles.stepTexts}>
                <Text style={styles.stepLabel}>{step.label}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => navigation.replace('ProfileSetup')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Поехали! 🚀</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
  },
  wave: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  greeting: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  stepsSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  stepsLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    ...typography.label,
    color: colors.primaryDeep,
  },
  stepEmoji: {
    fontSize: 24,
  },
  stepTexts: {
    flex: 1,
  },
  stepLabel: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  stepDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cta: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  ctaText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 16,
    color: colors.onPrimary,
  },
});
