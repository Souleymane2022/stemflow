import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ContentCard } from "@/components/feed/ContentCard";
import { StemFlowLogo } from "@/components/StemFlowLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
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
  ChevronUp,
} from "lucide-react";
import type { Content } from "@shared/schema";

const categories = [
  { value: "all", label: "Tout", icon: Flame },
  { value: "science", label: "Science", icon: Lightbulb },
  { value: "technology", label: "Tech", icon: Cpu },
  { value: "engineering", label: "Ingénierie", icon: Wrench },
  { value: "mathematics", label: "Maths", icon: Calculator },
];

function FeedContentItem({ content, index, onView, onJoinRoom, showLearnScore, observerRef }: {
  content: Content;
  index: number;
  onView: (id: string) => void;
  onJoinRoom: () => void;
  showLearnScore: boolean;
  observerRef: (el: HTMLDivElement | null) => void;
}) {
  useEffect(() => {
    onView(content.id);
  }, [content.id]);

  return (
    <div
      ref={observerRef}
      className="snap-feed-item flex flex-col"
      style={{ height: "calc(100vh - 90px - 60px)", minHeight: "calc(100vh - 90px - 60px)" }}
      data-index={index}
    >
      <div className="flex-1 overflow-y-auto p-3 flex items-start justify-center">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.05, 0.2), duration: 0.25 }}
        >
          <ContentCard
            content={content}
            onJoinRoom={onJoinRoom}
            showLearnScore={showLearnScore}
          />
        </motion.div>
      </div>
    </div>
  );
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  if (total <= 1) return null;
  const maxVisible = 7;
  let startIdx = 0;
  if (total > maxVisible) {
    startIdx = Math.max(0, Math.min(current - Math.floor(maxVisible / 2), total - maxVisible));
  }
  const visibleCount = Math.min(total, maxVisible);

  return (
    <div
      className="fixed right-2 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5"
      data-testid="progress-dots"
    >
      {Array.from({ length: visibleCount }).map((_, i) => {
        const actualIndex = startIdx + i;
        const isActive = actualIndex === current;
        const distance = Math.abs(actualIndex - current);
        return (
          <div
            key={actualIndex}
            className={`rounded-full transition-all duration-300 ${isActive
              ? "w-2 h-2 bg-accent shadow-sm"
              : distance <= 1
                ? "w-1.5 h-1.5 bg-muted-foreground/40"
                : "w-1 h-1 bg-muted-foreground/20"
              }`}
            data-testid={`progress-dot-${actualIndex}`}
          />
        );
      })}
    </div>
  );
}

function SwipeUpIndicator({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.div
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 0.6, 1], y: [0, -6, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      data-testid="swipe-up-indicator"
    >
      <ChevronUp className="h-5 w-5 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground font-medium">Swipe</span>
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    generateDailyQuests();
    checkWeekReset();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) {
              setCurrentIndex(idx);
            }
          }
        }
      },
      {
        root: containerRef.current,
        threshold: 0.6,
      }
    );

    const items = itemRefs.current;
    items.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [itemRefs.current.size]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (!hasScrolled && container.scrollTop > 20) {
        setHasScrolled(true);
      }
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasScrolled]);

  const setItemRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      itemRefs.current.set(index, el);
    } else {
      itemRefs.current.delete(index);
    }
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

  const baseContents = smartFeed && smartFeedMutation.data
    ? smartFeedMutation.data.contents
    : contents?.filter(
      (content: Content) => selectedCategory === "all" || content.category === selectedCategory
    ) || [];

  // Gamification Loop: Duplicate contents to simulate infinite scroll and keep user engaged
  const displayContents = [...baseContents, ...baseContents, ...baseContents].map((c, i) => ({
    ...c,
    uniqueInfiniteKey: `${c.id}-${i}`
  }));

  return (
    <div className="min-h-screen bg-background" data-testid="feed-page">
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
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={handleSmartFeedToggle}
            disabled={smartFeedMutation.isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${smartFeed
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${isSelected
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

      <div
        ref={containerRef}
        className="snap-feed-container relative"
        style={{ height: "calc(100vh - 90px - 60px)" }}
        data-testid="snap-feed-container"
      >
        {(isLoading || smartFeedMutation.isPending) ? (
          <div className="p-4 space-y-5 max-w-lg mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4 p-5 rounded-2xl glass-panel border-border/40 premium-shadow">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full skeleton-shimmer" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 rounded-md skeleton-shimmer" />
                    <div className="h-3 w-1/4 rounded-md skeleton-shimmer opacity-70" />
                  </div>
                </div>
                <div className="h-56 w-full rounded-xl skeleton-shimmer" />
                <div className="h-4 w-3/4 rounded-md skeleton-shimmer pt-2" />
              </div>
            ))}
          </div>
        ) : displayContents && displayContents.length > 0 ? (
          <>
            {displayContents.map((content: Content & { uniqueInfiniteKey?: string }, index: number) => (
              <FeedContentItem
                key={content.uniqueInfiniteKey || content.id}
                content={content}
                index={index}
                onView={trackContentView}
                onJoinRoom={() => setLocation(`/rooms/${content.roomId}`)}
                showLearnScore={smartFeed}
                observerRef={setItemRef(index)}
              />
            ))}
            <ProgressDots total={displayContents.length} current={currentIndex} />
            <SwipeUpIndicator visible={!hasScrolled} />
          </>
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
      </div>

      <BottomNav />
    </div>
  );
}
