import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppTabParamList, AppStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { useResultStore } from '../store/resultStore';
import {
  colors,
  fontFamily,
  fontSize,
  radii,
  shadows,
  spacing,
  typography,
} from '../constants/themes/themes';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Profile'>,
  NativeStackScreenProps<AppStackParamList>
>;

const AGE_GROUP_LABELS: Record<string, string> = {
  junior: 'Младший (6–10 лет)',
  middle: 'Средний (11–14 лет)',
  senior: 'Старший (15–18 лет)',
};

function InfoRow({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (!value && value !== 0) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ChipList({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={styles.chipSection}>
      <Text style={styles.chipSectionLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {items.map((item) => (
          <View key={item} style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const profile = useProfileStore((s) => s.profile);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const resetAssessment = useAssessmentStore((s) => s.resetAssessment);
  const clearReport = useResultStore((s) => s.clearReport);

  const displayName = profile?.name?.trim() || user?.name?.trim() || 'Пользователь';
  const initial = displayName[0]?.toUpperCase() ?? '?';

  function handleLogout() {
    clearProfile();
    resetAssessment();
    clearReport();
    logout();
  }

  function handleRestartAssessment() {
    Alert.alert(
      'Начать заново?',
      'Весь текущий прогресс будет сброшен. Ты начнёшь диагностику с самого начала.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Начать заново',
          style: 'destructive',
          onPress: () => {
            resetAssessment();
            clearReport();
            navigation.navigate('GoalSelection');
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Профиль</Text>

        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          {user?.email ? (
            <Text style={styles.email}>{user.email}</Text>
          ) : null}
          {profile?.age_group ? (
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>
                {AGE_GROUP_LABELS[profile.age_group] ?? profile.age_group}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Personal info */}
        {profile ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Личные данные</Text>
              <InfoRow label="Имя" value={profile.name} />
              <InfoRow label="Возраст" value={profile.age ? `${profile.age} лет` : null} />
              <InfoRow label="Класс" value={profile.grade ? `${profile.grade} класс` : null} />
              <InfoRow label="Город" value={profile.city} />
              <InfoRow label="Страна" value={profile.country} />
              <InfoRow label="Язык обучения" value={profile.language} />
            </View>

            {/* Subjects */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Предметы</Text>
              <ChipList label="❤️  Нравятся" items={profile.subjects_like} />
              <ChipList label="😕  Не нравятся" items={profile.subjects_dislike} />
              <ChipList label="✅  Даются легко" items={profile.subjects_easy} />
              <ChipList label="🤯  Даются сложно" items={profile.subjects_hard} />
            </View>
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>Профиль не заполнен</Text>
            <Text style={styles.emptyDesc}>
              Данные появятся после прохождения настройки профиля
            </Text>
          </View>
        )}

        {/* Restart assessment */}
        <TouchableOpacity
          style={styles.restartBtn}
          onPress={handleRestartAssessment}
          activeOpacity={0.7}
        >
          <Text style={styles.restartText}>{'🔄  Начать тестирование заново'}</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
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
    paddingTop: spacing.xl,
    flexGrow: 1,
  },
  pageTitle: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.h1,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing['2xl'],
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.button,
  },
  avatarText: {
    fontFamily: fontFamily.black,
    fontSize: 34,
    color: colors.onPrimary,
  },
  displayName: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.title,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  email: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  ageBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  ageBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.primaryDeep,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.label,
    color: colors.text,
    marginBottom: spacing.lg,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  infoValue: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    color: colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },

  // Subject chips
  chipSection: {
    marginBottom: spacing.lg,
  },
  chipSectionLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.caption,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.primaryGhost,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.caption,
    color: colors.primaryDeep,
  },

  // Empty state
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing['3xl'],
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Restart
  restartBtn: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  restartText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    color: colors.primaryDeep,
  },

  // Logout
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: 'auto',
  },
  logoutText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
