import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Vote, Star, Quote, ShieldCheck, ChevronRight } from "lucide-react";

interface Leader {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  vision: string;
  color: string;
  skills: string[];
}

const leaders: Leader[] = [
  {
    id: 1,
    name: "Abdelkerim Mahamat",
    role: "Expert en Politiques Jeunesse",
    image: "/images/leaders/leader_1_1776610290503.png",
    bio: "Abdelkerim possède plus de 10 ans d'expérience dans l'élaboration de programmes éducatifs nationaux. Diplômé en relations internationales, il a milité activement pour l'intégration des jeunes dans le secteur administratif et public. Son approche se base sur le pragmatisme et le dialogue intergénérationnel.",
    vision: "Une voix forte pour la jeunesse, propulsant le leadership et l'innovation au sein des institutions.",
    color: "from-blue-500 to-indigo-600",
    skills: ["Gouvernance", "Diplomatie", "Gestion de projets"]
  },
  {
    id: 2,
    name: "Fatimé Zara",
    role: "Entrepreneure & Pionnière Tech",
    image: "/images/leaders/leader_2_1776610304502.png",
    bio: "Animée par la passion du code et du digital, Fatimé a fondé un incubateur tech visant les jeunes femmes. Elle défend une approche moderne du leadership où la technologie devient le vecteur principal d'ascension sociale et de création de richesse durable.",
    vision: "Équiper la nouvelle génération de compétences STEM pour conquérir l'économie numérique de demain.",
    color: "from-purple-500 to-fuchsia-600",
    skills: ["Tech & Innovation", "Entrepreneuriat", "Leadership féminin"]
  },
  {
    id: 3,
    name: "Dr. Ousmane T.",
    role: "Investisseur & Stratège",
    image: "/images/leaders/leader_3_1776610324094.png",
    bio: "Économiste respecté, Ousmane a passé sa carrière à structurer des fonds d'investissement pour l'entrepreneuriat jeune en Afrique Centrale. Il apporte une rigueur intellectuelle et un réseau impressionnant pour ouvrir des opportunités financières inédites à la jeunesse locale.",
    vision: "Bâtir des ponts entre le capital institutionnel européen et notre talentueuse génération d'entrepreneurs.",
    color: "from-orange-500 to-red-600",
    skills: ["Stratégie Financière", "Investissement", "Mentorat"]
  },
  {
    id: 4,
    name: "Amina Alhadj",
    role: "Innovatrice en Développement Durable",
    image: "/images/leaders/leader_4_1776610340625.png",
    bio: "Ingénieure agro-tech primée à l'international, Amina est à l'avant-garde de l'innovation écologique. Elle propose un modèle d'économie circulaire qui crée des emplois durables tout en protégeant les écosystèmes. Son expertise terrain fait d'elle un pilier du renouveau écologique.",
    vision: "L'indépendance économique locale couplée à une responsabilité écologique ambitieuse.",
    color: "from-emerald-400 to-teal-600",
    skills: ["Développement Durable", "AgriTech", "Recherche Sectorielle"]
  }
];

export default function Elections() {
  const [, setLocation] = useLocation();
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200 } }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-40 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px] -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 dark:border-white/5">
        <div className="flex items-center gap-3 p-4 max-w-5xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")} className="hover-elevate rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-500">
              SAYC Elections
            </h1>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> Processus Transparent
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        
        {/* Intro Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl premium-shadow border-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-background z-0" />
          <div className="absolute top-0 right-0 p-8 opacity-20">
             <Vote className="h-40 w-40 text-white" />
          </div>
          
          <div className="relative z-10 p-8 md:p-12 space-y-4">
            <Badge variant="outline" className="text-blue-300 border-blue-400 bg-blue-900/40 backdrop-blur">
              Phase 1 : Découverte
            </Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              14 Leaders Présélectionnés.<br/>
              Un Avenir Commun.
            </h2>
            <p className="text-blue-100 max-w-2xl text-lg opacity-90 leading-relaxed">
              Découvrez les profils d'exception qui aspirent à diriger la nouvelle ère. Parcourez leurs visions et préparez-vous pour le vote démocratique sécurisé à venir.
            </p>
            <p className="text-xs text-blue-300/60 uppercase tracking-widest mt-4 font-bold">
              * Maquette 4/14 Profils
            </p>
          </div>
        </motion.div>

        {/* Candidate Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              Candidats à l'honneur
            </h3>
            <Badge variant="secondary" className="px-3 py-1 font-bold">VOTE BIENTÔT OUVERT</Badge>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {leaders.map((leader) => (
              <motion.div key={leader.id} variants={item}>
                <Card 
                  className="interactive-element group cursor-pointer overflow-hidden relative premium-shadow border-0 bg-card/60 backdrop-blur h-full flex flex-col"
                  onClick={() => setSelectedLeader(leader)}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10 pointer-events-none" />
                  
                  {/* Image container */}
                  <div className="relative h-64 overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${leader.color} rounded-bl-full opacity-20 -z-0`} />
                    <img 
                      src={leader.image} 
                      alt={leader.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-0" />
                    
                    <div className="absolute bottom-3 left-4 right-4 z-20">
                      <h4 className="text-xl font-bold text-white drop-shadow-md">{leader.name}</h4>
                      <p className="text-sm font-medium text-white/80 line-clamp-1">{leader.role}</p>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {leader.bio}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-1 overflow-hidden">
                        {leader.skills.slice(0, 2).map((s, i) => (
                          <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-sm bg-gradient-to-r ${leader.color} bg-opacity-10 text-white`}>
                            {s}
                          </span>
                        ))}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full ml-2 flex-shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedLeader && (
          <Dialog open={!!selectedLeader} onOpenChange={(open) => !open && setSelectedLeader(null)}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 bg-background/95 backdrop-blur-3xl premium-shadow">
              
              {/* Modal Header Image */}
              <div className="relative h-64 w-full">
                <img src={selectedLeader.image} className="w-full h-full object-cover object-top" alt={selectedLeader.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge variant="outline" className={`mb-3 bg-gradient-to-r ${selectedLeader.color} text-white border-0 px-3 py-1`}>
                    #{selectedLeader.id} - Candidat
                  </Badge>
                  <DialogTitle className="text-3xl md:text-4xl font-extrabold text-foreground mb-1">
                    {selectedLeader.name}
                  </DialogTitle>
                  <p className="text-lg font-medium text-muted-foreground">{selectedLeader.role}</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-8">
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Left Column: Vision & Skills */}
                  <div className="md:col-span-1 space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Expertises</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLeader.skills.map((s, i) => (
                          <Badge key={i} variant="secondary" className="bg-secondary/50 hover:bg-secondary">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Bio Details */}
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Biographie</h4>
                      <DialogDescription className="text-base leading-relaxed text-foreground/90">
                        {selectedLeader.bio}
                      </DialogDescription>
                    </div>

                    <div className="relative border-l-4 border-accent p-4 bg-accent/5 rounded-r-xl">
                      <Quote className="absolute top-2 right-2 h-8 w-8 text-accent/20" />
                      <h4 className="text-sm font-bold text-accent uppercase tracking-wide mb-2">Notre Vision</h4>
                      <p className="font-medium italic leading-relaxed text-foreground">
                        "{selectedLeader.vision}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Call to Action Wrapper */}
                <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> La phase de vote s'ouvrira prochainement.
                  </p>
                  <Button 
                    className={`w-full sm:w-auto px-8 gradient-stem text-white hover-elevate`} 
                    disabled
                  >
                    <Vote className="h-4 w-4 mr-2" />
                    Voter (Bientôt)
                  </Button>
                </div>

              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
