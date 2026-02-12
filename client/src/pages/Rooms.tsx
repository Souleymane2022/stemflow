import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { StemFlowLogo } from "@/components/StemFlowLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import {
  Users,
  Lightbulb,
  Cpu,
  Wrench,
  Calculator,
  Lock,
  Globe,
  ChevronRight,
  Plus,
  Zap,
  Flame,
} from "lucide-react";
import type { Room } from "@shared/schema";
import { useUserState } from "@/lib/userState";

const categoryIcons = {
  science: Lightbulb,
  technology: Cpu,
  engineering: Wrench,
  mathematics: Calculator,
};

const categoryColors = {
  science: "from-blue-500 to-cyan-400",
  technology: "from-purple-500 to-pink-400",
  engineering: "from-orange-500 to-yellow-400",
  mathematics: "from-green-500 to-emerald-400",
};

export default function Rooms() {
  const [, setLocation] = useLocation();
  const { xp, streak } = useUserState();

  const { data: rooms, isLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold">Salons</h1>
            <p className="text-sm text-muted-foreground">Rejoins une communauté</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-bold">{streak}</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-bold">{xp}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Rooms List */}
      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Create Room Button */}
        <Button
          className="w-full gradient-stem text-white"
          data-testid="button-create-room"
        >
          <Plus className="h-4 w-4 mr-2" />
          Créer un salon
        </Button>

        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </>
        ) : rooms && rooms.length > 0 ? (
          rooms.map((room, index) => {
            const CategoryIcon = categoryIcons[room.category];
            const gradientColor = categoryColors[room.category];
            
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="p-4 hover-elevate cursor-pointer"
                  onClick={() => setLocation(`/rooms/${room.id}`)}
                  data-testid={`room-card-${room.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${gradientColor}`}>
                      <CategoryIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{room.name}</h3>
                        {room.type === "private" ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {room.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {room.memberCount} membres
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {room.category}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun salon</h3>
            <p className="text-muted-foreground mb-4">
              Sois le premier à créer un salon !
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
