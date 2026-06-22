import apiClient from './client';
import type { AssessmentGoal, AssessmentResponse } from '../types';

export async function startAssessment(goal: AssessmentGoal): Promise<AssessmentResponse> {
  const { data } = await apiClient.post<AssessmentResponse>('/api/v1/assessment/start', { goal });
  return data;
}

export async function getCurrentAssessment(): Promise<AssessmentResponse> {
  const { data } = await apiClient.get<AssessmentResponse>('/api/v1/assessment/current');
  return data;
}
