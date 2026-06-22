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
import type { AppStackParamList } from '../../types';
import { createProfile } from '../../api/profile';
import { useProfileStore } from '../../store/profileStore';
import SubjectCard from '../../components/common/SubjectCard';

type Props = NativeStackScreenProps<AppStackParamList, 'ProfileSetup'>;

const SUBJECTS = [
  'Математика',
  'Физика',
  'Химия',
  'Биология',
  'История',
  'География',
  'Русский язык',
  'Литература',
  'Английский язык',
  'Информатика',
  'Физкультура',
  'Рисование',
  'Музыка',
];

type Errors = Partial<Record<'name' | 'age' | 'grade', string>>;

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((s) => s !== item) : [...list, item];
}

export default function ProfileSetupScreen({ navigation }: Props) {
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
      navigation.replace('ArtifactsSetup');
    } catch {
      // network error — stay on screen
    } finally {
      setLoading(false);
    }
  }

  const progress = step / 3;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.stepLabel}>Шаг {step} из 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <View>
            <Text style={styles.title}>Расскажи о себе</Text>
            <Text style={styles.subtitle}>Нам нужно немного узнать тебя</Text>

            <Text style={styles.label}>Имя</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              value={name}
              onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
              placeholder="Например, Арман"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            <Text style={styles.label}>Возраст</Text>
            <TextInput
              style={[styles.input, errors.age ? styles.inputError : null]}
              value={age}
              onChangeText={(v) => { setAge(v); setErrors((e) => ({ ...e, age: undefined })); }}
              placeholder="от 6 до 18"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={2}
            />
            {errors.age ? <Text style={styles.errorText}>{errors.age}</Text> : null}

            <Text style={styles.label}>Класс</Text>
            <TextInput
              style={[styles.input, errors.grade ? styles.inputError : null]}
              value={grade}
              onChangeText={(v) => { setGrade(v); setErrors((e) => ({ ...e, grade: undefined })); }}
              placeholder="от 1 до 12"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={2}
            />
            {errors.grade ? <Text style={styles.errorText}>{errors.grade}</Text> : null}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.title}>Где ты живёшь?</Text>
            <Text style={styles.subtitle}>Это поможет нам подобрать университеты и олимпиады</Text>

            <Text style={styles.label}>Город</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Например, Алматы"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />

            <Text style={styles.label}>Страна</Text>
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
              placeholder="Например, Казахстан"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Язык обучения</Text>
            <TextInput
              style={styles.input}
              value={language}
              onChangeText={setLanguage}
              placeholder="Русский / Казахский / Английский"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.title}>Школьные предметы</Text>
            <Text style={styles.subtitle}>Можно выбрать несколько в каждой группе</Text>

            <SubjectSection
              title="Нравятся"
              selected={subjectsLike}
              onToggle={(s) => setSubjectsLike((prev) => toggle(prev, s))}
            />
            <SubjectSection
              title="Не нравятся"
              selected={subjectsDislike}
              onToggle={(s) => setSubjectsDislike((prev) => toggle(prev, s))}
            />
            <SubjectSection
              title="Даются легко"
              selected={subjectsEasy}
              onToggle={(s) => setSubjectsEasy((prev) => toggle(prev, s))}
            />
            <SubjectSection
              title="Даются сложно"
              selected={subjectsHard}
              onToggle={(s) => setSubjectsHard((prev) => toggle(prev, s))}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.flex} />
        )}

        {step < 3 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Далее</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, loading && styles.nextButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>Готово</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function SubjectSection({
  title,
  selected,
  onToggle,
}: {
  title: string;
  selected: string[];
  onToggle: (subject: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipRow}>
        {SUBJECTS.map((s) => (
          <SubjectCard key={s} label={s} selected={selected.includes(s)} onPress={() => onToggle(s)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4F46E5',
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#EF4444',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
