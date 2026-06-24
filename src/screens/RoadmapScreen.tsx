import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  AppStackParamList,
  RoadmapHorizonKey,
  RoadmapMilestone,
  RoadmapResponse,
  RoadmapTask,
  RoadmapTaskCategory,
} from '../types';
import { generateRoadmap } from '../api/roadmap';
import { colors, typography, spacing, radii, shadows } from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'Roadmap'>;

const HORIZONS: { key: RoadmapHorizonKey; label: string }[] = [
  { key: 'month_1',    label: '1 месяц' },
  { key: 'months_3',  label: '3 месяца' },
  { key: 'months_6',  label: '6 месяцев' },
  { key: 'year_1',    label: '1 год' },
  { key: 'until_goal', label: 'До цели' },
];

const GOAL_LABELS: Record<string, string> = {
  explore:    'Исследую себя',
  profession: 'Выбор профессии',
  university: 'Поступление в университет',
};

const CATEGORY_ICONS: Record<RoadmapTaskCategory, string> = {
  study:       '📚',
  language:    '🌐',
  project:     '💻',
  exam:        '📝',
  explore:     '🔭',
  achievement: '⭐',
};

function priorityColor(priority: number): string {
  if (priority <= 1) return colors.danger;
  if (priority === 2) return colors.accent;
  return colors.ok;
}

function TaskCard({ task, index }: { task: RoadmapTask; index: number }) {
  const icon = CATEGORY_ICONS[task.category] ?? '•';
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskRow}>
        <Text style={styles.taskIcon}>{icon}</Text>
        <Text style={styles.taskText}>{task.text}</Text>
        <View style={[styles.priorityDot, { backgroundColor: priorityColor(task.priority) }]} />
      </View>
    </View>
  );
}

export default function RoadmapScreen({ route, navigation }: Props) {
  const { assessmentId, subtitle: subtitleParam } = route.params;

  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHorizon, setActiveHorizon] = useState<RoadmapHorizonKey>('month_1');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  function loadRoadmap() {
    setLoading(true);
    setError(null);
    generateRoadmap(assessmentId)
      .then((data) => {
        setRoadmap(data);
        if (data.milestones?.length > 0) {
          setActiveHorizon(data.milestones[0].horizon);
        }
      })
      .catch(() => setError('Не удалось загрузить план. Попробуй ещё раз.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRoadmap();
  }, []);

  function showSavedToast() {
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  async function handleShare() {
    const firstMilestone = roadmap?.milestones?.find((m) => m.horizon === 'month_1')
      ?? roadmap?.milestones?.[0];
    if (firstMilestone === undefined || firstMilestone.tasks.length === 0) return;
    const heading = subtitleParam
      ?? (roadmap?.goal ? GOAL_LABELS[roadmap.goal] : undefined)
      ?? 'Мой план развития';
    const taskLines = firstMilestone.tasks
      .map((t) => `${CATEGORY_ICONS[t.category] ?? '•'} ${t.text}`)
      .join('\n');
    const horizonLabel = HORIZONS.find((h) => h.key === firstMilestone.horizon)?.label ?? '1 месяц';
    await Share.share({
      message: `📋 ${heading}\n\nПлан на ${horizonLabel}:\n${taskLines}\n\nСоставлено в Profy`,
    });
  }

  const subtitle = subtitleParam
    ?? (roadmap?.goal ? GOAL_LABELS[roadmap.goal] : undefined);

  const currentMilestone: RoadmapMilestone | undefined =
    roadmap?.milestones?.find((m) => m.horizon === activeHorizon);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>{'←'}</Text>
          <Text style={styles.backLabel}>{'Назад'}</Text>
        </TouchableOpacity>
      </View>

      {/* Screen header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>{'Твой план развития'}</Text>
        {subtitle !== undefined && subtitle.length > 0 && (
          <Text style={styles.screenSubtitle}>{subtitle}</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{'Строим твой план...'}</Text>
        </View>
      ) : error !== null || roadmap === null ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'Нет данных'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadRoadmap} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>{'Повторить'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Horizon tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsBar}
            contentContainerStyle={styles.tabsContent}
          >
            {HORIZONS.map((h) => (
              <TouchableOpacity
                key={h.key}
                style={[styles.tab, activeHorizon === h.key && styles.tabActive]}
                onPress={() => setActiveHorizon(h.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabLabel, activeHorizon === h.key && styles.tabLabelActive]}>
                  {h.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tasks */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {currentMilestone !== undefined && currentMilestone.title.length > 0 && (
              <Text style={styles.horizonTitle}>{currentMilestone.title}</Text>
            )}
            {currentMilestone === undefined || currentMilestone.tasks.length === 0 ? (
              <View style={styles.emptyBlock}>
                <Text style={styles.emptyText}>
                  {'Задачи для этого периода появятся позже'}
                </Text>
              </View>
            ) : (
              currentMilestone.tasks.map((task, i) => (
                <TaskCard key={i} task={task} index={i} />
              ))
            )}
          </ScrollView>

          {/* Bottom action bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.bottomBtn, styles.shareBtn]}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Text style={styles.shareBtnText}>{'Поделиться'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomBtn, styles.saveBtn]}
              onPress={showSavedToast}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>{'Сохранить план'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Toast overlay */}
      <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
        <Text style={styles.toastText}>{'Роадмап сохранён'}</Text>
      </Animated.View>
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
  header: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  screenTitle: {
    ...typography.h1,
    color: colors.text,
  },
  screenSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  tabsBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexGrow: 0,
  },
  tabsContent: {
    paddingHorizontal: spacing.screenH,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primaryDeep,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing['2xl'],
    paddingBottom: 120,
  },
  horizonTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing['2xl'],
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.card,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  taskIcon: {
    ...typography.title,
    lineHeight: 28,
  },
  taskText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
  },
  emptyBlock: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenH,
    paddingVertical: spacing.lg,
    paddingBottom: spacing['2xl'],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  bottomBtn: {
    flex: 1,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  saveBtnText: {
    ...typography.label,
    color: colors.onPrimary,
  },
  shareBtn: {
    backgroundColor: colors.primaryGhost,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  shareBtnText: {
    ...typography.label,
    color: colors.primary,
  },
  toast: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    backgroundColor: colors.text,
    borderRadius: radii.pill,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  toastText: {
    ...typography.caption,
    color: colors.onPrimary,
  },
});
