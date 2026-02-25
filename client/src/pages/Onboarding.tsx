import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { StemFlowLogo, StemFlowSlogan } from "@/components/StemFlowLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUserState } from "@/lib/userState";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  GraduationCap,
  Lightbulb,
  Cpu,
  Wrench,
  Calculator,
  Sparkles,
  Compass,
  BarChart3,
  Sword,
  Crown,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import type { UserProfile } from "@shared/schema";

const steps = [
  { id: "language", title: "Langue", icon: Globe },
  { id: "education", title: "Niveau", icon: GraduationCap },
  { id: "interests", title: "Intérêts", icon: Lightbulb },
  { id: "level", title: "Départ", icon: Sparkles },
];

const languages = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

const educationLevels = [
  { value: "college", label: "Collège", description: "11-15 ans" },
  { value: "lycee", label: "Lycée", description: "15-18 ans" },
  { value: "universite", label: "Université", description: "18+ ans" },
  { value: "autodidacte", label: "Autodidacte", description: "Apprentissage libre" },
];

const stemInterests = [
  { value: "science", label: "Science", icon: Lightbulb, color: "from-blue-500 to-cyan-400" },
  { value: "technology", label: "Technologie", icon: Cpu, color: "from-purple-500 to-pink-400" },
  { value: "engineering", label: "Ingénierie", icon: Wrench, color: "from-orange-500 to-yellow-400" },
  { value: "mathematics", label: "Mathématiques", icon: Calculator, color: "from-green-500 to-emerald-400" },
];

const startingLevels = [
  { value: "curieux", label: "Curieux", description: "Je découvre", icon: Sparkles },
  { value: "explorateur", label: "Explorateur", description: "J'explore activement", icon: Compass },
  { value: "analyste", label: "Analyste", description: "J'analyse en profondeur", icon: BarChart3 },
  { value: "challenger", label: "Challenger", description: "Je relève des défis", icon: Sword },
  { value: "mentor", label: "Mentor", description: "J'aide les autres", icon: Crown },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { setProfile, setOnboardingCompleted } = useUserState();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    preferredLanguage: undefined,
    educationLevel: undefined,
    interests: [],
    level: undefined,
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!formData.preferredLanguage;
      case 1:
        return !!formData.educationLevel;
      case 2:
        return formData.interests && formData.interests.length >= 1;
      case 3:
        return !!formData.level;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (formData.preferredLanguage && formData.educationLevel && formData.interests && formData.level) {
      const { userId } = useUserState.getState();
      if (userId) {
        try {
          await fetch(`/api/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              ...formData,
              onboardingCompleted: true,
            }),
          });
        } catch { }
      }
      setProfile(formData as UserProfile);
      setOnboardingCompleted(true);
      toast({
        title: "Bienvenue sur STEM FLOW !",
        description: "Ton profil est prêt. Explore le feed !",
      });
      setLocation("/feed");
    }
  };

  const toggleInterest = (interest: string) => {
    const current = formData.interests || [];
    if (current.includes(interest as any)) {
      setFormData({
        ...formData,
        interests: current.filter((i) => i !== interest) as any,
      });
    } else {
      setFormData({
        ...formData,
        interests: [...current, interest] as any,
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-2">Choisis ta langue</h2>
            <p className="text-muted-foreground text-center mb-6">
              Dans quelle langue préfères-tu apprendre ?
            </p>
            <div className="grid grid-cols-1 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setFormData({ ...formData, preferredLanguage: lang.value as any })}
                  data-testid={`button-language-${lang.value}`}
                  className={`p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 interactive-element group ${formData.preferredLanguage === lang.value
                    ? "border-accent bg-accent/15 premium-shadow"
                    : "border-border/40 glass-panel hover:bg-white/5"
                    }`}
                >
                  <div className={`p-2.5 rounded-xl shadow-inner group-hover:scale-110 transition-transform ${lang.value === "fr" ? "bg-gradient-stem" : "bg-gradient-energy"}`}>
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold text-lg">{lang.label}</span>
                  {formData.preferredLanguage === lang.value && (
                    <Check className="ml-auto h-5 w-5 text-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-2">Ton niveau d'éducation</h2>
            <p className="text-muted-foreground text-center mb-6">
              Cela nous aide à adapter le contenu à ton niveau
            </p>
            <div className="grid grid-cols-1 gap-3">
              {educationLevels.map((edu) => (
                <button
                  key={edu.value}
                  onClick={() => setFormData({ ...formData, educationLevel: edu.value as any })}
                  data-testid={`button-education-${edu.value}`}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover-elevate ${formData.educationLevel === edu.value
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{edu.label}</div>
                      <div className="text-sm text-muted-foreground">{edu.description}</div>
                    </div>
                    {formData.educationLevel === edu.value && (
                      <Check className="h-5 w-5 text-accent" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-2">Tes centres d'intérêt</h2>
            <p className="text-muted-foreground text-center mb-6">
              Sélectionne au moins 1 domaine STEM qui te passionne
            </p>
            <div className="grid grid-cols-2 gap-3">
              {stemInterests.map((interest) => {
                const Icon = interest.icon;
                const isSelected = formData.interests?.includes(interest.value as any);
                return (
                  <button
                    key={interest.value}
                    onClick={() => toggleInterest(interest.value)}
                    data-testid={`button-interest-${interest.value}`}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 hover-elevate ${isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card"
                      }`}
                  >
                    <div className={`p-3 rounded-full bg-gradient-to-br ${interest.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold">{interest.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-accent" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {formData.interests?.length || 0} sélectionné(s)
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-2">Ton niveau de départ</h2>
            <p className="text-muted-foreground text-center mb-6">
              Comment te définirais-tu dans ton apprentissage ?
            </p>
            <div className="grid grid-cols-1 gap-3">
              {startingLevels.map((level) => {
                const Icon = level.icon;
                const isSelected = formData.level === level.value;
                return (
                  <button
                    key={level.value}
                    onClick={() => setFormData({ ...formData, level: level.value as any })}
                    data-testid={`button-level-${level.value}`}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-4 hover-elevate ${isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card"
                      }`}
                  >
                    <div className="p-2 rounded-full gradient-stem">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                    {isSelected && (
                      <Check className="ml-auto h-5 w-5 text-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <StemFlowLogo size="lg" className="justify-center" />
          <StemFlowSlogan className="text-center mt-2 text-muted-foreground" />
        </motion.div>

        <Card className="w-full max-w-md p-6">
          <div className="mb-6">
            <div className="relative flex justify-between mb-4">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-accent transition-all duration-500"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-1">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${index <= currentStep
                        ? "gradient-stem text-white shadow-md"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] font-medium ${index <= currentStep ? "text-accent" : "text-muted-foreground"}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 glass-panel border-t border-border/40 z-50">
        <div className="max-w-md mx-auto flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 rounded-xl interactive-element hover:bg-muted"
              data-testid="button-back"
            >
              <ChevronLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
              Retour
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 gradient-stem text-white rounded-xl interactive-element group"
            data-testid="button-next"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Commencer
                <Sparkles className="h-4 w-4 ml-1 group-hover:animate-pulse" />
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
