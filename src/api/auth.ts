import apiClient from './client';
import type { RegisterResponse, TokenResponse } from '../types';

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

export async function registerUser(email: string, password: string): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>('/api/v1/auth/register', { email, password });
  return data;
}

export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<ApiTokenResponse>('/api/v1/auth/login', { email, password });
  return toTokenResponse(data, email);
}

export async function verifyEmail(email: string, code: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<ApiTokenResponse>('/api/v1/auth/verify-email', { email, code });
  return toTokenResponse(data, email);
}

export async function resendVerificationCode(email: string): Promise<void> {
  await apiClient.post('/api/v1/auth/resend-verification', { email });
}
