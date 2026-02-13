import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface League {
  id: string;
  name: string;
  tier: number;
  color: string;
  gradient: string;
  icon: string;
  minXpWeekly: number;
}

export const LEAGUES: League[] = [
  { id: "bronze", name: "Bronze", tier: 1, color: "#CD7F32", gradient: "from-amber-700 to-amber-500", icon: "shield", minXpWeekly: 0 },
  { id: "silver", name: "Argent", tier: 2, color: "#C0C0C0", gradient: "from-gray-400 to-gray-300", icon: "shield", minXpWeekly: 50 },
  { id: "gold", name: "Or", tier: 3, color: "#FFD700", gradient: "from-yellow-500 to-yellow-400", icon: "shield", minXpWeekly: 100 },
  { id: "sapphire", name: "Saphir", tier: 4, color: "#0F52BA", gradient: "from-blue-600 to-blue-400", icon: "gem", minXpWeekly: 200 },
  { id: "ruby", name: "Rubis", tier: 5, color: "#E0115F", gradient: "from-rose-600 to-rose-400", icon: "gem", minXpWeekly: 350 },
  { id: "emerald", name: "Emeraude", tier: 6, color: "#50C878", gradient: "from-emerald-600 to-emerald-400", icon: "gem", minXpWeekly: 500 },
  { id: "amethyst", name: "Am\u00e9thyste", tier: 7, color: "#9966CC", gradient: "from-purple-600 to-purple-400", icon: "crown", minXpWeekly: 750 },
  { id: "pearl", name: "Perle", tier: 8, color: "#FDEEF4", gradient: "from-pink-300 to-white", icon: "crown", minXpWeekly: 1000 },
  { id: "obsidian", name: "Obsidienne", tier: 9, color: "#3D3635", gradient: "from-gray-800 to-gray-600", icon: "crown", minXpWeekly: 1500 },
  { id: "diamond", name: "Diamant", tier: 10, color: "#B9F2FF", gradient: "from-cyan-300 to-blue-200", icon: "diamond", minXpWeekly: 2000 },
];

export interface LeagueUser {
  userId: string;
  username: string;
  weeklyXp: number;
  league: string;
  rank: number;
}

interface LeagueState {
  currentLeague: string;
  weeklyXp: number;
  weekStartDate: string | null;
  promotionPending: boolean;
  demotionPending: boolean;
  addWeeklyXp: (amount: number) => void;
  checkWeekReset: () => void;
  getCurrentLeague: () => League;
  getNextLeague: () => League | null;
  getProgress: () => number;
  promote: () => void;
  demote: () => void;
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export const useLeagueState = create<LeagueState>()(
  persist(
    (set, get) => ({
      currentLeague: "bronze",
      weeklyXp: 0,
      weekStartDate: null,
      promotionPending: false,
      demotionPending: false,

      addWeeklyXp: (amount) => {
        const weekStart = getWeekStart();
        if (get().weekStartDate !== weekStart) {
          set({ weeklyXp: amount, weekStartDate: weekStart });
        } else {
          set((s) => ({ weeklyXp: s.weeklyXp + amount }));
        }
      },

      checkWeekReset: () => {
        const weekStart = getWeekStart();
        if (get().weekStartDate !== weekStart) {
          const { weeklyXp, currentLeague } = get();
          const currentIdx = LEAGUES.findIndex((l) => l.id === currentLeague);
          const current = LEAGUES[currentIdx];
          const next = LEAGUES[currentIdx + 1];

          if (next && weeklyXp >= next.minXpWeekly) {
            set({ promotionPending: true });
          } else if (currentIdx > 0 && weeklyXp < current.minXpWeekly * 0.5) {
            set({ demotionPending: true });
          }

          set({ weeklyXp: 0, weekStartDate: weekStart });
        }
      },

      getCurrentLeague: () => {
        return LEAGUES.find((l) => l.id === get().currentLeague) || LEAGUES[0];
      },

      getNextLeague: () => {
        const currentIdx = LEAGUES.findIndex((l) => l.id === get().currentLeague);
        return LEAGUES[currentIdx + 1] || null;
      },

      getProgress: () => {
        const { weeklyXp } = get();
        const next = get().getNextLeague();
        if (!next) return 100;
        return Math.min((weeklyXp / next.minXpWeekly) * 100, 100);
      },

      promote: () => {
        const currentIdx = LEAGUES.findIndex((l) => l.id === get().currentLeague);
        if (currentIdx < LEAGUES.length - 1) {
          set({ currentLeague: LEAGUES[currentIdx + 1].id, promotionPending: false });
        }
      },

      demote: () => {
        const currentIdx = LEAGUES.findIndex((l) => l.id === get().currentLeague);
        if (currentIdx > 0) {
          set({ currentLeague: LEAGUES[currentIdx - 1].id, demotionPending: false });
        }
      },
    }),
    { name: "stem-flow-league" }
  )
);
