import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '../../constants/themes/themes';

interface Props {
  message: string | null;
  onHide: () => void;
}

export default function Toast({ message, onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    opacity.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]);
    anim.start(() => onHide());
    return () => anim.stop();
  }, [message]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!message) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: spacing['3xl'],
    right: spacing['3xl'],
    backgroundColor: colors.text,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  text: {
    ...typography.caption,
    color: colors.surface,
  },
});
