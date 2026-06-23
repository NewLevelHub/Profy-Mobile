import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useAssessmentStore } from '../store/assessmentStore';
import BlockRoadmap from '../components/common/BlockRoadmap';
import { colors, radii, shadows, spacing, typography } from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const goal = useAssessmentStore((s) => s.goal);
  const currentBlock = useAssessmentStore((s) => s.currentBlock);

  const totalBlocks = goal === 'university' ? 8 : 7;
  const isCompleted = assessmentId !== null && goal !== null && currentBlock >= totalBlocks;

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
        <Text style={styles.heading}>Главная</Text>

        {isCompleted && (
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>{'🎉'}</Text>
            <Text style={styles.completionTitle}>Тест пройден!</Text>
            <Text style={styles.completionSubtitle}>
              Ты прошёл все блоки диагностики
            </Text>
            <BlockRoadmap currentBlock={currentBlock} goal={goal} />
          </View>
        )}

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('GoalSelection')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>
            {isCompleted ? 'Пройти ещё раз' : 'Начать тест'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.btnOutlineText}>{'Выйти'}</Text>
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
    paddingTop: spacing['3xl'],
    flexGrow: 1,
  },
  heading: {
    ...typography.h1,
    marginBottom: spacing['2xl'],
  },
  completionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.md,
    marginBottom: spacing['2xl'],
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.card,
  },
  completionEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  completionTitle: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  completionSubtitle: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.button,
  },
  btnPrimaryText: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  btnOutlineText: {
    ...typography.bodyStrong,
    color: colors.danger,
  },
});
