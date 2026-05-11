"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Zap, Trophy, Settings,
  LogOut, ChevronLeft, ChevronRight, Bell, Search,
  GraduationCap, Target, BrainCircuit, HelpCircle,
  ChevronDown, User, Crown, Flame
} from "lucide-react";


import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

import { Button } from "../../ui/button";

import { cn } from "../../../lib/utils";
import { Badge } from "../../ui/badge";
import { ScrollArea } from "../../../@/components/ui/scroll-area";
import { signOut } from "next-auth/react";

interface SidebarProps {
  userName?: string | null;
  userImage?: string | null;
  userTier?: "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";
  streak?: number;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/student",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Syllabus",
    href: "/cee/syllabus",
    icon: BookOpen,
    badge: null,
  },
  {
    title: "Mock Tests",
    href: "/cee/mock",
    icon: Zap,
    badge: "New",
  },
  {
    title: "PYQ Bank",
    href: "/cee/pyq",
    icon: Target,
    badge: null,
  },
  {
    title: "Analytics",
    href: "/cee/analytics",
    icon: BrainCircuit,
    badge: "Pro",
    proOnly: true,
  },
  {
    title: "Leaderboard",
    href: "/cee/leaderboard",
    icon: Trophy,
    badge: null,
  },
  {
    title: "College Predictor",
    href: "/cee/colleges",
    icon: GraduationCap,
    badge: "Pro",
    proOnly: true,
  },
];

const BOTTOM_ITEMS = [
  { title: "Settings", href: "/cee/settings", icon: Settings },
  { title: "Help & Support", href: "/cee/support", icon: HelpCircle },
];

export function DashboardSidebar({
  userName,
  userImage,
  userTier = "NORMAL",
  streak = 0,
  collapsed = false,
  onCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isPro = userTier !== "NORMAL";

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => onCollapse?.(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 72 : 256,
          x: isMobile && collapsed ? -256 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen z-50",
          "bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800",
          "flex flex-col shadow-xl lg:shadow-none",
          isMobile ? "w-64" : ""
        )}
      >
        {/* Logo & Collapse Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
            className="overflow-hidden whitespace-nowrap"
          >
            <Link href="/student" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white dark:text-zinc-900" />
              </div>
              <span className="font-black text-lg text-zinc-900 dark:text-white ">
                CEE <span className="text-amber-500 ml-2">HelpZone</span>
              </span>
            </Link>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapse?.(!collapsed)}
            className="hidden lg:flex shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar className="h-10 w-10 ring-2 ring-zinc-200 dark:ring-zinc-800">
              <AvatarImage src={userImage || ""} />
              <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 font-bold">
                {userName?.slice(0, 2).toUpperCase() || "ST"}
              </AvatarFallback>
            </Avatar>
            <motion.div
              animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
              className="overflow-hidden"
            >
              <p className="font-semibold text-sm truncate text-zinc-900 dark:text-white">
                {userName || "Student"}
              </p>
              <div className="flex items-center gap-1.5">
                {userTier !== "NORMAL" && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    {userTier === "SUPER_PREMIUM" ? (
                      <Crown className="w-2.5 h-2.5 mr-0.5" />
                    ) : (
                      <Zap className="w-2.5 h-2.5 mr-0.5" />
                    )}
                    {userTier}
                  </Badge>
                )}
                {streak > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-1">
                    <Flame className="w-2.5 h-2.5 text-orange-500" />
                    {streak}d
                  </Badge>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const isLocked = item.proOnly && !isPro;

              return (
                <Link
                  key={item.href}
                  href={isLocked ? "/pricing" : item.href}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white",
                    isLocked && "opacity-60 cursor-not-allowed",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-white dark:text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                    )}
                  />
                  <motion.span
                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                    className="overflow-hidden whitespace-nowrap flex-1"
                  >
                    {item.title}
                  </motion.span>
                  {item.badge && !collapsed && (
                    <Badge
                      variant={item.badge === "Pro" ? "default" : "secondary"}
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-4 shrink-0",
                        item.badge === "Pro" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {isLocked && !collapsed && (
                    <span className="text-[10px] text-amber-500 shrink-0">🔒</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom Section */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          {BOTTOM_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <motion.span
                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                className="overflow-hidden whitespace-nowrap"
              >
                {item.title}
              </motion.span>
            </Link>
          ))}

          {/* Logout */}
         <button
  onClick={() =>
    signOut({
      callbackUrl: "/login",
    })
  }
  className={cn(
    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
    collapsed && "justify-center px-2"
  )}
>
  <LogOut className="w-5 h-5 shrink-0" />

  <motion.span
    animate={{
      opacity: collapsed ? 0 : 1,
      width: collapsed ? 0 : "auto",
    }}
    className="overflow-hidden whitespace-nowrap"
  >
    Sign Out
  </motion.span>
</button>

          {/* Collapse Toggle (Mobile) */}
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCollapse?.(!collapsed)}
              className="w-full mt-2"
            >
              {collapsed ? "Open Menu" : "Close Menu"}
            </Button>
          )}
        </div>
      </motion.aside>
    </>
  );
}