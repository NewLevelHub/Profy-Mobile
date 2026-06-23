import apiClient from './client';
import type { TokenResponse } from '../types';

interface ApiTokenResponse {
  access_token: string;
  user_id: string;
}

function toTokenResponse(data: ApiTokenResponse, email: string): TokenResponse {
  return {
    access_token: data.access_token,
    user: { id: data.user_id, email, name: '' },
  };
}

export async function registerUser(email: string, password: string): Promise<void> {
  await apiClient.post('/api/v1/auth/register', { email, password });
}

export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<ApiTokenResponse>('/api/v1/auth/login', { email, password });
  return toTokenResponse(data, email);
}
