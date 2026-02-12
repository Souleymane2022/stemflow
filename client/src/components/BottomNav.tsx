import { useLocation } from "wouter";
import { CreateButton } from "./CreateButton";
import {
  Home,
  Users,
  Trophy,
  Bot,
  User,
} from "lucide-react";

const navItems = [
  { path: "/feed", label: "Feed", icon: Home },
  { path: "/rooms", label: "Salons", icon: Users },
  { path: "/leaderboard", label: "Rang", icon: Trophy },
  { path: "/assistant", label: "IA", icon: Bot },
  { path: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <>
      <CreateButton />
      <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t z-30">
        <div className="flex items-center justify-around py-1.5 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive 
                    ? "text-accent" 
                    : "text-muted-foreground"
                }`}
                data-testid={`nav-${item.path.slice(1)}`}
              >
                {isActive && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-accent" />
                )}
                <item.icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                <span className={`text-[10px] font-medium ${isActive ? "text-accent" : ""}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
