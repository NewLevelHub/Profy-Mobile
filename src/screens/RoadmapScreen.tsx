import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types';
import { colors, typography, spacing, radii, shadows } from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'Roadmap'>;

export default function RoadmapScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>{'←'}</Text>
          <Text style={styles.backLabel}>{'Назад'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <Text style={styles.emoji}>{'🗺️'}</Text>
        <Text style={styles.title}>{'План подготовки'}</Text>
        <Text style={styles.subtitle}>
          {'Персональный роадмап будет здесь — шаги на 1 месяц, 3 месяца, 6 месяцев и до поступления.'}
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
          <Text style={styles.btnText}>{'На главную'}</Text>
        </TouchableOpacity>
      </View>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenH,
    gap: spacing.lg,
  },
  emoji: {
    fontSize: 56,
    lineHeight: 64,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
    ...shadows.button,
  },
  btnText: {
    ...typography.label,
    color: colors.onPrimary,
  },
});
