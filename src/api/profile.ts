import apiClient from './client';
import type { ProfilePayload, ProfileResponse } from '../types';

export async function createProfile(data: ProfilePayload): Promise<ProfileResponse> {
  const { data: res } = await apiClient.post<ProfileResponse>('/api/v1/profile', data);
  return res;
}

export async function getProfile(): Promise<ProfileResponse> {
  const { data } = await apiClient.get<ProfileResponse>('/api/v1/profile');
  return data;
}

export async function updateProfile(data: Partial<ProfilePayload>): Promise<ProfileResponse> {
  const { data: res } = await apiClient.put<ProfileResponse>('/api/v1/profile', data);
  return res;
}
