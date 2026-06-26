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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList, GapAnalysisResponse, GapItem } from '../types';
import { getGapAnalysis } from '../api/university';
import { EmojiPrefixText, TextWithLeadingEmoji } from '../components/common/EmojiText';
import { colors, typography, spacing, radii, shadows } from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'GapAnalysis'>;

function scoreColor(score: number): string {
  if (score >= 70) return colors.ok;
  if (score >= 40) return colors.accent;
  return colors.danger;
}

function ReadinessCircle({ score }: { score: number }) {
  const borderColor = scoreColor(score);
  return (
    <View style={[circleStyles.ring, { borderColor }]}>
      <Text style={[circleStyles.number, { color: borderColor }]}>
        {`${Math.round(score)}%`}
      </Text>
      <Text style={circleStyles.label}>{'готовность'}</Text>
    </View>
  );
}

const circleStyles = StyleSheet.create({
  ring: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  number: {
    ...typography.title,
    fontSize: 28,
    lineHeight: 34,
  },
  label: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

interface SectionConfig {
  title: string;
  items: GapItem[];
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
}

function GapSection({ title, items, bgColor, borderColor, textColor, icon }: SectionConfig) {
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <TextWithLeadingEmoji
        emojiChar={icon}
        textStyle={styles.sectionLabelText}
        style={styles.sectionLabel}
      >
        {title}
      </TextWithLeadingEmoji>
      {items.map((item, i) => (
        <View key={i} style={[styles.itemCard, { backgroundColor: bgColor, borderColor }]}>
          <Text style={[styles.itemRequirement, { color: textColor }]}>{item.requirement}</Text>
          <Text style={styles.itemComment}>{item.comment}</Text>
        </View>
      ))}
    </View>
  );
}

export default function GapAnalysisScreen({ route, navigation }: Props) {
  const { programId, assessmentId, programName, universityName } = route.params;

  const [result, setResult] = useState<GapAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGapAnalysis(programId, assessmentId)
      .then(setResult)
      .catch(() => setError('Не удалось загрузить анализ. Попробуй ещё раз.'))
      .finally(() => setLoading(false));
  }, [programId, assessmentId]);

  function handleBuildPlan() {
    navigation.navigate('MainTabs', { screen: 'Roadmap' });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>{'←'}</Text>
          <Text style={styles.backLabel}>{'Назад'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{'Анализируем твой профиль...'}</Text>
        </View>
      ) : error !== null || result === null ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'Нет данных'}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true);
              setError(null);
              getGapAnalysis(programId, assessmentId)
                .then(setResult)
                .catch(() => setError('Не удалось загрузить анализ.'))
                .finally(() => setLoading(false));
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>{'Повторить'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.programName}>{programName}</Text>
          <Text style={styles.universityName}>{universityName}</Text>

          {/* Readiness circle */}
          <View style={styles.circleBlock}>
            <ReadinessCircle score={result.readiness_score} />
            <Text style={styles.circleCaption}>
              {result.readiness_score >= 70
                ? 'Отличный результат! Ты готов(а) к поступлению.'
                : result.readiness_score >= 40
                ? 'Есть прогресс, но нужно ещё поработать.'
                : 'Пока не хватает нескольких важных требований.'}
            </Text>
          </View>

          {/* Sections */}
          <GapSection
            title="Уже есть"
            icon="✓"
            items={result.met}
            bgColor="#F0FDF4"
            borderColor="#86EFAC"
            textColor={colors.ok}
          />
          <GapSection
            title="В процессе"
            icon="◌"
            items={result.in_progress}
            bgColor="#FFFBEB"
            borderColor="#FCD34D"
            textColor="#92400E"
          />
          <GapSection
            title="Нужно развить"
            icon="✗"
            items={result.not_met}
            bgColor="#FEF2F2"
            borderColor="#FCA5A5"
            textColor={colors.danger}
          />
          {result.unknown.length > 0 && (
            <GapSection
              title="Нет данных"
              icon="?"
              items={result.unknown}
              bgColor={colors.bg}
              borderColor={colors.border}
              textColor={colors.textMuted}
            />
          )}

          {/* CTA */}
          <TouchableOpacity style={styles.ctaBtn} onPress={handleBuildPlan} activeOpacity={0.8}>
            <EmojiPrefixText emojiChar="🗺️" textStyle={styles.ctaBtnText}>
              Построить план подготовки
            </EmojiPrefixText>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenH,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backIcon: {
    ...typography.title,
    color: colors.primary,
  },
  backLabel: {
    ...typography.label,
    color: colors.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenH,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    ...shadows.button,
  },
  retryBtnText: {
    ...typography.label,
    color: colors.onPrimary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  programName: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  universityName: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing['2xl'],
  },
  circleBlock: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
    gap: spacing.lg,
  },
  circleCaption: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: spacing.md,
  },
  sectionLabelText: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  itemCard: {
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
  },
  itemRequirement: {
    ...typography.label,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  itemComment: {
    ...typography.body,
    color: colors.textSecondary,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.button,
  },
  ctaBtnText: {
    ...typography.label,
    color: colors.onPrimary,
  },
});
