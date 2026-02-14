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
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t z-30 safe-area-bottom">
        <div className="flex items-center justify-around py-1 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "text-accent" 
                    : "text-muted-foreground"
                }`}
                data-testid={`nav-${item.path.slice(1)}`}
              >
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-accent" />
                )}
                <item.icon className={`h-4.5 w-4.5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                <span className={`text-[9px] font-medium leading-tight ${isActive ? "text-accent" : ""}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
