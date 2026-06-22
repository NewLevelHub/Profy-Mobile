import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';

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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 32,
  },
  btnPrimary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    marginBottom: 12,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  btnOutline: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  btnOutlineText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
