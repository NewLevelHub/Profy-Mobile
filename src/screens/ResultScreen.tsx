import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppTabParamList, AppStackParamList, DirectionResult } from '../types';
import { useResultStore } from '../store/resultStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { useProfileStore } from '../store/profileStore';
import { getReport } from '../api/result';
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
} from '../constants/themes/themes';
import { EmojiText, EmojiPrefixText } from '../components/common/EmojiText';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Result'>,
  NativeStackScreenProps<AppStackParamList>
>;

// ─── Label maps ────────────────────────────────────────────────────────────────

const INTEREST_LABELS: Record<string, string> = {
  technology: 'Технологии',
  investigative: 'Исследование',
  artistic: 'Творчество',
  creative_think: 'Креативность',
  social: 'Общение',
  social_think: 'Понимание людей',
  science: 'Наука',
  nature: 'Природа',
  realistic: 'Практика',
  media: 'Медиа',
  conventional: 'Системность',
  numbers: 'Числа и данные',
};

const THINKING_LABELS: Record<string, string> = {
  logical: 'Логика',
  mathematical: 'Математика',
  verbal: 'Коммуникация',
  spatial: 'Пространство',
  systematic: 'Системность',
  creative_think: 'Творчество',
};

const THINKING_EMOJIS: Record<string, string> = {
  logical: '🧠',
  mathematical: '📐',
  verbal: '💬',
  spatial: '🗺️',
  systematic: '⚙️',
  creative_think: '💡',
};

const STRENGTH_ICON_PAIRS: [string, string][] = [
  ['технологии', '💻'],
  ['докапываться', '🔍'],
  ['нестандартные', '🎨'],
  ['понимает людей', '🤝'],
  ['структурно', '🧠'],
  ['числами', '📐'],
  ['словами', '📝'],
  ['пространство', '🗺️'],
  ['инициативу', '🏆'],
  ['начатое', '✅'],
  ['новому', '🌟'],
  ['помогать', '❤️'],
  ['целиком', '🎯'],
  ['воплощать', '🔧'],
  ['научному', '🔬'],
  ['природой', '🌿'],
  ['данными', '📊'],
  ['порядок', '📋'],
  ['системы', '⚙️'],
];

const MOTIVATION_ICON_PAIRS: [string, string][] = [
  ['помогать', '❤️'],
  ['вести за собой', '🏆'],
  ['создавать', '🚀'],
  ['высоком уровне', '✅'],
  ['новому', '🌟'],
  ['масштабно', '🎯'],
  ['результаты', '🔧'],
  ['исследовать', '🔍'],
  ['творческие', '🎨'],
  ['людей', '🤝'],
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getIconForText(text: string, pairs: [string, string][]): string {
  const lower = text.toLowerCase();
  for (const [keyword, icon] of pairs) {
    if (lower.includes(keyword)) return icon;
  }
  return '⭐';
}

function getInterestLevel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'Высокий', color: colors.primary };
  if (score >= 40) return { label: 'Средний', color: colors.accent };
  return { label: 'Низкий', color: colors.textMuted };
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <View style={sectionHeaderStyles.row}>
      <EmojiText size="sm" style={sectionHeaderStyles.emoji}>{emoji}</EmojiText>
      <Text style={sectionHeaderStyles.title}>{title}</Text>
    </View>
  );
}

const sectionHeaderStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  emoji: {},
  title: {
    ...typography.title,
    color: colors.text,
  },
});

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function ResultScreen({ navigation }: Props) {
  const report = useResultStore((s) => s.report);
  const setReport = useResultStore((s) => s.setReport);
  const goal = useAssessmentStore((s) => s.goal);
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const hasCompletedAssessment = useAssessmentStore((s) => s.hasCompletedAssessment);
  const ageGroup = useProfileStore((s) => s.profile?.age_group);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const showUniversityBtn = goal === 'university' && ageGroup === 'senior';

  useEffect(() => {
    if (hasCompletedAssessment && !report && assessmentId) {
      setLoadingReport(true);
      setLoadError(null);
      getReport(assessmentId)
        .then((r) => setReport(r))
        .catch(() => setLoadError('Не удалось загрузить результаты. Попробуй ещё раз.'))
        .finally(() => setLoadingReport(false));
    }
  }, [hasCompletedAssessment, report, assessmentId]);

  if (!hasCompletedAssessment) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyIcon}>{'📋'}</Text>
          <Text style={styles.emptyTitle}>{'Результатов пока нет'}</Text>
          <Text style={styles.emptyText}>
            {'Сначала требуется пройти тестирование, чтобы увидеть результаты'}
          </Text>
          <TouchableOpacity
            style={styles.goHomeBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.goHomeBtnText}>{'Перейти на главную'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingReport || !report) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyCenter}>
          {loadError !== null ? (
            <>
              <Text style={styles.emptyIcon}>{'⚠️'}</Text>
              <Text style={styles.emptyTitle}>{'Ошибка загрузки'}</Text>
              <Text style={styles.emptyText}>{loadError}</Text>
              <TouchableOpacity
                style={styles.goHomeBtn}
                onPress={() => {
                  setLoadError(null);
                  if (assessmentId) {
                    setLoadingReport(true);
                    getReport(assessmentId)
                      .then((r) => setReport(r))
                      .catch(() => setLoadError('Не удалось загрузить результаты. Попробуй ещё раз.'))
                      .finally(() => setLoadingReport(false));
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.goHomeBtnText}>{'Повторить'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.emptyText, { marginTop: spacing.lg }]}>
                {'Загружаем результаты...'}
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const topInterests = Object.entries(report.interests_map ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const topThinking = Object.entries(report.thinking_style ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  function handleDirectionPress(direction: DirectionResult) {
    navigation.navigate('DirectionDetail', { direction });
  }

  function handleUniversityPress(direction: DirectionResult) {
    navigation.navigate('UniversityList', { directionSlug: direction.slug });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Text style={styles.pageTitle}>{'Твои результаты'}</Text>
        <Text style={styles.pageSubtitle}>{'Посмотри, что мы узнали о тебе'}</Text>

        {/* ── Секция 1: Резюме ── */}
        <View style={styles.section}>
          <SectionHeader emoji="📋" title="Резюме" />
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{report.summary}</Text>
          </View>
        </View>

        {/* ── Секция 2: Сильные стороны ── */}
        <View style={styles.section}>
          <SectionHeader emoji="💪" title="Сильные стороны" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScrollContent}
          >
            {(report.strengths ?? []).map((strength, index) => (
              <View key={index} style={styles.strengthChip}>
                <EmojiText size="md" style={styles.strengthIcon}>
                  {getIconForText(strength, STRENGTH_ICON_PAIRS)}
                </EmojiText>
                <Text style={styles.strengthText}>{strength}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Секция 3: Карта интересов ── */}
        <View style={styles.section}>
          <SectionHeader emoji="🗺️" title="Карта интересов" />
          <View style={styles.card}>
            {topInterests.length > 0 ? (
              topInterests.map(([cat, score]) => {
                const level = getInterestLevel(score);
                const label = INTEREST_LABELS[cat] ?? cat;
                return (
                  <View key={cat} style={styles.interestRow}>
                    <View style={styles.interestMeta}>
                      <Text style={styles.interestLabel}>{label}</Text>
                      <Text style={[styles.interestLevelText, { color: level.color }]}>
                        {level.label}
                      </Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${Math.round(score)}%`, backgroundColor: level.color },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyHint}>{'Данных пока нет'}</Text>
            )}
          </View>
        </View>

        {/* ── Секция 4: Стиль мышления ── */}
        <View style={styles.section}>
          <SectionHeader emoji="🧠" title="Стиль мышления" />
          {topThinking.length > 0 && (
            <Text style={styles.thinkingDesc}>
              {`У тебя хорошо развиты: ${topThinking
                .slice(0, 2)
                .map(([cat]) => (THINKING_LABELS[cat] ?? cat).toLowerCase())
                .join(' и ')}.`}
            </Text>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScrollContent}
          >
            {topThinking.map(([cat, score]) => (
              <View key={cat} style={styles.thinkingChip}>
                <EmojiText size="md" style={styles.thinkingChipEmoji}>
                  {THINKING_EMOJIS[cat] ?? '🔷'}
                </EmojiText>
                <Text style={styles.thinkingChipLabel}>
                  {THINKING_LABELS[cat] ?? cat}
                </Text>
                <Text style={styles.thinkingChipScore}>{`${Math.round(score)}%`}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Секция 5: Мотивация ── */}
        <View style={styles.section}>
          <SectionHeader emoji="⚡" title="Что тебя мотивирует" />
          {(report.motivation ?? []).map((text, index) => (
            <View key={index} style={styles.motivationCard}>
              <EmojiText size="md" style={styles.motivationIcon}>
                {getIconForText(text, MOTIVATION_ICON_PAIRS)}
              </EmojiText>
              <Text style={styles.motivationText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* ── Секция 6: Подходящие направления ── */}
        <View style={styles.section}>
          <SectionHeader emoji="🚀" title="Подходящие направления" />
          {(report.directions ?? []).map((direction) => (
            <View key={direction.slug} style={styles.directionCard}>
              <View style={styles.directionHeader}>
                <Text style={styles.directionName}>{direction.name}</Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchBadgeText}>{`${direction.match_score}%`}</Text>
                </View>
              </View>
              <Text style={styles.whyText}>{direction.why_it_fits}</Text>
              <View style={styles.professionsWrap}>
                {(direction.professions ?? []).slice(0, 4).map((prof, i) => (
                  <View key={i} style={styles.profChip}>
                    <Text style={styles.profChipText}>{prof}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() => handleDirectionPress(direction)}
                activeOpacity={0.8}
              >
                <Text style={styles.detailBtnText}>{'Подробнее'}</Text>
              </TouchableOpacity>
              {showUniversityBtn && (
                <TouchableOpacity
                  style={styles.universityBtn}
                  onPress={() => handleUniversityPress(direction)}
                  activeOpacity={0.8}
                >
                  <EmojiPrefixText emojiChar="🎓" textStyle={styles.universityBtnText}>
                    Найти университеты
                  </EmojiPrefixText>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  pageTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing['2xl'],
  },
  section: {
    marginBottom: spacing['3xl'],
  },
  // Summary
  summaryCard: {
    backgroundColor: colors.primaryGhost,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
  },
  // Strengths
  hScrollContent: {
    paddingRight: spacing.screenH,
    gap: spacing.md,
  },
  strengthChip: {
    width: 144,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.card,
  },
  strengthIcon: {
    fontSize: 28,
    lineHeight: 36,
  },
  strengthText: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
  },
  // Interests
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
    ...shadows.card,
  },
  interestRow: {
    gap: spacing.xs,
  },
  interestMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  interestLabel: {
    ...typography.caption,
    color: colors.text,
  },
  interestLevelText: {
    ...typography.small,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.track,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: radii.pill,
  },
  emptyHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  // Thinking style
  thinkingDesc: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  thinkingChip: {
    width: 112,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.xs,
    ...shadows.card,
  },
  thinkingChipEmoji: {
    fontSize: 24,
    lineHeight: 32,
  },
  thinkingChipLabel: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
  },
  thinkingChipScore: {
    ...typography.small,
    color: colors.primary,
  },
  // Motivation
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  motivationIcon: {
    fontSize: 26,
    lineHeight: 34,
    flexShrink: 0,
  },
  motivationText: {
    ...typography.bodyStrong,
    color: colors.text,
    flex: 1,
  },
  // Directions
  directionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.card,
  },
  directionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  directionName: {
    ...typography.subtitle,
    color: colors.text,
    flex: 1,
    paddingRight: spacing.sm,
  },
  matchBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexShrink: 0,
  },
  matchBadgeText: {
    ...typography.caption,
    color: colors.primaryDeep,
  },
  whyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  professionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  profChip: {
    backgroundColor: colors.bg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profChipText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  detailBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.button,
  },
  detailBtnText: {
    ...typography.label,
    color: colors.onPrimary,
  },
  universityBtn: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  universityBtnText: {
    ...typography.label,
    color: colors.primary,
  },
  // Empty state
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenH,
    gap: spacing.md,
  },
  emptyIcon: {
    fontSize: 52,
    lineHeight: 64,
  },
  emptyTitle: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  goHomeBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    ...shadows.button,
  },
  goHomeBtnText: {
    ...typography.label,
    color: colors.onPrimary,
  },
});
