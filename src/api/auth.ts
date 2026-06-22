import apiClient from './client';
import type { TokenResponse } from '../types';

export async function registerUser(email: string, password: string): Promise<void> {
  await apiClient.post('/api/v1/auth/register', { email, password });
}

export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>('/api/v1/auth/login', { email, password });
  return data;
}
