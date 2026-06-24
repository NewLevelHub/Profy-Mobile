import apiClient from './client';
import type { AnalysisResultResponse } from '../types';

export async function generateReport(assessmentId: string): Promise<AnalysisResultResponse> {
  const { data } = await apiClient.post<AnalysisResultResponse>('/api/v1/result/generate', {
    assessment_id: assessmentId,
  });
  return data;
}

export async function getReport(assessmentId: string): Promise<AnalysisResultResponse> {
  const { data } = await apiClient.get<AnalysisResultResponse>(`/api/v1/result/${assessmentId}`);
  return data;
}
