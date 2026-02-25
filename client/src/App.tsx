import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useUserState } from "@/lib/userState";
import { useEffect } from "react";
import { getQueryFn } from "@/lib/queryClient";

import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/Onboarding";
import Feed from "@/pages/Feed";
import Rooms from "@/pages/Rooms";
import RoomDetail from "@/pages/RoomDetail";
import Missions from "@/pages/Missions";
import Profile from "@/pages/Profile";
import Home from "@/pages/Home";
import CreateContent from "@/pages/CreateContent";
import QuizPlayer from "@/pages/QuizPlayer";
import Leaderboard from "@/pages/Leaderboard";
import AIAssistant from "@/pages/AIAssistant";
import Auth from "@/pages/Auth";
import Achievements from "@/pages/Achievements";
import Community from "@/pages/Community";
import UserProfile from "@/pages/UserProfile";
import Dashboard from "@/pages/Dashboard";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setUser, logout } = useUserState();
  const [location] = useLocation();

  const { data, isLoading } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data && !isLoading) {
      setUser(data);
    } else if (data === null && !isLoading && isAuthenticated) {
      logout();
    }
  }, [data, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-14 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4">
          <div className="h-6 w-24 rounded-md skeleton-shimmer" />
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-8 rounded-full skeleton-shimmer" />
            <div className="h-8 w-8 rounded-full skeleton-shimmer" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-md skeleton-shimmer" />
            <div className="h-4 w-72 rounded-md skeleton-shimmer opacity-70" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border/40 p-4 space-y-4 shadow-sm bg-card/50">
                <div className="h-40 rounded-lg skeleton-shimmer w-full" />
                <div className="space-y-2">
                  <div className="h-5 w-3/4 rounded-md skeleton-shimmer" />
                  <div className="h-4 w-1/2 rounded-md skeleton-shimmer opacity-70" />
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-8 w-16 rounded-full skeleton-shimmer" />
                  <div className="h-8 w-16 rounded-full skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!data && location !== "/auth") {
    return <Redirect to="/auth" />;
  }

  return <>{children}</>;
}

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
      <Route path="/create/:type" component={CreateContent} />
      <Route path="/quiz/:id" component={QuizPlayer} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/assistant" component={AIAssistant} />
      <Route path="/community" component={Community} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/user/:id" component={UserProfile} />
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
          <Switch>
            <Route path="/auth" component={Auth} />
            <Route>
              <AuthGuard>
                <Router />
              </AuthGuard>
            </Route>
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
