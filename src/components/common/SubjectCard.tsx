import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

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
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    margin: 4,
  },
  selected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  label: {
    fontSize: 13,
    color: '#374151',
  },
  labelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
