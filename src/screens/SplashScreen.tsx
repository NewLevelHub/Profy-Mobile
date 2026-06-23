import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { colors, typography, spacing } from '../constants/themes/themes';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (elapsed && hasHydrated) {
      navigation.replace(token ? 'App' : 'Auth');
    }
  }, [elapsed, hasHydrated, token, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profi</Text>
      <Text style={styles.subtitle}>Твой путь к будущему</Text>
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
    ...typography.display,
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.sm,
  },
});
