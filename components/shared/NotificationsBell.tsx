"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, ExternalLink } from "lucide-react";

import Link from "next/link";
import { cn } from "../../lib/utils";
import { ScrollArea } from "../ui/scroll-area";


interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

const TYPE_DOT: Record<string, string> = {
  SUCCESS: "bg-emerald-500",
  PAYMENT: "bg-amber-500",
  WARNING: "bg-red-500",
  INFO:    "bg-blue-500",
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    setUnread(0);
  };

  const relDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
      >
        <Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1">
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <ScrollArea className="h-[360px]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 dark:text-zinc-600 text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition",
                      !n.read && "bg-blue-50/50 dark:bg-blue-900/10"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", TYPE_DOT[n.type] ?? "bg-zinc-400")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{n.title}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.body}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-zinc-400">{relDate(n.createdAt)}</span>
                        {n.link && (
                          <Link href={n.link} onClick={() => setOpen(false)} className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-0.5">
                            View <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}