import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import type { AgeGroup } from '../../types';
import { colors, spacing, radii, fontFamily, fontSize } from '../../constants/themes/themes';

const JUNIOR_EMOJI = ['⭐', '🎨', '🏃', '📖', '🌿', '🎵', '🔢', '🌍', '💡', '🎭'];

interface Props {
  text: string;
  index: number;
  selected: boolean;
  ageGroup: AgeGroup;
  onPress: () => void;
}

export default function OptionCard({ text, index, selected, ageGroup, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (selected) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [selected]);

  const isJunior = ageGroup === 'junior';

  return (
    <TouchableWithoutFeedback onPress={onPress} disabled={selected}>
      <Animated.View
        style={[
          styles.card,
          isJunior ? styles.cardJunior : styles.cardSenior,
          selected && styles.cardSelected,
          { transform: [{ scale }] },
        ]}
      >
        {isJunior && (
          <Text style={styles.emoji}>{JUNIOR_EMOJI[index % JUNIOR_EMOJI.length]}</Text>
        )}
        <Text
          style={[
            styles.text,
            isJunior ? styles.textJunior : styles.textSenior,
            selected && styles.textSelected,
          ]}
        >
          {text}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardJunior: {
    padding: 18,
    borderRadius: radii.md,
  },
  cardSenior: {
    padding: 14,
    borderRadius: radii.sm,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  emoji: {
    fontSize: 28,
    marginRight: 14,
  },
  text: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
  },
  textJunior: {
    fontSize: 17,
    lineHeight: 24,
  },
  textSenior: {
    fontSize: fontSize.label,
    lineHeight: 21,
  },
  textSelected: {
    color: colors.primary,
    fontFamily: fontFamily.semibold,
  },
});
