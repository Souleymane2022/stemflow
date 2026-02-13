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
import { apiRequest, queryClient } from "@/lib/queryClient";
import stemFlowLogo from "@assets/WhatsApp_Image_2026-02-13_at_19.39.13_1771008048536.jpeg";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

type AuthStep = "login" | "register" | "activate";

export default function Auth() {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [pendingActivationEmail, setPendingActivationEmail] = useState("");
  const [displayedCode, setDisplayedCode] = useState("");
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
      queryClient.setQueryData(["/api/auth/me"], data);
      toast({ title: "Connexion réussie", description: `Bienvenue, ${data.username} !` });
      if (data.onboardingCompleted) {
        setLocation("/feed");
      } else {
        setLocation("/onboarding");
      }
    },
    onError: async (error: Error) => {
      try {
        const text = error.message;
        if (text.includes("403")) {
          setPendingActivationEmail(email);
          setStep("activate");
          toast({
            title: "Compte non activé",
            description: "Veuillez entrer votre code d'activation pour continuer.",
            variant: "destructive",
          });
          return;
        }
      } catch {}
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
      setPendingActivationEmail(data.email || email);
      setDisplayedCode(data.activationCode || "");
      setStep("activate");
      toast({
        title: "Inscription réussie",
        description: "Un code d'activation a été généré. Notez-le pour activer votre compte.",
      });
    },
    onError: (error: Error) => {
      const msg = error.message.includes("409")
        ? "Cet email ou nom d'utilisateur est déjà utilisé"
        : "Erreur lors de l'inscription";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/activate", {
        email: pendingActivationEmail,
        code: activationCode,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.setQueryData(["/api/auth/me"], data);
      setDisplayedCode("");
      toast({ title: "Compte activé !", description: "Bienvenue sur STEM FLOW !" });
      if (data.onboardingCompleted) {
        setLocation("/feed");
      } else {
        setLocation("/onboarding");
      }
    },
    onError: () => {
      toast({
        title: "Code invalide",
        description: "Le code d'activation est incorrect. Vérifiez et réessayez.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "login") {
      loginMutation.mutate();
    } else if (step === "register") {
      registerMutation.mutate();
    } else {
      activateMutation.mutate();
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending || activateMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#0a6e8a] via-[#0B3C5D] to-[#0a6e8a]/80 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(10,110,138,0.4)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,200,150,0.15)_0%,transparent_50%)]" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center relative z-10"
      >
        <div className="flex justify-center mb-3">
          <img
            src={stemFlowLogo}
            alt="STEM flow"
            className="h-20 w-auto object-contain drop-shadow-lg"
            data-testid="img-auth-logo"
          />
        </div>
        <p className="text-white/70 text-sm italic tracking-wide">Scroll. Learn. Level Up.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-6">
          {step !== "activate" && (
            <div className="flex items-center gap-1 mb-6">
              <button
                onClick={() => setStep("login")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  step === "login"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground"
                }`}
                data-testid="button-switch-login"
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </button>
              <button
                onClick={() => setStep("register")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  step === "register"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground"
                }`}
                data-testid="button-switch-register"
              >
                <UserPlus className="h-4 w-4" />
                Inscription
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.form
              key={step}
              initial={{ opacity: 0, x: step === "login" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {step === "activate" ? (
                <>
                  <div className="text-center mb-4">
                    <div className="inline-flex p-3 rounded-full gradient-stem mb-3">
                      <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">Activation du compte</h2>
                    <p className="text-sm text-muted-foreground">
                      Entrez le code à 6 chiffres pour activer votre compte
                    </p>
                  </div>

                  {displayedCode && (
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Votre code d'activation :</p>
                      <p className="text-3xl font-mono font-bold tracking-[0.3em] text-accent" data-testid="text-activation-code">
                        {displayedCode}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Notez ce code, il ne sera plus affiché
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="activation-code">Code d'activation</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="activation-code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        placeholder="000000"
                        value={activationCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setActivationCode(val);
                        }}
                        className="pl-10 text-center text-lg font-mono tracking-[0.3em]"
                        required
                        maxLength={6}
                        data-testid="input-activation-code"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-stem text-white"
                    disabled={isPending || activationCode.length !== 6}
                    data-testid="button-activate"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Activation...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Activer mon compte
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("login");
                      setDisplayedCode("");
                      setActivationCode("");
                    }}
                    className="w-full text-center text-sm text-muted-foreground mt-2"
                    data-testid="button-back-to-login"
                  >
                    Retour à la connexion
                  </button>
                </>
              ) : (
                <>
                  {step === "register" && (
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
                        placeholder={step === "register" ? "Min. 6 caractères" : "Ton mot de passe"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={step === "register" ? 6 : 1}
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
                        {step === "login" ? "Connexion..." : "Inscription..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {step === "login" ? "Se connecter" : "S'inscrire"}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </>
              )}
            </motion.form>
          </AnimatePresence>

          {step !== "activate" && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {step === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <button
                  onClick={() => setStep(step === "login" ? "register" : "login")}
                  className="ml-1 text-accent font-medium"
                  data-testid="button-toggle-mode"
                >
                  {step === "login" ? "Inscris-toi" : "Connecte-toi"}
                </button>
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center relative z-10"
      >
        <p className="text-white/50 text-xs">
          contact.equipe.learnxscience@gmail.com
        </p>
      </motion.div>
    </div>
  );
}
