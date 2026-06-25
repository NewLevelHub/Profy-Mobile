import React, { useEffect, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types';
import { generateReport } from '../api/result';
import { useResultStore } from '../store/resultStore';
import { EmojiText } from '../components/common/EmojiText';
import { useAssessmentStore } from '../store/assessmentStore';
import { colors, typography, spacing, radii } from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'ResultLoading'>;

const MESSAGES = [
  'Анализируем твои ответы...',
  'Находим подходящие направления...',
  'Составляем твой профиль...',
  'Почти готово...',
];

export default function ResultLoadingScreen({ route, navigation }: Props) {
  const { assessmentId } = route.params;
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const textOpacity = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const setReport = useResultStore((s) => s.setReport);
  const completeAssessment = useAssessmentStore((s) => s.completeAssessment);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        if (!isMountedRef.current) return;
        setMessageIndex((i) => (i + 1) % MESSAGES.length);
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }, 2000);

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    async function fetchReport() {
      try {
        const report = await generateReport(assessmentId);
        if (!isMountedRef.current) return;
        setReport(report);
        completeAssessment();
        navigation.replace('MainTabs', { screen: 'Result' });
      } catch {
        if (isMountedRef.current) {
          setError('Не удалось получить результат. Попробуй ещё раз.');
        }
      }
    }
    fetchReport();
  }, [assessmentId]);

  function handleRetry() {
    setError(null);
    async function retry() {
      try {
        const report = await generateReport(assessmentId);
        if (!isMountedRef.current) return;
        setReport(report);
        completeAssessment();
        navigation.replace('MainTabs', { screen: 'Result' });
      } catch {
        if (isMountedRef.current) {
          setError('Не удалось получить результат. Попробуй ещё раз.');
        }
      }
    }
    retry();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <EmojiText size="xl" style={styles.emoji}>{'✨'}</EmojiText>
        <Animated.View style={{ opacity: textOpacity }}>
          <Text style={styles.message}>{MESSAGES[messageIndex]}</Text>
        </Animated.View>
        {error !== null && (
          <>
            <Text style={styles.error}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
              <Text style={styles.retryText}>{'Попробовать снова'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  emoji: {
    textAlign: 'center',
    marginBottom: spacing['3xl'],
  },
  message: {
    ...typography.subtitle,
    color: colors.text,
    textAlign: 'center',
    minHeight: 56,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing['2xl'],
    marginBottom: spacing.lg,
  },
  retryBtn: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },
  retryText: {
    ...typography.caption,
    color: colors.primaryDeep,
  },
});
