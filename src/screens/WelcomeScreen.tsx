import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import type { AppStackParamList } from '../types';
import { EmojiText } from '../components/common/EmojiText';
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
  const slideAnim = useRef(new Animated.Value(28)).current;
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
    const waveTimer = setTimeout(() => waveLoop.start(), 700);

    return () => {
      clearTimeout(waveTimer);
      waveLoop.stop();
    };
  }, []);

  const waveInterpolate = waveRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-22deg', '0deg', '22deg'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View
        style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.Text
            style={[styles.wave, { transform: [{ rotate: waveInterpolate }] }]}
          >
            <EmojiText size="hero" style={styles.waveEmoji}>👋</EmojiText>
          </Animated.Text>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.sub}>
            Рады, что ты с нами. Давай вместе{'\n'}разберёмся, что тебе подходит.
          </Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsSection}>
          <Text style={styles.stepsLabel}>Что тебя ждёт:</Text>
          {STEPS.map((step) => (
            <View key={step.num} style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>{step.num}</Text>
              </View>
              <EmojiText size="md" style={styles.stepEmoji}>{step.emoji}</EmojiText>
              <View style={styles.stepTexts}>
                <Text style={styles.stepLabel}>{step.label}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.cta}
          onPress={() => navigation.replace('ProfileSetup')}
          activeOpacity={0.82}
        >
          <Text style={styles.ctaText}>
            {'Поехали! '}
            <EmojiText size="sm">🚀</EmojiText>
          </Text>
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
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    justifyContent: 'space-between',
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    gap: spacing.sm,
  },
  wave: {
    marginBottom: spacing.xs,
    // transform origin workaround: shift right so rotation pivots from wrist
    transformOrigin: 'bottom right',
  },
  waveEmoji: {
    fontSize: 60,
    lineHeight: 72,
  },
  greeting: {
    fontFamily: fontFamily.black,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: colors.text,
    textAlign: 'center',
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Steps ───────────────────────────────────────────────────────────────────
  stepsSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  stepsLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  stepBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNum: {
    fontFamily: fontFamily.black,
    fontSize: 15,
    color: colors.primaryDeep,
  },
  stepEmoji: {
    flexShrink: 0,
  },
  stepTexts: {
    flex: 1,
    gap: 2,
  },
  stepLabel: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  stepDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // ── CTA ─────────────────────────────────────────────────────────────────────
  cta: {
    height: 58,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  ctaText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 17,
    color: colors.onPrimary,
    letterSpacing: 0.2,
  },
});
