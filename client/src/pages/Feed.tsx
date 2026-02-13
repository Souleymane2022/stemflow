import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ContentCard } from "@/components/feed/ContentCard";
import { StemFlowLogo } from "@/components/StemFlowLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import { useUserState } from "@/lib/userState";
import { apiRequest } from "@/lib/queryClient";
import { useDailyQuests } from "@/lib/dailyQuests";
import { useLeagueState } from "@/lib/leagues";
import { celebrateMissionComplete } from "@/lib/celebrations";
import { useToast } from "@/hooks/use-toast";
import {
  Lightbulb,
  Cpu,
  Wrench,
  Calculator,
  Flame,
  Zap,
  Brain,
  Sparkles,
} from "lucide-react";
import type { Content } from "@shared/schema";

const categories = [
  { value: "all", label: "Tout", icon: Flame },
  { value: "science", label: "Science", icon: Lightbulb },
  { value: "technology", label: "Tech", icon: Cpu },
  { value: "engineering", label: "Ingénierie", icon: Wrench },
  { value: "mathematics", label: "Maths", icon: Calculator },
];

function FeedContentItem({ content, index, onView, onJoinRoom, showLearnScore }: {
  content: Content;
  index: number;
  onView: (id: string) => void;
  onJoinRoom: () => void;
  showLearnScore: boolean;
}) {
  useEffect(() => {
    onView(content.id);
  }, [content.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <ContentCard
        content={content}
        onJoinRoom={onJoinRoom}
        showLearnScore={showLearnScore}
      />
    </motion.div>
  );
}

export default function Feed() {
  const [, setLocation] = useLocation();
  const { profile, xp, streak, addXp } = useUserState();
  const { toast } = useToast();
  const { generateDailyQuests, updateQuestProgress } = useDailyQuests();
  const { addWeeklyXp, checkWeekReset } = useLeagueState();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [smartFeed, setSmartFeed] = useState(false);
  const [smartExplanation, setSmartExplanation] = useState("");
  const viewTrackedRef = useRef(new Set<string>());

  useEffect(() => {
    generateDailyQuests();
    checkWeekReset();
  }, []);

  const trackContentView = useCallback((contentId: string) => {
    if (viewTrackedRef.current.has(contentId)) return;
    viewTrackedRef.current.add(contentId);
    const completed = updateQuestProgress("view_content");
    if (completed) {
      celebrateMissionComplete();
      addWeeklyXp(completed.xpReward);
      addXp(completed.xpReward);
      toast({ title: "Quête complétée !", description: `+${completed.xpReward} XP - ${completed.title}` });
    }
  }, [updateQuestProgress, addWeeklyXp, addXp, toast]);

  const { data: contents, isLoading } = useQuery<Content[]>({
    queryKey: ["/api/feed", selectedCategory],
  });

  const smartFeedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/recommendations", {
        interests: profile?.interests || [],
        level: profile?.level || "curieux",
        recentInteractions: [],
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSmartExplanation(data.explanation);
    },
  });

  const handleSmartFeedToggle = () => {
    if (!smartFeed) {
      smartFeedMutation.mutate();
    }
    setSmartFeed(!smartFeed);
  };

  const displayContents = smartFeed && smartFeedMutation.data
    ? smartFeedMutation.data.contents
    : contents?.filter(
        (content: Content) => selectedCategory === "all" || content.category === selectedCategory
      );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between gap-3 p-3 px-4">
          <StemFlowLogo size="sm" showText={false} />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#F5B700]/10">
              <Flame className="h-3.5 w-3.5 text-[#F5B700]" />
              <span className="text-xs font-bold text-[#F5B700]">{streak}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-bold text-accent">{xp}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={handleSmartFeedToggle}
            disabled={smartFeedMutation.isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              smartFeed 
                ? "gradient-stem text-white shadow-md" 
                : "bg-muted text-muted-foreground"
            }`}
            data-testid="button-smart-feed"
          >
            <Brain className={`h-3.5 w-3.5 ${smartFeedMutation.isPending ? "animate-spin" : ""}`} />
            IA
          </button>
          {!smartFeed && categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected 
                    ? "gradient-stem text-white shadow-md" 
                    : "bg-muted text-muted-foreground"
                }`}
                data-testid={`button-category-${cat.value}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </header>

      {smartFeed && smartExplanation && (
        <div className="px-4 pt-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-accent/10 border border-accent/20">
            <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
            <p className="text-xs text-accent" data-testid="text-smart-explanation">{smartExplanation}</p>
          </div>
        </div>
      )}

      <main className="p-4 space-y-5 max-w-lg mx-auto">
        {(isLoading || smartFeedMutation.isPending) ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 p-4 rounded-xl bg-card border">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </>
        ) : displayContents && displayContents.length > 0 ? (
          displayContents.map((content: Content, index: number) => (
            <FeedContentItem
              key={content.id}
              content={content}
              index={index}
              onView={trackContentView}
              onJoinRoom={() => setLocation(`/rooms/${content.roomId}`)}
              showLearnScore={smartFeed}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Lightbulb className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun contenu</h3>
            <p className="text-muted-foreground">
              Pas encore de contenu dans cette catégorie.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
