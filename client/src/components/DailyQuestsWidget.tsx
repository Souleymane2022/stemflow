import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDailyQuests } from "@/lib/dailyQuests";
import { useUserState } from "@/lib/userState";
import { celebrateMissionComplete, celebrateXpGain } from "@/lib/celebrations";
import {
  Eye,
  Heart,
  MessageCircle,
  Brain,
  Share2,
  Users,
  BookOpen,
  MessageSquare,
  Sparkles,
  Clock,
  Zap,
  Check,
  Gift,
} from "lucide-react";

const questIcons: Record<string, any> = {
  eye: Eye,
  heart: Heart,
  "message-circle": MessageCircle,
  brain: Brain,
  "share-2": Share2,
  users: Users,
  "book-open": BookOpen,
  "message-square": MessageSquare,
};

export function DailyQuestsWidget() {
  const { quests, generateDailyQuests, xpBoostActive, getXpMultiplier } = useDailyQuests();
  const { addXp } = useUserState();

  useEffect(() => {
    generateDailyQuests();
  }, []);

  const completedCount = quests.filter((q) => q.completed).length;
  const allCompleted = completedCount === quests.length && quests.length > 0;
  const multiplier = getXpMultiplier();

  if (quests.length === 0) return null;

  return (
    <Card className="glass-panel premium-shadow border-0 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Gift className="h-4 w-4 text-[#F5B700]" />
          Quêtes du jour
        </h3>
        <div className="flex items-center gap-2">
          {xpBoostActive && (
            <Badge variant="secondary" className="text-[10px] bg-accent/10 text-accent">
              <Zap className="h-2.5 w-2.5 mr-0.5" />
              x{multiplier} XP
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{quests.length}
          </Badge>
        </div>
      </div>

      {allCompleted && (
        <div className="mb-3 p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-center">
          <p className="text-sm font-medium text-accent flex items-center justify-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            Toutes les quêtes complétées ! Bonus +50 XP
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        <AnimatePresence>
          {quests.map((quest) => {
            const Icon = questIcons[quest.icon] || Sparkles;
            const progress = (quest.currentProgress / quest.targetValue) * 100;
            return (
              <motion.div
                key={quest.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  quest.completed ? "bg-accent/5 border-accent/20" : "bg-card border-border"
                }`}
                data-testid={`daily-quest-${quest.id}`}
              >
                <div className={`p-2 rounded-full flex-shrink-0 ${quest.completed ? "gradient-stem" : "bg-muted"}`}>
                  {quest.completed ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-sm font-medium truncate ${quest.completed ? "line-through text-muted-foreground" : ""}`}>
                      {quest.title}
                    </p>
                    <span className="text-xs font-bold text-accent flex-shrink-0">+{quest.xpReward} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="h-1.5 flex-1" />
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {quest.currentProgress}/{quest.targetValue}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span className="text-[10px]">Renouvellement dans {getHoursUntilReset()}h</span>
      </div>
    </Card>
  );
}

function getHoursUntilReset(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
}
