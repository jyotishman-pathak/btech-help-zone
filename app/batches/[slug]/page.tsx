"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Check, Clock, Users, BookOpen, FileText,
  Award, Loader2, Star, Zap, Shield, ChevronRight,
} from "lucide-react";
import Link from "next/link";

import { EnrollButton } from "../../../components/batch/EnrollButton";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { useSession } from "next-auth/react";

interface BatchDetail {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  type: string;
  isFree: boolean;
  price: number;
  originalPrice?: number | null;
  badge?: string | null;
  bannerUrl?: string | null;
  validDays?: number | null;
  features: Array<{ text: string }>;
  tests: Array<{ test: { id: string; title: string; duration: number; totalMarks: number; examType: string } }>;
  notes: Array<{ note: { id: string; title: string; type: string; downloads: number } }>;
  leadForm?: {
    title: string;
    description?: string | null;
    fields: Array<{ id: string; label: string; placeholder?: string | null; fieldType: string; required: boolean; options: string[] }>;
  } | null;
  _count: { enrollments: number };
  isEnrolled: boolean;
}

export default function BatchDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBatch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/batches/${slug}`);
        if (!res.ok) {
          setError("Batch not found");
          return;
        }
        setBatch(await res.json());
      } catch {
        setError("Failed to load batch");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBatch();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 gap-4">
        <p className="text-lg text-zinc-500">{error || "Batch not found"}</p>
        <Link href="/batches">
          <Button variant="outline">← Browse All Programs</Button>
        </Link>
      </div>
    );
  }

  const TYPE_LABEL: Record<string, string> = {
    CEE_PREP: "CEE Prep",
    BTECH: "B.Tech",
    COMPETITIVE: "Competitive",
    FREE: "Free Program",
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Banner */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-800 dark:from-zinc-950 dark:to-zinc-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link
            href="/batches"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> All Programs
          </Link>
        </div>
        {batch.bannerUrl ? (
          <div className="max-w-5xl mx-auto px-4 pb-6">
            <img
              src={batch.bannerUrl}
              alt={batch.name}
              className="w-full h-48 md:h-64 object-cover rounded-xl"
            />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-4 pb-8">
            <div className="h-32 md:h-48 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
              <span className="text-6xl font-black text-zinc-600">{batch.name.slice(0, 2)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6 md:-mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {TYPE_LABEL[batch.type] ?? batch.type}
                      </Badge>
                      {batch.badge && (
                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs">
                          {batch.badge}
                        </Badge>
                      )}
                      {batch.isEnrolled && (
                        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs">
                          ✓ Enrolled
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50">
                      {batch.name}
                    </h1>
                    {batch.tagline && (
                      <p className="text-zinc-500 dark:text-zinc-400">{batch.tagline}</p>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-4 py-3 border-y border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <Users className="w-4 h-4" />
                      <span>{batch._count.enrollments.toLocaleString()} enrolled</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <BookOpen className="w-4 h-4" />
                      <span>{batch.tests.length} mock tests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <FileText className="w-4 h-4" />
                      <span>{batch.notes.length} study materials</span>
                    </div>
                    {batch.validDays && (
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Clock className="w-4 h-4" />
                        <span>{batch.validDays} days access</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {batch.description && (
                    <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none">
                      <p>{batch.description}</p>
                    </div>
                  )}

                  {/* Features */}
                  {batch.features.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" /> What&apos;s Included
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {batch.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                            {f.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Tests list */}
            {batch.tests.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" /> Mock Tests
                    </h3>
                    <div className="space-y-2">
                      {batch.tests.map((t) => (
                        <div
                          key={t.test.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {t.test.title}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {t.test.duration} min · {t.test.totalMarks} marks · {t.test.examType}
                            </p>
                          </div>
                          {batch.isEnrolled && (
                            <ChevronRight className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Notes list */}
            {batch.notes.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" /> Study Materials
                    </h3>
                    <div className="space-y-2">
                      {batch.notes.map((n) => (
                        <div
                          key={n.note.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                        >
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {n.note.title}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {n.note.type} · {n.note.downloads.toLocaleString()} downloads
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar — Enroll CTA */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="sticky top-24"
            >
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <CardContent className="p-6 space-y-5">
                  {/* Price */}
                  <div className="text-center space-y-1 py-2">
                    {batch.isFree ? (
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">FREE</p>
                    ) : (
                      <>
                        <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                          ₹{(batch.price / 100).toLocaleString("en-IN")}
                        </p>
                        {batch.originalPrice && (
                          <p className="text-sm line-through text-zinc-400">
                            ₹{(batch.originalPrice / 100).toLocaleString("en-IN")}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <EnrollButton
                    batchId={batch.id}
                    batchSlug={batch.slug}
                    batchName={batch.name}
                    isFree={batch.isFree}
                    price={batch.price}
                    isEnrolled={batch.isEnrolled}
                    isLoggedIn={!!session?.user}
                    leadFormFields={batch.leadForm?.fields ?? []}
                    userEmail={session?.user?.email ?? ""}
                    userName={session?.user?.name ?? ""}
                  />

                  {/* Trust signals */}
                  <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Shield className="w-3.5 h-3.5" /> Secure payment via Razorpay
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Award className="w-3.5 h-3.5" /> Certificate on completion
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Users className="w-3.5 h-3.5" /> {batch._count.enrollments.toLocaleString()} students enrolled
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="h-16" />
    </div>
  );
}
