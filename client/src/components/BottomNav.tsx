import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CreateButton } from "./CreateButton";
import {
  Home,
  Users,
  Trophy,
  Target,
  User,
} from "lucide-react";

const navItems = [
  { path: "/feed", label: "Feed", icon: Home },
  { path: "/rooms", label: "Salons", icon: Users },
  { path: "/leaderboard", label: "Rang", icon: Trophy },
  { path: "/missions", label: "Missions", icon: Target },
  { path: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <>
      <CreateButton />
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-30">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={`flex-col gap-1 h-auto py-2 ${isActive ? "text-accent" : ""}`}
                onClick={() => setLocation(item.path)}
                data-testid={`nav-${item.path.slice(1)}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
