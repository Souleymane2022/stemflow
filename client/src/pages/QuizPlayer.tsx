import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useUserState } from "@/lib/userState";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  Check,
  X,
  ChevronRight,
  Trophy,
  Zap,
  RotateCcw,
  Home,
  Star,
} from "lucide-react";
import type { QuizQuestion, Content } from "@shared/schema";

export default function QuizPlayer() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addXp } = useUserState();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const { data: content } = useQuery<Content>({
    queryKey: ["/api/content", params.id],
  });

  const { data: questions, isLoading } = useQuery<QuizQuestion[]>({
    queryKey: ["/api/content", params.id, "quiz"],
  });

  const submitMutation = useMutation({
    mutationFn: async (answers: number[]) => {
      const res = await apiRequest("POST", `/api/content/${params.id}/quiz/submit`, {
        userId: "current-user",
        answers,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setQuizResult(data);
      setShowResult(true);
      const xpEarned = Math.round((data.score / data.totalQuestions) * (content?.xpReward || 50));
      addXp(xpEarned);
      toast({ title: `+${xpEarned} XP`, description: `Score: ${data.score}/${data.totalQuestions}` });
    },
  });

  if (isLoading || !questions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement du quiz...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Aucune question disponible.</p>
        <Button onClick={() => setLocation("/feed")} data-testid="button-back-feed">
          Retour au feed
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const selectAnswer = (optionIndex: number) => {
    if (showResult) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitMutation.mutate(selectedAnswers);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setQuizResult(null);
  };

  if (showResult && quizResult) {
    const percentage = Math.round((quizResult.score / quizResult.totalQuestions) * 100);
    const isPerfect = quizResult.score === quizResult.totalQuestions;

    return (
      <div className="min-h-screen bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto space-y-4 pt-8"
        >
          <Card className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`inline-flex p-6 rounded-full mb-4 ${
                isPerfect ? "gradient-energy" : percentage >= 50 ? "gradient-stem" : "bg-muted"
              }`}
            >
              {isPerfect ? (
                <Star className="h-12 w-12 text-white" />
              ) : (
                <Trophy className="h-12 w-12 text-white" />
              )}
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">
              {isPerfect ? "Parfait !" : percentage >= 70 ? "Bien joué !" : percentage >= 50 ? "Pas mal !" : "Continue !"}
            </h2>

            <div className="text-4xl font-bold mb-2" data-testid="text-quiz-score">
              {quizResult.score}/{quizResult.totalQuestions}
            </div>
            <p className="text-muted-foreground mb-4">{percentage}% de bonnes réponses</p>

            <div className="flex items-center justify-center gap-2 text-accent mb-6">
              <Zap className="h-5 w-5" />
              <span className="font-bold text-lg">
                +{Math.round((quizResult.score / quizResult.totalQuestions) * (content?.xpReward || 50))} XP
              </span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetQuiz} data-testid="button-retry">
                <RotateCcw className="h-4 w-4 mr-2" />
                Recommencer
              </Button>
              <Button className="flex-1 gradient-stem text-white" onClick={() => setLocation("/feed")} data-testid="button-feed">
                <Home className="h-4 w-4 mr-2" />
                Feed
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Résultats détaillés</h3>
            {quizResult.questions.map((q: any, i: number) => (
              <Card key={i} className="p-4" data-testid={`result-question-${i}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 p-1 rounded-full ${q.isCorrect ? "bg-accent/20" : "bg-destructive/20"}`}>
                    {q.isCorrect ? (
                      <Check className="h-4 w-4 text-accent" />
                    ) : (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-1">{q.question}</p>
                    <p className="text-sm text-muted-foreground">
                      Ta réponse : {q.options[q.userAnswer]}
                    </p>
                    {!q.isCorrect && (
                      <p className="text-sm text-accent mt-1">
                        Bonne réponse : {q.options[q.correctOptionIndex]}
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-xs text-muted-foreground mt-2 italic">{q.explanation}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/feed")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold truncate">{content?.title || "Quiz"}</h1>
            <p className="text-xs text-muted-foreground">
              Question {currentIndex + 1}/{questions.length}
            </p>
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-6" data-testid={`text-question-${currentIndex}`}>
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, oIndex) => (
                  <button
                    key={oIndex}
                    type="button"
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswers[currentIndex] === oIndex
                        ? "border-accent bg-accent/10"
                        : "border-border hover-elevate"
                    }`}
                    onClick={() => selectAnswer(oIndex)}
                    data-testid={`button-option-${oIndex}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedAnswers[currentIndex] === oIndex
                          ? "border-accent bg-accent text-white"
                          : "border-muted-foreground/30"
                      }`}>
                        {selectedAnswers[currentIndex] === oIndex && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Button
              className="w-full gradient-stem text-white"
              disabled={selectedAnswers[currentIndex] === undefined}
              onClick={goNext}
              data-testid="button-next-question"
            >
              {currentIndex === questions.length - 1 ? (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Terminer le quiz
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
