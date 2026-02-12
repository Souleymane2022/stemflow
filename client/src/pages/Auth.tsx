import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUserState } from "@/lib/userState";
import { apiRequest } from "@/lib/queryClient";
import { StemFlowLogo } from "@/components/StemFlowLogo";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowRight,
} from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setUser } = useUserState();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data);
      toast({ title: "Connexion réussie", description: `Bienvenue, ${data.username} !` });
      if (data.onboardingCompleted) {
        setLocation("/feed");
      } else {
        setLocation("/onboarding");
      }
    },
    onError: (error: Error) => {
      const msg = error.message.includes("401")
        ? "Email ou mot de passe incorrect"
        : "Erreur lors de la connexion";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/register", { username, email, password });
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data);
      toast({ title: "Inscription réussie", description: "Bienvenue sur STEM FLOW !" });
      setLocation("/onboarding");
    },
    onError: (error: Error) => {
      const msg = error.message.includes("409")
        ? "Cet email ou nom d'utilisateur est déjà utilisé"
        : "Erreur lors de l'inscription";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      loginMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#0B3C5D] via-[#0B3C5D]/90 to-[#00C896]/30">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <StemFlowLogo />
        <p className="text-white/70 text-sm mt-2">Scroll. Learn. Level Up.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          <div className="flex gap-2 mb-6">
            <Button
              variant={mode === "login" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setMode("login")}
              data-testid="button-switch-login"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Connexion
            </Button>
            <Button
              variant={mode === "register" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setMode("register")}
              data-testid="button-switch-register"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Inscription
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === "login" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Ton pseudo"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                      minLength={2}
                      maxLength={50}
                      data-testid="input-username"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "Min. 6 caractères" : "Ton mot de passe"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={mode === "register" ? 6 : 1}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-stem text-white"
                disabled={isPending}
                data-testid="button-auth-submit"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === "login" ? "Connexion..." : "Inscription..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {mode === "login" ? "Se connecter" : "S'inscrire"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}
              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="ml-1 text-accent font-medium"
                data-testid="button-toggle-mode"
              >
                {mode === "login" ? "Inscris-toi" : "Connecte-toi"}
              </button>
            </p>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-white/50 text-xs">
          contact.equipe.learnxscience@gmail.com
        </p>
      </motion.div>
    </div>
  );
}
