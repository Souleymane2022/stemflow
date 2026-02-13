import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  targetValue: number;
  currentProgress: number;
  completed: boolean;
  type: "view_content" | "like_content" | "comment" | "quiz" | "share" | "visit_room";
}

interface DailyQuestsState {
  quests: DailyQuest[];
  lastResetDate: string | null;
  streakFreezeCount: number;
  xpBoostActive: boolean;
  xpBoostExpiry: number | null;
  generateDailyQuests: () => void;
  updateQuestProgress: (type: DailyQuest["type"], amount?: number) => DailyQuest | null;
  useStreakFreeze: () => boolean;
  activateXpBoost: (durationMinutes: number) => void;
  getXpMultiplier: () => number;
  addStreakFreeze: (count: number) => void;
}

const questTemplates: Omit<DailyQuest, "id" | "currentProgress" | "completed">[] = [
  { title: "Curieux du jour", description: "Consulte 3 contenus", icon: "eye", xpReward: 30, targetValue: 3, type: "view_content" },
  { title: "Pouce en l'air", description: "Like 5 contenus", icon: "heart", xpReward: 25, targetValue: 5, type: "like_content" },
  { title: "Participe !", description: "Laisse 2 commentaires", icon: "message-circle", xpReward: 40, targetValue: 2, type: "comment" },
  { title: "Quiz Master", description: "Complète 1 quiz", icon: "brain", xpReward: 50, targetValue: 1, type: "quiz" },
  { title: "Partage le savoir", description: "Partage 1 contenu", icon: "share-2", xpReward: 35, targetValue: 1, type: "share" },
  { title: "Explorateur", description: "Visite 2 salons", icon: "users", xpReward: 30, targetValue: 2, type: "visit_room" },
  { title: "Lecteur assidu", description: "Consulte 5 contenus", icon: "book-open", xpReward: 50, targetValue: 5, type: "view_content" },
  { title: "Super commentateur", description: "Laisse 4 commentaires", icon: "message-square", xpReward: 60, targetValue: 4, type: "comment" },
];

function pickRandomQuests(count: number): DailyQuest[] {
  const shuffled = [...questTemplates].sort(() => Math.random() - 0.5);
  const typeSeen = new Set<string>();
  const picked: DailyQuest[] = [];
  for (const t of shuffled) {
    if (picked.length >= count) break;
    if (typeSeen.has(t.type)) continue;
    typeSeen.add(t.type);
    picked.push({
      ...t,
      id: `dq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      currentProgress: 0,
      completed: false,
    });
  }
  return picked;
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export const useDailyQuests = create<DailyQuestsState>()(
  persist(
    (set, get) => ({
      quests: [],
      lastResetDate: null,
      streakFreezeCount: 1,
      xpBoostActive: false,
      xpBoostExpiry: null,

      generateDailyQuests: () => {
        const today = getTodayStr();
        if (get().lastResetDate === today) return;
        set({
          quests: pickRandomQuests(3),
          lastResetDate: today,
        });
      },

      updateQuestProgress: (type, amount = 1) => {
        const { quests } = get();
        let completedQuest: DailyQuest | null = null;
        const updated = quests.map((q) => {
          if (q.type === type && !q.completed) {
            const newProgress = Math.min(q.currentProgress + amount, q.targetValue);
            const nowCompleted = newProgress >= q.targetValue;
            if (nowCompleted && !q.completed) {
              completedQuest = { ...q, currentProgress: newProgress, completed: true };
            }
            return { ...q, currentProgress: newProgress, completed: nowCompleted };
          }
          return q;
        });
        set({ quests: updated });
        return completedQuest;
      },

      useStreakFreeze: () => {
        const { streakFreezeCount } = get();
        if (streakFreezeCount <= 0) return false;
        set({ streakFreezeCount: streakFreezeCount - 1 });
        return true;
      },

      activateXpBoost: (durationMinutes) => {
        set({
          xpBoostActive: true,
          xpBoostExpiry: Date.now() + durationMinutes * 60 * 1000,
        });
      },

      getXpMultiplier: () => {
        const { xpBoostActive, xpBoostExpiry } = get();
        if (xpBoostActive && xpBoostExpiry && Date.now() < xpBoostExpiry) {
          return 2;
        }
        if (xpBoostActive && xpBoostExpiry && Date.now() >= xpBoostExpiry) {
          set({ xpBoostActive: false, xpBoostExpiry: null });
        }
        return 1;
      },

      addStreakFreeze: (count) => {
        set((s) => ({ streakFreezeCount: s.streakFreezeCount + count }));
      },
    }),
    { name: "stem-flow-daily-quests" }
  )
);
