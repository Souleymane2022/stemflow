import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@shared/schema";

interface AuthUser {
  id: string;
  username: string;
  email: string;
  preferredLanguage: string | null;
  educationLevel: string | null;
  interests: string[] | null;
  level: string | null;
  xp: number | null;
  streak: number | null;
  onboardingCompleted: boolean | null;
}

interface UserState {
  userId: string | null;
  user: AuthUser | null;
  profile: UserProfile | null;
  xp: number;
  streak: number;
  onboardingCompleted: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  setUserId: (userId: string) => void;
  setProfile: (profile: UserProfile) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  logout: () => void;
  reset: () => void;
}

export const useUserState = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      user: null,
      profile: null,
      xp: 0,
      streak: 0,
      onboardingCompleted: false,
      isAuthenticated: false,
      setUser: (user) => set({
        user,
        userId: user.id,
        isAuthenticated: true,
        xp: user.xp || 0,
        streak: user.streak || 0,
        onboardingCompleted: user.onboardingCompleted || false,
        profile: user.interests ? {
          preferredLanguage: (user.preferredLanguage as "fr" | "en") || "fr",
          educationLevel: (user.educationLevel as any) || "lycee",
          interests: user.interests as any,
          level: (user.level as any) || "curieux",
        } : null,
      }),
      setUserId: (userId) => set({ userId }),
      setProfile: (profile) => set({ profile }),
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      resetStreak: () => set({ streak: 0 }),
      logout: () => set({
        userId: null,
        user: null,
        profile: null,
        xp: 0,
        streak: 0,
        onboardingCompleted: false,
        isAuthenticated: false,
      }),
      reset: () => set({
        userId: null,
        user: null,
        profile: null,
        xp: 0,
        streak: 0,
        onboardingCompleted: false,
        isAuthenticated: false,
      }),
    }),
    {
      name: "stem-flow-user",
    }
  )
);
