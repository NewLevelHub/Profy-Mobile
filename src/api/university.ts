import apiClient from './client';
import type { GapAnalysisResponse, ProgramBrief, ProgramDetail } from '../types';

export async function getPrograms(
  directionSlug: string,
  country?: string,
): Promise<ProgramBrief[]> {
  const params: Record<string, string | number> = { direction: directionSlug, limit: 50 };
  if (country !== undefined) params.country = country;
  const { data } = await apiClient.get<ProgramBrief[]>('/api/v1/universities/programs', { params });
  return data;
}

export async function getProgramDetail(id: string): Promise<ProgramDetail> {
  const { data } = await apiClient.get<ProgramDetail>(`/api/v1/universities/programs/${id}`);
  return data;
}

export async function getGapAnalysis(
  programId: string,
  assessmentId: string,
): Promise<GapAnalysisResponse> {
  const { data } = await apiClient.get<GapAnalysisResponse>(
    `/api/v1/universities/programs/${programId}/gap-analysis`,
    { params: { assessment_id: assessmentId } },
  );
  return data;
}
