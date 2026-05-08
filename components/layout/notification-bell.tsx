"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, MessageCircle, Phone, CheckCircle, Heart, FileText } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  data: Record<string, string>;
  created_at: string;
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  inquiry: FileText,
  message: MessageCircle,
  phone_reveal: Phone,
  listing_approved: CheckCircle,
  favorite: Heart,
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }

      // Subscribe to new notifications
      supabase
        .channel("notifications")
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 10));
          setUnreadCount((prev) => prev + 1);
        })
        .subscribe();
    };
    fetch();
  }, []);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleClick = (n: Notification) => {
    markRead(n.id);
    if (n.type === "message" && n.data.conversation_id) {
      router.push(`/messages/${n.data.conversation_id}`);
    } else if (n.data.listing_id) {
      router.push(`/listing/${n.data.listing_id}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
        <Bell className="h-5 w-5" style={{ color: "#585858" }} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "#E65C5C" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl p-1">
        <div className="px-3 py-2">
          <p className="text-sm font-semibold" style={{ color: "#2A2A33" }}>Notifications</p>
        </div>
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-sm" style={{ color: "#869099" }}>No notifications</p>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            return (
              <DropdownMenuItem
                key={n.id}
                onClick={() => handleClick(n)}
                className="flex items-start gap-3 rounded-lg p-3"
                style={{ background: n.read ? "transparent" : "#f0f7ff" }}
              >
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "#006AFF" }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: "#2A2A33" }}>{n.title}</p>
                  <p className="truncate text-xs" style={{ color: "#869099" }}>{n.body}</p>
                  <p className="mt-0.5 text-[10px]" style={{ color: "#869099" }}>
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
