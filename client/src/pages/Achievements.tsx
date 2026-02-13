import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUserState } from "@/lib/userState";
import { useLeagueState, LEAGUES } from "@/lib/leagues";
import { useDailyQuests } from "@/lib/dailyQuests";
import { useLocation } from "wouter";
import {
  Trophy,
  Star,
  Crown,
  Flame,
  Zap,
  Brain,
  Award,
  Users,
  Sparkles,
  Lock,
  Shield,
  Gem,
  Diamond,
  ArrowLeft,
  Microscope,
  Cpu,
  Target,
  BookOpen,
} from "lucide-react";
import type { Badge, UserBadge } from "@shared/schema";

const badgeIcons: Record<string, any> = {
  star: Star,
  crown: Crown,
  brain: Brain,
  award: Award,
  users: Users,
  flame: Flame,
  microscope: Microscope,
  cpu: Cpu,
};

const badgeCategoryColors: Record<string, string> = {
  contribution: "from-blue-500 to-cyan-400",
  performance: "from-purple-500 to-pink-400",
  social: "from-green-500 to-emerald-400",
  special: "from-yellow-500 to-orange-400",
};

export default function Achievements() {
  const [, setLocation] = useLocation();
  const { xp, streak } = useUserState();
  const { getCurrentLeague } = useLeagueState();
  const currentLeague = getCurrentLeague();

  const { data: allBadges, isLoading: loadingBadges } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
  });

  const { data: userBadges, isLoading: loadingUserBadges } = useQuery<UserBadge[]>({
    queryKey: ["/api/user-badges"],
  });

  const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badgeId) || []);

  const leagueIcon = currentLeague.icon === "shield" ? Shield
    : currentLeague.icon === "gem" ? Gem
    : currentLeague.icon === "crown" ? Crown
    : currentLeague.icon === "diamond" ? Diamond
    : Shield;

  const LeagueIcon = leagueIcon;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/profile")} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Badges & Succès</h1>
              <p className="text-sm text-muted-foreground">Ta collection</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full bg-gradient-to-br ${currentLeague.gradient}`}>
              <LeagueIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Ligue {currentLeague.name}</h3>
              <p className="text-sm text-muted-foreground">
                {earnedBadgeIds.size} / {allBadges?.length || 0} badges obtenus
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent">{xp}</div>
              <div className="text-xs text-muted-foreground">XP Total</div>
            </div>
          </div>
          <Progress value={allBadges ? (earnedBadgeIds.size / allBadges.length) * 100 : 0} className="h-2" />
        </Card>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {LEAGUES.slice(0, 5).map((league) => {
            const isActive = league.id === currentLeague.id;
            const isPassed = league.tier < currentLeague.tier;
            return (
              <div
                key={league.id}
                className={`flex flex-col items-center gap-1 flex-shrink-0 p-2 rounded-lg transition-all ${
                  isActive ? "bg-accent/10 ring-1 ring-accent" : ""
                }`}
              >
                <div className={`p-2 rounded-full bg-gradient-to-br ${league.gradient} ${isPassed || isActive ? "opacity-100" : "opacity-30"}`}>
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "text-accent" : "text-muted-foreground"}`}>
                  {league.name}
                </span>
              </div>
            );
          })}
        </div>

        {["contribution", "performance", "social", "special"].map((category) => {
          const categoryBadges = allBadges?.filter((b) => b.category === category) || [];
          if (categoryBadges.length === 0) return null;

          const categoryLabels: Record<string, string> = {
            contribution: "Contribution",
            performance: "Performance",
            social: "Social",
            special: "Spécial",
          };

          return (
            <Card key={category} className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <div className={`p-1.5 rounded-md bg-gradient-to-br ${badgeCategoryColors[category]}`}>
                  <Trophy className="h-3.5 w-3.5 text-white" />
                </div>
                {categoryLabels[category]}
                <BadgeUI variant="secondary" className="ml-auto text-xs">
                  {categoryBadges.filter((b) => earnedBadgeIds.has(b.id)).length}/{categoryBadges.length}
                </BadgeUI>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {categoryBadges.map((badge, i) => {
                  const earned = earnedBadgeIds.has(badge.id);
                  const Icon = badgeIcons[badge.icon] || Star;
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`relative p-3 rounded-lg border transition-all ${
                        earned
                          ? "bg-accent/5 border-accent/30"
                          : "bg-muted/30 border-border opacity-60"
                      }`}
                      data-testid={`badge-${badge.id}`}
                    >
                      {!earned && (
                        <Lock className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
                      )}
                      <div className={`p-2 rounded-full w-fit mb-2 bg-gradient-to-br ${earned ? badgeCategoryColors[category] : "from-gray-400 to-gray-300"}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="font-semibold text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
                      {earned && (
                        <BadgeUI variant="secondary" className="mt-2 text-[10px] bg-accent/10 text-accent">
                          <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                          Obtenu
                        </BadgeUI>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {(loadingBadges || loadingUserBadges) && (
          <Card className="p-4 space-y-3">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
