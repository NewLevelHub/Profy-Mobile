import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../../constants/themes/themes';

const PARTICLE_COLORS = [colors.accent, colors.primary, colors.ok];
const COUNT = 18;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function ConfettiBlast() {
  const particles = useRef(
    Array.from({ length: COUNT }, (_, i) => ({
      tx: new Animated.Value(0),
      ty: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0),
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      toX: rand(-160, 160),
      toY: rand(-260, 40),
      isCircle: i % 2 === 0,
    }))
  ).current;

  useEffect(() => {
    const anims = particles.map((p, i) =>
      Animated.sequence([
        Animated.delay(i * 28),
        Animated.parallel([
          Animated.spring(p.scale, {
            toValue: 1,
            tension: 60,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(p.tx, { toValue: p.toX, duration: 600, useNativeDriver: true }),
          Animated.timing(p.ty, { toValue: p.toY, duration: 600, useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(380),
            Animated.timing(p.opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
          ]),
        ]),
      ])
    );
    Animated.parallel(anims).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            p.isCircle ? styles.circle : styles.square,
            {
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: [{ translateX: p.tx }, { translateY: p.ty }, { scale: p.scale }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 10,
    height: 10,
    marginTop: -5,
    marginLeft: -5,
  },
  circle: {
    borderRadius: 5,
  },
  square: {
    borderRadius: 2,
  },
});
