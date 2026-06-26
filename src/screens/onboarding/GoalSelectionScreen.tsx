import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList, AssessmentGoal } from '../../types';
import { startAssessment } from '../../api/assessment';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useProfileStore } from '../../store/profileStore';
import BlockRoadmap from '../../components/common/BlockRoadmap';
import { EmojiText } from '../../components/common/EmojiText';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoalSelect(goal: AssessmentGoal) {
    setLoading(true);
    setError(null);
    try {
      const assessment = await startAssessment(goal);
      setAssessment(assessment.id, assessment.goal, assessment.current_block);
      navigation.navigate('Assessment');
    } catch {
      setError('Не удалось начать тест. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  const visibleCards = GOAL_CARDS.filter(
    (card) => !card.seniorOnly || ageGroup === 'senior',
  );

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
          <View style={styles.roadmapCardHeader}>
            <Text style={styles.roadmapHint}>
              {`Впереди ${ageGroup === 'senior' ? '8' : '7'} блоков`}
            </Text>
            <View style={styles.roadmapBadge}>
              <Text style={styles.roadmapBadgeText}>{'~20 мин'}</Text>
            </View>
          </View>
          <BlockRoadmap currentBlock={-1} goal={null} previewMode />
        </View>

        {visibleCards.map((card) => (
          <TouchableOpacity
            key={card.title}
            style={styles.card}
            onPress={() => handleGoalSelect(card.goal)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <View style={styles.cardIconWrap}>
              <EmojiText size="md" style={styles.cardEmoji}>{card.emoji}</EmojiText>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {loading && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.cardLoader}
          />
        )}

        {error !== null && <Text style={styles.error}>{error}</Text>}
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
    paddingTop: 52,
    paddingBottom: spacing['3xl'],
  },
  heading: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subheading: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing['2xl'],
  },
  roadmapCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing['2xl'],
    overflow: 'hidden',
    ...shadows.card,
  },
  roadmapCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  roadmapHint: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  roadmapBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  roadmapBadgeText: {
    ...typography.caption,
    color: colors.primaryDeep,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardEmoji: {},
  cardBody: {
    flex: 1,
    marginLeft: spacing.lg,
    marginRight: spacing.sm,
  },
  cardTitle: {
    ...typography.bodyStrong,
  },
  cardSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cardArrow: {
    fontSize: 22,
    color: colors.textMuted,
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
});
