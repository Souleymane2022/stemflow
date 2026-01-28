import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { StemFlowLogo } from "@/components/StemFlowLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserState } from "@/lib/userState";
import {
  Home,
  Users,
  Target,
  User,
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
  college: "Collège",
  lycee: "Lycée",
  universite: "Université",
  autodidacte: "Autodidacte",
};

export default function Profile() {
  const [, setLocation] = useLocation();
  const { profile, xp, streak, reset } = useUserState();

  const currentLevel = profile?.level || "curieux";
  const levelInfo = levelConfig[currentLevel as keyof typeof levelConfig];
  const LevelIcon = levelInfo.icon;

  const levels = Object.keys(levelConfig);
  const currentLevelIndex = levels.indexOf(currentLevel);
  const nextLevel = levels[currentLevelIndex + 1] as keyof typeof levelConfig | undefined;
  const nextLevelInfo = nextLevel ? levelConfig[nextLevel] : null;

  const xpProgress = nextLevelInfo ? (xp / nextLevelInfo.xpNeeded) * 100 : 100;

  const handleLogout = () => {
    reset();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between p-4">
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
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarFallback className="gradient-stem text-white text-2xl font-bold">
                {profile?.preferredLanguage === "fr" ? "TU" : "YOU"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">Apprenant STEM</h2>
              <Badge variant="secondary" className="mb-2">
                {profile?.educationLevel ? educationLabels[profile.educationLevel as keyof typeof educationLabels] : "Non défini"}
              </Badge>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm font-bold">{streak} jours</span>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-bold">{xp} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
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
            <Progress value={xpProgress} className="h-3" />
          </div>
        </Card>

        {/* Interests */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Centres d'intérêt
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile?.interests?.map((interest) => {
              const info = interestIcons[interest as keyof typeof interestIcons];
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

        {/* Stats */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Statistiques
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{xp}</div>
              <div className="text-xs text-muted-foreground">XP Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">{streak}</div>
              <div className="text-xs text-muted-foreground">Série de jours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {profile?.interests?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Intérêts</div>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Réalisations récentes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">Première série</p>
                <p className="text-xs text-muted-foreground">Tu as maintenu ta série 3 jours</p>
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

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Recommencer l'onboarding
        </Button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <Button
            variant="ghost"
            className="flex-col gap-1 h-auto py-2"
            onClick={() => setLocation("/feed")}
            data-testid="nav-feed"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Feed</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col gap-1 h-auto py-2"
            onClick={() => setLocation("/rooms")}
            data-testid="nav-rooms"
          >
            <Users className="h-5 w-5" />
            <span className="text-xs">Salons</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col gap-1 h-auto py-2"
            onClick={() => setLocation("/missions")}
            data-testid="nav-missions"
          >
            <Target className="h-5 w-5" />
            <span className="text-xs">Missions</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col gap-1 h-auto py-2 text-primary"
            onClick={() => setLocation("/profile")}
            data-testid="nav-profile"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profil</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
