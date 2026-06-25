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
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList, ArtifactItem } from '../../types';
import { saveArtifacts } from '../../api/artifacts';
import SubjectCard from '../../components/common/SubjectCard';
import { TextWithLeadingEmoji } from '../../components/common/EmojiText';
import { colors, typography, spacing, radii, shadows, fontFamily, fontSize } from '../../constants/themes/themes';

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>Твои увлечения и цели</Text>
          <Text style={styles.subtitle}>
            Расскажи, чем занимаешься и о чём мечтаешь
          </Text>
        </View>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Section title="Хобби и занятия" emoji="🎨">
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
          </Section>

          <Section title="Кружки и секции" emoji="🏫">
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
          </Section>

          <Section title="Достижения" emoji="🏆" hint="Грамоты, победы, проекты, сертификаты">
            <TagInput
              placeholder="Например, призёр олимпиады по математике"
              tags={achievements}
              inputValue={achievementInput}
              onChangeText={setAchievementInput}
              onAdd={() => addTag(achievementInput, setAchievements, setAchievementInput)}
              onRemove={(tag) => setAchievements((prev) => prev.filter((t) => t !== tag))}
            />
          </Section>

          <Section title="Мечты и цели" emoji="✨" hint="Чего хочешь достичь или попробовать">
            <TagInput
              placeholder="Например, создать своё приложение"
              tags={dreams}
              inputValue={dreamInput}
              onChangeText={setDreamInput}
              onAdd={() => addTag(dreamInput, setDreams, setDreamInput)}
              onRemove={(tag) => setDreams((prev) => prev.filter((t) => t !== tag))}
            />
          </Section>

          <Section title="Интересные профессии" emoji="💼">
            <TagInput
              placeholder="Например, программист, архитектор"
              tags={professions}
              inputValue={professionInput}
              onChangeText={setProfessionInput}
              onAdd={() => addTag(professionInput, setProfessions, setProfessionInput)}
              onRemove={(tag) => setProfessions((prev) => prev.filter((t) => t !== tag))}
            />
          </Section>

          <Section title="Страны и университеты" emoji="🌍">
            <TagInput
              placeholder="Например, MIT, Великобритания"
              tags={targets}
              inputValue={targetInput}
              onChangeText={setTargetInput}
              onAdd={() => addTag(targetInput, setTargets, setTargetInput)}
              onRemove={(tag) => setTargets((prev) => prev.filter((t) => t !== tag))}
            />
          </Section>

          {saveError && (
            <Text style={styles.errorText}>Не удалось сохранить. Попробуй ещё раз</Text>
          )}
        </ScrollView>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.75}>
            <Text style={styles.skipBtnText}>Пропустить</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.onPrimary} />
              : <Text style={styles.nextBtnText}>Далее</Text>
            }
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Section({
  title, emoji, hint, children,
}: {
  title: string; emoji: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <TextWithLeadingEmoji emojiChar={emoji} textStyle={styles.sectionTitleText} style={styles.sectionTitle}>
        {title}
      </TextWithLeadingEmoji>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

function TagInput({
  placeholder, tags, inputValue, onChangeText, onAdd, onRemove,
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
        <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+</Text>
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

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },

  // ── Header
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: fontFamily.black,
    fontSize: 27,
    lineHeight: 30,
    letterSpacing: -0.5,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // ── Content
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },

  // ── Section
  section: {
    marginBottom: spacing['3xl'],
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  sectionTitleText: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.label,
    color: colors.text,
  },
  sectionHint: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  // ── TagInput
  tagInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  addBtn: {
    width: 50,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  addBtnText: {
    fontFamily: fontFamily.black,
    fontSize: 26,
    color: colors.onPrimary,
    lineHeight: 30,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: 6,
  },
  tagText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.primaryDeep,
  },
  tagRemove: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 18,
  },

  // ── Error
  errorText: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // ── Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  skipBtn: {
    flex: 1,
    height: 54,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  skipBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  nextBtn: {
    flex: 2,
    height: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  nextBtnDisabled: {
    backgroundColor: colors.primaryDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.body,
    color: colors.onPrimary,
  },
});
