import apiClient from './client';
import type { AssessmentGoal, AssessmentResponse, ReportResponse } from '../types';

export async function startAssessment(goal: AssessmentGoal): Promise<AssessmentResponse> {
  const { data } = await apiClient.post<AssessmentResponse>('/api/v1/assessment/start', { goal });
  return data;
}

export async function getCurrentAssessment(): Promise<AssessmentResponse> {
  const { data } = await apiClient.get<AssessmentResponse>('/api/v1/assessment/current');
  return data;
}

export async function generateReport(assessmentId: string): Promise<ReportResponse> {
  const { data } = await apiClient.post<ReportResponse>(
    `/api/v1/assessment/${assessmentId}/report`,
  );
  return data;
}
