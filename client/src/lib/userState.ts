import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@shared/schema";

interface UserState {
  userId: string | null;
  profile: UserProfile | null;
  xp: number;
  streak: number;
  onboardingCompleted: boolean;
  setUserId: (userId: string) => void;
  setProfile: (profile: UserProfile) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  reset: () => void;
}

export const useUserState = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      profile: null,
      xp: 0,
      streak: 0,
      onboardingCompleted: false,
      setUserId: (userId) => set({ userId }),
      setProfile: (profile) => set({ profile }),
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      resetStreak: () => set({ streak: 0 }),
      reset: () => set({ userId: null, profile: null, xp: 0, streak: 0, onboardingCompleted: false }),
    }),
    {
      name: "stem-flow-user",
    }
  )
);
