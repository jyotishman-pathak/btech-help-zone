"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid token. Please request a new reset link.");
      return;
    }

    setIsPending(true);
    const toastId = toast.loading("Updating password...");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok && !data.error) {
        toast.success("Password reset successfully! 🎉", {
          id: toastId,
          description: "You can now log in with your new password.",
        });
        router.push("/login");
      } else {
        toast.error("Failed to reset password", {
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

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-500">Missing reset token.</p>
        <Link href="/forgot-password">
          <Button variant="outline">Request New Link</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
        <Input
          type="password"
          placeholder="New password (min 8 chars)"
          className="pl-10 h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
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
            Updating...
          </>
        ) : (
          <>
            Reset Password
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
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
                Set New Password
              </Badge>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Reset your
                  <span className="block text-zinc-400">password</span>
                </h1>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  Please enter your new password below.
                </p>
              </div>
            </div>

            <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="animate-spin w-6 h-6 text-zinc-400" /></div>}>
              <ResetPasswordForm />
            </Suspense>

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
