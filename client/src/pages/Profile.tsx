import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import { useUserState } from "@/lib/userState";
import { apiRequest } from "@/lib/queryClient";
import {
  Zap,
  Flame,
  Settings,
  LogOut,
  Lightbulb,
  Cpu,
  Wrench,
  Calculator,
  Sparkles,
  Compass,
  BarChart3,
  Sword,
  Crown,
  Trophy,
  Star,
  TrendingUp,
  Brain,
  Target,
  GraduationCap,
  RefreshCw,
  Mail,
  Users,
} from "lucide-react";

const levelConfig = {
  curieux: { label: "Curieux", icon: Sparkles, color: "from-blue-400 to-cyan-400", xpNeeded: 500 },
  explorateur: { label: "Explorateur", icon: Compass, color: "from-green-400 to-emerald-400", xpNeeded: 1500 },
  analyste: { label: "Analyste", icon: BarChart3, color: "from-yellow-400 to-orange-400", xpNeeded: 3500 },
  challenger: { label: "Challenger", icon: Sword, color: "from-purple-400 to-pink-400", xpNeeded: 7000 },
  mentor: { label: "Mentor", icon: Crown, color: "from-amber-400 to-yellow-500", xpNeeded: 15000 },
};

const interestIcons = {
  science: { icon: Lightbulb, color: "from-blue-500 to-cyan-400" },
  technology: { icon: Cpu, color: "from-purple-500 to-pink-400" },
  engineering: { icon: Wrench, color: "from-orange-500 to-yellow-400" },
  mathematics: { icon: Calculator, color: "from-green-500 to-emerald-400" },
};

const educationLabels = {
  college: "Coll\u00e8ge",
  lycee: "Lyc\u00e9e",
  universite: "Universit\u00e9",
  autodidacte: "Autodidacte",
};

interface SmartProfileData {
  detectedCompetencies: string[];
  strongAreas: string[];
  areasToImprove: string[];
  suggestedLevel: string;
  learningStyle: string;
  progressionSummary: string;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { profile, xp, streak, userId, user, logout } = useUserState();
  const [smartProfile, setSmartProfile] = useState<SmartProfileData | null>(null);

  const currentLevel = profile?.level || "curieux";
  const levelInfo = levelConfig[currentLevel as keyof typeof levelConfig];
  const LevelIcon = levelInfo.icon;

  const levels = Object.keys(levelConfig);
  const currentLevelIndex = levels.indexOf(currentLevel);
  const nextLevel = levels[currentLevelIndex + 1] as keyof typeof levelConfig | undefined;
  const nextLevelInfo = nextLevel ? levelConfig[nextLevel] : null;

  const xpProgress = nextLevelInfo ? (xp / nextLevelInfo.xpNeeded) * 100 : 100;

