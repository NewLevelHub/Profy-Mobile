import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AssessmentGoal } from '../../types';
import {
  colors,
  fontFamily,
  fontSize,
  spacing,
  typography,
} from '../../constants/themes/themes';
import { ALL_BLOCKS, BLOCK_NAMES } from '../../constants/blocks';

interface BlockRoadmapProps {
  /** 0-indexed block position. -1 = preview (all locked). >= totalBlocks = all done. */
  currentBlock: number;
  goal: AssessmentGoal | null;
  compact?: boolean;
  /** When true, locked circles render with soft-purple instead of gray (used on goal selection screen). */
  previewMode?: boolean;
}

type NodeState = 'completed' | 'current' | 'locked';

const NODE_FULL = 44;
const NODE_COMPACT = 28;
const LINE_FULL = 18;
const LINE_COMPACT = 12;
const LABEL_W = 60;

function BlockRoadmap({ currentBlock, goal, compact = false, previewMode = false }: BlockRoadmapProps) {
  const activeBlocks = goal === 'university' ? ALL_BLOCKS : ALL_BLOCKS.slice(0, 7);
  const nodeSize = compact ? NODE_COMPACT : NODE_FULL;
  const lineW = compact ? LINE_COMPACT : LINE_FULL;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentBlock >= 0 && currentBlock < activeBlocks.length) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.45,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
    return undefined;
  }, [currentBlock, activeBlocks.length, pulseAnim]);

  function getState(index: number): NodeState {
    if (currentBlock < 0) return 'locked';
    if (index < currentBlock) return 'completed';
    if (index === currentBlock) return 'current';
    return 'locked';
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.row,
        compact ? styles.rowCompact : styles.rowFull,
      ]}
    >
      {activeBlocks.map((block, i) => {
        const state = getState(i);
        const isLast = i === activeBlocks.length - 1;

        const circle = (
          <View
            style={[
              styles.circle,
              { width: nodeSize, height: nodeSize, borderRadius: nodeSize / 2 },
              state === 'completed' && styles.circleCompleted,
              state === 'current' && styles.circleCurrent,
              state === 'locked' && (previewMode ? styles.circlePreview : styles.circleLocked),
            ]}
          >
            <Text
              style={[
                styles.circleText,
                compact && styles.circleTextCompact,
                state === 'locked' && (previewMode ? styles.circleTextPreview : styles.circleTextLocked),
              ]}
            >
              {state === 'completed' ? '✓' : String(i + 1)}
            </Text>
          </View>
        );

        return (
          <React.Fragment key={block}>
            <View style={compact ? styles.nodeWrapCompact : styles.nodeWrapFull}>
              {state === 'current' ? (
                <Animated.View style={{ opacity: pulseAnim }}>{circle}</Animated.View>
              ) : (
                circle
              )}
              {!compact && (
                <Text style={styles.label} numberOfLines={2}>
                  {BLOCK_NAMES[block]}
                </Text>
              )}
            </View>
            {!isLast && (
              <View
                style={[
                  styles.line,
                  { width: lineW, marginTop: nodeSize / 2 - 1 },
                  i < currentBlock ? styles.lineCompleted : styles.lineLocked,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </ScrollView>
  );
}

export default React.memo(BlockRoadmap);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowFull: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  rowCompact: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  nodeWrapFull: {
    width: LABEL_W,
    alignItems: 'center',
  },
  nodeWrapCompact: {
    width: NODE_COMPACT,
    alignItems: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: colors.nodeCompleted,
  },
  circleCurrent: {
    backgroundColor: colors.nodeCurrent,
  },
  circleLocked: {
    backgroundColor: colors.nodeLocked,
  },
  circlePreview: {
    backgroundColor: colors.primarySoft,
  },
  circleText: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.caption,
    color: colors.onPrimary,
  },
  circleTextCompact: {
    fontSize: fontSize.tiny,
  },
  circleTextLocked: {
    color: colors.textMuted,
  },
  circleTextPreview: {
    color: colors.primaryDeep,
  },
  label: {
    ...typography.small,
    textAlign: 'center',
    marginTop: spacing.xs,
    width: LABEL_W,
  },
  line: {
    height: 2,
    alignSelf: 'flex-start',
  },
  lineCompleted: {
    backgroundColor: colors.nodeCompleted,
  },
  lineLocked: {
    backgroundColor: colors.track,
  },
});
