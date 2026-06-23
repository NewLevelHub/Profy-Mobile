import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  AppStackParamList,
  AssessmentBlock,
  AnswerPayload,
  Question,
} from '../types';
import { useAssessmentStore } from '../store/assessmentStore';
import { useProfileStore } from '../store/profileStore';
import { getQuestions, saveAnswers } from '../api/questions';
import OptionCard from '../components/common/OptionCard';

type Props = NativeStackScreenProps<AppStackParamList, 'Assessment'>;

const ALL_BLOCKS: AssessmentBlock[] = [
  'interests',
  'thinking',
  'personality',
  'motivation',
  'academic',
  'directions',
  'goal_clarification',
  'university',
];

const BLOCK_NAMES: Record<AssessmentBlock, string> = {
  interests: 'Интересы',
  thinking: 'Стиль мышления',
  personality: 'Личность',
  motivation: 'Мотивация',
  academic: 'Учебные склонности',
  directions: 'Направления',
  goal_clarification: 'Твоя цель',
  university: 'Университет',
};

const BLOCK_DESCRIPTIONS: Record<AssessmentBlock, string> = {
  interests: 'Узнаем, что тебя по-настоящему интересует',
  thinking: 'Разберёмся, как ты думаешь и решаешь задачи',
  personality: 'Поймём твои сильные стороны характера',
  motivation: 'Выясним, что тебя вдохновляет и движет',
  academic: 'Посмотрим, какие предметы тебе ближе всего',
  directions: 'Определим подходящие профессиональные пути',
  goal_clarification: 'Уточним твою главную цель',
  university: 'Подберём университеты под твой профиль',
};

