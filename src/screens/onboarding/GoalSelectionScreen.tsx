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
  }

  const visibleCards = GOAL_CARDS.filter(
    (card) => !card.seniorOnly || ageGroup === 'senior',
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4F46E5" />
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
            color="#4F46E5"
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
    backgroundColor: '#F9FAFB',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    padding: 24,
    paddingTop: 48,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 22,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardBody: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  cardArrow: {
    fontSize: 24,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  cardLoader: {
    marginTop: 16,
  },
  error: {
    marginTop: 16,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  dialogBody: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
  },
  btnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnOutlineText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
