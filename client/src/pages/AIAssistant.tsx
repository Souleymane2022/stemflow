import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { apiRequest } from "@/lib/queryClient";
import {
  Bot,
  Send,
  RefreshCw,
  Calculator,
  BookOpen,
  Lightbulb,
  Sparkles,
  User,
  Trash2,
  Zap,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  { label: "Reformuler", icon: RefreshCw, prompt: "Peux-tu reformuler ce concept de manière plus simple :" },
  { label: "Vérifier calcul", icon: Calculator, prompt: "Vérifie ce calcul mathématique et explique la solution :" },
  { label: "Expliquer", icon: BookOpen, prompt: "Explique-moi ce concept STEM étape par étape :" },
  { label: "Exercice", icon: Lightbulb, prompt: "Propose-moi un exercice pratique sur :" },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const assistantMutation = useMutation({
    mutationFn: async (chatMessages: ChatMessage[]) => {
      const res = await apiRequest("POST", "/api/ai/assistant", { messages: chatMessages });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Désolé, une erreur s'est produite. Réessaie dans un moment." },
      ]);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, assistantMutation.isPending]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const fullMessage = activeQuickAction ? `${activeQuickAction} ${text}` : text;
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: fullMessage }];
    setMessages(newMessages);
    setInput("");
    setActiveQuickAction(null);
    assistantMutation.mutate(newMessages);
  };

  const handleQuickAction = (prompt: string) => {
    if (activeQuickAction === prompt) {
      setActiveQuickAction(null);
    } else {
      setActiveQuickAction(prompt);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setActiveQuickAction(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg gradient-stem">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Assistant IA</h1>
              <p className="text-xs text-muted-foreground">Ton tuteur STEM personnel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button className="interactive-element hover-elevate" variant="ghost" size="icon" onClick={clearChat} data-testid="button-clear-chat">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full gradient-stem mb-4">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Bienvenue !</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Je suis ton assistant STEM. Pose-moi une question en Science, Technologie, Ingénierie ou Mathématiques.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {[
                { text: "Comment fonctionne la photosynthèse ?", icon: Lightbulb, gradient: "from-[#0B3C5D]/10 to-[#00C896]/10" },
                { text: "Résous : 2x² + 5x - 3 = 0", icon: Calculator, gradient: "from-[#00C896]/10 to-[#F5B700]/10" },
                { text: "Explique le protocole TCP/IP", icon: Zap, gradient: "from-[#F5B700]/10 to-[#0B3C5D]/10" },
                { text: "Comment construire un pont ?", icon: BookOpen, gradient: "from-[#0B3C5D]/10 to-[#F5B700]/10" },
              ].map((suggestion, i) => (
                <button
                  key={i}
                  className={`p-3 rounded-lg border text-left text-sm hover-elevate transition-colors bg-gradient-to-br ${suggestion.gradient}`}
                  onClick={() => {
                    setInput(suggestion.text);
                  }}
                  data-testid={`button-suggestion-${i}`}
                >
                  <suggestion.icon className="h-4 w-4 text-accent mb-1.5" />
                  <span className="text-muted-foreground text-xs">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="gradient-stem text-white text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "gradient-stem text-white rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}
                  data-testid={`message-${msg.role}-${i}`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {assistantMutation.isPending && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="gradient-stem text-white text-xs">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-16 bg-background/90 backdrop-blur-xl border-t p-3 max-w-lg mx-auto w-full">
        <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isActive = activeQuickAction === action.prompt;
            return (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "gradient-stem text-white shadow-md"
                    : "bg-muted text-muted-foreground"
                }`}
                data-testid={`button-action-${action.label.toLowerCase().replace(/ /g, "-")}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </button>
            );
          })}
        </div>

        {activeQuickAction && (
          <Badge variant="secondary" className="mb-2 text-xs">
            {activeQuickAction.slice(0, 40)}...
          </Badge>
        )}

        <div className="flex gap-2">
          <Textarea
            placeholder={activeQuickAction ? "Tape le sujet ou la question..." : "Pose ta question STEM..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="resize-none min-h-[44px] max-h-[120px]"
            rows={1}
            data-testid="input-chat-message"
          />
          <Button
            className="interactive-element hover-elevate gradient-stem text-white self-end"
            disabled={!input.trim() || assistantMutation.isPending}
            onClick={handleSend}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
