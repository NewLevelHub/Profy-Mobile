import { create } from 'zustand';
import type { AssessmentGoal } from '../types';

interface AssessmentState {
  assessmentId: string | null;
  goal: AssessmentGoal | null;
  currentBlock: number;
  setAssessment: (assessmentId: string, goal: AssessmentGoal, currentBlock: number) => void;
  advanceBlock: () => void;
  resetAssessment: () => void;
}

export const useAssessmentStore = create<AssessmentState>()((set) => ({
  assessmentId: null,
  goal: null,
  currentBlock: 0,
  setAssessment: (assessmentId, goal, currentBlock) =>
    set({ assessmentId, goal, currentBlock }),
  advanceBlock: () => set((s) => ({ currentBlock: s.currentBlock + 1 })),
  resetAssessment: () => set({ assessmentId: null, goal: null, currentBlock: 0 }),
}));
