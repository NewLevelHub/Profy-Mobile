import { create } from 'zustand';
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

export const useAssessmentStore = create<AssessmentState>()((set) => ({
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
}));
