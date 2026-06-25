import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppTabParamList, AppStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { EmojiText } from '../components/common/EmojiText';
import { colors, radii, shadows, spacing, fontFamily, fontSize } from '../constants/themes/themes';
import { BLOCK_NAMES, BLOCK_EMOJIS } from '../constants/blocks';
import { getAssessmentBlocks } from '../utils/assessmentBlocks';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Home'>,
  NativeStackScreenProps<AppStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const goal = useAssessmentStore((s) => s.goal);
  const currentBlock = useAssessmentStore((s) => s.currentBlock);
  const ageGroup = profile?.age_group ?? 'middle';

  const activeBlocks = getAssessmentBlocks(ageGroup, goal);
  const totalBlocks = activeBlocks.length;
  const hasAssessment = assessmentId !== null && goal !== null;
  const isCompleted = hasAssessment && currentBlock >= totalBlocks;
  const inProgress = hasAssessment && !isCompleted;

  const displayName = profile?.name?.trim().split(' ')[0]
    || user?.name?.trim().split(' ')[0]
    || 'друг';
  const initial = displayName ? displayName[0].toUpperCase() : 'A';

  const nextBlockName = inProgress && currentBlock < activeBlocks.length
    ? BLOCK_NAMES[activeBlocks[currentBlock]]
    : null;

  const completedCount = Math.min(currentBlock, totalBlocks);

  function handleContinue() {
    if (inProgress) {
      navigation.navigate('Assessment');
    } else {
      navigation.navigate('GoalSelection');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.greeting}>{`Привет, ${displayName}!`}</Text>
            <Text style={styles.headerSub}>
              {isCompleted
                ? 'Ты прошёл всю диагностику!'
                : inProgress
                ? 'Продолжим путь к профессии?'
                : 'Готов начать диагностику?'}
            </Text>
          </View>
        </View>

        {/* ── Hero progress card ──────────────────────────────────── */}
        {hasAssessment && (
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              {/* Circular progress indicator */}
              <View style={styles.progressRingOuter}>
                <View style={styles.progressRingInner}>
                  <Text style={styles.progressRingNum}>{completedCount}</Text>
                  <Text style={styles.progressRingDen}>/{totalBlocks}</Text>
                </View>
              </View>

              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle}>{'Твой путь'}</Text>
                <Text style={styles.heroSubtitle} numberOfLines={2}>
                  {isCompleted
                    ? 'Ты прошёл все блоки! Смотри результат'
                    : completedCount === 0
                    ? `Начнём с блока «${nextBlockName}»`
                    : `Пройден ${completedCount} блок из ${totalBlocks}. Дальше${nextBlockName ? ` — «${nextBlockName}»` : ''}`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.heroBtn}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>
                {isCompleted ? 'Смотреть результат' : 'Продолжить тест'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Empty hero card ─────────────────────────────────────── */}
        {!hasAssessment && (
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.progressRingOuter}>
                <View style={styles.progressRingInner}>
                  <Text style={styles.progressRingNum}>{'0'}</Text>
                  <Text style={styles.progressRingDen}>{'/7'}</Text>
                </View>
              </View>
              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle}>{'Твой путь'}</Text>
                <Text style={styles.heroSubtitle}>
                  {'7 коротких блоков — и ты получишь персональную карту профессий'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>{'Начать тест'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Quick access cards ──────────────────────────────────── */}
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Result')}
            activeOpacity={0.8}
          >
            <EmojiText size="md" style={styles.quickEmoji}>{'📋'}</EmojiText>
            <Text style={styles.quickTitle}>{'Результаты'}</Text>
            <Text style={styles.quickSub}>{'Что мы узнали о тебе'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Roadmap')}
            activeOpacity={0.8}
          >
            <EmojiText size="md" style={styles.quickEmoji}>{'📘'}</EmojiText>
            <Text style={styles.quickTitle}>{'Роадмап'}</Text>
            <Text style={styles.quickSub}>{'Твой план развития'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Roadmap block list ──────────────────────────────────── */}
        {hasAssessment && (
          <>
            <Text style={styles.sectionTitle}>{'Дорожная карта'}</Text>

            <View style={styles.blockList}>
              {activeBlocks.map((block, index) => {
                const isBlockCompleted = index < currentBlock;
                const isBlockCurrent = index === currentBlock;
                const isLocked = index > currentBlock;

                return (
                  <View key={block} style={styles.blockRow}>
                    {/* Connector line */}
                    {index < activeBlocks.length - 1 && (
                      <View
                        style={[
                          styles.connector,
                          isBlockCompleted && styles.connectorCompleted,
                        ]}
                      />
                    )}

                    {/* Status circle */}
                    <View
                      style={[
                        styles.blockCircle,
                        isBlockCompleted && styles.blockCircleCompleted,
                        isBlockCurrent && styles.blockCircleCurrent,
                        isLocked && styles.blockCircleLocked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.blockCircleText,
                          isLocked && styles.blockCircleTextLocked,
                        ]}
                      >
                        {isBlockCompleted ? '✓' : String(index + 1)}
                      </Text>
                    </View>

                    {/* Card */}
                    <View
                      style={[
                        styles.blockCard,
                        isBlockCurrent && styles.blockCardCurrent,
                      ]}
                    >
                      <View style={styles.blockCardContent}>
                        <Text
                          style={[
                            styles.blockCardName,
                            isBlockCurrent && styles.blockCardNameCurrent,
                            isLocked && styles.blockCardNameLocked,
                          ]}
                        >
                          {BLOCK_NAMES[block]}
                        </Text>
                        <Text
                          style={[
                            styles.blockCardStatus,
                            isBlockCompleted && styles.blockCardStatusCompleted,
                            isBlockCurrent && styles.blockCardStatusCurrent,
                          ]}
                        >
                          {isBlockCompleted
                            ? 'Пройден'
                            : isBlockCurrent
                            ? 'Сейчас'
                            : 'Откроется позже'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.blockCardEmoji,
                          isLocked && styles.blockCardEmojiLocked,
                        ]}
                      >
                        <EmojiText size="sm" style={styles.blockCardEmojiText}>
                          {BLOCK_EMOJIS[block]}
                        </EmojiText>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* Locked result card */}
              <View style={styles.planCard}>
                <View style={styles.planIconWrap}>
                  <EmojiText size="sm" style={styles.planIconText}>{'🔒'}</EmojiText>
                </View>
                <View style={styles.planBody}>
                  <Text style={styles.planTitle}>{'Твой план профессий'}</Text>
                  <Text style={styles.planSub}>
                    {'Откроется, когда пройдёшь все блоки'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const HERO_BG = '#6B4EFF';
const HERO_TEXT = '#FFFFFF';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: spacing['2xl'],
    paddingTop: spacing.xl,
    paddingBottom: 40,
  },

  // ── Header ────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...shadows.button,
  },
  avatarText: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.title,
    color: colors.onPrimary,
  },
  headerTexts: {
    flex: 1,
  },
  greeting: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.h1,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  headerSub: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },

  // ── Hero card ─────────────────────────────────────────────────
  heroCard: {
    backgroundColor: HERO_BG,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    marginBottom: spacing['2xl'],
    ...shadows.button,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  progressRingOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  progressRingInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  progressRingNum: {
    fontFamily: fontFamily.black,
    fontSize: 22,
    color: HERO_TEXT,
    lineHeight: 26,
  },
  progressRingDen: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 1,
  },
  heroInfo: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.title,
    color: HERO_TEXT,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  heroBtn: {
    backgroundColor: HERO_TEXT,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  heroBtnText: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.label,
    color: HERO_BG,
  },

  // ── Quick cards ───────────────────────────────────────────────
  quickRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  quickEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  quickTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.label,
    color: colors.text,
    marginBottom: 3,
  },
  quickSub: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },

  // ── Section title ─────────────────────────────────────────────
  sectionTitle: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.title,
    color: colors.text,
    marginBottom: spacing.lg,
  },

  // ── Block list ────────────────────────────────────────────────
  blockList: {
    gap: 0,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    left: 21,
    top: 48,
    width: 2,
    height: spacing.sm + 48,
    backgroundColor: colors.border,
    zIndex: 0,
  },
  connectorCompleted: {
    backgroundColor: colors.ok,
  },
  blockCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 1,
    marginRight: spacing.md,
  },
  blockCircleCompleted: {
    backgroundColor: colors.ok,
  },
  blockCircleCurrent: {
    backgroundColor: colors.primary,
  },
  blockCircleLocked: {
    backgroundColor: colors.track,
  },
  blockCircleText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 16,
    color: colors.onPrimary,
  },
  blockCircleTextLocked: {
    color: colors.textMuted,
  },
  blockCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  blockCardCurrent: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  blockCardContent: {
    flex: 1,
  },
  blockCardName: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.text,
  },
  blockCardNameCurrent: {
    fontFamily: fontFamily.extrabold,
    color: colors.text,
  },
  blockCardNameLocked: {
    color: colors.textMuted,
    fontFamily: fontFamily.semibold,
  },
  blockCardStatus: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  blockCardStatusCompleted: {
    color: colors.ok,
  },
  blockCardStatusCurrent: {
    color: colors.primary,
  },
  blockCardEmoji: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  blockCardEmojiLocked: {
    backgroundColor: colors.bg,
    opacity: 0.55,
  },
  blockCardEmojiText: {
    fontSize: 20,
  },

  // ── Plan card ─────────────────────────────────────────────────
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
    gap: spacing.lg,
  },
  planIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  planIconText: {
    fontSize: 22,
  },
  planBody: {
    flex: 1,
  },
  planTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    color: '#9A3412',
  },
  planSub: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.accent,
    marginTop: 2,
  },
});
