// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, Atom, FlaskConical, Sigma, FileCheck, Timer, LogIn, UserPlus, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";



import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../@/components/ui/dropdown-menu";


const mainNav = [
  { name: "Home", href: "/" },
  { name: "PYQs", href: "/cee/pyqs" },
  { name: "Mocks", href: "/cee/mock" },
];

const subjectNav = [
  { name: "Physics", href: "/cee/physics", icon: Atom },
  { name: "Chemistry", href: "/cee/chemistry", icon: FlaskConical },
  { name: "Maths", href: "/cee/maths", icon: Sigma },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${scrolled ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800" : "bg-white dark:bg-zinc-950 border-transparent"}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-zinc-900 dark:bg-white blur opacity-20 group-hover:opacity-30 transition-opacity" />
            <Atom className="relative h-6 w-6 text-zinc-900 dark:text-white transition-transform group-hover:scale-105" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-black tracking-tight text-zinc-900 dark:text-white">CEE Prep</span>
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 -mt-0.5">Assam • PCM</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {mainNav.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {/* Subjects Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Subjects <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              {subjectNav.map((sub) => (
                <DropdownMenuItem key={sub.name} asChild>
                  <Link href={sub.href} className="flex items-center gap-2 cursor-pointer">
                    <sub.icon className="h-4 w-4 text-zinc-500" /> {sub.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Auth + CTA */}
        <div className="hidden md:flex md:items-center md:gap-3">
          <Badge variant="secondary" className="hidden lg:inline-flex bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border-none">
            CEE 2026
          </Badge>

          {!session ? (
            <>
              <Button variant="ghost" size="sm" asChild className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
                <Link href="/login"><LogIn className="mr-1.5 h-4 w-4" /> Login</Link>
              </Button>
              <Button size="sm" asChild className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                <Link href="/register"><UserPlus className="mr-1.5 h-4 w-4" /> Start Free</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
                <Link href="/dashboard"><LayoutDashboard className="mr-1.5 h-4 w-4" /> Dashboard</Link>
              </Button>
              <Button size="sm" variant="outline" onClick={() => signOut()} className="border-zinc-200 dark:border-zinc-800">
                <LogOut className="mr-1.5 h-4 w-4" /> Logout
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-zinc-700 dark:text-zinc-300">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-0">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Menu</span>
                <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">CEE 2026</Badge>
              </div>

              {/* Mobile Links */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                {mainNav.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 text-base font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-2 pb-1">
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Subjects</p>
                </div>
                {subjectNav.map((sub) => (
                  <Link
                    key={sub.name}
                    href={sub.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-base text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                  >
                    <sub.icon className="h-4 w-4 text-zinc-500" /> {sub.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 px-5 py-4 space-y-2">
                {!session ? (
                  <>
                    <Button variant="outline" asChild className="w-full border-zinc-200 dark:border-zinc-800">
                      <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                    </Button>
                    <Button asChild className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                      <Link href="/register" onClick={() => setIsOpen(false)}>Start Free</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full border-zinc-200 dark:border-zinc-800">
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={() => { setIsOpen(false); signOut(); }}>
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}