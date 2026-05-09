"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Brain, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";

import { useSession, signOut } from "next-auth/react";

import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Question Papers", href: "/papers" },
  { name: "Notes", href: "/notes" },
  { name: "Mock Tests", href: "/mock-tests" },
  { name: "Premium", href: "/premium" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <Brain className="h-7 w-7 text-blue-600 transition-transform group-hover:scale-105" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-blue-600">B Tech</span>
            <span className="text-gray-800"> Help Zone</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex md:items-center md:gap-3">
          {!session ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-1 h-4 w-4" />
                  Login
                </Link>
              </Button>

              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                asChild
              >
                <Link href="/register">
                  <UserPlus className="mr-1 h-4 w-4" />
                  Register
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student">
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => signOut()}
              >
                <LogOut className="mr-1 h-4 w-4" />
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[280px] sm:w-[350px]">
            <div className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-gray-700 transition hover:text-blue-600"
                >
                  {link.name}
                </Link>
              ))}

              <div className="flex flex-col gap-2 border-t pt-4">
                {!session ? (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full"
                    >
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                      >
                        Login
                      </Link>
                    </Button>

                    <Button
                      className="w-full bg-blue-600"
                      asChild
                    >
                      <Link
                        href="/register"
                        onClick={() => setIsOpen(false)}
                      >
                        Register
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full"
                    >
                      <Link
                        href="/student"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                        signOut();
                      }}
                    >
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