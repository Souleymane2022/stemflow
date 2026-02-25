import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUserState } from "@/lib/userState";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  FileText,
  Image as ImageIcon,
  Video,
  HelpCircle,
  Lightbulb,
  Cpu,
  Wrench,
  Calculator,
  Send,
  Brain,
  Sparkles,
} from "lucide-react";

const contentTypeConfig = {
  text_post: { label: "Publication Texte", icon: FileText, color: "from-[#0B3C5D] to-[#00C896]" },
  image_post: { label: "Partage d'Image", icon: ImageIcon, color: "from-[#00C896] to-[#0B3C5D]" },
  video: { label: "Vidéo Éducative", icon: Video, color: "from-[#F5B700] to-[#00C896]" },
  quiz: { label: "QCM Interactif", icon: HelpCircle, color: "from-[#0B3C5D] to-[#F5B700]" },
};

const categoryOptions = [
  { value: "science", label: "Science", icon: Lightbulb },
  { value: "technology", label: "Technologie", icon: Cpu },
  { value: "engineering", label: "Ingénierie", icon: Wrench },
  { value: "mathematics", label: "Mathématiques", icon: Calculator },
];

const difficultyOptions = [
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance", label: "Avancé" },
];

interface QuizQuestionForm {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export default function CreateContent() {
  const params = useParams<{ type: string }>();
  const contentType = params.type as keyof typeof contentTypeConfig;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addXp } = useUserState();

