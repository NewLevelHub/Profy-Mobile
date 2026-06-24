import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { colors, typography, spacing, fontFamily, fontSize } from '../constants/themes/themes';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const elapsed = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 900, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    floatLoop.start();

    const timer = setTimeout(() => {
      elapsed.current = true;
      if (hasHydrated) navigation.replace(token ? 'App' : 'Auth');
    }, 1600);

    return () => {
      clearTimeout(timer);
      floatLoop.stop();
    };
  }, []);

  useEffect(() => {
    if (elapsed.current && hasHydrated) {
      navigation.replace(token ? 'App' : 'Auth');
    }
  }, [hasHydrated, token]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
          },
        ]}
      >
        <View style={styles.logoBubble}>
          <Text style={styles.logoEmoji}>🎯</Text>
        </View>
        <Text style={styles.brandName}>Profy</Text>
        <Text style={styles.tagline}>Твой путь к будущему</Text>
      </Animated.View>
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
  logoWrap: {
    alignItems: 'center',
  },
  logoBubble: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  logoEmoji: {
    fontSize: 44,
  },
  brandName: {
    fontFamily: fontFamily.black,
    fontSize: 36,
    color: colors.primary,
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.textMuted,
  },
});
