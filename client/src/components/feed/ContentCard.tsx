import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useUserState } from "@/lib/userState";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useDailyQuests } from "@/lib/dailyQuests";
import { useLeagueState } from "@/lib/leagues";
import { celebrateXpGain, celebrateMissionComplete } from "@/lib/celebrations";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  BarChart2,
  Users,
  Zap,
  ChevronRight,
  Brain,
  ChevronDown,
  ChevronUp,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { SiFacebook, SiWhatsapp, SiLinkedin } from "react-icons/si";
import type { Content, Comment } from "@shared/schema";

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function VideoPlayer({ url, gradientColor, contentId }: { url: string; gradientColor: string; contentId: string }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useState<HTMLVideoElement | null>(null);
  const youtubeId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);

  if (youtubeId) {
    return (
      <div className="aspect-video bg-black relative overflow-hidden" data-testid={`video-player-${contentId}`}>
        {!playing ? (
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={() => setPlaying(true)}
          >
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-20`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-4 rounded-full bg-white/90 dark:bg-black/80 group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-primary fill-primary" />
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video"
          />
        )}
      </div>
    );
  }

  if (vimeoId) {
    return (
      <div className="aspect-video bg-black relative overflow-hidden" data-testid={`video-player-${contentId}`}>
        {!playing ? (
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={() => setPlaying(true)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-30`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-4 rounded-full bg-white/90 dark:bg-black/80 group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-primary fill-primary" />
              </div>
            </div>
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-sm text-white font-medium bg-black/40 px-3 py-1 rounded-full">
                Appuyer pour lire
              </span>
            </div>
          </div>
        ) : (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Video"
          />
        )}
      </div>
    );
  }

  if (isDirectVideo(url)) {
    return (
      <div className="aspect-video bg-black relative overflow-hidden" data-testid={`video-player-${contentId}`}>
        {!playing ? (
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={() => setPlaying(true)}
            data-testid={`video-play-button-${contentId}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-30`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-4 rounded-full bg-white/90 dark:bg-black/80 group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-primary fill-primary" />
              </div>
            </div>
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-sm text-white font-medium bg-black/40 px-3 py-1 rounded-full">
                Appuyer pour lire
              </span>
            </div>
          </div>
        ) : (
          <video
            ref={(el) => {
              if (el && !videoRef[0]) {
                videoRef[0] = el;
                el.play().catch(() => {});
              }
            }}
            src={url}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            data-testid={`video-element-${contentId}`}
          />
        )}
      </div>
    );
  }

  return (
    <div className="aspect-video bg-muted relative overflow-hidden" data-testid={`video-player-${contentId}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-20`} />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 group"
      >
        <div className="p-4 rounded-full bg-white/90 dark:bg-black/80 group-hover:scale-110 transition-transform">
          <Play className="h-8 w-8 text-primary fill-primary" />
        </div>
        <span className="text-sm text-foreground/80 font-medium">Regarder la vidéo</span>
      </a>
    </div>
  );
}

interface ContentCardProps {
  content: Content & { userLiked?: boolean };
  onJoinRoom?: () => void;
  showLearnScore?: boolean;
}

const contentTypeIcons: Record<string, typeof Play> = {
  video: Play,
  text_post: FileText,
  image_post: ImageIcon,
  quiz: HelpCircle,
  infographic: BarChart2,
};

const categoryColors: Record<string, string> = {
  science: "from-[#0B3C5D] to-[#00C896]",
  technology: "from-[#00C896] to-[#0B3C5D]",
  engineering: "from-[#F5B700] to-[#00C896]",
  mathematics: "from-[#0B3C5D] to-[#F5B700]",
};

const difficultyLabels: Record<string, { label: string; color: string }> = {
  debutant: { label: "Débutant", color: "bg-accent/20 text-accent" },
  intermediaire: { label: "Intermédiaire", color: "bg-[#F5B700]/20 text-[#F5B700]" },
  avance: { label: "Avancé", color: "bg-primary/20 text-primary" },
};

