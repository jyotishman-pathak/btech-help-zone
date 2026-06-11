"use client";

/**
 * RESPONSIVE DASHBOARD LAYOUT
 * ────────────────────────────
 * Mobile  (<1024px): Bottom tab bar, fullscreen content, slide-up drawer for secondary nav
 * Desktop (≥1024px): Collapsible sidebar (72px icon-only ↔ 256px expanded)
 *
 * Drop-in replacement. Usage:
 *
 *   <DashboardProvider userName={...} userImage={...} userTier={...} streak={...}>
 *     <DashboardLayout>
 *       {children}
 *     </DashboardLayout>
 *   </DashboardProvider>
 */

import {
    createContext,
    useContext,
    ReactNode,
    useState,
    useEffect,
    useRef,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

import {
    LayoutDashboard,
    BookOpen,
    Trophy,
    Target,
    BrainCircuit,
    GraduationCap,
    Settings,
    HelpCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Zap,
    Crown,
    Flame,
    BoxIcon,
    Layers,
    Search,
    Sun,
    Moon,
    MoreHorizontal,
    X,
    Bell,
    User,
    Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../lib/utils";
import { ScrollArea } from "../../../components/ui/scroll-area";

// ─── Context ──────────────────────────────────────────────────────────────────

interface DashboardContextType {
    userName: string | null;
    userImage: string | null;
    userTier: "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";
    streak: number;
    userFeatures?: { hasPredictor?: boolean; hasAnalytics?: boolean; hasCounselling?: boolean } | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({
    children,
    userName,
    userImage,
    userTier,
    streak,
    userFeatures,
}: DashboardContextType & { children: ReactNode }) {
    return (
        <DashboardContext.Provider value={{ userName, userImage, userTier, streak, userFeatures }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
    return ctx;
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const PRIMARY_NAV = [
    { title: "Dashboard", href: "/student", icon: LayoutDashboard, badge: null, proOnly: false },
    { title: "My Batches", href: "/student/my-batches", icon: BoxIcon, badge: null, proOnly: false },

    { title: "PYQ Bank", href: "/student/cee/pyq", icon: Target, badge: null, proOnly: false },
    { title: "Leaderboard", href: "/student/cee/leaderboard", icon: Trophy, badge: null, proOnly: false },
    { title: "Syllabus", href: "/student/cee/syllabus", icon: BookOpen, badge: null, proOnly: false },
];

// These appear in sidebar on desktop + "More" sheet on mobile
const SECONDARY_NAV = [
    { title: "Study Squads", href: "/student/squad", icon: Users, badge: "New", proOnly: false },
    { title: "Analytics", href: "/student/cee/analytics", icon: BrainCircuit, badge: "Pro", proOnly: true },
    { title: "Browse Batches", href: "/student/batches", icon: Layers, badge: null, proOnly: false },
    { title: "College Predictor", href: "/student/predictor", icon: GraduationCap, badge: "Pro", proOnly: true },
    { title: "Settings", href: "/student/settings", icon: Settings, badge: null, proOnly: false },
    { title: "Help & Support", href: "/student/cee/support", icon: HelpCircle, badge: null, proOnly: false },
];

// Bottom tab bar shows first 4 primary items + "More" tab
const BOTTOM_TABS = PRIMARY_NAV.slice(0, 4);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: "NORMAL" | "PREMIUM" | "SUPER_PREMIUM" }) {
    if (tier === "NORMAL") return null;
    return (
        <Badge className="text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-0.5">
            {tier === "SUPER_PREMIUM" ? <Crown className="w-2 h-2" /> : <Zap className="w-2 h-2" />}
            {tier === "SUPER_PREMIUM" ? "Super" : "Pro"}
        </Badge>
    );
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

function DesktopSidebar({
    collapsed,
    onCollapse,
}: {
    collapsed: boolean;
    onCollapse: (v: boolean) => void;
}) {
    const { userName, userImage, userTier, streak, userFeatures } = useDashboard();
    const pathname = usePathname();
    const isPro = userTier !== "NORMAL";

    const allNav = [...PRIMARY_NAV, ...SECONDARY_NAV];

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 256 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden lg:flex flex-col sticky top-0 h-screen z-40 bg-[#F7F5FF] dark:bg-[#0D0B1A] border-r border-slate-200/70 dark:border-slate-700/50 shadow-xl lg:shadow-none overflow-hidden"
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 flex items-center justify-center shrink-0">
                                <GraduationCap className="w-5 h-5 text-white dark:text-slate-900" />
                            </div>
                            <span className="font-black text-lg text-slate-900 dark:text-white">
                                CEE <span className="text-amber-500 ml-1">HelpZone</span>
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                {collapsed && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 flex items-center justify-center mx-auto">
                        <GraduationCap className="w-5 h-5 text-white dark:text-slate-900" />
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onCollapse(!collapsed)}
                    className={cn("shrink-0", collapsed && "mx-auto")}
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
            </div>

            {/* User */}
            <div className={cn("p-4 border-b border-slate-200 dark:border-slate-800 shrink-0", collapsed && "px-3")}>
                <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
                    <Avatar className="h-9 w-9 ring-2 ring-slate-200 dark:ring-slate-700 shrink-0">
                        <AvatarImage src={userImage || ""} />
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                            {userName?.slice(0, 2).toUpperCase() || "ST"}
                        </AvatarFallback>
                    </Avatar>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1 }}
                                className="min-w-0"
                            >
                                <p className="font-semibold text-sm truncate text-slate-900 dark:text-white">
                                    {userName || "Student"}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <TierBadge tier={userTier} />
                                    {streak > 0 && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                                            <Flame className="w-2.5 h-2.5 text-orange-500" />
                                            {streak}d
                                        </Badge>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Nav */}
            <ScrollArea className="flex-1 py-3">
                <nav className="space-y-0.5 px-2">
                    {allNav.map((item) => {
                        const isActive = pathname === item.href;
                        
                        let isLocked = item.proOnly && !isPro;
                        if (isLocked && userFeatures) {
                            if (item.href.includes("predictor") || item.href.includes("colleges")) {
                                if (userFeatures.hasPredictor) isLocked = false;
                            }
                            if (item.href.includes("analytics")) {
                                if (userFeatures.hasAnalytics) isLocked = false;
                            }
                        }

                        return (
                            <Link
                                key={item.href}
                                href={isLocked ? "/pricing" : item.href}
                                title={collapsed ? item.title : undefined}
                                className={cn(
                                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
                                    collapsed && "justify-center px-2"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.1 }}
                                            className="flex-1 whitespace-nowrap overflow-hidden"
                                        >
                                            {item.title}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {!collapsed && item.badge && (
                                    <Badge className={cn("text-[10px] px-1.5 py-0 h-4 shrink-0", item.badge === "Pro" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "")}>
                                        {item.badge}
                                    </Badge>
                                )}
                                {!collapsed && isLocked && <span className="text-[10px] shrink-0">🔒</span>}
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* Sign out */}
            <div className={cn("p-3 border-t border-slate-200 dark:border-slate-800 shrink-0", collapsed && "px-2")}>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    title={collapsed ? "Sign out" : undefined}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
                        collapsed && "justify-center px-2"
                    )}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                                Sign Out
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
}

// ─── Mobile Header ────────────────────────────────────────────────────────────

function MobileHeader({ onSearch }: { onSearch: () => void }) {
    const { userName, userImage, userTier, streak } = useDashboard();
    const { theme, setTheme } = useTheme();

    return (
        <header className="lg:hidden sticky top-0 z-30 h-14 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-3">
            {/* Logo mark */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-white dark:text-slate-900" />
            </div>
            <span className="font-black text-base text-slate-900 dark:text-white flex-1">
                CEE <span className="text-amber-500">HelpZone</span>
            </span>

            {/* Right actions */}
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onSearch}>
                    <Search className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Avatar className="h-7 w-7 ml-1">
                    <AvatarImage src={userImage || ""} />
                    <AvatarFallback className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800">
                        {userName?.slice(0, 2).toUpperCase() || "ST"}
                    </AvatarFallback>
                </Avatar>
                {streak > 0 && (
                    <div className="flex items-center gap-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                        <Flame className="w-3 h-3" />{streak}
                    </div>
                )}
            </div>
        </header>
    );
}

// ─── Mobile Search Overlay ────────────────────────────────────────────────────

function MobileSearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 100);
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-x-0 top-0 z-50 lg:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 p-3 flex items-center gap-2 shadow-xl"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            ref={inputRef}
                            placeholder="Search topics, tests, concepts…"
                            className="pl-9 h-10 bg-zinc-100 dark:bg-zinc-900 border-0 focus-visible:ring-1 focus-visible:ring-indigo-400"
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 shrink-0">
                        <X className="w-4 h-4" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Desktop Header ───────────────────────────────────────────────────────────

function DesktopHeader() {
    const { userName, userImage, userTier } = useDashboard();
    const { theme, setTheme } = useTheme();
    const [searchFocused, setSearchFocused] = useState(false);

    return (
        <header className="hidden lg:flex sticky top-0 z-30 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 items-center px-6 gap-4">
            <div className={cn("relative transition-all duration-300", searchFocused ? "w-96" : "w-72")}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                    placeholder="Search topics, tests, concepts…"
                    className="pl-9 h-9 bg-zinc-100 dark:bg-zinc-900 border-0 focus-visible:ring-1 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                />
            </div>
            <div className="flex-1" />
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
            </Button>
            <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={userImage || ""} />
                <AvatarFallback className="text-xs font-bold bg-zinc-200 dark:bg-zinc-800">
                    {userName?.slice(0, 2).toUpperCase() || "ST"}
                </AvatarFallback>
            </Avatar>
        </header>
    );
}

// ─── Mobile Bottom Tab Bar ────────────────────────────────────────────────────

function MobileBottomNav({ onMore }: { onMore: () => void }) {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800">
            {/* Safe area padding for iOS home indicator */}
            <div className="flex items-stretch h-16 pb-safe">
                {BOTTOM_TABS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-tab-indicator"
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-indigo-600"
                                />
                            )}
                            <item.icon
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-[10px] font-semibold transition-colors",
                                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"
                                )}
                            >
                                {item.title}
                            </span>
                        </Link>
                    );
                })}

                {/* More tab */}
                <button
                    onClick={onMore}
                    className="flex-1 flex flex-col items-center justify-center gap-0.5"
                >
                    <MoreHorizontal className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                    <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">More</span>
                </button>
            </div>
        </nav>
    );
}

