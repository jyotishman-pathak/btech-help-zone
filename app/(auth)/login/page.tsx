"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "../../../components/ui/card";

import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    const toastId = toast.loading("Logging you in...");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      // NextAuth v5 beta: signIn with redirect:false returns
      // { error: string | undefined, url: string | undefined }
      // If there's an error field, auth failed.
      if (res && !res.error) {
        toast.success("Login successful!", {
          id: toastId,
          description: "Redirecting to your dashboard...",
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        const msg = res?.error === "CredentialsSignin"
          ? "Invalid email or password"
          : res?.error || "Invalid email or password";
        setError(msg);
        toast.error("Login failed", {
          id: toastId,
          description: msg + ". Please try again.",
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
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border border-zinc-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
          
          <CardContent className="p-8">
            
            {/* Header */}
            <div className="space-y-4 text-center mb-8">
              <Badge
                variant="secondary"
                className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              >
                Welcome Back
              </Badge>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Login to
                  <span className="block text-zinc-400">
                    B Tech Help Zone
                  </span>
                </h1>

                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  Access notes, PYQs, mock tests and your dashboard.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
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
                  placeholder="Password"
                  className="pl-10 h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium group"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>

              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            {/* Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              onClick={() =>
                signIn("google", {
                  redirectTo: "/dashboard",
                })
              }
            >
              Sign in with Google
            </Button>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-zinc-900 dark:text-white hover:underline"
              >
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}