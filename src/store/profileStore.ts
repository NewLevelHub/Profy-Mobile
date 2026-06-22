import { create } from 'zustand';
import type { ProfileResponse } from '../types';

interface ProfileState {
  profile: ProfileResponse | null;
  setProfile: (profile: ProfileResponse) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}));
