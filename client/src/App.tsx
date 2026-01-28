import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useUserState } from "@/lib/userState";
import { useEffect } from "react";

import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/Onboarding";
import Feed from "@/pages/Feed";
import Rooms from "@/pages/Rooms";
import RoomDetail from "@/pages/RoomDetail";
import Missions from "@/pages/Missions";
import Profile from "@/pages/Profile";
import Home from "@/pages/Home";

function Router() {
  const { onboardingCompleted } = useUserState();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (location === "/" && onboardingCompleted) {
      setLocation("/feed");
    } else if (location === "/" && !onboardingCompleted) {
      setLocation("/onboarding");
    }
  }, [location, onboardingCompleted, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/feed" component={Feed} />
      <Route path="/rooms" component={Rooms} />
      <Route path="/rooms/:id" component={RoomDetail} />
      <Route path="/missions" component={Missions} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
