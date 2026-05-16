"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Shield } from "lucide-react";

import { useSession } from "next-auth/react";
import { cn } from "../lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "PYQs", href: "/student/cee/pyq" },
  { label: "Batches Live", href: "/student/batches" },
  { label: "Library", href: "student/my-batches" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-[#090915]/90 backdrop-blur-md border-b border-[#1e1e3a]"
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8">
            <Shield className="w-8 h-8 text-orange-500 fill-orange-500/20 stroke-[2.5]" />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">B</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-black text-sm tracking-wider">TEAM B</span>
            <span className="text-orange-500 text-[9px] font-bold tracking-[0.15em] uppercase">
              Tech Help Zone
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-gray-400 hover:text-white text-xs font-bold tracking-[0.15em] uppercase transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          {session?.user ? (
            <Link href="/student">
              <button className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-5 py-2.5 rounded-full tracking-widest uppercase transition-all duration-200 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <span className="text-gray-400 hover:text-white text-xs font-bold tracking-[0.15em] uppercase transition-colors cursor-pointer">
                  Login
                </span>
              </Link>
              <Link href="/register">
                <button className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-5 py-2.5 rounded-full tracking-widest uppercase transition-all duration-200 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white p-2"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0d0d20] border-t border-[#1e1e3a] px-4 py-6 space-y-4">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block text-gray-300 hover:text-white text-sm font-bold tracking-widest uppercase py-2 border-b border-[#1e1e3a]"
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-3">
            {session?.user ? (
              <Link href="/student" onClick={() => setOpen(false)}>
                <button className="w-full bg-violet-600 text-white text-sm font-bold py-3 rounded-full tracking-widest uppercase">
                  Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <button className="w-full border border-[#2a2a50] text-gray-300 text-sm font-bold py-3 rounded-full tracking-widest uppercase">
                    Login
                  </button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <button className="w-full bg-violet-600 text-white text-sm font-bold py-3 rounded-full tracking-widest uppercase">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}