import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import { useUserState } from "@/lib/userState";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  UserPlus,
  UserMinus,
  Zap,
  BookOpen,
  CheckCircle,
  DoorOpen,
  Award,
  TrendingUp,
  Target,
  Rss,
  Compass,
  Clock,
} from "lucide-react";
import type { Activity } from "@shared/schema";

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

export default function Community() {
  const [, setLocation] = useLocation();
  const { userId } = useUserState();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"feed" | "discover">("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: activityFeed, isLoading: feedLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activity-feed"],
    enabled: activeTab === "feed",
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<any[]>({
    queryKey: ["/api/leaderboard", "all"],
    enabled: activeTab === "discover",
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery<any[]>({
    queryKey: ["/api/users/search", `?q=${searchQuery}`],
    enabled: searchQuery.length > 0,
  });

  const followMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      await apiRequest("POST", `/api/users/${targetUserId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activity-feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({ title: "Suivi avec succès" });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      await apiRequest("DELETE", `/api/users/${targetUserId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activity-feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({ title: "Désabonné avec succès" });
    },
  });

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-3" data-testid="text-community-title">Communauté</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des utilisateurs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
                data-testid="input-search-users"
              />
            </div>
            <Button className="interactive-element hover-elevate"
              size="default"
              onClick={handleSearch}
              data-testid="button-search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex px-4 pb-3 gap-2">
          <button
            onClick={() => { setActiveTab("feed"); setSearchQuery(""); setSearchInput(""); }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === "feed"
                ? "gradient-stem text-white shadow-md"
                : "bg-muted text-muted-foreground"
            }`}
            data-testid="tab-feed"
          >
            <Rss className="h-3.5 w-3.5" />
            Fil d'actualité
          </button>
          <button
            onClick={() => { setActiveTab("discover"); setSearchQuery(""); setSearchInput(""); }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === "discover"
                ? "gradient-stem text-white shadow-md"
                : "bg-muted text-muted-foreground"
            }`}
            data-testid="tab-discover"
          >
            <Compass className="h-3.5 w-3.5" />
            Découvrir
          </button>
        </div>
      </header>

      <main className="p-4 space-y-3 max-w-lg mx-auto">
        {searchQuery.length > 0 ? (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground" data-testid="text-search-results-title">
              Résultats pour "{searchQuery}"
            </h2>
            {searchLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="glass-panel premium-shadow border-0 p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((user: any, index: number) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="glass-panel premium-shadow border-0 p-4 hover-elevate cursor-pointer"
                    onClick={() => setLocation(`/user/${user.id}`)}
                    data-testid={`search-result-${user.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="gradient-stem text-white text-xs font-bold">
                          {user.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.username}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{user.level || "curieux"}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {user.xp || 0} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">Aucun utilisateur trouvé.</p>
              </div>
            )}
          </>
        ) : activeTab === "feed" ? (
          <>
            {feedLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="glass-panel premium-shadow border-0 p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : activityFeed && activityFeed.length > 0 ? (
              activityFeed.map((activity, index) => {
                const ActivityIcon = activityIcons[activity.activityType] || BookOpen;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="glass-panel premium-shadow border-0 p-4 hover-elevate cursor-pointer"
                      onClick={() => setLocation(`/user/${activity.userId}`)}
                      data-testid={`activity-item-${activity.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="gradient-stem text-white text-xs font-bold">
                            {activity.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <ActivityIcon className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                            <p className="text-sm">
                              <span className="font-semibold">{activity.username}</span>{" "}
                              <span className="text-muted-foreground">{activity.description}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {getRelativeTime(activity.createdAt)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                  <Rss className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucune activité</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Suivez des utilisateurs pour voir leur activité ici.
                </p>
                <Button className="interactive-element hover-elevate"
                  onClick={() => setActiveTab("discover")}
                  data-testid="button-discover-users"
                >
                  <Compass className="h-4 w-4 mr-2" />
                  Découvrir des utilisateurs
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground" data-testid="text-discover-title">
              Utilisateurs suggérés
            </h2>
            {leaderboardLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="glass-panel premium-shadow border-0 p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              leaderboard
                .filter((entry: any) => entry.userId !== userId)
                .map((entry: any, index: number) => (
                  <DiscoverUserCard
                    key={entry.userId}
                    entry={entry}
                    index={index}
                    currentUserId={userId}
                    onFollow={(id) => followMutation.mutate(id)}
                    onUnfollow={(id) => unfollowMutation.mutate(id)}
                    onNavigate={(id) => setLocation(`/user/${id}`)}
                  />
                ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">Aucun utilisateur à découvrir.</p>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function DiscoverUserCard({
  entry,
  index,
  currentUserId,
  onFollow,
  onUnfollow,
  onNavigate,
}: {
  entry: any;
  index: number;
  currentUserId: string | null;
  onFollow: (id: string) => void;
  onUnfollow: (id: string) => void;
  onNavigate: (id: string) => void;
}) {
  const { data: followStatus } = useQuery<{ isFollowing: boolean }>({
    queryKey: ["/api/users", entry.userId, "is-following"],
    enabled: !!currentUserId,
  });

  const isFollowing = followStatus?.isFollowing || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="glass-panel premium-shadow border-0 p-4" data-testid={`discover-user-${entry.userId}`}>
        <div className="flex items-center gap-3">
          <Avatar
            className="h-12 w-12 cursor-pointer"
            onClick={() => onNavigate(entry.userId)}
          >
            <AvatarFallback className="gradient-stem text-white text-sm font-bold">
              {entry.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onNavigate(entry.userId)}
          >
            <p className="font-semibold text-sm truncate">{entry.username}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{entry.level}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3 text-accent" />
                {entry.xp} XP
              </span>
            </div>
          </div>
          <Button className="interactive-element hover-elevate"
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (isFollowing) {
                onUnfollow(entry.userId);
              } else {
                onFollow(entry.userId);
              }
            }}
            className={!isFollowing ? "gradient-stem text-white" : ""}
            data-testid={`button-follow-${entry.userId}`}
          >
            {isFollowing ? (
              <>
                <UserMinus className="h-3.5 w-3.5 mr-1" />
                Suivi
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Suivre
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
