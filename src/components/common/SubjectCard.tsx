import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../../constants/themes/themes';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default React.memo(function SubjectCard({ label, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    margin: spacing.xs,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    ...typography.caption,
  },
  labelSelected: {
    color: colors.onPrimary,
  },
});
