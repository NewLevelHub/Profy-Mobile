import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList, AssessmentGoal, AssessmentResponse } from '../../types';
import { startAssessment, getCurrentAssessment } from '../../api/assessment';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useProfileStore } from '../../store/profileStore';
import BlockRoadmap from '../../components/common/BlockRoadmap';
import { colors, typography, spacing, radii, shadows } from '../../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'GoalSelection'>;

interface GoalCard {
  goal: AssessmentGoal;
  emoji: string;
  title: string;
  subtitle: string;
  seniorOnly?: boolean;
}

const GOAL_CARDS: GoalCard[] = [
  {
    goal: 'explore',
    emoji: '🔍',
    title: 'Понять себя',
    subtitle: 'Узнай свои сильные стороны и интересы',
  },
  {
    goal: 'profession',
    emoji: '🎯',
    title: 'Выбрать профессию',
    subtitle: 'Найди направление которое тебе подойдёт',
  },
  {
    goal: 'university',
    emoji: '🎓',
    title: 'Поступить в университет',
    subtitle: 'Построй путь к поступлению',
    seniorOnly: true,
  },
  {
    goal: 'explore',
    emoji: '💬',
    title: 'Пока не знаю',
    subtitle: 'Начнём с начала, разберёмся вместе',
  },
];

export default function GoalSelectionScreen({ navigation }: Props) {
  const ageGroup = useProfileStore((s) => s.profile?.age_group);
  const setAssessment = useAssessmentStore((s) => s.setAssessment);
  const resetAssessment = useAssessmentStore((s) => s.resetAssessment);
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<AssessmentResponse | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    getCurrentAssessment()
      .then((assessment) => {
        setExisting(assessment);
        setDialogVisible(true);
      })
      .catch(() => {
        // 404 — no active assessment, show goal cards
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleGoalSelect(goal: AssessmentGoal) {
    setCardLoading(true);
    setError(null);
    try {
      const assessment = await startAssessment(goal);
      setAssessment(assessment.id, assessment.goal, assessment.current_block);
      navigation.navigate('Assessment');
    } catch {
      setError('Не удалось начать тест. Попробуй ещё раз.');
    } finally {
      setCardLoading(false);
    }
  }

  function handleContinue() {
    if (!existing) return;
    setAssessment(existing.id, existing.goal, existing.current_block);
    setDialogVisible(false);
    navigation.navigate('Assessment');
  }

  function handleRestart() {
    setDialogVisible(false);
    setExisting(null);
    resetAssessment();
  }

  const visibleCards = GOAL_CARDS.filter(
    (card) => !card.seniorOnly || ageGroup === 'senior',
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Что ты хочешь узнать?</Text>
        <Text style={styles.subheading}>
          Выбери то, что тебе сейчас важнее всего
        </Text>

        <View style={styles.roadmapCard}>
          <Text style={styles.roadmapHint}>
            {`Впереди ${ageGroup === 'senior' ? '7–8' : '7'} блоков`}
          </Text>
          <BlockRoadmap currentBlock={-1} goal={null} />
        </View>

        {visibleCards.map((card) => (
          <TouchableOpacity
            key={card.title}
            style={styles.card}
            onPress={() => handleGoalSelect(card.goal)}
            disabled={cardLoading}
            activeOpacity={0.7}
          >
            <View style={styles.cardIconWrap}>
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {cardLoading && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.cardLoader}
          />
        )}

        {error !== null && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <Modal
        visible={dialogVisible}
        transparent
        animationType="fade"
        onRequestClose={handleRestart}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Продолжить прохождение?</Text>
            <Text style={styles.dialogBody}>
              У тебя есть незавершённый тест. Хочешь продолжить с того места, где остановился?
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.btnOutline}
                onPress={handleRestart}
                activeOpacity={0.7}
              >
                <Text style={styles.btnOutlineText}>Начать заново</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleContinue}
                activeOpacity={0.7}
              >
                <Text style={styles.btnPrimaryText}>Да</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: spacing['2xl'],
    paddingTop: 48,
  },
  heading: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subheading: {
    ...typography.body,
    marginBottom: spacing['2xl'],
  },
  roadmapCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing['2xl'],
    overflow: 'hidden',
  },
  roadmapHint: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardBody: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  cardTitle: {
    ...typography.bodyStrong,
  },
  cardSubtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  cardArrow: {
    fontSize: 24,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  cardLoader: {
    marginTop: spacing.lg,
  },
  error: {
    ...typography.caption,
    marginTop: spacing.lg,
    color: colors.danger,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  dialog: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
  },
  dialogTitle: {
    ...typography.subtitle,
    marginBottom: spacing.md,
  },
  dialogBody: {
    ...typography.body,
    marginBottom: spacing['2xl'],
  },
  dialogActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnOutlineText: {
    ...typography.caption,
    color: colors.primary,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnPrimaryText: {
    ...typography.caption,
    color: colors.onPrimary,
  },
});
