import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ArtifactsSetupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Артефакты</Text>
      <Text style={styles.placeholder}>Экран артефактов — в разработке</Text>
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
