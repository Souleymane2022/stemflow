import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import type { Content } from "@shared/schema";

interface ContentCardProps {
  content: Content;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onJoinRoom?: () => void;
}

const contentTypeIcons = {
  video: Play,
  text_post: FileText,
  image_post: ImageIcon,
  quiz: HelpCircle,
  infographic: BarChart2,
};

const categoryColors = {
  science: "from-[#0B3C5D] to-[#00C896]",
  technology: "from-[#00C896] to-[#0B3C5D]",
  engineering: "from-[#F5B700] to-[#00C896]",
  mathematics: "from-[#0B3C5D] to-[#F5B700]",
};

const difficultyLabels = {
  debutant: { label: "Débutant", color: "bg-accent/20 text-accent" },
  intermediaire: { label: "Intermédiaire", color: "bg-[#F5B700]/20 text-[#F5B700]" },
  avance: { label: "Avancé", color: "bg-primary/20 text-primary" },
};

export function ContentCard({
  content,
  onLike,
  onComment,
  onShare,
  onSave,
  onJoinRoom,
}: ContentCardProps) {
  const [, setLocation] = useLocation();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(content.likes ?? 0);

  const ContentIcon = contentTypeIcons[content.contentType];
  const gradientColor = categoryColors[content.category];
  const difficulty = difficultyLabels[content.difficulty];

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    onLike?.();
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden" data-testid={`content-card-${content.id}`}>
        {/* Content Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={content.authorAvatar} />
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

        {/* Content Body */}
        <div className="relative">
          {content.contentType === "video" && content.videoUrl && (
            <div className="aspect-video bg-muted relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-20`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-4 rounded-full bg-white/90 dark:bg-black/80">
                  <Play className="h-8 w-8 text-primary fill-primary" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                3:45
              </div>
            </div>
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

        {/* Content Info */}
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

          {/* Room Badge */}
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={liked ? "text-red-500" : ""}
                data-testid={`button-like-${content.id}`}
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
                <span className="ml-1 text-sm">{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onComment}
                data-testid={`button-comment-${content.id}`}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="ml-1 text-sm">{content.comments ?? 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                data-testid={`button-share-${content.id}`}
              >
                <Share2 className="h-5 w-5" />
                <span className="ml-1 text-sm">{content.shares ?? 0}</span>
              </Button>
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
        </div>
      </Card>
    </motion.div>
  );
}
