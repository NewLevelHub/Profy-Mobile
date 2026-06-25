import React, { useEffect, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types';
import ConfettiBlast from '../components/common/ConfettiBlast';
import { EmojiText } from '../components/common/EmojiText';
import { colors, typography, spacing, radii, shadows } from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'Praise'>;

const AUTO_ADVANCE_MS = 2500;

export default function PraiseScreen({ navigation, route }: Props) {
  const { title, subtitle, nextScreen } = route.params;

  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => navigation.replace(nextScreen), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, []);

  function handleContinue() {
    navigation.replace(nextScreen);
  }

  return (
    <SafeAreaView style={styles.root}>
      <ConfettiBlast />
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.content,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <EmojiText size="hero" style={styles.emoji}>{'🎉'}</EmojiText>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </Animated.View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{'Дальше'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  emoji: {
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.display,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
  },
  button: {
    marginHorizontal: spacing['3xl'],
    marginBottom: spacing['3xl'],
    paddingVertical: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    ...shadows.button,
  },
  buttonText: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
  },
});
