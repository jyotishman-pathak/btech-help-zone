"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, BarChart3, Users, FileText, Code, PieChart,
  BookOpen, Tag, Upload, Settings, Search, MoreHorizontal,
  ChevronDown, LayoutDashboard, User, LogOut, Loader2, ArrowLeft, Timer
} from "lucide-react";

import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface AdminPageWrapperProps {
  children: React.ReactNode;
  activeTab: string;
  backHref?: string;
}

export function AdminPageWrapper({ children, activeTab, backHref }: AdminPageWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session, status } = useSession();

  const admin = {
    name: session?.user?.name ?? "Admin",
    email: session?.user?.email ?? "",
    image: session?.user?.image ?? undefined,
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/admin" },
    { id: "users", label: "Users", icon: Users, href: "/admin?tab=users" },
    { id: "content", label: "Content", icon: FileText, href: "/admin?tab=content" },
    { id: "tests", label: "Mock Tests", icon: Code, href: "/admin/tests" },
    { id: "attempts", label: "Mock Attempts", icon: Timer, href: "/admin/attempts" },
    { id: "analytics", label: "Analytics", icon: PieChart, href: "/admin?tab=analytics" },
    { id: "batches", label: "Batches", icon: BookOpen, href: "/admin/batches" },
    { id: "coupons", label: "Coupons", icon: Tag, href: "/admin/coupons" },
    { id: "leads", label: "Free Leads", icon: Users, href: "/admin?tab=leads" },
    { id: "audit", label: "Audit Logs", icon: Shield, href: "/admin/audit-logs" },
    { id: "pyq", label: "Upload PYQ", icon: Upload, href: "/admin/pyq" },
    { id: "settings", label: "Settings", icon: Settings, href: "/admin?tab=settings" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0D0B1A] flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }} animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-64 border-r border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] z-40 flex flex-col"
      >
        <div className="p-5 border-b border-slate-200/70 dark:border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-slate-900 dark:text-white" />
            <div className="flex flex-col leading-tight">
              <span className="font-black text-lg text-slate-900 dark:text-white">
                CEE<span className="text-amber-500 ml-2">HelpZone</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 -mt-0.5">Assam • PCM Platform</span>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Link key={item.id} href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm" 
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-slate-200/70 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={admin.image} />
              <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                {admin.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{admin.name}</p>
              <p className="text-xs text-slate-500 truncate">{admin.email}</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <div className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""} transition-all duration-300 flex flex-col min-h-screen`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/70 dark:border-slate-700/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <MoreHorizontal className="w-5 h-5" />
              </Button>
              {backHref ? (
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" asChild className="hidden sm:flex border-slate-200/70 dark:border-slate-700/50">
                    <Link href={backHref}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild className="sm:hidden">
                    <Link href={backHref}>
                      <ArrowLeft className="w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 lg:w-80 bg-slate-100 dark:bg-slate-900 border-slate-200/70 dark:border-slate-700/50" />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-90" : "-rotate-90"}`}
                />
              </Button>

              {status === "loading" ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              ) : !session ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild><Link href="/login">Login</Link></Button>
                  <Button size="sm" asChild><Link href="/register">Start Free</Link></Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="outline-none">
                      <Avatar className="h-9 w-9 border border-slate-200/70 dark:border-slate-700/50">
                        <AvatarImage src={session.user?.image ?? ""} />
                        <AvatarFallback>{session.user?.name?.charAt(0) ?? "U"}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{session.user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-slate-200/70 dark:bg-slate-700/50" />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200/70 dark:bg-slate-700/50" />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-500 focus:text-red-500">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
