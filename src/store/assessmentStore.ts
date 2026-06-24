import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AssessmentGoal } from '../types';

interface AssessmentState {
  assessmentId: string | null;
  goal: AssessmentGoal | null;
  currentBlock: number;
  completedBlocks: Set<string>;
  setAssessment: (assessmentId: string, goal: AssessmentGoal, currentBlock: number) => void;
  advanceBlock: () => void;
  markBlockCompleted: (block: string) => void;
  resetAssessment: () => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      assessmentId: null,
      goal: null,
      currentBlock: 0,
      completedBlocks: new Set<string>(),
      setAssessment: (assessmentId, goal, currentBlock) =>
        set({ assessmentId, goal, currentBlock }),
      advanceBlock: () => set((s) => ({ currentBlock: s.currentBlock + 1 })),
      markBlockCompleted: (block) =>
        set((s) => ({ completedBlocks: new Set(s.completedBlocks).add(block) })),
      resetAssessment: () =>
        set({ assessmentId: null, goal: null, currentBlock: 0, completedBlocks: new Set() }),
    }),
    {
      name: 'assessment-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist only primitives — skip Set<string> which isn't JSON-serialisable
      partialize: (state) => ({
        assessmentId: state.assessmentId,
        goal: state.goal,
        currentBlock: state.currentBlock,
      }),
    },
  ),
);
