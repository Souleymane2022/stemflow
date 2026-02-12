import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import { useUserState } from "@/lib/userState";
import {
  Target,
  Zap,
  Flame,
  Play,
  HelpCircle,
  UserPlus,
  MessageCircle,
  Share2,
  Swords,
  PenTool,
  Calendar,
  Clock,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import type { Mission } from "@shared/schema";

const missionTypeIcons = {
  watch_videos: Play,
  complete_quiz: HelpCircle,
  join_salon: UserPlus,
  comment: MessageCircle,
  share_content: Share2,
  win_battle: Swords,
  create_content: PenTool,
  streak: Flame,
};

const frequencyLabels = {
  daily: { label: "Quotidienne", icon: Clock, color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
  weekly: { label: "Hebdomadaire", icon: Calendar, color: "bg-purple-500/20 text-purple-600 dark:text-purple-400" },
  one_time: { label: "Unique", icon: Trophy, color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
};

export default function Missions() {
  const [, setLocation] = useLocation();
  const { xp, streak } = useUserState();

  const { data: missions, isLoading } = useQuery<Mission[]>({
    queryKey: ["/api/missions"],
  });

  const activeMissions = missions?.filter((m) => !m.completed) || [];
  const completedMissions = missions?.filter((m) => m.completed) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold">Missions</h1>
            <p className="text-sm text-muted-foreground">Gagne des XP !</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-bold">{streak}</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-bold">{xp}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Missions List */}
      <main className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Active Missions */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Missions actives
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : activeMissions.length > 0 ? (
            <div className="space-y-3">
              {activeMissions.map((mission, index) => {
                const MissionIcon = missionTypeIcons[mission.missionType];
                const freq = frequencyLabels[mission.frequency];
                const progress = (mission.currentProgress / mission.targetValue) * 100;

                return (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4" data-testid={`mission-card-${mission.id}`}>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg gradient-stem">
                          <MissionIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold">{mission.title}</h3>
                            <Badge className={`text-xs ${freq.color}`}>
                              <freq.icon className="h-3 w-3 mr-1" />
                              {freq.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {mission.description}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {mission.currentProgress} / {mission.targetValue}
                              </span>
                              <div className="flex items-center gap-1 text-primary">
                                <Zap className="h-3 w-3" />
                                <span className="font-semibold">+{mission.xpReward} XP</span>
                              </div>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tout est fait !</h3>
              <p className="text-muted-foreground">
                Tu as complété toutes tes missions. Reviens demain !
              </p>
            </Card>
          )}
        </section>

        {/* Completed Missions */}
        {completedMissions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Missions complétées ({completedMissions.length})
            </h2>
            <div className="space-y-3">
              {completedMissions.slice(0, 3).map((mission) => {
                const MissionIcon = missionTypeIcons[mission.missionType];

                return (
                  <Card
                    key={mission.id}
                    className="p-4 opacity-60"
                    data-testid={`mission-completed-${mission.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-green-500/20">
                        <MissionIcon className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold line-through">{mission.title}</h3>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                          <Zap className="h-3 w-3" />
                          <span>+{mission.xpReward} XP gagnés</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
