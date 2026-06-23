import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { colors, typography, spacing, radii } from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const clearProfile = useProfileStore((s) => s.clearProfile);

  function handleLogout() {
    clearProfile();
    logout();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Главная</Text>
      <Text style={styles.placeholder}>Главный экран — в разработке</Text>
      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={() => navigation.navigate('GoalSelection')}
      >
        <Text style={styles.btnPrimaryText}>Начать тест</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnOutline} onPress={handleLogout}>
        <Text style={styles.btnOutlineText}>Выйти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.md,
  },
  placeholder: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing['3xl'],
  },
  btnPrimary: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  btnPrimaryText: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
  },
  btnOutline: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  btnOutlineText: {
    ...typography.bodyStrong,
    color: colors.danger,
  },
});
