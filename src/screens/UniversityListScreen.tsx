import React, { useCallback, useEffect, useState } from 'react';
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
import type { AppStackParamList, ProgramBrief } from '../types';
import { getPrograms } from '../api/university';
import { EmojiText } from '../components/common/EmojiText';
import { colors, typography, spacing, radii, shadows } from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'UniversityList'>;

interface CountryFilter {
  label: string;
  value: string | undefined;
}

const COUNTRY_FILTERS: CountryFilter[] = [
  { label: 'Все', value: undefined },
  { label: 'КЗ', value: 'Kazakhstan' },
  { label: 'США', value: 'us' },
  { label: 'Великобритания', value: 'uk' },
  { label: 'Европа', value: 'Europe' },
  { label: 'Канада', value: 'Canada' },
  { label: 'Азия', value: 'Asia' },
];

function formatCost(cost: number | null): string {
  if (cost === null) return 'Стоимость не указана';
  return `${cost.toLocaleString()} $/год`;
}

export default function UniversityListScreen({ route, navigation }: Props) {
  const { directionSlug } = route.params;

  const [programs, setPrograms] = useState<ProgramBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | undefined>(undefined);

  const fetchPrograms = useCallback(async (country: string | undefined) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPrograms(directionSlug, country);
      setPrograms(data);
    } catch {
      setError('Не удалось загрузить программы. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  }, [directionSlug]);

  useEffect(() => {
    fetchPrograms(activeCountry);
  }, [fetchPrograms, activeCountry]);

  function handleFilterPress(value: string | undefined) {
    setActiveCountry(value);
  }

  function handleProgramPress(program: ProgramBrief) {
    navigation.navigate('ProgramDetail', {
      programId: program.id,
      programName: program.name,
      universityName: program.university.name,
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
        <Text style={styles.navTitle}>{'Университеты'}</Text>
        <View style={styles.navSpacer} />
      </View>

      {/* Country filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {COUNTRY_FILTERS.map((filter) => {
            const isActive = activeCountry === filter.value;
            return (
              <TouchableOpacity
                key={filter.label}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => handleFilterPress(filter.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error !== null ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchPrograms(activeCountry)}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>{'Повторить'}</Text>
          </TouchableOpacity>
        </View>
      ) : programs.length === 0 ? (
        <View style={styles.center}>
          <EmojiText size="lg" style={styles.emptyEmoji}>{'🎓'}</EmojiText>
          <Text style={styles.emptyTitle}>{'Программы не найдены'}</Text>
          <Text style={styles.emptySubtitle}>
            {'Попробуй выбрать другую страну или направление'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.countLabel}>{`${programs.length} программ`}</Text>
          {programs.map((program) => (
            <View key={program.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitles}>
                  <Text style={styles.programName}>{program.name}</Text>
                  <Text style={styles.universityName}>{program.university.name}</Text>
                </View>
                <View style={styles.countryBadge}>
                  <Text style={styles.countryBadgeText}>{program.university.country}</Text>
                </View>
              </View>

              {program.description !== null && (program.description ?? '').length > 0 && (
                <Text style={styles.description} numberOfLines={2}>
                  {program.description}
                </Text>
              )}

              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <EmojiText size="xs" style={styles.metaIcon}>{'🌐'}</EmojiText>
                  <Text style={styles.metaText}>{program.language}</Text>
                </View>
                <View style={styles.metaItem}>
                  <EmojiText size="xs" style={styles.metaIcon}>{'💰'}</EmojiText>
                  <Text style={styles.metaText}>{formatCost(program.cost_per_year)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() => handleProgramPress(program)}
                activeOpacity={0.8}
              >
                <Text style={styles.detailBtnText}>{'Посмотреть требования'}</Text>
              </TouchableOpacity>
            </View>
          ))}
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
    justifyContent: 'space-between',
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
    minWidth: 72,
  },
  backIcon: {
    ...typography.title,
    color: colors.primary,
  },
  backLabel: {
    ...typography.label,
    color: colors.primary,
  },
  navTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  navSpacer: {
    minWidth: 72,
  },
  filtersContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: spacing.screenH,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.onPrimary,
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
  emptyEmoji: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  countLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  cardTitles: {
    flex: 1,
    gap: spacing.xs,
  },
  programName: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  universityName: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  countryBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexShrink: 0,
  },
  countryBadgeText: {
    ...typography.small,
    color: colors.primaryDeep,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaIcon: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaText: {
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
});
