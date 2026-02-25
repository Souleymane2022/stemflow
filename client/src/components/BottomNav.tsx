import { useLocation } from "wouter";
import { CreateButton } from "./CreateButton";
import {
  Home,
  Users,
  Trophy,
  User,
  UsersRound,
  BarChart3,
} from "lucide-react";

const navItems = [
  { path: "/feed", label: "Feed", icon: Home },
  { path: "/rooms", label: "Salons", icon: Users },
  { path: "/community", label: "Social", icon: UsersRound },
  { path: "/dashboard", label: "Stats", icon: BarChart3 },
  { path: "/leaderboard", label: "Rang", icon: Trophy },
  { path: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <>
      <CreateButton />
      <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-border/30 z-30 safe-area-bottom pb-2">
        <div className="flex items-center justify-around py-1.5 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl interactive-element ${isActive
                    ? "text-accent bg-accent/10"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                data-testid={`nav-${item.path.slice(1)}`}
              >
                {isActive && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-md bg-gradient-stem" />
                )}
                <item.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(0,200,150,0.5)]" : ""}`} />
                <span className={`text-[10px] font-semibold tracking-wide ${isActive ? "text-accent" : ""}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
