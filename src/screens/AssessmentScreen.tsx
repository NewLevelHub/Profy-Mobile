import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types';

type Props = NativeStackScreenProps<AppStackParamList, 'Assessment'>;

export default function AssessmentScreen({ navigation: _navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тест</Text>
      <Text style={styles.placeholder}>Блоки тестирования — в разработке</Text>
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
  },
});
