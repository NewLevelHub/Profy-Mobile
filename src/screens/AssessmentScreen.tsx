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
import BlockRoadmap from '../components/common/BlockRoadmap';
import ConfettiBlast from '../components/common/ConfettiBlast';
import { colors, typography, spacing, radii, shadows, fontFamily, fontSize } from '../constants/themes/themes';
import { ALL_BLOCKS, BLOCK_NAMES, BLOCK_DESCRIPTIONS } from '../constants/blocks';

type Props = NativeStackScreenProps<AppStackParamList, 'Assessment'>;

export default function AssessmentScreen({ navigation }: Props) {
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const goal = useAssessmentStore((s) => s.goal);
  const currentBlock = useAssessmentStore((s) => s.currentBlock);
  const advanceBlock = useAssessmentStore((s) => s.advanceBlock);
  const ageGroup = useProfileStore((s) => s.profile?.age_group ?? 'middle');

  const activeBlocks: AssessmentBlock[] =
    goal === 'university' ? ALL_BLOCKS : ALL_BLOCKS.slice(0, 7);
  const totalBlocks = activeBlocks.length;

  const [phase, setPhase] = useState<'loading' | 'intro' | 'question' | 'praise'>('loading');
  const [praiseMessage, setPraiseMessage] = useState<{ title: string; subtitle: string } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [blockAnswers, setBlockAnswers] = useState<AnswerPayload[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadTrigger, setLoadTrigger] = useState(0);

  const questionOpacity = useRef(new Animated.Value(1)).current;
  const introOpacity = useRef(new Animated.Value(0)).current;
  const praiseScale = useRef(new Animated.Value(0.6)).current;
  const praiseOpacity = useRef(new Animated.Value(0)).current;
  const introTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const praiseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      if (praiseTimerRef.current !== null) {
        clearTimeout(praiseTimerRef.current);
        praiseTimerRef.current = null;
      }
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
      const isLast = currentBlock + 1 >= totalBlocks;
      const blockName = BLOCK_NAMES[activeBlocks[currentBlock]];
      setPraiseMessage({
        title: isLast ? 'Ты справился!' : 'Молодец!',
        subtitle: isLast ? 'Скоро покажем результат' : `Блок «${blockName}» пройден`,
      });
      praiseScale.setValue(0.6);
      praiseOpacity.setValue(0);
      setPhase('praise');
      Animated.parallel([
        Animated.spring(praiseScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(praiseOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
      praiseTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) advanceBlock();
      }, 2500);
    } catch {
      setError('Не удалось сохранить ответы. Попробуй ещё раз.');
    } finally {
      setSaving(false);
    }
  }

  function handlePraiseContinue() {
    if (praiseTimerRef.current !== null) {
      clearTimeout(praiseTimerRef.current);
      praiseTimerRef.current = null;
    }
    advanceBlock();
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
      {phase === 'praise' && praiseMessage !== null && (
        <View style={styles.praiseRoot}>
          <ConfettiBlast />
          <View style={styles.praiseCenter}>
            <Animated.View
              style={[
                styles.praiseContent,
                { opacity: praiseOpacity, transform: [{ scale: praiseScale }] },
              ]}
            >
              <Text style={styles.praiseEmoji}>{'⭐'}</Text>
              <Text style={styles.praiseTitle}>{praiseMessage.title}</Text>
              <Text style={styles.praiseSubtitle}>{praiseMessage.subtitle}</Text>
            </Animated.View>
          </View>
          <TouchableOpacity
            style={styles.praiseBtn}
            onPress={handlePraiseContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.praiseBtnText}>{'Дальше'}</Text>
          </TouchableOpacity>
        </View>
      )}
      {phase !== 'praise' && (
        <>
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

          <View style={styles.roadmapStrip}>
            <BlockRoadmap currentBlock={currentBlock} goal={goal} compact />
          </View>

          {phase === 'loading' && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
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
                        <ActivityIndicator size="small" color={colors.onPrimary} />
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
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  blockCounter: {
    ...typography.small,
    marginBottom: 2,
  },
  blockName: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.track,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  roadmapStrip: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  introBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    marginBottom: spacing.xl,
  },
  introBadgeText: {
    ...typography.caption,
    color: colors.primaryDeep,
  },
  introTitle: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  introDescription: {
    ...typography.body,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing['2xl'],
    paddingBottom: 40,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  retryBtn: {
    alignSelf: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    marginBottom: spacing['2xl'],
  },
  retryBtnText: {
    ...typography.caption,
    color: colors.primaryDeep,
  },
  questionText: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.subtitle,
    color: colors.text,
    lineHeight: 28,
    marginBottom: spacing['2xl'],
  },
  questionTextJunior: {
    fontSize: 24,
    lineHeight: 34,
  },
  options: {
    marginBottom: spacing.sm,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  nextBtnDisabled: {
    opacity: 0.7,
  },
  nextBtnText: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
  },
  praiseRoot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  praiseCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  praiseContent: {
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  praiseEmoji: {
    ...typography.display,
    fontSize: 72,
    lineHeight: 88,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  praiseTitle: {
    ...typography.display,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  praiseSubtitle: {
    ...typography.body,
    textAlign: 'center',
  },
  praiseBtn: {
    marginHorizontal: spacing['3xl'],
    marginBottom: spacing['3xl'],
    paddingVertical: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    ...shadows.button,
  },
  praiseBtnText: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
  },
});
