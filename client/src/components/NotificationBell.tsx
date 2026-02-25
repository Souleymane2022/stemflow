import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Award, Zap, Flame, Users, Target, Star, Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  level_up: Star,
  badge_earned: Award,
  mission_complete: Target,
  new_follower: Users,
  xp_gained: Zap,
  streak_milestone: Flame,
  room_activity: Users,
};

const typeColors: Record<string, string> = {
  level_up: "text-yellow-500",
  badge_earned: "text-purple-500",
  mission_complete: "text-accent",
  new_follower: "text-blue-500",
  xp_gained: "text-accent",
  streak_milestone: "text-orange-500",
  room_activity: "text-blue-500",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "maintenant";
  if (mins < 60) return `il y a ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `il y a ${days}j`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30000,
  });

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: open,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const count = unreadCount?.count || 0;

  return (
    <div className="relative">
      <Button className="interactive-element hover-elevate"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative"
        data-testid="button-notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1" data-testid="text-unread-count">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} data-testid="overlay-notifications" />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 z-50 w-80 max-h-96 overflow-hidden"
            >
              <Card className="glass-panel premium-shadow border-0 p-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 p-3 border-b">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {count > 0 && (
                    <button
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-xs text-accent flex items-center gap-1"
                      data-testid="button-mark-all-read"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Tout marquer lu
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {!notifications ? (
                    <div className="p-4 text-center">
                      <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mx-auto" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const Icon = typeIcons[notif.type] || Bell;
                      const color = typeColors[notif.type] || "text-muted-foreground";
                      return (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 p-3 border-b last:border-b-0 ${!notif.read ? "bg-accent/5" : ""}`}
                          data-testid={`notification-${notif.id}`}
                        >
                          <div className={`mt-0.5 ${color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notif.read ? "font-semibold" : ""}`}>{notif.title}</p>
                            <p className="text-xs text-muted-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{timeAgo(notif.createdAt)}</p>
                          </div>
                          {!notif.read && (
                            <button
                              onClick={() => markReadMutation.mutate(notif.id)}
                              className="text-muted-foreground mt-1"
                              data-testid={`button-mark-read-${notif.id}`}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
