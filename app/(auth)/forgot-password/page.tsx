"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const toastId = toast.loading("Sending reset link...");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && !data.error) {
        toast.success("Reset link sent! 📩", {
          id: toastId,
          description: "Check your email for instructions to reset your password.",
        });
        setIsSent(true);
      } else {
        toast.error("Failed to send", {
          id: toastId,
          description: data.error || "Something went wrong.",
        });
      }
    } catch (err) {
      toast.error("Error", {
        id: toastId,
        description: "Something went wrong. Please try again later.",
      });
    } finally {
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
            <div className="space-y-4 text-center mb-8">
              <Badge
                variant="secondary"
                className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              >
                Password Recovery
              </Badge>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Forgot your
                  <span className="block text-zinc-400">password?</span>
                </h1>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  {isSent 
                    ? "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder." 
                    : "No worries, we'll send you reset instructions."}
                </p>
              </div>
            </div>

            {!isSent ? (
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

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium group"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => setIsSent(false)}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-zinc-200 dark:border-zinc-800"
                >
                  Try another email
                </Button>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Link
                href="/login"
                className="flex items-center text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
