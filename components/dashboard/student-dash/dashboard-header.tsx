"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Bell, Menu, Sun, Moon, Settings, User, LogOut,
  ChevronDown, Zap, Crown
} from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "../../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";

import { Input } from "../../ui/input";
import { cn } from "../../../lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface HeaderProps {
  userName?: string | null;
  userImage?: string | null;
  userTier?: "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";
  onMenuToggle?: () => void;
}

export function DashboardHeader({
  userName,
  userImage,
  userTier = "NORMAL",
  onMenuToggle,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "sticky top-0 z-30 h-16",
        "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl",
        "border-b border-zinc-200 dark:border-zinc-800"
      )}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu + Search */}
        <div className="flex items-center gap-3 flex-1 lg:flex-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className={cn(
            "relative w-full max-w-md transition-all duration-300",
            searchFocused ? "max-w-lg" : "max-w-md"
          )}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search topics, tests, concepts..."
              className={cn(
                "pl-9 h-9 bg-zinc-100 dark:bg-zinc-900 border-0 focus-visible:ring-1 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700",
                "transition-all duration-200",
                searchFocused && "ring-2 ring-zinc-300 dark:ring-zinc-700"
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden sm:flex"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-950" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-2 px-1 space-y-1">
                {[
                  { title: "New Mock Test Available", desc: "CEE 2027 Pattern Test #12", time: "2h ago" },
                  { title: "Streak Milestone!", desc: "You've studied 7 days in a row 🔥", time: "1d ago" },
                  { title: "Weak Area Alert", desc: "Organic Chemistry needs attention", time: "2d ago" },
                ].map((notif, i) => (
                  <DropdownMenuItem key={i} className="flex flex-col items-start p-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900">
                    <p className="font-medium text-sm text-zinc-900 dark:text-white">{notif.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{notif.desc}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">{notif.time}</p>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
        
{/* User Menu */}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="relative h-9 px-2 gap-2">
      <Avatar className="h-7 w-7">
        <AvatarImage src={userImage || ""} />
        <AvatarFallback className="text-xs bg-zinc-200 dark:bg-zinc-800">
          {userName?.slice(0, 2).toUpperCase() || "ST"}
        </AvatarFallback>
      </Avatar>

      <span className="hidden md:inline text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[100px] truncate">
        {userName || "Student"}
      </span>

      {userTier !== "NORMAL" && (
        <Badge className="hidden sm:flex text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          {userTier === "SUPER_PREMIUM" ? (
            <Crown className="w-2 h-2 mr-0.5" />
          ) : (
            <Zap className="w-2 h-2 mr-0.5" />
          )}
          {userTier}
        </Badge>
      )}

      <ChevronDown className="w-3 h-3 text-zinc-400" />
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>

    <DropdownMenuSeparator />

    <DropdownMenuItem asChild className="cursor-pointer">
      <Link href="/profile">
        <User className="w-4 h-4 mr-2" />
        Profile
      </Link>
    </DropdownMenuItem>

    <DropdownMenuItem asChild className="cursor-pointer">
      <Link href="/settings">
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Link>
    </DropdownMenuItem>

    {userTier === "NORMAL" && (
      <DropdownMenuItem
        asChild
        className="cursor-pointer text-amber-600 dark:text-amber-400 font-medium"
      >
        <Link href="/pricing">
          <Zap className="w-4 h-4 mr-2" />
          Upgrade to Pro
        </Link>
      </DropdownMenuItem>
    )}

    <DropdownMenuSeparator />

    <DropdownMenuItem
      onClick={() =>
        signOut({
          callbackUrl: "/login",
        })
      }
      className="cursor-pointer text-red-500 focus:text-red-500"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}