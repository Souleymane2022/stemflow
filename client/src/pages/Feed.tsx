import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ContentCard } from "@/components/feed/ContentCard";
import { StemFlowLogo } from "@/components/StemFlowLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserState } from "@/lib/userState";
import {
  Home,
  Users,
  Target,
  User,
  Lightbulb,
  Cpu,
  Wrench,
  Calculator,
  Flame,
  Zap,
} from "lucide-react";
import type { Content } from "@shared/schema";

const categories = [
  { value: "all", label: "Tout", icon: Flame },
  { value: "science", label: "Science", icon: Lightbulb },
  { value: "technology", label: "Tech", icon: Cpu },
  { value: "engineering", label: "Ingénierie", icon: Wrench },
  { value: "mathematics", label: "Maths", icon: Calculator },
];

export default function Feed() {
  const [, setLocation] = useLocation();
  const { profile, xp, streak } = useUserState();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: contents, isLoading } = useQuery<Content[]>({
    queryKey: ["/api/feed", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === "all" 
        ? "/api/feed" 
        : `/api/feed?category=${selectedCategory}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch feed");
      return res.json();
    },
  });

  const filteredContents = contents?.filter(
    (content) => selectedCategory === "all" || content.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between p-4">
          <StemFlowLogo size="sm" showText={false} />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[#F5B700]">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-bold">{streak}</span>
            </div>
            <div className="flex items-center gap-1 text-accent">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-bold">{xp}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.value;
            return (
              <Button
                key={cat.value}
                variant={isSelected ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className={isSelected ? "gradient-stem text-white" : ""}
                data-testid={`button-category-${cat.value}`}
              >
                <Icon className="h-4 w-4 mr-1" />
                {cat.label}
              </Button>
            );
          })}
        </div>
      </header>

      {/* Feed Content */}
      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
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
        ) : filteredContents && filteredContents.length > 0 ? (
          filteredContents.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ContentCard
                content={content}
                onJoinRoom={() => setLocation(`/rooms/${content.roomId}`)}
              />
            </motion.div>
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <Button
            variant="ghost"
            className="flex-col gap-1 h-auto py-2 text-primary"
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
            className="flex-col gap-1 h-auto py-2"
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