  const smartProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/smart-profile", {
        userId: userId || "current-user",
      });
      return res.json();
    },
    onSuccess: (data: SmartProfileData) => {
      setSmartProfile(data);
    },
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    logout();
    setLocation("/auth");
  };

  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (xpProgress / 100) * circumference;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between gap-3 p-4">
          <h1 className="text-xl font-bold">Mon Profil</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" data-testid="button-settings">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-shrink-0">
              <svg className="w-[88px] h-[88px] -rotate-90" viewBox="0 0 88 88">
                <circle
                  cx="44" cy="44" r="38"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="4"
                />
                <circle
                  cx="44" cy="44" r="38"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[72px] h-[72px] rounded-full gradient-stem flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {user?.username?.slice(0, 2).toUpperCase() || "SF"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1" data-testid="text-username">{user?.username || "Apprenant STEM"}</h2>
              <Badge variant="secondary" className="mb-2">
                {profile?.educationLevel ? educationLabels[profile.educationLevel as keyof typeof educationLabels] : "Non d\u00e9fini"}
              </Badge>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F5B700]/10">
                  <Flame className="h-3.5 w-3.5 text-[#F5B700]" />
                  <span className="text-xs font-bold text-[#F5B700]">{streak}j</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-bold text-accent">{xp} XP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${levelInfo.color}`}>
                  <LevelIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{levelInfo.label}</p>
                  <p className="text-xs text-muted-foreground">Niveau actuel</p>
                </div>
              </div>
              {nextLevelInfo && (
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    Prochain niveau
                  </p>
                  <p className="text-sm font-semibold">
                    {nextLevelInfo.xpNeeded - xp} XP restants
                  </p>
                </div>
              )}
            </div>
            <Progress value={xpProgress} className="h-2.5" />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-accent" />
            Centres d'int\u00e9r\u00eat
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile?.interests?.map((interest) => {
              const info = interestIcons[interest as keyof typeof interestIcons];
              if (!info) return null;
              const Icon = info.icon;
              return (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm"
                >
                  <div className={`p-1 rounded-md bg-gradient-to-br ${info.color} mr-2`}>
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                  {interest.charAt(0).toUpperCase() + interest.slice(1)}
                </Badge>
              );
            })}
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            Statistiques
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-background/60">
              <div className="text-2xl font-bold text-primary">{xp}</div>
              <div className="text-xs text-muted-foreground">XP Total</div>
            </div>
            <div className="p-3 rounded-lg bg-background/60">
              <div className="text-2xl font-bold text-[#F5B700]">{streak}</div>
              <div className="text-xs text-muted-foreground">S\u00e9rie jours</div>
            </div>
            <div className="p-3 rounded-lg bg-background/60">
              <div className="text-2xl font-bold text-accent">
                {profile?.interests?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Int\u00e9r\u00eats</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" />
              Profil Intelligent IA
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => smartProfileMutation.mutate()}
              disabled={smartProfileMutation.isPending}
              data-testid="button-analyze-profile"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${smartProfileMutation.isPending ? "animate-spin" : ""}`} />
              {smartProfileMutation.isPending ? "Analyse..." : "Analyser"}
            </Button>
          </div>

          {smartProfileMutation.isPending && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {smartProfile ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-accent font-medium mb-1">
                  <GraduationCap className="h-3.5 w-3.5 inline mr-1" />
                  Style d'apprentissage
                </p>
                <p className="text-sm text-muted-foreground">{smartProfile.learningStyle}</p>
              </div>

              <p className="text-sm text-muted-foreground" data-testid="text-progression-summary">
                {smartProfile.progressionSummary}
              </p>

              {smartProfile.detectedCompetencies.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Comp\u00e9tences d\u00e9tect\u00e9es</p>
                  <div className="flex flex-wrap gap-1.5">
                    {smartProfile.detectedCompetencies.map((comp) => (
                      <Badge key={comp} variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1 text-accent" />
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {smartProfile.strongAreas.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Points forts</p>
                  <div className="flex flex-wrap gap-1.5">
                    {smartProfile.strongAreas.map((area) => (
                      <Badge key={area} variant="secondary" className="text-xs bg-accent/10 text-accent">
                        <Target className="h-3 w-3 mr-1" />
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {smartProfile.areasToImprove.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">\u00c0 am\u00e9liorer</p>
                  <div className="flex flex-wrap gap-1.5">
                    {smartProfile.areasToImprove.map((area) => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : !smartProfileMutation.isPending ? (
            <p className="text-sm text-muted-foreground text-center py-3">
              Clique sur "Analyser" pour obtenir une analyse IA de ton profil.
            </p>
          ) : null}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#F5B700]" />
            R\u00e9alisations r\u00e9centes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">Premi\u00e8re s\u00e9rie</p>
                <p className="text-xs text-muted-foreground">Tu as maintenu ta s\u00e9rie 3 jours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">Bienvenue !</p>
                <p className="text-xs text-muted-foreground">Tu as rejoint STEM FLOW</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setLocation("/missions")}
            data-testid="button-missions"
          >
            <Target className="h-4 w-4 mr-2" />
            Missions
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setLocation("/leaderboard")}
            data-testid="button-leaderboard"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Classement
          </Button>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Contacter l'\u00e9quipe
          </h3>
          <a
            href="mailto:contact.equipe.learnxscience@gmail.com"
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate"
            data-testid="link-contact-team"
          >
            <div className="p-2 rounded-full gradient-stem">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">STEM FLOW Team</p>
              <p className="text-xs text-muted-foreground">contact.equipe.learnxscience@gmail.com</p>
            </div>
          </a>
        </Card>

        <Button
          variant="outline"
          className="w-full text-destructive"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Se d\u00e9connecter
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
