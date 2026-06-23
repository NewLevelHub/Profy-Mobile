import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList, ArtifactItem } from '../../types';
import { saveArtifacts } from '../../api/artifacts';
import SubjectCard from '../../components/common/SubjectCard';
import { colors, typography, spacing, radii, fontFamily, fontSize } from '../../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'ArtifactsSetup'>;

const HOBBIES = [
  'Рисование', 'Музыка', 'Спорт', 'Программирование', 'Чтение',
  'Готовка', 'Фото/видео', 'Танцы', 'Робототехника', 'Дебаты',
  'Волонтёрство', 'Игры', 'Другое',
];

const CLUBS = [
  'Математический', 'Языковой', 'IT/программирование', 'Художественный',
  'Музыкальный', 'Театральный', 'Спортивная секция', 'Научный',
  'Дебатный клуб', 'Другое',
];

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((s) => s !== item) : [...list, item];
}

function addTag(
  input: string,
  setList: (updater: (prev: string[]) => string[]) => void,
  setInput: (v: string) => void,
) {
  const trimmed = input.trim();
  if (!trimmed) return;
  setList((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  setInput('');
}

export default function ArtifactsSetupScreen({ navigation }: Props) {
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [clubs, setClubs] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [dreams, setDreams] = useState<string[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>([]);

  const [achievementInput, setAchievementInput] = useState('');
  const [dreamInput, setDreamInput] = useState('');
  const [professionInput, setProfessionInput] = useState('');
  const [targetInput, setTargetInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState(false);

  function buildItems(): ArtifactItem[] {
    return [
      ...hobbies.map((v) => ({ type: 'hobby' as const, value: v })),
      ...clubs.map((v) => ({ type: 'club' as const, value: v })),
      ...achievements.map((v) => ({ type: 'achievement' as const, value: v })),
      ...dreams.map((v) => ({ type: 'goal' as const, value: v })),
      ...professions.map((v) => ({ type: 'profession' as const, value: v })),
      ...targets.map((v) => ({ type: 'university' as const, value: v })),
    ];
  }

  async function handleNext() {
    const items = buildItems();
    if (items.length === 0) {
      navigation.replace('GoalSelection');
      return;
    }
    setSaveError(false);
    setLoading(true);
    try {
      await saveArtifacts(items);
      navigation.replace('Praise', {
        title: 'Супер!',
        subtitle: 'Твои интересы записаны',
        nextScreen: 'GoalSelection',
      });
    } catch {
      setSaveError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    navigation.replace('GoalSelection');
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>Твои увлечения и цели</Text>
        <Text style={styles.subtitle}>
          Расскажи, чем занимаешься и о чём мечтаешь. Это поможет нам лучше понять тебя
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Хобби и занятия</Text>
          <View style={styles.chipRow}>
            {HOBBIES.map((h) => (
              <SubjectCard
                key={h}
                label={h}
                selected={hobbies.includes(h)}
                onPress={() => setHobbies((prev) => toggle(prev, h))}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Кружки и секции</Text>
          <View style={styles.chipRow}>
            {CLUBS.map((c) => (
              <SubjectCard
                key={c}
                label={c}
                selected={clubs.includes(c)}
                onPress={() => setClubs((prev) => toggle(prev, c))}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Достижения</Text>
          <Text style={styles.sectionHint}>Грамоты, победы, проекты, сертификаты</Text>
          <TagInput
            placeholder="Например, призёр олимпиады по математике"
            tags={achievements}
            inputValue={achievementInput}
            onChangeText={setAchievementInput}
            onAdd={() => addTag(achievementInput, setAchievements, setAchievementInput)}
            onRemove={(tag) => setAchievements((prev) => prev.filter((t) => t !== tag))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Мечты и цели</Text>
          <Text style={styles.sectionHint}>Чего хочешь достичь или попробовать</Text>
          <TagInput
            placeholder="Например, создать своё приложение"
            tags={dreams}
            inputValue={dreamInput}
            onChangeText={setDreamInput}
            onAdd={() => addTag(dreamInput, setDreams, setDreamInput)}
            onRemove={(tag) => setDreams((prev) => prev.filter((t) => t !== tag))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Профессии, которые уже интересны</Text>
          <TagInput
            placeholder="Например, программист, архитектор"
            tags={professions}
            inputValue={professionInput}
            onChangeText={setProfessionInput}
            onAdd={() => addTag(professionInput, setProfessions, setProfessionInput)}
            onRemove={(tag) => setProfessions((prev) => prev.filter((t) => t !== tag))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Страны или университеты, которые интересны</Text>
          <TagInput
            placeholder="Например, MIT, Казахстан, Великобритания"
            tags={targets}
            inputValue={targetInput}
            onChangeText={setTargetInput}
            onAdd={() => addTag(targetInput, setTargets, setTargetInput)}
            onRemove={(tag) => setTargets((prev) => prev.filter((t) => t !== tag))}
          />
        </View>

        {saveError && (
          <Text style={styles.errorText}>Не удалось сохранить. Попробуй ещё раз</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Пропустить</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.nextButtonText}>Далее</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function TagInput({
  placeholder,
  tags,
  inputValue,
  onChangeText,
  onAdd,
  onRemove,
}: {
  placeholder: string;
  tags: string[];
  inputValue: string;
  onChangeText: (v: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
}) {
  return (
    <View>
      <View style={styles.tagInputRow}>
        <TextInput
          style={styles.tagInput}
          value={inputValue}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={onAdd}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        <TouchableOpacity style={styles.addButton} onPress={onAdd} activeOpacity={0.7}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      {tags.length > 0 && (
        <View style={styles.tagRow}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity
                onPress={() => onRemove(tag)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Text style={styles.tagRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: 56,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h1,
    marginBottom: 6,
  },
  subtitle: {
    ...typography.body,
  },
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.sm,
    paddingBottom: spacing['2xl'],
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginTop: spacing.xs,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.label,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  addButton: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
  },
  addButtonText: {
    fontSize: 24,
    color: colors.onPrimary,
    lineHeight: 28,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryGhost,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: 6,
  },
  tagText: {
    ...typography.caption,
    color: colors.primaryDeep,
  },
  tagRemove: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 18,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    paddingBottom: spacing['3xl'],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  nextButtonText: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
  },
});
