import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import type { AgeGroup } from '../../types';
import { EmojiText } from './EmojiText';
import { colors, spacing, radii, fontFamily, fontSize } from '../../constants/themes/themes';

const JUNIOR_EMOJI = ['⭐', '🎨', '🏃', '📖', '🌿', '🎵', '🔢', '🌍', '💡', '🎭'];
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

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
        Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
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
        {isJunior ? (
          <View style={[styles.indicator, styles.indicatorJunior, selected && styles.indicatorSelected]}>
            <EmojiText size="sm" style={styles.indicatorEmoji}>{JUNIOR_EMOJI[index % JUNIOR_EMOJI.length]}</EmojiText>
          </View>
        ) : (
          <View style={[styles.indicator, styles.indicatorSenior, selected && styles.indicatorSelected]}>
            <Text style={[styles.indicatorLetter, selected && styles.indicatorLetterSelected]}>
              {OPTION_LETTERS[index % OPTION_LETTERS.length]}
            </Text>
          </View>
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
        {selected && <View style={styles.checkDot} />}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardJunior: {
    padding: spacing.lg,
    borderRadius: radii.md,
    gap: spacing.md,
  },
  cardSenior: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    gap: spacing.md,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  indicatorJunior: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg,
  },
  indicatorSenior: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  indicatorSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  indicatorEmoji: {},
  indicatorLetter: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  indicatorLetterSelected: {
    color: colors.onPrimary,
  },
  text: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
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
    color: colors.primaryDeep,
    fontFamily: fontFamily.bold,
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
});
