import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserState } from "@/lib/userState";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Crown,
  Zap,
  TrendingUp,
  Home,
  Users,
  Target,
  User,
  Lightbulb,
  Cpu,
  Wrench,
  Calculator,
  Flame,
} from "lucide-react";
import type { LeaderboardEntry } from "@shared/schema";

const categoryFilters = [
  { value: "all", label: "Tous", icon: Trophy },
  { value: "science", label: "Science", icon: Lightbulb },
  { value: "technology", label: "Tech", icon: Cpu },
  { value: "engineering", label: "Ingénierie", icon: Wrench },
  { value: "mathematics", label: "Maths", icon: Calculator },
];

const podiumColors = [
  "from-[#F5B700] to-[#F5B700]/70",
  "from-gray-300 to-gray-400",
  "from-[#CD7F32] to-[#CD7F32]/70",
];

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const { xp, streak } = useUserState();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard", selectedCategory],
  });

  const topThree = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/feed")} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Classement</h1>
              <p className="text-sm text-muted-foreground">Score académique</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F5B700]/10">
              <Flame className="h-3.5 w-3.5 text-[#F5B700]" />
              <span className="text-xs font-bold text-[#F5B700]">{streak}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-bold text-accent">{xp}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-2 overflow-x-auto">
        <div className="flex gap-2">
          {categoryFilters.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className={selectedCategory === cat.value ? "gradient-stem text-white" : ""}
              data-testid={`filter-${cat.value}`}
            >
              <cat.icon className="h-3 w-3 mr-1" />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {topThree.length >= 3 && (
              <Card className="p-6">
                <div className="flex items-end justify-center gap-4">
                  {[1, 0, 2].map((podiumIndex) => {
                    const entry = topThree[podiumIndex];
                    if (!entry) return null;
                    const isFirst = podiumIndex === 0;
                    return (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: podiumIndex * 0.1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="relative mb-2">
                          <Avatar className={`${isFirst ? "h-16 w-16" : "h-12 w-12"} border-3 border-[${podiumIndex === 0 ? '#F5B700' : podiumIndex === 1 ? '#C0C0C0' : '#CD7F32'}]`}>
                            <AvatarFallback className={`bg-gradient-to-br ${podiumColors[podiumIndex]} text-white text-sm font-bold`}>
                              {entry.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {podiumIndex === 0 && (
                            <Crown className="h-6 w-6 text-[#F5B700] absolute -top-3 left-1/2 -translate-x-1/2" />
                          )}
                        </div>
                        <p className={`font-semibold text-center ${isFirst ? "text-sm" : "text-xs"} truncate max-w-[80px]`}>
                          {entry.username}
                        </p>
                        <div className="flex items-center gap-1 text-accent mt-1">
                          <Zap className="h-3 w-3" />
                          <span className="text-xs font-bold">{entry.academicScore}</span>
                        </div>
                        <div className={`mt-2 rounded-t-lg ${isFirst ? "h-20 w-16" : podiumIndex === 1 ? "h-14 w-14" : "h-10 w-14"} bg-gradient-to-b ${podiumColors[podiumIndex]} flex items-center justify-center`}>
                          <span className="text-white font-bold text-lg">{podiumIndex + 1}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            )}

            <div className="space-y-2">
              {rest.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-3" data-testid={`leaderboard-entry-${index + 4}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-6 text-center">
                        {index + 4}
                      </span>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="gradient-stem text-white text-xs">
                          {entry.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{entry.username}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{entry.level}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {entry.contentCount} publications
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-accent">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-sm font-bold">{entry.academicScore}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{entry.xp} XP</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => setLocation("/feed")} data-testid="nav-feed">
            <Home className="h-5 w-5" />
            <span className="text-xs">Feed</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => setLocation("/rooms")} data-testid="nav-rooms">
            <Users className="h-5 w-5" />
            <span className="text-xs">Salons</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2 text-primary" onClick={() => setLocation("/leaderboard")} data-testid="nav-leaderboard">
            <Trophy className="h-5 w-5" />
            <span className="text-xs">Classement</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => setLocation("/missions")} data-testid="nav-missions">
            <Target className="h-5 w-5" />
            <span className="text-xs">Missions</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => setLocation("/profile")} data-testid="nav-profile">
            <User className="h-5 w-5" />
            <span className="text-xs">Profil</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
