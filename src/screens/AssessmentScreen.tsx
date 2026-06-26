import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  AppStackParamList,
  AssessmentBlock,
  AnswerPayload,
  Question,
} from '../types';
import { useAssessmentStore } from '../store/assessmentStore';
import { useProfileStore } from '../store/profileStore';
import { useResultStore } from '../store/resultStore';
import { getQuestions, saveAnswers } from '../api/questions';
import OptionCard from '../components/common/OptionCard';
import ConfettiBlast from '../components/common/ConfettiBlast';
import { EmojiText } from '../components/common/EmojiText';
import { colors, typography, spacing, radii, shadows, fontFamily, fontSize } from '../constants/themes/themes';
import { BLOCK_NAMES, BLOCK_DESCRIPTIONS, BLOCK_EMOJIS } from '../constants/blocks';
import { getAssessmentBlocks } from '../utils/assessmentBlocks';

// UNUSED: roadmap phase was removed — after each block user goes to MainTabs (HomeScreen).
// Dead code kept for reference: roadmapOpacity, showRoadmap(), handleRoadmapContinue(),
// nextBlockIndex, {phase === 'roadmap'} JSX block, and roadmap* / blockCard* / planCard* styles.

type Props = NativeStackScreenProps<AppStackParamList, 'Assessment'>;
type Phase = 'loading' | 'intro' | 'question' | 'praise'; // 'roadmap' removed

