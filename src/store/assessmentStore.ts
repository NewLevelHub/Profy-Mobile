import { create } from 'zustand';
import type { AssessmentGoal } from '../types';

interface AssessmentState {
  assessmentId: string | null;
  goal: AssessmentGoal | null;
  currentBlock: number;
  setAssessment: (assessmentId: string, goal: AssessmentGoal, currentBlock: number) => void;
  resetAssessment: () => void;
}

export const useAssessmentStore = create<AssessmentState>()((set) => ({
  assessmentId: null,
  goal: null,
  currentBlock: 0,
  setAssessment: (assessmentId, goal, currentBlock) =>
    set({ assessmentId, goal, currentBlock }),
  resetAssessment: () => set({ assessmentId: null, goal: null, currentBlock: 0 }),
}));
