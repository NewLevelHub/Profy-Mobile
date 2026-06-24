import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types';
import { colors, typography, spacing } from '../constants/themes/themes';

type Props = NativeStackScreenProps<AppStackParamList, 'Result'>;

export default function ResultScreen(_props: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>{'Твои результаты'}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
});
