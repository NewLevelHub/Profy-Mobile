import apiClient from './client';
import type { ArtifactItem } from '../types';

export async function saveArtifacts(items: ArtifactItem[]): Promise<void> {
  await apiClient.post('/api/v1/profile/artifacts', { items });
}

export async function getArtifacts(): Promise<ArtifactItem[]> {
  const { data } = await apiClient.get('/api/v1/profile/artifacts');
  return data;
}
