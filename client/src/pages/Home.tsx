import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { StemFlowLogo, StemFlowSlogan } from "@/components/StemFlowLogo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUserState } from "@/lib/userState";
import { ChevronRight, Sparkles, Users, Target, Zap } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { onboardingCompleted } = useUserState();

  useEffect(() => {
    if (onboardingCompleted) {
      setLocation("/feed");
    }
  }, [onboardingCompleted, setLocation]);

  const features = [
    {
      icon: Sparkles,
      title: "Contenu personnalisé",
      description: "Un feed adapté à tes intérêts et ton niveau",
      gradient: "gradient-stem",
    },
    {
      icon: Users,
      title: "Communautés STEM",
      description: "Rejoins des salons et apprends avec d'autres",
      gradient: "bg-primary",
    },
    {
      icon: Target,
      title: "Missions quotidiennes",
      description: "Complète des défis et gagne des XP",
      gradient: "gradient-energy",
    },
    {
      icon: Zap,
      title: "Progression gamifiée",
      description: "Monte de niveau et deviens un expert",
      gradient: "bg-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          <StemFlowLogo size="sm" />
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-20 pb-32">
        <div className="px-6 py-12 text-center max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <StemFlowLogo size="xl" showText={false} className="justify-center mb-4" />
              <h1 className="text-4xl font-bold gradient-stem-text mb-2">
                STEM FLOW
              </h1>
              <StemFlowSlogan className="text-lg" />
            </div>

            <p className="text-muted-foreground mb-8 text-lg">
              Découvre les sciences, la technologie, l'ingénierie et les mathématiques
              de manière fun, sociale et engageante.
            </p>

            <Button
              size="lg"
              className="gradient-stem text-white text-lg px-8 py-6"
              onClick={() => setLocation("/onboarding")}
              data-testid="button-start"
            >
              Commencer l'aventure
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>

        {/* Features */}
        <div className="px-6 space-y-4 max-w-lg mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border"
              >
                <div className={`p-3 rounded-lg ${feature.gradient}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="px-6 py-8 mt-8 max-w-lg mx-auto"
        >
          <div className="grid grid-cols-3 gap-4 text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border">
            <div>
              <div className="text-2xl font-bold text-primary">1000+</div>
              <div className="text-xs text-muted-foreground">Contenus</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">50+</div>
              <div className="text-xs text-muted-foreground">Salons</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#F5B700]">10K+</div>
              <div className="text-xs text-muted-foreground">Apprenants</div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t">
        <div className="max-w-lg mx-auto">
          <Button
            className="w-full gradient-stem text-white"
            size="lg"
            onClick={() => setLocation("/onboarding")}
            data-testid="button-start-bottom"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Rejoindre STEM FLOW
          </Button>
        </div>
      </div>
    </div>
  );
}