export default function AssessmentScreen({ navigation, route }: Props) {
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const goal = useAssessmentStore((s) => s.goal);
  const currentBlock = useAssessmentStore((s) => s.currentBlock);
  const completedBlocks = useAssessmentStore((s) => s.completedBlocks);
  const advanceBlock = useAssessmentStore((s) => s.advanceBlock);
  const markBlockCompleted = useAssessmentStore((s) => s.markBlockCompleted);
  const clearReport = useResultStore((s) => s.clearReport);
  const ageGroup = useProfileStore((s) => s.profile?.age_group ?? 'middle');

  const retakeBlockIndex = route.params?.retakeBlockIndex ?? null;
  const isRetaking = retakeBlockIndex !== null;
  const effectiveBlockIndex = retakeBlockIndex ?? currentBlock;

  const activeBlocks = getAssessmentBlocks(ageGroup, goal);
  const totalBlocks = activeBlocks.length;

  const [phase, setPhase] = useState<Phase>('loading');
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
  const roadmapOpacity = useRef(new Animated.Value(0)).current;
  const introTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const praiseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Snapshot of currentBlock at the moment praise starts
  const completedBlockRef = useRef(0);

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
    if (!isRetaking && currentBlock >= totalBlocks) {
      navigation.navigate('ResultLoading', { assessmentId: assessmentId! });
      return;
    }

    async function load() {
      setPhase('loading');
      setError(null);
      try {
        const data = await getQuestions(assessmentId!, activeBlocks[effectiveBlockIndex]);
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
  }, [effectiveBlockIndex, loadTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleBack() {
    if (questionIndex === 0) return;
    Animated.timing(questionOpacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      if (!isMountedRef.current) return;
      setBlockAnswers((prev) => prev.slice(0, questionIndex - 1));
      setQuestionIndex((i) => i - 1);
      setSelectedOptionIndex(null);
      Animated.timing(questionOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  }

  function handleOptionSelect(questionId: string, optionIndex: number) {
    const isLast = questionIndex === questions.length - 1;

    if (!isLast && selectedOptionIndex !== null) return;
    setSelectedOptionIndex(optionIndex);

    if (isLast) {
      setBlockAnswers((prev) => {
        const idx = prev.findIndex((a) => a.question_id === questionId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { question_id: questionId, selected_option_index: optionIndex };
          return next;
        }
        return [...prev, { question_id: questionId, selected_option_index: optionIndex }];
      });
      return;
    }

    setBlockAnswers((prev) => [
      ...prev,
      { question_id: questionId, selected_option_index: optionIndex },
    ]);
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

  function showRoadmap() {
    roadmapOpacity.setValue(0);
    setPhase('roadmap');
    Animated.timing(roadmapOpacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }

  async function handleNextBlock() {
    setSaving(true);
    setError(null);
    try {
      await saveAnswers(assessmentId!, {
        block: activeBlocks[effectiveBlockIndex],
        answers: blockAnswers,
      });
      markBlockCompleted(activeBlocks[effectiveBlockIndex]);
      completedBlockRef.current = effectiveBlockIndex;
      const isLast = !isRetaking && (effectiveBlockIndex + 1 >= totalBlocks);
      const blockName = BLOCK_NAMES[activeBlocks[effectiveBlockIndex]];
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
        if (!isMountedRef.current) return;
        if (isRetaking) {
          clearReport();
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        } else if (isLast) {
          advanceBlock();
        } else {
          advanceBlock();
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        }
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
    if (isRetaking) {
      clearReport();
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      return;
    }
    const isLast = completedBlockRef.current + 1 >= totalBlocks;
    if (isLast) {
      advanceBlock();
    } else {
      advanceBlock();
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  }

  function handleRoadmapContinue() {
    advanceBlock();
  }

  function handleExit() {
    Alert.alert('Выйти из теста?', 'Прогресс сохранён, продолжишь позже', [
      { text: 'Остаться', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: () => navigation.navigate('MainTabs'),
      },
    ]);
  }

  const questionProgress = questions.length > 0 ? (questionIndex + 1) / questions.length : 0;
  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questions.length > 0 && questionIndex === questions.length - 1;
  const showNextButton = isLastQuestion && selectedOptionIndex !== null;
  const isLastBlock = !isRetaking && (effectiveBlockIndex + 1 >= totalBlocks);

  const completedCount = isRetaking ? completedBlocks.size : completedBlockRef.current + 1;
  // Index of the next block that is now unlocked after praise
  const nextBlockIndex = completedBlockRef.current + 1;

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── PRAISE ─────────────────────────────────────────────── */}
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
              <EmojiText size="hero" style={styles.praiseEmoji}>{'⭐'}</EmojiText>
              <Text style={styles.praiseTitle}>{praiseMessage.title}</Text>
              <Text style={styles.praiseSubtitle}>{praiseMessage.subtitle}</Text>

              {/* Progress bar — only for non-last blocks */}
              {!isRetaking && completedBlockRef.current + 1 < totalBlocks && (
                <View style={styles.praiseProgressCard}>
                  <Text style={styles.praiseProgressLabel}>{'Прогресс'}</Text>
                  <View style={styles.praiseProgressBar}>
                    <View
                      style={[
                        styles.praiseProgressFill,
                        { width: `${(completedCount / totalBlocks) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.praiseProgressFraction}>
                    {`${completedCount}/${totalBlocks}`}
                  </Text>
                </View>
              )}
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

      {/* ── BETWEEN-BLOCK ROADMAP ──────────────────────────────── */}
      {phase === 'roadmap' && (
        <Animated.View style={[styles.roadmapRoot, { opacity: roadmapOpacity }]}>
          {/* Header row */}
          <View style={styles.roadmapPhaseHeader}>
            <View style={styles.roadmapProgressChip}>
              <Text style={styles.roadmapProgressText}>
                {`${completedCount}/${totalBlocks} блоков пройдено`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleExit}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.roadmapExitBtn}>{'✕'}</Text>
            </TouchableOpacity>
          </View>

          {/* Block list */}
          <ScrollView
            style={styles.roadmapScroll}
            contentContainerStyle={styles.roadmapScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeBlocks.map((block, index) => {
              const isCompleted = index < nextBlockIndex;
              const isCurrent = index === nextBlockIndex;
              const isLocked = index > nextBlockIndex;
              return (
                <View
                  key={block}
                  style={[
                    styles.blockCard,
                    isCurrent && styles.blockCardCurrent,
                  ]}
                >
                  {/* Status circle */}
                  <View
                    style={[
                      styles.blockCardCircle,
                      isCompleted && styles.blockCardCircleCompleted,
                      isCurrent && styles.blockCardCircleCurrent,
                      isLocked && styles.blockCardCircleLocked,
                    ]}
                  >
                    <Text
                      style={[
                        styles.blockCardCircleText,
                        isLocked && styles.blockCardCircleTextLocked,
                      ]}
                    >
                      {isCompleted ? '✓' : String(index + 1)}
                    </Text>
                  </View>

                  {/* Name + status */}
                  <View style={styles.blockCardContent}>
                    <Text
                      style={[
                        styles.blockCardName,
                        isCurrent && styles.blockCardNameCurrent,
                        isLocked && styles.blockCardNameLocked,
                      ]}
                    >
                      {BLOCK_NAMES[block]}
                    </Text>
                    <Text
                      style={[
                        styles.blockCardStatus,
                        isCompleted && styles.blockCardStatusCompleted,
                        isCurrent && styles.blockCardStatusCurrent,
                      ]}
                    >
                      {isCompleted ? 'Пройден' : isCurrent ? 'Сейчас' : 'Откроется позже'}
                    </Text>
                  </View>

                  {/* Emoji in rounded square */}
                  <View
                    style={[
                      styles.blockCardEmojiWrap,
                      isLocked && styles.blockCardEmojiWrapLocked,
                    ]}
                  >
                    <Text style={styles.blockCardEmoji}>{BLOCK_EMOJIS[block]}</Text>
                  </View>
                </View>
              );
            })}

            {/* Locked result card */}
            <View style={styles.planCard}>
              <View style={styles.planCardIconWrap}>
                <Text style={styles.planCardIconText}>{'🔒'}</Text>
              </View>
              <View style={styles.planCardBody}>
                <Text style={styles.planCardTitle}>{'Твой план профессий'}</Text>
                <Text style={styles.planCardSubtitle}>
                  {'Откроется, когда пройдёшь все блоки'}
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.roadmapContinueBtn}
            onPress={handleRoadmapContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.roadmapContinueBtnText}>{'Продолжить тест'}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── QUESTION / INTRO / LOADING ─────────────────────────── */}
      {phase !== 'praise' && phase !== 'roadmap' && (
        <>
          {/* Compact header: back ← | BlockName · вопрос X из Y | ✕ */}
          <View style={styles.header}>
            {phase === 'question' && questionIndex > 0 ? (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={handleBack}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.backBtn} />
            )}
            <Text style={styles.headerTitle} numberOfLines={1}>
              {phase === 'loading'
                ? BLOCK_NAMES[activeBlocks[effectiveBlockIndex]]
                : phase === 'question' && questions.length > 0
                ? `${BLOCK_NAMES[activeBlocks[effectiveBlockIndex]]} · вопрос ${questionIndex + 1} из ${questions.length}`
                : BLOCK_NAMES[activeBlocks[effectiveBlockIndex]]}
            </Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleExit}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.closeBtnText}>{'✕'}</Text>
            </TouchableOpacity>
          </View>

          {/* Question-scoped progress bar */}
          <View style={styles.progressTrackWrap}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: `${questionProgress * 100}%` }]} />
            </View>
          </View>

          {phase === 'loading' && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {phase === 'intro' && (
            <Animated.View style={[styles.center, { opacity: introOpacity }]}>
              <View style={styles.introBadge}>
                <Text style={styles.introBadgeText}>
                {isRetaking ? 'Перепрохождение' : `Блок ${effectiveBlockIndex + 1}`}
              </Text>
              </View>
              <Text style={styles.introTitle}>
                {BLOCK_NAMES[activeBlocks[effectiveBlockIndex]]}
              </Text>
              <Text style={styles.introDescription}>
                {BLOCK_DESCRIPTIONS[activeBlocks[effectiveBlockIndex]]}
              </Text>
            </Animated.View>
          )}

          {phase === 'question' && (
            <View style={styles.questionPhase}>
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
                  </Animated.View>
                )}
              </ScrollView>

              {showNextButton && (
                <View style={styles.nextBtnWrap}>
                  <TouchableOpacity
                    style={[styles.nextBtn, saving && styles.nextBtnDisabled]}
                    onPress={handleNextBlock}
                    disabled={saving}
                    activeOpacity={0.8}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color={colors.onPrimary} />
                    ) : (
                      <Text style={styles.nextBtnText}>{'Дальше'}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
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

  // ── Header (question / intro / loading) ───────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.label,
    color: colors.text,
    textAlign: 'center',
  },
  progressTrackWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.track,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  questionPhase: {
    flex: 1,
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
    paddingVertical: spacing.xs,
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
    paddingBottom: spacing['3xl'],
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
    fontSize: fontSize.title,
    lineHeight: 30,
  },
  options: {
    marginBottom: spacing.sm,
  },
  nextBtnWrap: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['3xl'],
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadows.button,
  },
  nextBtnDisabled: {
    opacity: 0.7,
  },
  nextBtnText: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
  },

  // ── Praise phase ──────────────────────────────────────────────
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
    width: '100%',
  },
  praiseEmoji: {
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
    color: colors.textSecondary,
    marginBottom: spacing['2xl'],
  },
  praiseProgressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  praiseProgressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  praiseProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.track,
    borderRadius: 4,
    overflow: 'hidden',
  },
  praiseProgressFill: {
    height: 8,
    backgroundColor: colors.ok,
    borderRadius: 4,
  },
  praiseProgressFraction: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 0,
    fontFamily: fontFamily.bold,
  },
  praiseBtn: {
    marginHorizontal: spacing['2xl'],
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

  // ── Between-block roadmap phase ───────────────────────────────
  roadmapRoot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  roadmapPhaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  roadmapProgressChip: {
    backgroundColor: colors.ok + '22',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  roadmapProgressText: {
    ...typography.caption,
    color: colors.ok,
    fontFamily: fontFamily.bold,
  },
  roadmapExitBtn: {
    ...typography.body,
    color: colors.textMuted,
    paddingHorizontal: spacing.sm,
  },
  roadmapScroll: {
    flex: 1,
  },
  roadmapScrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },

  // Block cards (between-block roadmap)
  blockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
    ...shadows.card,
  },
  blockCardCurrent: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  blockCardCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  blockCardCircleCompleted: {
    backgroundColor: colors.nodeCompleted,
  },
  blockCardCircleCurrent: {
    backgroundColor: colors.nodeCurrent,
  },
  blockCardCircleLocked: {
    backgroundColor: colors.nodeLocked,
  },
  blockCardCircleText: {
    ...typography.label,
    color: colors.onPrimary,
  },
  blockCardCircleTextLocked: {
    color: colors.textMuted,
  },
  blockCardContent: {
    flex: 1,
  },
  blockCardName: {
    ...typography.label,
    color: colors.text,
  },
  blockCardNameCurrent: {
    fontFamily: fontFamily.extrabold,
  },
  blockCardNameLocked: {
    color: colors.textMuted,
    fontFamily: fontFamily.semibold,
  },
  blockCardStatus: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  blockCardStatusCompleted: {
    color: colors.ok,
  },
  blockCardStatusCurrent: {
    color: colors.primary,
  },
  blockCardEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  blockCardEmojiWrapLocked: {
    backgroundColor: colors.bg,
    opacity: 0.55,
  },
  blockCardEmoji: {
    fontSize: fontSize.title,
  },

  // Locked plan card
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryGhost,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.xs,
    gap: spacing.lg,
  },
  planCardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.accent + '25',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  planCardIconText: {
    fontSize: fontSize.title,
  },
  planCardBody: {
    flex: 1,
  },
  planCardTitle: {
    ...typography.label,
    color: colors.primaryDeep,
  },
  planCardSubtitle: {
    ...typography.caption,
    color: colors.accent,
    marginTop: spacing.xs,
  },

  // Continue button
  roadmapContinueBtn: {
    marginHorizontal: spacing['2xl'],
    marginBottom: spacing['3xl'],
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    ...shadows.button,
  },
  roadmapContinueBtnText: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
  },
});
