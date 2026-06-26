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
import type { AppStackParamList, ProgramDetail } from '../types';
import { getProgramDetail } from '../api/university';
import { useAssessmentStore } from '../store/assessmentStore';
import { EmojiPrefixText, TextWithLeadingEmoji } from '../components/common/EmojiText';
import { colors, typography, spacing, radii, shadows } from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'ProgramDetail'>;

function formatCost(cost: number | null): string {
  if (cost === null) return 'Стоимость не указана';
  return `${cost.toLocaleString()} $ в год`;
}

function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return value.map(toDisplayString).join(', ');
  const obj = value as Record<string, unknown>;
  // Prefer human-readable fields; fall back to all non-null values joined
  const preferred = ['amount', 'value', 'score', 'level', 'min', 'conditions', 'name'];
  for (const field of preferred) {
    if (obj[field] !== undefined && obj[field] !== null) {
      const rest = obj.conditions !== undefined && field !== 'conditions'
        ? ` · ${String(obj.conditions)}`
        : '';
      return `${String(obj[field])}${rest}`;
    }
  }
  return Object.values(obj).filter(v => v !== null && v !== undefined).map(String).join(' · ') || '—';
}

function renderRequirements(requirements: Record<string, unknown>) {
  const entries = Object.entries(requirements);
  if (entries.length === 0) return null;
  return entries.map(([key, value]) => (
    <View key={key} style={reqStyles.row}>
      <Text style={reqStyles.key}>{key}</Text>
      <Text style={reqStyles.value}>{toDisplayString(value)}</Text>
    </View>
  ));
}

function renderDeadlines(deadlines: Record<string, unknown>) {
  const entries = Object.entries(deadlines);
  if (entries.length === 0) return null;
  return entries.map(([round, date]) => (
    <View key={round} style={reqStyles.row}>
      <Text style={reqStyles.key}>{round}</Text>
      <Text style={reqStyles.value}>{toDisplayString(date)}</Text>
    </View>
  ));
}

const reqStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  key: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    textTransform: 'capitalize',
  },
  value: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
});

export default function ProgramDetailScreen({ route, navigation }: Props) {
  const { programId, programName, universityName } = route.params;

  const assessmentId = useAssessmentStore((s) => s.assessmentId);

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProgramDetail(programId)
      .then(setProgram)
      .catch(() => setError('Не удалось загрузить программу'))
      .finally(() => setLoading(false));
  }, [programId]);

  function handleCheckChances() {
    if (assessmentId === null) return;
    navigation.navigate('GapAnalysis', {
      programId,
      assessmentId,
      programName,
      universityName,
    });
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
        </View>
      ) : error !== null || program === null ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'Программа не найдена'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>{'Назад'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Title block */}
          <Text style={styles.programName}>{program.name}</Text>
          <Text style={styles.universityName}>{universityName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{`🌐 ${program.language}`}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{`💰 ${formatCost(program.cost_per_year)}`}</Text>
            </View>
          </View>

          {/* Description */}
          {(program.description ?? '').length > 0 && (
            <View style={styles.section}>
              <TextWithLeadingEmoji emojiChar="📋" textStyle={styles.sectionLabelText} style={styles.sectionLabel}>
                Описание
              </TextWithLeadingEmoji>
              <Text style={styles.bodyText}>{program.description}</Text>
            </View>
          )}

          {/* Who it's for */}
          {(program.who_its_for ?? '').length > 0 && (
            <View style={styles.section}>
              <TextWithLeadingEmoji emojiChar="🎯" textStyle={styles.sectionLabelText} style={styles.sectionLabel}>
                Для кого
              </TextWithLeadingEmoji>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>{program.who_its_for}</Text>
              </View>
            </View>
          )}

          {/* Career options */}
          {(program.career_options ?? []).length > 0 && (
            <View style={styles.section}>
              <TextWithLeadingEmoji emojiChar="💼" textStyle={styles.sectionLabelText} style={styles.sectionLabel}>
                Карьерные пути
              </TextWithLeadingEmoji>
              <View style={styles.chipWrap}>
                {(program.career_options ?? []).map((career, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{toDisplayString(career)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Requirements */}
          {Object.keys(program.requirements ?? {}).length > 0 && (
            <View style={styles.section}>
              <TextWithLeadingEmoji emojiChar="📝" textStyle={styles.sectionLabelText} style={styles.sectionLabel}>
                Требования
              </TextWithLeadingEmoji>
              <View style={styles.tableCard}>
                {renderRequirements(program.requirements ?? {})}
              </View>
            </View>
          )}

          {/* Deadlines */}
          {Object.keys(program.deadlines ?? {}).length > 0 && (
            <View style={styles.section}>
              <TextWithLeadingEmoji emojiChar="📅" textStyle={styles.sectionLabelText} style={styles.sectionLabel}>
                Дедлайны
              </TextWithLeadingEmoji>
              <View style={styles.tableCard}>
                {renderDeadlines(program.deadlines ?? {})}
              </View>
            </View>
          )}

          {/* Grants */}
          {(program.grants ?? []).length > 0 && (
            <View style={styles.section}>
              <TextWithLeadingEmoji emojiChar="🎓" textStyle={styles.sectionLabelText} style={styles.sectionLabel}>
                Гранты и стипендии
              </TextWithLeadingEmoji>
              {(program.grants ?? []).map((grant, i) => (
                <View key={i} style={styles.listRow}>
                  <Text style={styles.listBullet}>{'•'}</Text>
                  <Text style={styles.listText}>{toDisplayString(grant)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, assessmentId === null && styles.ctaBtnDisabled]}
            onPress={handleCheckChances}
            activeOpacity={0.8}
            disabled={assessmentId === null}
          >
            <EmojiPrefixText emojiChar="🔍" textStyle={styles.ctaBtnText}>
              Проверить мои шансы
            </EmojiPrefixText>
          </TouchableOpacity>
          {assessmentId === null && (
            <Text style={styles.ctaHint}>
              {'Пройди диагностику, чтобы проверить свои шансы'}
            </Text>
          )}
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
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  metaBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  metaBadgeText: {
    ...typography.caption,
    color: colors.primaryDeep,
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
  bodyText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  highlightCard: {
    backgroundColor: colors.primaryGhost,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },
  highlightText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    ...typography.caption,
    color: colors.primaryDeep,
  },
  tableCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  listBullet: {
    ...typography.bodyStrong,
    color: colors.primary,
    lineHeight: 24,
  },
  listText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.button,
  },
  ctaBtnDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  ctaBtnText: {
    ...typography.label,
    color: colors.onPrimary,
  },
  ctaHint: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
