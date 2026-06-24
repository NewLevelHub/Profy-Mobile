import apiClient from './client';
import type { RoadmapResponse } from '../types';

export async function generateRoadmap(assessmentId: string, programId?: string): Promise<RoadmapResponse> {
  const payload: Record<string, string> = { assessment_id: assessmentId };
  if (programId !== undefined) payload.program_id = programId;
  const { data } = await apiClient.post<RoadmapResponse>('/api/v1/roadmap/generate', payload);
  return data;
}

export async function getRoadmap(assessmentId: string): Promise<RoadmapResponse> {
  const { data } = await apiClient.get<RoadmapResponse>(`/api/v1/roadmap/${assessmentId}`);
  return data;
}