export default function AssessmentScreen({ navigation }: Props) {
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const goal = useAssessmentStore((s) => s.goal);
  const currentBlock = useAssessmentStore((s) => s.currentBlock);
  const advanceBlock = useAssessmentStore((s) => s.advanceBlock);
  const ageGroup = useProfileStore((s) => s.profile?.age_group ?? 'middle');

  const activeBlocks: AssessmentBlock[] =
    goal === 'university' ? ALL_BLOCKS : ALL_BLOCKS.slice(0, 7);
  const totalBlocks = activeBlocks.length;

  const [phase, setPhase] = useState<'loading' | 'intro' | 'question'>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [blockAnswers, setBlockAnswers] = useState<AnswerPayload[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadTrigger, setLoadTrigger] = useState(0);

  const questionOpacity = useRef(new Animated.Value(1)).current;
  const introOpacity = useRef(new Animated.Value(0)).current;
  const introTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!assessmentId) {
      navigation.navigate('GoalSelection');
      return;
    }
    if (currentBlock >= totalBlocks) {
      navigation.navigate('Home');
      return;
    }

    async function load() {
      setPhase('loading');
      setError(null);
      try {
        // activeBlocks and assessmentId are stable for the duration of an assessment
        const data = await getQuestions(assessmentId!, activeBlocks[currentBlock]);
        if (!isMountedRef.current) return;
        setQuestions(data);
        setQuestionIndex(0);
        setSelectedOptionIndex(null);
        setBlockAnswers([]);
        questionOpacity.setValue(1);
        introOpacity.setValue(0);
        setPhase('intro');
        Animated.timing(introOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
        introTimeoutRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          Animated.timing(introOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            if (isMountedRef.current) setPhase('question');
          });
        }, 2000);
      } catch {
        if (isMountedRef.current) {
          setError('Не удалось загрузить вопросы. Попробуй ещё раз.');
          setPhase('question');
        }
      }
    }

    load();

    return () => {
      if (introTimeoutRef.current) clearTimeout(introTimeoutRef.current);
    };
  }, [currentBlock, loadTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleOptionSelect(questionId: string, optionIndex: number) {
    if (selectedOptionIndex !== null) return;
    setSelectedOptionIndex(optionIndex);
    setBlockAnswers((prev) => [
      ...prev,
      { question_id: questionId, selected_option_index: optionIndex },
    ]);

    const isLast = questionIndex === questions.length - 1;
    if (!isLast) {
      setTimeout(() => {
        Animated.timing(questionOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }).start(() => {
          if (!isMountedRef.current) return;
          setQuestionIndex((i) => i + 1);
          setSelectedOptionIndex(null);
          Animated.timing(questionOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }).start();
        });
      }, 300);
    }
  }

  async function handleNextBlock() {
    setSaving(true);
    setError(null);
    try {
      await saveAnswers(assessmentId!, {
        block: activeBlocks[currentBlock],
        answers: blockAnswers,
      });
      advanceBlock();
    } catch {
      setError('Не удалось сохранить ответы. Попробуй ещё раз.');
    } finally {
      setSaving(false);
    }
  }

  function handleExit() {
    Alert.alert('Выйти из теста?', 'Прогресс сохранён, продолжишь позже', [
      { text: 'Остаться', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: () => navigation.navigate('Home'),
      },
    ]);
  }

  const progress = totalBlocks > 0 ? (currentBlock + 1) / totalBlocks : 0;
  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questions.length > 0 && questionIndex === questions.length - 1;
  const showNextButton = isLastQuestion && selectedOptionIndex !== null;
  const isLastBlock = currentBlock + 1 >= totalBlocks;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.blockCounter}>
            {`Блок ${currentBlock + 1} из ${totalBlocks}`}
          </Text>
          {phase !== 'loading' && (
            <Text style={styles.blockName} numberOfLines={1}>
              {BLOCK_NAMES[activeBlocks[currentBlock]]}
            </Text>
          )}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleExit}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.closeBtnText}>{'✕'}</Text>
        </TouchableOpacity>
      </View>

      {phase === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}

      {phase === 'intro' && (
        <Animated.View style={[styles.center, { opacity: introOpacity }]}>
          <View style={styles.introBadge}>
            <Text style={styles.introBadgeText}>{`Блок ${currentBlock + 1}`}</Text>
          </View>
          <Text style={styles.introTitle}>
            {BLOCK_NAMES[activeBlocks[currentBlock]]}
          </Text>
          <Text style={styles.introDescription}>
            {BLOCK_DESCRIPTIONS[activeBlocks[currentBlock]]}
          </Text>
        </Animated.View>
      )}

      {phase === 'question' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {error !== null && <Text style={styles.errorText}>{error}</Text>}
          {error !== null && !currentQuestion && (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => setLoadTrigger((t) => t + 1)}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>{'Попробовать снова'}</Text>
            </TouchableOpacity>
          )}
          {currentQuestion !== undefined && (
            <Animated.View style={{ opacity: questionOpacity }}>
              <Text
                style={[
                  styles.questionText,
                  ageGroup === 'junior' && styles.questionTextJunior,
                ]}
              >
                {currentQuestion.text}
              </Text>
              <View style={styles.options}>
                {currentQuestion.options.map((opt) => (
                  <OptionCard
                    key={opt.index}
                    text={opt.text}
                    index={opt.index}
                    selected={selectedOptionIndex === opt.index}
                    ageGroup={ageGroup}
                    onPress={() => handleOptionSelect(currentQuestion.id, opt.index)}
                  />
                ))}
              </View>
              {showNextButton && (
                <TouchableOpacity
                  style={[styles.nextBtn, saving && styles.nextBtnDisabled]}
                  onPress={handleNextBlock}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.nextBtnText}>
                      {isLastBlock ? 'Завершить тест' : 'Следующий раздел'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  blockCounter: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  blockName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  introBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
  },
  introBadgeText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '600',
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  introDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryBtn: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    marginBottom: 24,
  },
  retryBtnText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 28,
    marginBottom: 24,
  },
  questionTextJunior: {
    fontSize: 24,
    lineHeight: 34,
  },
  options: {
    marginBottom: 8,
  },
  nextBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  nextBtnDisabled: {
    opacity: 0.7,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
