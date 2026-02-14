import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUserState } from "@/lib/userState";
import { useDailyQuests } from "@/lib/dailyQuests";
import { useLeagueState } from "@/lib/leagues";
import { celebrateMissionComplete } from "@/lib/celebrations";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Trophy,
  Swords,
  Zap,
  Lightbulb,
  Cpu,
  Wrench,
  Calculator,
  Star,
  Send,
  Heart,
  Clock,
} from "lucide-react";
import type { Room, Content } from "@shared/schema";

interface RoomPost {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  text: string;
  likes: number;
  createdAt: string;
}

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

const roleLabels = {
  apprenant: { label: "Apprenant", color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
  challenger: { label: "Challenger", color: "bg-purple-500/20 text-purple-600 dark:text-purple-400" },
  mentor: { label: "Mentor", color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
  moderateur: { label: "Modérateur", color: "bg-red-500/20 text-red-600 dark:text-red-400" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "maintenant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default function RoomDetail() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { xp, streak, addXp, userId, user } = useUserState();
  const { toast } = useToast();
  const { generateDailyQuests, updateQuestProgress } = useDailyQuests();
  const { addWeeklyXp } = useLeagueState();
  const [postText, setPostText] = useState("");

  useEffect(() => {
    generateDailyQuests();
    const completed = updateQuestProgress("visit_room");
    if (completed) {
      celebrateMissionComplete();
      addWeeklyXp(completed.xpReward);
      addXp(completed.xpReward);
      toast({ title: "Quête complétée !", description: `+${completed.xpReward} XP - ${completed.title}` });
    }
  }, [params.id]);

  const { data: room, isLoading } = useQuery<Room>({
    queryKey: ["/api/rooms", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/rooms/${params.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch room");
      return res.json();
    },
    enabled: !!params.id,
  });

  const { data: roomContent } = useQuery<Content[]>({
    queryKey: ["/api/rooms", params.id, "content"],
    queryFn: async () => {
      const res = await fetch(`/api/rooms/${params.id}/content`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch room content");
      return res.json();
    },
    enabled: !!params.id,
  });

  const { data: roomPosts, isLoading: postsLoading } = useQuery<RoomPost[]>({
    queryKey: ["/api/rooms", params.id, "posts"],
    queryFn: async () => {
      const res = await fetch(`/api/rooms/${params.id}/posts`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch room posts");
      return res.json();
    },
    enabled: !!params.id,
  });

  const createPostMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", `/api/rooms/${params.id}/posts`, { text });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", params.id, "posts"] });
      setPostText("");
      toast({ title: "Publication envoyée !" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de publier le message", variant: "destructive" });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await apiRequest("POST", `/api/room-posts/${postId}/like`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", params.id, "posts"] });
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/rooms/${params.id}/join`, {
        userId: userId,
        role: "apprenant",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", params.id] });
      toast({ title: "Bienvenue !", description: "Tu as rejoint le salon avec succes." });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de rejoindre le salon", variant: "destructive" });
    },
  });

  const handleSubmitPost = () => {
    if (postText.trim()) {
      createPostMutation.mutate(postText.trim());
    }
  };

  const quizContent = roomContent?.find((c) => c.contentType === "quiz");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-40 w-full rounded-lg mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Salon introuvable</h2>
          <p className="text-muted-foreground mb-4">Ce salon n'existe pas ou a été supprimé.</p>
          <Button onClick={() => setLocation("/rooms")} data-testid="button-back-rooms">
            Retour aux salons
          </Button>
        </Card>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[room.category];
  const gradientColor = categoryColors[room.category];

  const leaderboard = [
    { name: "Marie L.", xp: 2450, role: "mentor" },
    { name: "Thomas R.", xp: 1820, role: "challenger" },
    { name: "Julie M.", xp: 1540, role: "challenger" },
    { name: "Lucas D.", xp: 1280, role: "apprenant" },
    { name: "Emma B.", xp: 980, role: "apprenant" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/rooms")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold truncate">{room.name}</h1>
            <p className="text-sm text-muted-foreground">{room.memberCount} membres</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-primary">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-bold">{xp}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className={`h-32 bg-gradient-to-br ${gradientColor} relative`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div className="p-3 rounded-md bg-white/20 backdrop-blur-sm">
            <CategoryIcon className="h-8 w-8 text-white" />
          </div>
          <div className="text-white">
            <h2 className="text-xl font-bold">{room.name}</h2>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {room.category}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 border-b">
        <p className="text-muted-foreground">{room.description}</p>
        <Button
          className="w-full mt-4 gradient-stem text-white"
          data-testid="button-join-room"
          onClick={() => joinRoomMutation.mutate()}
          disabled={joinRoomMutation.isPending}
        >
          <Users className="h-4 w-4 mr-2" />
          {joinRoomMutation.isPending ? "Rejoindre..." : "Rejoindre le salon"}
        </Button>
      </div>

      <Tabs defaultValue="publications" className="p-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="publications" data-testid="tab-publications">
            <MessageCircle className="h-4 w-4 mr-1" />
            Publications
          </TabsTrigger>
          <TabsTrigger value="challenges" data-testid="tab-challenges">
            <Swords className="h-4 w-4 mr-1" />
            Défis
          </TabsTrigger>
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
            <Trophy className="h-4 w-4 mr-1" />
            Classement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="publications" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="gradient-stem text-white text-sm">
                  {user?.username?.slice(0, 2).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Partage une idée, une question..."
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="resize-none border-0 text-base focus-visible:ring-0"
                  rows={2}
                  data-testid="input-room-post"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitPost}
                    disabled={!postText.trim() || createPostMutation.isPending}
                    data-testid="button-submit-post"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {createPostMutation.isPending ? "Envoi..." : "Publier"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {postsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-md" />
              ))}
            </div>
          ) : roomPosts && roomPosts.length > 0 ? (
            roomPosts.map((post) => (
              <Card key={post.id} className="p-4" data-testid={`room-post-${post.id}`}>
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="gradient-stem text-white text-sm">
                      {post.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold" data-testid={`text-username-${post.id}`}>{post.username}</p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(post.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm mt-1" data-testid={`text-post-${post.id}`}>{post.text}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likePostMutation.mutate(post.id)}
                        disabled={likePostMutation.isPending}
                        data-testid={`button-like-post-${post.id}`}
                        className="gap-1"
                      >
                        <Heart className="h-4 w-4" />
                        <span data-testid={`text-likes-${post.id}`}>{post.likes}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Pas encore de publications</h3>
              <p className="text-muted-foreground text-sm">
                Sois le premier à publier dans ce salon !
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="challenges" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-md gradient-stem">
                <Swords className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Défi hebdomadaire</h3>
                <p className="text-sm text-muted-foreground">Résous 5 problèmes de maths</p>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                <Zap className="h-3 w-3 mr-1" />
                200 XP
              </Badge>
            </div>
            <Button
              variant="outline"
              className="w-full"
              data-testid="button-join-challenge"
              onClick={() => joinRoomMutation.mutate()}
              disabled={joinRoomMutation.isPending}
            >
              {joinRoomMutation.isPending ? "Participation..." : "Participer au défi"}
            </Button>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-md bg-gradient-to-br from-purple-500 to-pink-500">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Quiz du jour</h3>
                <p className="text-sm text-muted-foreground">Teste tes connaissances</p>
              </div>
              <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <Zap className="h-3 w-3 mr-1" />
                50 XP
              </Badge>
            </div>
            <Button
              variant="outline"
              className="w-full"
              data-testid="button-play-quiz"
              onClick={() => {
                if (quizContent) {
                  setLocation(`/quiz/${quizContent.id}`);
                } else {
                  toast({ title: "Aucun quiz disponible", description: "Ce salon n'a pas encore de quiz." });
                }
              }}
            >
              Jouer le quiz
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top contributeurs
            </h3>
            <div className="space-y-3">
              {leaderboard.map((user, index) => {
                const roleInfo = roleLabels[user.role as keyof typeof roleLabels];
                return (
                  <div
                    key={user.name}
                    className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                          : index === 2
                          ? "bg-gradient-to-br from-amber-600 to-orange-700 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="gradient-stem text-white text-sm">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <Badge className={`text-xs ${roleInfo.color}`}>
                        {roleInfo.label}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary">
                        <Zap className="h-4 w-4" />
                        <span className="font-bold">{user.xp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
