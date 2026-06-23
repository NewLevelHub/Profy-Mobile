import apiClient from './client';
import type { AssessmentBlock, Question, SaveAnswersPayload } from '../types';

export async function getQuestions(
  assessmentId: string,
  block: AssessmentBlock,
): Promise<Question[]> {
  const { data } = await apiClient.get<Question[]>(
    `/api/v1/assessment/${assessmentId}/questions/${block}`,
  );
  return data;
}

export async function saveAnswers(
  assessmentId: string,
  payload: SaveAnswersPayload,
): Promise<void> {
  await apiClient.post(`/api/v1/assessment/${assessmentId}/answers`, payload);
}
