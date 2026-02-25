import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import { useUserState } from "@/lib/userState";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  UserPlus,
  UserMinus,
  Zap,
  Flame,
  Users,
  Lightbulb,
  Cpu,
  Wrench,
  Calculator,
  Sparkles,
  Compass,
  BarChart3,
  Sword,
  Crown,
  BookOpen,
  CheckCircle,
  DoorOpen,
  Award,
  TrendingUp,
  Target,
  Clock,
} from "lucide-react";
import type { Activity } from "@shared/schema";

const levelConfig: Record<string, { label: string; icon: typeof Sparkles; color: string }> = {
  curieux: { label: "Curieux", icon: Sparkles, color: "from-blue-400 to-cyan-400" },
  explorateur: { label: "Explorateur", icon: Compass, color: "from-green-400 to-emerald-400" },
  analyste: { label: "Analyste", icon: BarChart3, color: "from-yellow-400 to-orange-400" },
  challenger: { label: "Challenger", icon: Sword, color: "from-purple-400 to-pink-400" },
  mentor: { label: "Mentor", icon: Crown, color: "from-amber-400 to-yellow-500" },
};

const interestIcons: Record<string, { icon: typeof Lightbulb; color: string }> = {
  science: { icon: Lightbulb, color: "from-blue-500 to-cyan-400" },
  technology: { icon: Cpu, color: "from-purple-500 to-pink-400" },
  engineering: { icon: Wrench, color: "from-orange-500 to-yellow-400" },
  mathematics: { icon: Calculator, color: "from-green-500 to-emerald-400" },
};

const activityIcons: Record<string, typeof BookOpen> = {
  content_created: BookOpen,
  quiz_completed: CheckCircle,
  room_joined: DoorOpen,
  badge_earned: Award,
  level_up: TrendingUp,
  mission_completed: Target,
};

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "A l'instant";
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/user/:id");
  const profileId = params?.id || "";
  const { userId } = useUserState();
  const { toast } = useToast();
  const isOwnProfile = userId === profileId;

  const { data: user, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/users", profileId],
    enabled: !!profileId,
  });

  const { data: followStatus } = useQuery<{ isFollowing: boolean }>({
    queryKey: ["/api/users", profileId, "is-following"],
    enabled: !!profileId && !isOwnProfile,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/users", profileId, "activities"],
    enabled: !!profileId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/users/${profileId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileId, "is-following"] });
      toast({ title: "Suivi avec succès" });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/users/${profileId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileId, "is-following"] });
      toast({ title: "Désabonné avec succès" });
    },
  });

  const isFollowing = followStatus?.isFollowing || false;
  const currentLevel = user?.level || "curieux";
  const levelInfo = levelConfig[currentLevel] || levelConfig.curieux;
  const LevelIcon = levelInfo.icon;

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b">
          <div className="flex items-center gap-3 p-4">
            <Button className="interactive-element hover-elevate" variant="ghost" size="icon" onClick={() => setLocation("/community")} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-6 w-32" />
          </div>
        </header>
        <main className="p-4 space-y-4 max-w-lg mx-auto">
          <Card className="glass-panel premium-shadow border-0 p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b">
          <div className="flex items-center gap-3 p-4">
            <Button className="interactive-element hover-elevate" variant="ghost" size="icon" onClick={() => setLocation("/community")} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Utilisateur introuvable</h1>
          </div>
        </header>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 p-4">
          <Button className="interactive-element hover-elevate" variant="ghost" size="icon" onClick={() => setLocation("/community")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold truncate" data-testid="text-profile-username">{user.username}</h1>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-panel premium-shadow border-0 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full gradient-stem flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-bold" data-testid="text-avatar-initials">
                  {user.username?.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold truncate">{user.username}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`p-1.5 rounded-md bg-gradient-to-br ${levelInfo.color}`}>
                    <LevelIcon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <Badge variant="secondary">{levelInfo.label}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F5B700]/10">
                    <Flame className="h-3.5 w-3.5 text-[#F5B700]" />
                    <span className="text-xs font-bold text-[#F5B700]">{user.streak || 0}j</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10">
                    <Zap className="h-3.5 w-3.5 text-accent" />
                    <span className="text-xs font-bold text-accent">{user.xp || 0} XP</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-center flex-1">
                <p className="text-lg font-bold" data-testid="text-followers-count">{user.followers || 0}</p>
                <p className="text-xs text-muted-foreground">Abonnes</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center flex-1">
                <p className="text-lg font-bold" data-testid="text-following-count">{user.following || 0}</p>
                <p className="text-xs text-muted-foreground">Abonnements</p>
              </div>
            </div>

            {!isOwnProfile && (
              <Button
                className={`interactive-element hover-elevate w-full ${!isFollowing ? "gradient-stem text-white" : ""}`}
                variant={isFollowing ? "outline" : "default"}
                onClick={() => isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
                disabled={followMutation.isPending || unfollowMutation.isPending}
                data-testid="button-follow-toggle"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Se désabonner
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Suivre
                  </>
                )}
              </Button>
            )}
          </Card>
        </motion.div>

        {user.interests && user.interests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-panel premium-shadow border-0 p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Centres d'intérêt
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest: string) => {
                  const info = interestIcons[interest];
                  if (!info) return null;
                  const Icon = info.icon;
                  return (
                    <Badge key={interest} variant="secondary" className="px-3 py-1.5 text-sm" data-testid={`badge-interest-${interest}`}>
                      <div className={`p-1 rounded-md bg-gradient-to-br ${info.color} mr-2`}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      {interest.charAt(0).toUpperCase() + interest.slice(1)}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-panel premium-shadow border-0 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Activité récente
            </h3>
            {activitiesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 10).map((activity) => {
                  const ActivityIcon = activityIcons[activity.activityType] || BookOpen;
                  return (
                    <div key={activity.id} className="flex items-start gap-3" data-testid={`user-activity-${activity.id}`}>
                      <div className="p-1.5 rounded-full bg-accent/10 flex-shrink-0">
                        <ActivityIcon className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{getRelativeTime(activity.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune activité récente.
              </p>
            )}
          </Card>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
