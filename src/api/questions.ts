import apiClient from './client';
import type { AssessmentBlock, Question, SaveAnswersPayload, SaveAnswersResponse } from '../types';

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
): Promise<SaveAnswersResponse> {
  const { data } = await apiClient.post<SaveAnswersResponse>(
    `/api/v1/assessment/${assessmentId}/answers`,
    payload,
  );
  return data;
}
