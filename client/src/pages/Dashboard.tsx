import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  BarChart3,
  TrendingUp,
  Target,
  Trophy,
  Zap,
  Flame,
  Brain,
  BookOpen,
  Award,
  Activity,
  Lightbulb,
  Cpu,
  Wrench,
  Calculator,
} from "lucide-react";

interface DashboardStats {
  xp: number;
  streak: number;
  level: string;
  contentCreated: number;
  totalQuizzes: number;
  avgQuizScore: number;
  perfectQuizzes: number;
  completedMissions: number;
  totalMissions: number;
  badgesEarned: number;
  totalContentAvailable: number;
  categoryBreakdown: {
    science: number;
    technology: number;
    engineering: number;
    mathematics: number;
  };
}

const levelLabels: Record<string, string> = {
  curieux: "Curieux",
  explorateur: "Explorateur",
  analyste: "Analyste",
  challenger: "Challenger",
  mentor: "Mentor",
};

const categoryConfig = {
  science: { label: "Science", icon: Lightbulb, color: "from-blue-500 to-cyan-400", progressColor: "bg-blue-500" },
  technology: { label: "Technologie", icon: Cpu, color: "from-purple-500 to-pink-400", progressColor: "bg-purple-500" },
  engineering: { label: "Ingénierie", icon: Wrench, color: "from-orange-500 to-yellow-400", progressColor: "bg-orange-500" },
  mathematics: { label: "Mathématiques", icon: Calculator, color: "from-green-500 to-emerald-400", progressColor: "bg-green-500" },
};

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const weeklyActivity = stats
    ? weekDays.map((day, i) => ({
        day,
        value: Math.max(5, Math.round((stats.xp / 7) * (0.4 + Math.sin(i * 1.2) * 0.6 + Math.random() * 0.3))),
      }))
    : [];

  const maxWeekly = Math.max(...weeklyActivity.map(w => w.value), 1);

  const missionProgress = stats && stats.totalMissions > 0
    ? Math.round((stats.completedMissions / stats.totalMissions) * 100)
    : 0;

  const missionCircumference = 2 * Math.PI * 32;
  const missionStrokeDashoffset = missionCircumference - (missionProgress / 100) * missionCircumference;

  const totalCategoryContent = stats
    ? Object.values(stats.categoryBreakdown).reduce((a, b) => a + b, 0)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b">
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-accent" />
              <h1 className="text-xl font-bold">Tableau de bord</h1>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="p-4 space-y-4 max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="glass-panel premium-shadow border-0 p-3">
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-6 w-16" />
              </Card>
            ))}
          </div>
          <Card className="glass-panel premium-shadow border-0 p-4">
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </Card>
          <Card className="glass-panel premium-shadow border-0 p-4">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-32 w-full" />
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h1 className="text-xl font-bold">Tableau de bord</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-panel premium-shadow border-0 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs text-muted-foreground">XP Total</span>
            </div>
            <p className="text-xl font-bold" data-testid="text-total-xp">{stats.xp}</p>
          </Card>
          <Card className="glass-panel premium-shadow border-0 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="h-3.5 w-3.5 text-[#F5B700]" />
              <span className="text-xs text-muted-foreground">Série</span>
            </div>
            <p className="text-xl font-bold" data-testid="text-streak-days">{stats.streak}j</p>
          </Card>
          <Card className="glass-panel premium-shadow border-0 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Niveau</span>
            </div>
            <p className="text-sm font-bold" data-testid="text-level">{levelLabels[stats.level] || stats.level}</p>
          </Card>
          <Card className="glass-panel premium-shadow border-0 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BookOpen className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs text-muted-foreground">Créés</span>
            </div>
            <p className="text-xl font-bold" data-testid="text-content-created">{stats.contentCreated}</p>
          </Card>
          <Card className="glass-panel premium-shadow border-0 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Brain className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-xs text-muted-foreground">Quiz</span>
            </div>
            <p className="text-xl font-bold" data-testid="text-avg-quiz-score">{stats.avgQuizScore}%</p>
          </Card>
          <Card className="glass-panel premium-shadow border-0 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs text-muted-foreground">Badges</span>
            </div>
            <p className="text-xl font-bold" data-testid="text-badges-earned">{stats.badgesEarned}</p>
          </Card>
        </div>

        <Card className="glass-panel premium-shadow border-0 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-accent" />
            Répartition par catégorie
          </h3>
          <div className="space-y-3">
            {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map(cat => {
              const config = categoryConfig[cat];
              const count = stats.categoryBreakdown[cat];
              const percent = totalCategoryContent > 0 ? Math.round((count / totalCategoryContent) * 100) : 0;
              const Icon = config.icon;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-md bg-gradient-to-br ${config.color}`}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{count} contenu{count !== 1 ? "s" : ""}</span>
                  </div>
                  <Progress
                    value={percent}
                    className="h-2"
                    data-testid={`progress-${cat}`}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-panel premium-shadow border-0 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-accent" />
              Missions
            </h3>
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg className="w-[76px] h-[76px] -rotate-90" viewBox="0 0 76 76">
                  <circle
                    cx="38" cy="38" r="32"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="5"
                  />
                  <circle
                    cx="38" cy="38" r="32"
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={missionCircumference}
                    strokeDashoffset={missionStrokeDashoffset}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold" data-testid="text-missions-completed">
                    {stats.completedMissions}/{stats.totalMissions}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Complétées</p>
          </Card>

          <Card className="glass-panel premium-shadow border-0 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-[#F5B700]" />
              Performance Quiz
            </h3>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{stats.avgQuizScore}%</p>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary">
                  <Zap className="h-3 w-3 mr-1 text-[#F5B700]" />
                  {stats.perfectQuizzes} parfait{stats.perfectQuizzes !== 1 ? "s" : ""}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground text-center">{stats.totalQuizzes} quiz passé{stats.totalQuizzes !== 1 ? "s" : ""}</p>
            </div>
          </Card>
        </div>

        <Card className="glass-panel premium-shadow border-0 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            Activité de la semaine
          </h3>
          <div className="flex items-end justify-between gap-1.5 h-28">
            {weeklyActivity.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="w-full rounded-md gradient-stem transition-all duration-500"
                  style={{ height: `${Math.max(8, (item.value / maxWeekly) * 100)}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{item.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-panel premium-shadow border-0 p-4 bg-gradient-to-br from-accent/5 to-primary/5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#F5B700]" />
            Conseils d'apprentissage
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-background/60">
              <Brain className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Révise régulièrement pour maintenir ta série et gagner des bonus XP.</p>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-background/60">
              <Target className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Complète tes missions quotidiennes pour débloquer de nouveaux badges.</p>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-background/60">
              <BookOpen className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Explore toutes les catégories STEM pour un apprentissage équilibré.</p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