  const config = contentTypeConfig[contentType];
  if (!config) {
    setLocation("/feed");
    return null;
  }

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [textContent, setTextContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestionForm[]>([
    { question: "", options: ["", ""], correctOptionIndex: 0, explanation: "" },
  ]);
  const [aiAnalysis, setAiAnalysis] = useState<{
    detectedSubject: string;
    detectedDifficulty: string;
    suggestedTags: string[];
    summary: string;
    learnScore: number;
    pedagogicalFeedback: string;
    qualityIndicators: { clarity: number; accuracy: number; engagement: number; depth: number };
  } | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const contentText = contentType === "quiz"
        ? questions.map((q) => q.question).join("\n")
        : textContent || description || title;
      const res = await apiRequest("POST", "/api/ai/analyze-content", {
        title,
        content: contentText,
        contentType,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      if (data.detectedSubject && !category) setCategory(data.detectedSubject);
      if (data.detectedDifficulty && !difficulty) setDifficulty(data.detectedDifficulty);
      if (data.suggestedTags?.length > 0 && tags.length === 0) {
        setTags(data.suggestedTags);
      }
      toast({ title: "Analyse IA terminée", description: `LearnScore: ${data.learnScore}/100` });
    },
    onError: () => {
      toast({ title: "Erreur", description: "L'analyse IA n'est pas disponible pour le moment.", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/content", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      addXp(contentType === "quiz" ? 50 : 25);
      toast({ title: "Contenu publié !", description: "Tu as gagné des XP pour ta contribution." });
      setLocation("/feed");
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de publier le contenu.", variant: "destructive" });
    },
  });

  const addTag = () => {
    if (tagInput.trim()) {
      const tag = tagInput.trim().startsWith("#") ? tagInput.trim() : `#${tagInput.trim()}`;
      if (!tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", ""], correctOptionIndex: 0, explanation: "" }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof QuizQuestionForm, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    if (questions[qIndex].options.length < 6) {
      const updated = [...questions];
      updated[qIndex].options.push("");
      setQuestions(updated);
    }
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    if (questions[qIndex].options.length > 2) {
      const updated = [...questions];
      updated[qIndex].options.splice(oIndex, 1);
      if (updated[qIndex].correctOptionIndex >= updated[qIndex].options.length) {
        updated[qIndex].correctOptionIndex = 0;
      }
      setQuestions(updated);
    }
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const isFormValid = () => {
    if (!title.trim() || !category || !difficulty) return false;
    if (contentType === "text_post" && !textContent.trim()) return false;
    if (contentType === "quiz") {
      return questions.every(
        (q) => q.question.trim() && q.options.every((o) => o.trim()) && q.options.length >= 2
      );
    }
    return true;
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;

    const data: any = {
      contentType,
      title,
      description: description || undefined,
      category,
      difficulty,
      tags,
      xpReward: contentType === "quiz" ? 50 : 25,
      authorId: "current-user",
      authorName: "Moi",
    };

    if (contentType === "text_post") data.textContent = textContent;
    if (contentType === "image_post") data.imageUrl = imageUrl || "https://placeholder.com/image";
    if (contentType === "video") data.videoUrl = videoUrl || "https://placeholder.com/video";
    if (contentType === "quiz") data.questions = questions;

    createMutation.mutate(data);
  };

  const ContentIcon = config.icon;

  return (
    <div className="min-h-screen bg-background pb-6">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center gap-3 p-4">
          <Button className="interactive-element hover-elevate" variant="ghost" size="icon" onClick={() => setLocation("/feed")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
              <ContentIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold">{config.label}</h1>
          </div>
          <Button
            className="interactive-element hover-elevate gradient-stem text-white"
            disabled={!isFormValid() || createMutation.isPending}
            onClick={handleSubmit}
            data-testid="button-publish"
          >
            <Send className="h-4 w-4 mr-2" />
            {createMutation.isPending ? "Publication..." : "Publier"}
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <Card className="glass-panel premium-shadow border-0 p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Titre</label>
            <Input
              placeholder="Donne un titre accrocheur..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-title"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Description (optionnel)</label>
            <Textarea
              placeholder="Décris ton contenu..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={2}
              data-testid="input-description"
            />
          </div>
        </Card>

        {contentType === "text_post" && (
          <Card className="glass-panel premium-shadow border-0 p-4">
            <label className="text-sm font-medium mb-1.5 block">Contenu</label>
            <Textarea
              placeholder="Rédige ton article... (LaTeX supporté avec $formula$)"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="resize-none min-h-[200px]"
              rows={8}
              data-testid="input-text-content"
            />
          </Card>
        )}

        {contentType === "image_post" && (
          <Card className="glass-panel premium-shadow border-0 p-4 space-y-3">
            <label className="text-sm font-medium mb-1.5 block">Image</label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Glisse une image ici ou clique pour upload</p>
              <Button className="interactive-element hover-elevate" variant="outline" data-testid="button-upload-image">
                Choisir une image
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Ou URL de l'image</label>
              <Input
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                data-testid="input-image-url"
              />
            </div>
          </Card>
        )}

        {contentType === "video" && (
          <Card className="glass-panel premium-shadow border-0 p-4 space-y-3">
            <label className="text-sm font-medium mb-1.5 block">Vidéo</label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Format vertical, 60-120 secondes</p>
              <Button className="interactive-element hover-elevate" variant="outline" data-testid="button-upload-video">
                Choisir une vidéo
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Ou URL de la vidéo</label>
              <Input
                placeholder="https://..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                data-testid="input-video-url"
              />
            </div>
          </Card>
        )}

        {contentType === "quiz" && (
          <div className="space-y-4">
            {questions.map((q, qIndex) => (
              <Card key={qIndex} className="glass-panel premium-shadow border-0 p-4 space-y-3" data-testid={`quiz-question-${qIndex}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <Button className="interactive-element hover-elevate"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(qIndex)}
                      data-testid={`button-remove-question-${qIndex}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <Input
                  placeholder="Pose ta question..."
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                  data-testid={`input-question-${qIndex}`}
                />

                <div className="space-y-2">
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          q.correctOptionIndex === oIndex
                            ? "border-accent bg-accent text-white"
                            : "border-muted-foreground/30"
                        }`}
                        onClick={() => updateQuestion(qIndex, "correctOptionIndex", oIndex)}
                        data-testid={`button-correct-${qIndex}-${oIndex}`}
                      >
                        {q.correctOptionIndex === oIndex && <Check className="h-3 w-3" />}
                      </button>
                      <Input
                        placeholder={`Option ${oIndex + 1}`}
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className="flex-1"
                        data-testid={`input-option-${qIndex}-${oIndex}`}
                      />
                      {q.options.length > 2 && (
                        <Button className="interactive-element hover-elevate"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(qIndex, oIndex)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {q.options.length < 6 && (
                    <Button className="interactive-element hover-elevate"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(qIndex)}
                      className="w-full"
                      data-testid={`button-add-option-${qIndex}`}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter une option
                    </Button>
                  )}
                </div>

                <Input
                  placeholder="Explication (optionnel)"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                  data-testid={`input-explanation-${qIndex}`}
                />
              </Card>
            ))}

            <Button
              variant="outline"
              onClick={addQuestion}
              className="interactive-element hover-elevate w-full"
              data-testid="button-add-question"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une question
            </Button>
          </div>
        )}

        <Card className="glass-panel premium-shadow border-0 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-accent" />
              Analyse IA
            </h3>
            <Button className="interactive-element hover-elevate"
              variant="outline"
              size="sm"
              onClick={() => analyzeMutation.mutate()}
              disabled={!title.trim() || analyzeMutation.isPending}
              data-testid="button-ai-analyze"
            >
              <Sparkles className={`h-3.5 w-3.5 mr-1 ${analyzeMutation.isPending ? "animate-spin" : ""}`} />
              {analyzeMutation.isPending ? "Analyse..." : "Analyser"}
            </Button>
          </div>

          {analyzeMutation.isPending && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}

          {aiAnalysis && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-accent/10">
                <span className="text-sm font-medium">LearnScore</span>
                <span className="text-sm font-bold text-accent">{aiAnalysis.learnScore}/100</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(aiAnalysis.qualityIndicators).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {key === "clarity" ? "Clarté" : key === "accuracy" ? "Précision" : key === "engagement" ? "Engagement" : "Profondeur"}
                      </span>
                      <span className="font-medium">{value}%</span>
                    </div>
                    <Progress value={value} className="h-1.5" />
                  </div>
                ))}
              </div>
              {aiAnalysis.pedagogicalFeedback && (
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                  {aiAnalysis.pedagogicalFeedback}
                </p>
              )}
            </div>
          )}
        </Card>

        <Card className="glass-panel premium-shadow border-0 p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Matière</label>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    category === cat.value
                      ? "border-accent bg-accent/10"
                      : "border-border"
                  }`}
                  onClick={() => setCategory(cat.value)}
                  data-testid={`button-category-${cat.value}`}
                >
                  <cat.icon className={`h-4 w-4 ${category === cat.value ? "text-accent" : "text-muted-foreground"}`} />
                  <span className="text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Niveau</label>
            <div className="flex gap-2">
              {difficultyOptions.map((diff) => (
                <button
                  key={diff.value}
                  type="button"
                  className={`flex-1 p-2.5 rounded-lg border text-sm transition-colors ${
                    difficulty === diff.value
                      ? "border-accent bg-accent/10 font-medium"
                      : "border-border"
                  }`}
                  onClick={() => setDifficulty(diff.value)}
                  data-testid={`button-difficulty-${diff.value}`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="#Maths #Physique #IA"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="flex-1"
                data-testid="input-tag"
              />
              <Button className="interactive-element hover-elevate" variant="outline" onClick={addTag} data-testid="button-add-tag">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <Trash2 className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
