"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "../../../components/ui/card";

import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsPending(true);

    const toastId = toast.loading("Creating your account...");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && !data.error) {
        toast.success("Account created! 🎉", {
          id: toastId,
          description: "Now login with your credentials below.",
        });
        router.push("/login");
      } else {
        const errorMessage = data.error || "Registration failed";
        setError(errorMessage);
        toast.error("Registration failed", {
          id: toastId,
          description: errorMessage,
        });
        setIsPending(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("Error", {
        id: toastId,
        description: "Something went wrong. Please try again later.",
      });
      setIsPending(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Glow */}
      <div className="absolute top-[-10%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-zinc-300/20 blur-3xl dark:bg-zinc-700/20" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="overflow-hidden rounded-3xl border border-zinc-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl shadow-2xl">
          
          <CardContent className="p-8">
            
            {/* Header */}
            <div className="mb-8 text-center space-y-4">
              
              <Badge
                variant="secondary"
                className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              >
                Join the Platform
              </Badge>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Create your
                  <span className="block text-zinc-400">
                    student account
                  </span>
                </h1>

                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  Access premium notes, PYQs, mock tests and more.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />

                <Input
                  placeholder="Full Name"
                  className="pl-10 h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />

                <Input
                  type="email"
                  placeholder="Email address"
                  className="pl-10 h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />

                <Input
                  type="password"
                  placeholder="Password (min 8 chars)"
                  className="pl-10 h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium group"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{" "}
              
              <Link
                href="/login"
                className="font-medium text-zinc-900 dark:text-white hover:underline"
              >
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}