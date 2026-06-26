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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../types';
import { createProfile } from '../../api/profile';
import { useProfileStore } from '../../store/profileStore';
import SubjectCard from '../../components/common/SubjectCard';
import { TextWithLeadingEmoji } from '../../components/common/EmojiText';
import { colors, typography, spacing, radii, shadows, fontFamily, fontSize } from '../../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'ProfileSetup'>;

const LANGUAGES = ['Русский', 'Казахский', 'Английский'];

const SUBJECTS = [
  'Математика', 'Физика', 'Химия', 'Биология',
  'История', 'География', 'Русский язык', 'Литература',
  'Английский язык', 'Информатика', 'Физкультура', 'Рисование', 'Музыка',
];

type Errors = Partial<Record<'name' | 'age' | 'grade', string>>;

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((s) => s !== item) : [...list, item];
}

export default function ProfileSetupScreen({ navigation }: Props) {
  const { bottom } = useSafeAreaInsets();
  const setProfile = useProfileStore((s) => s.setProfile);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [subjectsLike, setSubjectsLike] = useState<string[]>([]);
  const [subjectsDislike, setSubjectsDislike] = useState<string[]>([]);
  const [subjectsEasy, setSubjectsEasy] = useState<string[]>([]);
  const [subjectsHard, setSubjectsHard] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  function validateStep1(): boolean {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Введи своё имя';
    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 6 || ageNum > 18) next.age = 'Возраст должен быть от 6 до 18';
    const gradeNum = Number(grade);
    if (!grade || isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) next.grade = 'Класс должен быть от 1 до 12';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return;
    setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const profile = await createProfile({
        name: name.trim(),
        age: Number(age),
        grade: Number(grade),
        city: city.trim(),
        country: country.trim(),
        language: language.trim(),
        subjects_like: subjectsLike,
        subjects_dislike: subjectsDislike,
        subjects_easy: subjectsEasy,
        subjects_hard: subjectsHard,
      });
      setProfile(profile);
      navigation.replace('Praise', {
        title: 'Отлично!',
        subtitle: 'Уже знаем тебя лучше',
        nextScreen: 'ArtifactsSetup',
      });
    } catch {
      // network error — stay on screen
    } finally {
      setLoading(false);
    }
  }

  const TOTAL_STEPS = 3;
  const progress = step / TOTAL_STEPS;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── Progress header ───────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.stepIndicator}>Шаг {step} из {TOTAL_STEPS}</Text>
        </View>

        {/* ── Scrollable content ────────────────────────────────────────── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <View>
              <Text style={styles.title}>Расскажи о себе</Text>
              <Text style={styles.subtitle}>Нам нужно немного узнать тебя</Text>

              <Field label="Имя" error={errors.name}>
                <TextInput
                  style={[styles.input, errors.name ? styles.inputError : null]}
                  value={name}
                  onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
                  placeholder="Например, Арман"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                  returnKeyType="next"
                />
              </Field>

              <Field label="Возраст" error={errors.age}>
                <TextInput
                  style={[styles.input, errors.age ? styles.inputError : null]}
                  value={age}
                  onChangeText={(v) => { setAge(v); setErrors((e) => ({ ...e, age: undefined })); }}
                  placeholder="от 6 до 18"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </Field>

              <Field label="Класс" error={errors.grade}>
                <TextInput
                  style={[styles.input, errors.grade ? styles.inputError : null]}
                  value={grade}
                  onChangeText={(v) => { setGrade(v); setErrors((e) => ({ ...e, grade: undefined })); }}
                  placeholder="от 1 до 12"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </Field>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.title}>Где ты живёшь?</Text>
              <Text style={styles.subtitle}>Поможет подобрать университеты и олимпиады</Text>

              <Field label="Город">
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Например, Алматы"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                  returnKeyType="next"
                />
              </Field>

              <Field label="Страна">
                <TextInput
                  style={styles.input}
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Например, Казахстан"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="next"
                />
              </Field>

              <Field label="Язык обучения">
                <View style={styles.chipRow}>
                  {LANGUAGES.map((lang) => (
                    <SubjectCard
                      key={lang}
                      label={lang}
                      selected={language === lang}
                      onPress={() => setLanguage((prev) => (prev === lang ? '' : lang))}
                    />
                  ))}
                </View>
              </Field>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.title}>Школьные предметы</Text>
              <Text style={styles.subtitle}>Можно выбрать несколько в каждой группе</Text>

              <SubjectSection title="Нравятся" emoji="❤️" selected={subjectsLike}
                onToggle={(s) => setSubjectsLike((prev) => toggle(prev, s))} />
              <SubjectSection title="Не нравятся" emoji="😕" selected={subjectsDislike}
                onToggle={(s) => setSubjectsDislike((prev) => toggle(prev, s))} />
              <SubjectSection title="Даются легко" emoji="✅" selected={subjectsEasy}
                onToggle={(s) => setSubjectsEasy((prev) => toggle(prev, s))} />
              <SubjectSection title="Даются сложно" emoji="🤯" selected={subjectsHard}
                onToggle={(s) => setSubjectsHard((prev) => toggle(prev, s))} />
            </View>
          )}
        </ScrollView>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <View style={[styles.footer, { paddingBottom: Math.max(spacing['2xl'], bottom + spacing.md) }]}>
          {step > 1 && (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.75}>
              <Text style={styles.backBtnText}>Назад</Text>
            </TouchableOpacity>
          )}

          {step < TOTAL_STEPS ? (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>Далее</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={colors.onPrimary} />
                : <Text style={styles.nextBtnText}>Готово ✓</Text>
              }
            </TouchableOpacity>
          )}
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function SubjectSection({
  title, emoji, selected, onToggle,
}: {
  title: string; emoji: string; selected: string[]; onToggle: (s: string) => void;
}) {
  return (
    <View style={styles.section}>
      <TextWithLeadingEmoji emojiChar={emoji} textStyle={styles.sectionTitleText} style={styles.sectionTitle}>
        {title}
      </TextWithLeadingEmoji>
      <View style={styles.chipRow}>
        {SUBJECTS.map((s) => (
          <SubjectCard key={s} label={s} selected={selected.includes(s)} onPress={() => onToggle(s)} />
        ))}
      </View>
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

  // ── Header / progress
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
  },
  progressTrack: {
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  stepIndicator: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },

  // ── Content
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
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
    marginBottom: spacing['3xl'],
  },

  // ── Field
  fieldWrap: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 15,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  errorText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
  },

  // ── Subjects step
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  sectionTitleText: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.label,
    color: colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // ── Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backBtn: {
    flex: 1,
    height: 54,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  backBtnText: {
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
