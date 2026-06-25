import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types';
import { TextWithLeadingEmoji } from '../components/common/EmojiText';
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
} from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'DirectionDetail'>;

export default function DirectionDetailScreen({ route, navigation }: Props) {
  const { direction } = route.params;

  function handleSelect() {
    Alert.alert(
      'Направление выбрано!',
      `Ты выбрал${'​'}а направление «${direction.name}». Продолжай исследовать свои возможности.`,
      [{ text: 'Отлично!', onPress: () => navigation.navigate('MainTabs') }],
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header with back button */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>{'←'}</Text>
          <Text style={styles.backLabel}>{'Назад'}</Text>
        </TouchableOpacity>
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{`${direction.match_score}% совпадение`}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>{direction.name}</Text>

        {/* Description */}
        {(direction.description ?? '').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.descriptionText}>{direction.description}</Text>
          </View>
        )}

        {/* Why it fits */}
        <View style={[styles.section, styles.whyCard]}>
          <TextWithLeadingEmoji emojiChar="✨" textStyle={styles.sectionLabelText} style={styles.sectionLabel}>
            Почему тебе подходит
          </TextWithLeadingEmoji>
          <Text style={styles.whyText}>{direction.why_it_fits}</Text>
        </View>

        {/* Professions */}
        {(direction.professions ?? []).length > 0 && (
          <View style={styles.section}>
            <TextWithLeadingEmoji emojiChar="👔" textStyle={styles.sectionLabelText} style={styles.sectionLabel}>
              Профессии
            </TextWithLeadingEmoji>
            <View style={styles.chipWrap}>
              {(direction.professions ?? []).map((prof, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{prof}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Skills needed */}
        {(direction.skills_needed ?? []).length > 0 && (
          <View style={styles.section}>
            <TextWithLeadingEmoji emojiChar="🛠️" textStyle={styles.sectionLabelText} style={styles.sectionLabel}>
              Навыки для развития
            </TextWithLeadingEmoji>
            {(direction.skills_needed ?? []).map((skill, i) => (
              <View key={i} style={styles.listRow}>
                <Text style={styles.listBullet}>{'•'}</Text>
                <Text style={styles.listText}>{skill}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Subjects to develop */}
        {(direction.subjects_to_develop ?? []).length > 0 && (
          <View style={styles.section}>
            <TextWithLeadingEmoji emojiChar="📚" textStyle={styles.sectionLabelText} style={styles.sectionLabel}>
              Предметы для изучения
            </TextWithLeadingEmoji>
            <View style={styles.chipWrap}>
              {(direction.subjects_to_develop ?? []).map((subj, i) => (
                <View key={i} style={[styles.chip, styles.chipSecondary]}>
                  <Text style={styles.chipTextSecondary}>{subj}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* First steps */}
        {(direction.first_steps ?? []).length > 0 && (
          <View style={styles.section}>
            <TextWithLeadingEmoji emojiChar="🎯" textStyle={styles.sectionLabelText} style={styles.sectionLabel}>
              Первые шаги
            </TextWithLeadingEmoji>
            {(direction.first_steps ?? []).map((step, i) => (
              <View key={i} style={styles.stepCard}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>{String(i + 1)}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBtn} onPress={handleSelect} activeOpacity={0.8}>
          <Text style={styles.ctaBtnText}>{'Выбрать это направление'}</Text>
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  matchBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  matchText: {
    ...typography.caption,
    color: colors.primaryDeep,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing['2xl'],
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  descriptionText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  whyCard: {
    backgroundColor: colors.primaryGhost,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    marginBottom: spacing.md,
  },
  sectionLabelText: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  whyText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    ...typography.caption,
    color: colors.primaryDeep,
  },
  chipSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipTextSecondary: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  listBullet: {
    ...typography.bodyStrong,
    color: colors.primary,
    lineHeight: 24,
  },
  listText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumber: {
    ...typography.small,
    color: colors.onPrimary,
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.button,
  },
  ctaBtnText: {
    ...typography.label,
    color: colors.onPrimary,
  },
});