export function ContentCard({
  content,
  onJoinRoom,
  showLearnScore = false,
}: ContentCardProps) {
  const [, setLocation] = useLocation();
  const { userId, addXp } = useUserState();
  const { toast } = useToast();
  const { updateQuestProgress } = useDailyQuests();
  const { addWeeklyXp } = useLeagueState();
  const [liked, setLiked] = useState(content.userLiked || false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(content.likes ?? 0);
  const [shareCount, setShareCount] = useState(content.shares ?? 0);
  const [commentCount, setCommentCount] = useState(content.comments ?? 0);
  const [showDetails, setShowDetails] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [commentText, setCommentText] = useState("");

  const ContentIcon = contentTypeIcons[content.contentType] || FileText;
  const gradientColor = categoryColors[content.category] || categoryColors.science;
  const difficulty = difficultyLabels[content.difficulty] || difficultyLabels.debutant;

  const { data: learnScoreData } = useQuery<{
    learnScore: number;
    qualityIndicators: { clarity: number; accuracy: number; engagement: number; depth: number };
    pedagogicalFeedback: string;
  }>({
    queryKey: ["/api/ai/learnscore", content.id],
    enabled: showLearnScore,
  });

  const { data: comments, refetch: refetchComments } = useQuery<Comment[]>({
    queryKey: ["/api/content", content.id, "comments"],
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/content/${content.id}/like`);
      return res.json();
    },
    onSuccess: (data: { liked: boolean; likeCount: number }) => {
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", `/api/content/${content.id}/comments`, { text });
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      setCommentCount((c) => c + 1);
      refetchComments();
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      setCommentCount((c) => Math.max(0, c - 1));
      refetchComments();
    },
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/content/${content.id}/share`);
      return res.json();
    },
    onSuccess: (data) => {
      setShareCount(data.shares);
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
    if (!liked) {
      const completed = updateQuestProgress("like_content");
      if (completed) {
        celebrateMissionComplete();
        addWeeklyXp(completed.xpReward);
        addXp(completed.xpReward);
        toast({ title: "Quête complétée !", description: `+${completed.xpReward} XP - ${completed.title}` });
      }
    }
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
      const completed = updateQuestProgress("comment");
      if (completed) {
        celebrateMissionComplete();
        addWeeklyXp(completed.xpReward);
        addXp(completed.xpReward);
        toast({ title: "Quête complétée !", description: `+${completed.xpReward} XP - ${completed.title}` });
      }
    }
  };

  const shareUrl = `${window.location.origin}/content/${content.id}`;
  const shareTitle = content.title;
  const shareText = content.description || content.title;

  const handleShare = async (platform?: string) => {
    shareMutation.mutate();
    const completed = updateQuestProgress("share");
    if (completed) {
      celebrateMissionComplete();
      addWeeklyXp(completed.xpReward);
      addXp(completed.xpReward);
      toast({ title: "Quête complétée !", description: `+${completed.xpReward} XP - ${completed.title}` });
    }

    if (!platform && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        toast({ title: "Partagé !", description: "Contenu partagé avec succès" });
        setShowShareMenu(false);
        return;
      } catch {}
    }

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedText = encodeURIComponent(shareText);

    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
      toast({ title: "Lien ouvert", description: `Partage via ${platform}` });
    }
    setShowShareMenu(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden" data-testid={`content-card-${content.id}`}>
        <div className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={content.authorAvatar ?? undefined} />
              <AvatarFallback className="gradient-stem text-white text-sm">
                {content.authorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{content.authorName}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  <ContentIcon className="h-3 w-3 mr-1" />
                  {content.contentType.replace("_", " ")}
                </Badge>
                <Badge className={`text-xs ${difficulty.color}`}>
                  {difficulty.label}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-semibold">+{content.xpReward} XP</span>
            </div>
          </div>
        </div>

        <div className="relative">
          {content.contentType === "video" && content.videoUrl && (
            <VideoPlayer
              url={content.videoUrl}
              gradientColor={gradientColor}
              contentId={content.id}
            />
          )}

          {content.contentType === "image_post" && content.imageUrl && (
            <div className="aspect-video bg-muted relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-30`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-white/50" />
              </div>
            </div>
          )}

          {content.contentType === "text_post" && (
            <div className={`p-6 bg-gradient-to-br ${gradientColor} min-h-[200px] flex items-center justify-center`}>
              <p className="text-white text-lg font-medium text-center line-clamp-4 px-4">
                {content.textContent || content.description}
              </p>
            </div>
          )}

          {content.contentType === "quiz" && (
            <div
              className="p-6 bg-gradient-to-br from-[#F5B700] to-[#00C896] min-h-[200px] flex flex-col items-center justify-center gap-4 cursor-pointer"
              onClick={() => setLocation(`/quiz/${content.id}`)}
            >
              <HelpCircle className="h-12 w-12 text-white" />
              <p className="text-white text-lg font-semibold text-center">
                Quiz disponible
              </p>
              <Button
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
                data-testid={`button-play-quiz-${content.id}`}
              >
                Commencer le quiz
              </Button>
            </div>
          )}

          {content.contentType === "infographic" && (
            <div className="p-6 bg-gradient-to-br from-[#0B3C5D] to-[#00C896] min-h-[200px] flex flex-col items-center justify-center gap-4">
              <BarChart2 className="h-12 w-12 text-white" />
              <p className="text-white text-lg font-semibold text-center">
                Infographie
              </p>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 line-clamp-2">{content.title}</h3>
          {content.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
              {content.description}
            </p>
          )}

          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {content.tags.map((tag) => (
                <span key={tag} className="text-xs text-accent font-medium">{tag}</span>
              ))}
            </div>
          )}

          {content.roomName && (
            <button
              onClick={onJoinRoom}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 mb-3 w-full text-left hover-elevate"
              data-testid={`button-join-room-${content.roomId}`}
            >
              <div className={`p-1.5 rounded-md bg-gradient-to-br ${gradientColor}`}>
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{content.roomName}</p>
                <p className="text-xs text-muted-foreground">Rejoindre le salon</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}

          {showLearnScore && learnScoreData && (
            <div className="mb-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-between gap-2 w-full p-2 rounded-lg bg-accent/5 border border-accent/10"
                data-testid={`button-learnscore-${content.id}`}
              >
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">LearnScore</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-accent">
                    {learnScoreData.learnScore}/100
                  </span>
                  {showDetails ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-2 p-3 rounded-lg bg-muted/30 space-y-2"
                >
                  {Object.entries(learnScoreData.qualityIndicators).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground capitalize">
                          {key === "clarity" ? "Clarté" : key === "accuracy" ? "Précision" : key === "engagement" ? "Engagement" : "Profondeur"}
                        </span>
                        <span className="font-medium">{value}%</span>
                      </div>
                      <Progress value={value} className="h-1.5" />
                    </div>
                  ))}
                  {learnScoreData.pedagogicalFeedback && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                      {learnScoreData.pedagogicalFeedback}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-1 pt-2 border-t">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={liked ? "text-red-500" : ""}
                disabled={likeMutation.isPending}
                data-testid={`button-like-${content.id}`}
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
                <span className="ml-1 text-sm">{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className={showComments ? "text-accent" : ""}
                data-testid={`button-comment-${content.id}`}
              >
                <MessageCircle className={`h-5 w-5 ${showComments ? "fill-current" : ""}`} />
                <span className="ml-1 text-sm">{commentCount}</span>
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  data-testid={`button-share-${content.id}`}
                >
                  <Share2 className="h-5 w-5" />
                  <span className="ml-1 text-sm">{shareCount}</span>
                </Button>

                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute bottom-full left-0 mb-2 p-2 rounded-lg bg-card border shadow-lg z-20 min-w-[200px]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b">
                        <span className="text-xs font-medium text-muted-foreground">Partager via</span>
                        <button onClick={() => setShowShareMenu(false)} data-testid="button-close-share">
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          onClick={() => handleShare("facebook")}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover-elevate"
                          data-testid={`button-share-facebook-${content.id}`}
                        >
                          <SiFacebook className="h-5 w-5 text-[#1877F2]" />
                          <span className="text-[10px] text-muted-foreground">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare("twitter")}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover-elevate"
                          data-testid={`button-share-twitter-${content.id}`}
                        >
                          <X className="h-5 w-5" />
                          <span className="text-[10px] text-muted-foreground">X</span>
                        </button>
                        <button
                          onClick={() => handleShare("whatsapp")}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover-elevate"
                          data-testid={`button-share-whatsapp-${content.id}`}
                        >
                          <SiWhatsapp className="h-5 w-5 text-[#25D366]" />
                          <span className="text-[10px] text-muted-foreground">WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleShare("linkedin")}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover-elevate"
                          data-testid={`button-share-linkedin-${content.id}`}
                        >
                          <SiLinkedin className="h-5 w-5 text-[#0A66C2]" />
                          <span className="text-[10px] text-muted-foreground">LinkedIn</span>
                        </button>
                      </div>
                      {typeof navigator.share === "function" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleShare()}
                          data-testid={`button-share-native-${content.id}`}
                        >
                          <Share2 className="h-3.5 w-3.5 mr-1" />
                          Partager...
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={saved ? "text-primary" : ""}
              data-testid={`button-save-${content.id}`}
            >
              <Bookmark className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
            </Button>
          </div>

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 pt-3 border-t overflow-hidden"
              >
                <form
                  onSubmit={handleSubmitComment}
                  className="flex items-center gap-2 mb-3"
                >
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 text-sm"
                    maxLength={500}
                    data-testid={`input-comment-${content.id}`}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!commentText.trim() || commentMutation.isPending}
                    data-testid={`button-submit-comment-${content.id}`}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {!comments ? (
                    <div className="text-center py-3">
                      <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mx-auto" />
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-3">
                      Aucun commentaire. Sois le premier !
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex gap-2 p-2 rounded-lg bg-muted/30"
                        data-testid={`comment-${comment.id}`}
                      >
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarFallback className="text-xs gradient-stem text-white">
                            {comment.authorName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold truncate">{comment.authorName}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </span>
                              {comment.userId === userId && (
                                <button
                                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                                  className="text-muted-foreground/50 hover:text-destructive transition-colors"
                                  data-testid={`button-delete-comment-${comment.id}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-snug">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
