import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useAssessmentStore } from '../store/assessmentStore';
import BlockRoadmap from '../components/common/BlockRoadmap';
import { colors, radii, shadows, spacing, typography, fontFamily, fontSize } from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const profile = useProfileStore((s) => s.profile);
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const goal = useAssessmentStore((s) => s.goal);
  const currentBlock = useAssessmentStore((s) => s.currentBlock);

  const totalBlocks = goal === 'university' ? 8 : 7;
  const hasAssessment = assessmentId !== null && goal !== null;
  const isCompleted = hasAssessment && currentBlock >= totalBlocks;
  const inProgress = hasAssessment && !isCompleted;

  const displayName = profile?.name?.trim().split(' ')[0]
    || user?.name?.trim().split(' ')[0]
    || null;
  const initial = displayName ? displayName[0].toUpperCase() : '?';
  const greeting = displayName ? `Привет, ${displayName}!` : 'Привет!';

  function handleLogout() {
    clearProfile();
    logout();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTexts}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.headerSub}>
              {isCompleted
                ? 'Ты прошёл всю диагностику 🎉'
                : inProgress
                ? `Блок ${currentBlock + 1} из ${totalBlocks}`
                : 'Готов начать?'}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>

        {/* Progress card */}
        {hasAssessment && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                {isCompleted ? 'Диагностика пройдена!' : 'Твой прогресс'}
              </Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>
                  {isCompleted ? totalBlocks : currentBlock}/{totalBlocks}
                </Text>
              </View>
            </View>

            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${(Math.min(currentBlock, totalBlocks) / totalBlocks) * 100}%`,
                  },
                ]}
              />
            </View>

            <BlockRoadmap currentBlock={currentBlock} goal={goal} />
          </View>
        )}

        {/* Empty state card */}
        {!hasAssessment && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyTitle}>Пройди диагностику</Text>
            <Text style={styles.emptyDesc}>
              7 коротких блоков — и ты получишь персональную карту профессий
            </Text>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, isCompleted && styles.ctaBtnSecondary]}
          onPress={() => navigation.navigate('GoalSelection')}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaBtnText, isCompleted && styles.ctaBtnTextSecondary]}>
            {isCompleted ? 'Пройти ещё раз' : inProgress ? 'Продолжить тест' : 'Начать тест'}
          </Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: spacing['2xl'],
    paddingTop: spacing.xl,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
  },
  headerTexts: {
    flex: 1,
    marginRight: spacing.md,
  },
  greeting: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.h1,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSub: {
    ...typography.body,
    color: colors.textSecondary,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  avatarText: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.title,
    color: colors.onPrimary,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  progressTitle: {
    ...typography.label,
    color: colors.text,
  },
  progressBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  progressBadgeText: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.caption,
    color: colors.primaryDeep,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.track,
    marginHorizontal: spacing.xl,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.title,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ctaBtn: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.button,
  },
  ctaBtnSecondary: {
    backgroundColor: colors.primarySoft,
    shadowColor: 'transparent',
    elevation: 0,
  },
  ctaBtnText: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.label,
    color: colors.onPrimary,
  },
  ctaBtnTextSecondary: {
    color: colors.primaryDeep,
  },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  logoutText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