// ─── Mobile "More" Drawer ─────────────────────────────────────────────────────

function MobileMoreDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { userName, userImage, userTier, streak, userFeatures } = useDashboard();
    const pathname = usePathname();
    const isPro = userTier !== "NORMAL";

    // All nav that isn't in bottom tabs
    const moreItems = [
        ...PRIMARY_NAV.slice(4), // My Batches (5th primary item)
        ...SECONDARY_NAV,
    ];

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                        onClick={onClose}
                    />
                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 350, damping: 35 }}
                        className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white dark:bg-zinc-950 rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </div>

                        {/* User profile strip */}
                        <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
                            <Avatar className="h-10 w-10 ring-2 ring-zinc-200 dark:ring-zinc-700">
                                <AvatarImage src={userImage || ""} />
                                <AvatarFallback className="text-xs font-bold bg-zinc-200 dark:bg-zinc-800">
                                    {userName?.slice(0, 2).toUpperCase() || "ST"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{userName || "Student"}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <TierBadge tier={userTier} />
                                    {streak > 0 && (
                                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-500">
                                            <Flame className="w-3 h-3" />{streak}d streak
                                        </span>
                                    )}
                                </div>
                            </div>
                            {userTier === "NORMAL" && (
                                <Link href="/pricing" onClick={onClose}>
                                    <Button size="sm" className="h-8 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
                                        <Zap className="w-3 h-3" /> Upgrade
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Nav items */}
                        <ScrollArea className="flex-1 px-3 py-2">
                            <div className="grid grid-cols-1 gap-0.5">
                                {moreItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    
                                    let isLocked = item.proOnly && !isPro;
                                    if (isLocked && userFeatures) {
                                        if (item.href.includes("predictor") || item.href.includes("colleges")) {
                                            if (userFeatures.hasPredictor) isLocked = false;
                                        }
                                        if (item.href.includes("analytics")) {
                                            if (userFeatures.hasAnalytics) isLocked = false;
                                        }
                                    }

                                    return (
                                        <Link
                                            key={item.href}
                                            href={isLocked ? "/pricing" : item.href}
                                            onClick={onClose}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                                                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900",
                                                isLocked && "opacity-60"
                                            )}
                                        >
                                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", isActive ? "bg-indigo-100 dark:bg-indigo-900/40" : "bg-zinc-100 dark:bg-zinc-800")}>
                                                <item.icon className={cn("w-4.5 h-4.5", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500")} />
                                            </div>
                                            <span className="flex-1">{item.title}</span>
                                            {item.badge && (
                                                <Badge className={cn("text-[10px] px-1.5 py-0 h-4", item.badge === "Pro" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "")}>
                                                    {item.badge}
                                                </Badge>
                                            )}
                                            {isLocked && <span className="text-xs">🔒</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        {/* Sign out */}
                        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 pb-safe-or-4">
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function DashboardLayout({
    children,
    userName,
    userImage,
    userTier = "NORMAL",
    streak = 0,
    userFeatures,
}: {
    children: ReactNode;
    userName: string | null;
    userImage: string | null;
    userTier?: "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";
    streak?: number;
    userFeatures?: { hasPredictor?: boolean; hasAnalytics?: boolean; hasCounselling?: boolean } | null;
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const pathname = usePathname();

    useEffect(() => {
        setMoreOpen(false);
        setSearchOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = moreOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [moreOpen]);

    return (
        <DashboardProvider
            userName={userName}
            userImage={userImage}
            userTier={userTier}
            streak={streak}
            userFeatures={userFeatures}
        >
            <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
                <DesktopSidebar
                    collapsed={sidebarCollapsed}
                    onCollapse={setSidebarCollapsed}
                />

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <DesktopHeader />

                    <MobileHeader onSearch={() => setSearchOpen(true)} />

                    <MobileSearchOverlay
                        open={searchOpen}
                        onClose={() => setSearchOpen(false)}
                    />

                    <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
                        {children}
                    </main>
                </div>

                <MobileBottomNav onMore={() => setMoreOpen(true)} />

                <MobileMoreDrawer
                    open={moreOpen}
                    onClose={() => setMoreOpen(false)}
                />
            </div>
        </DashboardProvider>
    );
}

// ─── Usage example (remove in production) ────────────────────────────────────
//
// In your layout.tsx:
//
// export default function StudentLayout({ children }: { children: React.ReactNode }) {
//   const session = await auth();
//   const tier = (session?.user as any)?.tier ?? "NORMAL";
//   return (
//     <DashboardProvider
//       userName={session?.user?.name ?? null}
//       userImage={session?.user?.image ?? null}
//       userTier={tier}
//       streak={0} // pass real streak here
//     >
//       <DashboardLayout>{children}</DashboardLayout>
//     </DashboardProvider>
//   );
// }